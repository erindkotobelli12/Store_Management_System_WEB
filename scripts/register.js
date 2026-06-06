$("#create-account-button").click(async function() {
    const firstname = $("#firstname").val().trim();
    const lastname = $("#lastname").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val();
    const confirmPassword = $("#confirm-password").val();

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        await api.register({ firstname, lastname, email, password });
        alert('Account created successfully!');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message || 'Registration failed.');
    }
});