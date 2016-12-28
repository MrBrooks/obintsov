<?php
if ($_POST) { 
  $name = htmlspecialchars($_POST["name"]); 
  $phone = htmlspecialchars($_POST["phone"]);
  $email = htmlspecialchars($_POST["email"]);
  $id = htmlspecialchars($_POST["id"]);

  $json = array();
  switch($id){
    case "callback":
      if (!$name or !$phone) {
        $json['error'] = 'Зaпoлнены нe всe пoля';
        echo json_encode($json);
        die();
      }
    break;
    case "subscribe":
      if (!$email) {
        $json['error'] = 'Зaпoлнены нe всe пoля';
        echo json_encode($json);
        die();
      }
    break;
    default: 
      $json['error'] = 'Unexpected form ID';
      echo json_encode($json);
      die();
  }

  function mime_header_encode($str, $data_charset, $send_charset) { 
    if($data_charset != $send_charset)
    $str=iconv($data_charset,$send_charset.'//IGNORE',$str);
    return ('=?'.$send_charset.'?B?'.base64_encode($str).'?=');
  }
  
  class TEmail {
    public $from_email;
    public $from_name;
    public $to_emails;
    public $to_name;
    public $subject;
    public $data_charset='UTF-8';
    public $send_charset='windows-1251';
    public $body='';
    public $type='text/plain';

    function send(){
      $dc = $this->data_charset;
      $sc = $this->send_charset;
      $enc_to = $this->to_emails;
      $enc_subject = mime_header_encode($this->subject,$dc,$sc);
      $enc_from = mime_header_encode($this->from_name,$dc,$sc).' <'.$this->from_email.'>';
      $enc_body = $dc==$sc?$this->body:iconv($dc,$sc.'//IGNORE',$this->body);
      $headers ='';
      $headers .= "Mime-Version: 1.0\r\n";
      $headers .= "Content-type: ".$this->type."; charset=".$sc."\r\n";
      $headers .= "From: ".$enc_from."\r\n";
      return mail($enc_to,$enc_subject,$enc_body,$headers);
    }
  }

  $emailgo= new TEmail; 
  switch($id){
    case "callback":
      $emailgo->from_email = 'callback@maxfabrigue.ru';
      $emailgo->from_name = 'CallBack';
      $emailgo->to_emails = 'hello@maxfabrique.ru, timur@mbrooks.ru, kuzmenko@mbrooks.ru, max78rus88@mail.ru';
      $emailgo->to_name = "Call back";
      $emailgo->subject = 'Заявка на звонок';
      $emailgo->body = "Заявка на звонок\r\n Имя : ".$name."\r\n Телефон : ".$phone."\r\n";
      break;
    case "subscribe":
      $emailgo->from_email = 'subscribe@maxfabrigue.ru';
      $emailgo->from_name = 'Subscribe';
      $emailgo->to_emails = 'hello@maxfabrique.ru, timur@mbrooks.ru, kuzmenko@mbrooks.ru, max78rus88@mail.ru';
      $emailgo->to_name = "Subscribe";
      $emailgo->subject = 'Заявка на подписку';
      $emailgo->body = "Заявка на подписку\r\n Email : ".$email;
      break;
    default: 
      $json['error'] = 'Unexpected form ID';
      echo json_encode($json);
      die();
  }
  
  $emailgo->send();

  $json['error'] = 0;
  echo json_encode($json);
} else {
  echo 'GET LOST!';
}
?>