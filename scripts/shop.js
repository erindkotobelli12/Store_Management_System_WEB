const currentCustomer = JSON.parse(localStorage.getItem('currentcustomer'));
const accountButton = $("#account_button");
const accountLabel = $("#account_label");
const cartButton = $("#cart_button");
const cartPanel = $("#cart_panel");
const cartItemsContainer = $("#cart_items");
const cartClose = $("#cart_close");
const checkoutButton = $("#checkout_button");

// Load and display categories in sidebar
function loadCategories() {
    const storedCategories = localStorage.getItem('productCategories');
    let categories = [];
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    } else {
        // Default categories if none exist
        categories = ['Footwear', 'Accessories', 'Headwear', 'Clothing', 'Electronics'];
    }

    // Load products to count per category
    const storedProducts = localStorage.getItem('products');
    let products = [];
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    }

    // Count products per category
    const categoryCounts = {};
    categories.forEach(cat => categoryCounts[cat] = 0);
    products.forEach(product => {
        if (categoryCounts.hasOwnProperty(product.category)) {
            categoryCounts[product.category]++;
        }
    });
    const totalProducts = products.length;

    const categoryList = $('.category-list');
    if (categoryList.length > 0) {
        // Keep "All Products" as first item
        let categoryHtml = `<li><a href="#" class="active">All Products <span class="count">${totalProducts}</span></a></li>`;

        // Add dynamic categories
        categories.forEach(category => {
            const count = categoryCounts[category] || 0;
            categoryHtml += `<li><a href="#">${category} <span class="count">${count}</span></a></li>`;
        });

        categoryList.html(categoryHtml);
    }
}

function isLoggedIn() {
    return currentCustomer && currentCustomer.name;
}

function getCart() {
    return (currentCustomer && currentCustomer.shoppingCart) ? currentCustomer.shoppingCart : [];
}

function saveCurrentCustomer() {
    if (!currentCustomer || !currentCustomer.email) return;
    localStorage.setItem('currentcustomer', JSON.stringify(currentCustomer));
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const index = customers.findIndex(u => u.email === currentCustomer.email);
    if (index !== -1) {
        customers[index].shoppingCart = currentCustomer.shoppingCart || [];
        localStorage.setItem('customers', JSON.stringify(customers));
    }
}

function renderCartItems() {
    const cart = getCart();
    if (!cart || cart.length === 0) {
        cartItemsContainer.html('<div class="cart-empty">Your bag is empty.</div>');
        checkoutButton.prop('disabled', true);
        return;
    }

    const itemsHtml = cart.map(item => {
        return `<div class="cart-item">
            <div class="cart-item-content">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-meta">${item.category} • Qty ${item.quantity}</div>
            </div>
            <div class="cart-item-price">${item.price}</div>
            <button class="cart-item-delete" data-name="${item.name}" aria-label="Remove ${item.name}">×</button>
          </div>`;
    }).join('');

    cartItemsContainer.html(itemsHtml);
    checkoutButton.prop('disabled', false);
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

checkoutButton.click(function() {
    if (!isLoggedIn()) return;
    const cart = getCart();
    if (!cart || cart.length === 0) return;
    alert('Proceeding to checkout...');
});

$(document).click(function(event) {
    if (!cartPanel.hasClass('hidden') && !$(event.target).closest('#cart_panel, #cart_button').length) {
        cartPanel.addClass('hidden');
        cartPanel.attr('aria-hidden', 'true');
    }
});

$(document).on('click', '.cart-item-delete', function() {
    const name = $(this).data('name');
    const cart = getCart();
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        cart.splice(index, 1);
        if (currentCustomer) {
            currentCustomer.shoppingCart = cart;
            saveCurrentCustomer();
        }
        renderCartItems();
    }
});

$(".add-to-cart").click(function() {
    if (!isLoggedIn()) {
        alert('Please log in to add items to your bag.');
        return;
    }

    const productCard = $(this).closest('.product-card');
    const name = productCard.find('.product-name').text().trim();
    const category = productCard.find('.product-category').text().trim();
    const price = productCard.find('.price-current').text().trim();
    const cart = getCart();

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, category, price, quantity: 1 });
    }

    if (currentCustomer) {
        currentCustomer.shoppingCart = cart;
        saveCurrentCustomer();
    }

    alert(`Added "${name}" to your bag.`);
    if (!cartPanel.hasClass('hidden')) {
        renderCartItems();
    }
});

// Initialize categories on page load
$(document).ready(function() {
    loadCategories();
});

// Handle category selection
$(document).on('click', '.category-list a', function(e) {
    e.preventDefault();
    
    // Remove active class from all category links
    $('.category-list a').removeClass('active');
    
    // Add active class to clicked link
    $(this).addClass('active');
    
    // Optional: You can store the selected category for later use
    const selectedCategory = $(this).text().split(' <span')[0]; // Extract category name without count
    console.log('Selected category:', selectedCategory);
});


