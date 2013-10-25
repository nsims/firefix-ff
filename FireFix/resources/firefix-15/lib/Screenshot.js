/* *** Exported Functions *** */
exports.capture = capture;

/* *** Import Libraries *** */
var URL = require("./URLManagement");

/* *** Used APIs *** */
var tabs = require("tabs");
var {Cc, Ci, Cu, Cr} = require('chrome');
var fileRequire = require('file');
var ss = require("simple-storage");
var data = require("self").data;

/* *** General Variables *** */
var sFileFieldPosition = "0";
var sDefaultFileName = "FireFix-ScreenShot.png";



/** ===============  TAKE A SCREENSHOT =============== **/

function capture(tab, window) {

    var document = window.document;
    var html = document.documentElement;
    var w, h, x, y;
    
    x = y = 0;
    w = html.scrollWidth;
    h = html.scrollHeight;
    
    var canvas = document.createElement('canvas');
	canvas.width = w; 
	canvas.height = h; // need refinement
	canvas.style.display = 'none';
	document.body.appendChild(canvas);
	
	var ctx = canvas.getContext("2d");
    
    ctx.drawWindow(window, x, y, w, h, 'rgb(255, 255, 255)');
    
	saveCanvas(canvas, tab);
    
}



/** ===============  UPLOAD THE SCREENSHOT ON SOFTWARE =============== **/

function saveCanvas(canvas, tab){

	var directoryService = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
	var FilePathFileObject = directoryService.get("ProfD", Ci.nsIFile);
		FilePathFileObject.append("extensions");
		FilePathFileObject.append(sDefaultFileName);
	var FilePath = FilePathFileObject.path;

    var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
    var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(FilePath);
    var downloadCompleted = false;

    var fURI = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(canvas.toDataURL("image/png", ""), "UTF8", null);

    const nsIWBP = Ci.nsIWebBrowserPersist;
    const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
    persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_FROM_CACHE;
    
    persist.progressListener = {
        onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
                    
        },
        onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
              if (aStateFlags & Ci.nsIWebProgressListener.STATE_STOP) {
                 downloadCompleted = true; // file has been downloaded        
              }
        }
    }
    persist.saveURI(fURI, null, null, null, "", file, null);  

    var thread = Cc["@mozilla.org/thread-manager;1"]
                        .getService(Ci.nsIThreadManager)
                        .currentThread;
    while (!downloadCompleted) // emulate synchronous request, not recommended approach
        thread.processNextEvent(true);
    
    var imageFile=fileRequire.read(FilePath, "b");
	
    var sFileName = ss.storage.SCFileName;
    if(sFileName === "" || sFileName === null){
        sFileName = sDefaultFileName;        
    }
    
    tab.attach({
        contentScript:
            "function showFile(){" +
                "document.getElementsByName('fld_XFichier')[0].value = '" + sFileName + "';" +
                "document.getElementsByName('fld_XFichier_tmp')[0].value = '" + sFileName + "';" +
                "unsafeWindow.RefreshForm();" +
            "}" +
            "if(document.getElementsByName('fld_XFichier')[0] != null){ window.onload=showFile(); }"
        
    });
	
    retrieveFileFieldPosition(imageFile, sFileName);
    file.remove(false);
}


function retrieveFileFieldPosition(imageFile, sFileName){

    var FileFieldPos = require("page-worker");
    var sUrl = URL.xURLElement("Get", "SoftwareDataURL") + "&Process=nGetFileFieldPosition"
    FileFieldPos.Page({
        contentURL: sUrl,
        contentScriptFile: [data.url("JQuery.js"), data.url("Screenshot/GetFileFieldPosition.js")],
        contentScriptWhen: "ready",
        onMessage: function(sPosition) {    
            // Update the File Field Position
            if( sPosition !== null) { sFileFieldPosition = sPosition; }
            
            sendImage(imageFile, sFileName);
        }
    });
    //Destroy the previously created page worker to release the used memory
    //FileFieldPos.destroy();
    return null;
}


function sendImage(file, sFileName){

    // prepare the MIME POST data
    var boundaryString = '---------------------------132611019532525';
    var boundary = '--' + boundaryString;
    var requestbody = boundary + '\r\n'
            + 'Content-Disposition: form-data; name="Upload_FileName"; filename="'
            + sFileName + '"' + '\r\n'
            + 'Content-Type: image/png' + '\r\n'
            + '\r\n'
            + file
            + '\r\n'
            + boundary + '--\r\n';
            
    // Send
    var http_request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	
	var sSoftwareRequestURL = URL.xURLElement("Get", "SoftwareRequestURL");
	var sHTTPRequestURL = sSoftwareRequestURL + "&pp_FieldNo=" + sFileFieldPosition + "&pp_CurMode=1&pp_fieldId=XFichier&pp_frmfldid=fld_XFichier&pp_Name=Files&upl_Mode=1&RecId=-1";
	
    http_request.open('POST', sHTTPRequestURL + "&tm=4&fno=%201&upl_Field=" + sFileFieldPosition + "&upl_State=1&formfld=fld_XFichier", true);
    http_request.setRequestHeader("Referer", sHTTPRequestURL + "&tm=37&fno=1&pp_mfmode=2&skiplist=0");                  
    http_request.setRequestHeader("Content-type", "multipart/form-data; boundary=" + boundaryString);
    //http_request.setRequestHeader("Connection", "close");
    http_request.setRequestHeader("Content-length", requestbody.length);
    http_request.sendAsBinary(requestbody);    
}