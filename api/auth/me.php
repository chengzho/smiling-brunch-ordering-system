<?php

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = getSessionUserFromDB();

if ($user === null) {
    sendResponse(false, 'Not logged in', null, 401);
}

sendResponse(true, 'Current user retrieved', $user);
