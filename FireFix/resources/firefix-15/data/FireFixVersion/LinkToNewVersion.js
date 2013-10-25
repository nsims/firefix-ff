/* General Variables */
var sSoftwareVersionURL; 


/* Fill the HTML Form */
self.port.on("oNewVersion", function (oNewVersion) {
    $("#FFNewVersion").text(oNewVersion.sBuild);
    $("#ChangelogContent").html(oNewVersion.sChangelog);
});

self.port.on("softwareVersionURL", function (sURL) {
    sSoftwareVersionURL = sURL;
});


/* Trigger an Event to Download the new Version */
$(".Link").click(function() {
    window.open(sSoftwareVersionURL);
    self.postMessage(true);
});