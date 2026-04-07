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
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const userExists = users.some(u => u.email === email);

    if (userExists) {
        alert("User with this email already exists.");
        return;
    }

    const newUser = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        role: 'customer'
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created successfully!');
    window.location.href = 'login.html';
});