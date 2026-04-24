document.getElementById('current-date').textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const archiveArea = document.getElementById('news-archive-content');

function init() {
    checkLoginStatus();
    renderAllArticles();
}

function checkLoginStatus() {
    const user = sessionStorage.getItem('currentUser');
    const headerActions = document.getElementById('header-actions');
    
    if (user) {
        headerActions.innerHTML = `
            <span style="font-size:14px; margin-right:15px; font-weight:bold;">Chào, ${user}</span>
            <button class="btn-action btn-logout" onclick="handleLogout()">Đăng xuất</button>
        `;
    } else {
        headerActions.innerHTML = `<button class="btn-action" onclick="openModal()">Đăng nhập</button>`;
    }
}

// Hiển thị TẤT CẢ bài viết (không giới hạn 4 bài)
function renderAllArticles() {
    const articles = JSON.parse(localStorage.getItem('phuong_articles')) || [];
    const user = sessionStorage.getItem('currentUser');
    
    let html = `<h2 class="section-title">KHO LƯU TRỮ TIN TỨC - SỰ KIỆN</h2>`;
    
    if (articles.length === 0) {
        html += `<p style="color:#888;">Hiện chưa có bài viết nào trong kho lưu trữ.</p>`;
    } else {
        html += `<div class="article-grid">`;
        articles.forEach((art, index) => {
            // Chỉ hiện nút xóa nếu cán bộ đã đăng nhập
            let deleteBtn = user ? `
                <button onclick="deletePost(${index})" style="background:#dc3545; color:white; border:none; padding:8px; border-radius:4px; margin-top:10px; cursor:pointer; width:100%; font-weight:bold;">
                    🗑️ Xóa bài viết
                </button>` : "";

            html += `
                <div class="article-card">
                    <img src="${art.image}" alt="Hình ảnh">
                    <div class="article-body">
                        <h3 class="article-title">${art.title}</h3>
                        <span class="article-date">🕒 ${art.date}</span>
                        ${deleteBtn}
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    archiveArea.innerHTML = html;
}

// Hàm xóa bài viết
function deletePost(index) {
    if (confirm("Đồng chí có chắc chắn muốn xóa bài viết này vĩnh viễn không?")) {
        let articles = JSON.parse(localStorage.getItem('phuong_articles')) || [];
        articles.splice(index, 1); // Xóa bài tại vị trí index
        localStorage.setItem('phuong_articles', JSON.stringify(articles)); // Cập nhật lại kho lưu trữ
        renderAllArticles(); // Vẽ lại giao diện
    }
}

// --- LOGIC ĐĂNG NHẬP / MODAL (Tương tự trang chủ) ---
function openModal() { document.getElementById('loginModal').style.display = 'block'; }
function closeModal() { document.getElementById('loginModal').style.display = 'none'; }

function handleLogin() {
    const u = document.getElementById('login-user').value;
    const e = document.getElementById('login-email').value;
    const p = document.getElementById('login-pass').value;
    const users = JSON.parse(localStorage.getItem('phuong_users')) || [];
    const valid = users.find(user => user.username === u && user.email === e && user.password === p);

    if (valid) {
        sessionStorage.setItem('currentUser', valid.username);
        closeModal();
        checkLoginStatus();
        renderAllArticles();
    } else { alert("Sai thông tin đăng nhập!"); }
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    checkLoginStatus();
    renderAllArticles();
}

// Tự động cập nhật nếu có thay đổi từ các tab khác
window.addEventListener('storage', (e) => {
    if (e.key === 'phuong_articles') renderAllArticles();
    if (e.key === 'phuong_users') checkLoginStatus();
});

init();