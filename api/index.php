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
$app->delete('/users/{id}', 'deleteUser');
$app->put('/users/{id}/picture', 'addUpdatePicture');
$app->put('/users/{id}/password', 'updatePassword');
$app->get('/test', 'getTest');
$app->get('/categories', 'getCategories');

$app->run();

//-------------------------------------------------//
// Rest Functions
//-------------------------------------------------//
function getCategories($request, $response, $arguments) {
    $pdomysql = getConnection();

    $sql = "SELECT `categoryId`, `categoryName` FROM `categories`";
    $query = $pdomysql->prepare($sql);

    if (!$query->execute()) {
        var_dump($query->errorInfo());
        return $response
            ->withStatus(400);
    }

    $data = $query->fetchAll();

    return $response
        ->withStatus(200)
        ->withHeader('Content-Type', 'application/json')
        ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

/**
 * @param $request
 * @param $response
 * @param $arguments
 * @return all users and their lessons but does not contain passwords
 */
function getUsers($request, $response, $arguments) {
    $params = json_decode($request->getBody() ) ?: $request->getParams();
    $southwestlat = $params["southwestlat"]; $southwestlng = $params["southwestlng"];
    $northeastlat = $params["northeastlat"]; $northeastlng = $params["northeastlng"];

    $sqlUsers = "SELECT `userId` , `firstname` , `lastname` , `email` ,
                        `phone` , `streetName` , `place` , `created` , `latitude` ,
                        `longitude`, `streetNr`, `postalCode` FROM `users` ";

    $pdoUsers = getConnection();
    if (isset($northeastlat) AND isset($northeastlng)
        AND isset($southwestlat) AND isset($southwestlng)) {

        // Append filter to sqlUsers statement
        $sqlUsers .= "WHERE (`users`.latitude < :northeastlat)
                        AND (`users`.latitude > :southwestlat)
                        AND (`users`.longitude < :northeastlng)
                        AND (`users`.longitude > :southwestlng)";

        $query = $pdoUsers->prepare($sqlUsers);
        $query->bindParam(":northeastlat", $northeastlat, PDO::PARAM_STR);
        $query->bindParam(":northeastlng", $northeastlng, PDO::PARAM_STR);
        $query->bindParam(":southwestlat", $southwestlat, PDO::PARAM_STR);
        $query->bindParam(":southwestlng", $southwestlng, PDO::PARAM_STR);

    } else {
        if(!(isset($northeastlat) || isset($northeastlng)
            || isset($southwestlat) || isset($southwestlng)
            || isset($lat) || isset($lng))) {

            // use sqlUsers statement without filter
            $query = $pdoUsers->prepare($sqlUsers);
        } else {
            return respind($response, 400, "all parameters in arguments must be set");
    } }

    // Got all users but no lessons
    if(!$query->execute()) { return respond($response, 400, "failed to fetch all users"); }

    $data = $query->fetchAll();

    foreach ($data as $key => $user) {
        $pdoLessons = getConnection();
        $userId = $user["userId"];

        $query = $pdoLessons->prepare("SELECT `lessonId`, `categories`.`categoryId`, `categoryName`
                                          FROM `lessons`
                                          LEFT JOIN `categories`
                                              ON `lessons`.`categoryId` = `categories`.`categoryId`
                                          WHERE `lessons`.`userId` = :userId
                                          AND `lessons`.visible = 1");
        $query->bindParam(":userId", $userId);

        if (!$query->execute()) { return respond($response, 400, "failed to fetch lessons for user with id: ".$userId); }

        $lessons = $query->fetchAll();
        $user["lessons"] = $lessons;
        $data[$key] = $user; // assign changes user to old key in $result
    }

    return respond($response, 200, "", $data);
}

function getTest($request, $response, $arguments) {
    $params = json_decode($request->getBody() ) ?: $request->getParams();
    var_dump($params);
}

function getUser($request, $response, $arguments) {
    $pdomysql = getConnection();

    $userId = $arguments['id'];

    $query = $pdomysql->prepare("SELECT * FROM `users` WHERE `users`.`userId`=:userId");
    $query->bindParam(":userId", $userId);

    if(!$query->execute()) {
        $data = (object) array();
        return respond($response, 400, "failed to fetch user with id: ".$userId);
    }

    // Get all user but no lessons
    $data = $query->fetch();

    $pdoLessons = getConnection();
    $query = $pdoLessons->prepare("SELECT `lessonId`, `categories`.`categoryId`, `categoryName`, `visible`
                                          FROM `lessons`
                                          LEFT JOIN `categories`
                                              ON `lessons`.`categoryId` = `categories`.`categoryId`
                                          WHERE `lessons`.`userId` = :userId");
    $query->bindParam(":userId", $userId);

    if (!$query->execute()) {
        return respond($response, 400, "failed to fetch lessons for userId: ".$userId);
    }

    // Get all lessons of a user
    $lessons = $query->fetchAll();
    // store all lessons into a new key
    $data["lessons"] = $lessons;

    return respond($response, 200, "", $data);
}

/*function deleteUser($request, $response, $arguments) {
    $userId = $arguments["id"];
    $data = json_decode($request->getBody(), true);

    if(checkPassword($request, $response, $arguments)) {

    }
}*/

function login($request, $response, $arguments) {
    $data = generateToken($request);

    return respond($response, $data['code'], "", $data);
}

function registerUser($request, $response, $arguments) {
    $data = json_decode($request->getBody(), true);

    $pdomysql = getConnection();
    // MySQL überprüft ob die email bereits existiert, da diese unique sein muss
    $sql = 'INSERT INTO users (`firstname`, `lastname`, `email`, `password`)
		      VALUES (:firstname, :lastname, :email, :password)';
    $query = $pdomysql->prepare($sql);
    $query->bindParam(":firstname", htmlspecialchars($data["prename"]));
    $query->bindParam(":lastname", htmlspecialchars($data["surname"]));
    $query->bindParam(":email", htmlspecialchars($data["username"]));
    $query->bindParam(":password", htmlspecialchars($data["password"]));

    if(!$query->execute()) {
        return respond($response, 400, "failed to register new user", $query->errorInfo());
    } else {
        $gen = generateToken($request);
        $lastInsertId = $pdomysql->lastInsertId();
        $status = 201;
        $data["id"] = $lastInsertId;
        $data["token"] = $gen["token"];
        $data["status"] = $gen["status"];
    }

    return respond($response, $status, "", $data);

}

function addUpdatePicture($request, $response, $arguments) {

}

function updatePassword($request, $response, $arguments) {
    $userId = $arguments["id"];
    $data = json_decode($request->getBody());
    $newPassword = $data->newPassword;

    $pdoMySql = getConnection();

    if (checkPassword($request, $response, $arguments)) {
        $sqlNewPw = "UPDATE `users`
                    SET password=:newPassword
                        WHERE `users`.`userId` = :userId";
        $query = $pdoMySql->prepare($sqlNewPw);
        $query->bindParam(":userId", $userId);
        $query->bindParam(":newPassword", $newPassword);

        if (!$query->execute()) {
            return respond($response, 400, "failed to change password"); }
    } else {
        return respond($response, 400, "password invalid");
    }

    $data = $userId;

    return respond($response, 200, "", $data);
}

/* // Achtung es besteht bereits eine test route
function test($request, $response, $arguments) {
    return $response->withStatus(201)
        ->withHeader('Content-Type', 'text/html')
        ->write('Hello World');
}
*/
//-------------------------------------------------//
// Helper Functions
//-------------------------------------------------//
function respond($response, $status, $message="", $data=(object)array()) {
    return $response->withStatus($status)
        ->withHeader('Content-Type', 'application/json')
        ->write(jsonifyWithMessage($data, $message));
}

function jsonifyWithMessage($message="", $data=(object)array()) {
    $data->message=$message;
    return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
}

function checkPassword($request, $response, $arguments) {
    $userId = $arguments["id"];
    $data = json_decode($request->getBody());

    $oldPassword = $data->oldPassword;

    $pdoMySql = getConnection();

    $sqlOldPw = "SELECT `password` AS pwValid FROM `users`
                    WHERE `users`.`userId` = :userId
                    AND `users`.`password` = :oldPassword";

    $query = $pdoMySql->prepare($sqlOldPw);
    $query->bindParam(":userId", $userId);
    $query->bindParam(":oldPassword", $oldPassword);

    if(!$query->execute()) {
        return false;
    }

    $pwValid = $query->rowCount();

    if ($pwValid===0) {
        return false;
    }

    return true;
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
            'sub' => getCurrentUserId($data['email'], $data['password'])
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

function getCurrentUserId($email, $password) {
    $pdomysql = getConnection();
    $emailescaped = htmlspecialchars($email);
    $passwordescaped = htmlspecialchars($password);
    $query = $pdomysql->prepare("SELECT * FROM `users` WHERE `email` = :email AND `password` = :password");
    $result = $query->execute(array('email' => $emailescaped, 'password' => $passwordescaped));
    $id = $result->userId;

    return $id;
}

function checkUser($email, $password) {
    $pdomysql = getConnection();
    $emailescaped = htmlspecialchars($email);
    $passwordescaped = htmlspecialchars($password);
    $query = $pdomysql->prepare("SELECT * FROM `users` WHERE `email` = :email AND `password` = :password");
    $query->execute(array('email' => $emailescaped, 'password' => $passwordescaped));
    return $query->rowCount() > 0;
}
