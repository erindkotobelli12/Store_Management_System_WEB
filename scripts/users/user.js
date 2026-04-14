class User {
    constructor(email, password, name, surname, role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.surname = surname;
        this.role = role;
        console.log("User created: " + this.email);
    }
}