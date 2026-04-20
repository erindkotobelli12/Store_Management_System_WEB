// Revenue Management JavaScript

class Revenue {
    constructor() {
        this.orders = [];
        this.init();
    }

    init() {
        this.loadOrders();
        this.updateStats();
        this.displayRevenueTrend();
        this.displayRevenueByCategory();
        this.displayTransactions();
    }

    loadOrders() {
        const storedOrders = localStorage.getItem('orders');
        this.orders = storedOrders ? JSON.parse(storedOrders) : [];
    }

    parseAmount(amountStr) {
        if (!amountStr) return 0;
        return parseFloat(String(amountStr).replace(/[^0-9.-]+/g, '')) || 0;
    }

    updateStats() {
        const totalRevenue = this.orders.reduce((sum, order) => sum + this.parseAmount(order.amount), 0);
        const totalOrders = this.orders.length;
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const totalRevenueEl = document.getElementById('revenueTotalRevenue');
        const totalOrdersEl = document.getElementById('revenueTotalOrders');
        const avgOrderEl = document.getElementById('revenueAvgOrder');
        const completedOrdersEl = document.getElementById('revenueCompletedOrders');

        if (totalRevenueEl) totalRevenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        if (avgOrderEl) avgOrderEl.textContent = `$${avgOrder.toFixed(2)}`;
        if (completedOrdersEl) completedOrdersEl.textContent = totalOrders;
    }

    displayRevenueTrend() {
        const grid = document.getElementById('revenueTrendGrid');
        if (!grid) return;

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        // Calculate revenue per month from real orders
        const monthlyRevenue = new Array(12).fill(0);
        this.orders.forEach(order => {
            const orderDate = new Date(order.date);
            if (orderDate.getFullYear() === currentYear) {
                monthlyRevenue[orderDate.getMonth()] += this.parseAmount(order.amount);
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

    displayRevenueByCategory() {
        const container = document.getElementById('revenueByCategoryContainer');
        if (!container) return;

        // Load products to map product names to categories
        const storedProducts = localStorage.getItem('products');
        const products = storedProducts ? JSON.parse(storedProducts) : [];

        // Calculate revenue by category
        const categoryRevenue = {};
        this.orders.forEach(order => {
            // Each order.product is like "Air Zoom Pro × 1, Urban Pack XL × 2"
            const items = order.product.split(', ');
            const orderAmount = this.parseAmount(order.amount);

            // Try to match products to categories
            let matchedCategories = [];
            items.forEach(item => {
                const itemName = item.replace(/\s*×\s*\d+$/, '').trim();
                const product = products.find(p => p.name === itemName);
                if (product) {
                    matchedCategories.push(product.category);
                }
            });

            if (matchedCategories.length > 0) {
                // Split revenue equally among matched categories
                const perCategory = orderAmount / matchedCategories.length;
                matchedCategories.forEach(cat => {
                    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + perCategory;
                });
            } else {
                categoryRevenue['Other'] = (categoryRevenue['Other'] || 0) + orderAmount;
            }
        });

        const totalRevenue = Object.values(categoryRevenue).reduce((sum, val) => sum + val, 0);
        const colors = ['#28a745', '#0d6efd', '#fd7e14', '#20c997', '#dc3545', '#6f42c1'];

        if (totalRevenue === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No revenue data yet</p>';
            return;
        }

        const sortedCategories = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1]);

        container.innerHTML = sortedCategories.map(([category, revenue], index) => {
            const percentage = (revenue / totalRevenue * 100).toFixed(0);
            const color = colors[index % colors.length];
            return `
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: 500; color: #333;">${category}</span>
                        <span style="color: ${color}; font-weight: bold;">$${revenue.toFixed(2)}</span>
                    </div>
                    <div style="background: #e9ecef; border-radius: 4px; height: 8px; overflow: hidden;">
                        <div style="background: ${color}; height: 100%; width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    displayTransactions() {
        const tableBody = document.getElementById('revenueTableBody');
        if (!tableBody) return;

        if (this.orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #999;">No transactions yet</td></tr>';
            return;
        }

        // Show orders as transactions, most recent first
        const transactions = [...this.orders].reverse();

        tableBody.innerHTML = transactions.map((order, index) => {
            return `
                <tr>
                    <td>#TXN-${String(transactions.length - index).padStart(4, '0')}</td>
                    <td>${order.date}</td>
                    <td>${order.customer}</td>
                    <td>${order.amount}</td>
                    <td><span class="badge bg-success">Completed</span></td>
                </tr>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Revenue();
});
