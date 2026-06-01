<?php

function startSessionIfNeeded(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function loginUserSession(array $user): void {
    startSessionIfNeeded();

    $_SESSION['user'] = [
        'user_id'    => $user['user_id'],
        'name'       => $user['name'],
        'email'      => $user['email'],
        'phone'      => $user['phone'] ?? null,
        'role'       => $user['role'],
        'status'     => $user['status'] ?? 'active',
        'created_at' => $user['created_at'] ?? null,
    ];
}

// Raw session read — does NOT validate against DB.
// Only use for cases where a DB round-trip is intentionally avoided.
function getCurrentUser(): ?array {
    startSessionIfNeeded();
    return $_SESSION['user'] ?? null;
}

// DB-backed session validation.
// Looks up the user by user_id from the current session, confirms existence and active status.
// Clears the stale session entry and returns null if the account has been disabled or deleted.
function getSessionUserFromDB(): ?array {
    startSessionIfNeeded();

    $session = $_SESSION['user'] ?? null;
    if ($session === null) {
        return null;
    }

    $pdo  = getDBConnection();
    $stmt = $pdo->prepare('
        SELECT user_id, name, email, phone, role, status, created_at
        FROM users
        WHERE user_id = ?
        LIMIT 1
    ');
    $stmt->execute([(int) $session['user_id']]);
    $dbUser = $stmt->fetch();

    if (!$dbUser || $dbUser['status'] !== 'active') {
        unset($_SESSION['user']);
        return null;
    }

    $dbUser['user_id'] = (int) $dbUser['user_id'];
    return $dbUser;
}

function requireLogin(): array {
    startSessionIfNeeded();

    if (!isset($_SESSION['user'])) {
        sendResponse(false, 'Please login first', null, 401);
    }

    $user = getSessionUserFromDB();

    if ($user === null) {
        sendResponse(false, '帳號已停用，請重新登入', null, 401);
    }

    return $user;
}

function requireAdmin(): array {
    $user = requireLogin();

    if ($user['role'] !== 'admin') {
        sendResponse(false, 'Permission denied', null, 403);
    }

    return $user;
}

function logoutUser(): void {
    startSessionIfNeeded();
    $_SESSION = [];
    session_destroy();
}
