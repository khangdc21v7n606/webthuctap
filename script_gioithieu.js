// 1. Hàm hiển thị ngày tháng hiện tại trên Top Bar
function renderDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// 2. Hàm kiểm tra trạng thái Cán bộ đăng nhập
// Vì chung domain, trang này vẫn đọc được sessionStorage từ lúc đăng nhập ở index.html
function checkLogin() {
    const user = sessionStorage.getItem('currentUser');
    const headerActions = document.getElementById('header-actions');
    
    if (headerActions) {
        if (user) {
            // Nếu đã đăng nhập thì hiện tên Cán bộ
            headerActions.innerHTML = `
                <span style="font-size:14px; font-weight:bold; color:white;">
                    Chào, Cán bộ ${user}
                </span>
            `;
        } else {
            // Nếu chưa thì hiện nút điều hướng về trang chủ để đăng nhập
            headerActions.innerHTML = `
                <a href="index.html">
                    <button class="btn-action">Đăng nhập</button>
                </a>
            `;
        }
    }
}

// 3. Khởi chạy các hàm khi trang web tải xong
document.addEventListener("DOMContentLoaded", function() {
    renderDate();
    checkLogin();
});