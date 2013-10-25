/* *** Exported Functions *** */
exports.manageMenu = manageMenu;
exports.setMenu2CreateRequest = setMenu2CreateRequest;

/* *** Import Libraries *** */
var main = require("./main");
var Version = require("./Version");
var URL = require("./URLManagement");

/* *** Used APIs *** */
var data = require("self").data;
var tabs = require('tabs');
var ss = require("simple-storage");

/* *** General Variables *** */
var allowHideMenu1 = true;
var elementsMenu1 = {
        Fld__xml_Title : ["Text", NaN],
        Fld__xml_Severity : ["List", NaN],
        Fld__xml_Priority : ["List", NaN],
        Fld__xml_Keywords : ["Text", NaN],
        Fld__xml_Description : ["TextArea", NaN],
        Fld__xml_StepsToReproduce : ["TextArea", NaN],
        Fld__xml_Ressource : ["Text", NaN]
};

var allowHideMenu2 = true;
var elementsMenu2 = {
        SWLogin : ["Text", NaN],
        SWPassword : ["Text", NaN],
        SCFileName : ["Text", NaN],
        ServerURL : ["Text", NaN],
        SoftwareSiteId : ["Text", NaN]
};
var menu2CreateRequest = false;
var menu2MessageType;

var allowHideMenu3 = true;



/** ===============  MENU 1 =============== **/

var panelMenu1 = require("panel").Panel({
    width: 500,
    height: 500,
    contentURL: data.url("Menu/DefaultValues.html"),
    contentScriptFile: [data.url("JQuery.js"), data.url("Menu/ManageDefaultValues.js")],
    contentScriptWhen: "end",
    
    onMessage: function (defaultValues){
        if( defaultValues != null ) {
            for(var elt in defaultValues) {
                    ss.storage[elt] = defaultValues[elt][1];
            }
        }
        
        allowHideMenu1 = true;
        panelMenu1.hide();
    },
    
    onShow: function() {
        allowHideMenu1 = false;
        
        for(var elt in elementsMenu1) {
            elementsMenu1[elt][1] = ss.storage[elt];
        }
        panelMenu1.port.emit("defaultValues", elementsMenu1);
    },
    
    onHide: function(){
        if( !allowHideMenu1 ) { panelMenu1.show(); }
    }
})



/** ===============  MENU 2 =============== **/

var panelMenu2 = require("panel").Panel({
    width: 500,
    height: 650,
    contentURL: data.url("Menu/Configuration.html"),
    contentScriptFile: [data.url("JQuery.js"), data.url("Menu/ManageConfiguration.js")],
    contentScriptWhen: "end",
    
    onMessage: function (configuration){
        if( configuration != null ) { 
            for(var elt in configuration) {
                    ss.storage[elt] = configuration[elt][1];
            }
            if(configuration.ServerURL[1] != "") { URL.xURLElement("Set", "ServerURL", configuration.ServerURL[1]); }
            if(configuration.SoftwareSiteId[1] != "") { URL.xURLElement("Set", "SoftwareSiteId", configuration.SoftwareSiteId[1]); }
        } else {
            if(menu2CreateRequest) {
                setMenu2CreateRequest(false);
                main.xDisplayMainButton(tabs.activeTab, false, true);
            }
        }
        
        /* When creating the Request the Login/Password has to be Filled - Check that it has been done */
        if( (menu2CreateRequest && ss.storage.SWLogin.length >= 1 && ss.storage.SWPassword.length >= 1) || !menu2CreateRequest ) {
            allowHideMenu2 = true;
            panelMenu2.hide();
            
            if(menu2CreateRequest) {
                setMenu2CreateRequest(false);
                main.xLogInAndRequest();
            }
        }
    },
    
    onShow: function() {
        allowHideMenu2 = false;
        /* Fill the Fields in the PopUp */
        for(var elt in elementsMenu2) {
            elementsMenu2[elt][1] = ss.storage[elt];
        }

        if(elementsMenu2.ServerURL[1] === undefined || elementsMenu2.ServerURL[1] == "") {
            elementsMenu2.ServerURL[1] = URL.xURLElement("Get", "ServerURL", null, "NormalMode");
        }
        if(elementsMenu2.SoftwareSiteId[1] === undefined || elementsMenu2.SoftwareSiteId[1] == "") {
            elementsMenu2.SoftwareSiteId[1] = URL.xURLElement("Get", "SoftwareSiteId", null, "NormalMode");
        }
        panelMenu2.port.emit("configuration", elementsMenu2);
        
        /* When creating the Request the Login/Password has to be Filled */
        /* Or the defined server may be wrong */
        panelMenu2.port.emit("warningMessage", [menu2CreateRequest, menu2MessageType]);
    },
    
    onHide: function(){
        if( !allowHideMenu2 ) { panelMenu2.show(); }
    }
})



/** ===============  MENU 3 =============== **/

var panelMenu3 = require("panel").Panel({
    width: 1000,
    height: 700,
    contentURL: data.url("Menu/Documentation.html"),
    contentScriptFile: [data.url("JQuery.js"), data.url("Menu/ManageDocumentation.js")],
    contentScriptWhen: "end",
    
    onMessage: function(close){
        allowHideMenu3 = true;
        panelMenu3.hide();
    },
    
    onShow: function() {
        allowHideMenu3 = false;
        panelMenu3.port.emit("version",  Version.sGetFireFixVersion() );
		panelMenu3.port.emit("softwareVersionURL",  URL.xURLElement("Get", "SoftwareVersionURL", null, "NormalMode") );
    },
    
    onHide: function(){
        if( !allowHideMenu3 ) { panelMenu3.show(); }
    }
})




/** ===============  API =============== **/

function manageMenu(nMenu, sAction){
    switch(sAction){
        case "Show":
            switch(nMenu){
                case 1: panelMenu1.show(); break;
                case 2: panelMenu2.show(); break;
                case 3: panelMenu3.show(); break;
                default: break;
            }
            break;
        case "Hide":
            switch(nMenu){
                case 1: if( !allowHideMenu1 ) { allowHideMenu1 = true; panelMenu1.hide(); } break;
                case 2: if( !allowHideMenu2 ) { allowHideMenu2 = true; panelMenu2.hide(); } break;
                case 3: if( !allowHideMenu3 ) { allowHideMenu3 = true; panelMenu3.hide(); } break;
                default: break;
            }
            break;
        default: break;
    }
}

function setMenu2CreateRequest(value, msgType){
    menu2CreateRequest = value;
    menu2MessageType = msgType;
}
