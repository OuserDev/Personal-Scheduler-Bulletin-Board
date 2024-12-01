<?php
require_once __DIR__ . '/../common/db.php';

session_start();
header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    $type = $_GET['type'] ?? 'community';
    
    if (!in_array($type, ['community', 'notice'])) {
        sendJSON(['error' => '잘못된 게시판 타입입니다'], 400);
    }
    
    $table = $type === 'notice' ? 'notices' : 'community_posts';
    
    $stmt = $pdo->prepare("
        SELECT 
            p.*,
            u.username as author,
            u.name as author_name
        FROM {$table} p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 20
    ");
    
    $stmt->execute();
    $posts = $stmt->fetchAll();
    
    sendJSON([
        'success' => true,
        'posts' => $posts
    ]);

} catch (Exception $e) {
    error_log("Posts List Error: " . $e->getMessage());
    sendJSON(['error' => '게시글 목록을 불러오는 중 오류가 발생했습니다'], 500);
}