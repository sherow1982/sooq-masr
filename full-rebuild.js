const fs = require('fs');
const path = require('path');

console.log('🔍 بدء المراجعة الشاملة والإصلاح...\n');

// 1. التحقق من products.json
console.log('1️⃣ فحص products.json...');
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
console.log(`   ✅ ${products.length} منتج`);

let validProducts = 0;
let productsWithReviews = 0;
let productsWithCategories = 0;

products.forEach(p => {
    if (p.id && p.title && p.price) validProducts++;
    if (p.reviews && Array.isArray(p.reviews) && p.reviews.length > 0) productsWithReviews++;
    if (p.google_product_category) productsWithCategories++;
});

console.log(`   ✅ ${validProducts} منتج صالح`);
console.log(`   ⭐ ${productsWithReviews} منتج به تقييمات`);
console.log(`   📂 ${productsWithCategories} منتج به فئات Google\n`);

// 2. إعادة بناء صفحات المنتجات
console.log('2️⃣ إعادة بناء صفحات المنتجات...');
const outputDir = path.join(__dirname, 'products-pages');
if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir);

function createSlug(title) {
    if (!title) return 'product';
    return title.trim()
        .replace(/[^\u0600-\u06FF\u0660-\u0669a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let result = '';
    for (let i = 0; i < full; i++) result += '★';
    if (half) result += '⯨';
    for (let i = 0; i < empty; i++) result += '☆';
    return result;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let generatedPages = 0;

products.forEach(product => {
    if (!product.id || !product.title) return;
    
    const slug = createSlug(product.title);
    const fileName = `product-${product.id}-${slug}.html`;
    
    const price = parseFloat(product.price) || 0;
    const salePrice = parseFloat(product.sale_price) || price;
    const discount = price !== salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
    const hasDiscount = discount > 0;
    
    const rating = product.rating || 4.8;
    const reviewCount = product.review_count || 0;
    
    // بناء قسم التقييمات HTML منسق
    let reviewsSection = '';
    
    if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
        const reviewCards = product.reviews.slice(0, 10).map(review => {
            const reviewerName = escapeHtml(review.reviewer_name || 'عميل');
            const reviewRating = review.rating || 5;
            const reviewComment = escapeHtml(review.comment || 'منتج ممتاز');
            const reviewDate = review.date || '2025-10-01';
            const isVerified = review.verified_purchase === true;
            
            return `
                <div style="background: linear-gradient(135deg, #f9fafb, #f3f4f6); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border-right: 4px solid #667eea;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.3rem;">
                                ${reviewerName.charAt(0)}
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #1f2937; font-size: 1rem;">${reviewerName}</div>
                                <div style="color: #fbbf24; font-size: 1.2rem;">${generateStars(reviewRating)}</div>
                            </div>
                        </div>
                        <div style="text-align: left;">
                            ${isVerified ? '<div style="background: #d1fae5; color: #059669; padding: 6px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem;">✓ عميل موثق</div>' : ''}
                            <div style="color: #9ca3af; font-size: 0.85rem;">${reviewDate}</div>
                        </div>
                    </div>
                    <p style="color: #374151; margin: 0; line-height: 1.7;">${reviewComment}</p>
                </div>
            `;
        }).join('');
        
        reviewsSection = `
            <div style="background: white; padding: 2.5rem; border-radius: 16px; margin-top: 3rem; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #f3f4f6; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; color: #1a1a1a;">⭐ آراء العملاء</h2>
                        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                            <div style="font-size: 3rem; font-weight: 900; color: #f59e0b;">${rating.toFixed(1)}</div>
                            <div>
                                <div style="font-size: 1.5rem; color: #fbbf24; margin-bottom: 0.25rem;">${generateStars(rating)}</div>
                                <div style="color: #6b7280; font-size: 0.95rem;">${reviewCount} تقييم</div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 1.5rem; border-radius: 12px; min-width: 150px;">
                        <div style="font-size: 2.5rem; font-weight: 900; color: #667eea;">${Math.round((rating / 5) * 100)}%</div>
                        <div style="color: #667eea; font-weight: 700; font-size: 0.9rem;">نسبة الرضا</div>
                    </div>
                </div>
                ${reviewCards}
            </div>
        `;
    }
    
    const productUrl = `https://sooq-masr.arabsad.com/products-pages/${fileName}`;
    const whatsappMsg = encodeURIComponent(
        `مرحباً! 👋\n\n🏪 *سوق مصر*\n━━━━━━━━━━━━━━━━━\n\nأرغب بطلب:\n\n📦 ${product.title}\n💰 ${salePrice.toFixed(2)} ج.م\n🔗 ${productUrl}\n\n━━━━━━━━━━━━━━━━━\n📋 *بيانات العميل:*\n\n✅ الاسم: _____________\n✅ الهاتف: _____________\n✅ العنوان: _____________\n✅ المحافظة: _____________\n✅ العدد: _____________\n\nشكراً 🌟`
    );
    
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(product.title)} | سوق مصر</title>
    <meta name="description" content="${escapeHtml(product.description || product.title)}">
    <link rel="stylesheet" href="../styles.css">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "${escapeHtml(product.title)}",
        "image": "${product.image_link}",
        "description": "${escapeHtml(product.description || product.title)}",
        "brand": {"@type": "Brand", "name": "سوق مصر"},
        "offers": {
            "@type": "Offer",
            "url": "${productUrl}",
            "priceCurrency": "EGP",
            "price": "${salePrice.toFixed(2)}",
            "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "${rating}",
            "reviewCount": "${reviewCount}"
        }
    }
    </script>
    <style>
        body{background:#f5f7fa;padding-top:70px;font-family:'Cairo',sans-serif}
        .container{max-width:1400px;margin:2rem auto;padding:0 1rem}
        .product-layout{display:grid;grid-template-columns:500px 1fr;gap:3rem;background:#fff;padding:3rem;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,.1)}
        .main-image{width:100%;border-radius:16px;box-shadow:0 8px 25px rgba(0,0,0,.1)}
        h1{font-size:2rem;font-weight:900;margin-bottom:1.5rem;color:#1a1a1a}
        .price-box{background:linear-gradient(135deg,#667eea,#764ba2);padding:2rem;border-radius:16px;text-align:center;color:#fff;margin-bottom:2rem}
        .price{font-size:3rem;font-weight:900}
        .btn{padding:16px 24px;border:none;border-radius:12px;font-weight:700;cursor:pointer;width:100%;font-size:1.2rem;text-decoration:none;display:block;text-align:center}
        .btn-whatsapp{background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;box-shadow:0 8px 25px rgba(37,211,102,.4)}
        .btn-whatsapp:hover{transform:translateY(-3px);box-shadow:0 12px 35px rgba(37,211,102,.5)}
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
                <img class="main-image" src="${product.image_link}" alt="${escapeHtml(product.title)}">
            </div>
            <div>
                <h1>${escapeHtml(product.title)}</h1>
                <div style="margin-bottom: 1rem; color: #fbbf24; font-size: 1.5rem;">
                    ${generateStars(rating)} <span style="color: #666;">(${reviewCount} تقييم)</span>
                </div>
                <div class="price-box">
                    <div class="price">${salePrice.toFixed(2)} ج.م</div>
                    ${hasDiscount ? `<div style="margin-top: 10px; font-size: 1.2rem;">خصم ${discount}%</div>` : ''}
                </div>
                <a href="https://wa.me/201110760081?text=${whatsappMsg}" class="btn btn-whatsapp">
                    📱 اطلب الآن عبر واتساب
                </a>
                <div style="margin-top: 2rem; color: #666; line-height: 1.8;">
                    ${escapeHtml(product.description || 'منتج أصلي بأفضل سعر')}
                </div>
            </div>
        </div>
        ${reviewsSection}
    </div>
    
    <a href="https://wa.me/201110760081?text=${whatsappMsg}" style="position: fixed; bottom: 30px; left: 30px; width: 70px; height: 70px; background: linear-gradient(135deg, #25D366, #128C7E); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: 0 12px 40px rgba(37,211,102,.6); z-index: 1000; text-decoration: none;">📱</a>
</body>
</html>`;
    
    fs.writeFileSync(path.join(outputDir, fileName), html, 'utf8');
    generatedPages++;
    
    if (generatedPages % 100 === 0) {
        console.log(`   ⏳ ${generatedPages} صفحة...`);
    }
});

console.log(`   ✅ ${generatedPages} صفحة تم إنشاؤها بنجاح\n`);

// 3. التقرير النهائي
console.log('━'.repeat(60));
console.log('📊 التقرير النهائي:');
console.log('━'.repeat(60));
console.log(`✅ المنتجات: ${products.length}`);
console.log(`✅ صفحات المنتجات: ${generatedPages}`);
console.log(`⭐ منتجات بتقييمات: ${productsWithReviews}`);
console.log(`📂 منتجات بفئات Google: ${productsWithCategories}`);
console.log('━'.repeat(60));
console.log('\n🎉 تم! الموقع جاهز للدفع إلى GitHub\n');
