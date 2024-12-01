<?php
// api/events/update.php
require_once __DIR__ . '/../common/db.php';

// 인증된 사용자 확인
$user = checkAuth();

// JSON 입력 데이터 파싱
$data = getJSONInput();

// 필수 필드 검증
if (!isset($data['id']) || empty($data['title']) || empty($data['date']) || empty($data['time'])) {
    sendJSON(['error' => '필수 입력값이 누락되었습니다'], 400);
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
    
    // 수정 권한 확인 (작성자 본인 또는 관리자)
    if ($event['author_id'] !== $user['id'] && !$user['isAdmin']) {
        sendJSON(['error' => '수정 권한이 없습니다'], 403);
    }
    
    // 이벤트 업데이트
    $stmt = $pdo->prepare("
        UPDATE events 
        SET 
            date = ?,
            time = ?,
            title = ?,
            content = ?,
            important = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    
    $success = $stmt->execute([
        $data['date'],
        $data['time'],
        $data['title'],
        $data['content'] ?? '',
        isset($data['important']) ? $data['important'] : false,
        $data['id']
    ]);

    if ($success) {
        sendJSON([
            'success' => true,
            'message' => '게시글이 수정되었습니다'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Event Update Error: " . $e->getMessage());
    sendJSON(['error' => '게시글 수정 중 오류가 발생했습니다'], 500);
}
