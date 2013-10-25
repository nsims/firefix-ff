/* *** Exported Functions *** */
exports.xPrefillRequest = xPrefillRequest;

/* *** Import Libraries *** */
var main = require("./main")
var URL = require("./URLManagement");

/* *** Used APIs *** */
var data = require("self").data;
var ss = require("simple-storage");
var tabs = require("tabs");
//pageWorkers & panels will be loaded on click to limit memory use

/* *** General Variables *** */
//Prefilled request's Data
var oData = {
    Fld__xml_Type : NaN,
    Fld__xml_Severity : NaN,
    Fld__xml_Priority : NaN,
    Fld__xml_Product : NaN,
    Fld__xml_SocleNew : NaN,
    Fld__xml_Title : NaN,
    Fld__xml_Description : NaN,
    Fld__xml_StepsToReproduce : NaN,
    Fld__xml_Keywords : NaN,
    Fld__xml_URL : NaN,
    Fld__xml_BuildProduct : NaN,
    Fld__xml_BuildSocle : NaN,
    Fld__xml_Discussions : NaN,
    Fld__xml_RequestOrigin : NaN,
    Fld__xml_RequestDestination : NaN,
    Fld__xml_Ressource : NaN
    };

// Debug
var bDebug = true;
var sLogs;



/** ===============  START TO PREFILL A NEW REQUEST =============== **/

/* *** Reset the General Variables *** */
function xPrefillRequest(sClickedURL, nClickedTabIndex) {
    if(bDebug) { sLogs = ""; }
    //sCurrentURL = sClickedURL;
    URL.xURLElement("Set", "CurrentURL", sClickedURL);
    
    for(var fld in oData) {
        var sParamValue = ss.storage[fld];
        if( sParamValue === undefined || sParamValue == 0 || sParamValue == "" ) { oData[fld] = NaN; } else { oData[fld] = sParamValue; }
    }
    
    xRetrieveErrorMessage(nClickedTabIndex); 
}

/* *** Retrieve Error Message (if it exists) *** */
function xRetrieveErrorMessage(nClickedTabIndex) {

    if(tabs[nClickedTabIndex].url == URL.xURLElement("Get", "CurrentURL", null, "NormalMode")) {
    
        tabs[nClickedTabIndex].attach({
            contentScriptFile: [data.url("JQuery.js"), data.url("Request/RetrieveErrorMessage.js")],
            onMessage: function(errorMessage) {
                if(bDebug) { sLogs += "Error Message : " + errorMessage + "\n\n"; }
                
                /* Update the Parameters */
                if(errorMessage) { oData.Fld__xml_Description = "Error Message : " + errorMessage; }
                
                xRetrieveAppVersion();
            }
        });
        
    } else {
        xRetrieveAppVersion();
    }
}


/** ===============  RETRIEVE THE APPLICATION VERSION =============== **/

function xRetrieveAppVersion() {
    
    var AppVersion = require("page-worker");
    AppVersion.Page({
        contentURL: URL.sGetSiteVersionURL("CurrentURL", "Application"),
        contentScriptFile: [data.url("JQuery.js"), data.url("Request/RetrieveAppVersion.js")],
        contentScriptWhen: "ready",
        onMessage: function(oAppVersion) {
            if(bDebug) { sLogs += "SiteVersionURL: " + URL.sGetSiteVersionURL("CurrentURL", "Application") + "\n"; }
            if(bDebug) { sLogs += "FOUND: " + oAppVersion.nNbElements + "|" + oAppVersion.sMode + "|" + oAppVersion.sAppId + "|" + oAppVersion.sAppVersion + "|" + oAppVersion.sAppBuild + "|" + oAppVersion.asElementsList + "\n\n"; }
            
            /* Update the Parameters */
            oData.Fld__xml_StepsToReproduce = sBuildElementsList(oAppVersion);
            
            /* Check that the Product has been Found. If Not the User Choose in the List */
            if(oAppVersion.sAppId == null) {
            
                var bClosePanelAllowed = false;
                
                var ProductList = require("panel").Panel({
                    width: 260,
                    height: 130 + oAppVersion.nNbElements * 35,
                    contentURL: data.url("Request/ProductList.html"),
                    contentScriptFile: [data.url("JQuery.js"), data.url("Request/ProductList.js")],
                    contentScriptWhen: "end",
                    onMessage: function(nSelectedElement) {
                        if(bDebug) { sLogs += "List of Elements\n"; }
                        if(bDebug) { sLogs += "FOUND: " + nSelectedElement + "\n\n"; }
                        
                        bClosePanelAllowed = true;
                        ProductList.hide();
                        
                        if(nSelectedElement > -1) {
                            var asElementsList = oAppVersion.asElementsList;
                            var sSelectedElement = asElementsList[nSelectedElement]
                            var asElementProperties = sSelectedElement.split("¤")
                            oAppVersion.sAppId = asElementProperties[1];
                            oAppVersion.sAppVersion = asElementProperties[2];
                            oAppVersion.sAppBuild = asElementProperties[3];
                        }
                        ProductList.destroy();
                        xRetrieveSocleVersion(oAppVersion);
                    },
                    onShow: function() {
                        ProductList.port.emit("oAppVersion", oAppVersion);
                    },
                    onHide: function() {
                        if(!bClosePanelAllowed) { ProductList.show(); }
                    }
                });
                ProductList.show();
                
            } else {
            
                xRetrieveSocleVersion(oAppVersion);
            }
        }
    });
    //Destroy the previously created page worker to release the used memory
    //AppVersion.destroy();
    return null;
}

function sBuildElementsList(oAppVersion) {
    
    var sResult = '';
    
    if(oAppVersion.sMode == 'VPACK' || oAppVersion.sMode == 'VMOD') {
        var sModeLabel;
        if(oAppVersion.sMode == 'VPACK') { sModeLabel = 'Packages'; } else { sModeLabel = 'Modules'; }
        sResult += 'List of ' + sModeLabel+ ' in the solution :\n';
        
        asElementsList = oAppVersion.asElementsList;
        for(var i = 0; i < asElementsList.length; i++) {
            asLabel = asElementsList[i].split('¤', 1);
            sResult += asLabel[0] + "\n";
        }
    } else {
        sResult += 'There is no Package or Module in this solution.\n';
    }
    
    return sResult;
}


/** ===============  RETRIEVE THE SOCLE VERSION =============== **/

function xRetrieveSocleVersion(oAppVersion) {
    
    var SocleVersion = require("page-worker");
    SocleVersion.Page({
        contentURL: URL.sGetSiteVersionURL("CurrentURL", "Socle"),
        contentScriptFile: [data.url("JQuery.js"), data.url("Request/RetrieveSocleVersion.js")],
        contentScriptWhen: "ready",
        onMessage: function(oSocleVersion) {
            if(bDebug) { sLogs += "SocleVersionURL: " + URL.sGetSiteVersionURL("CurrentURL", "Socle") + "\n"; }
            if(bDebug) { sLogs += "FOUND: " + oSocleVersion.sSocleId + "|" + oSocleVersion.sSocleBuild + "\n\n"; }
            xGetSoftwareIds(oAppVersion, oSocleVersion);
        }
    });
    //Destroy the previously created page worker to release the used memory
    //SocleVersion.destroy();
    return null;
}


/** ===============  RETRIEVE SOFTWARE IDS =============== **/

function xGetSoftwareIds(oAppVersion, oSocleVersion) {
    
    /* Build the Ajax Request's URL */
    var asURLParameters = new Array();
        asURLParameters.splice(-1, 0, "&Process=nGetAllElements");
        asURLParameters.splice(-1, 0, "&sAppId=" + oAppVersion.sAppId);
        asURLParameters.splice(-1, 0, "&sAppVersion=" + oAppVersion.sAppVersion);
        asURLParameters.splice(-1, 0, "&sAppBuild=" + oAppVersion.sAppBuild);
        asURLParameters.splice(-1, 0, "&sSocleVersion=" + oSocleVersion.sSocleId);
        asURLParameters.splice(-1, 0, "&sSocleBuild=" + oSocleVersion.sSocleBuild);
    var sURL = URL.xURLElement("Get", "SoftwareDataURL") + asURLParameters.join("");
    
    /* Make the Ajax Request */
     var SoftwareIds = require("page-worker");
     SoftwareIds.Page({
         contentURL: sURL,
         contentScriptFile: [data.url("JQuery.js"), data.url("Request/RetrieveSoftwareIds.js")],
         contentScriptWhen: "ready",
         onMessage: function(oSoftwareIds) {
             if(bDebug) { sLogs += "SoftwareURL: " + sURL + "\n"; }
             if(bDebug) { sLogs += "FOUND: " + oSoftwareIds.sProduct + "|" + oSoftwareIds.sProductBuild + "|" + oSoftwareIds.sSocle + "|" + oSoftwareIds.sSocleBuild + "|" + oSoftwareIds.sProductArchitect + "|" + oSoftwareIds.sIsSocleCoherent + "\n"; }
             
             /* Update the parameters */
             oData.Fld__xml_Product = parseInt(oSoftwareIds.sProduct);
             oData.Fld__xml_BuildProduct = parseInt(oSoftwareIds.sProductBuild);
             oData.Fld__xml_SocleNew = parseInt(oSoftwareIds.sSocle);
             oData.Fld__xml_BuildSocle = parseInt(oSoftwareIds.sSocleBuild);
             if("" + oData.Fld__xml_Ressource == "NaN") { oData.Fld__xml_Ressource = oSoftwareIds.sProductArchitect };
             
             /* Check that the Socle Linked to the Product is Coherent with the one of the Application */
             if(oSoftwareIds.sIsSocleCoherent != "OK" && oSoftwareIds.sIsSocleCoherent.length > 0) {
                 var bClosePanelAllowed = false;
                 var SocleIncoherent = require("panel").Panel({
                    width: 260,
                    height: 180,
                    contentURL: data.url("Request/SocleIncoherent.html"),
                    contentScriptFile: [data.url("JQuery.js"), data.url("Request/SocleIncoherent.js")],
                    contentScriptWhen: "end",
                    onMessage: function(nChosenSocle) {
                        if(bDebug) { sLogs += "Selected Socle\n"; }
                        if(bDebug) { sLogs += "FOUND: " + nChosenSocle + "\n\n"; }

                        bClosePanelAllowed = true;
                        SocleIncoherent.hide();

                        if(oData.Fld__xml_SocleNew != nChosenSocle) {
                            oData.Fld__xml_BuildSocle = NaN;
                            oData.Fld__xml_SocleNew = nChosenSocle;
                        }

                        SocleIncoherent.destroy();
                        xConstructURL();
                    },
                    onShow: function() {
                        SocleIncoherent.port.emit("sProduct", oAppVersion.sAppId + "&nbsp" + oAppVersion.sAppVersion);
                        SocleIncoherent.port.emit("sIsSocleCoherent", oSoftwareIds.sIsSocleCoherent);
                    },
                    onHide: function() {
                        if(!bClosePanelAllowed) { SocleIncoherent.show(); }
                    }
                });
                SocleIncoherent.show();
             } else {
                 xConstructURL();
             }
         }
     });
     //Destroy the previously created page worker to release the used memory
     //SoftwareIds.destroy();
     return null;
}
     

/** ===============  BUILD THE PREFILLED REQUEST'S URL =============== **/

function xConstructURL() {

    /* Update the Data */
    // I didn't manage to make the test with the function isNaN() properly working, hence these strange tests in the function
    if("" + oData.Fld__xml_Type == "NaN") { oData.Fld__xml_Type = "BG"; } //BG = Bug
    if("" + oData.Fld__xml_Severity == "NaN") { oData.Fld__xml_Severity = 3; } // dans la config
    if("" + oData.Fld__xml_Priority == "NaN") { oData.Fld__xml_Priority = 3; } // dans la config
    // DONE oData.Fld__xml_Product = NaN;
    // DONE oData.Fld__xml_SocleNew = NaN;
    if("" + oData.Fld__xml_Title == "NaN") { oData.Fld__xml_Title = sGetTitle(); }
    // ONLY DEFAULT oData.Fld__xml_Description = NaN;
    if("" + oData.Fld__xml_StepsToReproduce == "NaN") { oData.Fld__xml_StepsToReproduce = "Browser : Mozilla Firefox"; }
        else { oData.Fld__xml_StepsToReproduce += "\n\nBrowser : Mozilla Firefox"; }
    if("" + oData.Fld__xml_Keywords == "NaN") { oData.Fld__xml_Keywords = "FIREFIX"; }
        else { oData.Fld__xml_Keywords += ",FIREFIX"; }
    if("" + oData.Fld__xml_URL == "NaN") { oData.Fld__xml_URL = URL.xURLElement("Get", "CurrentURL", null, "NormalMode"); }
    // DONE oData.Fld__xml_BuildProduct = NaN;
    // DONE oData.Fld__xml_BuildSocle = NaN;
    if("" + oData.Fld__xml_Discussions == "NaN") { oData.Fld__xml_Discussions = '=== Generated by FireFix pluggin ===\n'; }
        else { oData.Fld__xml_Discussions += '\n\n=== Generated by FireFix pluggin ===\n'; }
    if("" + oData.Fld__xml_RequestOrigin == "NaN") { oData.Fld__xml_RequestOrigin = 4; } // dans la config
    if("" + oData.Fld__xml_RequestDestination == "NaN") { oData.Fld__xml_RequestDestination = 2; } // INNO
    // DONE, oData.Fld__xml_Ressource = NaN;
    
    
    /* Build the URL */
    sCompleteURL = URL.xURLElement("Get", "SoftwareRequestURL", null, "AddMode");
    for(var fld in oData) {
        if(bDebug) { sLogs += fld + " -> " + oData[fld] + "\n"; }
        if( "" + oData[fld] != "NaN" ) { sCompleteURL += "&" + fld + "=" + encodeURIComponent(oData[fld]); }
    }
    sCompleteURL += "&ext=1" + URL.xURLElement("Get", "FireFixParam", null, "NormalMode");

    if(bDebug) { console.log("DEBUG LOGS\n\n" + sLogs + "\n" + "sCompleteURL: " + sCompleteURL); }
    
    /* Open the Request's Tab */
    tabs.open({
        url: sCompleteURL,
        onReady: function() {
            /* Set Back the Pluggin Icone & Reactivate the Main Button Event if needed */
            main.xDisplayMainButton(tabs.activeTab, false, true); 
        }
    });
    
    return null;
}



/** ===============  TOOLS =============== **/

function sGetTitle() {

    var sCurrentURL = URL.xURLElement("Get", "CurrentURL");
    var asURL = sCurrentURL.split("/", 8);
    var sTitleWithGetVar = asURL[7];
    var asTitle;
        if(sTitleWithGetVar === undefined) { asTitle = new Array(""); } else { asTitle = sTitleWithGetVar.split("&", 1); }
    return "[" + asURL[4] + " - " + asTitle[0] +"]";
}
