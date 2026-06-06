class Orders {
    constructor() {
        this.orders = [];
        this.init();
    }

    async init() {
        await this.loadOrders();
        this.displayOrders();
        this.updateStats();
        this.attachEventListeners();
    }

    async loadOrders() {
        this.orders = await api.getOrders();
    }

    updateStats() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(o => o.status === 'Pending').length;
        const completedOrders = this.orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length;

        const totalOrdersEl = document.getElementById('totalOrdersCount');
        const pendingOrdersEl = document.getElementById('pendingOrdersCount');
        const completedOrdersEl = document.getElementById('completedOrdersCount');

        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
        if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;

        this.updateDashboardStats(totalOrders);
    }

    updateDashboardStats(totalOrders) {
        const dashboardTotalOrders = document.getElementById('dashboardTotalOrders');
        if (dashboardTotalOrders) {
            dashboardTotalOrders.textContent = totalOrders;
        }
    }

    attachEventListeners() {
        document.querySelectorAll('.btn-outline-primary').forEach((btn, index) => {
            btn.addEventListener('click', () => this.viewOrder(index));
        });

        document.querySelectorAll('.btn-outline-success').forEach((btn, index) => {
            btn.addEventListener('click', () => this.editOrder(index));
        });

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
            const isDelivered = order.status === 'Delivered' || order.status === 'Completed';
            const badgeClass = isDelivered ? 'badge-delivered' : 'badge-pending';
            const statusText = isDelivered ? 'Delivered' : 'Pending';

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

    async editOrder(index) {
        const order = this.orders[index];
        const newStatus = prompt(`Edit Status for Order ${order.id}:\n\nCurrent: ${order.status}\n\nEnter new status (Pending/Delivered):`, order.status);

        if (newStatus && (newStatus === 'Pending' || newStatus === 'Delivered')) {
            try {
                await api.updateOrder(order.id, { status: newStatus });
                await this.loadOrders();
                this.displayOrders();
                this.updateStats();
                alert('Order updated successfully!');
            } catch (error) {
                alert(error.message || 'Could not update order.');
            }
        } else if (newStatus) {
            alert('Invalid status. Please enter "Pending" or "Delivered"');
        }
    }

    async deleteOrder(index) {
        const order = this.orders[index];
        if (confirm(`Are you sure you want to delete order "${order.id}"?`)) {
            try {
                await api.deleteOrder(order.id);
                await this.loadOrders();
                this.displayOrders();
                this.updateStats();
                alert('Order deleted successfully!');
            } catch (error) {
                alert(error.message || 'Could not delete order.');
            }
        }
    }

    async addOrder(customerName, product, amount) {
        const newOrder = {
            id: `#ORD-${1000 + this.orders.length}`,
            customer: customerName,
            product: product,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            amount: amount,
            status: 'Pending'
        };

        try {
            await api.createOrder(newOrder);
            await this.loadOrders();
            this.displayOrders();
            this.updateStats();
            return newOrder;
        } catch (error) {
            console.error('Could not add order:', error);
            return null;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Orders();
});
