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
        // Load orders from localStorage (only real orders from actual checkouts)
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
            try {
                this.orders = JSON.parse(storedOrders);
            } catch (e) {
                console.error('Error loading orders:', e);
                this.orders = [];
            }
        } else {
            // No orders yet
            this.orders = [];
        }
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    updateStats() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(o => o.status === 'Pending').length;
        const completedOrders = this.orders.filter(o => o.status === 'Delivered').length;

        // Update order stat elements on orders page
        const totalOrdersEl = document.getElementById('totalOrdersCount');
        const pendingOrdersEl = document.getElementById('pendingOrdersCount');
        const completedOrdersEl = document.getElementById('completedOrdersCount');

        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
        if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;

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
        // View buttons
        document.querySelectorAll('.btn-outline-primary').forEach((btn, index) => {
            btn.addEventListener('click', () => this.viewOrder(index));
        });

        // Edit buttons
        document.querySelectorAll('.btn-outline-success').forEach((btn, index) => {
            btn.addEventListener('click', () => this.editOrder(index));
        });

        // Delete buttons
        document.querySelectorAll('.btn-outline-danger').forEach((btn, index) => {
            btn.addEventListener('click', () => this.deleteOrder(index));
        });
    }

    displayOrders(orders = this.orders) {
        const tableBody = document.getElementById('ordersTableBody');
        if (!tableBody) return;

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">No orders yet</td></tr>';
            return;
        }

        tableBody.innerHTML = orders.map((order, index) => {
            const initials = order.customer.substring(0, 2).toUpperCase();
            const badgeClass = order.status === 'Delivered' ? 'badge-delivered' : 'badge-pending';
            const statusText = order.status === 'Delivered' ? 'Delivered' : 'Pending';
            
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
                    <td><span class="badge badge-status ${badgeClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" title="View"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-outline-success" title="Edit"><i class="fas fa-edit"></i></button>
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

    editOrder(index) {
        const order = this.orders[index];
        const newStatus = prompt(`Edit Status for Order ${order.id}:\n\nCurrent: ${order.status}\n\nEnter new status (Pending/Delivered):`, order.status);
        
        if (newStatus && (newStatus === 'Pending' || newStatus === 'Delivered')) {
            this.orders[index].status = newStatus;
            this.saveOrders();
            this.displayOrders();
            this.updateStats();
            alert('Order updated successfully!');
        } else if (newStatus) {
            alert('Invalid status. Please enter "Pending" or "Delivered"');
        }
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
            status: 'Pending'
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
