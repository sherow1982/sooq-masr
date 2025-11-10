/**
 * نظام عرض التقييمات المحسّن
 * Version: 2.0
 * تم إصلاح جميع المشاكل + إضافة ميزات جديدة
 */

// متغير عام لتخزين جميع التقييمات
let allReviewsData = [];
let currentFilter = 'all'; // all, 5, 4, 3, 2, 1
let currentSort = 'recent'; // recent, oldest, highest, lowest

/**
 * عرض التقييمات في صفحات المنتجات
 */
function displayProductReviews(reviews, averageRating, totalReviews) {
    try {
        if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
            return '<div class="no-reviews" style="text-align: center; padding: 3rem; color: #9ca3af;">📝 لا توجد تقييمات بعد</div>';
        }
        
        // تخزين التقييمات للاستخدام في modal
        allReviewsData = reviews;
        
        const starsHTML = generateStarsHTML(averageRating);
        const satisfactionRate = Math.round((averageRating / 5) * 100);
        
        // حساب توزيع التقييمات
        const ratingDistribution = calculateRatingDistribution(reviews);
        
        return `
            <div class="reviews-section" style="background: white; padding: 2.5rem; border-radius: 16px; margin-top: 3rem; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
                <!-- رأس التقييمات -->
                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #f3f4f6; flex-wrap: wrap; gap: 2rem;">
                    <div style="flex: 1; min-width: 250px;">
                        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; color: #1a1a1a;">
                            ⭐ آراء العملاء
                        </h2>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 3rem; font-weight: 900; color: #f59e0b;">${averageRating.toFixed(1)}</div>
                            <div>
                                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">${starsHTML}</div>
                                <div style="color: #6b7280; font-size: 0.95rem;">${totalReviews} تقييم</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- نسبة الرضا -->
                    <div style="text-align: center; background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 1.5rem; border-radius: 12px; min-width: 150px;">
                        <div style="font-size: 2.5rem; font-weight: 900; color: #667eea;">${satisfactionRate}%</div>
                        <div style="color: #667eea; font-weight: 700; font-size: 0.9rem;">نسبة الرضا</div>
                    </div>
                    
                    <!-- توزيع التقييمات -->
                    <div style="flex: 1; min-width: 250px;">
                        ${createRatingBars(ratingDistribution, totalReviews)}
                    </div>
                </div>
                
                <!-- فلاتر وترتيب -->
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <select id="reviewsFilter" onchange="filterReviews(this.value)" style="padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; cursor: pointer;">
                        <option value="all">جميع التقييمات</option>
                        <option value="5">5 نجوم فقط</option>
                        <option value="4">4 نجوم فقط</option>
                        <option value="3">3 نجوم فقط</option>
                        <option value="2">2 نجوم فقط</option>
                        <option value="1">1 نجمة فقط</option>
                    </select>
                    
                    <select id="reviewsSort" onchange="sortReviews(this.value)" style="padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; cursor: pointer;">
                        <option value="recent">الأحدث</option>
                        <option value="oldest">الأقدم</option>
                        <option value="highest">الأعلى تقييماً</option>
                        <option value="lowest">الأقل تقييماً</option>
                    </select>
                </div>
                
                <!-- قائمة التقييمات -->
                <div id="reviewsList" class="reviews-list" style="display: grid; gap: 1.5rem;">
                    ${reviews.slice(0, 10).map(review => createReviewCard(review)).join('')}
                </div>
                
                ${reviews.length > 10 ? `
                    <button onclick="showAllReviewsModal()" style="width: 100%; margin-top: 2rem; padding: 1rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        عرض جميع التقييمات (${totalReviews})
                    </button>
                ` : ''}
            </div>
            
            <!-- Modal لعرض جميع التقييمات -->
            <div id="reviewsModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; overflow-y: auto;">
                <div style="max-width: 900px; margin: 2rem auto; background: white; border-radius: 16px; padding: 2rem; position: relative;">
                    <button onclick="closeReviewsModal()" style="position: absolute; top: 1rem; left: 1rem; background: #ef4444; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
                    <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 2rem;">جميع التقييمات</h2>
                    <div id="modalReviewsList"></div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('خطأ في عرض التقييمات:', error);
        return '<div style="text-align: center; padding: 2rem; color: #ef4444;">حدث خطأ في تحميل التقييمات</div>';
    }
}

/**
 * إنشاء بطاقة تقييم واحدة
 */
function createReviewCard(review) {
    try {
        if (!review) return '';
        
        const starsHTML = generateStarsHTML(review.rating || 0);
        const timeAgo = getTimeAgo(review.date);
        const initials = review.reviewer_name ? review.reviewer_name.charAt(0) : '?';
        const isVerified = review.verified_purchase || review.verified || false;
        
        return `
            <div class="review-card" style="background: linear-gradient(135deg, #f9fafb, #f3f4f6); padding: 1.5rem; border-radius: 12px; border-right: 4px solid #667eea; transition: all 0.3s;" onmouseover="this.style.transform='translateX(-5px)'" onmouseout="this.style.transform='translateX(0)'">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.3rem; flex-shrink: 0;">
                            ${initials}
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #1f2937; font-size: 1rem;">${review.reviewer_name || 'عميل'}</div>
                            <div style="font-size: 1.2rem; margin-top: 0.25rem;">${starsHTML}</div>
                        </div>
                    </div>
                    <div style="text-align: left;">
                        ${isVerified ? '<div style="background: #d1fae5; color: #059669; padding: 6px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; white-space: nowrap;">✓ عميل موثق</div>' : ''}
                        <div style="color: #9ca3af; font-size: 0.85rem;">${timeAgo}</div>
                    </div>
                </div>
                <p style="color: #374151; line-height: 1.7; margin: 0; font-size: 1rem;">${review.comment || ''}</p>
            </div>
        `;
    } catch (error) {
        console.error('خطأ في إنشاء بطاقة التقييم:', error);
        return '';
    }
}

/**
 * توليد HTML للنجوم
 */
function generateStarsHTML(rating) {
    try {
        const safeRating = Math.max(0, Math.min(5, parseFloat(rating) || 0));
        const fullStars = Math.floor(safeRating);
        const hasHalfStar = (safeRating % 1) >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // نجوم ممتلئة
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span style="color: #fbbf24; font-size: inherit;">★</span>';
        }
        
        // نجمة نصف ممتلئة
        if (hasHalfStar) {
            starsHTML += '<span style="color: #fbbf24; font-size: inherit; position: relative; display: inline-block;"><span style="position: absolute; overflow: hidden; width: 50%;">★</span><span style="color: #d1d5db;">★</span></span>';
        }
        
        // نجوم فارغة
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span style="color: #d1d5db; font-size: inherit;">☆</span>';
        }
        
        return starsHTML;
    } catch (error) {
        console.error('خطأ في توليد النجوم:', error);
        return '☆☆☆☆☆';
    }
}

/**
 * حساب الوقت المنقضي
 */
function getTimeAgo(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'مؤخراً';
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'اليوم';
        if (diffDays === 1) return 'أمس';
        if (diffDays === 2) return 'منذ يومين';
        if (diffDays < 7) return `منذ ${diffDays} أيام`;
        if (diffDays < 14) return 'منذ أسبوع';
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `منذ ${weeks} ${weeks === 2 ? 'أسبوعين' : 'أسابيع'}`;
        }
        if (diffDays < 60) return 'منذ شهر';
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `منذ ${months} ${months === 2 ? 'شهرين' : 'شهور'}`;
        }
        const years = Math.floor(diffDays / 365);
        return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
    } catch (error) {
        console.error('خطأ في حساب الوقت:', error);
        return 'مؤخراً';
    }
}

/**
 * حساب توزيع التقييمات
 */
function calculateRatingDistribution(reviews) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
        const rating = Math.floor(review.rating || 0);
        if (rating >= 1 && rating <= 5) {
            distribution[rating]++;
        }
    });
    return distribution;
}

/**
 * إنشاء شريط توزيع التقييمات
 */
function createRatingBars(distribution, total) {
    let html = '<div style="font-size: 0.85rem;">';
    for (let i = 5; i >= 1; i--) {
        const count = distribution[i] || 0;
        const percentage = total > 0 ? (count / total * 100).toFixed(0) : 0;
        html += `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="width: 60px;">${i} ★</span>
                <div style="flex: 1; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percentage}%; background: #fbbf24; height: 100%; transition: width 0.3s;"></div>
                </div>
                <span style="width: 50px; text-align: left; color: #6b7280;">${count} (${percentage}%)</span>
            </div>
        `;
    }
    html += '</div>';
    return html;
}

/**
 * فلترة التقييمات
 */
function filterReviews(filterValue) {
    currentFilter = filterValue;
    updateReviewsList();
}

/**
 * ترتيب التقييمات
 */
function sortReviews(sortValue) {
    currentSort = sortValue;
    updateReviewsList();
}

/**
 * تحديث قائمة التقييمات
 */
function updateReviewsList() {
    let filtered = [...allReviewsData];
    
    // الفلترة
    if (currentFilter !== 'all') {
        const rating = parseInt(currentFilter);
        filtered = filtered.filter(r => Math.floor(r.rating) === rating);
    }
    
    // الترتيب
    switch(currentSort) {
        case 'recent':
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'highest':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            filtered.sort((a, b) => a.rating - b.rating);
            break;
    }
    
    const reviewsList = document.getElementById('reviewsList');
    if (reviewsList) {
        if (filtered.length === 0) {
            reviewsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #9ca3af;">لا توجد تقييمات تطابق الفلتر</div>';
        } else {
            reviewsList.innerHTML = filtered.slice(0, 10).map(review => createReviewCard(review)).join('');
        }
    }
}

/**
 * عرض modal لجميع التقييمات
 */
function showAllReviewsModal() {
    const modal = document.getElementById('reviewsModal');
    const modalList = document.getElementById('modalReviewsList');
    
    if (modal && modalList) {
        modalList.innerHTML = allReviewsData.map(review => createReviewCard(review)).join('');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * إغلاق modal
 */
function closeReviewsModal() {
    const modal = document.getElementById('reviewsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// إغلاق modal عند الضغط خارجه
if (typeof window !== 'undefined') {
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('reviewsModal');
        if (e.target === modal) {
            closeReviewsModal();
        }
    });
}

// تصدير للاستخدام في صفحات المنتجات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        displayProductReviews,
        createReviewCard,
        generateStarsHTML,
        getTimeAgo,
        filterReviews,
        sortReviews,
        showAllReviewsModal,
        closeReviewsModal
    };
}

console.log('✅ reviews-display.js v2.0 - تم التحميل بنجاح');