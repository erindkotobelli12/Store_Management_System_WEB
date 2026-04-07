class Customer extends user {
    shoppingCart = [];
    constructor(email, password, name, surname) {
        super(email, password, name, surname, 'customer');
    }
}