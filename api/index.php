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
header('Access-Control-Allow-Methods: POST, GET, PUT');

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
    "passthrough" => ["/login", "/register", "/testing", "/users", "/categories"],
    "secure" => false,
    "secret" => "supersecretkeyyoushouldnotcommittogithub"
]));

//-------------------------------------------------//
// Rest Routes And App Start
//-------------------------------------------------//
$app->post('/login', 'login');
$app->post('/register', 'registerUser');
$app->get('/users', 'getUsers');
$app->get('/users/{id}', 'getUser');
$app->get('/categories', 'getCategories');
$app->get('/users/{id}/picture', 'getPicture');
$app->put('/users/{id}', 'updateUser');
$app->delete('/users/{d}', 'deleteUser');
$app->put('/users/{id}/picture', 'addUpdatePicture');
$app->put('/users/{id}/password', 'updatePassword');

//$app->delete('/users/{id}', 'deleteUser');

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
        if (!(isset($northeastlat) || isset($northeastlng)
            || isset($southwestlat) || isset($southwestlng)
            || isset($lat) || isset($lng))
        ) {
            // use sqlUsers statement without filter
            $query = $pdoUsers->prepare($sqlUsers);
        } else {
            return respondWith($response, 400, new stdClass(), "all parameters in arguments must be set"); }
    }

    // Got all users but no lessons
    if(!$query->execute()) { return respondWith($response, 400, new stdClass(), "failed to fetch all users"); }

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

        if (!$query->execute()) {
            return respondWith($response, 400, new stdClass(), "failed to fetch lessons for user with id: ".$userId); }

        $lessons = $query->fetchAll();
        $user["lessons"] = $lessons;
        $data[$key] = $user; // assign changes user to old key in $result
    }

    return respondWith($response, 200, $data);
}

function getUser($request, $response, $arguments) {
    $pdomysql = getConnection();

    $userId = $arguments['id'];

    $query = $pdomysql->prepare("SELECT * FROM `users` WHERE `users`.`userId`=:userId");
    $query->bindParam(":userId", $userId);

    if(!$query->execute()) {
        return respondWith($response, 400, new stdClass(), "failed to fetch user with id: ".$userId);
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
        return respondWith($response, 400, new stdClass(), "failed to fetch lessons for userId: ".$userId);
    }

    // Get all lessons of a user
    $lessons = $query->fetchAll();
    // store all lessons into a new key
    $data["lessons"] = $lessons;

    return respondWith($response, 200, $data);
}

function deleteUser($request, $response, $arguments) {
    $userId = $arguments["id"];
    $data = json_decode($request->getBody(), true);

    $fileName = "./pictures/pic" . $userId . ".txt";

    if(checkPassword($userId, $data->oldPassword)) {
        $pdoMySql = getConnection();

        $sql = "DELETE FROM `users` WHERE `users`.`userId` = :userId";

        $query = $pdoMySql->prepare($sql);
        $query->bindParam(":userId", $userId);

        if (!$query->execute()) {
            return respondWith($response, 400, new stdClass(), "failed to delete the user with id".$userId);
        }

        if (file_exists($fileName)) {
            if (is_writeable($fileName)) {
                if (!unlink($fileName)) {
                    return respondWith($response, 400, new stdClass(), "Could not delete profile picture");
                }
            } else {
                return respondWith($response, 400, new stdClass(), "file " . $fileName . " is not writeable");
            }
        } else {
            return respondWith($response, 400, new stdClass(), "file " . $fileName . " does not exist");
        }
    } else {
        return respondWith($response, 400, new stdClass(), "password unvalid");
    }

    return respondWith($response, 201, new stdClass(), "user ".$userId." has been deleted");
}

function login($request, $response, $arguments) {
    $data = generateToken($request);

    return respondWith($response, $data['code'], $data);
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
        return respondWith($response, 400, $query->errorInfo(), "failed to register new user");
    } else {
        $gen = generateToken($request);
        $lastInsertId = $pdomysql->lastInsertId();
        $status = 201;
        $data["id"] = $lastInsertId;
        $data["token"] = $gen["token"];
        $data["status"] = $gen["status"];
    }

    return respondWith($response, $status, $data);
}

function addUpdatePicture($request, $response, $arguments) {
    $data = $request->getBody() ?: $request->getParams();
    $userId = $arguments["id"];

    $fileName = "./pictures/pic" . $userId . ".txt";

    // open or create if not exists in write mode only -> deleting already existing files with same name

    if(!($image = fopen($fileName, "wb")) ) {
        return respondWith($response, 400, new stdClass(), "unable to open file");
    }

    // write data
    if(!(fwrite($image, $data))) {
        return respondWith($response, 400, new stdClass(), "unable to write file");
    }

    // close file
    fclose($image);

    return respondWith($response, 201, (object)array(), "picture saved");
}

function getPicture($request, $response, $arguments) {
    $userId = $arguments["id"];

    $fileName = "./pictures/pic" . $userId . ".txt";
    if (file_exists($fileName)) {
        $myFile = fopen($fileName, "r");
        $data = fread($myFile,filesize($fileName));
        fclose($myFile);
        return respondWith($response, 200, $data, "");
    } else {
        return respondWith($response, 404, new stdClass(), "");
    }
}

function updatePassword($request, $response, $arguments) {
    $userId = $arguments["id"];
    $data = json_decode($request->getBody(), true);
    $newPassword = $data->newPassword;

    $pdoMySql = getConnection();

    if (checkPassword($userId, $data->oldPassword)) {
        $sqlNewPw = "UPDATE `users`
                    SET password=:newPassword
                        WHERE `users`.`userId` = :userId";
        $query = $pdoMySql->prepare($sqlNewPw);
        $query->bindParam(":userId", $userId);
        $query->bindParam(":newPassword", $newPassword);

        if (!$query->execute()) {
            return respondWith($response, 400, new stdClass(), "failed to change password"); }
    } else {
        return respondWith($response, 400, new stdClass(), "password invalid");
    }

    $data = $userId;

    return respondWith($response, 200, $data);
}

function updateUser($request, $response, $arguments) {
    $params = json_decode($request->getBody() ) ?: $request->getParams();
    $pdoMySql = getConnection();

    // update user
    $userId     = htmlspecialchars($arguments["id"]);
    //$email      = htmlspecialchars($params->email);
    $firstname  = htmlspecialchars($params->firstname);
    $lastname   = htmlspecialchars($params->lastname);
    $streetName = htmlspecialchars($params->streetName);
    $streetNr   = htmlspecialchars($params->streetNr);
    $postalCode = htmlspecialchars($params->postalCode);
    $place      = htmlspecialchars($params->place);
    $latitude   = htmlspecialchars($params->latitude);
    $longitude  = htmlspecialchars($params->longitude);

    $query = "UPDATE `users`
                    SET firstname=:firstname,
                        lastname=:lastname,
                        streetName=:streetName,
                        streetNr=:streetNr,
                        postalCode=:postalCode,
                        place=:place,
                        latitude=:latitude,
                        longitude=:longitude
                        WHERE userId = :userId";
    $query = $pdoMySql->prepare($query);
    $query->bindParam(":userId", $userId);
    //$query->bindParam(":email", $email);
    $query->bindParam(":firstname", $firstname);
    $query->bindParam(":lastname", $lastname);
    $query->bindParam(":streetName", $streetName);
    $query->bindParam(":streetNr", $streetNr);
    $query->bindParam(":postalCode", $postalCode);
    $query->bindParam(":place", $place);
    $query->bindParam(":latitude", $latitude);
    $query->bindParam(":longitude", $longitude);

    if (!$query->execute()) {
        return respondWith($response, 400, $query->errorInfo(), "failed to update user 1");
    }

    // delete lessons from user before adding the new lessons
    $query = "DELETE FROM `lessons` WHERE userId = :userId";
    $query = $pdoMySql->prepare($query);
    $query->bindParam(":userId", $userId);

    if (!$query->execute()) {
        return respondWith($response, 400, $query->errorInfo(), "failed to update user 2");
    }

    // add new lessons from user
    $lessons = $params->lessons;

    foreach($lessons as $lesson) {
        $query = "INSERT INTO `lessons` (`userId`,`categoryId`,`visible`) 
                    VALUES (:userId, :categoryId, :visible)";
        $query = $pdoMySql->prepare($query);
        $query->bindParam(":userId", $userId);
        $query->bindParam(":categoryId", $lesson->categoryId);
        $query->bindParam(":visible", $lesson->visible);
        if (!$query->execute()) {
            return respondWith($response, 400, $query->errorInfo(), "failed to update user 3");
        }
    }

    return respondWith($response, 200, new stdClass());
}

//-------------------------------------------------//
// Helper Functions
//-------------------------------------------------//
function respondWith($response, $status, $data, $message="") {
    if ($status>=400 && $status<500) {
        return $response->withStatus($status)
            ->withHeader('Content-Type', 'application/json')
            ->write(jsonifyWithMessage($data, $message));
    } else {
        return $response->withStatus($status)
            ->withHeader('Content-Type', 'application/json')
            ->write(jsonifyWithMessage($data));
    }
}

function jsonifyWithMessage($data, $message="") {
    //TODO Does it always work like this? -> might cause error so test it
    if (!($message==="")) {
        $data["message"]=$message;

    }
    return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
}

function checkPassword($userId, $password) {
    $pdoMySql = getConnection();
    $sqlPw = "SELECT `password` AS pwValid FROM `users`
                    WHERE `users`.`userId` = :userId
                    AND `users`.`password` = :password";
    $query = $pdoMySql->prepare($sqlPw);
    $query->execute(array("userId"=>$userId, "password"=>$password));

    return ($query->rowCount()>0);
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
        $sub = getCurrentUserId($data['email'], $data['password']);
        $payload = [
            'iat' => $now->getTimeStamp(),
            'exp' => $future->getTimeStamp(),
            'jti' => $jti,
            'sub' => $sub
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
    $query->execute(array('email' => $emailescaped, 'password' => $passwordescaped));
    $result = $query->fetch(PDO::FETCH_ASSOC);

    return $result["userId"];
}

function checkUser($email, $password) {
    $pdomysql = getConnection();
    $emailescaped = htmlspecialchars($email);
    $passwordescaped = htmlspecialchars($password);
    $query = $pdomysql->prepare("SELECT * FROM `users` WHERE `email` = :email AND `password` = :password");
    $query->execute(array('email' => $emailescaped, 'password' => $passwordescaped));
    return $query->rowCount() > 0;
}
