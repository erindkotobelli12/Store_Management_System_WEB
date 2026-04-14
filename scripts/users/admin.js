class Admin extends User {
    constructor(email, password, name, surname) {
        super(email, password, name, surname, 'admin');
    }
}