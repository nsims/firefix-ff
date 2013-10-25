var oNewVersion = new Object();

var sVersion = $("#FFLastVersion").text();
var asVer = sVersion.split(" ");
oNewVersion.sBuild = asVer[1];

oNewVersion.sChangelog = $(".changelog td").html();

var nChangelogSize = $(".changelog").css("height");
oNewVersion.nChangelogSize = parseFloat(nChangelogSize);

self.postMessage(oNewVersion);
self.port.emit("destroy", true);