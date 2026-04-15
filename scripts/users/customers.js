// Customers Management JavaScript

class Customers {
    constructor() {
        this.customers = [];
        this.init();
    }

    init() {
        this.loadCustomers();
        this.attachEventListeners();
    }

    loadCustomers() {
        // Load customers from localStorage or use sample data
        const storedCustomers = localStorage.getItem('customers');
        if (storedCustomers) {
            this.customers = JSON.parse(storedCustomers);
        } else {
            // Initialize with sample customers
            this.customers = [
                {
                    id: '#CUST-001',
                    name: 'Ana Leka',
                    email: 'ana.leka@email.com',
                    phone: '+1 (555) 123-4567',
                    orders: 24,
                    spent: '$2,485.50',
                    joinDate: 'Jan 15, 2024',
                    status: 'Active'
                },
                {
                    id: '#CUST-002',
                    name: 'James Brown',
                    email: 'james.brown@email.com',
                    phone: '+1 (555) 234-5678',
                    orders: 18,
                    spent: '$1,845.75',
                    joinDate: 'Mar 22, 2024',
                    status: 'Active'
                },
                {
                    id: '#CUST-003',
                    name: 'Maria Johnson',
                    email: 'maria.johnson@email.com',
                    phone: '+1 (555) 345-6789',
                    orders: 31,
                    spent: '$3,245.20',
                    joinDate: 'Dec 10, 2023',
                    status: 'Active'
                },
                {
                    id: '#CUST-004',
                    name: 'Robert Chen',
                    email: 'robert.chen@email.com',
                    phone: '+1 (555) 456-7890',
                    orders: 12,
                    spent: '$1,125.40',
                    joinDate: 'May 05, 2024',
                    status: 'Inactive'
                },
                {
                    id: '#CUST-005',
                    name: 'Sarah Rivera',
                    email: 'sarah.rivera@email.com',
                    phone: '+1 (555) 567-8901',
                    orders: 42,
                    spent: '$4,562.80',
                    joinDate: 'Aug 18, 2023',
                    status: 'Active'
                }
            ];
            this.saveCustomers();
        }
    }

    saveCustomers() {
        localStorage.setItem('customers', JSON.stringify(this.customers));
    }

    attachEventListeners() {
        // View buttons
        document.querySelectorAll('.btn-outline-primary').forEach((btn, index) => {
            btn.addEventListener('click', () => this.viewCustomer(index));
        });

        // Edit buttons
        document.querySelectorAll('.btn-outline-success').forEach((btn, index) => {
            btn.addEventListener('click', () => this.editCustomer(index));
        });

        // Delete buttons
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
                    <td>${customer.phone}</td>
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
        alert(`Customer Details:\n\nID: ${customer.id}\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nTotal Orders: ${customer.orders}\nTotal Spent: ${customer.spent}\nJoin Date: ${customer.joinDate}\nStatus: ${customer.status}`);
    }

    editCustomer(index) {
        const customer = this.customers[index];
        const newStatus = prompt(`Edit Status for ${customer.name}:\n\nCurrent: ${customer.status}\n\nEnter new status (Active/Inactive):`, customer.status);
        
        if (newStatus) {
            this.customers[index].status = newStatus;
            this.saveCustomers();
            this.displayCustomers();
            alert('Customer updated successfully!');
        }
    }

    deleteCustomer(index) {
        const customer = this.customers[index];
        if (confirm(`Are you sure you want to delete "${customer.name}"?`)) {
            this.customers.splice(index, 1);
            this.saveCustomers();
            this.displayCustomers();
            alert('Customer deleted successfully!');
        }
    }

    addCustomer() {
        const name = prompt('Enter customer name:');
        if (!name) return;

        const email = prompt('Enter email:');
        if (!email) return;

        const phone = prompt('Enter phone number:');
        if (!phone) return;

        const newCustomer = {
            id: `#CUST-${this.customers.length + 1}`.padStart(8, '0'),
            name: name,
            email: email,
            phone: phone,
            orders: 0,
            spent: '$0.00',
            joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            status: 'Active'
        };

        this.customers.push(newCustomer);
        this.saveCustomers();
        this.displayCustomers();
        alert('Customer added successfully!');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Customers();
});
