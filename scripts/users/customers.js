// Customers Management JavaScript

class Customers {
    constructor() {
        this.customers = [];
        this.init();
    }

    async init() {
        await this.loadCustomers();
        this.attachEventListeners();
        this.setupAutoRefresh();
    }

    async loadCustomers() {
        const allCustomers = await api.getCustomers();
        const allOrders = await api.getOrders();

        this.customers = allCustomers.map((customer, index) => {
            const customerName = `${customer.name || ''} ${customer.surname || ''}`.trim();
            const customerOrders = allOrders.filter(o => o.customer === customerName);
            const totalSpent = customerOrders.reduce((sum, o) => sum + (parseFloat(String(o.amount).replace(/[^0-9.-]+/g, '')) || 0), 0);

            return {
                id: `#CUST-${String(index + 1).padStart(3, '0')}`,
                name: customerName,
                email: customer.email,
                orders: customerOrders.length,
                spent: `$${totalSpent.toFixed(2)}`,
                joinDate: customer.joinDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                status: customer.status || 'Active'
            };
        });

        this.displayCustomers();
        this.updateStats();
    }

    updateStats() {
        const totalCustomers = this.customers.length;
        const activeCustomers = this.customers.filter(c => c.status === 'Active').length;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const newCustomers = this.customers.filter(c => {
            const joinDate = new Date(c.joinDate);
            return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
        }).length;

        const totalCustomersEl = document.getElementById('totalCustomersCount');
        const newCustomersEl = document.getElementById('newCustomersCount');
        const activeCustomersEl = document.getElementById('activeCustomersCount');

        if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
        if (newCustomersEl) newCustomersEl.textContent = newCustomers;
        if (activeCustomersEl) activeCustomersEl.textContent = activeCustomers;

        this.updateDashboardStats();
    }

    updateDashboardStats() {
        const dashboardTotalCustomers = document.getElementById('dashboardTotalCustomers');
        if (dashboardTotalCustomers) {
            dashboardTotalCustomers.textContent = this.customers.length;
        }
    }

    attachEventListeners() {
        document.querySelectorAll('.btn-outline-primary').forEach((btn, index) => {
            btn.addEventListener('click', () => this.viewCustomer(index));
        });

        document.querySelectorAll('.btn-outline-success').forEach((btn, index) => {
            btn.addEventListener('click', () => this.editCustomer(index));
        });

        document.querySelectorAll('.btn-outline-danger').forEach((btn, index) => {
            btn.addEventListener('click', () => this.deleteCustomer(index));
        });
    }

    displayCustomers(customers = this.customers) {
        const tableBody = document.getElementById('customersTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = customers.map((customer, index) => {
            const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const colors = ['#28a745', '#0d6efd', '#fd7e14', '#28a745', '#dc3545'];
            const bgColor = colors[index % colors.length];

            return `
                <tr>
                    <td>${customer.id}</td>
                    <td>
                        <div style="display: flex; align-items: center;">
                            <span style="background: ${bgColor}; color: white; padding: 8px 12px; border-radius: 50%; font-weight: bold; font-size: 12px; margin-right: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                                ${initials}
                            </span>
                            <span>${customer.name}</span>
                        </div>
                    </td>
                    <td>${customer.email}</td>
                    <td>${customer.orders}</td>
                    <td>${customer.spent}</td>
                    <td>${customer.joinDate}</td>
                    <td><span class="badge bg-${customer.status === 'Active' ? 'success' : 'warning'}">${customer.status}</span></td>
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

    viewCustomer(index) {
        const customer = this.customers[index];
        alert(`Customer Details:\n\nID: ${customer.id}\nName: ${customer.name}\nEmail: ${customer.email}\nTotal Orders: ${customer.orders}\nTotal Spent: ${customer.spent}\nJoin Date: ${customer.joinDate}\nStatus: ${customer.status}`);
    }

    async editCustomer(index) {
        const customer = this.customers[index];
        const newStatus = prompt(`Edit Status for ${customer.name}:\n\nCurrent: ${customer.status}\n\nEnter new status (Active/Inactive):`, customer.status);
        if (newStatus) {
            try {
                await api.updateUser(customer.email, { status: newStatus, email: customer.email, name: customer.name, surname: '', password: '', shoppingCart: [] });
                await this.loadCustomers();
                alert('Customer updated successfully!');
            } catch (error) {
                alert(error.message || 'Could not update customer.');
            }
        }
    }

    async deleteCustomer(index) {
        const customer = this.customers[index];
        if (confirm(`Are you sure you want to delete "${customer.name}"?`)) {
            try {
                await api.deleteCustomer(customer.email);
                await this.loadCustomers();
                alert('Customer deleted successfully!');
            } catch (error) {
                alert(error.message || 'Could not delete customer.');
            }
        }
    }

    async addCustomer() {
        const name = prompt('Enter customer name:');
        if (!name) return;

        const email = prompt('Enter email:');
        if (!email) return;

        try {
            await api.createCustomer({ name, email });
            await this.loadCustomers();
            alert('Customer added successfully!');
        } catch (error) {
            alert(error.message || 'Could not add customer.');
        }
    }

    setupAutoRefresh() {
        setInterval(() => this.loadCustomers(), 10000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Customers();
});
