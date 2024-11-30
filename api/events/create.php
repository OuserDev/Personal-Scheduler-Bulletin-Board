<?php
// api/events/create.php

require_once __DIR__ . '/../common/db.php';

// 인증 확인
$user = checkAuth();

// JSON 입력 데이터 파싱
$data = getJSONInput();

// 필수 필드 검증
if (empty($data['title']) || empty($data['date']) || empty($data['time'])) {
    sendJSON(['error' => '필수 입력값이 누락되었습니다'], 400);
}

try {
    $pdo = getDBConnection();
    
    // 이벤트 생성 쿼리
    $stmt = $pdo->prepare("
        INSERT INTO events (
            date, 
            time, 
            title, 
            content, 
            important, 
            author_id, 
            is_private
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $success = $stmt->execute([
        $data['date'],
        $data['time'],
        $data['title'],
        $data['content'] ?? '',
        isset($data['important']) ? $data['important'] : false,
        $user['id'],
        true // 기본적으로 private으로 설정
    ]);

    if ($success) {
        // 생성된 이벤트의 ID를 포함하여 응답
        sendJSON([
            'success' => true,
            'message' => '일정이 등록되었습니다',
            'eventId' => $pdo->lastInsertId()
        ]);
    }
} catch (Exception $e) {
    error_log("Event Creation Error: " . $e->getMessage());
    sendJSON(['error' => '일정 등록 중 오류가 발생했습니다'], 500);
}