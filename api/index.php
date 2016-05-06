<?php
use Firebase\JWT\JWT;

require '../../vendor/autoload.php';

$app = new \Slim\App();
$app->add(new \Slim\Middleware\JwtAuthentication([
    "path" => ["/"],
    "passthrough" => ["/login"],
    "secure" => false,
    "secret" => "supersecretkeyyoushouldnotcommittogithub"
]));

$app->post("/register", "login");
$app->get("/test", "test");
$app->get("/users", "getUsers");

$app->run();

function login($request, $response, $arguments) {
    $data = generateToken($request);

    return $response->withStatus(201)
        ->withHeader("Content-Type", "application/json")
        ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

function test($request, $response, $arguments) {

}

function generateToken($request) {
    $now = new DateTime();
    $future = new DateTime("now +2 minutes");
    $server = $request->getServerParams();
    $jti = base_convert(random_bytes(16),2,62);
    $payload = [
        "iat" => $now->getTimeStamp(),
        "exp" => $future->getTimeStamp(),
        "jti" => $jti,
        "sub" => $server["PHP_AUTH_USER"]
    ];
    $secret = "supersecretkeyyoushouldnotcommittogithub";
    $token = JWT::encode($payload, $secret, "HS256");
    $data["status"] = "ok";
    $data["token"] = $token;

    return $data;
}
