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
    const user = sessionStorage.getItem('currentUser');

    // GỌI PHP để lấy bài viết
    fetch('api.php?action=get_articles')
        .then(response => response.json())
        .then(articles => {
            let html = `<h2 class="section-title">TIN TỨC - SỰ KIỆN MỚI NHẤT</h2><div class="article-grid">`;

            if (articles.length === 0) {
                html += `<p style="grid-column: span 2; color:#888;">Chưa có bài viết nào.</p>`;
            } else {
                articles.forEach((art) => {

                    // 1. XỬ LÝ ẢNH MẶC ĐỊNH (Hình Obama)
                    // Nếu art.image bị rỗng, nó sẽ tự lấy link ảnh Obama
                    const imageUrl = art.image ? art.image : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                    // 2. TẠO NÚT XÓA (Chỉ hiện khi có cán bộ đăng nhập)
                    let deleteButton = "";
                    if (user) {
                        // Chú ý: Truyền art.id (ID trong Database) thay vì index
                        deleteButton = `
                            <button onclick="deletePost(${art.id}, event)" style="margin-top: 15px; width: 100%; padding: 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                                🗑️ Xóa bài viết
                            </button>
                        `;
                    }

                    html += `
                        <div class="article-card" onclick="renderDetail(${art.id})">
                            <img src="${imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';" alt="Thumb">
                            <div class="article-body">
                                <h3 class="article-title">${art.title}</h3>
                                <span class="article-date">🕒 ${art.created_at}</span>
                                ${deleteButton}
                            </div>
                        </div>
                    `;
                });
            }
            html += `</div>`;
            document.getElementById('app-content').innerHTML = html;
        })
        .catch(err => console.error("Lỗi khi tải dữ liệu:", err));
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

// Xem chi tiết bài viết (Đã nâng cấp dùng PHP)
function renderDetail(id) {
    // Gọi PHP để lấy bài viết
    fetch('api.php?action=get_articles')
        .then(response => response.json())
        .then(articles => {
            const art = articles.find(a => a.id == id); // Tìm bài đúng ID
            if (!art) return;

            const imageUrl = art.image ? art.image : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

            // Vẽ nội dung chi tiết
            appContent.innerHTML = `
                <div style="background:white; padding:30px; border-radius:8px; border:1px solid #eee;">
                    <button class="btn-action btn-logout" onclick="renderHome()" style="margin-bottom:20px;">&larr; Quay lại trang chủ</button>
                    <h1 style="color:var(--primary-color); margin-top:0;">${art.title}</h1>
                    <p style="color:#666; border-bottom:1px solid #eee; padding-bottom:10px;">🕒 Đăng lúc: ${art.created_at}</p>
                    <img src="${imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';" style="width:100%; border-radius:8px; margin-bottom:20px; max-height:400px; object-fit:cover;">
                    <div style="white-space: pre-wrap; font-size:16px; line-height:1.8;">${art.content}</div>
                </div>
            `;
        })
        .catch(err => console.error("Lỗi tải chi tiết:", err));
}

function submitPost() {
    const title = document.getElementById('post-title').value;
    const image = document.getElementById('post-image').value || 'https://via.placeholder.com/400x200';

    // --- ĐÂY LÀ DÒNG CẦN SỬA ---
    // Xóa dòng cũ: const content = document.getElementById('post-content').value;
    // Thay bằng dòng mới:
    const content = myEditor.getData();

    // Kiểm tra xem đã nhập đủ chưa
    if (!title || !content) {
        return alert("Vui lòng điền đủ Tiêu đề và Nội dung!");
    }

    // Gói dữ liệu lại
    const postData = { title: title, image: image, content: content };

    // Gửi lên PHP thông qua phương thức POST
    fetch('api.php?action=add_article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Xuất bản bài viết thành công!");
                renderHome(); // Tải lại trang web để hiện bài mới
            } else {
                alert("Đã xảy ra lỗi khi lưu vào Database.");
            }
        })
        .catch(err => {
            console.error("Lỗi:", err);
            alert("Không thể kết nối đến máy chủ PHP!");
        });
}

function handleLogin() {
    const u = document.getElementById('login-user').value;
    const e = document.getElementById('login-email').value; // Có thể bỏ qua email nếu đăng nhập chỉ cần user/pass
    const p = document.getElementById('login-pass').value;

    if (!u || !p) return alert("Vui lòng nhập đủ thông tin!");

    // Gọi PHP để kiểm tra đăng nhập trên Database
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
                renderHome();
            } else {
                alert("Sai tên đăng nhập hoặc mật khẩu!");
            }
        })
        .catch(err => {
            console.error("Lỗi đăng nhập:", err);
            alert("Không thể kết nối đến máy chủ!");
        });
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    checkLoginStatus();
    renderHome();
}

function openModal() { document.getElementById('loginModal').style.display = 'block'; }
function closeModal() { document.getElementById('loginModal').style.display = 'none'; }

window.addEventListener('storage', () => {
    if (document.querySelector('.article-grid')) renderHome();
});

renderApp();
// Hàm yêu cầu PHP xóa bài viết
function deletePost(id, event) {
    event.stopPropagation(); // Ngăn việc click nhầm vào xem chi tiết bài

    if (confirm("Đồng chí có chắc chắn muốn xóa bài viết này khỏi hệ thống?")) {
        fetch('api.php?action=delete_article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }) // Gửi ID của bài viết lên cho PHP
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Đã xóa bài viết thành công!");
                    renderHome(); // Tải lại giao diện
                } else {
                    alert("Lỗi: Không thể xóa bài viết!");
                }
            });
    }
}