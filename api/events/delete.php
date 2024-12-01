<?php
// api/events/delete.php
require_once __DIR__ . '/../common/db.php';

// 인증된 사용자 확인
$user = checkAuth();

// JSON 입력 데이터 파싱
$data = getJSONInput();

// ID 검증
if (!isset($data['id'])) {
    sendJSON(['error' => '삭제할 게시글 ID가 누락되었습니다'], 400);
}

try {
    $pdo = getDBConnection();
    
    // 먼저 해당 이벤트의 소유자 확인
    $stmt = $pdo->prepare("
        SELECT author_id 
        FROM events 
        WHERE id = ?
    ");
    $stmt->execute([$data['id']]);
    $event = $stmt->fetch();
    
    if (!$event) {
        sendJSON(['error' => '존재하지 않는 게시글입니다'], 404);
    }
    
    // 삭제 권한 확인 (작성자 본인 또는 관리자)
    if ($event['author_id'] !== $user['id'] && !$user['isAdmin']) {
        sendJSON(['error' => '삭제 권한이 없습니다'], 403);
    }
    
    // 이벤트 완전 삭제
    $stmt = $pdo->prepare("
        DELETE FROM events 
        WHERE id = ?
    ");
    
    $success = $stmt->execute([$data['id']]);

    if ($success) {
        sendJSON([
            'success' => true,
            'message' => '게시글이 삭제되었습니다'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Event Delete Error: " . $e->getMessage());
    sendJSON(['error' => '게시글 삭제 중 오류가 발생했습니다'], 500);
}