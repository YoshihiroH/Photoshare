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

  //Conversion to base64 for html <img>
  function toBase64(arr) {
    arr = new Uint8Array(arr)
    return btoa(
      arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
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

  //Friends variable declaration
  var friends;
  var pendingFriends;
  var friendRequests;
  let tempFD = new FormData();
  tempFD.append('USER_ID', id);
  $.ajax({
    url: `${API_URL}/userFriends`,
    type: 'POST',
    data: tempFD,
    processData: false,
    contentType: false,
    success: function (data) {
      friends = data;
    },
    error: function(data){}
  });
  $.ajax({
    url: `${API_URL}/pendingFriendRequests`,
    type: 'POST',
    data: tempFD,
    processData: false,
    contentType: false,
    success: function (data) {
      pendingFriends = data;
    },
    error: function(data){}
  });
  $.ajax({
    url: `${API_URL}/friendRequests`,
    type: 'POST',
    data: tempFD,
    processData: false,
    contentType: false,
    success: function (data) {
      friendRequests = data;
    },
    error: function(data){}
  });

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
  $("#logoutHeaderButton").click(function (event) {
    event.preventDefault();
    document.cookie = "id=; path=/; expires=Thu, 01-Jan-1970 00:00:01 GMT;"
    window.location.replace(`${CURRENT_PATH}/html/index.html`);
  });

  //Upload Modal Event Handlers

  //Show upload modal
  $("#uploadHeaderButton").click((event) => {
    $('#uploadAvatarForm').hide('fast', function () {
      $('#uploadForm').show('fast', function () {
        $('#uploadModalView').show('slow');
      });
    });
  });

  //Hide upload modal
  $('#uploadModalCloseButton').click(function () {
    $('#uploadModalView').toggle('slow');
    $('#uploadSuccessMessage').hide('slow');
    $('#uploadErrorMessage').hide('slow');
    $('#uploadErrorMessage').text('');
    $('#uploadForm')[0].reset();
    $('#imagePreview').hide('fast');
    $('#imagePreview').attr('src', null);
  });

  //Upload preview update
  $('#uploadImage').change(function (event) {
    if ($('#uploadImage')[0].files[0] != 0) {
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
        $('#uploadSuccessMessage').show('fast', function () {
          $('#uploadForm').hide('slow');
        });
      },
      error: function (data) {
        $('#uploadError').text('Server Error', function () {
          $('#uploadErrorMessage').show('slow');
        });
      }
    });
  });

  //Event handler to upload user avatar
  $('#uploadAvatarSubmitButton').click(function (event) {
    event.preventDefault();
    var uploadAvatar = $('#uploadAvatar')[0].files[0];
    var formData = new FormData();
    formData.append('USER_ID', id);
    formData.append('data', uploadAvatar);
    $.ajax({
      url: `${API_URL}/uploadAvatar`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        $('#uploadSuccessMessage').show('fast', function () {
          $('#uploadAvatarForm').hide('slow');
        });
      },
      error: function (data) {
        $('#uploadError').text('Server Error', function () {
          $('#uploadErrorMessage').show('slow');
        });
      }
    })
  });

  //Search Modal Handlers

  //Show search modal
  $("#searchHeaderButton").click((event) => {
    if ($('#searchModalView').is(':hidden')) {
      $('#searchModalView').show('slow');
    } else {
      $('#searchModalView').toggle('slow');
    }
  });

  //Hide search modal
  $('#searchModalCloseButton').click(function () {
    $('#searchModalView').toggle('slow');
    $('#userPreviewView').hide('fast');
    $('#searchForm')[0].reset();
    $('#userPreviewView').empty();
  });

  //Add Friend handler
  let addFriend = function (addresseeID) {
    var formData = new FormData();
    formData.append('USER_ID', id);
    formData.append('AddresseeID', addresseeID);
    $.ajax({
      url: `${API_URL}/friendRequest`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        $('#addButton').remove();
      },
      error: function (data) {}
    });
  }

  //Accept Friend Handler
  let acceptFriend = function(addresseeID){
    var formData = new FormData();
    formData.append('USER_ID', addresseeID);
    formData.append('AddresseeID', id);
    $.ajax({
      url: `${API_URL}/acceptFriendRequest`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        $('#acceptFriendRequestButton').remove();
      },
      error: function (data) {}
    });
  }

  //User preview click handler
  let userPreviewOnClick = function (event) {
    console.log($(this).find('p').html())
    var formData = new FormData();
    formData.append('username', $(this).find('p').html());
    formData.append('exact_match', 1);
    formData.append('by_ID', 0);
    $.ajax({
      url: `${API_URL}/userSearch`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        $('.profileHeader').hide(0, function () {
          $('.homeHeader').show(0);
        });
        $('.home-page').hide("slow", function () {
          try {
            $('#avatar').attr('src', `data:image/png;base64,${toBase64( data[0].avatar['data'])}`);
          } catch (err) {
            $('#avatar').attr('src', "/assets/avatar-placeholder.jpeg");
          }
          $('#avatarButton').remove();
          $('#acceptFriendRequestButton').remove();
          $('#friendStatusMessage').remove();
          $('#addButton').remove();
          if (!$('#avatarButton').length) {
            if (id == data[0].USER_ID) {
              $('.profileView').append('<button id="avatarButton">Change Profile Picture</button>');
              $('#avatarButton').click(function (event) {
                $('#uploadForm').hide('fast', function () {
                  $('#uploadAvatarForm').show('fast', function () {
                    $('#uploadModalView').show('slow');
                  });
                });
              });
            } else {
              console.log(data[0].USER_ID)
              var flag = 0;
              if (friends != undefined) {
                for (var i = 0; i < friends.length; i++) {
                  console.log(friends[i].AddresseeID);
                  if (friends[i].AddresseeID == data[0].USER_ID) {
                    flag = 1;
                  }
                }
              }
              if (pendingFriends != undefined) {
                for (var i = 0; i < pendingFriends.length; i++) {
                  if (pendingFriends[i].AddresseeID == data[0].USER_ID) {
                    flag = 2;
                  }
                }
              }
              if (friendRequests != undefined) {
                for (var i = 0; i < friendRequests.length; i++) {
                  console.log(friendRequests[i].RequesterID)
                  console.log(data[0].USER_ID)
                  if (friendRequests[i].RequesterID == data[0].USER_ID) {
                    flag = 3;
                  }
                }
              }
              console.log(flag)
              if (flag == 0) {
                $('.profileView').append('<button id="addButton">Add Friend</button>');
                $('#addButton').click(function(){
                  addFriend(data[0].USER_ID)
                  $('.profileView').append('<label id="friendStatusMessage">Pending</label>')
                });
              } else if (flag == 2 ){
                $('.profileView').append('<label id="friendStatusMessage">Pending</label>')
              } else if (flag == 3){
                $('.profileView').append('<button id="acceptFriendRequestButton">Accept Friend Request</button>')
                $('#acceptFriendRequestButton').click(function(){
                  acceptFriend(data[0].USER_ID);
                });
              }
            }
          }
          $('#usernameLabel').text(data[0].USERNAME);
          $('.profile-page').show("slow");
        });
      },
      error: function (data) {}
    });
    $('#searchModalView').toggle('slow');
    $('#userPreviewView').hide('fast');
    $('#searchForm')[0].reset();
    $('#userPreviewView').empty();
  }

  //Event handler to search for users
  $("#searchSubmitButton").click((event) => {
    $('#userPreviewView').hide('fast');
    event.preventDefault();
    var search = $('#searchText').val();
    var formData = new FormData();
    formData.append('username', search);
    formData.append('exact_match', 0);
    formData.append('by_ID', 0);
    $.ajax({
      url: `${API_URL}/userSearch`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        console.log(data);
        var sum = 0;
        $('#userPreviewView').empty();
        $('#userPreviewView').show('fast');
        for (var i = 0; i < data.length; i++) {
          if (id != data[i].USER_ID) {
            var userPreview = $('<div class="userPreview"></div>');
            try {
              var iconView = $('<div class="iconView"></div>');
              var icon = $('<img class="icon">');
              icon.attr('src', `data:image/png;base64,${toBase64( data[i].avatar['data'])}`);
              iconView.append(icon);
              userPreview.append(iconView);
            } catch (err) {
              userPreview.append('<div class="iconView"><img class="icon" src="/assets/avatar-placeholder.jpeg"></div>')
            }
            userPreview.append(`<p class="userPreviewUsername">${data[i].USERNAME}</p>`)
            userPreview.click(userPreviewOnClick);
            $('#userPreviewView').append(userPreview);
            sum++;
          }
        }
        if (sum > 0) {
          $("#userPreviewView").show("slow");
        }
      },
      error: function (data) {}
    });
  });

  //Profile event handlers
  $("#profileHeaderButton").click(function (event) {
    var formData = new FormData();
    formData.append('USER_ID', id);
    formData.append('by_ID', 1);
    $.ajax({
      url: `${API_URL}/userSearch`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        $('.profileHeader').hide(0, function () {
          $('.homeHeader').show(0);
        });
        $('.home-page').hide("slow", function () {
          try {
            $('#avatar').attr('src', `data:image/png;base64,${toBase64( data[0].avatar['data'])}`);
          } catch (err) {
            $('#avatar').attr('src', "/assets/avatar-placeholder.jpeg");
          }
          if (!$('#avatarButton').length) {
            if (id == data[0].USER_ID) {
              $('.profileView').append('<button id="avatarButton">Change Profile Picture</button>');
              $('#avatarButton').click(function (event) {
                $('#uploadForm').hide('fast', function () {
                  $('#uploadAvatarForm').show('fast', function () {
                    $('#uploadModalView').show('slow');
                  });
                });
              });
            }
          }
          $('#usernameLabel').text(data[0].USERNAME);
          $('.profile-page').show("slow");
        });
      },
      error: function (data) {}
    });
  });
  
  // Profile Return to home page event handler
  $('#homeHeaderButton').click(function (event) {
    $('.homeHeader').hide(0, function () {
      $('.profileHeader').show(0, function () {
        $('.profile-page').hide('fast', function () {
          $('.home-page').show('slow');
        });
      });
    });
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