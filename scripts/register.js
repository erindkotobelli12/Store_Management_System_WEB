$("#create-account-button").click(function() {
    const firstname = $("#firstname").val();
    const lastname = $("#lastname").val();
    const email = $("#email").val();
    const password = $("#password").val();
    const confirmPassword = $("#confirm-password").val();

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    
    const userExists = customers.some(u => u.email === email);

    if (userExists) {
        alert("User with this email already exists.");
        return;
    }

    const newCustomer = new Customer(email, password, firstname, lastname);

    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
    alert('Account created successfully!');
    window.location.href = 'login.html';
});