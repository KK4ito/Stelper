<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../../vendor/autoload.php';

//$config = include(__DIR__ . '/configs/local.php');

//$db = new PDO("mysql:host=localhost;dbname=stelper", $config['db']['user'], $config['db']['user'] );

//$app->get('/', function () use ($app, $db) {
//    // do something with your db connection
//});

$app = new \Slim\App;
$app->get('/hello/{name}', function (Request $request, Response $response) {
    $name = $request->getAttribute('name');
    $response->getBody()->write("Hello, $name");

    return $response;
});
$app->run();
