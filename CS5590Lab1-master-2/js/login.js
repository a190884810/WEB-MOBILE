// Js function for login interface

function login(){

    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if(username === ""){
        alert("Please enter correct username")
    }
    else if(password === ""){
        alert("Please enter correct password")
    }
    else if(validation(username, password)){
        localStorage["user"] = username;
        return true;
    }
    else{
        alert("Invalid Username or Password")
    }
    return false;

}

function validation(username, password){

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var userArray = ["alex", "matt", "hanson", "guest"];
    var passwArray = ["pass", "pass", "pass", "cs5590"];

    for (var i = 0; i < userArray.length; i++) {
        if ((username === userArray[i]) && (password === passwArray[i])) {
            return true;
            break;
        }
    }
    return false;
}
