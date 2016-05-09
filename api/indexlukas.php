<?php
ini_set("display_errors", 1);

require '../../vendor/autoload.php';
//include 'configs/local.php';

use Firebase\JWT\JWT;

define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'stelperinio');
define('DB_HOST', 'localhost');
define('DB_NAME', 'stelper');

$app = new \Slim\App();
$app->get('/open/test', 'getOpen');
$app->get('/close/test', 'getClose');
$app->get('/users', 'getUsers');

$app->run();

function getOpen($request, $response, $arguments) {
    echo "Success Open";
}
function getClose($request, $response, $arguments) {
    echo "Success Close";
}

function getUsers($request, $response, $arguments) {
    $pdomysql = getConnection();
    foreach($pdomysql->query("SELECT * FROM `users`") as $row) {
        print_r($row);
    }

}

function getConnection() {
    try {
        return new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USERNAME, DB_PASSWORD);
    } catch (PDOException $pdoe) {
        echo "Error connecting to MySql: " . $pdoe->getMessage() . ": on line " . $pdoe->getLine() . "<br/>";
        // echo $pdoe->getTraceAsString(); // prints credentials > use with care
        return null;
    }

}

