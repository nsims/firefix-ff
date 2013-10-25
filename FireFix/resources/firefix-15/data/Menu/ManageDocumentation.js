/* General Variables */
var sSoftwareVersionURL = "";

/* ============================================================= */

/* Prefill the Form */
self.port.on("version", function (version) {
    $("#version").text(version);
});

self.port.on("softwareVersionURL", function (softwareVersionURL) {
    sSoftwareVersionURL = softwareVersionURL;
});

/* ============================================================= */

function close() {
    self.postMessage(true);
}

//Follow Link to Software
$("h2.version").click(function(){
    close();
    window.open(sSoftwareVersionURL);
});

// Close Documentation
$(document).keydown(function(event) {
    if(event.which == 27) { close(); }
});

$(".close").click(function() {
    close();
});