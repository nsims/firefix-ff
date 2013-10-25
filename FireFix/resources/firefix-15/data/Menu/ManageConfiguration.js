/* List of the Form's Elements*/
var configuration;

/* *********************************************** */

/* Prefill the Form */
self.port.on("configuration", function (elementsMenu2) {
    configuration = elementsMenu2;
    for(var elt in configuration) {
        $("#" + elt).val(configuration[elt][1]);
    }
});

/* Display Warning Message */
self.port.on("warningMessage", function (warningMessage) {
    if(warningMessage[0]) {
        switch(warningMessage[1]){
            case 1:
                if($("#SWLogin").val() == "" || $("#SWPassword").val() == "") {
                    $("#SWPasswordToBeFilled").text("Login/Password is needed before creating the request.");
                } else {
                    $("#SWPasswordToBeFilled").text("Login/Password is incorrect or expired.");
                }
                break;
            case 2:
                $("#SWPasswordToBeFilled").text("Server URL is incorrect.");
                break;
            case 3:
                $("#SWPasswordToBeFilled").text("Site ID is incorrect.");
                break;
            default:
                $("#SWPasswordToBeFilled").text("Unknown Error, please contact the development team.");
                break;
        }
        
    } else {
        $("#SWPasswordToBeFilled").text("");
    }
});

/* *********************************************** */

/* Save the Form */
$("#SWSaveConfiguration").click(function() {
    sendData();
});

$("#SWPassword").keydown(function(event) {
    if(event.which == 13) { sendData(); }
});

function sendData() {
    //Save
    for(var elt in configuration) {
        configuration[elt][1] = $("#" + elt).val();
    }
    
    //Check the Extension
    if(configuration.SCFileName[1].length > 0){
        var asSCFileName = configuration.SCFileName[1].split(".");
        var asSCFileNameSize = asSCFileName.length;
        var sExtension = asSCFileName[asSCFileNameSize - 1];
        
        if( asSCFileNameSize >= 1 && (sExtension == "gif" || sExtension == "jpg" || sExtension == "bmp") ) { asSCFileName[asSCFileNameSize -1] = "png"; }
        else { if(sExtension != "png"){ asSCFileName.push("png"); } }
        
        configuration.SCFileName[1] = asSCFileName.join(".");
    }
    
    //Send the Result
    self.postMessage(configuration);
}


/* Cancel */
$(document).keydown(function(event) {
    if(event.which == 27) { self.postMessage(null); }
});

$("#SWCancelConfiguration").click(function() {
    self.postMessage(null);
});