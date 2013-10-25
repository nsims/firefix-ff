if($('#nResult').length == 1) {
    /* Only one element was requested */
    var sResult = $('#nResult').text();
    self.postMessage(sResult);
} else {
    /* All the elements were requested */
    var oAllElements = new Object();
        oAllElements.sProduct = $('#nGetProduct').text();
        oAllElements.sProductBuild = $('#nGetProductBuild').text();
        oAllElements.sSocle = $('#nGetSocle').text();
        oAllElements.sSocleBuild = $('#nGetSocleBuild').text();
        oAllElements.sProductArchitect = $('#sGetProductArchitect').text();
        oAllElements.sIsSocleCoherent = $('#sIsSocleCoherent').text();
    self.postMessage(oAllElements);
}
