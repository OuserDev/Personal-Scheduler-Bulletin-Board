<?php
session_start();

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
    
    // 단순한 ASCII 문자만 사용하여 로그 작성
    error_log("LOGIN ATTEMPT - User: $username");
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'isAdmin' => $user['is_admin'],
            'joinDate' => $user['join_date']
        ];
        
        error_log("LOGIN SUCCESS - User: $username");
        header('Location: ../main.html');
    } else {
        error_log("LOGIN FAILED - User: $username");
        $_SESSION['error'] = '아이디 또는 비밀번호가 올바르지 않습니다.';
        header('Location: ../main.html');
    }
    exit();
}
?>