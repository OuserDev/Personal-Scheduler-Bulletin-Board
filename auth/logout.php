<?php
session_start();

if (isset($_SESSION['user'])) {
    $username = $_SESSION['user']['username'];
    error_log("LOGOUT - User: $username");
}

session_destroy();
header('Location: ../main.html');
exit();
?>