<?php
require_once __DIR__ . '/../common/db.php';

$postId = isset($_GET['id']) ? intval($_GET['id']) : null;
$type = isset($_GET['type']) ? $_GET['type'] : 'community';

if (!$postId || !in_array($type, ['community', 'notice'])) {
    sendJSON(['error' => '잘못된 요청입니다'], 400);
}

try {
    $pdo = getDBConnection();
    
    $table = $type === 'notice' ? 'notices' : 'community_posts';
    
    $stmt = $pdo->prepare("
        SELECT 
            p.*,
            u.username as author,
            u.name as author_name
        FROM {$table} p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = ?
    ");
    
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    if (!$post) {
        sendJSON(['error' => '존재하지 않는 게시글입니다'], 404);
    }
    
    sendJSON([
        'success' => true,
        'post' => $post
    ]);
    
} catch (Exception $e) {
    error_log("Post View Error: " . $e->getMessage());
    sendJSON(['error' => '게시글을 불러오는 중 오류가 발생했습니다'], 500);
}