<?PHP
	require_once('include/PHPMailer.php');
	require_once('include/SMTP.php');
	
	$mail = new PHPMailer;
    $mail->isSMTP();
	$mail->Host = 'pro.parahoster.com';
    $mail->Port = 587;
    $mail->SMTPAuth = true;
    $mail->Username = 'username@host.com';
    $mail->Password = 'PASSWORD';
    $mail->setFrom('from@host.com', 'Muaaz Khalid'); // ===> FROM
	$mail->addAddress('to@host.com');				// ===> TO
	$mail->Subject = 'New Feedback';					// ===> SUBJECT
	$mail->isHTML(false);
	
	$img = base64_decode(str_replace(' ', '+', str_replace('data:image/png;base64,', '', $_POST['img64'])));
    $file = uniqid() . '-feedback.png';
    $success = file_put_contents($file, $img);
    if($success) {
		$mail->addAttachment($file);
	}
	
	$body .= "Comment: ".$_POST['comment']."\n";
	foreach($_POST['debugData']['global'] as $k => $v) {
		$body .= "Global ".$k.": ".$v."\n";
	}
	foreach($_POST['debugData']['application'] as $k => $v) {
		$body .= "Application ".$k.": ".$v."\n";
	}
	foreach($_POST['debugData']['client'] as $k => $v) {
		$body .= "Client ".$k.": ".$v."\n";
	}
	foreach($_POST['extraData'] as $k => $v) {
		$body .= $k.": ".$v."\n";
	}
	$mail->Body = $body;								// ===> EMAIL CONTENT
	
	try {
		$mail->send();
		echo 'Message has been sent';
	} catch (Exception $e) {
		
	}
	
	@unlink($file);
?>