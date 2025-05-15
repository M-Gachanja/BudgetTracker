// DOM Elements
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const categoryInput = document.getElementById('category');
const transactionsList = document.getElementById('transactions');
const balanceElement = document.getElementById('balance');
const incomeElement = document.getElementById('income');
const expensesElement = document.getElementById('expenses');

// Load transactions from localStorage or initialize empty array
let transactions = JSON.parse(localStorage.getItem('budgetTrackerTransactions')) || [];

// Set default date to today
dateInput.value = new Date().toISOString().split('T')[0];

// Format currency as KSH
function formatCurrency(amount) {
    return 'KSH ' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('budgetTrackerTransactions', JSON.stringify(transactions));
    updateCategoryFilter();
    updateUI();
}

// Add transaction
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const category = categoryInput.value;
    const type = document.querySelector('input[name="type"]:checked').value;
    
    if (!description || isNaN(amount) || !date || !category) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    transactions.push({
        id: Date.now(),
        description,
        amount: type === 'income' ? amount : -amount,
        date,
        category,
        type
    });
    
    saveTransactions();
    
    // Reset form
    transactionForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    document.getElementById('income-type').checked = true;
});

// Remove transaction
function removeTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
    }
}

// Update UI
function updateUI() {
    transactionsList.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date.split('-').reverse().join('/')}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(transaction.amount))}
            </td>
            <td><button onclick="removeTransaction(${transaction.id})">x</button></td>
        `;
        transactionsList.appendChild(row);
    });
    
    updateTotals();
}

// Update totals
function updateTotals() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = income - expenses;
    
    incomeElement.textContent = formatCurrency(income);
    expensesElement.textContent = formatCurrency(expenses);
    balanceElement.textContent = formatCurrency(balance);
    balanceElement.className = balance >= 0 ? 'positive' : 'negative';
}

// Update category filter
function updateCategoryFilter() {
    const filter = document.getElementById('filter-category');
    const currentValue = filter.value;
    filter.innerHTML = '<option value="all">All Categories</option>';
    
    const categories = [...new Set(transactions.map(t => t.category))];
    categories.sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filter.appendChild(option);
    });
    
    filter.value = currentValue;
}

// Filter transactions
document.querySelectorAll('.filter-buttons button, #filter-category').forEach(element => {
    element.addEventListener('click', function() {
        if (this.tagName === 'BUTTON') {
            document.querySelectorAll('.filter-buttons button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        }
        applyFilters();
    });
});

function applyFilters() {
    const typeFilter = document.querySelector('.filter-buttons button.active').id.replace('show-', '');
    const categoryFilter = document.getElementById('filter-category').value;
    
    let filtered = transactions;
    
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    } 
    
    displayFilteredTransactions(filtered);
}

function displayFilteredTransactions(filteredTransactions) {
    transactionsList.innerHTML = '';
    
    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date.split('-').reverse().join('/')}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(transaction.amount))}
            </td>
            <td><button onclick="removeTransaction(${transaction.id})">x</button></td>
        `;
        transactionsList.appendChild(row);
    });
}

// Initial UI update
updateUI();
updateCategoryFilter();
document.getElementById('show-all').classList.add('active');