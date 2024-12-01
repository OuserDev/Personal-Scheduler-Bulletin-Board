<?php
require_once __DIR__ . '/../common/db.php';

$user = checkAuth();
$data = getJSONInput();

if (!isset($data['id'])) {
    sendJSON(['error' => '삭제할 게시글 ID가 누락되었습니다'], 400);
}

try {
    $pdo = getDBConnection();
    
    // 게시물 정보 조회
    $tables = ['notices', 'community_posts'];
    $post = null;
    $targetTable = '';
    
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("
            SELECT p.*, u.is_admin as author_is_admin
            FROM {$table} p
            JOIN users u ON p.author_id = u.id
            WHERE p.id = ?
        ");
        $stmt->execute([$data['id']]);
        $result = $stmt->fetch();
        
        if ($result) {
            $post = $result;
            $targetTable = $table;
            break;
        }
    }
    
    if (!$post) {
        sendJSON(['error' => '존재하지 않는 게시글입니다'], 404);
    }
    
    // 삭제 권한 확인 (작성자 본인 또는 관리자)
    if ($post['author_id'] !== $user['id'] && !$user['isAdmin']) {
        sendJSON(['error' => '삭제 권한이 없습니다'], 403);
    }
    
    // 공지사항은 관리자만 삭제 가능
    if ($targetTable === 'notices' && !$user['isAdmin']) {
        sendJSON(['error' => '공지사항은 관리자만 삭제할 수 있습니다'], 403);
    }
    
    $stmt = $pdo->prepare("
        DELETE FROM {$targetTable}
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
    error_log("Post Delete Error: " . $e->getMessage());
    sendJSON(['error' => '게시글 삭제 중 오류가 발생했습니다'], 500);
}