var sSocleId,
    sSocleVersion;

/* Get the Socle Version & Build */
var sSocleVer = $('body').text();
sSocleVer = sSocleVer.slice(1);

var asTemp = sSocleVer.split(" build ", 2);

/* Return the result */
var oResult = new Object();
    oResult.sSocleId = asTemp[0];
    oResult.sSocleBuild = asTemp[1];
self.postMessage(oResult);
