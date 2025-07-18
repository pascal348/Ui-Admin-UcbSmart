<?php
// api.php - Passerelle API pour SmartAccess UCB
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration de l'API
$apiBase = 'http://127.0.0.1:8000';

// Fonction cURL générique
function api_request(string $method, string $url, array $data = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("cURL Error: $error");
    }
    
    if ($httpCode >= 400) {
        throw new Exception("HTTP Error: $httpCode");
    }
    
    return json_decode($response, true);
}

// Router simple
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Supprimer le préfixe du chemin si nécessaire
$path = str_replace('/api.php', '', $path);

try {
    switch ($path) {
        case '/etudiants':
            if ($requestMethod === 'GET') {
                $result = api_request('GET', "$apiBase/etudiants/");
                echo json_encode($result);
            }
            break;
            
        case '/etudiants/import':
            if ($requestMethod === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $matricule = $input['matricule_ext'] ?? '';
                
                if (empty($matricule)) {
                    throw new Exception('Matricule requis');
                }
                
                $endpoint = "$apiBase/etudiants/create-from-matricule?matricule=" . urlencode($matricule);
                $result = api_request('POST', $endpoint);
                echo json_encode($result);
            }
            break;
            
        case '/salles':
            if ($requestMethod === 'GET') {
                $result = api_request('GET', "$apiBase/salles/");
                echo json_encode($result);
            } elseif ($requestMethod === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $result = api_request('POST', "$apiBase/salles/", $input);
                echo json_encode($result);
            }
            break;
            
        case '/autorisations':
            if ($requestMethod === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $result = api_request('POST', "$apiBase/autorisations/", $input);
                echo json_encode($result);
            }
            break;
            
        case '/historiques':
            if ($requestMethod === 'GET') {
                $result = api_request('GET', "$apiBase/historiques/");
                echo json_encode($result);
            }
            break;
            
        case '/verifier-acces':
            if ($requestMethod === 'GET') {
                $matricule = $_GET['matricule'] ?? '';
                $salleId = $_GET['salle_id'] ?? '';
                
                if (empty($matricule) || empty($salleId)) {
                    throw new Exception('Matricule et ID de salle requis');
                }
                
                // Simuler la vérification d'accès
                // Dans une vraie implémentation, vous appelleriez l'API appropriée
                $endpoint = "$apiBase/verifier-acces?matricule=" . urlencode($matricule) . "&salle_id=" . urlencode($salleId);
                
                try {
                    $result = api_request('GET', $endpoint);
                    echo json_encode($result);
                } catch (Exception $e) {
                    // Fallback si l'endpoint n'existe pas
                    echo json_encode([
                        'hasAccess' => false,
                        'message' => 'Vérification non disponible - endpoint non implémenté'
                    ]);
                }
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint non trouvé']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>