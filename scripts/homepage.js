function setCookie(key, value, expiry) {
  var expires = new Date();
  expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}

let CURRENT_PATH = "http://localhost:5000";
let API_URL = "http://127.0.0.1:3000";

var imageIndex;





$(document).ready(function () {


  //Helper  
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

  //Housekeeping function
  //eraseCookieFromAllPaths("id");

  //Homepage Loading Handlers

  //ID getter from cookies
  let id = getCookie("id");
  console.log(id);
  if (id == null) {
    window.location.replace(`${CURRENT_PATH}/html/index.html`);
  }

  //Request for Users uploads by index
  function userImages(index) {
    var formData = new FormData();
    formData.append('USER_ID', id);
    formData.append('INDEX', index);
    $.ajax({
      url: `${API_URL}/userImages`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        for (var i = 0; i < data.length; i++) {
          //Conversion to base64 for html <img>
          function toBase64(arr) {
            arr = new Uint8Array(arr)
            return btoa(
              arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
          }
          var imageView = $(`<div class='imageView'></div>`);
          var uploadDate = data[i].DATE.substring(0, 10);
          imageView.append($(`<p>${data[i].TITLE} ${uploadDate}</p>`))
          imageView.append($('<img>', {
            src: `data:image/png;base64,${toBase64( data[i].IMAGE['data'])}`
          }));
          imageView.append($(`<p>By ${data[i].USERNAME}</p>`));
          $('.feedView').append(imageView);
        }
      }
    });
  }

  //Logout Button Handler
  $("#logoutButton").click(function (event) {
    event.preventDefault();
    document.cookie = "id=; path=/; expires=Thu, 01-Jan-1970 00:00:01 GMT;"
    window.location.replace(`${CURRENT_PATH}/html/index.html`);
  });



  //Upload Modal Event Handlers

  //Show upload modal
  $("#uploadButton").click((event) => {
    if($('#uploadForm').is(':hidden')){
      $('#uploadForm').show('slow');
    } 
    $('#uploadModalView').toggle('slow');
  });

  //Hide upload modal
  $('#uploadModalCloseButton').click(function(){
    $('#uploadModalView').toggle('slow');
    $('#uploadSuccessMessage').hide('slow');
    $('#uploadErrorMessage').hide('slow');
    $('#uploadErrorMessage').text('');
    $('#uploadForm')[0].reset();
    $('#imagePreview').hide('fast');
    $('#imagePreview').attr('src', null);
  });

  //Upload preview update
  $('#uploadImage').change(function(event){
    if($('#uploadImage')[0].files[0] != 0){
      $('#imagePreview').show('fast');
      $('#imagePreview').attr('src', URL.createObjectURL($('#uploadImage')[0].files[0]));
    }
  })

  //Event handler to send image and image details to server
  $("#uploadSubmitButton").click((event) => {
    event.preventDefault();
    var uploadImage = $('#uploadImage')[0].files[0];
    var uploadTitle = $('#uploadTitle').val();
    var formData = new FormData();
    formData.append('USER_ID', id);
    formData.append('Title', uploadTitle);
    formData.append('data', uploadImage);
    console.log(uploadImage);
    $.ajax({
      url: `${API_URL}/uploadImage`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        $('#uploadForm').toggle('slow');
        $('#uploadSuccessMessage').show('slow');
        
      },
      error: function (data){
        $('#uploadErrorMessage').show('slow');
        $('#uploadError').text('Server Error');
      }
    });
  });

  //Search Modal Handlers

  //Show search modal
  $("#searchButton").click((event) => {
    if($('#searchModalView').is(':hidden')){
      $('#searchModalView').show('slow');
    } else {
      $('#searchModalView').toggle('slow');
    }
  });

  //Hide search modal
  $('#searchModalCloseButton').click(function(){
    $('#searchModalView').toggle('slow');
    $('#searchForm')[0].reset();
  });

  

  //Homepage event handler

  //request more user images
  $("#nextButton").click((event) => {
    event.preventDefault();
    userImages(imageIndex = imageIndex + 3);
  })

  //request users recent images
  userImages(imageIndex = 0);




});