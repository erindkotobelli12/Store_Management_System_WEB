window.api = (function() {
    const sessionKey = 'currentUser';

    async function request(path, method = 'GET', body) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`/api${path}`, options);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = (data && data.error) ? data.error : response.statusText;
            throw new Error(message || 'API request failed');
        }

        return data;
    }

    function getCurrentUser() {
        return JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
    }

    function setCurrentUser(user) {
        sessionStorage.setItem(sessionKey, JSON.stringify(user));
        return user;
    }

    function removeCurrentUser() {
        sessionStorage.removeItem(sessionKey);
    }

    return {
        request,
        login(data) {
            return request('/login', 'POST', data);
        },
        register(data) {
            return request('/register', 'POST', data);
        },
        getProducts() {
            return request('/products');
        },
        createProduct(data) {
            return request('/products', 'POST', data);
        },
        updateProduct(id, data) {
            return request(`/products/${encodeURIComponent(id)}`, 'PUT', data);
        },
        deleteProduct(id) {
            return request(`/products/${encodeURIComponent(id)}`, 'DELETE');
        },
        getCategories() {
            return request('/categories');
        },
        addCategory(data) {
            return request('/categories', 'POST', data);
        },
        deleteCategory(name) {
            return request(`/categories/${encodeURIComponent(name)}`, 'DELETE');
        },
        getCustomers() {
            return request('/customers');
        },
        createCustomer(data) {
            return request('/customers', 'POST', data);
        },
        deleteCustomer(email) {
            return request(`/customers/${encodeURIComponent(email)}`, 'DELETE');
        },
        getOrders() {
            return request('/orders');
        },
        createOrder(data) {
            return request('/orders', 'POST', data);
        },
        updateOrder(id, data) {
            return request(`/orders/${encodeURIComponent(id)}`, 'PUT', data);
        },
        deleteOrder(id) {
            return request(`/orders/${encodeURIComponent(id)}`, 'DELETE');
        },
        checkout(data) {
            return request('/checkout', 'POST', data);
        },
        getUser(email) {
            return request(`/users/${encodeURIComponent(email)}`);
        },
        updateUser(email, data) {
            return request(`/users/${encodeURIComponent(email)}`, 'PUT', data);
        },
        saveCart(email, cart) {
            return request(`/users/${encodeURIComponent(email)}/cart`, 'PUT', { cart });
        },
        getCurrentUser,
        setCurrentUser,
        removeCurrentUser
    };
})();
