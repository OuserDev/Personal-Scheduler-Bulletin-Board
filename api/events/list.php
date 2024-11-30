<?php
// api/events/list.php
require_once __DIR__ . '/../common/db.php';

session_start();
header('Content-Type: application/json');

// URL 파라미터에서 연도와 월을 가져옵니다
$year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');
$month = isset($_GET['month']) ? intval($_GET['month']) : date('n');

// 현재 로그인한 사용자 정보를 가져옵니다
$currentUser = isset($_SESSION['user']) ? $_SESSION['user'] : null;
$userId = $currentUser ? $currentUser['id'] : null;

try {
    $pdo = getDBConnection();
    
    // 기본 쿼리는 공개 일정만 조회합니다
    $baseQuery = "
        SELECT 
            e.id,
            e.date,
            e.time,
            e.title,
            e.content,
            e.important,
            e.is_private,
            u.username as author,
            u.name as author_name
        FROM events e
        JOIN users u ON e.author_id = u.id
        WHERE YEAR(e.date) = ? AND MONTH(e.date) = ?
        AND (
            e.is_private = 0
    ";
    
    // 로그인한 사용자의 경우 자신의 비공개 일정도 함께 조회합니다
    if ($userId) {
        $baseQuery .= " OR (e.is_private = 1 AND e.author_id = ?)";
    }
    
    $baseQuery .= ")
        ORDER BY e.date ASC, e.time ASC";
    
    $stmt = $pdo->prepare($baseQuery);
    
    // 쿼리 파라미터를 바인딩합니다
    if ($userId) {
        $stmt->execute([$year, $month, $userId]);
    } else {
        $stmt->execute([$year, $month]);
    }
    
    $events = $stmt->fetchAll();
    
    // 날짜 형식을 일관되게 맞춰줍니다
    foreach ($events as &$event) {
        // 날짜를 YYYY-MM-DD 형식으로 표준화
        $event['date'] = date('Y-m-d', strtotime($event['date']));
        
        // 민감한 정보는 제외하고 전송
        unset($event['author_id']);
        
        // 작성자 표시 방식 통일
        $event['author'] = $event['is_private'] ? $event['author_name'] : '관리자';
    }
    
    sendJSON([
        'success' => true,
        'events' => $events
    ]);

} catch (Exception $e) {
    error_log("Events List Error: " . $e->getMessage());
    sendJSON([
        'error' => '일정을 불러오는 중 오류가 발생했습니다'
    ], 500);
}