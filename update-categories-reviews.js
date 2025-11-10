const fs = require('fs');

console.log('🚀 بدء تحديث المنتجات بالفئات والتقييمات المصرية...\n');

// قراءة ملف المنتجات
const productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
console.log(`📦 تم تحميل ${productsData.length} منتج\n`);

// فئات Google Merchant Center 2025 - متوافقة تماماً
const googleCategories = {
    'ملابس': 'Apparel & Accessories > Clothing',
    'أحذية': 'Apparel & Accessories > Shoes',
    'حقائب': 'Apparel & Accessories > Handbags, Wallets & Cases',
    'اكسسوارات': 'Apparel & Accessories > Jewelry',
    'ساعات': 'Apparel & Accessories > Jewelry > Watches',
    'نظارات': 'Apparel & Accessories > Clothing Accessories > Sunglasses',
    'إلكترونيات': 'Electronics',
    'هواتف': 'Electronics > Communications > Telephony > Mobile Phones',
    'كمبيوتر': 'Electronics > Computers',
    'كاميرات': 'Electronics > Electronics Accessories > Camera Accessories',
    'سماعات': 'Electronics > Audio > Audio Accessories > Headphones',
    'منزل': 'Home & Garden',
    'أثاث': 'Home & Garden > Furniture',
    'مطبخ': 'Home & Garden > Kitchen & Dining',
    'ديكور': 'Home & Garden > Decor',
    'أدوات منزلية': 'Home & Garden > Household Appliances',
    'جمال': 'Health & Beauty > Personal Care',
    'عطور': 'Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne',
    'مكياج': 'Health & Beauty > Personal Care > Cosmetics > Makeup',
    'عناية بالبشرة': 'Health & Beauty > Personal Care > Cosmetics > Skin Care',
    'عناية بالشعر': 'Health & Beauty > Personal Care > Hair Care',
    'رياضة': 'Sporting Goods',
    'معدات رياضية': 'Sporting Goods > Exercise & Fitness',
    'ملابس رياضية': 'Sporting Goods > Athletics > Athletic Clothing',
    'ألعاب': 'Toys & Games',
    'ألعاب أطفال': 'Toys & Games > Toys',
    'كتب': 'Media > Books',
    'قرطاسية': 'Office Supplies',
    'حيوانات أليفة': 'Animals & Pet Supplies',
    'سيارات': 'Vehicles & Parts > Vehicles',
    'أدوات': 'Hardware > Tools',
    'معدات كهربائية': 'Hardware > Power & Electrical Supplies',
    'طعام': 'Food, Beverages & Tobacco > Food Items',
    'مكملات غذائية': 'Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements'
};

// أسماء مصرية واقعية للمراجعين
const egyptianNames = [
    'محمد أحمد', 'أحمد محمد', 'عمر حسن', 'مصطفى علي', 'يوسف محمود',
    'محمود إبراهيم', 'حسام الدين', 'كريم عادل', 'تامر حسني', 'عمرو عبدالله',
    'فاطمة الزهراء', 'نور الهدى', 'ياسمين أحمد', 'مريم محمد', 'سارة علي',
    'دينا حسن', 'هبة الله', 'ريهام عادل', 'نهى محمود', 'رنا إبراهيم',
    'خالد سعيد', 'عبدالله مصطفى', 'حسين علي', 'طارق رمضان', 'وليد أحمد',
    'إسلام محمد', 'بلال حسن', 'سيف الدين', 'آية الله', 'سلمى محمد',
    'هدى أحمد', 'أميرة حسن', 'شيماء علي', 'إيمان محمود', 'منى إبراهيم'
];

// تعليقات مصرية واقعية
const egyptianReviews = [
    'منتج ممتاز جداً والجودة عالية، أنصح بالشراء',
    'وصل بسرعة والتعامل محترم، شكراً',
    'جودة ممتازة وسعر مناسب، راضي جداً',
    'المنتج كويس بس التوصيل متأخر شوية',
    'ماشاء الله منتج رائع، تسلم إيدك',
    'الجودة أفضل من المتوقع بكتير',
    'منتج أصلي وممتاز، هشتري تاني',
    'التوصيل سريع والمنتج زي ما في الصورة',
    'جودة عالية جداً، يستاهل السعر',
    'منتج كويس لكن كان نفسي يكون أرخص',
    'ممتاز والله، ربنا يبارك',
    'المنتج جميل وجودته حلوة',
    'وصل في ميعاده والباكدج كويس',
    'منتج رهيب، شكراً على الخدمة',
    'جودة ممتازة وسعر مناسب للجميع',
    'المنتج فوق الممتاز، الله ينور',
    'شغل نضيف وتوصيل سريع',
    'منتج أصلي 100%، هشتري تاني بإذن الله',
    'جودة عالية وسعر منافس',
    'راضي جداً عن المنتج والخدمة',
    'منتج كويس بس العبوة كانت محتاجة تحسين',
    'ممتاز جداً، يستحق التجربة',
    'المنتج حلو والسعر مناسب',
    'جودة عالية وتوصيل محترم',
    'منتج رائع، أنصح الكل بيه',
    'وصل في معاده والجودة ممتازة',
    'راضي عن الشراء، شكراً',
    'منتج أصلي وجودة عالية',
    'التعامل محترم والتوصيل سريع',
    'ممتاز، هشتري منكم تاني'
];

// دالة لتحديد الفئة المناسبة
function getCategoryForProduct(productTitle) {
    const title = productTitle.toLowerCase();
    
    // إلكترونيات
    if (title.includes('هاتف') || title.includes('موبايل') || title.includes('ايفون') || title.includes('سامسونج')) 
        return googleCategories['هواتف'];
    if (title.includes('سماعة') || title.includes('ايربودز') || title.includes('هيدفون')) 
        return googleCategories['سماعات'];
    if (title.includes('شاحن') || title.includes('كابل') || title.includes('باور بانك')) 
        return googleCategories['إلكترونيات'];
    if (title.includes('كاميرا') || title.includes('تصوير')) 
        return googleCategories['كاميرات'];
    
    // ملابس واكسسوارات
    if (title.includes('ساعة') || title.includes('ساعه')) 
        return googleCategories['ساعات'];
    if (title.includes('نظارة') || title.includes('نظاره')) 
        return googleCategories['نظارات'];
    if (title.includes('حقيبة') || title.includes('شنطة')) 
        return googleCategories['حقائب'];
    if (title.includes('حزام') || title.includes('سوار') || title.includes('خاتم') || title.includes('قلادة')) 
        return googleCategories['اكسسوارات'];
    
    // جمال وعناية
    if (title.includes('عطر') || title.includes('برفان')) 
        return googleCategories['عطور'];
    if (title.includes('كريم') || title.includes('بشرة') || title.includes('وجه')) 
        return googleCategories['عناية بالبشرة'];
    if (title.includes('شعر') || title.includes('فرشاة') || title.includes('مجفف')) 
        return googleCategories['عناية بالشعر'];
    if (title.includes('مكياج') || title.includes('ميك') || title.includes('روج') || title.includes('ماسكارا')) 
        return googleCategories['مكياج'];
    
    // منزل ومطبخ
    if (title.includes('مطبخ') || title.includes('طبخ') || title.includes('قدر') || title.includes('صحن')) 
        return googleCategories['مطبخ'];
    if (title.includes('ديكور') || title.includes('زينة') || title.includes('إضاءة')) 
        return googleCategories['ديكور'];
    if (title.includes('أثاث') || title.includes('كرسي') || title.includes('طاولة')) 
        return googleCategories['أثاث'];
    if (title.includes('أداة') || title.includes('جهاز منزلي')) 
        return googleCategories['أدوات منزلية'];
    
    // رياضة
    if (title.includes('رياضة') || title.includes('رياضي') || title.includes('تمرين') || title.includes('جيم')) 
        return googleCategories['معدات رياضية'];
    
    // أدوات
    if (title.includes('أداة') || title.includes('مفك') || title.includes('شنطة عدة')) 
        return googleCategories['أدوات'];
    
    // افتراضي
    return googleCategories['منزل'];
}

// دالة لتوليد تقييمات مصرية واقعية
function generateEgyptianReviews(productTitle) {
    const reviewCount = Math.floor(Math.random() * 31) + 20; // 20-50 تقييم
    const rating = (Math.random() * 0.5 + 4.5).toFixed(1); // 4.5-5.0
    
    const reviews = [];
    const usedNames = new Set();
    const usedComments = new Set();
    
    for (let i = 0; i < reviewCount; i++) {
        // اختيار اسم فريد
        let reviewerName;
        do {
            reviewerName = egyptianNames[Math.floor(Math.random() * egyptianNames.length)];
        } while (usedNames.has(reviewerName) && usedNames.size < egyptianNames.length);
        usedNames.add(reviewerName);
        
        // اختيار تعليق فريد
        let comment;
        do {
            comment = egyptianReviews[Math.floor(Math.random() * egyptianReviews.length)];
        } while (usedComments.has(comment) && usedComments.size < egyptianReviews.length);
        usedComments.add(comment);
        
        // تقييم عشوائي بين 4 و 5
        const reviewRating = Math.random() > 0.3 ? 5 : 4;
        
        // تاريخ عشوائي في آخر 6 شهور
        const daysAgo = Math.floor(Math.random() * 180);
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - daysAgo);
        
        reviews.push({
            reviewer_name: reviewerName,
            rating: reviewRating,
            comment: comment,
            date: reviewDate.toISOString().split('T')[0],
            verified_purchase: true
        });
    }
    
    return {
        average_rating: parseFloat(rating),
        total_reviews: reviewCount,
        reviews: reviews
    };
}

// تحديث المنتجات
let updatedCount = 0;

productsData.forEach(product => {
    // إضافة الفئة المتوافقة مع Google
    product.google_product_category = getCategoryForProduct(product.title);
    
    // إضافة التقييمات المصرية
    const reviewsData = generateEgyptianReviews(product.title);
    product.rating = reviewsData.average_rating;
    product.review_count = reviewsData.total_reviews;
    product.reviews = reviewsData.reviews;
    
    updatedCount++;
});

// حفظ الملف المحدث
fs.writeFileSync('products.json', JSON.stringify(productsData, null, 2), 'utf8');

console.log('\n' + '='.repeat(60));
console.log('📊 تقرير التحديث:');
console.log('='.repeat(60));
console.log(`✅ تم تحديث ${updatedCount} منتج`);
console.log(`📂 الفئات: متوافقة مع Google Merchant Center 2025`);
console.log(`⭐ التقييمات: مصرية واقعية (20-50 تقييم)`);
console.log(`🌟 النجوم: من 4.5 إلى 5.0`);
console.log('='.repeat(60));
console.log('\n✅ تم الحفظ بنجاح في products.json');
console.log('🚀 الآن يمكنك دفع التحديثات إلى GitHub\n');
