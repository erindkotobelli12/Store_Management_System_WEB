
$("#sign-in-button").click(function() {
    const username = $("#username").val();
    const password = $("#password").val();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        alert('Login successful!');
        if(user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'customer.html';
        }
    } else {
        alert('Invalid username or password.');
    }
});
