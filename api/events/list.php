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
    
    // 월 시작일과 종료일 계산
    $startDate = sprintf('%04d-%02d-01', $year, $month);
    $endDate = sprintf('%04d-%02d-%02d', $year, $month, date('t', strtotime($startDate)));
    
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
        WHERE e.date BETWEEN ? AND ?
        AND (
            e.is_private = 0
    ";

    if ($userId) {
        $baseQuery .= " OR (e.is_private = 1 AND e.author_id = ?)";
    }

    $baseQuery .= ")
        ORDER BY e.date ASC, e.time ASC";
    
    $stmt = $pdo->prepare($baseQuery);
    
    // 쿼리 파라미터를 바인딩합니다
    if ($userId) {
        $stmt->execute([$startDate, $endDate, $userId]);
    } else {
        $stmt->execute([$startDate, $endDate]);
    }
    
    $events = $stmt->fetchAll();
    
    // 날짜 형식을 일관되게 맞춰줍니다
    foreach ($events as &$event) {
        $event['date'] = date('Y-m-d', strtotime($event['date']));
    }
    
    error_log("Fetched events for $year-$month: " . count($events));
    
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