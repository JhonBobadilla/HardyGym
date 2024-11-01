<?php
$dbhost = "localhost";
$dbuser = "root";
$dbpass = "";
$dbname = "formulario";
$conn = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);

if (!$conn){
    die("No hay conexión: ".mysqli_connect_error());
}

$nombre = $_POST["txtemail"];
$pass = $_POST["txtpassword"];
$query = mysqli_query($conn,"SELECT * FROM datos WHERE email = '".$nombre."' and password = '".$pass."'");

$nr = mysqli_num_rows ($query);

if($nr == 1){
    header("Location: servicios.html");
    //echo "bbbbbbbbbbbbb:" .$nombre;
} else if ($nr == 0) {
    header("Location: index.html");
    
