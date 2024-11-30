<?php
// api/common/db.php

function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=localhost;dbname=personal_scheduler;charset=utf8mb4",
                "root",
                "",
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
        } catch (PDOException $e) {
            // 개발 중에는 상세한 에러 로그를 남기되, 프로덕션에서는 최소한의 정보만 노출
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("데이터베이스 연결 중 오류가 발생했습니다");
        }
    }
    
    return $pdo;
}

// 인증 상태를 확인하는 유틸리티 함수
function checkAuth() {
    session_start();
    if (!isset($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(['error' => '로그인이 필요합니다']);
        exit();
    }
    return $_SESSION['user'];
}

// 관리자 권한을 확인하는 유틸리티 함수
function checkAdmin() {
    $user = checkAuth();
    if (!$user['isAdmin']) {
        http_response_code(403);
        echo json_encode(['error' => '관리자 권한이 필요합니다']);
        exit();
    }
    return $user;
}

// JSON 응답을 보내는 유틸리티 함수
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// JSON 요청 데이터를 파싱하는 유틸리티 함수
function getJSONInput() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendJSON(['error' => '잘못된 JSON 형식입니다'], 400);
    }
    
    return $data;
}