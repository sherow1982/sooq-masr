// نظام الطلب عبر الواتساب - محدث
const WHATSAPP_NUMBER = "201110760081";
const SHIPPING_COST = 60; // تكلفة الشحن بالجنيه

function orderViaWhatsApp(product) {
    showOrderForm(product);
}

function showOrderForm(product) {
    const formHTML = `
        <div id="orderFormOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
            overflow-y: auto;
            padding: 20px;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 16px;
                max-width: 500px;
                width: 100%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
                margin: auto;
            ">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #333; margin-bottom: 10px; font-size: 28px;">📱 أطلب عبر الواتساب</h2>
                    <p style="color: #666; font-size: 14px;">أكمل البيانات وسنتواصل معك فوراً</p>
                </div>

                <!-- معلومات المنتج -->
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                    border-right: 4px solid #25D366;
                ">
                    <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
                        <img src="${product.image}" alt="${product.title}" 
                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${product.title}</h4>
                            <div style="color: #FF6B35; font-weight: bold; font-size: 20px;">${product.price} جنيه</div>
                        </div>
                    </div>
                    <div style="border-top: 1px dashed #ddd; padding-top: 12px; margin-top: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #666;">سعر المنتج:</span>
                            <span style="font-weight: bold;">${product.price} جنيه</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #666;">الشحن:</span>
                            <span style="font-weight: bold;">${SHIPPING_COST} جنيه</span>
                        </div>
                        <div id="quantityDisplay" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #666;">الكمية:</span>
                            <span style="font-weight: bold;">1 قطعة</span>
                        </div>
                        <div style="border-top: 2px solid #25D366; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between;">
                            <span style="color: #333; font-weight: bold;">الإجمالي:</span>
                            <span id="totalPrice" style="color: #25D366; font-weight: bold; font-size: 20px;">${product.price + SHIPPING_COST} جنيه</span>
                        </div>
                    </div>
                </div>

                <form id="whatsappOrderForm" onsubmit="submitWhatsAppOrder(event, ${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    <!-- الاسم الكامل -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            الاسم الكامل <span style="color: red;">*</span>
                        </label>
                        <input type="text" name="customerName" required
                               placeholder="مثال: محمد أحمد علي"
                               style="
                                   width: 100%;
                                   padding: 12px 15px;
                                   border: 2px solid #e0e0e0;
                                   border-radius: 8px;
                                   font-size: 15px;
                                   box-sizing: border-box;
                               ">
                    </div>

                    <!-- رقم الهاتف -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            رقم الهاتف <span style="color: red;">*</span>
                        </label>
                        <input type="tel" name="phoneNumber" required
                               placeholder="01XXXXXXXXX"
                               pattern="[0-9]{11}"
                               style="
                                   width: 100%;
                                   padding: 12px 15px;
                                   border: 2px solid #e0e0e0;
                                   border-radius: 8px;
                                   font-size: 15px;
                                   box-sizing: border-box;
                               ">
                    </div>

                    <!-- هاتف بديل -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            هاتف بديل (اختياري)
                        </label>
                        <input type="tel" name="alternatePhone"
                               placeholder="01XXXXXXXXX (اختياري)"
                               pattern="[0-9]{11}"
                               style="
                                   width: 100%;
                                   padding: 12px 15px;
                                   border: 2px solid #e0e0e0;
                                   border-radius: 8px;
                                   font-size: 15px;
                                   box-sizing: border-box;
                               ">
                    </div>

                    <!-- العنوان -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            العنوان بالتفصيل <span style="color: red;">*</span>
                        </label>
                        <textarea name="address" required rows="3"
                                  placeholder="المحافظة - المدينة - الشارع - رقم العمارة - الدور - الشقة"
                                  style="
                                      width: 100%;
                                      padding: 12px 15px;
                                      border: 2px solid #e0e0e0;
                                      border-radius: 8px;
                                      font-size: 15px;
                                      resize: vertical;
                                      font-family: inherit;
                                      box-sizing: border-box;
                                  "></textarea>
                    </div>

                    <!-- عدد القطع -->
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                            عدد القطع المطلوبة <span style="color: red;">*</span>
                        </label>
                        <input type="number" name="quantity" required min="1" value="1"
                               onchange="updateTotal(this.value, ${product.price})"
                               style="
                                   width: 100%;
                                   padding: 12px 15px;
                                   border: 2px solid #e0e0e0;
                                   border-radius: 8px;
                                   font-size: 15px;
                                   box-sizing: border-box;
                               ">
                    </div>

                    <!-- الأزرار -->
                    <div style="display: flex; gap: 10px;">
                        <button type="button" onclick="closeOrderForm()"
                                style="
                                    flex: 1;
                                    padding: 15px;
                                    background: #e0e0e0;
                                    color: #333;
                                    border: none;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">
                            إلغاء
                        </button>
                        <button type="submit"
                                style="
                                    flex: 2;
                                    padding: 15px;
                                    background: linear-gradient(135deg, #25D366, #128C7E);
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 8px;
                                ">
                            📱 إرسال الطلب
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            #whatsappOrderForm input:focus,
            #whatsappOrderForm textarea:focus {
                outline: none;
                border-color: #25D366;
            }
            #whatsappOrderForm button[type="submit"]:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(37, 211, 102, 0.4);
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);
}

function updateTotal(quantity, productPrice) {
    const total = (productPrice * parseInt(quantity)) + SHIPPING_COST;
    document.getElementById('totalPrice').textContent = total + ' جنيه';
    document.getElementById('quantityDisplay').innerHTML = `
        <span style="color: #666;">الكمية:</span>
        <span style="font-weight: bold;">${quantity} قطعة</span>
    `;
}

function closeOrderForm() {
    const overlay = document.getElementById('orderFormOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    }
}

function submitWhatsAppOrder(event, product) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const customerName = formData.get('customerName');
    const phoneNumber = formData.get('phoneNumber');
    const alternatePhone = formData.get('alternatePhone') || 'غير متوفر';
    const address = formData.get('address');
    const quantity = formData.get('quantity');
    
    const productTotal = product.price * parseInt(quantity);
    const totalPrice = productTotal + SHIPPING_COST;
    
    const productUrl = window.location.href;
    
    const message = `
🛒 *طلب جديد من سوق مصر*

━━━━━━━━━━━━━━━━━━━━
📦 *تفاصيل المنتج:*
• الاسم: ${product.title}
• رابط المنتج: ${productUrl}
• سعر الوحدة: ${product.price} جنيه
• الكمية المطلوبة: ${quantity} قطعة
• إجمالي المنتجات: ${productTotal} جنيه
• تكلفة الشحن: ${SHIPPING_COST} جنيه
• *الإجمالي الكلي: ${totalPrice} جنيه*

━━━━━━━━━━━━━━━━━━━━
👤 *بيانات العميل:*
• الاسم: ${customerName}
• الهاتف: ${phoneNumber}
• هاتف بديل: ${alternatePhone}
• العنوان: ${address}

━━━━━━━━━━━━━━━━━━━━
✅ *يرجى تأكيد الطلب والتواصل مع العميل*
    `.trim();
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    closeOrderForm();
    showSuccessMessage();
}

function showSuccessMessage() {
    const successHTML = `
        <div id="successMessage" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #25D366, #128C7E);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideInRight 0.5s ease;
        ">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">✅</span>
                <div>
                    <div style="font-weight: bold; font-size: 18px; margin-bottom: 5px;">تم إرسال الطلب!</div>
                    <div style="font-size: 14px; opacity: 0.9;">سيتم التواصل معك قريباً عبر الواتساب</div>
                </div>
            </div>
        </div>
        <style>
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
    
    setTimeout(() => {
        const msg = document.getElementById('successMessage');
        if (msg) {
            msg.style.animation = 'slideInRight 0.5s ease reverse';
            setTimeout(() => msg.remove(), 500);
        }
    }, 4000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
