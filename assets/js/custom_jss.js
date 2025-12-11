class BankAccount {
  constructor() {
    this.balances = {
      USD: 0.00,
      EUR: 0.00
    };
    this.EXCHANGE_RATE = 0.93;
    this.pin = "1234";

    this.knownUsers = [
        { card: '1001', name: 'Alice', balance: 500 },
        { card: '1002', name: 'Teymur', balance: 0 },
        { card: '1003', name: 'Vilnius tech', balance: 100 },
        { card: '1004', name: 'Work', balance: 2500 },
        { card: '5555', name: 'Savings Account', balance: 10000 }
    ];
  }

  verifyPin(inputPin) {
    return this.pin === inputPin;
  }

  sendMoney(amount, currency, targetCard) {
      const recipient = this.knownUsers.find(user => user.card === targetCard);
      
      if (!recipient) {
          return { success: false, msg: "Error: Card number not found in database." };
      }

      if (amount > this.balances[currency]) {
          return { success: false, msg: `Insufficient ${currency} funds to send.` };
      }

      this.balances[currency] -= amount;
      
      return { 
          success: true, 
          msg: `Success! Sent ${amount.toFixed(2)} ${currency} to ${recipient.name} (Card ${targetCard}).` 
      };
  }

  deposit(amount, currency) {
    if (!isNaN(amount) && amount > 0) {
      this.balances[currency] += amount;
      return { success: true, msg: `Deposited ${amount.toFixed(2)} ${currency}` };
    }
    return { success: false, msg: "Invalid amount." };
  }

  withdraw(amount, currency) {
    if (amount > this.balances[currency]) {
      return { success: false, msg: `Insufficient ${currency} funds!` };
    } else if (!isNaN(amount) && amount > 0) {
      this.balances[currency] -= amount;
      return { success: false, msg: `Withdrew ${amount.toFixed(2)} ${currency}` };
    }
    return { success: false, msg: "Invalid amount." };
  }

  transfer(amount, fromCurrency) {
    const toCurrency = fromCurrency === 'USD' ? 'EUR' : 'USD';
    if (amount <= 0 || isNaN(amount)) { return { success: false, msg: "Invalid amount." }; }
    if (amount > this.balances[fromCurrency]) { return { success: false, msg: `Insufficient ${fromCurrency}!` }; }

    let received = (fromCurrency === 'USD') ? amount * this.EXCHANGE_RATE : amount / this.EXCHANGE_RATE;
    this.balances[fromCurrency] -= amount;
    this.balances[toCurrency] += received;

    return { success: true, msg: `Converted ${amount} ${fromCurrency} to ${received.toFixed(2)} ${toCurrency}.` };
  }

  getBalances() { return this.balances; }
}

document.addEventListener('DOMContentLoaded', () => {
  const myAccount = new BankAccount();

  const displayUSD = document.getElementById('display-usd');
  const displayEUR = document.getElementById('display-eur');
  const messageDisplay = document.getElementById('message-display');
  const amountInput = document.getElementById('amount-input');
  const cardInput = document.getElementById('card-input'); // NEW
  const currencySelect = document.getElementById('currency-select');
  
  const loginScreen = document.getElementById('login-screen');
  const controlScreen = document.getElementById('control-screen');
  const pinInput = document.getElementById('pin-input');

  function updateScreen(result) {
    const balances = myAccount.getBalances();
    displayUSD.innerText = `$${balances.USD.toFixed(2)}`;
    displayEUR.innerText = `€${balances.EUR.toFixed(2)}`;
    
    if(result) {
        messageDisplay.innerHTML = result.success 
            ? `<span style='color: #4cd137'>✔ ${result.msg}</span>` 
            : `<span style='color: #e84118'>✘ ${result.msg}</span>`;
    }
    amountInput.value = '';
  }

  document.getElementById('btn-login').addEventListener('click', () => {
    if(myAccount.verifyPin(pinInput.value)) {
        loginScreen.style.display = 'none';
        controlScreen.style.display = 'block';
        updateScreen({ success: true, msg: "System Ready." });
    } else {
        alert("Wrong PIN (Try 1234)");
    }
  });

  function getAmount() {
      const val = parseFloat(amountInput.value);
      if (isNaN(val) || val <= 0) {
          updateScreen({ success: false, msg: "Enter a positive amount." });
          return null;
      }
      return val;
  }

  document.getElementById('btn-deposit').addEventListener('click', () => {
      const amt = getAmount(); if(amt) updateScreen(myAccount.deposit(amt, currencySelect.value));
  });
  document.getElementById('btn-withdraw').addEventListener('click', () => {
      const amt = getAmount(); if(amt) updateScreen(myAccount.withdraw(amt, currencySelect.value));
  });
  document.getElementById('btn-transfer').addEventListener('click', () => {
      const amt = getAmount(); if(amt) updateScreen(myAccount.transfer(amt, currencySelect.value));
  });

  document.getElementById('btn-send').addEventListener('click', () => {
      const amt = getAmount();
      const card = cardInput.value.trim();
      
      if(!card) {
          updateScreen({ success: false, msg: "Please enter a Recipient Card Number." });
          return;
      }

      if(amt) {
          const result = myAccount.sendMoney(amt, currencySelect.value, card);
          updateScreen(result);
      }
  });
});