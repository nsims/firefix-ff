/* *** Exported Functions *** */
exports.sGetFireFixVersion = sGetFireFixVersion;

/* *** Import Libraries *** */
var URL = require("./URLManagement");

/* *** Used APIs *** */
var data = require("self").data;
var ss = require("simple-storage");

/* *** Global Variables *** */
var sFireFixVersion = "1.5";



/** ===============  GET FIREFIX VERSION =============== **/

function sGetFireFixVersion(){
    return sFireFixVersion;
}



/** ===============  CHECK FIREFIX VERSION =============== **/

/* === Login === */
var Request = require("request").Request;
var login = Request({
    url: URL.xURLElement("Get", "LoginURL"),
    content : {sid : "enablon", uid : ss.storage.SWLogin, pwd : ss.storage.SWPassword, LogIn : "Log%20In"},
    onComplete : function (response) {
	
		/* === Check FireFix Version === */
		var PageWorker = require("page-worker");
		var FFVersion = PageWorker.Page({
			contentURL: URL.xURLElement("Get", "SoftwareVersionURL"),
			contentScriptFile: [data.url("JQuery.js"), data.url("FireFixVersion/GetFireFixVersion.js")],
			contentScriptWhen: "ready",
			onMessage: function(oNewVersion) {
				if(oNewVersion) {
                    var nNewBuild = parseFloat(oNewVersion.sBuild);
					if("" + nNewBuild != "NaN") {
                        if(nNewBuild > parseFloat(sFireFixVersion)) {
    						var FFUpdate = require("panel").Panel({
    							width: 550,
    							height: Math.min(150 + oNewVersion.nChangelogSize, 500),
    							contentURL: data.url("FireFixVersion/LinkToNewVersion.html"),
    							contentScriptFile: [data.url("JQuery.js"), data.url("FireFixVersion/LinkToNewVersion.js")],
    							contentScriptWhen: "ready",
    							onMessage: function(close){
    								FFUpdate.hide();
    							},
    							onShow: function() {
    								FFUpdate.port.emit("oNewVersion", oNewVersion);
    	                            FFUpdate.port.emit("softwareVersionURL",  URL.xURLElement("Get", "SoftwareVersionURL", null, "NormalMode") );
    							},
    							onHide: function(){
    								FFUpdate.destroy();
    							}
    						});
    						FFUpdate.show();
					    }
					}
				}
			}
		});
		//Destroy the previously created page worker to release the used memory
		FFVersion.port.on("destroy", function(destroy){
			if(destroy) { FFVersion.destroy();}
		})
		
	}
});
login.post();