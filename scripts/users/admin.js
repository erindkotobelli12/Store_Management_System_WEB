class admin extends user {
    constructor(username, password, name, surname) {
        super(username, password, name, surname, 'admin');
    }
}