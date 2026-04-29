const archiveArea = document.getElementById('news-archive-content');

function init() {
    renderDate();
    checkLoginStatus();
    renderAllArticles();
}

// 1. Hiển thị ngày tháng
function renderDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

// 2. Kiểm tra đăng nhập
function checkLoginStatus() {
    const user = sessionStorage.getItem('currentUser');
    const headerActions = document.getElementById('header-actions');

    if (user) {
        headerActions.innerHTML = `
            <span style="font-size:14px; margin-right:15px; font-weight:bold; color:white;">Chào, ${user}</span>
            <button class="btn-action btn-logout" onclick="handleLogout()">Đăng xuất</button>
        `;
    } else {
        headerActions.innerHTML = `<button class="btn-action" onclick="openModal()">Đăng nhập</button>`;
    }
}

// 3. GỌI PHP LẤY TẤT CẢ BÀI VIẾT
function renderAllArticles() {
    const user = sessionStorage.getItem('currentUser');

    fetch('api.php?action=get_all_articles')
        .then(response => response.json())
        .then(articles => {
            let html = `<h2 class="section-title">KHO LƯU TRỮ TIN TỨC - SỰ KIỆN</h2>`;

            if (articles.length === 0) {
                html += `<p style="color:#888;">Hiện chưa có bài viết nào trong kho lưu trữ.</p>`;
            } else {
                html += `<div class="article-grid">`;
                articles.forEach((art) => {
                    // Xử lý ảnh mặc định và chống lỗi
                    const imageUrl = art.image ? art.image : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                    // Hiện nút xóa nếu đã đăng nhập
                    let deleteBtn = "";
                    if (user) {
                        deleteBtn = `
                            <button onclick="deletePost(${art.id}, event)" style="background:#dc3545; color:white; border:none; padding:8px; border-radius:4px; margin-top:10px; cursor:pointer; width:100%; font-weight:bold;">
                                🗑️ Xóa bài viết
                            </button>`;
                    }

                    html += `
                        <div class="article-card">
                            <img src="${imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';" alt="Hình ảnh">
                            <div class="article-body">
                                <h3 class="article-title">${art.title}</h3>
                                <span class="article-date">🕒 ${art.created_at}</span>
                                ${deleteBtn}
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
            }
            archiveArea.innerHTML = html;
        })
        .catch(err => console.error("Lỗi tải kho lưu trữ:", err));
}

// 4. Xóa bài viết
function deletePost(id, event) {
    if (event) event.stopPropagation();
    if (confirm("Đồng chí có chắc chắn muốn xóa bài viết này vĩnh viễn không?")) {
        fetch('api.php?action=delete_article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Đã xóa bài viết thành công!");
                    renderAllArticles(); // Cập nhật lại giao diện
                } else {
                    alert("Lỗi: Không thể xóa bài viết!");
                }
            });
    }
}

// 5. Đăng nhập / Đăng xuất qua PHP
function handleLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;

    if (!u || !p) return alert("Vui lòng nhập đủ thông tin!");

    fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                sessionStorage.setItem('currentUser', data.username);
                closeModal();
                checkLoginStatus();
                renderAllArticles(); // Tải lại bài viết kèm nút Xóa
            } else {
                alert("Sai tên đăng nhập hoặc mật khẩu!");
            }
        })
        .catch(err => alert("Không thể kết nối máy chủ!"));
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    checkLoginStatus();
    renderAllArticles();
}

// Modal logic
function openModal() { document.getElementById('loginModal').style.display = 'block'; }
function closeModal() { document.getElementById('loginModal').style.display = 'none'; }

// Chạy hệ thống
init();