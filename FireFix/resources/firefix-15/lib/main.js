/* *** Exported Functions *** */
exports.xDisplayMainButton = xDisplayMainButton;
exports.xLogInAndRequest = xLogInAndRequest;

/* *** Import Libraries *** */
var request = require("./Request");
var Screenshot = require("./Screenshot");
var Button = require("./Button");
var Panels = require("./Panels");
var Menu = require("./Menu");
var URL = require("./URLManagement");

/* *** Used APIs *** */
var tabs = require('tabs');
var {Cc, Ci, Cu, Cr} = require('chrome');
var ss = require("simple-storage");

/* *** General Variables *** */
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

 // Active Tab & Window when FireFix's Icon is Clicked
var CurrentTab;
var CurrentWindow;



/** ===============  MENU =============== **/

/* Create the Button */
exports.main = function(options, callbacks) {
    Menu.addToolbarButton();
};

/* Suppress the Button */
exports.onUnload = function(reason) {
    Menu.removeToolbarButton();
};



/** ===============  REQUEST =============== **/

/* *** Main Button Event *** */
var xMainButtonEvent = function(event){

    /* Retrieve the Current Tab */
    CurrentTab = tabs.activeTab;
    CurrentWindow = mediator.getMostRecentWindow("navigator:browser").gBrowser.contentWindow;

    /* Deactivate the event & Change the Pluggin Icone to Processing Icone */
    xDisplayMainButton(tabs.activeTab, true, false);
    
    /* Close the Menu Panels */
    Panels.manageMenu(1, "Hide");
    Panels.manageMenu(2, "Hide");
    Panels.manageMenu(3, "Hide");
    
    /* Check that the password has been filled */
    if(ss.storage.SWLogin === undefined || ss.storage.SWPassword.length === undefined) {
        xAskForANewPassword(1);
    } else {
        if(ss.storage.SWLogin.length < 1 || ss.storage.SWPassword.length < 1) {
            xAskForANewPassword(1);
        } else {
            /* Request Creation */
            xLogInAndRequest();
        }
    }
    
    /* Event End */
    event.stopPropagation();
};


/* *** Log In and Request *** */
function xLogInAndRequest() {
    var window = mediator.getMostRecentWindow("navigator:browser").gBrowser.contentWindow;
    
    /* === Login === */
    var Request = require("request").Request;
    var login = Request({
        url: URL.xURLElement("Get", "LoginURL"),
        content : {sid : "enablon", uid : ss.storage.SWLogin, pwd : ss.storage.SWPassword, LogIn : "Log%20In"},
        onComplete : function (response) {
            if(response.text != ""){
            
                /* === Check that the Login was Successful === */
                var Request = require("request").Request;
                var CheckLoginSuccessful = Request({
                    url: URL.xURLElement("Get", "SoftwareDataURL"),
                    onComplete: function (response) {
                        var sContent = response.text;
                        if(sContent.search("404") == -1){
                            if(sContent.search("FireFixLogged") != -1) {
                            
            					/* === Build the Request === */
                                request.xPrefillRequest(CurrentTab.url, CurrentTab.index);
                            } else {
                                xAskForANewPassword(1);
                            }
                        } else {
                            xAskForANewPassword(3);
                        }
                    }
                });
                CheckLoginSuccessful.get();
            } else {
                xAskForANewPassword(2);
            }
        }
    });
    login.post();
}
    
function xAskForANewPassword(msgType) {
    Panels.setMenu2CreateRequest(true, msgType);
    Panels.manageMenu(2, "Show");
}



/** ===============  DEFINE TABS' EVENTS =============== **/

tabs.on('ready', function(tab) {
    xTabEvent(tab);
});

tabs.on('activate', function(tab) {
    xTabEvent(tab);
});


function xTabEvent(tab) {
    /*Manage Main Button's Display*/
    xDisplayMainButton(tab, false, false);
    
    /*Capture Screenshot*/
    if( tab.url.search(URL.xURLElement("Get", "FireFixParam", null, "NormalMode")) != -1 ){
        xCaptureScreenshot(tab);
    }
}


/** ===============  TOOLS =============== **/

function xDisplayMainButton(tab, bStartOfProcess, bEndOfProcess) {
    Button.xManageDisplayMainButton(tab, bStartOfProcess, bEndOfProcess, xMainButtonEvent);
}

function xCaptureScreenshot(tab) {
    Screenshot.capture(tab, CurrentWindow);
}