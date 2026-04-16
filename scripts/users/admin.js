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
    const allCustomers = storedCustomers ? JSON.parse(storedCustomers) : [];
    
    // Load orders from localStorage
    const storedOrders = localStorage.getItem('orders');
    const allOrders = storedOrders ? JSON.parse(storedOrders) : [];
    
    console.log('Total customers:', allCustomers.length);
    console.log('Total orders:', allOrders.length);
    
    // Count all customers (same logic as customers.js)
    const totalCustomers = allCustomers.length;
    const totalOrders = allOrders.length;
    
    // Update total customers
    const totalCustomersEl = document.getElementById('dashboardTotalCustomers');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = totalCustomers;
        console.log('Updated dashboard total customers to:', totalCustomers);
    }
    
    // Update total orders
    const totalOrdersEl = document.getElementById('dashboardTotalOrders');
    if (totalOrdersEl) {
        totalOrdersEl.textContent = totalOrders;
        console.log('Updated dashboard total orders to:', totalOrders);
    }
    
    // Display recent orders (only real orders, filter out hardcoded ones)
    displayRecentOrders();
}

function displayRecentOrders() {
    const tableBody = document.getElementById('recentOrdersTableBody');
    if (!tableBody) return;
    
    // Load orders from localStorage
    const storedOrders = localStorage.getItem('orders');
    let orders = storedOrders ? JSON.parse(storedOrders) : [];
    
    // Filter out hardcoded sample orders, keep only real ones
    const hardcodedCustomers = ['Ana Leka', 'James Brown', 'Maria Johnson', 'Robert Chen', 'Sarah Rivera'];
    orders = orders.filter(order => !hardcodedCustomers.includes(order.customer));
    
    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No orders yet</td></tr>';
        return;
    }
    
    // Show only the last 5 recent orders
    const recentOrders = orders.slice(-5).reverse();
    
    tableBody.innerHTML = recentOrders.map(order => {
        const initials = order.customer.substring(0, 2).toUpperCase();
        const badgeClass = order.status === 'Delivered' ? 'badge-delivered' : 'badge-pending';
        
        return `
            <tr>
                <td>${order.id}</td>
                <td>
                    <span style="background: #28a745; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                        ${initials}
                    </span>
                    <span style="margin-left: 10px;">${order.customer}</span>
                </td>
                <td>${order.product}</td>
                <td>${order.date}</td>
                <td>${order.amount}</td>
                <td><span class="badge badge-status ${badgeClass}">${order.status}</span></td>
            </tr>
        `;
    }).join('');
}