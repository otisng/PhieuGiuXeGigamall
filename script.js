// ==================== GLOBAL STATE ====================
// Load lịch sử giao dịch từ localStorage
let allTransactions = JSON.parse(localStorage.getItem("parking_history")) || [];
let currentReportDate = new Date().toISOString().split("T")[0];

// Lưu toàn bộ giao dịch xuống localStorage
function saveAllTransactions() {
  localStorage.setItem("parking_history", JSON.stringify(allTransactions));
}

/**
 * Parse timestamp từ nhiều định dạng:
 *  - ISO:      "2026-04-11T17:00:00.000Z"
 *  - vi-VN v1: "17:19:38 11/4/2026"   ← TIME trước DATE sau (Chrome vi-VN)
 *  - vi-VN v2: "11/4/2026, 17:19:38"  ← DATE trước TIME sau (có dấu phẩy)
 *  - vi-VN v3: "11/4/2026 17:19:38"   ← DATE trước TIME sau (không dấu phẩy)
 * Trả về chuỗi "YYYY-MM-DD" hoặc "" nếu parse thất bại.
 */
function parseDateFromTimestamp(raw) {
  if (!raw) return "";
  // ISO format
  if (raw.includes("T")) return raw.split("T")[0];
  if (raw.includes("/")) {
    // Tìm phần chứa dấu "/" (là phần ngày, không phải phần giờ)
    const segments = raw.replace(",", "").trim().split(" ");
    const datePart = segments.find((s) => s.includes("/"));
    if (datePart) {
      const d = datePart.split("/");
      if (d.length === 3) {
        // d[0]=ngày, d[1]=tháng, d[2]=năm
        return `${d[2].padStart(4, "0")}-${d[1].padStart(2, "0")}-${d[0].padStart(2, "0")}`;
      }
    }
  }
  return "";
}

// =========================================================

// Authentication functions
function checkAuthentication() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    // No user logged in, redirect to login page
    window.location.href = "login.html";
    return null;
  }

  try {
    const user = JSON.parse(currentUser);
    return user;
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
    return null;
  }
}

// Reset all accounts to default
function resetAccounts() {
  if (confirm("Bạn có chắc chắn muốn reset tất cả tài khoản về mặc định?")) {
    localStorage.removeItem("userAccounts");
    initializeAccounts();
    alert(
      "Đã reset tài khoản thành công! Bây giờ bạn có thể đăng nhập với:\n\nuser/123\nadmin/456\ngiamsat/789",
    );
  }
}

// Debug function to check accounts
function debugAccounts() {
  const accounts = localStorage.getItem("userAccounts");
  if (accounts) {
    const parsed = JSON.parse(accounts);
    console.log("Current accounts:", parsed);
    alert("Tài khoản hiện tại:\n" + JSON.stringify(parsed, null, 2));
  } else {
    alert("Không có tài khoản nào!");
  }
}

function displayUserInfo() {
  const user = checkAuthentication();
  if (user) {
    const userInfoElement = document.getElementById("userInfo");
    if (userInfoElement) {
      userInfoElement.textContent = `${user.name} (${user.role})`;
    }

    // Show/hide report dropdown based on role
    const reportDropdown = document.getElementById("reportDropdown");

    if (reportDropdown) {
      const allowedRoles = ["admin", "supervisor"];
      if (allowedRoles.includes(user.role)) {
          reportDropdown.classList.remove("hidden");
      } else {
          reportDropdown.classList.add("hidden");
      }
    }

    // Show/hide user management button based on role
    const userManagementBtn = document.getElementById("userManagementBtn");
    if (userManagementBtn) {
      if (user.role === "admin") {
        userManagementBtn.classList.remove("hidden");
      } else {
        userManagementBtn.classList.add("hidden");
      }
    }

    // Show welcome message
    showWelcomeMessage(user);
  }
}

function showWelcomeMessage(user) {
  const welcomeMessage = document.getElementById("welcomeMessage");
  const welcomeText = document.getElementById("welcomeText");

  if (welcomeMessage && welcomeText) {
    welcomeText.textContent = `Chào mừng ${user.name}! Bạn đã đăng nhập với quyền ${user.role === "admin" ? "quản trị viên" : "người dùng"}.`;
    welcomeMessage.classList.remove("hidden");

    // Auto hide after 5 seconds
    setTimeout(() => {
      hideWelcomeMessage();
    }, 5000);
  }
}

function hideWelcomeMessage() {
  const welcomeMessage = document.getElementById("welcomeMessage");
  if (welcomeMessage) {
    welcomeMessage.classList.add("hidden");
  }
}

function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
}

// Back to top button
var btn = $("#backtotop");

$(window).scroll(function () {
  if ($(window).scrollTop() > 300) {
    btn.addClass("show");
  } else {
    btn.removeClass("show");
  }
});

btn.on("click", function (e) {
  e.preventDefault();
  $("html, body").animate({ scrollTop: 0 }, "300");
});

window.onload = function () {
  const preloader = document.querySelector(".preloader");
  if (preloader) preloader.style.display = "none";
};

// Initialize event listeners for direct input changes
document.addEventListener("DOMContentLoaded", function () {
  // Check authentication first
  const user = checkAuthentication();
  if (!user) {
    return; // Will redirect to login page
  }

  // Display user information
  displayUserInfo();
  updateSerialDisplay("car");
  updateSerialDisplay("moto");

  // Initialize transaction storage
  // initializeTransactionStorage();

  // Set current date in date input
  const dateInput = document.getElementById("reportDateInput");
  if (dateInput) {
    dateInput.value = getCurrentDate();
  }

  // Show notification about data storage
  if (allTransactions.length > 0) {
    showNotification(
      `Đã tải ${allTransactions.length} dữ liệu thành công!`,
      "success",
    );
  }

  // Add event listener for user creation form
  const createUserForm = document.getElementById("createUserForm");
  if (createUserForm) {
    createUserForm.addEventListener("submit", createUser);
  }
});

// cấu hình thông tin sản phẩm
const PRODUCTS = {
  car: {
    name: "Xe Ô tô",
    price: 30000,
    type: "car",
  },
  moto: {
    name: "Xe Máy",
    price: 4000,
    type: "moto",
  },
};

// hàm hiện thị stt hiện tại lên giao diện
function updateSerialDisplay(type) {
  const currentSerial = localStorage.getItem("serial_${type}") || 1;
  const elementId = type === "car" ? "serialCar" : "serialMoto";
  const element = document.getElementById(elementId);
  const prefix = type === "car" ? "GC" : "GM";
  const formattedSerial =
    prefix + "-" + currentSerial.toString().padStart(9, "0");
  if (element) element.innerText = formattedSerial;

  return formattedSerial;
}

// Print the exchange receipt
function printReceipt(type) {
  // Xác định ID dựa trên loại phương tiện
  const sectionId = type === "car" ? "receiptSectionCar" : "receiptSectionMoto";
  const inputId = type === "car" ? "typeCar" : "typeMoto";
  const iconClass = type === "car" ? "fa-car-side" : "fa-motorcycle";
  const serialNumber = type === "car" ? "serialCar" : "serialMoto";

  const prefix = type === "car" ? "GC" : "GM";

  // Lấy dữ liệu từ giao diện
  const sectionElement = document.getElementById(sectionId);
  const serialElement = document.getElementById(serialNumber);
  const barCodeValue = document.getElementById(inputId).value;

  if (!barCodeValue) {
    alert("Vui lòng quét mã Barcode trước khi in!");
    document.getElementById(inputId).value;
    return;
  }

  // Lấy danh sách sản phẩm (nếu có id receiptItems bên trong section đó)
  const itemsHtml = sectionElement.querySelector("#receiptItems")
    ? sectionElement.querySelector("#receiptItems").innerHTML
    : "<p>Dịch vụ giữ xe miễn phí</p>";


  let currentSerial = parseInt(localStorage.getItem("serial_${type}")) || 1;

  const formattedSerial =
    prefix + "-" + currentSerial.toString().padStart(9, "0");

  serialElement.innerText = formattedSerial;

  // tạo objects data
  const allTransactions = {
    nameProduct: PRODUCTS[type].name,
    price: PRODUCTS[type].price,
    serialNumber: formattedSerial,
    barCode: barCodeValue,
    timestamp: new Date().toLocaleString("vi-VN"),
    type: PRODUCTS[type].type,
  };

  //save data
  let history = JSON.parse(localStorage.getItem("parking_history")) || [];
  history.push(allTransactions);
  localStorage.setItem("parking_history", JSON.stringify(history));

  // Tạo cửa sổ in
  const printWindow = window.open("", "", "width=800,height=600");

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
                        .type { font-size: 0.8rem; font-weight: bold; text-align: center; display: block; margin: 10px 0; }
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
                            <div><b>Số phiếu:</b> ${serialElement.textContent}</div>
                            <div><b>Thời gian:</b> ${document.getElementById("current-time").textContent}</div>
                            <div><b>Mã số:</b> <span class="type">${barCodeValue}</span></div>
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

  //   tang serial number
  localStorage.setItem("serial_${type}", currentSerial + 1);

  //   cap nhat giao dien va thong bao
  updateSerialDisplay(type);
  console.log("Đã lưu giao dịch: ", allTransactions);

  //reset input barcode sau khi in
  document.getElementById(inputId).value = "";

  printWindow.addEventListener("afterprint", (event) => {
    console.log("Đã hoàn thành việc in hoặc đóng hộp thoại.");
    location.reload();
  });
}

// ham xem lich su da luu
function getHistory() {
  return JSON.parse(localStorage.getItem("parking_history")) || [];
}
/**
 * Hàm tạo type dùng chung
 * @param {string} btnSelector - Class hoặc ID của nút bấm
 * @param {string} displayId - ID của phần tử hiển thị kết quả
 */
function scanBarCode(btnSelector, displayId, type) {
  const btn = document.querySelector(btnSelector);
  const inputElement = document.getElementById(displayId);

  // Tự động focus vào ô input
  inputField = document.getElementById(displayId);
  inputField.value = ""; //reset barcode cũ
  inputField.focus();

  // Lắng nghe sự kiện quét từ máy QR
  inputElement.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Chặn hành động xuống dòng mặc định

      const scannedValue = this.value.trim();

      if (scannedValue) {
        showPreview(scannedValue);
      }
    }
  });

  // 1. Hiệu ứng nút bấm (Thêm và tự động xóa sau 200ms)
  btn.classList.add("btn-clicked");
  setTimeout(() => btn.classList.remove("btn-clicked"), 2000);

  const carSection = document.getElementById("receiptSectionCar");
  const motoSection = document.getElementById("receiptSectionMoto");

  if (type === "car") {
    carSection.classList.remove("hidden"); // Hiện Ô tô
    motoSection.classList.add("hidden"); // Ẩn Xe máy
  } else if (type === "moto") {
    motoSection.classList.remove("hidden"); // Hiện Xe máy
    carSection.classList.add("hidden"); // Ẩn Ô tô
  }
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}


// Daily Report Functions
function showDailyReport() {
  const user = checkAuthentication();
  if (!user) {
    return;
  }

  // Check if user is admin
  if (user.role !== "admin" && user.role !== "supervisor") {
    showNotification("Chỉ admin mới có quyền truy cập báo cáo!", "error");
    return;
  }
  const sections = [
    "receiptSectionMoto",
    "receiptSectionCar",
    "dailyReportSection",
    "userManagement",
  ];

  // Hide other sections
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  // Show daily report section
  const dailyReport = document.getElementById("dailyReportSection");
  if (dailyReport) {
    dailyReport.classList.remove("hidden");
  }

  // Update report data for current date
  updateDailyReportDisplay(currentReportDate);
}

function hideDailyReport() {
  // Hide daily report section
  document.getElementById("dailyReportSection").classList.add("hidden");
}

/**
 * Tính tổng thống kê cho một ngày cụ thể
 * Dữ liệu từ parking_history có dạng:
 * { nameProduct, price, serialNumber, barCode, timestamp, type }
 */
function calculateTotalsForDate(date) {
  allTransactions = JSON.parse(localStorage.getItem("parking_history")) || [];

  const dayTransactions = allTransactions.filter(
    (t) => parseDateFromTimestamp(t.timestamp) === date
  );

  const totals = {
    totalExchanges: dayTransactions.length,
    totalPrice: 0,
    totalItems: dayTransactions.length,
    products: {},
  };

  dayTransactions.forEach((t) => {
    const typeKey = t.type || "unknown";
    totals.totalPrice += t.price || 0;

    if (!totals.products[typeKey]) {
      totals.products[typeKey] = {
        name: t.nameProduct || typeKey,
        quantity: 0,
        price: 0,
      };
    }
    totals.products[typeKey].quantity += 1;
    totals.products[typeKey].price += t.price || 0;
  });

  return totals;
}

/** Lấy giao dịch theo ngày */
function getTransactionsByDate(date) {
  allTransactions = JSON.parse(localStorage.getItem("parking_history")) || [];
  return allTransactions.filter(
    (t) => parseDateFromTimestamp(t.timestamp) === date
  );
}

/** Cập nhật toàn bộ giao diện dailyReportSection theo ngày */
function updateDailyReportDisplay(date) {
  currentReportDate = date || getCurrentDate();
  const totals = calculateTotalsForDate(currentReportDate);

  // --- Summary cards ---
  document.getElementById("totalExchanges").textContent = totals.totalExchanges;
  document.getElementById("totalPrice").textContent =
    totals.totalPrice.toLocaleString("vi-VN") + " VNĐ";
  document.getElementById("totalItems").textContent = totals.totalItems;

  // --- Hiển thị ngày ---
  const reportDate = new Date(currentReportDate + "T00:00:00");
  document.getElementById("reportDate").textContent = reportDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dateInput = document.getElementById("reportDateInput");
  if (dateInput) dateInput.value = currentReportDate;

  // --- Bảng chi tiết sản phẩm ---
  const tableBody = document.getElementById("reportTableBody");
  tableBody.innerHTML = "";

  if (Object.keys(totals.products).length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Không có dữ liệu cho ngày này</td></tr>';
  } else {
    for (const [, productData] of Object.entries(totals.products)) {
      const row = document.createElement("tr");
      row.className = "border-b border-gray-200 hover:bg-gray-50 transition-colors";
      row.innerHTML = `
        <td class="px-4 py-3 text-gray-800 font-medium">${productData.name}</td>
        <td class="px-4 py-3 text-center text-gray-700">${productData.quantity}</td>
        <td class="px-4 py-3 text-center text-gray-700">${productData.price.toLocaleString("vi-VN")} VNĐ</td>
      `;
      tableBody.appendChild(row);
    }
  }

  // --- Lịch sử giao dịch ---
  updateTransactionHistory(currentReportDate);
}

/** Render bảng lịch sử giao dịch */
function updateTransactionHistory(date) {
  const transactions = getTransactionsByDate(date);
  const historyBody = document.getElementById("transactionHistoryBody");
  historyBody.innerHTML = "";

  if (transactions.length === 0) {
    historyBody.innerHTML =
      '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Không có giao dịch nào trong ngày này</td></tr>';
    return;
  }

  // Sắp xếp mới nhất trước
  const sorted = [...transactions].reverse();

  // Chỉ hiển thị 50 giao dịch gần nhất
  sorted.slice(0, 50).forEach((t) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userName = currentUser.name || "N/A";
    const row = document.createElement("tr");
    row.className = "border-b border-gray-200 hover:bg-gray-50 transition-colors";
    row.innerHTML = `
      <td class="px-4 py-3 text-gray-700 text-sm">${t.timestamp || ""}</td>
      <td class="px-4 py-3 text-gray-700 font-medium">${userName}</td>
      <td class="px-4 py-3 text-center">
        <span class="px-2 py-1 rounded-full text-xs font-semibold ${
          t.type === "car"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }">${t.nameProduct || ""}</span>
      </td>
      <td class="px-4 py-3 text-gray-700 text-sm font-mono">${t.serialNumber || ""}</td>
    `;
    historyBody.appendChild(row);
  });
}

// Date filter functions
function changeReportDate(direction) {
  const currentDate = new Date(currentReportDate);

  if (direction === "prev") {
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (direction === "next") {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const newDate = currentDate.toISOString().split("T")[0];
  updateDailyReportDisplay(newDate);
}

function selectReportDate() {
  const dateInput = document.getElementById("reportDateInput");
  if (dateInput && dateInput.value) {
    updateDailyReportDisplay(dateInput.value);
  }
}

// Get available dates with transactions
function getAvailableDates() {
  const history = JSON.parse(localStorage.getItem("parking_history")) || [];
  const dates = new Set();
  history.forEach((t) => {
    const d = parseDateFromTimestamp(t.timestamp);
    if (d) dates.add(d);
  });
  return Array.from(dates).sort().reverse();
}

// Show date picker with available dates
function showDatePicker() {
  const availableDates = getAvailableDates();
  if (availableDates.length === 0) {
    showNotification("Không có dữ liệu giao dịch nào!", "info");
    return;
  }

  const dateInput = document.getElementById("reportDateInput");
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
    transactions: transactions,
  };

  const dataStr = JSON.stringify(reportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
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
      ["BÁO CÁO HÀNG NGÀY - GIGAMALL"],
      [""],
      ["Ngày:", currentReportDate],
      ["Tổng giao dịch:", totals.totalExchanges],
      ["Tổng phiếu:", totals.totalPrice],
      ["Tổng sản phẩm:", totals.totalItems],
      [""],
      ["CHI TIẾT SẢN PHẨM"],
      ["Sản phẩm", "Số lượng", "Phiếu"],
    ];

    // Add product details
    for (const [productId, productData] of Object.entries(totals.products)) {
      summaryData.push([
        productData.name,
        productData.quantity,
        productData.price,
      ]);
    }

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths
    summaryWs["!cols"] = [
      { width: 20 },
      { width: 12 },
      { width: 12 },
      { width: 15 },
    ];

    // Add summary sheet to workbook
    XLSX.utils.book_append_sheet(wb, summaryWs, "Tổng hợp");

    // Detailed transactions sheet
    if (transactions.length > 0) {
      const detailData = [
        ["CHI TIẾT GIAO DỊCH"],
        [""],
        ["Thời gian", "Loại xe", "Số phiếu", "Mã Barcode", "Tiền (VNĐ)"],
      ];

      transactions.forEach((t) => {
        detailData.push([
          t.timestamp || "",
          t.nameProduct || "",
          t.serialNumber || "",
          t.barCode || "",
          t.price || 0,
        ]);
      });

      const detailWs = XLSX.utils.aoa_to_sheet(detailData);

      // Set column widths for detail sheet
      detailWs["!cols"] = [
        { width: 22 },
        { width: 14 },
        { width: 18 },
        { width: 20 },
        { width: 14 },
      ];

      // Add detail sheet to workbook
      XLSX.utils.book_append_sheet(wb, detailWs, "Chi tiết giao dịch");
    }


    // Generate filename with current date
    const fileName = `bao-cao-ngay-${currentReportDate}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);

    // Show success message
    showNotification("Xuất Excel thành công!", "success");
  } catch (error) {
    console.error("Error exporting Excel:", error);
    showNotification("Có lỗi khi xuất Excel!", "error");
  } finally {
    // Restore button state
    exportBtn.innerHTML = originalContent;
    exportBtn.disabled = false;
  }
}

// Notification function
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";
  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
        ? "fa-exclamation-circle"
        : "fa-info-circle";

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
    notification.classList.remove("translate-x-full");
  }, 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("translate-x-full");
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

function clearDailyReport() {
  if (confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu giao dịch?")) {
    allTransactions = [];
    saveAllTransactions();
    updateDailyReportDisplay(currentReportDate);
    showNotification("Đã xóa tất cả dữ liệu giao dịch!", "success");
  }
}

// Get statistics for all time
function getAllTimeStats() {
  const history = JSON.parse(localStorage.getItem("parking_history")) || [];
  const stats = {
    totalTransactions: history.length,
    totalPrice: 0,
    totalItems: history.length,
    products: {},
  };

  history.forEach((t) => {
    stats.totalPrice += t.price || 0;
    const typeKey = t.type || "unknown";
    if (!stats.products[typeKey]) {
      stats.products[typeKey] = {
        name: t.nameProduct || typeKey,
        quantity: 0,
        price: 0,
      };
    }
    stats.products[typeKey].quantity += 1;
    stats.products[typeKey].price += t.price || 0;
  });

  return stats;
}

// Show all time statistics
function showAllTimeStats() {
  const stats = getAllTimeStats();
  const productLines = Object.values(stats.products)
    .map((p) => `  • ${p.name}: ${p.quantity} phiếu — ${p.price.toLocaleString("vi-VN")} VNĐ`)
    .join("\n");

  const message =
    `📊 Thống kê tổng quan:\n` +
    `• Tổng giao dịch: ${stats.totalTransactions}\n` +
    `• Tổng tiền: ${stats.totalPrice.toLocaleString("vi-VN")} VNĐ\n` +
    `• Tổng sản phẩm: ${stats.totalItems}\n\n` +
    `Chi tiết:\n${productLines || "  (chưa có dữ liệu)"}`;

  alert(message);
}

// JavaScript to dynamically display the current date and time
const currentTimeElement = document.getElementById("current-time");
const now = new Date();

// Format date as dd/mm/yyyy
const day = String(now.getDate()).padStart(2, "0");
const month = String(now.getMonth() + 1).padStart(2, "0");
const year = now.getFullYear();

// Format time as hh:mm:ss
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");
const seconds = String(now.getSeconds()).padStart(2, "0");

const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

currentTimeElement.textContent = formattedDateTime;

// User Management Functions
function showUserManagement() {
  const user = checkAuthentication();
  if (!user) {
    return;
  }

  // Check if user is admin
  if (user.role !== "admin") {
    showNotification("Chỉ admin mới có quyền quản lý tài khoản!", "error");
    return;
  }

  const sections = [
    "receiptSectionMoto",
    "receiptSectionCar",
    "dailyReportSection",
    "userManagement",
  ];

  // Hide other sections
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  // Show user management section
  const userManagementSection = document.getElementById("userManagement");
  if (userManagementSection) {
    userManagementSection.classList.remove("hidden");
  }

  // Load user list
  refreshUserList();
}

function hideUserManagement() {
  // Hide user management section
  const userManagementSection = document.getElementById("userManagement");
  if (userManagementSection) {
    userManagementSection.classList.add("hidden");
  }
}

function refreshUserList() {
  const accounts = JSON.parse(localStorage.getItem("userAccounts") || "{}");
  const userListBody = document.getElementById("userListBody");
  userListBody.innerHTML = "";

  if (Object.keys(accounts).length === 0) {
    userListBody.innerHTML =
      '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">Không có tài khoản nào</td></tr>';
    return;
  }

  for (const [username, userData] of Object.entries(accounts)) {
    const roleMap = {
      admin: {
        text: "Quản trị viên",
        color: "text-red-600",
      },
      supervisor: {
        text: "Giám sát",
        color: "text-green-600",
      },
      user: {
        text: "Người dùng",
        color: "text-blue-600",
      },
    };

    const roleInfo = roleMap[userData.role] || roleMap["user"];
    const roleText = roleInfo.text;
    const roleColor = roleInfo.color;

    const row = document.createElement("tr");
    row.className = "border-b border-gray-200 hover:bg-gray-50";
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

  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value;
  const name = document.getElementById("newName").value.trim();
  const role = document.getElementById("newRole").value;

  // Validation
  if (!username || !password || !name) {
    showNotification("Vui lòng nhập đầy đủ thông tin!", "error");
    return;
  }

  if (username.length < 3) {
    showNotification("Tên đăng nhập phải có ít nhất 3 ký tự!", "error");
    return;
  }

  if (password.length < 3) {
    showNotification("Mật khẩu phải có ít nhất 3 ký tự!", "error");
    return;
  }

  // Check if username already exists
  const accounts = JSON.parse(localStorage.getItem("userAccounts") || "{}");
  if (accounts[username]) {
    showNotification("Tên đăng nhập đã tồn tại!", "error");
    return;
  }

  // Create new user
  const newUser = {
    username: username,
    password: password,
    role: role,
    name: name,
  };

  // Add to accounts
  accounts[username] = newUser;
  localStorage.setItem("userAccounts", JSON.stringify(accounts));

  // Reset form
  document.getElementById("createUserForm").reset();

  // Refresh user list
  refreshUserList();

  // Show success message
  showNotification(`Đã tạo tài khoản ${username} thành công!`, "success");
}

function deleteUser(username) {
  const user = checkAuthentication();
  if (!user || user.role !== "admin") {
    showNotification("Bạn không có quyền xóa tài khoản!", "error");
    return;
  }

  // Prevent deleting own account
  if (username === user.username) {
    showNotification("Không thể xóa tài khoản của chính mình!", "error");
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"?`)) {
    const accounts = JSON.parse(localStorage.getItem("userAccounts") || "{}");
    delete accounts[username];
    localStorage.setItem("userAccounts", JSON.stringify(accounts));

    refreshUserList();
    showNotification(`Đã xóa tài khoản ${username}!`, "success");
  }
}

function toggleReportDropdown(event) {
    if (event) event.stopPropagation();
    const content = document.getElementById("reportDropdownContent");
    if (content) {
        content.classList.toggle("hidden");
    }
}

// Close dropdown when clicking outside
document.addEventListener("click", function(event) {
    const dropdown = document.getElementById("reportDropdown");
    const content = document.getElementById("reportDropdownContent");
    if (dropdown && content && !dropdown.contains(event.target)) {
        content.classList.add("hidden");
    }
});

// ==================== MONTHLY REPORT FUNCTIONS ====================

function showMonthlyReport() {
    const user = checkAuthentication();
    if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
        showNotification("Bạn không có quyền truy cập báo cáo này!", "error");
        return;
    }

    const sections = [
        "receiptSectionMoto",
        "receiptSectionCar",
        "dailyReportSection",
        "monthlyReportSection",
        "userManagement",
    ];

    sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });

    const monthlyReport = document.getElementById("monthlyReportSection");
    if (monthlyReport) monthlyReport.classList.remove("hidden");

    // Default to current month
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthInput = document.getElementById("reportMonthInput");
    if (monthInput) monthInput.value = monthStr;

    updateMonthlyReportDisplay(monthStr);
}

function hideMonthlyReport() {
    document.getElementById("monthlyReportSection").classList.add("hidden");
}

function selectReportMonth() {
    const monthInput = document.getElementById("reportMonthInput");
    if (monthInput && monthInput.value) {
        updateMonthlyReportDisplay(monthInput.value);
    }
}

function calculateTotalsForMonth(yearMonth) {
    const history = JSON.parse(localStorage.getItem("parking_history")) || [];
    // yearMonth format: "YYYY-MM"
    
    const monthTransactions = history.filter(t => {
        const date = parseDateFromTimestamp(t.timestamp);
        return date && date.startsWith(yearMonth);
    });

    const totals = {
        totalExchanges: monthTransactions.length,
        totalPrice: 0,
        totalItems: monthTransactions.length,
        products: {},
        dailyStats: {} // { "YYYY-MM-DD": { car: 0, moto: 0, price: 0 } }
    };

    monthTransactions.forEach(t => {
        const typeKey = t.type || "unknown";
        const price = t.price || 0;
        const date = parseDateFromTimestamp(t.timestamp);
        
        totals.totalPrice += price;

        // By product
        if (!totals.products[typeKey]) {
            totals.products[typeKey] = {
                name: t.nameProduct || typeKey,
                quantity: 0,
                price: 0
            };
        }
        totals.products[typeKey].quantity += 1;
        totals.products[typeKey].price += price;

        // By day
        if (date) {
            if (!totals.dailyStats[date]) {
                totals.dailyStats[date] = { car: 0, moto: 0, price: 0 };
            }
            if (typeKey === "car") totals.dailyStats[date].car += 1;
            if (typeKey === "moto") totals.dailyStats[date].moto += 1;
            totals.dailyStats[date].price += price;
        }
    });

    return totals;
}

function updateMonthlyReportDisplay(yearMonth) {
    const totals = calculateTotalsForMonth(yearMonth);
    
    // Titles
    const [year, month] = yearMonth.split("-");
    document.getElementById("monthlyReportTitle").textContent = `Tháng ${month}/${year}`;
    
    // Summary cards
    document.getElementById("monthlyTotalExchanges").textContent = totals.totalExchanges;
    document.getElementById("monthlyTotalPrice").textContent = totals.totalPrice.toLocaleString("vi-VN") + " VNĐ";
    document.getElementById("monthlyTotalItems").textContent = totals.totalItems;

    // Product Table
    const productBody = document.getElementById("monthlyReportTableBody");
    productBody.innerHTML = "";
    if (Object.keys(totals.products).length === 0) {
        productBody.innerHTML = '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Không có dữ liệu trong tháng này</td></tr>';
    } else {
        Object.values(totals.products).forEach(p => {
            const row = document.createElement("tr");
            row.className = "border-b border-gray-200 hover:bg-gray-50 transition-colors";
            row.innerHTML = `
                <td class="px-4 py-3 text-gray-800 font-medium">${p.name}</td>
                <td class="px-4 py-3 text-center text-gray-700">${p.quantity}</td>
                <td class="px-4 py-3 text-center text-gray-700">${p.price.toLocaleString("vi-VN")} VNĐ</td>
            `;
            productBody.appendChild(row);
        });
    }

    // Daily Stats Table
    const dailyBody = document.getElementById("monthlyDailyStatsBody");
    dailyBody.innerHTML = "";
    const sortedDays = Object.keys(totals.dailyStats).sort().reverse();
    
    if (sortedDays.length === 0) {
        dailyBody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Không có dữ liệu chi tiết</td></tr>';
    } else {
        sortedDays.forEach(date => {
            const stats = totals.dailyStats[date];
            const row = document.createElement("tr");
            row.className = "border-b border-gray-200 hover:bg-gray-50 transition-colors";
            row.innerHTML = `
                <td class="px-4 py-3 text-gray-700 font-mono text-sm">${date}</td>
                <td class="px-4 py-3 text-center text-green-600 font-medium">${stats.moto}</td>
                <td class="px-4 py-3 text-center text-blue-600 font-medium">${stats.car}</td>
                <td class="px-4 py-3 text-center text-gray-800">${stats.price.toLocaleString("vi-VN")} VNĐ</td>
            `;
            dailyBody.appendChild(row);
        });
    }
}

function exportMonthlyReportExcel() {
    const monthInput = document.getElementById("reportMonthInput");
    const yearMonth = monthInput.value;
    if (!yearMonth) return;

    const totals = calculateTotalsForMonth(yearMonth);
    const [year, month] = yearMonth.split("-");

    try {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Tổng quan tháng
        const summaryData = [
            [`BÁO CÁO DOANH THU THÁNG ${month}/${year} - GIGAMALL`],
            [""],
            ["Tổng giao dịch:", totals.totalExchanges],
            ["Tổng tiền mặt:", totals.totalPrice],
            ["Tổng sản phẩm:", totals.totalItems],
            [""],
            ["CHI TIẾT THEO LOẠI XE"],
            ["Loại xe", "Số lượng", "Thành tiền"]
        ];

        Object.values(totals.products).forEach(p => {
            summaryData.push([p.name, p.quantity, p.price]);
        });

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        summaryWs["!cols"] = [{ width: 25 }, { width: 15 }, { width: 15 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, "Tổng hợp tháng");

        // Sheet 2: Chi tiết theo ngày
        const dailyData = [
            ["DANH SÁCH THỐNG KÊ THEO NGÀY"],
            [""],
            ["Ngày", "Số lượng Xe Máy", "Số lượng Ô tô", "Doanh thu ngày"]
        ];

        Object.keys(totals.dailyStats).sort().forEach(date => {
            const s = totals.dailyStats[date];
            dailyData.push([date, s.moto, s.car, s.price]);
        });

        const dailyWs = XLSX.utils.aoa_to_sheet(dailyData);
        dailyWs["!cols"] = [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }];
        XLSX.utils.book_append_sheet(wb, dailyWs, "Chi tiết theo ngày");

        // Save
        XLSX.writeFile(wb, `bao-cao-thang-${yearMonth}.xlsx`);
        showNotification(`Đã xuất báo cáo tháng ${month}/${year} thành công!`, "success");
    } catch (error) {
        console.error("Export Error:", error);
        showNotification("Lỗi khi xuất file Excel!", "error");
    }
}
