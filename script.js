// Authentication functions
function checkAuthentication() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        // No user logged in, redirect to login page
        window.location.href = 'login.html';
        return null;
    }

    try {
        const user = JSON.parse(currentUser);
        return user;
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return null;
    }
}


// Reset all accounts to default
function resetAccounts() {
    if (confirm('Bạn có chắc chắn muốn reset tất cả tài khoản về mặc định?')) {
        localStorage.removeItem('userAccounts');
        initializeAccounts();
        alert('Đã reset tài khoản thành công! Bây giờ bạn có thể đăng nhập với:\n\nuser/123\nadmin/456\ngiamsat/789');
    }
}

// Debug function to check accounts
function debugAccounts() {
    const accounts = localStorage.getItem('userAccounts');
    if (accounts) {
        const parsed = JSON.parse(accounts);
        console.log('Current accounts:', parsed);
        alert('Tài khoản hiện tại:\n' + JSON.stringify(parsed, null, 2));
    } else {
        alert('Không có tài khoản nào!');
    }
}

function displayUserInfo() {
    const user = checkAuthentication();
    if (user) {
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `${user.name} (${user.role})`;
        }

        // Show/hide report button based on role
        const reportButton = document.querySelector('button[onclick="showDailyReport()"]');

        if (reportButton) {
            const allowedRoles = ['admin', 'supervisor'];
            reportButton.style.display = allowedRoles.includes(user.role) ? 'flex' : 'none';
        }

        // Show/hide user management button based on role
        const userManagementBtn = document.getElementById('userManagementBtn');
        if (userManagementBtn) {
            if (user.role === 'admin') {
                userManagementBtn.classList.remove('hidden');
            } else {
                userManagementBtn.classList.add('hidden');
            }
        }

        // Show welcome message
        showWelcomeMessage(user);
    }
}

function showWelcomeMessage(user) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const welcomeText = document.getElementById('welcomeText');

    if (welcomeMessage && welcomeText) {
        welcomeText.textContent = `Chào mừng ${user.name}! Bạn đã đăng nhập với quyền ${user.role === 'admin' ? 'quản trị viên' : 'người dùng'}.`;
        welcomeMessage.classList.remove('hidden');

        // Auto hide after 5 seconds
        setTimeout(() => {
            hideWelcomeMessage();
        }, 5000);
    }
}

function hideWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.classList.add('hidden');
    }
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Back to top button
var btn = $('#backtotop');

$(window).scroll(function () {
    if ($(window).scrollTop() > 300) {
        btn.addClass('show');
    } else {
        btn.removeClass('show');
    }
});

btn.on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, '300');
});

window.onload = function () {
    document.querySelector('.preloader').style.display = 'none';
}

// User's current price balance
// let userprice = 10000;

// Adjust quantity for a product
// function adjustQuantity(productId, change) {
//     const input = document.getElementById(`${productId}-qty`);
//     let newValue = parseInt(input.value) + change;
//     if (newValue < 0) newValue = 0;
//     input.value = newValue;
//     updateSummary();
// }

// Update the summary section
// function updateSummary() {
//     let subtotal = 0;
//     let hasItems = false;
//     const selectedItemsContainer = document.getElementById('selectedItems');

//     // Clear previous items
//     selectedItemsContainer.innerHTML = '';

//     // Calculate subtotal and build selected items list
//     for (const [productId, product] of Object.entries(products)) {
//         const quantity = parseInt(document.getElementById(`${productId}-qty`).value);
//         if (quantity > 0) {
//             hasItems = true;
//             const itemprice = quantity * product.price;
//             subtotal += itemprice;

//             // Add item to the selected items list
//             const itemElement = document.createElement('div');
//             itemElement.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-lg';
//             itemElement.innerHTML = `
//                 <div>
//                     <span class="font-medium">${product.name}</span>
//                     <span class="text-sm text-gray-500 block">${product.price} Phiếu × ${quantity}</span>
//                 </div>
//                 <span class="font-medium"> = ${itemprice} Phiếu</span>
//             `;
//             selectedItemsContainer.appendChild(itemElement);
//         }
//     }

//     // If no items selected, show placeholder
//     if (!hasItems) {
//         selectedItemsContainer.innerHTML = '<p class="text-gray-500 italic">Không có sản phẩm được chọn</p>';
//     }

//     // Update summary values
//     document.getElementById('subtotal').textContent = `${subtotal.toLocaleString()} Phiếu`;

// }

// Process the price exchange
// function processExchange() {
//     const subtotal = parseInt(document.getElementById('subtotal').textContent.replace(/,| pts/g, ''));
//     // const remaining = userprice - subtotal;

//     if (subtotal > 0) {
//         // Collect exchange data
//         const exchangeData = {
//             timestamp: new Date().toISOString(),
//             totalPrice: subtotal,
//             items: {}
//         };

//         // Build receipt and collect items
//         const receiptItemsContainer = document.getElementById('receiptItems');
//         receiptItemsContainer.innerHTML = '';

//         for (const [productId, product] of Object.entries(products)) {
//             const quantity = parseInt(document.getElementById(`${productId}-qty`).value);
//             if (quantity > 0) {
//                 exchangeData.items[productId] = quantity;

//                 const itemElement = document.createElement('div');
//                 itemElement.className = 'flex justify-between';
//                 itemElement.innerHTML = `
//                     <span>${product.name} × ${quantity}</span>
//                     <span> = ${(quantity * product.price).toLocaleString()} Phiếu</span>
//                 `;
//                 receiptItemsContainer.appendChild(itemElement);
//             }
//         }

//         // Add to transaction storage
//         addTransaction(exchangeData);

//         // Update receipt totals
//         document.getElementById('receiptTotal').textContent = `${subtotal.toLocaleString()} Phiếu`;
//         // document.getElementById('receiptBalance').textContent = `${remaining.toLocaleString()} pts`;

//         // Show receipt and hide summary
//         // document.getElementById('receiptSection').classList.remove('hidden');
//         // document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.add('hidden');

//         // Update price display in header
//         // document.getElementById('totalPrice').textContent = remaining.toLocaleString();
//     }
// }

// Print the exchange receipt
function printReceipt(type) {
    
    // 1. Xác định ID dựa trên loại phương tiện
    const sectionId = type === 'car' ? 'receiptSectionCar' : 'receiptSectionMoto';
    const passcodeId = type === 'car' ? 'passcodeCar' : 'passcodeMoto';
    const iconClass = type === 'car' ? 'fa-car-side' : 'fa-motorcycle';
    const serialId = type === 'car' ? 'serialCar' : 'serialMoto';
    
    const prefix = type === 'car' ? 'GC' : 'GM';

    // 2. Lấy dữ liệu từ giao diện
    const sectionElement = document.getElementById(sectionId);
    const serialElement = document.getElementById(serialId);
    const passcode = document.getElementById(passcodeId).value;

    // Lấy danh sách sản phẩm (nếu có id receiptItems bên trong section đó)
    const itemsHtml = sectionElement.querySelector('#receiptItems') ?
        sectionElement.querySelector('#receiptItems').innerHTML :
        '<p>Dịch vụ giữ xe miễn phí</p>';

    
    saveTransaction(passcode, type, 4000);
    

    // 3. Tạo cửa sổ in
    const printWindow = window.open('', '', 'width=800,height=600');

    printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>IN PHIẾU GIỮ XE</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <style>
                        body { font-family: 'Roboto', monospace; padding: 20px; color: #000000; }
                        .receipt-container { max-width: 300px; margin: 0 auto; border: 1px dashed #ccc; padding: 15px; }
                        .header { text-align: center; border-bottom: 1px solid #eee; pb: 10px; mb: 10px; }
                        .logo-text { font-weight: bold; font-size: 1rem; }
                        .info { font-size: 0.5rem; margin: 5px 0; }
                        .main-title { text-align: center; font-weight: bold; margin: 15px 0; font-size: 1rem; border-top: 1px double #000; border-bottom: 1px double #000; padding: 5px 0; }
                        .details { font-size: 0.5rem; line-height: 1.2; }
                        .passcode { font-size: 0.8rem; font-weight: bold; text-align: center; display: block; margin: 10px 0; }
                        .footer { text-align: center; font-size: 0.5rem; margin-top: 20px; border-top: 1px solid #eee; pt: 10px; }
                        .vehicle-icon { font-size: 1.5rem; text-align: center; margin: 10px 0; display: block; }
                        .receipt-logo { display: flex; justify-content: center; align-items: center; margin-bottom: 5px; }

                        .receipt-logo img {
                            width: 100%;
                            max-width: 40px;
                            height: auto;
                        }

                        @media print {
                            body { padding: 0; }
                            .receipt-container { border: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="header">
                            <div class="receipt-logo">
                                <img src="img/gigamall-logo.png" alt="gigamall logo">
                            </div>
                            <div class="logo-text">GIGAMALL VIỆT NAM</div>
                            <div class="info">240-242 Phạm Văn Đồng, Phường Hiệp Bình, TP. Thủ Đức, TP. Hồ Chí Minh</div>
                            <div class="info">Hotline: 028 666 00 222</div>
                        </div>
        
                        <div class="main-title">PHIẾU GIỮ XE MIỄN PHÍ</div>
                        
                        <div class="vehicle-icon">
                            <i class="fas ${iconClass}"></i>
                        </div>
        
                        <div class="details">
                            <div><b>Số phiếu:</b> ${prefix}-${serialElement.textContent}</div>
                            <div><b>Thời gian:</b> ${document.getElementById('current-time').textContent}</div>
                            <div><b>Mã số:</b> <span class="passcode">${passcode}</span></div>
                            <hr style="border: 0.5px dashed #ccc">
                            <div id="printItems">${itemsHtml}</div>
                        </div>
        
                        <div class="footer">
                            <p>Vui lòng giữ phiếu cẩn thận.</p>
                            <p>Chúc quý khách một ngày vui vẻ!</p>
                        </div>
                    </div>
                </body>
                </html>
            `);

    printWindow.document.close();

    // Đợi ảnh/CSS load xong rồi in
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 300);
}
/**
 * Hàm tạo passcode dùng chung
 * @param {string} btnSelector - Class hoặc ID của nút bấm
 * @param {string} displayId - ID của phần tử hiển thị kết quả
 */
function generatePasscode(btnSelector, displayId, type) {

    const btn = document.querySelector(btnSelector);
    const inputElement = document.getElementById(displayId);

    // Tự động focus vào ô input khi trang vừa tải xong
    window.onload = () => inputElement.focus();

    // Lắng nghe sự kiện quét từ máy QR
    inputElement.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Chặn hành động xuống dòng mặc định
            
            const scannedValue = this.value.trim();
            
            if (scannedValue) {
                showPreview(scannedValue);
            }
        }
    });


    // 1. Hiệu ứng nút bấm (Thêm và tự động xóa sau 200ms)
    btn.classList.add('btn-clicked');
    setTimeout(() => btn.classList.remove('btn-clicked'), 2000);

    // 2. Cấu hình
    // const length = 10;
    // const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    // let result = "";

    // 3. Tạo passcode ngẫu nhiên
    // for (let i = 0; i < length; i++) {
    //     result += charset.charAt(Math.floor(Math.random() * charset.length));
    // }

    // 4. Hiển thị kết quả
    // displayElement.innerText = result;

    const carSection = document.getElementById('receiptSectionCar');
    const motoSection = document.getElementById('receiptSectionMoto');

    if (type === 'car') {
        carSection.classList.remove('hidden'); // Hiện Ô tô
        motoSection.classList.add('hidden');    // Ẩn Xe máy
    } else if (type === 'moto') {
        motoSection.classList.remove('hidden'); // Hiện Xe máy
        carSection.classList.add('hidden');    // Ẩn Ô tô
    }
}

// Reset the exchange form
// function resetExchange() {
//     // Reset all quantities to 0
//     for (const productId of Object.keys(products)) {
//         document.getElementById(`${productId}-qty`).value = 0;
//     }

//     // Update summary
//     updateSummary();

//     // Show summary and hide other sections
//     document.getElementById('receiptSectionMoto').classList.add('hidden');
//     document.getElementById('receiptSectionCar').classList.add('hidden');
//     document.getElementById('dailyReportSection').classList.add('hidden');
//     // document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.remove('hidden');
// }


// Initialize event listeners for direct input changes
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication first
    const user = checkAuthentication();
    if (!user) {
        return; // Will redirect to login page
    }

    // Display user information
    displayUserInfo();

    // Initialize transaction storage
    initializeTransactionStorage();

    // Set current date in date input
    const dateInput = document.getElementById('reportDateInput');
    if (dateInput) {
        dateInput.value = getCurrentDate();
    }

    for (const productId of Object.keys(products)) {
        document.getElementById(`${productId}-qty`).addEventListener('input', function () {
            if (this.value < 0) this.value = 0;
            updateSummary();
        });
    }

    // Show notification about data storage
    if (allTransactions.length > 0) {
        showNotification(`Đã tải ${allTransactions.length} dữ liệu thành công!`, 'success');
    }

    // Add event listener for user creation form
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', createUser);
    }
});


// Product price values
const products = {
    moto: { name: "Xe Máy", price: 4000 },
    oto: { name: "Xe Ô tô", price: 30000 },
};

// Hàm lấy danh sách giao dịch cũ từ localStorage hoặc tạo mảng mới nếu chưa có
function getTransactions() {
    const data = localStorage.getItem('transactionHistory');
    return data ? JSON.parse(data) : [];
}

// Hàm lưu giao dịch mới
function saveTransaction(scannedValue, vehicleType, price) {
    const transactions = getTransactions();
    const serialId = type === 'car' ? 'serialCar' : 'serialMoto';
    const prefix = type === 'car' ? 'GC' : 'GM';

    const serialElement = document.getElementById(serialId);
    
    // 1. Tạo số thứ tự GP-xxxxx
    let currentCount = localStorage.getItem('lastSerial') ? parseInt(localStorage.getItem('lastSerial')) : 1;
    const formattedSerial = prefix + "-" + currentCount.toString().padStart(9, '0');


    document.getElementById(serialId).innerText = formattedSerial;
    serialElement.innerText = formattedSerial;
    // Và sau khi tăng currentCount++, hãy lưu lại:
    currentCount += 1;
    localStorage.setItem('lastSerial', currentCount);
    

    // 2. Tạo đối tượng giao dịch
    const newTransaction = {
        sophieu: formattedSerial,
        date: new Date().toLocaleString('vi-VN'), // Lưu ngày giờ Việt Nam
        type: vehicleType, // 'Moto' hoặc 'Car'
        code: scannedValue,
        price: price
    };
    // 3. Thêm vào mảng và lưu lại vào localStorage
    transactions.push(newTransaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactions));

    console.log("Đã lưu giao dịch:", newTransaction);
    return newTransaction;
}

// Global transaction storage
let allTransactions = [];
let currentReportDate = getCurrentDate();

// Initialize transaction storage from localStorage
// function initializeTransactionStorage() {
//     const savedTransactions = localStorage.getItem('allTransactions');
//     if (savedTransactions) {
//         try {
//             allTransactions = JSON.parse(savedTransactions);
//         } catch (error) {
//             console.error('Error parsing saved transactions:', error);
//             allTransactions = [];
//         }
//     }
// }

// Save all transactions to localStorage
function saveAllTransactions() {
    localStorage.setItem('allTransactions', JSON.stringify(allTransactions));
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Get transactions for a specific date
function getTransactionsByDate(date) {
    return allTransactions.filter(transaction => {
        const transactionDate = transaction.timestamp.split('T')[0];
        return transactionDate === date;
    });
}

// Calculate totals for a specific date
function calculateTotalsForDate(date) {
    const transactions = getTransactionsByDate(date);
    const totals = {
        totalExchanges: transactions.length,
        totalPrice: 0,
        totalItems: 0,
        products: {}
    };

    transactions.forEach(transaction => {
        totals.totalPrice += transaction.totalPrice;

        for (const [productId] of Object.entries(transaction.items)) {
            const product = products[productId];
            if (!totals.products[productId]) {
                totals.products[productId] = {
                    name: product.name,
                    quantity: 0,
                    price: 0
                };
            }
            totals.products[productId].quantity += quantity;
            totals.products[productId].price += quantity * product.price;
            totals.totalItems += quantity;
        }
    });

    return totals;
}

// Add transaction to storage
function addTransaction(transactionData) {
    const user = checkAuthentication();
    if (user) {
        transactionData.user = user.name;
        transactionData.userRole = user.role;
    }

    allTransactions.push(transactionData);
    saveAllTransactions();
}


// Daily Report Functions
function showDailyReport() {
    const user = checkAuthentication();
    if (!user) {
        return;
    }

    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'supervisor') {
        showNotification('Chỉ admin mới có quyền truy cập báo cáo!', 'error');
        return;
    }
     const sections = [
        "receiptSectionMoto",
        "receiptSectionCar",
        "dailyReportSection",
        "userManagement"
     ];

    // Hide other sections
     sections.forEach(id =>{
        const el = document.getElementById(id);
        if (el)
            el.classList.add('hidden');
     });
    // document.getElementById('receiptSectionMoto').classList.add('hidden');
    // document.getElementById('receiptSectionCar').classList.add('hidden');
    // document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.add('hidden');

    // Show daily report section
    const dailyReport = document.getElementById('dailyReportSection');
    if (dailyReport){
        dailyReport.classList.remove('hidden');
    }
    // document.getElementById('dailyReportSection').classList.remove('hidden');

    // Update report data for current date
    updateDailyReportDisplay(currentReportDate);
}

function hideDailyReport() {
    // Hide daily report section
    document.getElementById('dailyReportSection').classList.add('hidden');

    // Show summary section
    // document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.remove('hidden');
}

function updateDailyReportDisplay(date = currentReportDate) {
    currentReportDate = date;
    const totals = calculateTotalsForDate(date);
    

    // Update summary cards
    document.getElementById('totalExchanges').textContent = totals.totalExchanges;
    document.getElementById('totalPrice').textContent = totals.totalPrice.toLocaleString();
    document.getElementById('totalItems').textContent = totals.totalItems;


    // Update date
    const reportDate = new Date(date);
    document.getElementById('reportDate').textContent = reportDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update date input
    const dateInput = document.getElementById('reportDateInput');
    if (dateInput) {
        dateInput.value = date;
    }

    // Update product table
    const tableBody = document.getElementById('reportTableBody');
    tableBody.innerHTML = '';

    if (Object.keys(totals.products).length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="px-4 py-3 text-center text-gray-500">Không có dữ liệu</td></tr>';
    } else {
        for (const [productId, productData] of Object.entries(totals.products)) {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200';
            row.innerHTML = `
                <td class="px-4 py-3 text-gray-800 font-medium">${productData.name}</td>
                <td class="px-4 py-3 text-center text-gray-700">${productData.quantity}</td>
                <td class="px-4 py-3 text-center text-gray-700">${productData.price.toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        }
    }

    // Update transaction history
    updateTransactionHistory(date);
}

function updateTransactionHistory(date) {
    const transactions = getTransactionsByDate(date);
    const historyBody = document.getElementById('transactionHistoryBody');
    historyBody.innerHTML = '';

    if (transactions.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">Không có giao dịch nào</td></tr>';
        return;
    }

    // Sort transactions by timestamp (newest first)
    const sortedTransactions = transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Show only the last 10 transactions
    const recentTransactions = sortedTransactions.slice(0, 10);

    recentTransactions.forEach(transaction => {
        const transactionTime = new Date(transaction.timestamp).toLocaleString('vi-VN');
        const user = transaction.user || 'N/A';

        // Create product list
        const productList = Object.entries(transaction.items)
            .map(([productId, quantity]) => {
                const product = products[productId];
                return `${product.name} (${quantity})`;
            })
            .join(', ');

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-gray-700 text-sm">${transactionTime}</td>
            <td class="px-4 py-3 text-gray-700 font-medium">${user}</td>
            <td class="px-4 py-3 text-center text-gray-700 font-medium">${transaction.totalPrice.toLocaleString()}</td>
            <td class="px-4 py-3 text-gray-700 text-sm">${productList}</td>
        `;
        historyBody.appendChild(row);
    });
}

// Date filter functions
function changeReportDate(direction) {
    const currentDate = new Date(currentReportDate);

    if (direction === 'prev') {
        currentDate.setDate(currentDate.getDate() - 1);
    } else if (direction === 'next') {
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const newDate = currentDate.toISOString().split('T')[0];
    updateDailyReportDisplay(newDate);
}

function selectReportDate() {
    const dateInput = document.getElementById('reportDateInput');
    if (dateInput && dateInput.value) {
        updateDailyReportDisplay(dateInput.value);
    }
}

// Get available dates with transactions
function getAvailableDates() {
    const dates = new Set();
    allTransactions.forEach(transaction => {
        const date = transaction.timestamp.split('T')[0];
        dates.add(date);
    });
    return Array.from(dates).sort().reverse();
}

// Show date picker with available dates
function showDatePicker() {
    const availableDates = getAvailableDates();
    if (availableDates.length === 0) {
        showNotification('Không có dữ liệu giao dịch nào!', 'info');
        return;
    }

    const dateInput = document.getElementById('reportDateInput');
    if (dateInput) {
        dateInput.focus();
    }
}

function exportReport() {
    const transactions = getTransactionsByDate(currentReportDate);
    const totals = calculateTotalsForDate(currentReportDate);

    const reportData = {
        date: currentReportDate,
        totals: totals,
        transactions: transactions
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `daily-report-${currentReportDate}.json`;
    link.click();
}

function exportReportExcel() {
    const exportBtn = event.target;
    const originalContent = exportBtn.innerHTML;

    // Show loading state
    exportBtn.innerHTML = '<span class="export-loading mr-2"></span>Đang xuất...';
    exportBtn.disabled = true;

    try {
        const transactions = getTransactionsByDate(currentReportDate);
        const totals = calculateTotalsForDate(currentReportDate);

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
            ['BÁO CÁO HÀNG NGÀY - GIGAMALL'],
            [''],
            ['Ngày:', currentReportDate],
            ['Tổng giao dịch:', totals.totalExchanges],
            ['Tổng phiếu:', totals.totalPrice],
            ['Tổng sản phẩm:', totals.totalItems],
            [''],
            ['CHI TIẾT SẢN PHẨM'],
            ['Sản phẩm', 'Số lượng', 'Phiếu']
        ];

        // Add product details
        for (const [productId, productData] of Object.entries(totals.products)) {
            summaryData.push([
                productData.name,
                productData.quantity,
                productData.price
            ]);
        }

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

        // Set column widths
        summaryWs['!cols'] = [
            { width: 20 },
            { width: 12 },
            { width: 12 },
            { width: 15 }
        ];

        // Add summary sheet to workbook
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Tổng hợp');

        // Detailed transactions sheet
        if (transactions.length > 0) {
            const detailData = [
                ['CHI TIẾT GIAO DỊCH'],
                [''],
                ['Thời gian', 'Người dùng', 'Tổng phiếu', 'Sản phẩm', 'Số lượng', 'Phiếu']
            ];

            transactions.forEach((transaction, index) => {
                const exchangeTime = new Date(transaction.timestamp).toLocaleString('vi-VN');

                Object.entries(transaction.items).forEach(([productId, quantity], itemIndex) => {
                    const product = products[productId];
                    const itemprice = quantity * product.price;

                    detailData.push([
                        itemIndex === 0 ? exchangeTime : '', // Only show time for first item
                        itemIndex === 0 ? (transaction.user || 'N/A') : '', // Only show user for first item
                        itemIndex === 0 ? transaction.totalPrice : '', // Only show total for first item
                        product.name,
                        quantity,
                        itemprice
                    ]);
                });

                // Add empty row between transactions
                if (index < transactions.length - 1) {
                    detailData.push(['', '', '', '', '', '']);
                }
            });

            const detailWs = XLSX.utils.aoa_to_sheet(detailData);

            // Set column widths for detail sheet
            detailWs['!cols'] = [
                { width: 20 },
                { width: 15 },
                { width: 12 },
                { width: 20 },
                { width: 12 },
                { width: 12 }
            ];

            // Add detail sheet to workbook
            XLSX.utils.book_append_sheet(wb, detailWs, 'Chi tiết giao dịch');
        }

        // Generate filename with current date
        const fileName = `bao-cao-ngay-${currentReportDate}.xlsx`;

        // Save the file
        XLSX.writeFile(wb, fileName);

        // Show success message
        showNotification('Xuất Excel thành công!', 'success');

    } catch (error) {
        console.error('Error exporting Excel:', error);
        showNotification('Có lỗi khi xuất Excel!', 'error');
    } finally {
        // Restore button state
        exportBtn.innerHTML = originalContent;
        exportBtn.disabled = false;
    }
}

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    notification.innerHTML = `
        <div class="flex items-center ${bgColor} text-white p-3 rounded-lg">
            <i class="fas ${icon} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function clearDailyReport() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu giao dịch?')) {
        allTransactions = [];
        saveAllTransactions();
        updateDailyReportDisplay(currentReportDate);
        showNotification('Đã xóa tất cả dữ liệu giao dịch!', 'success');
    }
}

// Get statistics for all time
function getAllTimeStats() {
    const stats = {
        totalTransactions: allTransactions.length,
        totalPrice: 0,
        totalItems: 0,
        uniqueUsers: new Set(),
        products: {}
    };

    allTransactions.forEach(transaction => {
        stats.totalPrice += transaction.totalPrice;
        if (transaction.user) {
            stats.uniqueUsers.add(transaction.user);
        }

        for (const [productId, quantity] of Object.entries(transaction.items)) {
            if (quantity > 0) {
                const product = products[productId];
                if (!stats.products[productId]) {
                    stats.products[productId] = {
                        name: product.name,
                        quantity: 0,
                        price: 0
                    };
                }
                stats.products[productId].quantity += quantity;
                stats.products[productId].price += quantity * product.price;
                stats.totalItems += quantity;
            }
        }
    });

    stats.uniqueUsers = stats.uniqueUsers.size;
    return stats;
}

// Show all time statistics
function showAllTimeStats() {
    const stats = getAllTimeStats();
    const message = `
        📊 Thống kê tổng quan:
        • Tổng giao dịch: ${stats.totalTransactions}
        • Tổng phiếu: ${stats.totalPrice.toLocaleString()}
        • Tổng sản phẩm: ${stats.totalItems}
        • Người dùng: ${stats.uniqueUsers}
    `;

    alert(message);
}

// JavaScript to dynamically display the current date and time
const currentTimeElement = document.getElementById('current-time');
const now = new Date();

// Format date as dd/mm/yyyy
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();

// Format time as hh:mm:ss
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

currentTimeElement.textContent = formattedDateTime;

// User Management Functions
function showUserManagement() {
    const user = checkAuthentication();
    if (!user) {
        return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
        showNotification('Chỉ admin mới có quyền quản lý tài khoản!', 'error');
        return;
    }

    const sections = [
        'receiptSectionMoto', 
        'receiptSectionCar', 
        'dailyReportSection', 
        'userManagement',
        // 'mainInputSection' // Nên đặt ID cho section trắng này thay vì query class
    ];

    // Hide other sections
    sections.forEach(id =>{
        const el = document.getElementById(id);
        if (el)
            el.classList.add('hidden');
    });
    // document.getElementById('receiptSectionMoto').classList.add('hidden');
    // document.getElementById('receiptSectionCar').classList.add('hidden');
    // document.getElementById('dailyReportSection').classList.add('hidden');
    // document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.add('hidden');

    // Show user management section
    const userManagementSection = document.getElementById('userManagement');
    if (userManagementSection){
        userManagementSection.classList.remove('hidden');
    }
    // document.getElementById('userManagement').classList.remove('hidden');
    // document.getElementById('userManagement').classList.add('show');

    // Load user list
    refreshUserList();
}

function hideUserManagement() {
    // Hide user management section
    const userManagementSection = document.getElementById('userManagement');
    if (userManagementSection){
        userManagementSection.classList.add('hidden');
    }

    // Show summary section
    // document.querySelector('section.bg-white.rounded-xl.shadow-lg.p-6.mb-8').classList.remove('hidden');
}

function refreshUserList() {
    const accounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
    const userListBody = document.getElementById('userListBody');
    userListBody.innerHTML = '';

    if (Object.keys(accounts).length === 0) {
        userListBody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">Không có tài khoản nào</td></tr>';
        return;
    }

    for (const [username, userData] of Object.entries(accounts)) {
        // const roleText = userData.role === 'admin' ? 'Quản trị viên' : 'Người dùng';
        // const roleColor = userData.role === 'admin' ? 'text-red-600' : 'text-blue-600';
        // const roleColorSupervisor = userData.role === 'supervisor' ? 'text-green-600' : 'text-blue-600';
        const roleMap = {
            admin: {
                text: 'Quản trị viên',
                color: 'text-red-600'
            },
            supervisor: {
                text: 'Giám sát',
                color: 'text-green-600'
            },
            user: {
                text: 'Người dùng',
                color: 'text-blue-600'
            }
        };

        const roleInfo = roleMap[userData.role] || roleMap['user'];
        const roleText = roleInfo.text;
        const roleColor = roleInfo.color;


        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-gray-800 font-medium">${username}</td>
            <td class="px-4 py-3 text-gray-700">${userData.name}</td>
            <td class="px-4 py-3 text-center">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${roleColor} bg-gray-100">
                    ${roleText}
                </span>
            </td>
            <td class="px-4 py-3 text-center">
                <button onclick="deleteUser('${username}')" 
                    class="text-red-600 hover:text-red-800 font-medium text-sm">
                    <i class="fas fa-trash mr-1"></i> Xóa
                </button>
            </td>
        `;
        userListBody.appendChild(row);
    }
}

function createUser(event) {
    event.preventDefault();

    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const name = document.getElementById('newName').value.trim();
    const role = document.getElementById('newRole').value;

    // Validation
    if (!username || !password || !name) {
        showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }

    if (username.length < 3) {
        showNotification('Tên đăng nhập phải có ít nhất 3 ký tự!', 'error');
        return;
    }

    if (password.length < 3) {
        showNotification('Mật khẩu phải có ít nhất 3 ký tự!', 'error');
        return;
    }

    // Check if username already exists
    const accounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
    if (accounts[username]) {
        showNotification('Tên đăng nhập đã tồn tại!', 'error');
        return;
    }

    // Create new user
    const newUser = {
        username: username,
        password: password,
        role: role,
        name: name
    };

    // Add to accounts
    accounts[username] = newUser;
    localStorage.setItem('userAccounts', JSON.stringify(accounts));

    // Reset form
    document.getElementById('createUserForm').reset();

    // Refresh user list
    refreshUserList();

    // Show success message
    showNotification(`Đã tạo tài khoản ${username} thành công!`, 'success');
}

function deleteUser(username) {
    const user = checkAuthentication();
    if (!user || user.role !== 'admin') {
        showNotification('Bạn không có quyền xóa tài khoản!', 'error');
        return;
    }

    // Prevent deleting own account
    if (username === user.username) {
        showNotification('Không thể xóa tài khoản của chính mình!', 'error');
        return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"?`)) {
        const accounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
        delete accounts[username];
        localStorage.setItem('userAccounts', JSON.stringify(accounts));

        refreshUserList();
        showNotification(`Đã xóa tài khoản ${username}!`, 'success');
    }
}
