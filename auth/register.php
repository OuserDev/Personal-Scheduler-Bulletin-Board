<?php
session_start();

// DB 연결
$pdo = new PDO(
    "mysql:host=localhost;dbname=personal_scheduler;charset=utf8mb4",
    "root",
    "",
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]
);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $name = $_POST['name'];
    
    error_log("REGISTER ATTEMPT - Username: $username, Name: $name");
    
    // 아이디 중복 검사
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetchColumn() > 0) {
        error_log("REGISTER FAILED - Username already exists: $username");
        $_SESSION['error'] = '이미 사용중인 아이디입니다.';
        header('Location: ../main.html');
        exit();
    }
    
    // 새 사용자 등록
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO users (username, password, name, join_date) 
        VALUES (?, ?, ?, CURDATE())
    ");
    
    if ($stmt->execute([$username, $hashedPassword, $name])) {
        error_log("REGISTER SUCCESS - New user created: $username");
        $_SESSION['success'] = '회원가입이 완료되었습니다. 로그인해주세요.';
    } else {
        error_log("REGISTER ERROR - Database insert failed for: $username");
        $_SESSION['error'] = '회원가입 처리 중 오류가 발생했습니다.';
    }
    
    header('Location: ../main.html');
    exit();
}
?>