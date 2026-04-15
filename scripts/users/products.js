// Products Management JavaScript

class Products {
    constructor() {
        this.products = [];
        this.categories = [];
        this.init();
    }

    init() {
        this.loadCategories();
        this.loadProducts();
        this.attachEventListeners();
        this.populateCategoryDropdown();
        this.updateStats();
        this.displayProducts();
    }

    loadCategories() {
        const storedCategories = localStorage.getItem('productCategories');
        if (storedCategories) {
            this.categories = JSON.parse(storedCategories);
        } else {
            // Default categories
            this.categories = ['Footwear', 'Accessories', 'Headwear', 'Clothing', 'Electronics'];
            this.saveCategories();
        }
    }

    saveCategories() {
        localStorage.setItem('productCategories', JSON.stringify(this.categories));
    }

    populateCategoryDropdown() {
        const select = document.getElementById('productCategory');
        if (select) {
            // Keep the placeholder option
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select a category</option>';
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });

            if (currentValue && this.categories.includes(currentValue)) {
                select.value = currentValue;
            }
        }
    }

    updateCategoriesList() {
        const list = document.getElementById('categoriesList');
        if (!list) return;

        list.innerHTML = this.categories.map((category, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #f8f9fa; margin-bottom: 8px; border-radius: 4px;">
                <span>${category}</span>
                <button class="btn btn-sm btn-danger" onclick="window.productsInstance.deleteCategory(${index})" style="padding: 4px 8px; font-size: 12px;">Delete</button>
            </div>
        `).join('');
    }

    loadProducts() {
        // Load products from localStorage or use sample data
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            this.products = JSON.parse(storedProducts);
        } else {
            // Initialize with sample products
            this.products = [
                {
                    id: '#PRD-001',
                    name: 'Air Zoom Pro',
                    category: 'Footwear',
                    price: '$89.99',
                    stock: 210,
                    sales: 1240,
                    status: 'Active'
                },
                {
                    id: '#PRD-002',
                    name: 'Urban Pack XL',
                    category: 'Accessories',
                    price: '$129.99',
                    stock: 154,
                    sales: 987,
                    status: 'Active'
                },
                {
                    id: '#PRD-003',
                    name: 'Classic Snapback',
                    category: 'Headwear',
                    price: '$49.99',
                    stock: 15,
                    sales: 2145,
                    status: 'Low Stock'
                },
                {
                    id: '#PRD-004',
                    name: 'Graphic Tee Pack',
                    category: 'Clothing',
                    price: '$29.99',
                    stock: 0,
                    sales: 1876,
                    status: 'Out of Stock'
                },
                {
                    id: '#PRD-005',
                    name: 'Sport Watch S2',
                    category: 'Electronics',
                    price: '$199.99',
                    stock: 62,
                    sales: 542,
                    status: 'Active'
                }
            ];
            this.saveProducts();
        }
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    updateStats() {
        // Calculate stats
        const totalProducts = this.products.length;
        const inStockProducts = this.products.filter(p => p.stock > 0).length;
        const lowStockProducts = this.products.filter(p => p.stock > 0 && p.stock < 50).length;
        const outOfStockProducts = this.products.filter(p => p.stock === 0).length;

        // Update DOM elements
        const totalCount = document.getElementById('totalProductsCount');
        const inStockCount = document.getElementById('inStockCount');
        const lowStockCount = document.getElementById('lowStockCount');
        const outOfStockCount = document.getElementById('outOfStockCount');

        const totalChange = document.getElementById('totalProductsChange');
        const inStockChange = document.getElementById('inStockChange');
        const lowStockChange = document.getElementById('lowStockChange');
        const outOfStockChange = document.getElementById('outOfStockChange');

        if (totalCount) totalCount.textContent = totalProducts;
        if (inStockCount) inStockCount.textContent = inStockProducts;
        if (lowStockCount) lowStockCount.textContent = lowStockProducts;
        if (outOfStockCount) outOfStockCount.textContent = outOfStockProducts;

        // Update secondary text
        if (totalChange) totalChange.textContent = `${totalProducts} total products`;
        if (inStockChange) inStockChange.textContent = inStockProducts > 0 ? 'Good availability' : 'No products in stock';
        if (lowStockChange) lowStockChange.textContent = lowStockProducts > 0 ? 'Needs attention' : 'All stocked well';
        if (outOfStockChange) outOfStockChange.textContent = `${outOfStockProducts} out of stock`;
    }

    attachEventListeners() {
        // Manage Categories button
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => this.showCategoriesModal());
        }

        // Add Category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.addCategory());
        }

        // Add Product button
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddProductModal());
        }

        // Save Product button in modal
        const saveBtn = document.getElementById('saveProductBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveNewProduct());
        }

        // View buttons
        document.querySelectorAll('.btn-outline-primary').forEach((btn, index) => {
            btn.addEventListener('click', () => this.viewProduct(index));
        });

        // Edit buttons
        document.querySelectorAll('.btn-outline-success').forEach((btn, index) => {
            btn.addEventListener('click', () => this.editProduct(index));
        });

        // Delete buttons
        document.querySelectorAll('.btn-outline-danger').forEach((btn, index) => {
            btn.addEventListener('click', () => this.deleteProduct(index));
        });
    }


    displayProducts(products = this.products) {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;

        const getStockBadge = (stock, status) => {
            if (status === 'Out of Stock') return 'bg-danger';
            if (status === 'Low Stock') return 'bg-warning';
            return 'bg-success';
        };

        tableBody.innerHTML = products.map((product, index) => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <div style="display: flex; align-items: center;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; margin-right: 10px;">
                            <i class="fas fa-box"></i>
                        </div>
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>${product.category}</td>
                <td>${product.price}</td>
                <td><span class="badge ${getStockBadge(product.stock, product.status)}">${product.stock} units</span></td>
                <td>${product.sales}</td>
                <td><span class="badge bg-success">${product.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" title="View"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-outline-success" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        this.attachEventListeners();
    }

    viewProduct(index) {
        const product = this.products[index];
        alert(`Product Details:\n\nID: ${product.id}\nName: ${product.name}\nCategory: ${product.category}\nPrice: ${product.price}\nStock: ${product.stock} units\nTotal Sales: ${product.sales}\nStatus: ${product.status}`);
    }

    editProduct(index) {
        const product = this.products[index];
        const newStock = prompt(`Edit Stock for ${product.name}:\n\nCurrent Stock: ${product.stock}\n\nEnter new stock quantity:`, product.stock);
        
        if (newStock !== null && !isNaN(newStock)) {
            this.products[index].stock = parseInt(newStock);
            
            // Update status based on stock
            if (this.products[index].stock === 0) {
                this.products[index].status = 'Out of Stock';
            } else if (this.products[index].stock < 50) {
                this.products[index].status = 'Low Stock';
            } else {
                this.products[index].status = 'Active';
            }

            this.saveProducts();
            this.displayProducts();
            this.updateStats();
            alert('Product updated successfully!');
        }
    }

    deleteProduct(index) {
        const product = this.products[index];
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            this.products.splice(index, 1);
            this.saveProducts();
            this.displayProducts();
            this.updateStats();
            alert('Product deleted successfully!');
        }
    }

    showAddProductModal() {
        // Clear the form
        document.getElementById('productName').value = '';
        document.getElementById('productCategory').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productStock').value = '';

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
        modal.show();
    }

    saveNewProduct() {
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value;
        const price = document.getElementById('productPrice').value.trim();
        const stock = document.getElementById('productStock').value.trim();

        // Validation
        if (!name) {
            alert('Please enter a product name');
            return;
        }

        // Check if product name already exists
        const existingProduct = this.products.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (existingProduct) {
            alert(`Product "${name}" is currently in stock. Please use a different product name.`);
            return;
        }

        if (!category) {
            alert('Please select a category');
            return;
        }

        if (!price) {
            alert('Please enter a price');
            return;
        }

        if (!stock || isNaN(stock) || parseInt(stock) < 0) {
            alert('Please enter a valid stock quantity (cannot be negative)');
            return;
        }

        const newProduct = {
            id: `#PRD-${this.products.length + 1}`.padStart(7, '0'),
            name: name,
            category: category,
            price: price,
            stock: parseInt(stock),
            sales: 0,
            status: parseInt(stock) > 0 ? 'Active' : (parseInt(stock) < 50 ? 'Low Stock' : 'Active')
        };

        this.products.push(newProduct);
        this.saveProducts();
        this.displayProducts();
        this.updateStats();

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();

        alert('Product added successfully!');
    }

    showCategoriesModal() {
        this.updateCategoriesList();
        document.getElementById('newCategory').value = '';
        const modal = new bootstrap.Modal(document.getElementById('manageCategoriesModal'));
        modal.show();
    }

    addCategory() {
        const categoryName = document.getElementById('newCategory').value.trim();

        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }

        if (this.categories.includes(categoryName)) {
            alert('This category already exists');
            return;
        }

        this.categories.push(categoryName);
        this.saveCategories();
        this.populateCategoryDropdown();
        this.updateCategoriesList();
        document.getElementById('newCategory').value = '';
    }

    deleteCategory(index) {
        const category = this.categories[index];
        const productsInCategory = this.products.filter(p => p.category === category).length;
        
        let confirmMessage = `Are you sure you want to delete "${category}"?`;
        if (productsInCategory > 0) {
            confirmMessage += ` This will also delete ${productsInCategory} product(s) in this category.`;
        }
        
        if (confirm(confirmMessage)) {
            // Delete all products in this category
            this.products = this.products.filter(p => p.category !== category);
            this.saveProducts();
            
            // Delete the category
            this.categories.splice(index, 1);
            this.saveCategories();
            
            this.populateCategoryDropdown();
            this.updateCategoriesList();
            this.displayProducts();
            this.updateStats();
            
            alert(`Category "${category}" and ${productsInCategory} product(s) deleted successfully!`);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.productsInstance = new Products();
});
