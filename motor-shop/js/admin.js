let orderDetailModalInstance;
let customerDetailsModalInstance;

// Xử lý sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('active');
        });
    }
    
    // Khởi tạo biểu đồ
    initCharts();
    setupOrderTabEvents();// 
    updateNotificationDropdown();//
    renderDynamicOrdersToTable(); // 
    orderDetailModalInstance = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    customerDetailsModalInstance = new bootstrap.Modal(document.getElementById('customerDetailsModal'));

    document.getElementById('orderDetailModal').addEventListener('hidden.bs.modal', function () {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
    });

    document.getElementById('customerDetailsModal').addEventListener('hidden.bs.modal', function () {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
    });
});

// Khởi tạo biểu đồ với Chart.js
function initCharts() {
    // Biểu đồ doanh thu
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
                datasets: [{
                    label: 'Doanh thu (triệu VND)',
                    data: [120, 190, 150, 210, 180, 250, 300],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Biểu đồ loại xe bán chạy
    const productCtx = document.getElementById('productChart');
    if (productCtx) {
        new Chart(productCtx, {
            type: 'doughnut',
            data: {
                labels: ['Thể thao', 'Naked bike', 'Cruiser', 'Tay ga', 'Phân khối lớn'],
                datasets: [{
                    data: [35, 25, 15, 10, 15],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
}

// Xử lý đăng nhập
async function handleLogin(username, password) {
    try {
        // Fetch dữ liệu từ file JSON
        const response = await fetch('data/accounts.json');
        const accounts = await response.json();

        // Kiểm tra tài khoản admin
        if (username === accounts.admin.username && password === accounts.admin.password) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('role', 'admin');
            alert('Đăng nhập thành công với tài khoản admin!');
            window.location.href = 'admin.html';
            return;
        }

        // Kiểm tra tài khoản user
        const user = accounts.users.find(
            (user) => user.username === username && user.password === password
        );

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('role', 'user');
            alert('Đăng nhập thành công với tài khoản user!');
            window.location.href = 'index.html';
            return;
        }

        // Nếu không tìm thấy tài khoản
        alert('Tên đăng nhập hoặc mật khẩu không đúng!');
    } catch (error) {
        console.error('Lỗi khi xử lý đăng nhập:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại sau!');
    }
}

// Xử lý sự kiện khi người dùng nhấn nút đăng nhập
document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function () {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            handleLogin(username, password);
        });
    }
});

// Xử lý phân quyền - kiểm tra đăng nhập
function checkLogin() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const role = localStorage.getItem('role');

    if (!isLoggedIn) {
        window.location.href = 'login.html'; // Chuyển hướng nếu chưa đăng nhập
    } else {
        // Kiểm tra quyền truy cập
        if (role === 'admin' && !window.location.pathname.includes('admin.html')) {
            window.location.href = 'admin.html';
        } else if (role === 'user' && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
}

// Gọi hàm kiểm tra khi trang được tải
document.addEventListener('DOMContentLoaded', checkLogin);

//////////////////////////////////////////////////////////////////////////////////////////
// --- HÀM MỚI ĐƯỢC THÊM VÀO ---

// Hàm lấy tất cả đơn hàng từ localStorage (ĐÃ CHUYỂN TỪ sessionStorage)
function getAllOrdersFromLocalStorage() {
    return JSON.parse(localStorage.getItem('orders')) || [];
}

// Function to attach events for viewing customer details
function attachCustomerDetailsEvents() {
    document.querySelectorAll('.view-customer-details').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.dataset.name;
            const phone = this.dataset.phone;
            const address = this.dataset.address;
            const notes = this.dataset.notes;

            document.getElementById('modalCustomerName').textContent = name;
            document.getElementById('modalCustomerPhone').textContent = phone;
            document.getElementById('modalCustomerAddress').textContent = address;
            document.getElementById('modalOrderNotes').textContent = notes || 'Không có ghi chú.'; // Hiển thị "Không có ghi chú" nếu trống
        });
    });
}

// Hàm render đơn hàng động vào bảng (ĐÃ ĐIỀU CHỈNH ĐỂ DÙNG getAllOrdersFromLocalStorage)
function renderDynamicOrdersToTable() {
    const ordersTableBody = document.getElementById('dynamic-orders-body'); // Đổi từ ordersTableBody thành dynamic-orders-body
    if (!ordersTableBody) { // Thêm kiểm tra này
        console.warn('Không tìm thấy tbody của bảng đơn hàng động. Hãy đảm bảo nó có id="dynamic-orders-body" trong admin.html');
        return;
    }
    ordersTableBody.innerHTML = ''; // Clear existing rows

    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orders.length === 0) {
        // Cập nhật colspan cho thông báo trống
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Chưa có đơn hàng nào.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        // Thêm class cho các đơn hàng "Chờ xử lý" để dễ nhận biết
        if (order.status === 'Chờ xử lý') {
            row.classList.add('table-warning');
        }

        // Lấy thông tin khách hàng, ưu tiên order.customerDetails
        const customerName = order.customerInfo ? order.customerInfo.name : (order.customer || 'N/A');
        const customerPhone = order.customerInfo ? order.customerInfo.phone : 'N/A';
        const customerAddress = order.customerInfo ? order.customerInfo.address : 'N/A';
        const orderNotes = order.customerInfo ? order.customerInfo.notes : '';

        row.innerHTML = `
            <td>${order.id}</td>
            <td>
                <strong>${customerName}</strong><br>
                <small>${customerPhone}</small><br>
                <button class="btn btn-link btn-sm p-0 text-decoration-none view-customer-details"
                        data-bs-toggle="modal" 
                        data-bs-target="#customerDetailsModal"
                        data-name="${customerName}"
                        data-phone="${customerPhone}"
                        data-address="${customerAddress}"
                        data-notes="${orderNotes}">
                    Xem chi tiết
                </button>
            </td>
            <td>${order.date}</td>
            <td>${order.total.toLocaleString('vi-VN')} VNĐ</td>
            <td><span class="badge bg-secondary">${order.status}</span></td>
            <td>
                <button class="btn btn-info btn-sm view-order-details" data-order-id="${order.id}">Xem ĐH</button>
                <button class="btn btn-success btn-sm mark-order-completed" data-order-id="${order.id}">Hoàn thành</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
    attachOrderTableEvents(); // Attach events after rendering
    attachCustomerDetailsEvents(); // Gắn sự kiện cho nút "Xem chi tiết" của khách hàng
}

// Hàm để gắn sự kiện cho việc kích hoạt tab "Đơn hàng" (ĐÃ ĐIỀU CHỈNH ĐỂ GỌI renderDynamicOrdersToTable)
function setupOrderTabEvents() {
    const orderTabLink = document.getElementById('order'); // Lấy thẻ A với id="order"
    if (orderTabLink) {
        // Sử dụng event 'shown.bs.tab' của Bootstrap
        orderTabLink.addEventListener('shown.bs.tab', function (event) {
            console.log('Tab Đơn hàng đã được hiển thị, đang tải dữ liệu đơn hàng động.');
            renderDynamicOrdersToTable(); // Gọi hàm hiển thị đơn hàng để tải dữ liệu mới nhất
        });
    }
}

// Gắn các sự kiện cho nút "Xem" và "Hoàn thành"
function attachOrderTableEvents() {
    document.querySelectorAll('.view-order-details').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            viewOrderDetails(orderId);
        });
    });

    document.querySelectorAll('.mark-order-completed').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            markOrderCompleted(orderId);
        });
    });
}

// Xử lý xem chi tiết đơn hàng (có thể mở modal hoặc trang mới)
function viewOrderDetails(orderId) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => String(o.id) === String(orderId));

    if (order) {
        // Hiển thị thông tin khách hàng đúng chuẩn
        document.getElementById('modalCustomerName').textContent = order.customerInfo && order.customerInfo.name ? order.customerInfo.name : '';
        document.getElementById('modalCustomerPhone').textContent = order.customerInfo && order.customerInfo.phone ? order.customerInfo.phone : '';
        document.getElementById('modalCustomerAddress').textContent = order.customerInfo && order.customerInfo.address ? order.customerInfo.address : '';
        document.getElementById('modalOrderNotes').textContent = order.customerInfo && order.customerInfo.notes ? order.customerInfo.notes : '';

        // Cập nhật thông tin đơn hàng chung
        document.getElementById('detail-order-id').textContent = order.id;
        document.getElementById('detail-order-date').textContent = order.date;
        document.getElementById('detail-total-amount').textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total);
        document.getElementById('detail-order-status').textContent = order.status;

        // Ưu tiên lấy từ customerDetails, nếu không có thì fallback về customer
        const customerNameElement = document.getElementById('detail-customer-name');
        const customerPhoneElement = document.getElementById('detail-customer-phone');
        const customerAddressElement = document.getElementById('detail-customer-address');
        const orderNotesElement = document.getElementById('detail-order-notes');

        if (order.customerInfo) {
            customerNameElement.textContent = order.customerInfo.name || 'N/A';
            customerPhoneElement.textContent = order.customerInfo.phone || 'Chưa cập nhật';
            customerAddressElement.textContent = order.customerInfo.address || 'Chưa cập nhật';
            orderNotesElement.innerHTML = order.customerInfo.notes || 'Không có ghi chú.'; 
        } else {
            // Trường hợp đơn hàng cũ không có customerDetails hoặc là 'Khách hàng ẩn danh'
            customerNameElement.textContent = order.customer || 'N/A'; 
            customerPhoneElement.textContent = 'Chưa cập nhật';
            customerAddressElement.textContent = 'Chưa cập nhật';
            orderNotesElement.innerHTML = 'Không có ghi chú.';
        }

        // Cập nhật danh sách sản phẩm
        const orderItemsList = document.getElementById('detail-order-items');
        orderItemsList.innerHTML = ''; // Xóa các mục cũ

        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                listItem.innerHTML = `
                    ${item.name} (x${item.quantity})
                    <span class="badge bg-primary rounded-pill">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</span>
                `;
                orderItemsList.appendChild(listItem);
            });
        } else {
            const noItemsLi = document.createElement('li');
            noItemsLi.classList.add('list-group-item', 'text-muted');
            noItemsLi.textContent = 'Không có sản phẩm nào trong đơn hàng này.';
            orderItemsList.appendChild(noItemsLi);
        }

        // Hiển thị modal bằng đối tượng đã được khởi tạo
        if (orderDetailModalInstance) {
            orderDetailModalInstance.show();
        } else {
            console.error('orderDetailModalInstance chưa được khởi tạo.');
        }
    } else {
        console.error(`Không tìm thấy đơn hàng với ID: ${orderId}`);
        showAlert('Không tìm thấy chi tiết đơn hàng này.', 'danger');
    }
}

// Xử lý đánh dấu đơn hàng là hoàn thành
function markOrderCompleted(orderId) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => String(o.id) === String(orderId));
    if (orderIndex > -1) {
        orders[orderIndex].status = 'Đã hoàn thành';
        localStorage.setItem('orders', JSON.stringify(orders));
        showAlert(`Đơn hàng ${orderId} đã được đánh dấu là HOÀN THÀNH.`, 'success');
        renderDynamicOrdersToTable();
        updateNotificationDropdown();
        calculateTotalRevenue();
        updateDashboardStats();
        updateBestSellingVehicleChart(); // cập nhật lại biểu đồ loại xe bán chạy
    } else {
        showAlert('Không tìm thấy đơn hàng này để hoàn thành.', 'danger');
    }
}

// Thay thế hàm showAlert hiện tại bằng hàm hiển thị Bootstrap Toast
function showAlert(message, type) {
    const toastLiveExample = document.getElementById('liveToast');
    const toastHeader = document.getElementById('toastHeader');
    const toastBody = document.getElementById('toastBody');

    if (toastLiveExample && toastHeader && toastBody) {
        toastBody.textContent = message;

        // Cập nhật tiêu đề và màu sắc dựa trên loại thông báo
        if (type === 'success') {
            toastHeader.textContent = 'Thành công';
            toastLiveExample.classList.remove('bg-danger', 'bg-info');
            toastLiveExample.classList.add('bg-success', 'text-white'); // Thêm màu nền và chữ trắng
        } else if (type === 'danger') {
            toastHeader.textContent = 'Lỗi';
            toastLiveExample.classList.remove('bg-success', 'bg-info');
            toastLiveExample.classList.add('bg-danger', 'text-white'); // Thêm màu nền và chữ trắng
        } else if (type === 'info') {
            toastHeader.textContent = 'Thông tin';
            toastLiveExample.classList.remove('bg-success', 'bg-danger');
            toastLiveExample.classList.add('bg-info', 'text-white'); // Thêm màu nền và chữ trắng
        } else {
            toastHeader.textContent = 'Thông báo'; // Mặc định
            toastLiveExample.classList.remove('bg-success', 'bg-danger', 'bg-info', 'text-white');
            toastLiveExample.classList.add('text-dark'); // Màu chữ mặc định
        }
        
        const toast = new bootstrap.Toast(toastLiveExample);
        toast.show();
        console.log(`Đã hiển thị Toast: ${message} (Loại: ${type})`);
    } else {
        // Fallback về alert nếu không tìm thấy các phần tử Toast
        console.warn('Không tìm thấy các phần tử Toast, sử dụng alert làm fallback.');
        alert(message);
    }
}

// --- NEW FUNCTION: Update Notification Dropdown with New Orders ---

function updateNotificationDropdown() {
    console.log('Bắt đầu updateNotificationDropdown...');
    const notificationDropdownMenu = document.getElementById('notification'); 
    const notificationBadge = document.querySelector('#notificationDropdown .badge');
    
    const notificationHeaderH6 = notificationDropdownMenu ? notificationDropdownMenu.querySelector('li .dropdown-header') : null;
    let insertionPoint = null;

    console.log('notificationDropdownMenu (UL with ID notification):', notificationDropdownMenu);
    console.log('notificationBadge:', notificationBadge);
    console.log('notificationHeaderH6 (h6 header):', notificationHeaderH6); 

    if (!notificationDropdownMenu) {
        console.warn('Không tìm thấy menu dropdown thông báo với ID "notification". Dừng cập nhật.');
        return;
    }

    if (notificationHeaderH6) {
        insertionPoint = notificationHeaderH6.closest('li'); 
        console.log('Insertion point (LI của Thông báo):', insertionPoint);
    } else {
        console.warn('Không tìm thấy header thông báo trong menu dropdown. Sẽ cố gắng thêm vào đầu menu.');
        insertionPoint = notificationDropdownMenu.querySelector('li:first-child');
        if (insertionPoint) {
            console.log('Fallback insertion point (first LI):', insertionPoint);
        } else {
            console.warn('Không tìm thấy điểm chèn nào trong menu thông báo.');
            return; 
        }
    }

    notificationDropdownMenu.querySelectorAll('.dynamic-notification-item').forEach(item => item.remove());
    console.log('Đã xóa các thông báo động cũ.');

    let orders = getAllOrdersFromLocalStorage(); 
    console.log('Tổng số đơn hàng từ localStorage:', orders.length, orders);

    const newOrders = orders.filter(order => order.status === 'Chờ xử lý');
    console.log('Số lượng đơn hàng "Chờ xử lý" sau khi lọc:', newOrders.length, newOrders);


    if (newOrders.length === 0) {
        console.log('Không có đơn hàng mới nào để hiển thị trong thông báo.');
        if (notificationBadge) {
            notificationBadge.textContent = ''; 
            notificationBadge.classList.add('d-none'); 
            console.log('Badge thông báo đã được ẩn/xóa số.');
        }
        return;
    }

    newOrders.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/');
        const [dayB, monthB, yearB] = b.date.split('/');
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
        return dateB.getTime() - dateA.getTime();
    });

    let newNotificationCount = 0;

    newOrders.forEach(order => {
        const listItem = document.createElement('li');
        listItem.classList.add('dynamic-notification-item'); 
        
        const link = document.createElement('a');
        link.classList.add('dropdown-item');
        link.href = `#orders-tab-pane`; 
        link.setAttribute('data-bs-toggle', 'tab');
        link.setAttribute('data-bs-target', '#orders-tab-pane');
        link.setAttribute('aria-controls', 'orders-tab-pane');
        link.setAttribute('aria-selected', 'false'); 
        
        const displayOrderId = order.id.startsWith('ORD-') ? order.id.split('-')[1] : order.id;
        // Thay đổi ở đây: ưu tiên customerDetails.name, nếu không có thì dùng customer
        const customerDisplayName = order.customerInfo ? order.customerInfo.name : order.customer;
        link.innerHTML = `Đơn hàng mới #${displayOrderId} - ${customerDisplayName} (${order.status})`; 

        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            const ordersTab = document.getElementById('order');
            if (ordersTab) {
                const bsTab = new bootstrap.Tab(ordersTab);
                bsTab.show(); 
                console.log(`Đã chuyển đến tab Đơn hàng từ thông báo #${order.id}`);
            }
        });

        listItem.appendChild(link);
        
        if (insertionPoint) {
            insertionPoint.after(listItem);
            insertionPoint = listItem; 
            console.log(`Đã chèn thông báo cho đơn hàng ${order.id}`);
        } else {
            notificationDropdownMenu.appendChild(listItem); 
            console.log(`Fallback: Đã chèn thông báo cho đơn hàng ${order.id} vào cuối menu.`);
        }
        newNotificationCount++;
    });

    if (notificationBadge) {
        if (newNotificationCount > 0) {
            notificationBadge.textContent = newNotificationCount;
            notificationBadge.classList.remove('d-none'); 
            console.log(`Badge thông báo đã được cập nhật: ${newNotificationCount}`);
        } else {
            notificationBadge.textContent = '';
            notificationBadge.classList.add('d-none'); 
            console.log('Badge thông báo đã được ẩn/xóa số.');
        }
    }
    console.log(`Hoàn tất cập nhật thông báo. Có ${newNotificationCount} đơn hàng mới.`);
}

// Hàm tính tổng doanh thu
function calculateTotalRevenue() {
    // Lấy danh sách đơn hàng từ localStorage
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    // Lọc các đơn hàng có trạng thái "Đã hoàn thành"
    const completedOrders = orders.filter(order => order.status === "Đã hoàn thành");

    // Tính tổng doanh thu từ các đơn hàng đã hoàn thành
    const totalRevenue = completedOrders.reduce((sum, order) => {
        // Hỗ trợ cả hai trường: totalPrice hoặc total
        const thanhTien = order.totalPrice !== undefined ? order.totalPrice : order.total !== undefined ? order.total : 0;
        return sum + thanhTien;
    }, 0);

    // Cập nhật giá trị vào phần tử có ID "totalRevenue"
    document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND"
    });
}

// Cập nhật số liệu Đơn hàng, Khách hàng, Sản phẩm trên dashboard
function updateDashboardStats() {
    // Lấy danh sách đơn hàng từ localStorage
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    // Lọc các đơn hàng đã hoàn thành
    const completedOrders = orders.filter(order => order.status === "Đã hoàn thành");
    // Đếm số đơn hàng đã hoàn thành
    document.getElementById("totalOrders").textContent = completedOrders.length;
    // Đếm số khách hàng duy nhất từ các đơn hàng đã hoàn thành
    const uniqueCustomers = new Set(completedOrders.map(order => order.customerInfo && order.customerInfo.phone ? order.customerInfo.phone : null).filter(Boolean));
    document.getElementById("totalCustomers").textContent = uniqueCustomers.size;
    // Đếm tổng số sản phẩm từ product.json
    fetch('data/product.json')
        .then(res => res.json())
        .then(products => {
            document.getElementById("totalProducts").textContent = products.length;
        });
}

// Hàm cập nhật biểu đồ loại xe bán chạy dựa trên đơn hàng đã hoàn thành
function updateBestSellingVehicleChart() {
    // Lấy danh sách đơn hàng đã hoàn thành
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const completedOrders = orders.filter(order => order.status === "Đã hoàn thành");
    const bestSellingTypeList = document.getElementById('bestSellingTypeList');
    if (bestSellingTypeList) bestSellingTypeList.innerHTML = '';
    if (completedOrders.length === 0) {
        if (window.productChartInstance) {
            window.productChartInstance.data.labels = [];
            window.productChartInstance.data.datasets[0].data = [];
            window.productChartInstance.update();
        }
        return;
    }
    fetch('data/product.json')
        .then(res => res.json())
        .then(products => {
            const productTypeMap = {};
            products.forEach(p => {
                productTypeMap[String(p.id)] = p.loaiXe;
            });
            const typeCount = {};
            completedOrders.forEach(order => {
                if (Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const prodId = item.productId !== undefined ? item.productId : item.id;
                        const type = productTypeMap[String(prodId)];
                        if (type) {
                            typeCount[type] = (typeCount[type] || 0) + (item.quantity ? Number(item.quantity) : 1);
                        }
                    });
                }
            });
            const labels = Object.keys(typeCount);
            const data = Object.values(typeCount);
            // Cập nhật lại biểu đồ Chart.js
            const ctx = document.getElementById('productChart');
            if (ctx) {
                if (window.productChartInstance) {
                    window.productChartInstance.data.labels = labels;
                    window.productChartInstance.data.datasets[0].data = data;
                    window.productChartInstance.update();
                } else {
                    window.productChartInstance = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: data,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.7)',
                                    'rgba(54, 162, 235, 0.7)',
                                    'rgba(255, 206, 86, 0.7)',
                                    'rgba(75, 192, 192, 0.7)',
                                    'rgba(153, 102, 255, 0.7)',
                                    'rgba(255, 159, 64, 0.7)',
                                    'rgba(100, 200, 100, 0.7)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                }
                            }
                        }
                    });
                }
            }
            // Hiển thị danh sách loại xe bán chạy
            if (bestSellingTypeList) {
                if (labels.length === 0) {
                    bestSellingTypeList.innerHTML = '<li class="list-group-item text-muted">Chưa có dữ liệu</li>';
                } else {
                    // Sắp xếp giảm dần theo số lượng
                    const sorted = labels.map((type, i) => ({type, count: data[i]})).sort((a, b) => b.count - a.count);
                    bestSellingTypeList.innerHTML = sorted.map(item => `<li class="list-group-item d-flex justify-content-between align-items-center">${item.type}<span class="badge bg-primary rounded-pill">${item.count}</span></li>`).join('');
                }
            }
        });
}

// Hàm cập nhật biểu đồ doanh thu theo khoảng thời gian đã chọn (1, 3, 6 tháng), lấy dữ liệu từ đơn hàng đã hoàn thành
function updateRevenueChart(days = 30) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const completedOrders = orders.filter(order => order.status === "Đã hoàn thành");
    const today = new Date();
    today.setHours(0,0,0,0);
    // Tạo mảng các ngày trong khoảng days gần đây (theo thứ tự tăng dần)
    const dateLabels = [];
    const revenueData = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        d.setHours(0,0,0,0);
        const label = d.toLocaleDateString('vi-VN');
        dateLabels.push(label);
        // Tính tổng doanh thu cho ngày này
        const total = completedOrders.filter(order => {
            if (!order.date) return false;
            // order.date dạng dd/mm/yyyy
            const [day, month, year] = order.date.split('/');
            const orderDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            orderDate.setHours(0,0,0,0);
            return orderDate.getTime() === d.getTime();
        }).reduce((sum, order) => {
            const thanhTien = order.totalPrice !== undefined ? order.totalPrice : order.total !== undefined ? order.total : 0;
            return sum + thanhTien;
        }, 0);
        revenueData.push(total);
    }
    // Vẽ hoặc cập nhật biểu đồ
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
        if (window.revenueChartInstance) {
            window.revenueChartInstance.data.labels = dateLabels;
            window.revenueChartInstance.data.datasets[0].data = revenueData;
            window.revenueChartInstance.update();
        } else {
            window.revenueChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dateLabels,
                    datasets: [{
                        label: 'Doanh thu',
                        data: revenueData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString('vi-VN');
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    calculateTotalRevenue();
    updateDashboardStats();
    updateBestSellingVehicleChart();
    updateRevenueChart(30);
    const rangeSelect = document.getElementById('revenueRangeSelect');
    if (rangeSelect) {
        rangeSelect.addEventListener('change', function() {
            updateRevenueChart(parseInt(this.value));
        });
    }
});

function applyDarkMode(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        // Nếu bạn muốn cả sidebar cũng đổi màu theo chế độ tối, bạn có thể thêm class cho sidebar
        // document.getElementById('sidebar').classList.add('dark-mode-sidebar');
    } else {
        document.body.classList.remove('dark-mode');
        // document.getElementById('sidebar').classList.remove('dark-mode-sidebar');
    }
}

// Lắng nghe sự kiện khi tài liệu đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // ... (các code DOMContentLoaded hiện có của bạn) ...

    const darkModeToggle = document.getElementById('darkModeToggle');

    if (darkModeToggle) {
        // 1. Kiểm tra trạng thái đã lưu trong localStorage khi trang tải
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'enabled') {
            darkModeToggle.checked = true; // Đặt trạng thái nút toggle
            applyDarkMode(true); // Áp dụng chế độ tối
        } else {
            darkModeToggle.checked = false; // Đảm bảo nút toggle ở trạng thái tắt
            applyDarkMode(false); // Áp dụng chế độ sáng mặc định
        }

        // 2. Lắng nghe sự kiện thay đổi trên nút toggle
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                applyDarkMode(true);
                localStorage.setItem('darkMode', 'enabled'); // Lưu trạng thái
            } else {
                applyDarkMode(false);
                localStorage.setItem('darkMode', 'disabled'); // Lưu trạng thái
            }
        });
    }
});

// Hàm load sản phẩm từ product.json
async function loadProductsFromJSON() {
    try {
        const response = await fetch('data/product.json');
        const productsData = await response.json();
        localStorage.setItem('products', JSON.stringify(productsData));
        loadProducts();
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm từ product.json:', error);
        showAlert('Không thể tải sản phẩm từ dữ liệu JSON.', 'danger');
    }
}

// Hàm load sản phẩm
function loadProducts() {
    const productsTableBody = document.getElementById('productsTableBody');
    if (!productsTableBody) return;

    productsTableBody.innerHTML = '';
    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (products.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có sản phẩm nào.</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="img-thumbnail" 
                     style="width: 100px; height: 60px; object-fit: cover;">
            </td>
            <td>${product.name}</td>
            <td>${product.loaiXe}</td>
            <td>${product.price ? product.price.toLocaleString('vi-VN') : 'N/A'} VNĐ</td>
            <td>
                <span class="badge ${product.status === 'active' ? 'bg-success' : 'bg-danger'}">
                    ${product.status === 'active' ? 'Còn hàng' : 'Hết hàng'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        productsTableBody.appendChild(row);
    });

    attachProductTableEvents();
}

// Hàm lưu sản phẩm
function saveProduct() {
    const productForm = document.getElementById('productForm');
    const formData = new FormData(productForm);

    const product = {
        id: currentProductId || Date.now().toString(),
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        image: formData.get('image'),
        description: formData.get('description')
    };

    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (currentProductId) {
        // Cập nhật sản phẩm hiện có
        const index = products.findIndex(p => p.id === currentProductId);
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        // Thêm sản phẩm mới
        products.push(product);
    }

    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
    resetProductForm();
    $('#productModal').modal('hide');
}

// Khởi tạo sản phẩm từ JSON khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromJSON();

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }
});

// Hàm thêm sản phẩm vào storage
function addProductToStorage(product) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
}

// Hàm reset form sản phẩm
function resetProductForm() {
    const productForm = document.getElementById('productForm');
    productForm.reset();
    currentProductId = null;
    document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm mới';
}

// Hàm khởi tạo sản phẩm mẫu
function initializeSampleProducts() {
    const sampleProducts = [
        {
            id: '1',
            name: 'Kawasaki Ninja ZX-10R',
            category: 'Thể thao',
            price: 750000000,
            stock: 5,
            image: 'Images/Ninja ZX-10R ABS 2.jpg',
            description: 'Mô tô thể thao phân khối lớn'
        },
        {
            id: '2',
            name: 'Honda CBR1000RR-R',
            category: 'Thể thao',
            price: 800000000,
            stock: 3,
            image: 'Images/Honda CBR1000RR-R.jpg',
            description: 'Mô tô thể thao phân khối lớn'
        }
    ];

    localStorage.setItem('products', JSON.stringify(sampleProducts));
    loadProducts();
}

// Thêm event listeners cho quản lý sản phẩm
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Khởi tạo sản phẩm mẫu
    initializeSampleProducts();
    
    // Load sản phẩm
    loadProducts();

    // Xử lý sự kiện khi chọn hình ảnh
    const productImageInput = document.getElementById('productImage');
    if (productImageInput) {
        productImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('imagePreview');
                    if (imagePreview) {
                        imagePreview.classList.remove('d-none');
                        const img = imagePreview.querySelector('img');
                        if (img) {
                            img.src = e.target.result;
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Xử lý sự kiện khi đóng modal
    const addProductModal = document.getElementById('addProductModal');
    if (addProductModal) {
        addProductModal.addEventListener('hidden.bs.modal', function() {
            resetProductForm();
        });
    }

    // Xử lý sự kiện khi submit form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }

    // Xử lý sự kiện khi xóa sản phẩm
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteProduct);
    }
});

// Hàm để khởi tạo sản phẩm mẫu
function initializeSampleProducts() {
    console.log('Initializing sample products...');
    // Kiểm tra xem đã có sản phẩm trong localStorage chưa
    if (products.length === 0) {
        console.log('No products found, adding sample products...');
        products = [
            {
                id: 1,
                name: "Honda CBR1000RR",
                type: "Sport",
                price: 850000000,
                status: "active",
                description: "Mô tô thể thao cao cấp với động cơ 1000cc",
                image: "Images/honda-cbr1000rr.jpg"
            },
            {
                id: 2,
                name: "Yamaha R1",
                type: "Sport",
                price: 820000000,
                status: "active",
                description: "Mô tô thể thao đẳng cấp với công nghệ MotoGP",
                image: "Images/yamaha-r1.jpg"
            },
            {
                id: 3,
                name: "Ducati Panigale V4",
                type: "Sport",
                price: 1250000000,
                status: "inactive",
                description: "Mô tô thể thao Ý với động cơ V4",
                image: "Images/ducati-panigale-v4.jpg"
            },
            {
                id: 4,
                name: "BMW S1000 RR",
                type: "Sport",
                price: 950000000,
                status: "active",
                description: "Mô tô thể thao Đức với công nghệ tiên tiến",
                image: "Images/bmw-s1000rr.jpg"
            },
            {
                id: 5,
                name: "BMW F 900 XR",
                type: "Adventure",
                price: 550000000,
                status: "active",
                description: "Mô tô adventure touring đa năng",
                image: "Images/bmw-f900xr.jpg"
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
        console.log('Sample products added successfully');
    } else {
        console.log('Products already exist in localStorage');
    }
}

// Hàm xóa sản phẩm
function deleteProduct(productId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        products = products.filter(product => product.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        showAlert('Xóa sản phẩm thành công!', 'success');
    }
}

// Hàm sửa sản phẩm
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        currentProductId = productId;
        const form = document.getElementById('productForm');
        
        // Điền thông tin sản phẩm vào form
        form.querySelector('[name="name"]').value = product.name;
        form.querySelector('[name="category"]').value = product.category;
        form.querySelector('[name="price"]').value = product.price;
        form.querySelector('[name="stock"]').value = product.stock;
        form.querySelector('[name="description"]').value = product.description;
        
        // Cập nhật tiêu đề modal
        document.getElementById('productModalTitle').textContent = 'Sửa sản phẩm';
        
        // Hiển thị modal
        $('#productModal').modal('show');
    }
}

// Hàm gắn sự kiện cho các nút trong bảng sản phẩm
function attachProductTableEvents() {
    // Sự kiện cho nút sửa
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.id;
            editProduct(productId);
        });
    });

    // Sự kiện cho nút xóa
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.id;
            deleteProduct(productId);
        });
    });
}