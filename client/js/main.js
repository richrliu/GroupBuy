// add scripts

$(document).on('ready', function() {
  console.log('sanity check!');

  var chatDiv = document.getElementsByClassName('chat-body')[0]; //I assume you only have one chat box!

  if (chatDiv) {
      chatDiv.scrollTop = chatDiv.scrollHeight;
  }
});

function textAreaAdjust(o) {
    o.style.height = "1px";
    if (o.scrollHeight > 150) {
        o.style.height = "150px";
    } else {
        o.style.height = (o.scrollHeight)+"px";
    }
}

function checkURL(url, element) {
    console.log("hello");
    var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (res) {
        $(element).attr("src", url);
    } else {
        $(element).attr("src", "/images/default-user.png");
    }
}
