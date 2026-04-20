// Orders Management JavaScript

class Orders {
    constructor() {
        this.orders = [];
        this.init();
    }

    init() {
        this.loadOrders();
        this.displayOrders();
        this.updateStats();
        this.attachEventListeners();
    }

    loadOrders() {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
            try {
                this.orders = JSON.parse(storedOrders);
            } catch (e) {
                this.orders = [];
            }
        } else {
            this.orders = [];
        }
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    updateStats() {
        const totalOrders = this.orders.length;

        // Update order stat elements on orders page
        const totalOrdersEl = document.getElementById('totalOrdersCount');
        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;

        // Update dashboard if it exists
        this.updateDashboardStats(totalOrders);
    }

    updateDashboardStats(totalOrders) {
        const dashboardTotalOrders = document.getElementById('dashboardTotalOrders');
        if (dashboardTotalOrders) {
            dashboardTotalOrders.textContent = totalOrders;
        }
    }

    attachEventListeners() {
        const tableBody = document.getElementById('ordersTableBody');
        if (!tableBody) return;
        
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, rowIndex) => {
            const buttons = row.querySelectorAll('button');
            if (buttons.length >= 2) {
                // First button is View
                buttons[0].addEventListener('click', () => this.viewOrder(rowIndex));
                // Second button is Delete
                buttons[1].addEventListener('click', () => this.deleteOrder(rowIndex));
            }
        });
    }

    displayOrders(orders = this.orders) {
        const tableBody = document.getElementById('ordersTableBody');
        if (!tableBody) return;

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No orders yet</td></tr>';
            return;
        }

        tableBody.innerHTML = orders.map((order, index) => {
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
                    <td>
                        <button class="btn btn-sm btn-outline-primary" title="View"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-outline-danger" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        this.attachEventListeners();
    }

    viewOrder(index) {
        const order = this.orders[index];
        alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${order.customer}\nProduct: ${order.product}\nDate: ${order.date}\nAmount: ${order.amount}\nStatus: ${order.status}`);
    }



    deleteOrder(index) {
        const order = this.orders[index];
        if (confirm(`Are you sure you want to delete order "${order.id}"?`)) {
            this.orders.splice(index, 1);
            this.saveOrders();
            this.displayOrders();
            this.updateStats();
            alert('Order deleted successfully!');
        }
    }

    addOrder(customerName, product, amount) {
        const newOrder = {
            id: `#ORD-${1000 + this.orders.length}`,
            customer: customerName,
            product: product,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            amount: amount,
            status: 'Completed'
        };

        this.orders.push(newOrder);
        this.saveOrders();
        this.displayOrders();
        this.updateStats();
        return newOrder;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Orders();
});
