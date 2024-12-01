<?php
// api/events/view.php

require_once __DIR__ . '/../common/db.php';

$eventId = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$eventId) {
    sendJSON(['error' => '잘못된 요청입니다.'], 400);
}

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT 
            e.*,
            u.username as author,
            u.name as author_name
        FROM events e
        JOIN users u ON e.author_id = u.id
        WHERE e.id = ?
    ");
    
    $stmt->execute([$eventId]);
    $event = $stmt->fetch();
    
    if (!$event) {
        sendJSON(['error' => '존재하지 않는 게시글입니다.'], 404);
    }

    // 비공개 게시글인 경우 권한 체크
    if ($event['is_private']) {
        $user = checkAuth(); // 로그인 체크
        if ($event['author'] !== $user['username']) {
            sendJSON(['error' => '접근 권한이 없습니다.'], 403);
        }
    }

    // 날짜 형식 통일
    $event['date'] = date('Y-m-d', strtotime($event['date']));
    
    sendJSON([
        'success' => true,
        'event' => $event
    ]);
    
} catch (Exception $e) {
    error_log('Event View Error: ' . $e->getMessage());
    sendJSON(['error' => '게시글을 불러오는 중 오류가 발생했습니다.'], 500);
}