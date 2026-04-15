// Revenue Management JavaScript

class Revenue {
    constructor() {
        this.revenueData = [];
        this.init();
    }

    init() {
        this.loadRevenueData();
    }

    loadRevenueData() {
        const storedData = localStorage.getItem('revenue');
        if (storedData) {
            this.revenueData = JSON.parse(storedData);
        } else {
            this.revenueData = [
                { id: '#TXN-0001', date: 'Apr 13, 2025', customer: 'Ana Leka', amount: '$89.99', method: 'Credit Card', status: 'Completed' },
                { id: '#TXN-0002', date: 'Apr 12, 2025', customer: 'James Brown', amount: '$259.98', method: 'Credit Card', status: 'Completed' }
            ];
            this.saveRevenueData();
        }
    }

    saveRevenueData() {
        localStorage.setItem('revenue', JSON.stringify(this.revenueData));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Revenue();
});
