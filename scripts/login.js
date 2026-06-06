$('#sign-in-button').click(async function() {
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        const user = await api.login({ email, password });
        api.setCurrentUser(user);
        alert('Login successful!');
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'shop.html';
        }
    } catch (error) {
        alert(error.message || 'Invalid email or password.');
    }
});

