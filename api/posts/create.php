<?php
require_once __DIR__ . '/../common/db.php';

$user = checkAuth();
$data = getJSONInput();

// 필수 필드 검증
if (empty($data['title']) || empty($data['content']) || empty($data['type'])) {
    sendJSON(['error' => '필수 입력값이 누락되었습니다'], 400);
}

// 게시판 타입 검증
if (!in_array($data['type'], ['community', 'notice'])) {
    sendJSON(['error' => '잘못된 게시판 타입입니다'], 400);
}

// 공지사항 권한 체크
if ($data['type'] === 'notice' && !$user['isAdmin']) {
    sendJSON(['error' => '공지사항 작성 권한이 없습니다'], 403);
}

try {
    $pdo = getDBConnection();
    
    // 클라이언트가 지정한 타입으로 테이블 결정
    $table = $data['type'] === 'notice' ? 'notices' : 'community_posts';
    
    $stmt = $pdo->prepare("
        INSERT INTO {$table} (
            title,
            content,
            author_id,
            created_at
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ");
    
    $success = $stmt->execute([
        $data['title'],
        $data['content'],
        $user['id']
    ]);

    if ($success) {
        sendJSON([
            'success' => true,
            'message' => '게시글이 등록되었습니다',
            'postId' => $pdo->lastInsertId(),
            'type' => $data['type']
        ]);
    }

} catch (Exception $e) {
    error_log("Post Creation Error: " . $e->getMessage());
    sendJSON(['error' => '게시글 등록 중 오류가 발생했습니다'], 500);
}