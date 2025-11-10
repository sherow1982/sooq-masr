// This file is loaded by index.html to provide product data
// The actual product data is loaded from products.json via fetch in app.js
// This file can be used for future static product data if needed

console.log('📦 Product data module loaded');
console.log('✅ Products will be loaded from products.json via app.js');

// Export empty for now - data comes from products.json
const PRODUCTS_DATA_VERSION = '1.0';
const LAST_UPDATE = '2025-11-10';

// Note: Main product loading happens in app.js using fetch('products.json')