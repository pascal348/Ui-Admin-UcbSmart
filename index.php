<?php
// index.php

// Désactive l’affichage des notices et warnings de type Deprecated
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);

// 0. Configuration générale
$apiBase = 'http://127.0.0.1:8000';

// 1. Fonction cURL générique
function api_request(string $method, string $url, array $data = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    $resp = curl_exec($ch);
    $err  = curl_error($ch);
    curl_close($ch);
    if ($err) {
        throw new Exception("cURL Error: $err");
    }
    return json_decode($resp, true);
}

// 2. Messages de retour
$msg = [
    'fetch_ext'    => '',
    'add_access'   => '',
    'create_salle' => '',
    'fetch_history' => '', // New message for history fetching
];

// 3. Importer un étudiant par matricule externe
if (isset($_POST['fetch_etudiant'])) {
    $mat = trim($_POST['matricule_ext'] ?? '');
    try {
        $endpoint = "$apiBase/etudiants/create-from-matricule?matricule=" . urlencode($mat);
        $response = api_request('POST', $endpoint);
        if (empty($response['etudiant'] ?? null)) {
            throw new Exception("Réponse API invalide");
        }
        $e = $response['etudiant'];
        $msg['fetch_ext'] = sprintf(
            "<p style='color:green;'>✅ Étudiant importé : %s – %s %s (ID :%d)</p>",
            htmlspecialchars((string)$e['matricule']),
            htmlspecialchars((string)$e['nom']),
            htmlspecialchars((string)$e['prenom']),
            (int)$e['id']
        );
    } catch (Exception $ex) {
        $msg['fetch_ext'] = "<p style='color:red;'>❌ Erreur import : "
            . htmlspecialchars($ex->getMessage())
            . "</p>";
    }
}

// 4. Créer une nouvelle salle
if (isset($_POST['create_salle'])) {
    try {
        $payload = [
            'nom_salle'    => (string)($_POST['nom_salle']    ?? ''),
            'localisation'=> (string)($_POST['localisation']?? ''),
            'description' => (string)($_POST['description'] ?? ''),
        ];
        $res = api_request('POST', "$apiBase/salles/", $payload);
        if (!isset($res['id'])) {
            throw new Exception("Réponse API inattendue");
        }
        $msg['create_salle'] = "<p style='color:green;'>✅ Salle créée (ID :"
            . htmlspecialchars((string)$res['id']) . ")</p>";
    } catch (Exception $ex) {
        $msg['create_salle'] = "<p style='color:red;'>❌ Erreur création salle : "
            . htmlspecialchars($ex->getMessage())
            . "</p>";
    }
}

// 5. Charger listes pour l’accès
try {
    $etudiants = api_request('GET', "$apiBase/etudiants/") ?? [];
    $salles    = api_request('GET', "$apiBase/salles/") ?? [];
} catch (Exception $ex) {
    die("Impossible de charger les listes : " . htmlspecialchars($ex->getMessage()));
}

// 6. Accorder un accès
if (isset($_POST['add_access'])) {
    try {
        $payload = [
            'etudiant_id' => (int)($_POST['etudiant_id'] ?? 0),
            'salle_id'    => (int)($_POST['salle_id']    ?? 0),
            'date_debut'  => (new DateTime($_POST['date_debut']))->format(DateTime::ATOM),
            'date_fin'    => (new DateTime($_POST['date_fin']))->format(DateTime::ATOM),
        ];
        $r = api_request('POST', "$apiBase/autorisations/", $payload);
        $msg['add_access'] = isset($r['id'])
            ? "<p style='color:green;'>✅ Accès accordé (ID : " . (int)$r['id'] . ")</p>"
            : "<p style='color:red;'>❌ Réponse inattendue</p>";
    } catch (Exception $ex) {
        $msg['add_access'] = "<p style='color:red;'>❌ Erreur accès : "
            . htmlspecialchars($ex->getMessage())
            . "</p>";
    }
}

// 7. Charger l'historique des accès (NEW SECTION)
$historiques = [];
try {
    $historiques = api_request('GET', "$apiBase/historiques/") ?? [];
} catch (Exception $ex) {
    $msg['fetch_history'] = "<p style='color:red;'>❌ Erreur lors du chargement de l'historique : "
        . htmlspecialchars($ex->getMessage())
        . "</p>";
}
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Gestion Étudiants, Salles & Accès</title>
  <style>
    body { font-family: Arial; margin: 40px; }
    .box { border:1px solid #ccc; padding:20px; margin-bottom:30px; }
    h1,h2 { color:#333; }
    label { display:block; margin:8px 0; }
    input, select, textarea { padding:6px; width:100%; box-sizing:border-box; }
    button { padding:8px 20px; margin-top:10px; }
    form { max-width:400px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Gestion Étudiants, Salles & Accès</h1>

  <!-- Section 1 : Importer étudiant -->
  <div class="box">
    <h2>1. Importer un étudiant</h2>
    <?php echo $msg['fetch_ext']; ?>
    <form method="post">
      <label>Matricule externe :
        <input type="text" name="matricule_ext" required>
      </label>
      <button type="submit" name="fetch_etudiant">Importer</button>
    </form>
  </div>

  <!-- Section 2 : Créer une salle -->
  <div class="box">
    <h2>2. Créer une nouvelle salle</h2>
    <?php echo $msg['create_salle']; ?>
    <form method="post">
      <label>Nom de la salle :
        <input type="text" name="nom_salle" required>
      </label>
      <label>Localisation :
        <input type="text" name="localisation">
      </label>
      <label>Description :
        <textarea name="description" rows="3"></textarea>
      </label>
      <button type="submit" name="create_salle">Créer la salle</button>
    </form>
  </div>

  <!-- Section 3 : Accorder un accès -->
  <div class="box">
    <h2>3. Accorder un accès</h2>
    <?php echo $msg['add_access']; ?>
    <form method="post">
      <label>Étudiant :
        <select name="etudiant_id" required>
          <option value="">-- Choisir --</option>
          <?php foreach ($etudiants as $e): ?>
            <option value="<?php echo (int)$e['id']; ?>">
              <?php echo htmlspecialchars("{$e['nom']} {$e['prenom']} ({$e['matricule']})"); ?>
            </option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Salle :
        <select name="salle_id" required>
          <option value="">-- Choisir --</option>
          <?php foreach ($salles as $s): ?>
            <option value="<?php echo (int)$s['id']; ?>">
              <?php echo htmlspecialchars((string)$s['nom_salle']); ?>
            </option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Date début :
        <input type="datetime-local" name="date_debut" required>
      </label>
      <label>Date fin :
        <input type="datetime-local" name="date_fin">
      </label>
      <button type="submit" name="add_access">Valider l'accès</button>
    </form>
  </div>

  <!-- Section 4 : Historique des accès (NEW SECTION) -->
  <div class="box">
    <h2>4. Historique des accès</h2>
    <?php echo $msg['fetch_history']; ?>
    <?php if (!empty($historiques)): ?>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Étudiant ID</th>
            <th>Salle ID</th>
            <th>Type d'accès</th>
            <th>Matricule utilisé</th>
            <th>Date d'entrée</th>
            <th>Date de sortie</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($historiques as $h): ?>
            <tr>
              <td><?php echo htmlspecialchars((string)$h['id']); ?></td>
              <td><?php echo htmlspecialchars((string)$h['etudiant_id']); ?></td>
              <td><?php echo htmlspecialchars((string)$h['salle_id']); ?></td>
              <td><?php echo htmlspecialchars((string)$h['type_acces']); ?></td>
              <td><?php echo htmlspecialchars((string)$h['matricule_utilise']); ?></td>
              <td><?php echo htmlspecialchars((new DateTime($h['date_entree']))->format('Y-m-d H:i')); ?></td>
              <td><?php echo htmlspecialchars((new DateTime($h['date_sortie']))->format('Y-m-d H:i')); ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    <?php else: ?>
      <p>Aucun historique d'accès disponible.</p>
    <?php endif; ?>
  </div>

</body>
</html>
