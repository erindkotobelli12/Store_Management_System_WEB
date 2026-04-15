$("#sign-in-button").click(function() {
    const email = $("#email").val();
    const password = $("#password").val();
    
    // Check customers
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customer = customers.find(u => u.email === email && u.password === password);
    if (customer) {
        localStorage.setItem('currentcustomer', JSON.stringify(customer));
        alert('Login successful!');
        window.location.href = 'shop.html';
        return;
    }
    
    // Check admins
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    
    // Initialize default admin if no admins exist
    if (admins.length === 0) {
        const defaultAdmin = new Admin('admin@gmail.com', 'admin123', 'Andrea', 'Ogreni');
        admins.push(defaultAdmin);
        localStorage.setItem('admins', JSON.stringify(admins));
    }
    
    // Find admin with matching credentials
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) {
        alert('Login successful!');
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        window.location.href = 'admin.html';
        return;
    }
    alert('Invalid email or password.');
});

