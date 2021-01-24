function setCookie(key, value, expiry) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

$(document).ready(function() {

  function eraseCookieFromAllPaths(name) {
      // This function will attempt to remove a cookie from all paths.
      var pathBits = location.pathname.split('/');
      var pathCurrent = ' path=';

      // do a simple pathless delete first.
      document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;';

      for (var i = 0; i < pathBits.length; i++) {
          pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[i];
          document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;' + pathCurrent + ';';
      }
  }

//eraseCookieFromAllPaths("id");

  let id = getCookie("id");
  console.log(id);
  if(id == null){
    window.location.replace("http://192.168.2.12:5000/html");
  }

  $("#logoutButton").click(function(){
    document.cookie = "id=; path=/; expires=Thu, 01-Jan-1970 00:00:01 GMT;"
    window.location.replace("http://192.168.2.12:5000/html");
  });
});
