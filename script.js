let transactions = [];
let currentFilter = "all";

const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const transactionList = document.getElementById("transaction-list");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const balanceEl = document.getElementById("balance");
const filterButtons = document.getElementById("filters");

// Load transactions from localStorage
window.onload = () => {
  transactions = loadTransactions();
  renderTransactions();
};

// Add new transaction
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (description && !isNaN(amount)) {
    transactions.push({ description, amount });
    saveTransactions();
    renderTransactions();
    form.reset();
  }
});

// Save to localStorage
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Load from localStorage
function loadTransactions() {
  const saved = localStorage.getItem("transactions");
  return saved ? JSON.parse(saved) : [];
}

// Remove a transaction
function removeTransaction(index) {
  transactions.splice(index, 1);
  saveTransactions();
  renderTransactions();
}

// Filter event
filterButtons.addEventListener("click", (e) => {
  if (e.target.dataset.filter) {
    currentFilter = e.target.dataset.filter;
    renderTransactions();
  }
});

// Render transaction list and update totals
function renderTransactions() {
  transactionList.innerHTML = "";

  let income = 0, expenses = 0;

  transactions.forEach((tx, index) => {
    const isIncome = tx.amount >= 0;
    const isExpense = tx.amount < 0;

    if (
      (currentFilter === "income" && !isIncome) ||
      (currentFilter === "expense" && !isExpense)
    ) return;

    const li = document.createElement("li");
    li.className = isIncome ? "income" : "expense";
    li.textContent = `${tx.description}: $${tx.amount.toFixed(2)}`;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = () => removeTransaction(index);
    li.appendChild(btn);
    transactionList.appendChild(li);
  });

  transactions.forEach(tx => {
    if (tx.amount >= 0) income += tx.amount;
    else expenses += tx.amount;
  });

  totalIncomeEl.textContent = `$${income.toFixed(2)}`;
  totalExpensesEl.textContent = `$${Math.abs(expenses).toFixed(2)}`;
  balanceEl.textContent = `$${(income + expenses).toFixed(2)}`;
}
