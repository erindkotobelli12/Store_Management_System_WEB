$("#sign-in-button").click(function() {
    const email = $("#email").val();
    const password = $("#password").val();
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customer = customers.find(u => u.email === email && u.password === password);
    if (customer) {
        alert('Login successful!');
        window.location.href = 'costumer.html';
        return;
    }
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) {
        alert('Login successful!');
        window.location.href = 'admin.html';
        return;
    }
    alert('Invalid email or password.');
});
