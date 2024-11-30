<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    $username = $_SESSION['user']['username'];
    error_log("AUTH CHECK - Authenticated user: $username");
    
    echo json_encode([
        'isLoggedIn' => true,
        'user' => $_SESSION['user']
    ]);
} else {
    error_log("AUTH CHECK - No authenticated user");
    
    echo json_encode([
        'isLoggedIn' => false,
        'user' => null
    ]);
}
?>