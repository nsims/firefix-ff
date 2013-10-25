// Retrieve the File field Position
var sFileFieldPosition = $('#Result').text();

// Check that the retrieved value is correct
if("" + parseInt(sFileFieldPosition) == "NaN") { sFileFieldPosition = null; }

// Send the Result
self.postMessage(sFileFieldPosition);