const fs = require('fs');
const path = require('path');
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const outputDir = path.join(__dirname, 'products-pages');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
let count = 0;
products.forEach(p => {
  if (!p.id || !p.title) return;
  const slug = p.title.trim().replace(/[^\u0600-\u06FF\u0660-\u0669a-zA-Z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-${''}g,'');
  const price = parseFloat(p.price)||0;
  const salePrice = parseFloat(p.sale_price)||price;
  const discount = price!==salePrice?Math.round((price-salePrice)/price*100):0;
  const url = 'https://sooq-masr.arabsad.com/products-pages/product-'+p.id+'-'+slug+'.html';
  const stars = (r) => { const f=Math.floor(r); return '★'.repeat(f)+'☆'.repeat(5-f); };
  let reviewsHtml = '';
  if (p.reviews && p.reviews.length > 0) {
    reviewsHtml = '<div style="background:white;padding:2rem;border-radius:16px;margin-top:2rem"><h2 style="margin-bottom:1.5rem">⭐ آراء العملاء ('+p.review_count+')</h2><div style="margin-bottom:1rem;font-size:2rem;color:#f59e0b">'+p.rating+' '+stars(p.rating)+'</div>';
    p.reviews.slice(0,10).forEach(r => {
      reviewsHtml += '<div style="background:#f9fafb;padding:1rem;border-radius:8px;margin-bottom:1rem"><div style="display:flex;justify-content:space-between"><strong>'+r.reviewer_name+'</strong><span style="color:#fbbf24">'+stars(r.rating)+'</span></div><p style="margin:0.5rem 0 0">'+r.comment+'</p></div>';
    });
    reviewsHtml += '</div>';
  }
  const html = '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>'+p.title+' | سوق مصر</title><link rel="stylesheet" href="../styles.css"><style>body{background:#f5f7fa;padding-top:70px}.container{max-width:1200px;margin:2rem auto;padding:0 1rem}.product-layout{display:grid;grid-template-columns:1fr 1fr;gap:2rem;background:#fff;padding:2rem;border-radius:16px}img{width:100%;border-radius:12px}h1{font-size:1.8rem;margin-bottom:1rem}.price{font-size:2.5rem;color:#667eea;font-weight:900}.btn{display:block;width:100%;padding:1rem;background:linear-gradient(135deg,#25D366,#128C7E);color:white;border:none;border-radius:8px;font-size:1.1rem;font-weight:700;text-decoration:none;text-align:center;margin-top:1rem}</style></head><body><header><nav class="navbar"><div class="container"><a href="../index.html">🛒 سوق مصر</a></div></nav></header><div class="container"><div class="product-layout"><div><img src="'+p.image_link+'" alt="'+p.title+'"></div><div><h1>'+p.title+'</h1><div style="color:#fbbf24;margin:1rem 0">'+stars(p.rating)+' ('+p.review_count+' تقييم)</div><div class="price">'+salePrice.toFixed(2)+' ج.م</div>'+(discount?'<div style="color:#10b981;font-size:1.2rem">خصم '+discount+'%</div>':'')+'<a href="https://wa.me/201110760081" class="btn">📱 اطلب عبر واتساب</a></div></div>'+reviewsHtml+'</div></body></html>';
  fs.writeFileSync(path.join(outputDir, 'product-'+p.id+'-'+slug+'.html'), html, 'utf8');
  count++;
});
console.log('✅ تم! '+count+' صفحة');
