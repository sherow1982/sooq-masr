const fs = require('fs');
const path = require('path');

console.log('🚀 توليد صفحات المنتجات...\n');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const outputDir = path.join(__dirname, 'products-pages');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function slug(t) {
    return t.trim().replace(/[^\u0600-\u06FF\u0660-\u0669a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function stars(r) {
    const f = Math.floor(r);
    return '★'.repeat(f) + '☆'.repeat(5 - f);
}

let count = 0;

products.forEach(p => {
    if (!p.id || !p.title) return;
    
    const s = slug(p.title);
    const price = parseFloat(p.price) || 0;
    const salePrice = parseFloat(p.sale_price) || price;
    const discount = price !== salePrice ? Math.round((price - salePrice) / price * 100) : 0;
    
    // قسم التقييمات
    let reviewsSection = '';
    if (p.reviews && p.reviews.length > 0) {
        let reviewCards = '';
        p.reviews.slice(0, 10).forEach(r => {
            reviewCards += `
                <div style="background:#f9fafb;padding:1.5rem;border-radius:12px;margin-bottom:1rem;border-right:4px solid #667eea">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                        <strong style="color:#1f2937">${r.reviewer_name}</strong>
                        <span style="color:#fbbf24;font-size:1.2rem">${stars(r.rating)}</span>
                    </div>
                    ${r.verified_purchase ? '<div style="color:#059669;font-size:0.8rem;margin-bottom:0.5rem">✓ عميل موثق</div>' : ''}
                    <p style="margin:0;color:#374151;line-height:1.6">${r.comment}</p>
                    <div style="color:#9ca3af;font-size:0.85rem;margin-top:0.5rem">${r.date}</div>
                </div>
            `;
        });
        
        reviewsSection = `
            <div style="background:white;padding:2.5rem;border-radius:16px;margin-top:3rem;box-shadow:0 10px 30px rgba(0,0,0,0.06)">
                <div style="margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:2px solid #f3f4f6">
                    <h2 style="font-size:1.8rem;font-weight:800;margin-bottom:1rem">⭐ آراء العملاء</h2>
                    <div style="display:flex;align-items:center;gap:1.5rem">
                        <div style="font-size:3rem;font-weight:900;color:#f59e0b">${p.rating}</div>
                        <div>
                            <div style="font-size:1.5rem;color:#fbbf24">${stars(p.rating)}</div>
                            <div style="color:#6b7280">${p.review_count} تقييم</div>
                        </div>
                    </div>
                </div>
                ${reviewCards}
            </div>
        `;
    }
    
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${p.title} | سوق مصر</title>
    <link rel="stylesheet" href="../styles.css">
    <style>
        body{background:#f5f7fa;padding-top:70px;font-family:Cairo,sans-serif}
        .container{max-width:1400px;margin:2rem auto;padding:0 1rem}
        .product-layout{display:grid;grid-template-columns:500px 1fr;gap:3rem;background:#fff;padding:3rem;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,.1)}
        .main-image{width:100%;border-radius:16px}
        h1{font-size:2rem;font-weight:900;margin-bottom:1.5rem}
        .price-box{background:linear-gradient(135deg,#667eea,#764ba2);padding:2rem;border-radius:16px;text-align:center;color:#fff;margin-bottom:2rem}
        .price{font-size:3rem;font-weight:900}
        .btn{padding:16px 24px;border:none;border-radius:12px;font-weight:700;cursor:pointer;width:100%;font-size:1.2rem;text-decoration:none;display:block;text-align:center;margin-bottom:1rem}
        .btn-whatsapp{background:linear-gradient(135deg,#25D366,#128C7E);color:#fff}
        @media (max-width:1024px){.product-layout{grid-template-columns:1fr}}
    </style>
</head>
<body>
    <header>
        <nav class="navbar">
            <div class="container">
                <a href="../index.html" class="logo">🛒 سوق مصر</a>
                <div class="nav-links">
                    <a href="../index.html">الرئيسية</a>
                    <a href="../products-catalog.html">المنتجات</a>
                    <a href="../cart.html">السلة</a>
                </div>
            </div>
        </nav>
    </header>
    
    <div class="container">
        <div class="product-layout">
            <div>
                <img class="main-image" src="${p.image_link}" alt="${p.title}">
            </div>
            <div>
                <h1>${p.title}</h1>
                <div style="margin-bottom:1rem;color:#fbbf24;font-size:1.5rem">
                    ${stars(p.rating)} <span style="color:#666">(${p.review_count} تقييم)</span>
                </div>
                <div class="price-box">
                    <div class="price">${salePrice.toFixed(2)} ج.م</div>
                    ${discount ? `<div style="margin-top:10px;font-size:1.2rem">خصم ${discount}%</div>` : ''}
                </div>
                <a href="https://wa.me/201110760081" class="btn btn-whatsapp">📱 اطلب الآن عبر واتساب</a>
                <div style="margin-top:2rem;color:#666;line-height:1.8">${p.description || 'منتج أصلي بأفضل سعر'}</div>
            </div>
        </div>
        ${reviewsSection}
    </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(outputDir, `product-${p.id}-${s}.html`), html, 'utf8');
    count++;
    if (count % 100 === 0) console.log(`⏳ ${count} صفحة...`);
});

console.log(`\n✅ تم إنشاء ${count} صفحة بنجاح!\n`);
