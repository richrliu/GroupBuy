// add scripts

$(document).on('ready', function() {
  console.log('sanity check!');

  var chatDiv = document.getElementsByClassName('chat-body')[0]; //I assume you only have one chat box!
  chatDiv.scrollTop = chatDiv.scrollHeight;
});

function textAreaAdjust(o) {
    o.style.height = "1px";
    if (o.scrollHeight > 150) {
        o.style.height = "150px";
    } else {
        o.style.height = (o.scrollHeight)+"px";
    }
}
