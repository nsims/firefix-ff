/* *** Exported Functions *** */
exports.xManageDisplayMainButton = xManageDisplayMainButton;

/* *** Import Libraries *** */
var URL = require("./URLManagement");

/* *** Used APIs *** */
var data = require("self").data;
var tabs = require('tabs');
var {Cc, Ci, Cu, Cr} = require('chrome');

/* Main Variables */
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
var document = mediator.getMostRecentWindow('navigator:browser').document; // this document is an XUL document

var bEventProcessing = false;



/** ===============  MANAGE MAIN BUTTON DISPLAY =============== **/

function xManageDisplayMainButton(tab, bStartOfProcess, bEndOfProcess, xMainButtonEvent) {
    if(bStartOfProcess) {
        xManageMainButton("ProcessingIcone", xMainButtonEvent);
    } else if(bEndOfProcess || !bEventProcessing) {
        xManageMainButton("DeactivatedIcone", xMainButtonEvent);
        
        var sURL = tab.url;
        var asURL = sURL.split("/", 5);
        
        if(asURL.length > 2){
            var sDomain = asURL[2];
            var asDomain = sDomain.split(".", 3);
            var sEnablon, sSoftware;
            if(asDomain.length > 2){
				sEnablon = asDomain[1] + "." + asDomain[2];
				sSoftware = asURL[3];
            }
            
			if( (sEnablon == "enablon.com" && sSoftware.search(URL.xURLElement("Get", "SoftwareSiteId", null, "NormalMode")) == -1) || sDomain == "localhost" ) {
				var sVersionURL = URL.sGetSiteVersionURL(sURL, "Application");
				
				var Request = require("request").Request;
				var VersionPage = Request({
					url: sVersionURL,
					onComplete: function (response) {
						var sContent = response.text;
						var asContent = sContent.split("TITLE>", 2);
                        var sTitle = asContent[1];
                        
						if(asContent[1] !== undefined) {
							if(sTitle.search("Version") != -1) {
								xManageMainButton("OriginalIcone", xMainButtonEvent);
							} else if(sTitle.search("Page de connexion") != -1 || sTitle.search("Unavailable site") != -1) {
								xManageMainButton("NotLoggedIcone", xMainButtonEvent);
							} else {
								xManageMainButton("NoVersionIcone", xMainButtonEvent);
							}
						}
					}
				});
				VersionPage.get();
				
            }
		}
    }
}

function xManageMainButton(sMode, xMainButtonEvent) {

    var button = document.getElementById('reportButton');
    var sEventAction = "DeactivateEvent";
    
    switch (sMode) {
        case "OriginalIcone":
            button.setAttribute('image', data.url('img/MainIcon.png'));
            button.setAttribute('tooltiptext', 'Report bug');
            bEventProcessing = false;
            sEventAction = "ActivateEvent" ;
            break;
        case "DeactivatedIcone":
            button.setAttribute('image', data.url('img/GreyMainIcon.png'));
            button.setAttribute('tooltiptext', 'Deactivated');
            bEventProcessing = false;
            break;
        case "NoVersionIcone":
            button.setAttribute('image', data.url('img/NoVersionIcon.png'));
            button.setAttribute('tooltiptext', 'Issue with Version Page');
            bEventProcessing = false;
            break;
        case "NotLoggedIcone":
            button.setAttribute('image', data.url('img/NotLoggedIcon.png'));
            button.setAttribute('tooltiptext', 'Disconnected from Application');
            bEventProcessing = false;
            break;
        case "ProcessingIcone":
            button.setAttribute('image', data.url('img/Processing.gif'));
            button.setAttribute('tooltiptext', 'Processing Request');
            bEventProcessing = true;
            break;
        default:
            Error("Wrong Mode");
    }

    if(sEventAction == "ActivateEvent") {
        button.addEventListener('command', xMainButtonEvent, false);
    } else {
        button.removeEventListener('command', xMainButtonEvent, false);
    }
}
