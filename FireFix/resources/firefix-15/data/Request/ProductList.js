/* Button Template */
var asButton = new Array(
    '<div class=\"buttons\" value=', null, '>' +
        '<button type=\"submit\" class=\"element\">',
            null,
        '</button>' +
    '</div>'
);
var nValue = 1;
var nLabel = 3;

/* Build the list of Elements */
self.port.on("oAppVersion", function (oAppVersion) {
    
    /* Check that the Event hasn't already been Triggered & the Buttons already Built*/
    if($('.buttons').length == 0) {
    
        /* Update the Introduction */
        var sModeLabel;
        if(oAppVersion.sMode == 'VPACK') { sModeLabel = 'Packages'; } else { sModeLabel = 'Modules'; }
        $(".elementsFound").text(sModeLabel);
        
        /* Build the list of Elements */
        var asElementsList = oAppVersion.asElementsList;
        
        for(i = 0; i < oAppVersion.nNbElements; i++) {
            var asLabel = asElementsList[i].split('¤', 1);
            asButton[nValue] = i;
            asButton[nLabel] = asLabel[0];
            $('form').append(asButton.join(""));
        }
        
        asButton[nValue] = -1;
        asButton[nLabel] = "I will choose on Software";
        $('form').append(asButton.join(""));
        
        
        /* Send the Selected Result */
        $(".buttons").click(function(){
            self.postMessage($(this).attr("value"));
        });
    }
});