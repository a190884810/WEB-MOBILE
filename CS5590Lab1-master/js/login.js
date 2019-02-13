// Js function for login interface

function login(){

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if(username === ""){
        alert("Please enter correct username")
    }
    else if(password === ""){
        alert("Please enter correct password")
    }
    else if(username === "admin" && password === "123456"){
        window.location.href = "index.html";
    }
    else{
        alert("Invalid Username or Password")
    }


}
