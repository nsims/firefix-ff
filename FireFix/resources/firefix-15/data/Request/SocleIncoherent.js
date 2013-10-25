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

self.port.on("sProduct", function (sProduct) {
    $("#Product").html(sProduct);
});

self.port.on("sIsSocleCoherent", function (sIsSocleCoherent) {
    
    /* Check that the Event hasn't already been Triggered & the Buttons already Built*/
    if($('.buttons').length == 0) {
        
        /* Parse sIsSocleCoherent */
        var asSocle = sIsSocleCoherent.split("|");
        var asSoftware = asSocle[0].split("¤");
        var asApplication = asSocle[1].split("¤");
            
        
        /* Build the list of Elements */
        asButton[nValue] = parseInt(asSoftware[0]);
        asButton[nLabel] = "Software : " + asSoftware[1];
        $('form').append(asButton.join(""));

        asButton[nValue] = parseInt(asApplication[0]);
        asButton[nLabel] = "Application : " + asApplication[1];
        $('form').append(asButton.join(""));
        
        
        /* Send the Selected Result */
        $(".buttons").click(function(){
            self.postMessage($(this).attr("value"));
        });
    }
});