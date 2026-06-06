$(document).ready(async function() {
    const currentUser = api.getCurrentUser();
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
    $('#save-btn').click(async function() {
        const newName = $('#name').val().trim();
        const newSurname = $('#surname').val().trim();
        const newEmail = $('#email').val().trim();
        const newPassword = $('#password').val().trim();

        if (!newName || !newSurname || !newEmail || !newPassword) {
            alert('All fields are required.');
            return;
        }

        try {
            const updatedUser = await api.updateUser(originalData.email, {
                email: newEmail,
                name: newName,
                surname: newSurname,
                password: newPassword,
                status: currentUser.status,
                shoppingCart: currentUser.shoppingCart || []
            });

            api.setCurrentUser(updatedUser);
            originalData = { ...updatedUser };

            $('#name, #surname, #email, #password').prop('readonly', true);
            $('#edit-btn').show();
            $('#save-btn, #cancel-btn').hide();
            alert('Account updated successfully!');
        } catch (error) {
            alert(error.message || 'Could not update account.');
        }
    });

    $('#logout-btn').click(function() {
        $('#logoutModal').modal('show');
    });

    $('#confirm-logout').click(function() {
        api.removeCurrentUser();
        $('#logoutModal').modal('hide');
        window.location.href = 'login.html';
    });
});