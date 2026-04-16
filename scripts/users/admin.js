class Admin extends User {
    constructor(email, password, name, surname) {
        super(email, password, name, surname, 'admin');
    }
}

// Initialize dashboard stats
function initDashboardStats() {
    console.log('Initializing dashboard stats');
    updateDashboardStats();
    // Update stats whenever localStorage changes (e.g., when a new customer registers)
    window.addEventListener('storage', updateDashboardStats);
    // Update stats every 2 seconds to keep in sync
    setInterval(updateDashboardStats, 2000);
    // Update stats when page becomes visible (tab switch)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('Admin page became visible, refreshing stats');
            updateDashboardStats();
        }
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded fired');
        // Add small delay to ensure all elements are rendered
        setTimeout(initDashboardStats, 100);
    });
} else {
    console.log('Document already loaded');
    // If document is already loaded, initialize immediately with a delay
    setTimeout(initDashboardStats, 100);
}

function updateDashboardStats() {
    // Load customers from localStorage
    const storedCustomers = localStorage.getItem('customers');
    console.log('Stored customers from localStorage:', storedCustomers);
    
    const allCustomers = storedCustomers ? JSON.parse(storedCustomers) : [];
    console.log('Parsed customers array:', allCustomers);
    console.log('Total customers count:', allCustomers.length);
    
    // Count all customers (same logic as customers.js)
    const totalCustomers = allCustomers.length;
    
    // Update total customers
    const totalCustomersEl = document.getElementById('dashboardTotalCustomers');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = totalCustomers;
        console.log('Updated dashboard total customers to:', totalCustomers);
    } else {
        console.log('dashboardTotalCustomers element not found');
    }
    
    // Update total orders
    const totalOrdersEl = document.getElementById('dashboardTotalOrders');
    if (totalOrdersEl) {
        totalOrdersEl.textContent = '0';
    }
}