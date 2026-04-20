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

function parseAmount(amountStr) {
    if (!amountStr) return 0;
    return parseFloat(String(amountStr).replace(/[^0-9.-]+/g, '')) || 0;
}

function updateDashboardStats() {
    // Load customers from localStorage
    const storedCustomers = localStorage.getItem('customers');
    const allCustomers = storedCustomers ? JSON.parse(storedCustomers) : [];

    // Load orders from localStorage
    const storedOrders = localStorage.getItem('orders');
    const allOrders = storedOrders ? JSON.parse(storedOrders) : [];

    // Count all customers
    const totalCustomers = allCustomers.length;
    const activeCustomers = allCustomers.filter(c => c.status === 'Active').length;

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseAmount(order.amount), 0);

    // Update total revenue
    const totalRevenueEl = document.getElementById('dashboardTotalRevenue');
    if (totalRevenueEl) {
        totalRevenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
    }

    // Update total orders
    const totalOrdersEl = document.getElementById('dashboardTotalOrders');
    if (totalOrdersEl) {
        totalOrdersEl.textContent = totalOrders;
    }

    // Update total customers
    const totalCustomersEl = document.getElementById('dashboardTotalCustomers');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = totalCustomers;
    }

    // Update completed orders (all orders are immediately completed)
    const completedOrdersEl = document.getElementById('dashboardCompletedOrders');
    if (completedOrdersEl) {
        completedOrdersEl.textContent = totalOrders;
    }

    // Display monthly revenue overview
    displayMonthlyRevenue(allOrders);

    // Display top products
    displayTopProducts(allOrders);

    // Display recent orders
    displayRecentOrders();
}

function displayMonthlyRevenue(orders) {
    const grid = document.getElementById('monthlyRevenueGrid');
    if (!grid) return;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    // Calculate revenue per month from real orders
    const monthlyRevenue = new Array(12).fill(0);
    orders.forEach(order => {
        const orderDate = new Date(order.date);
        if (orderDate.getFullYear() === currentYear) {
            monthlyRevenue[orderDate.getMonth()] += parseAmount(order.amount);
        }
    });

    grid.innerHTML = monthNames.map((month, index) => {
        const revenue = monthlyRevenue[index];
        const hasRevenue = revenue > 0;
        const bgColor = hasRevenue ? '#d4edda' : '#f8f9fa';
        const borderColor = hasRevenue ? '#c3e6cb' : '#e9ecef';
        const textColor = hasRevenue ? '#155724' : '#999';
        const displayValue = revenue >= 1000 ? `$${(revenue / 1000).toFixed(1)}k` : `$${revenue.toFixed(0)}`;

        return `
            <div style="text-align: center; padding: 12px; border-radius: 6px; background-color: ${bgColor}; border: 1px solid ${borderColor};">
                <p style="font-size: 12px; color: #666; margin: 0 0 5px 0;">${month}</p>
                <h6 style="margin: 0; color: ${textColor}; font-weight: 600; font-size: 14px;">${displayValue}</h6>
            </div>
        `;
    }).join('');
}

function displayTopProducts(orders) {
    const container = document.getElementById('topProductsContainer');
    if (!container) return;

    const productTotals = {};
    orders.forEach(order => {
        if (!order.product) return;
        order.product.split(',').forEach(part => {
            const match = part.trim().match(/^(.+?)\s*[×x]\s*(\d+)$/);
            if (match) {
                const name = match[1].trim();
                const qty = parseInt(match[2], 10) || 1;
                productTotals[name] = (productTotals[name] || 0) + qty;
            } else {
                const name = part.trim();
                if (name) productTotals[name] = (productTotals[name] || 0) + 1;
            }
        });
    });

    const sorted = Object.entries(productTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 10px 0;">No orders yet</p>';
        return;
    }

    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];

    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];

    container.innerHTML = sorted.map(([name, units], index) => {
        const productData = storedProducts.find(p => p.name === name);
        const pricePerUnit = productData ? parseFloat(String(productData.price).replace(/[^0-9.-]+/g, '')) || 0 : 0;
        const totalRevenue = pricePerUnit * units;
        const revenueDisplay = totalRevenue > 0 ? `$${totalRevenue.toFixed(2)}` : '—';
        const category = productData ? productData.category : 'Product';
        const gradient = gradients[index % gradients.length];

        return `
            <div class="product-item">
                <div class="product-img" style="background: ${gradient}; color: white;">
                    <i class="fas fa-box"></i>
                </div>
                <div class="product-details" style="flex:1;">
                    <h6>${name}</h6>
                    <p>${category}</p>
                </div>
                <div class="product-price">
                    <h6>${revenueDisplay}</h6>
                    <p>${units} unit${units === 1 ? '' : 's'}</p>
                </div>
            </div>
        `;
    }).join('');
}

function displayRecentOrders() {
    const tableBody = document.getElementById('recentOrdersTableBody');
    if (!tableBody) return;

    // Load orders from localStorage
    const storedOrders = localStorage.getItem('orders');
    const orders = storedOrders ? JSON.parse(storedOrders) : [];

    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No orders yet</td></tr>';
        return;
    }
    
    // Show only the last 5 recent orders
    const recentOrders = orders.slice(-5).reverse();
    
    tableBody.innerHTML = recentOrders.map(order => {
        const initials = order.customer.substring(0, 2).toUpperCase();

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
                <td><span class="badge badge-status badge-delivered">Completed</span></td>
            </tr>
        `;
    }).join('');
}