/* List of the Form's Elements*/
var defaultValues;

/* *********************************************** */

/* Prefill the Form */
self.port.on("defaultValues", function (elementsMenu1) {
    /* Hide the Error Messages */
    $(".error").css("visibility", "hidden");

    defaultValues = elementsMenu1;
    for(var elt in defaultValues) {
        $("#" + elt).val(defaultValues[elt][1]);
    }
});

/* *********************************************** */

/* Reset */
$("#ResetDefaultValues").click(function() {
    for(var elt in defaultValues) {
        $("#" + elt).val("");
    }
});


/* Save the Form */
$("#SaveDefaultValues").click(function() {
    
    //Save the Result
    for(var elt in defaultValues) {
        defaultValues[elt][1] = $("#" + elt).val();
    }
    
    //Validate the Values
    var bError = false;
    var bValueOK;
    var anForbidden = [10, 13, 34, 124, 164, 166, 167]; // 'Line Feed' 'Carriage Return' " | ¤ ¦ §
    $(".error").css("visibility", "hidden");
    
    for(var elt in defaultValues) {
        bValueOK = true;
        
        if(defaultValues[elt][0] == "Text"){
            for(var i=0; i < anForbidden.length; i++){
                var sValue = defaultValues[elt][1];
                
                for(var j=0; j < sValue.length; j++){
                    if(sValue.charCodeAt(j) == anForbidden[i]){
                        bValueOK = false;
                    }
                }
            }
            if( !bValueOK ){
                $("#" + elt + "_Error").css("visibility", "visible");
                bError = true;
            }
        }
    }
    
    //Send the Result
    if( bError ){ $("#Error").css("visibility", "visible");  }
    else { self.postMessage(defaultValues); }
});


/* Cancel */
$(document).keydown(function(event) {
    if(event.which == 27) { self.postMessage(null); }
});

$("#CancelDefaultValues").click(function() {
    self.postMessage(null);
});