<?php
/**
 * Index of this file
 * > Headers
 * > Imports
 * > App Initialize
 * > Rest Routes And App Start
 * > Rest Functions
 * > Helper Functions
 */
//-------------------------------------------------//
// Headers
//-------------------------------------------------//
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

//-------------------------------------------------//
// Imports
//-------------------------------------------------//
use Firebase\JWT\JWT;

require '../../vendor/autoload.php';

//-------------------------------------------------//
// App Initialize
//-------------------------------------------------//
define('DB_USERNAME', 'stelper');
define('DB_PASSWORD', 'stelperinio2');
define('DB_HOST', 'localhost');
define('DB_NAME', 'stelper');

$app = new \Slim\App();
$app->add(new \Slim\Middleware\JwtAuthentication([
    "path" => ["/"],
    "passthrough" => ["/login"],
    "secure" => false,
    "secret" => "supersecretkeyyoushouldnotcommittogithub"
]));

//-------------------------------------------------//
// Rest Routes And App Start
//-------------------------------------------------//
$app->post('/login', 'login');
$app->get('/test', 'test');
$app->get('/users', 'getUsers');

$app->run();

//-------------------------------------------------//
// Rest Functions
//-------------------------------------------------//
function getUsers($request, $response, $arguments) {
    $pdomysql = getConnection();

    // TODO: if has arguments then do a filter sequence on the query.

    $query = $pdomysql->prepare("SELECT * FROM `users`");
    $query->execute();
    $result = $query->fetchAll();
    $data = json_encode($result);

    return $response->withStatus(201)
        ->withHeader('Content-Type', 'application/json')
        ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

function login($request, $response, $arguments) {
    $data = generateToken($request);

    return $response->withStatus(201)
        ->withHeader('Content-Type', 'application/json')
        ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

function test($request, $response, $arguments) {
    return $response->withStatus(201)
        ->withHeader('Content-Type', 'text/html')
        ->write('Hello World');
}

//-------------------------------------------------//
// Helper Functions
//-------------------------------------------------//
function getConnection() {
    try {
        return new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USERNAME, DB_PASSWORD);
    } catch (PDOException $pdoe) {
        echo "Error connecting to MySql: " . $pdoe->getMessage() . ": on line " . $pdoe->getLine() . "<br/>";
        // echo $pdoe->getTraceAsString(); // prints credentials > use with care
        return null;
    }

}

function generateToken($request) {
    $now = new DateTime();
    $future = new DateTime('now +5 minutes'); // need to be changed to 1 day or more
    $server = $request->getServerParams();
    $jti = base_convert(random_bytes(16),2,62);
    $payload = [
        'iat' => $now->getTimeStamp(),
        'exp' => $future->getTimeStamp(),
        'jti' => $jti,
        'sub' => $server['PHP_AUTH_USER']
    ];
    $secret = 'supersecretkeyyoushouldnotcommittogithub';
    $token = JWT::encode($payload, $secret, 'HS256');
    $data['status'] = 'ok';
    $data['token'] = $token;

    return $data;
}
