class Customer extends User {
    shoppingCart = [];
    constructor(email, password, name, surname) {
        super(email, password, name, surname, 'customer');
    }
}