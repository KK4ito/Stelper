<?php
require '../../vendor/autoload.php';

use Firebase\JWT\JWT;

$app = new \Slim\App();
$app->get('/open/test', 'getOpen');
$app->get('/close/test', 'getClose');

$app->run();

function getOpen($request, $response, $arguments) {
    echo "Success Open";
}
function getClose($request, $response, $arguments) {
    echo "Success Close";
}

