<?php
// Local router script for php -S built-in server simulation of .htaccess
$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

if (preg_match('/^\/schemes\/([a-zA-Z0-9_-]+)\/?$/', $uri, $matches)) {
    $_GET['slug'] = $matches[1];
    include __DIR__ . '/scheme.php';
    exit;
}

if ($uri === '/search' || $uri === '/search/') {
    include __DIR__ . '/index.php';
    exit;
}

// Return false to serve static assets directly
return false;
