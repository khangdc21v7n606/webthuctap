<?php
// Cấu hình để web trả về dữ liệu dạng JSON (giống API)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cho phép truy cập chéo

// Thông tin kết nối Database
$host = 'localhost';
$dbname = 'ubnd_phuong';
$user = 'root'; // Mặc định của XAMPP là root
$pass = '';     // Mặc định của XAMPP là rỗng

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["status" => "error", "message" => "Lỗi kết nối Database!"]));
}

// Lấy hành động mà JavaScript yêu cầu (ví dụ: action=get_articles)
$action = $_GET['action'] ?? '';

// 1. LẤY DANH SÁCH BÀI VIẾT
if ($action == 'get_articles') {
    // Chỉ lấy 4 bài mới nhất cho trang chủ
    $stmt = $pdo->query("SELECT * FROM articles ORDER BY created_at DESC LIMIT 4");
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($articles);
}

// 2. THÊM BÀI VIẾT MỚI
elseif ($action == 'add_article') {
    // Nhận dữ liệu do JS gửi lên
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO articles (title, image, content) VALUES (?, ?, ?)");
    if($stmt->execute([$data['title'], $data['image'], $data['content']])) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}

// 3. KIỂM TRA ĐĂNG NHẬP
elseif ($action == 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
    $stmt->execute([$data['username'], $data['password']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(["status" => "success", "username" => $user['username']]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}

// 4. XÓA BÀI VIẾT
elseif ($action == 'delete_article') {
    // Nhận ID bài viết từ JS
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Ra lệnh cho MySQL xóa dòng có ID tương ứng
    $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
    if($stmt->execute([$data['id']])) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}

// 5. THÊM USER MỚI (Dành cho Admin)
elseif ($action == 'add_user') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Dùng try-catch để bắt lỗi nếu tên đăng nhập (username) bị trùng
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'canbo')");
        $stmt->execute([$data['username'], $data['email'], $data['password']]);
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Tên đăng nhập đã tồn tại!"]);
    }
}

// 6. LẤY DANH SÁCH USER (Chỉ lấy cán bộ, không lấy admin)
elseif ($action == 'get_users') {
    $stmt = $pdo->query("SELECT id, username, email FROM users WHERE role = 'canbo'");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
}

// 7. XÓA USER
elseif ($action == 'delete_user') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    if($stmt->execute([$data['id']])) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}

// 8. LẤY TẤT CẢ BÀI VIẾT (Dành cho trang Tin tức)
elseif ($action == 'get_all_articles') {
    // Không dùng LIMIT 4 để lấy toàn bộ kho lưu trữ
    $stmt = $pdo->query("SELECT * FROM articles ORDER BY created_at DESC");
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($articles);
}
?>