// Hiển thị ngày tháng hiện tại ở topbar
document.getElementById('current-date').textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

if (!localStorage.getItem('phuong_articles')) {
    localStorage.setItem('phuong_articles', JSON.stringify([]));
}

const appContent = document.getElementById('app-content');
let myEditor; // Biến lưu trữ Trình soạn thảo

function renderApp() {
    checkLoginStatus();
    renderHome();
}

function checkLoginStatus() {
    const user = sessionStorage.getItem('currentUser');
    const headerActions = document.getElementById('header-actions');
    
    if (user) {
        headerActions.innerHTML = `
            <span style="font-size:14px; margin-right:15px; font-weight:bold;">Xin chào, Cán bộ ${user}</span>
            <button class="btn-action" onclick="renderPostForm()">+ Viết bài mới</button>
            <button class="btn-action btn-logout" onclick="handleLogout()" style="margin-left:10px;">Đăng xuất</button>
        `;
    } else {
        headerActions.innerHTML = `<button class="btn-action" onclick="openModal()">Cán bộ đăng nhập</button>`;
    }
}

function renderHome() {
    const articles = JSON.parse(localStorage.getItem('phuong_articles')) || [];
    const user = sessionStorage.getItem('currentUser'); // Kiểm tra xem có ai đang đăng nhập không
    
    let html = `<h2 class="section-title">TIN TỨC - SỰ KIỆN MỚI NHẤT</h2><div class="article-grid">`;
    
    if (articles.length === 0) {
        html += `<p style="grid-column: span 2; color:#888;">Hệ thống chưa có bài viết nào.</p>`;
    } else {
        articles.forEach((art, index) => {
            
            // Tạo nút Xóa (chỉ hiển thị nếu cán bộ đã đăng nhập)
            let deleteButton = "";
            if (user) {
                deleteButton = `
                    <button onclick="deletePost(${index}, event)" style="margin-top: 15px; width: 100%; padding: 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        🗑️ Xóa bài viết
                    </button>
                `;
            }

            html += `
                <div class="article-card" onclick="renderDetail(${index})">
                    <img src="${art.image}" alt="Thumb">
                    <div class="article-body">
                        <h3 class="article-title">${art.title}</h3>
                        <span class="article-date">🕒 ${art.date}</span>
                        ${deleteButton}
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;
    appContent.innerHTML = html;
}

// Hàm xử lý việc xóa bài viết
function deletePost(index, event) {
    // Ngăn không cho sự kiện click lan ra thẻ cha (tránh việc click Xóa mà lại mở chi tiết bài viết)
    event.stopPropagation(); 

    // Hiển thị hộp thoại xác nhận để tránh bấm nhầm
    if (confirm("Đồng chí có chắc chắn muốn xóa bài báo này không? Thao tác này không thể hoàn tác!")) {
        
        // 1. Lấy danh sách bài viết hiện tại
        let articles = JSON.parse(localStorage.getItem('phuong_articles')) || [];
        
        // 2. Xóa 1 phần tử tại vị trí 'index'
        articles.splice(index, 1);
        
        // 3. Lưu lại danh sách mới vào bộ nhớ
        localStorage.setItem('phuong_articles', JSON.stringify(articles));
        
        // 4. Thông báo và tải lại giao diện
        alert("Đã xóa bài viết thành công!");
        renderHome();
    }
}

function renderPostForm() {
    appContent.innerHTML = `
        <div style="background:white; padding:30px; border-radius:8px; border:1px solid #eee;">
            <h2 class="section-title">TẠO BÀI VIẾT / THÔNG BÁO MỚI</h2>
            <label style="font-weight:bold; font-size:14px;">Tiêu đề bài viết</label>
            <input type="text" id="post-title" class="input-field" placeholder="Nhập tiêu đề...">
            
            <label style="font-weight:bold; font-size:14px;">URL Ảnh Bìa (Hiển thị ở trang chủ)</label>
            <input type="text" id="post-image" class="input-field" placeholder="https://...">
            
            <label style="font-weight:bold; font-size:14px;">Nội dung chi tiết</label>
            <textarea id="post-content" placeholder="Nhập nội dung văn bản..."></textarea>
            
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="btn-submit" onclick="submitPost()" style="width:auto;">XUẤT BẢN BÀI VIẾT</button>
                <button class="btn-action btn-logout" onclick="renderHome()">HỦY BỎ</button>
            </div>
        </div>
    `;

    // Kích hoạt CKEditor ngay sau khi vẽ xong giao diện
    ClassicEditor
        .create(document.querySelector('#post-content'))
        .then(editor => {
            myEditor = editor; // Lưu lại để lát lấy dữ liệu
        })
        .catch(error => {
            console.error(error);
        });
}

function renderDetail(index) {
    const articles = JSON.parse(localStorage.getItem('phuong_articles')) || [];
    const art = articles[index];
    appContent.innerHTML = `
        <div style="background:white; padding:30px; border-radius:8px; border:1px solid #eee;">
            <button class="btn-action btn-logout" onclick="renderHome()" style="margin-bottom:20px;">&larr; Quay lại danh sách</button>
            <h1 style="color:var(--primary-color); margin-top:0;">${art.title}</h1>
            <p style="color:#666; border-bottom:1px solid #eee; padding-bottom:10px;">🕒 Đăng lúc: ${art.date}</p>
            <img src="${art.image}" style="width:100%; border-radius:8px; margin-bottom:20px; max-height:400px; object-fit:cover;">
            <div style="white-space: pre-wrap; font-size:16px; line-height:1.8;">${art.content}</div>
        </div>
    `;
}

function submitPost() {
    const title = document.getElementById('post-title').value;
    const image = document.getElementById('post-image').value || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    // LẤY DỮ LIỆU TỪ CKEDITOR THAY VÌ TEXTAREA THÔNG THƯỜNG
    const content = myEditor.getData(); 

    if (!title || !content) return alert("Vui lòng điền đủ Tiêu đề và Nội dung!");

    let articles = JSON.parse(localStorage.getItem('phuong_articles')) || [];
    const newArt = { title, image, content, date: new Date().toLocaleString('vi-VN') };

    articles.unshift(newArt);
    if (articles.length > 4) articles.pop();

    localStorage.setItem('phuong_articles', JSON.stringify(articles));
    alert("Xuất bản bài viết thành công!");
    renderHome();
}

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
        renderHome();
    } else {
        alert("Thông tin không chính xác hoặc tài khoản chưa được cấp!");
    }
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    checkLoginStatus();
    renderHome();
}

function openModal() { document.getElementById('loginModal').style.display = 'block'; }
function closeModal() { document.getElementById('loginModal').style.display = 'none'; }

window.addEventListener('storage', () => {
    if(document.querySelector('.article-grid')) renderHome();
});

renderApp();