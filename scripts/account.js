$(document).ready(function() {
    const currentCustomer = JSON.parse(localStorage.getItem('currentcustomer'));
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    const currentUser = currentCustomer || currentAdmin;
    const isAdmin = !!currentAdmin && !currentCustomer;

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load user info
    $('#name').val(currentUser.name || '');
    $('#surname').val(currentUser.surname || '');
    $('#email').val(currentUser.email || '');
    $('#password').val(currentUser.password || '');

    let originalData = { ...currentUser };

    // Edit button
    $('#edit-btn').click(function() {
        $('#name, #surname, #email, #password').prop('readonly', false);
        $('#edit-btn').hide();
        $('#save-btn, #cancel-btn').show();
    });

    // Cancel button
    $('#cancel-btn').click(function() {
        $('#name').val(originalData.name || '');
        $('#surname').val(originalData.surname || '');
        $('#email').val(originalData.email || '');
        $('#password').val(originalData.password || '');
        $('#name, #surname, #email, #password').prop('readonly', true);
        $('#edit-btn').show();
        $('#save-btn, #cancel-btn').hide();
    });

    // Save button
    $('#save-btn').click(function() {
        const newName = $('#name').val().trim();
        const newSurname = $('#surname').val().trim();
        const newEmail = $('#email').val().trim();
        const newPassword = $('#password').val().trim();

        if (!newName || !newSurname || !newEmail || !newPassword) {
            alert('All fields are required.');
            return;
        }

        currentUser.name = newName;
        currentUser.surname = newSurname;
        currentUser.email = newEmail;
        currentUser.password = newPassword;

        if (isAdmin) {
            localStorage.setItem('currentAdmin', JSON.stringify(currentUser));
            const admins = JSON.parse(localStorage.getItem('admins')) || [];
            const index = admins.findIndex(a => a.email === originalData.email);
            if (index !== -1) {
                admins[index] = { ...currentUser };
                localStorage.setItem('admins', JSON.stringify(admins));
            }
        } else {
            localStorage.setItem('currentcustomer', JSON.stringify(currentUser));
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            const index = customers.findIndex(c => c.email === originalData.email);
            if (index !== -1) {
                customers[index] = { ...currentUser };
                localStorage.setItem('customers', JSON.stringify(customers));
            }
        }

        originalData = { ...currentUser };

        $('#name, #surname, #email, #password').prop('readonly', true);
        $('#edit-btn').show();
        $('#save-btn, #cancel-btn').hide();

        alert('Account updated successfully!');
    });

    // Logout button
    $('#logout-btn').click(function() {
        $('#logoutModal').modal('show');
    });

    // Confirm logout
    $('#confirm-logout').click(function() {
        localStorage.removeItem('currentcustomer');
        localStorage.removeItem('currentAdmin');
        $('#logoutModal').modal('hide');
        window.location.href = 'shop.html';
    });
});