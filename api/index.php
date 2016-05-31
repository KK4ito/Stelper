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
// php settings
//-------------------------------------------------//
/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

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
    "passthrough" => ["/login", "/register", "/test", "/users", "/categories"],
    "secure" => false,
    "secret" => "supersecretkeyyoushouldnotcommittogithub"
]));

//-------------------------------------------------//
// Rest Routes And App Start
//-------------------------------------------------//
$app->post('/login', 'login');
$app->post('/register', 'registerUser');
//$app->get('/test', 'test');
$app->get('/users', 'getUsers');
$app->get('/users/{id}', 'getUser');
$app->put('/users/{id}/picture', 'addUpdatePicture');
$app->get('/test', 'test');
$app->get('/categories', 'getCategories');

$app->run();

//-------------------------------------------------//
// Rest Functions
//-------------------------------------------------//
function getCategories($request, $response, $arguments) {
    $pdomysql = getConnection();

    $sql = "SELECT `categoryName` FROM `categories`";
    $query = $pdomysql->prepare($sql);

    if (!$query->execute()) {
        var_dump($query->errorInfo());
        return $response
            ->withStatus(400);
    }

    $result = $query->fetchAll();
    $data = json_encode($result);

    return $response
        ->withStatus(200)
        ->withHeader('Content-Type', 'application/json')
        ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

function getUsers($request, $response, $arguments) {
    $params = json_decode($request->getBody() ) ?: $request->getParams();

    $pdoUsers = getConnection();

    $southwestlat = $params["southwestlat"];
    $southwestlng = $params["southwestlng"];

    $northeastlat = $params["northeastlat"];
    $northeastlng = $params["northeastlng"];

    $status = 200;

    $sqlUsers = "SELECT `userId` , `firstname` , `lastname` , `email` ,
            `phone` , `address` , `city` , `created` , `latitude` , `longitude`
                FROM `users`";

    if (isset($northeastlat) && isset($northeastlng)
        && isset($southwestlat) && isset($southwestlng)) {

        // Append filter to sqlUsers statement
        $sqlUsers += "WHERE `users`.latitude < :northeastlat
                        AND `users`.latitude > :southwestlat
                        AND `users`.longitude < :northeastlng
                        AND `users`.longitude > :southwestlng";

        $query = $pdoUsers->prepare($sqlUsers);

        $query->bindParam(":northeastlat", $northeastlat);
        $query->bindParam(":northeastlng", $northeastlng);
        $query->bindParam(":southwestlat", $southwestlat);
        $query->bindParam(":southwestlng", $southwestlng);

    } else {
        if(!(isset($northeastlat) || isset($northeastlng)
            || isset($southwestlat) || isset($southwestlng)
            || isset($lat) || isset($lng))) {

            // use sqlUsers statement without filter
            $query = $pdoUsers->prepare($sqlUsers);

        } else {
            $status = 400;
            return $response
                ->withStatus($status);
        }
    }

    // Got all users but no lessons
    $query->execute();
    $result = $query->fetchAll();

    foreach ($result as $key => $user) {

        $pdoLessons = getConnection();
        $userId = $user["userId"];

        $query = $pdoLessons->prepare("SELECT `lessonId`,`categoryName`,`visible`
                                          FROM `lessons`
                                          LEFT JOIN `categories`
                                              ON `lessons`.`categoryId` = `categories`.`categoryId`
                                          WHERE `lessons`.`userId` = :userId");

        $query->bindParam(":userId", $userId);

        if (!$query->execute()) {
            $status = 400;
            return $response
                ->withStatus($status);
        }

        $lessons = $query->fetchAll();

        $user["lessons"] = $lessons;
        $result[$key] = $user; // assign changes user to old key in $result
    }

    $data = json_encode($result);

    return $response
        ->withStatus($status)
        ->withHeader('Content-Type', 'application/json')
        ->write(json_encode($data));
}

function getTest($request, $response, $arguments) {
    $params = json_decode($request->getBody() ) ?: $request->getParams();
    var_dump($params);
}

function getUser($request, $response, $arguments) {
    $pdomysql = getConnection();

    $query = $pdomysql->prepare("SELECT * FROM `users` WHERE `id`=:id");
    $query->execute(array('id' => $arguments['id']));
    $result = $query->fetch();
    $data = json_encode($result);

    return $response->withStatus(201)
        ->withHeader('Content-Type', 'application/json')
        ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

function login($request, $response, $arguments) {
    $data = generateToken($request);

    return $response->withStatus($data['code'])
        ->withHeader('Content-Type', 'application/json')
        ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

function registerUser($request, $response, $arguments) {
    $data = json_decode($request->getBody(), true);

    $pdomysql = getConnection();
    $sql = 'CALL registerUser(:firstname, :lastname, :email, :password)';
    $query = $pdomysql->prepare($sql);

    $success = $query->execute(array(
        'firstname' => htmlspecialchars($data["prename"]),
        'lastname' => htmlspecialchars($data["surname"]),
        'email' => htmlspecialchars($data["username"]),
        'password' => htmlspecialchars($data["password"])));

    $result = $query->fetch();

    if($success) {
        $lastInsertId = $pdomysql->lastInsertId();
        $status = 201;
        $gen = generateToken($request);
        $data["id"] = $lastInsertId;
        $data["token"] = $gen["token"];
        $data["status"] = $gen["status"];
    } else {
        $status = 410;
        $data["code"] = $query->errorCode();
        $data["message"] = $result["error"];
    }

    $query->closeCursor();

    /*
    $query = $pdomysql->prepare("INSERT INTO `users` (`name`,`email`,`password`) VALUES (:name, :email, :password)");

    if ($query->execute(array(
        "name" => htmlspecialchars($data["prename"])." ".htmlspecialchars($data["surname"]),
        "email" => htmlspecialchars($data["username"]),
        "password" => htmlspecialchars($data["password"])
    ))) {
        $lastInsertId = $pdomysql->lastInsertId();
        $status = 201;
        $gen = generateToken($request);
        $data["id"] = $lastInsertId;
        $data["token"] = $gen["token"];
        $data["status"] = $gen["status"];
    } else {
        $status = 410;
        $data["code"] = $query->errorCode();
        $data["message"] = $query->errorInfo()[2];
    }
    */

    $pdomysql = null;

    return $response->withStatus($status)
        ->withHeader('Content-Type', 'application/json')
        ->write(json_encode($data, JSON_UNESCAPED_SLASHES));

}

function addUpdatePicture($request, $response, $arguments) {

}

// Achtung es besteht bereits eine test route
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
    $data = json_decode($request->getBody(), true);
    if (checkUser($data['email'], $data['password'])) {
        $now = new DateTime();
        $future = new DateTime('now +120 minutes'); // need to be changed to 1 day or more
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
        $data['code'] = 200;
    } else {
        $data['code'] = 401;
    }


    return $data;
}

function checkUser($email, $password) {
    $pdomysql = getConnection();
    $emailescaped = htmlspecialchars($email);
    $passwordescaped = htmlspecialchars($password);

    $query = $pdomysql->prepare("SELECT * FROM `users` WHERE `email` = :email AND `password` = :password");
    $query->execute(array('email' => $emailescaped, 'password' => $passwordescaped));

    return $query->rowCount() > 0;
}
