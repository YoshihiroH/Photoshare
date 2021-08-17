//hashing function to store passwords securely
function hashCode(str) {
  return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
let EMPTY = "";
let CURRENT_PATH = "http://localhost:5000";
let API_URL = "http://127.0.0.1:3000";

$(document).ready(function() {

  let id = getCookie("id");
  console.log(id);
  if(id != null){
    window.location.replace(`${CURRENT_PATH}/html/homepage.html`);
  }

  $('.message a').click(function(event) {
    event.preventDefault();
    $('form').animate({
      height: "toggle",
      opacity: "toggle"
    }, "slow");
    console.log(document.getElementById("createButton"));
  });

  $('#createButton').click(function(event) {
    event.preventDefault();
    let user = $("#registerUsernameInput").val();
    let password = hashCode($("#registerPasswordInput").val());

    let credentials = {
      user: user,
      password: password
    }
    if (user != EMPTY) {
      $.post(`${API_URL}/createUser`, credentials, function(data, status) {
        if (data == EMPTY) {
          $(".error").remove();
          $(".register-form").append('<p class="error">User Already Exists</p>');
        } else {
          $(".error").remove();
          $(".register-form").append('<p class="error">Account Created!</p>');
        }
      });
    } else {
      $(".error").remove();
      $(".register-form").append('<p class="error">Invalid Username</p>');
    }
  });

  $('#loginButton').click(function(event) {
    event.preventDefault();
    let user = $("#loginUsernameInput").val();
    let password = hashCode($("#loginPasswordInput").val());
    $("#passwordInput").val(EMPTY);

    let credentials = {
      user: user,
      password: password
    }
    console.log('/user');
    $.post(`${API_URL}/user`, credentials, function(data, status) {
      
      if (data == EMPTY) {
        $(".error").remove();
        $(".login-form").append('<p class="error">Account does not exist or password is incorrect</p>');
      } else {

        document.cookie = "id="+data + ";path=/";
        window.location.replace(`${CURRENT_PATH}/html/homepage.html`);
      }
    })
  });









});
