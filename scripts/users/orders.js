// Orders Management JavaScript

class Orders {
    constructor() {
        this.orders = [];
        this.init();
    }

    init() {
        this.loadOrders();
        this.attachEventListeners();
    }

    loadOrders() {
        // Load orders from localStorage or use sample data
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
            this.orders = JSON.parse(storedOrders);
        } else {
            // Initialize with sample orders
            this.orders = [
                {
                    id: '#ORD-2841',
                    customer: 'Ana Leka',
                    product: 'Air Zoom Pro × 1',
                    date: 'Apr 13, 2025',
                    amount: '$89.99',
                    status: 'Delivered'
                },
                {
                    id: '#ORD-2840',
                    customer: 'James Brown',
                    product: 'Urban Pack XL × 2',
                    date: 'Apr 12, 2025',
                    amount: '$259.98',
                    status: 'Pending'
                },
                {
                    id: '#ORD-2839',
                    customer: 'Maria Johnson',
                    product: 'Classic Snapback × 1',
                    date: 'Apr 11, 2025',
                    amount: '$49.99',
                    status: 'Delivered'
                },
                {
                    id: '#ORD-2838',
                    customer: 'Robert Chen',
                    product: 'Sport Watch S2 × 1',
                    date: 'Apr 10, 2025',
                    amount: '$199.99',
                    status: 'Delivered'
                },
                {
                    id: '#ORD-2837',
                    customer: 'Sarah Rivera',
                    product: 'Graphic Tee Pack × 3',
                    date: 'Apr 9, 2025',
                    amount: '$89.97',
                    status: 'Pending'
                }
            ];
            this.saveOrders();
        }
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
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

        tableBody.innerHTML = orders.map((order, index) => `
            <tr>
                <td>${order.id}</td>
                <td><span style="background: #28a745; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                    ${order.customer.substring(0, 2).toUpperCase()}</span>
                    <span style="margin-left: 10px;">${order.customer}</span>
                </td>
                <td>${order.product}</td>
                <td>${order.date}</td>
                <td>${order.amount}</td>
                <td><span class="badge badge-status badge-${order.status === 'Delivered' ? 'delivered' : 'pending'}">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" title="View"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-outline-success" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        this.attachEventListeners();
    }

    viewOrder(index) {
        const order = this.orders[index];
        alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${order.customer}\nProduct: ${order.product}\nDate: ${order.date}\nAmount: ${order.amount}\nStatus: ${order.status}`);
    }

    editOrder(index) {
        const order = this.orders[index];
        const newStatus = prompt(`Edit Status for ${order.id}:\n\nCurrent: ${order.status}\n\nEnter new status (Pending/Delivered/Cancelled):`, order.status);
        
        if (newStatus) {
            this.orders[index].status = newStatus;
            this.saveOrders();
            this.displayOrders();
            alert('Order updated successfully!');
        }
    }

    deleteOrder(index) {
        if (confirm('Are you sure you want to delete this order?')) {
            this.orders.splice(index, 1);
            this.saveOrders();
            this.displayOrders();
            alert('Order deleted successfully!');
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Orders();
});
