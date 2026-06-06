const currentCustomer = api.getCurrentUser();
const accountButton = $('#account_button');
const accountLabel = $('#account_label');
const cartButton = $('#cart_button');
const cartPanel = $('#cart_panel');
const cartItemsContainer = $('#cart_items');
const cartClose = $('#cart_close');
const checkoutButton = $('#checkout_button');
const productGrid = $('.product-grid');
const resultsCount = $('.results-count');
const categoryList = $('.category-list');
const productSearch = $('.nav-search input');

let allProducts = [];
let activeCategory = 'All Products';
let searchTerm = '';

function isLoggedIn() {
    return currentCustomer && currentCustomer.name;
}

function getCart() {
    return (currentCustomer && Array.isArray(currentCustomer.shoppingCart)) ? currentCustomer.shoppingCart : [];
}

async function saveCurrentCustomer() {
    if (!currentCustomer || !currentCustomer.email) return;
    currentCustomer.shoppingCart = currentCustomer.shoppingCart || [];
    await api.saveCart(currentCustomer.email, currentCustomer.shoppingCart);
    api.setCurrentUser(currentCustomer);
}

function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 900) + 100;
    return `#ORD-${timestamp.toString().slice(-5)}${random}`;
}

function calculateCartTotal(cart) {
    return cart.reduce((total, item) => {
        const amount = parseFloat(String(item.price).replace(/[^0-9.-]+/g, '')) || 0;
        return total + amount * item.quantity;
    }, 0);
}

function normalizePrice(price) {
    if (typeof price === 'number') {
        return `$${price.toFixed(2)}`;
    }

    if (typeof price !== 'string') {
        return '$0.00';
    }

    const trimmedPrice = price.trim();
    return trimmedPrice.startsWith('$') ? trimmedPrice : `$${trimmedPrice}`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadProducts() {
    const storedProducts = await api.getProducts();
    allProducts = storedProducts.map((product, index) => ({
        id: product.id || `#PRD-${String(index + 1).padStart(3, '0')}`,
        name: product.name || 'Unnamed Product',
        category: product.category || 'Uncategorized',
        price: normalizePrice(product.price),
        stock: Number.isFinite(product.stock) ? product.stock : parseInt(product.stock, 10) || 0,
        status: product.status || 'Active'
    }));
}

function getFilteredProducts() {
    return allProducts.filter(product => {
        const matchesCategory = activeCategory === 'All Products' || product.category === activeCategory;
        const matchesSearch = !searchTerm
            || product.name.toLowerCase().includes(searchTerm)
            || product.category.toLowerCase().includes(searchTerm)
            || product.id.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });
}

function renderCategories() {
    if (!categoryList.length) return;

    const counts = allProducts.reduce((categoryCounts, product) => {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        return categoryCounts;
    }, {});

    const categoryItems = ['All Products', ...Object.keys(counts).sort((first, second) => first.localeCompare(second))];

    categoryList.html(categoryItems.map(category => {
        const count = category === 'All Products' ? allProducts.length : counts[category];
        const activeClass = category === activeCategory ? 'active' : '';
        const safeCategory = escapeHtml(category);

        return `<li><a href="#" class="${activeClass}" data-category="${safeCategory}">${safeCategory} <span class="count">${count}</span></a></li>`;
    }).join(''));
}

function renderProducts() {
    if (!productGrid.length) return;

    const filteredProducts = getFilteredProducts();
    resultsCount.text(`${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`);

    if (filteredProducts.length === 0) {
        productGrid.html(`
            <div class="product-card" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p class="product-category">No products found</p>
                <h3 class="product-name">Try another search or category.</h3>
            </div>
        `);
        return;
    }

    productGrid.html(filteredProducts.map(product => {
        const safeName = escapeHtml(product.name);
        const safeCategory = escapeHtml(product.category);
        const safePrice = escapeHtml(product.price);
        const inStock = product.stock > 0;
        const stockLabel = inStock ? `${product.stock} in stock` : 'Out of stock';
        const stockBadgeClass = inStock ? 'badge-new' : 'badge-sale';
        const buttonDisabled = !inStock ? 'disabled' : '';
        const buttonLabel = inStock ? 'Add to bag' : 'Unavailable';

        return `
            <article class="product-card" data-product-id="${escapeHtml(product.id)}">
                <div class="product-img">
                    <span class="product-badge ${stockBadgeClass}">${escapeHtml(stockLabel)}</span>
                </div>
                <div class="product-info">
                    <p class="product-category">${safeCategory}</p>
                    <h3 class="product-name">${safeName}</h3>
                    <div class="product-footer">
                        <span class="price-current">${safePrice}</span>
                        <button class="add-to-cart" ${buttonDisabled} title="${buttonLabel}">${buttonLabel}</button>
                    </div>
                </div>
            </article>
        `;
    }).join(''));
}

async function refreshShopProducts() {
    await loadProducts();
    renderCategories();
    renderProducts();
}

function renderCartItems() {
    const cart = getCart();
    if (!cart || cart.length === 0) {
        cartItemsContainer.html('<div class="cart-empty">Your bag is empty.</div>');
        checkoutButton.prop('disabled', true);
        updateCartTotal([]);
        return;
    }

    const itemsHtml = cart.map(item => {
        return `<div class="cart-item">
            <div class="cart-item-content">
              <div class="cart-item-name">${escapeHtml(item.name)}</div>
              <div class="cart-item-meta">${escapeHtml(item.category)} • Qty ${item.quantity}</div>
            </div>
            <div class="cart-item-price">${escapeHtml(item.price)}</div>
            <button class="cart-item-delete" data-name="${escapeHtml(item.name)}" aria-label="Remove ${escapeHtml(item.name)}">×</button>
          </div>`;
    }).join('');

    cartItemsContainer.html(itemsHtml);
    checkoutButton.prop('disabled', false);
    updateCartTotal(cart);
}

function updateCartTotal(cart) {
    const total = calculateCartTotal(cart);
    const totalElement = $('#cart_total strong');
    if (totalElement.length) {
        totalElement.text(`$${total.toFixed(2)}`);
    }
}

if (isLoggedIn()) {
    accountLabel.text(currentCustomer.name);
    accountButton.attr('title', 'Account');
} else {
    accountLabel.text('Login');
    accountButton.attr('title', 'Login');
}

accountButton.click(function() {
    if (isLoggedIn()) {
        window.location.href = 'account.html';
    } else {
        window.location.href = 'login.html';
    }
});

cartButton.click(function(event) {
    event.stopPropagation();
    if (!isLoggedIn()) {
        alert('Please log in to view your shopping bag.');
        return;
    }

    renderCartItems();
    cartPanel.toggleClass('hidden');
    cartPanel.attr('aria-hidden', cartPanel.hasClass('hidden').toString());
});

cartClose.click(function() {
    cartPanel.addClass('hidden');
    cartPanel.attr('aria-hidden', 'true');
});

checkoutButton.click(async function() {
    if (!isLoggedIn()) return;
    const cart = getCart();
    if (!cart || cart.length === 0) return;

    const totalAmount = calculateCartTotal(cart);

    try {
        await api.checkout({
            customerEmail: currentCustomer.email,
            customerName: currentCustomer.name,
            customerSurname: currentCustomer.surname,
            cart,
            totalAmount
        });

        currentCustomer.shoppingCart = [];
        await saveCurrentCustomer();
        await refreshShopProducts();
        renderCartItems();
        cartPanel.addClass('hidden');
        cartPanel.attr('aria-hidden', 'true');
        alert('Your order has been placed.');
    } catch (error) {
        alert(error.message || 'Checkout failed.');
    }
});

$(document).click(function(event) {
    if (!cartPanel.hasClass('hidden') && !$(event.target).closest('#cart_panel, #cart_button').length) {
        cartPanel.addClass('hidden');
        cartPanel.attr('aria-hidden', 'true');
    }
});

$(document).on('click', '.cart-item-delete', async function() {
    const name = $(this).data('name');
    const cart = getCart();
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        cart.splice(index, 1);
        if (currentCustomer) {
            currentCustomer.shoppingCart = cart;
            await saveCurrentCustomer();
        }
        renderCartItems();
    }
});

$(document).on('click', '.category-list a', function(event) {
    event.preventDefault();
    activeCategory = $(this).data('category') || 'All Products';
    renderCategories();
    renderProducts();
});

productSearch.on('input', function() {
    searchTerm = $(this).val().trim().toLowerCase();
    renderProducts();
});

$(document).on('click', '.add-to-cart', async function() {
    if (!isLoggedIn()) {
        alert('Please log in to add items to your bag.');
        return;
    }

    if ($(this).is(':disabled')) {
        return;
    }

    const productCard = $(this).closest('.product-card');
    const name = productCard.find('.product-name').text().trim();
    const category = productCard.find('.product-category').text().trim();
    const price = productCard.find('.price-current').text().trim();
    const cart = getCart();

    const product = allProducts.find(p => p.name === name);
    const availableStock = product ? product.stock : 0;

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        if (existingItem.quantity >= availableStock) {
            alert(`Sorry, only ${availableStock} unit${availableStock === 1 ? '' : 's'} of "${name}" available.`);
            return;
        }
        existingItem.quantity += 1;
    } else {
        if (availableStock <= 0) return;
        cart.push({ name, category, price, quantity: 1 });
    }

    if (currentCustomer) {
        currentCustomer.shoppingCart = cart;
        await saveCurrentCustomer();
    }

    alert(`Added "${name}" to your bag.`);
    if (!cartPanel.hasClass('hidden')) {
        renderCartItems();
    }
});

// Initialize shop on page load
$(async function() {
    await refreshShopProducts();
});


