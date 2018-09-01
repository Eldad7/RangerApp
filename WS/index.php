<?php
	header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Headers: Content-Type, PHP_AUTH_USER, PHP_AUTH_PW, Authorization");
	header("Content-Type: application/json");

	//Send data to requestbin
	if (!empty($_GET))
		$res = file_get_contents('http://requestbin.fullcontact.com/16gffks1?'.http_build_query($_GET));
	else
		$res = file_get_contents('http://requestbin.fullcontact.com/16gffks1?'.http_build_query($_POST));

	$usrs = json_decode(file_get_contents('data/usrs.json'),true);
	$user = false;
	foreach ($usrs as $usr) {
		if (hash('sha256', $usr['name'].$usr['unq']) == hash('sha256', $_SERVER['PHP_AUTH_USER'].$_SERVER['PHP_AUTH_PW']))
			$user = $usr['name'];
	}
	if (!$user)
		die('{"status" : "error", "errorMessage" : "Invalid credentials"}');

	$url = 'http://clanplayrangers.s3-eu-west-1.amazonaws.com/rangers.json';
	$response = false;
	if (($_POST['action'] === 'fetch') && ($user === 'fetchUser')) {
		$response = file_get_contents($url);
	}
	if (($_POST['action'] === 'update') && ($user === 'updateUser')) {
		$rangers = json_decode(file_get_contents($url),true);
		foreach ($rangers['rangers'] as $key => $ranger) {
			if ($_POST['rangerID'] == $ranger['id']) {
				echo 'Success! ID: '.$ranger['id'].'. Key: '.$key;
				$rangers['rangers'][$key]['Count'] += intval($_POST['newCount']);
			}
		}
        $ch = curl_init(); 
		curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
	        'Content-Type: application/json'
        ));
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($rangers));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        $action = curl_exec($ch); 
        curl_close($ch);      
	}

	if (!$response) {
		$response = json_encode(array());
	}
	echo $response;
?>