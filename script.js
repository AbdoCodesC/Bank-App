'use strict';

// Demo accounts
const account1 = {
  owner: 'John Welguin',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-01-18T16:31:17.178-05:00',
    '2023-12-23T02:42:02.383-05:00',
    '2024-01-28T04:15:04.904-05:00',
    '2024-04-01T05:17:24.185-05:00',
    '2024-10-30T09:11:59.604-05:00',
    '2024-11-03T12:01:17.194-05:00',
    '2024-11-04T18:36:17.929-05:00',
    '2024-11-05T05:51:36.790-05:00',
  ],
  currency: 'EUR',
  creditScore: 800,
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2023-11-30T04:48:16.867-05:00',
    '2023-12-25T01:04:23.907-05:00',
    '2024-01-25T09:18:46.235-05:00',
    '2024-11-01T08:15:33.035-05:00',
    '2024-02-05T11:33:06.386-05:00',
    '2024-04-10T09:43:26.374-05:00',
    '2024-06-25T13:49:59.371-05:00',
    '2024-07-26T07:01:20.894-05:00',
  ],
  creditScore: 700,
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const eurToUsd = 1.1;

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const signupForm = document.querySelector('.signup-form');
const signupName = document.querySelector('.signup-name');
const signupUsername = document.querySelector('.signup-username');
const signupPin = document.querySelector('.signup-pin');
const closeModalBtn = document.querySelector('.close-modal');

const generateRandomMovements = () => {
  const numTransactions = Math.floor(Math.random() * 5) + 3; // 3-7 transactions
  const movements = [];
  const dates = [];
  
  // Generate random dates within the last 3 months
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  
  for (let i = 0; i < numTransactions; i++) {
      // Random amount between -3000 and 5000
      const amount = Math.floor(Math.random() * 8000) - 3000;
      movements.push(amount);
      
      // Random date between now and 3 months ago
      const randomDate = new Date(
          threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
      );
      dates.push(randomDate.toISOString());
  }
  
  // Add initial deposit
  movements.push(1000);
  dates.push(new Date().toISOString());
  
  return { movements, dates };
};

const openModal = () => {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = () => {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
  // Clear form without logging in
  signupName.value = signupUsername.value = signupPin.value = '';
};

const createUserNames = accounts => {
  accounts.forEach(acct => {
    acct.username = acct.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

const displayMovements = (account, sort) => {
  containerMovements.innerHTML = '';
  const sortedMovements = [...account.movements];

  if (sort) {
    if (btnSort.innerHTML === '↓ SORT') {
      sortedMovements.sort((a, b) => a - b);
      btnSort.innerHTML = '↑ SORT';
    } else {
      sortedMovements.sort((a, b) => b - a);
      btnSort.innerHTML = '↓ SORT';
    }
  }

  sortedMovements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date);
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">$${mov}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = account => {
  // calculating the balance
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${account.balance.toFixed(2)} USD`;
};

const calcDisplaySummary = account => {
  const income = account.movements
    .filter(mov => mov > 0)
    .map(mov => mov * eurToUsd)
    .reduce((acc, mov) => acc + mov, 0);
  const outcome = account.movements
    .filter(mov => mov < 0)
    .map(mov => mov * eurToUsd)
    .reduce((acc, mov) => acc + mov, 0);
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * (account.interestRate / 100) * eurToUsd)
    .filter(int => int >= 1)
    .reduce((acc, interest) => acc + interest, 0);
  labelSumIn.textContent = `$${income.toFixed(2)}`;
  labelSumOut.textContent = `$${Math.abs(outcome.toFixed(2))}`;
  labelSumInterest.textContent = `$${interest.toFixed(2)}`;
};

const updateUI = currentAccount => {
  displayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
  displayMovements(currentAccount);
};

const formatMovementDate = function (date) {
  // Ensure date is a Date object
  const dateObj = new Date(date);
  
  const calcDaysPassed = (date1, date2) =>
      Math.abs(Math.round((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(dateObj, new Date());

  const day = `${dateObj.getDate()}`.padStart(2, '0');
  const month = `${dateObj.getMonth() + 1}`.padStart(2, '0');
  const year = dateObj.getFullYear();

  return daysPassed === 0
      ? 'Today'
      : daysPassed === 1
      ? 'Yesterday'
      : daysPassed <= 7
      ? `${daysPassed} days ago`
      : `${month}/${day}/${year}`;
};

const CREDIT_SCORE_RANGES = {
  EXCELLENT: { min: 750, max: 800, loanMultiplier: 5 },
  GOOD: { min: 700, max: 749, loanMultiplier: 4 },
  FAIR: { min: 650, max: 699, loanMultiplier: 3 },
  POOR: { min: 550, max: 649, loanMultiplier: 2 },
  BAD: { min: 300, max: 549, loanMultiplier: 0 }
};

// Generate random credit score
const generateCreditScore = () => {
  return Math.floor(Math.random() * (800 - 300 + 1)) + 300;
};

// Function to get credit rating and loan multiplier
const getCreditRating = (score) => {
  if (score >= CREDIT_SCORE_RANGES.EXCELLENT.min) return { rating: 'EXCELLENT', multiplier: CREDIT_SCORE_RANGES.EXCELLENT.loanMultiplier };
  if (score >= CREDIT_SCORE_RANGES.GOOD.min) return { rating: 'GOOD', multiplier: CREDIT_SCORE_RANGES.GOOD.loanMultiplier };
  if (score >= CREDIT_SCORE_RANGES.FAIR.min) return { rating: 'FAIR', multiplier: CREDIT_SCORE_RANGES.FAIR.loanMultiplier };
  if (score >= CREDIT_SCORE_RANGES.POOR.min) return { rating: 'POOR', multiplier: CREDIT_SCORE_RANGES.POOR.loanMultiplier };
  return { rating: 'BAD', multiplier: CREDIT_SCORE_RANGES.BAD.loanMultiplier };
};

btnLogin.addEventListener('click', e => {
  e.preventDefault();

  if (btnLogin.classList.contains('logout__btn')) {
    containerApp.style.opacity = '0';
    labelWelcome.textContent = 'Log in to get started';
    inputLoginPin.value = '';
    inputLoginUsername.value = '';
    btnLogin.classList.remove('logout__btn');
    btnLogin.classList.add('login__btn');
    inputLoginUsername.disabled = false;
    inputLoginPin.disabled = false;
    btnLogin.innerHTML = '&rarr;';
  } else {
    const accountFound = accounts.find(user => {
      return (
        user.username === inputLoginUsername.value &&
        +user.pin === +inputLoginPin.value
      );
    });
    console.log('accountFound', accountFound);

    if (accountFound) {
      const day = `${new Date().getDate()}`.padStart(2, '0');
      const month = `${new Date().getMonth() + 1}`.padStart(2, '0');
      const year = new Date().getFullYear();
      const hour = `${new Date().getHours()}`.padStart(2, '0');
      const minute = `${new Date().getMinutes()}`.padStart(2, '0');
      labelDate.textContent = `${month}/${day}/${year}, ${hour}:${minute}`;
      inputLoginPin.value = '';
      inputLoginUsername.value = '';
      labelWelcome.textContent = `Welcome, ${accountFound.owner.split(' ')[0]}`;
      containerApp.style.opacity = '1';
      updateUI(accountFound);
      btnLogin.innerHTML = '&larr;';
      btnLogin.classList.add('logout__btn');
      btnLogin.classList.remove('login__btn');
      inputLoginUsername.disabled = true;
      inputLoginPin.disabled = true;
      // let y = 10
      // const timer = setInterval(() => {
      //   labelTimer.textContent = y--
      //   console.log(y)
      // }, 1000)
      // if (y === 0) clearInterval(timer)
    } else {
      btnLogin.style.color = 'red';
      setTimeout(() => {
        btnLogin.style.color = 'black';
        return openModal();
      });
    }
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const currentAccount = accounts.find(
      acct =>
          acct.owner.split(' ')[0].toLowerCase().trim() ===
          labelWelcome.textContent.split(',')[1].toLowerCase().trim()
  );
  const accountReceiver = accounts.find(
      acct => acct.username === inputTransferTo.value
  );
  let amount = +inputTransferAmount.value;
  
  if (
      amount > 0 &&
      accountReceiver &&
      amount < currentAccount.balance &&
      currentAccount.username !== accountReceiver.username
  ) {
      // Add new date as ISO string
      const now = new Date().toISOString();
      
      // Add movements and dates
      currentAccount.movementsDates.push(now);
      accountReceiver.movementsDates.push(now);
      currentAccount.movements.push(-amount);
      accountReceiver.movements.push(amount);
      
      // Update UI
      updateUI(currentAccount);
      
      // Clear input fields
      inputTransferTo.value = '';
      inputTransferAmount.value = '';
  } else {
      btnTransfer.style.color = 'red';
      setTimeout(() => (btnTransfer.style.color = 'black'), 400);
  }
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  
  // Get current account using username instead of first name
  const currentAccount = accounts.find(
      acct => acct.username === inputCloseUsername.value
  );

  console.log('Attempting to close account:', {
      inputUsername: inputCloseUsername.value,
      inputPin: inputClosePin.value,
      currentAccount: currentAccount
  });

  if (
      currentAccount &&
      +inputClosePin.value === currentAccount.pin
  ) {
      const index = accounts.findIndex(
          acc => acc.username === currentAccount.username
      );
      
      // Delete account
      accounts.splice(index, 1);
      
      // Reset UI
      containerApp.style.opacity = '0';
      labelWelcome.textContent = 'Log in to get started';
      
      // Clear all inputs
      inputCloseUsername.value = inputClosePin.value = '';
      inputLoginUsername.value = inputLoginPin.value = '';
      
      // Reset login button
      btnLogin.innerHTML = '&rarr;';
      btnLogin.classList.remove('logout__btn');
      btnLogin.classList.add('login__btn');
      
      // Enable login inputs
      inputLoginUsername.disabled = false;
      inputLoginPin.disabled = false;

      console.log('Account closed successfully');
  } else {
      console.log('Invalid credentials for account closure');
      btnClose.style.color = 'red';
      setTimeout(() => (btnClose.style.color = 'black'), 400);
      
      // Clear close account inputs
      inputCloseUsername.value = inputClosePin.value = '';
  }
});

let loanAmount = 100_000_000;
let decision = false;

// Update loan button logic
btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const currentAccount = accounts.find(
      acct =>
          acct.owner.split(' ')[0].toLowerCase().trim() ===
          labelWelcome.textContent.split(',')[1].toLowerCase().trim()
  );

  const amount = +inputLoanAmount.value;
  const { multiplier, rating } = getCreditRating(currentAccount.creditScore);
  const maxLoanAmount = currentAccount.balance * multiplier;

  if (!currentAccount || !amount || amount <= 0) {
      showLoanError('Invalid loan amount');
      return;
  }

  if (rating === 'BAD') {
      showLoanError('Loan denied: Credit score too low');
      return;
  }

  if (amount > maxLoanAmount) {
      showLoanError(`Loan denied: Maximum loan amount for your credit score (${currentAccount.creditScore}) is $${maxLoanAmount.toFixed(2)}`);
      return;
  }

  if (loanAmount <= 0) {
      showLoanError('No more loans available from the bank');
      return;
  }

  if (amount > loanAmount) {
      showLoanError('Loan amount exceeds bank\'s available funds');
      return;
  }

  // Process approved loan
  const now = new Date().toISOString();
  currentAccount.movementsDates.push(now);
  currentAccount.movements.push(amount);
  loanAmount -= amount;

  // Update UI
  updateUI(currentAccount);
  inputLoanAmount.value = '';
  
  // Show success message
  alert(`Loan approved!\nCredit Score: ${currentAccount.creditScore}\nRating: ${rating}`);
});

// Helper function to show loan errors
const showLoanError = (message) => {
  alert(message);
  btnLoan.style.color = 'red';
  setTimeout(() => (btnLoan.style.color = 'black'), 400);
  inputLoanAmount.value = '';
};

btnSort.addEventListener('click', e => {
  e.preventDefault();

  const currentAccount = accounts.find(
    acct =>
      acct.owner.split(' ')[0].toLowerCase().trim() ===
      labelWelcome.textContent.split(',')[1].toLowerCase().trim()
  );

  if (!currentAccount || !currentAccount.movements) return;
  let sort = true;
  displayMovements(currentAccount, sort);
  sort = !sort;
});

// Separate function for handling successful signup
const handleSignupSuccess = newAccount => {
  // Close modal
  modal.classList.add('hidden');
  overlay.classList.add('hidden');

  // Clear form
  signupName.value = '';
  signupPin.value = '';

  // Auto-login
  const loginUsername = document.querySelector('.login__input--user');
  const loginPin = document.querySelector('.login__input--pin');
  
  if (loginUsername && loginPin) {
      loginUsername.value = newAccount.username;
      loginPin.value = newAccount.pin;
      btnLogin.click();
  }
};

signupForm.addEventListener('submit', e => {
  e.preventDefault();

  const fullName = signupName.value;
  const pin = signupPin.value;

  // Validate PIN is 4 digits
  if (!/^\d{4}$/.test(pin)) {
    alert('PIN must be exactly 4 digits');
    return;
}

  // Generate username from initials
  const username = fullName
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');

  // Check if username already exists
  if (accounts.some(acc => acc.username === username)) {
      alert('An account with similar initials already exists. Please use a different name.');
      return;
  }

  // Generate random movements and dates
  const { movements, dates } = generateRandomMovements();
  
  // Generate credit score
  const creditScore = generateCreditScore();
  const { rating } = getCreditRating(creditScore);

  // Create new account
  const newAccount = {
      owner: fullName,
      username: username,
      movements: movements,
      interestRate: 1.2,
      pin: +pin,
      movementsDates: dates,
      currency: 'USD',
      locale: 'en-US',
      creditScore: creditScore,
      creditRating: rating
  };

  // Add to accounts array
  accounts.push(newAccount);

  // Show credit score to user
  alert(`Account created successfully!\nYour username is: ${username}\nYour credit score is: ${creditScore}\nCredit Rating: ${rating}`);

  // Handle successful signup
  handleSignupSuccess(newAccount);
});

// Close modal when clicking close button or overlay
closeModalBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// Close modal with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

