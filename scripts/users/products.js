// Products Management JavaScript

class Products {
    constructor() {
        this.products = [];
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.attachStaticEventListeners();
        this.populateCategoryDropdown();
        this.updateCategoriesList();
        this.updateStats();
        this.displayProducts();
    }

    async loadProducts() {
        try {
            const apiProducts = await api.getProducts();
            this.products = apiProducts.map((product, index) => ({
                id: product.id || `#PRD-${String(index + 1).padStart(3, '0')}`,
                name: product.name,
                category: product.category,
                price: product.price,
                stock: Number.isFinite(product.stock) ? product.stock : parseInt(product.stock, 10) || 0,
                sales: Number.isFinite(product.sales) ? product.sales : parseInt(product.sales, 10) || 0,
                status: product.status || (Number(product.stock) === 0 ? 'Out of Stock' : Number(product.stock) < 50 ? 'Low Stock' : 'Active')
            }));
            this.saveProducts();
        } catch (error) {
            const storedProducts = localStorage.getItem('products');
            this.products = storedProducts ? JSON.parse(storedProducts) : [];
        }
    }

    async loadCategories() {
        const storedCategories = localStorage.getItem('productCategories');

        try {
            const apiCategories = await api.getCategories();
            if (Array.isArray(apiCategories)) {
                this.categories = apiCategories.map(category => typeof category === 'string' ? category : category.name).filter(Boolean);
                this.saveCategories();
                return;
            }
        } catch (error) {
            // fallback to localStorage when backend is unavailable
        }

        if (storedCategories) {
            try {
                const parsed = JSON.parse(storedCategories);
                this.categories = Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                this.categories = ['Footwear', 'Accessories', 'Headwear', 'Clothing', 'Electronics'];
                this.saveCategories();
            }
        } else {
            // Seed default categories so the admin view is not empty
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

        if (this.categories.length === 0) {
            list.innerHTML = '<div class="text-muted">No categories added yet.</div>';
            return;
        }

        list.innerHTML = this.categories.map((category, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #f8f9fa; margin-bottom: 8px; border-radius: 4px;">
                <span>${category}</span>
                <button class="btn btn-sm btn-danger" onclick="window.productsInstance.deleteCategory(${index})" style="padding: 4px 8px; font-size: 12px;">Delete</button>
            </div>
        `).join('');
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

    attachStaticEventListeners() {
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
    }

    attachTableEventListeners() {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;

        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const viewBtn = row.querySelector('.btn-outline-primary');
            const editBtn = row.querySelector('.btn-outline-success');
            const deleteBtn = row.querySelector('.btn-outline-danger');

            if (viewBtn) viewBtn.addEventListener('click', () => this.viewProduct(index));
            if (editBtn) editBtn.addEventListener('click', () => this.editProduct(index));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteProduct(index));
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

        this.attachTableEventListeners();
    }

    viewProduct(index) {
        const product = this.products[index];
        alert(`Product Details:\n\nID: ${product.id}\nName: ${product.name}\nCategory: ${product.category}\nPrice: ${product.price}\nStock: ${product.stock} units\nTotal Sales: ${product.sales}\nStatus: ${product.status}`);
    }

    async editProduct(index) {
        const product = this.products[index];
        const newStock = prompt(`Edit Stock for ${product.name}:\n\nCurrent Stock: ${product.stock}\n\nEnter new stock quantity:`, product.stock);
        
        if (newStock !== null && !isNaN(newStock)) {
            const updatedStock = parseInt(newStock, 10);
            const updatedStatus = updatedStock === 0 ? 'Out of Stock' : updatedStock < 50 ? 'Low Stock' : 'Active';
            const updatedProduct = {
                ...product,
                stock: updatedStock,
                status: updatedStatus
            };

            try {
                await api.updateProduct(product.id, {
                    name: updatedProduct.name,
                    category: updatedProduct.category,
                    price: updatedProduct.price,
                    stock: updatedProduct.stock,
                    sales: updatedProduct.sales,
                    status: updatedProduct.status
                });
                this.products[index] = updatedProduct;
                this.saveProducts();
                this.displayProducts();
                this.updateStats();
                alert('Product updated successfully!');
            } catch (error) {
                alert(error.message || 'Could not update product.');
            }
        }
    }

    async deleteProduct(index) {
        const product = this.products[index];
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            try {
                await api.deleteProduct(product.id);
                this.products.splice(index, 1);
                this.saveProducts();
                this.displayProducts();
                this.updateStats();
                alert('Product deleted successfully!');
            } catch (error) {
                alert(error.message || 'Could not delete product.');
            }
        }
    }

    showAddProductModal() {
        // Clear the form
        document.getElementById('productName').value = '';
        document.getElementById('productCategory').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productStock').value = '';

        // Reuse existing modal instance or create one
        const modalEl = document.getElementById('addProductModal');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }

    async saveNewProduct() {
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value;
        const price = document.getElementById('productPrice').value.trim();
        const stockValue = document.getElementById('productStock').value.trim();

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

        if (!stockValue || isNaN(stockValue) || parseInt(stockValue, 10) < 0) {
            alert('Please enter a valid stock quantity (cannot be negative)');
            return;
        }

        const stock = parseInt(stockValue, 10);
        const status = stock === 0 ? 'Out of Stock' : stock < 50 ? 'Low Stock' : 'Active';

        const newProduct = {
            id: '#PRD-' + String(this.products.length + 1).padStart(3, '0'),
            name: name,
            category: category,
            price: price,
            stock: stock,
            sales: 0,
            status: status
        };

        try {
            await api.createProduct({
                name: newProduct.name,
                category: newProduct.category,
                price: newProduct.price,
                stock: newProduct.stock
            });

            this.products.push(newProduct);
            this.saveProducts();
            this.displayProducts();
            this.updateStats();

            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modal.hide();

            alert('Product added successfully!');
        } catch (error) {
            alert(error.message || 'Could not add product.');
        }
    }

    showCategoriesModal() {
        this.updateCategoriesList();
        document.getElementById('newCategory').value = '';
        const modalEl = document.getElementById('manageCategoriesModal');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }

    async addCategory() {
        const categoryName = document.getElementById('newCategory').value.trim();

        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }

        if (this.categories.includes(categoryName)) {
            alert('This category already exists');
            return;
        }

        try {
            await api.addCategory({ name: categoryName });
            this.categories.push(categoryName);
            this.saveCategories();
            this.populateCategoryDropdown();
            this.updateCategoriesList();
            document.getElementById('newCategory').value = '';
        } catch (error) {
            alert(error.message || 'Could not add category.');
        }
    }

    async deleteCategory(index) {
        const category = this.categories[index];
        const productsToDelete = this.products.filter(p => p.category === category);
        const productsInCategory = productsToDelete.length;

        let confirmMessage = `Are you sure you want to delete "${category}"?`;
        if (productsInCategory > 0) {
            confirmMessage += ` This will also delete ${productsInCategory} product(s) in this category.`;
        }

        if (confirm(confirmMessage)) {
            // Delete all products in this category from the backend and local state
            await Promise.all(productsToDelete.map(async product => {
                try {
                    await api.deleteProduct(product.id);
                } catch (error) {
                    console.warn(`Failed to delete product ${product.id}:`, error);
                }
            }));

            this.products = this.products.filter(p => p.category !== category);
            this.saveProducts();

            // Delete the category from backend and local state
            try {
                await api.deleteCategory(category);
            } catch (error) {
                console.warn(`Failed to delete category ${category}:`, error);
            }

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
