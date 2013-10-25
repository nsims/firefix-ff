/* *** Exported Functions *** */
exports.xURLElement = xURLElement;
exports.sGetSiteVersionURL = sGetSiteVersionURL;

/* *** Used APIs *** */
var ss = require("simple-storage");

/* *** General Variables *** */
// WARNING : Don't forget to fill the function 'xURLElement' when adding a constant
var sGoAsp = "go.asp";
var sGoAspU = "go.asp?u=";
var sGoAspx = "go.aspx";
var sGoAspxU = "go.aspx?u=";

var sAdm = "adm";
var sLocalHost = "localhost";
var sVer = "ver";

var sServerURL, sSoftwareSiteId;
if(ss.storage.ServerURL === undefined || ss.storage.ServerURL === "") { sServerURL = "https://software.enablon.com"; } else { sServerURL = ss.storage.ServerURL; }
if(ss.storage.SoftwareSiteId === undefined || ss.storage.SoftwareSiteId === "") { sSoftwareSiteId = "Software"; } else { sSoftwareSiteId = ss.storage.SoftwareSiteId; }

var sSoftwareURL = sServerURL + "/" + sSoftwareSiteId + "/";
var sSoftwareDataURL = sSoftwareURL + sGoAspU + "/Referent/FFRq";
var sSoftwareVersionURL = sSoftwareURL + sGoAspU +  "/Referent/FFix";
var sSoftwareRequestURL = sSoftwareURL + sGoAspU + "/Referent/Rqtes";

var sLoginURL = sServerURL + "/enablon/go.asp?OStId=" + sSoftwareSiteId;

var sAjaxReq = "&pm=9";
var sAddReq = "&tm=1";
var sFireFixParam = "&FireFix=true";

var sCurrentURL; //Updated when the add_on's icone is clicked


/** ===============  API =============== **/

function xURLElement(sMode, sConstant, sValue, xSocleMode){
    
    var sResult;
    
    switch(sMode){
        case "Get":
            switch(sConstant){
                case "GoAsp": sResult = sGoAsp; break;
                case "GoAspU": sResult = sGoAspU; break;
                case "GoAspx": sResult = sGoAspx; break;
                case "GoAspxU": sResult = sGoAspxU; break;
                
                case "Adm": sResult = sAdm; break;
                case "LocalHost": sResult = sLocalHost; break;
                case "Ver": sResult = sVer; break;
                
                case "ServerURL": sResult = sServerURL; break;
                case "SoftwareSiteId": sResult = sSoftwareSiteId; break;
                
                case "SoftwareURL": sResult = sSoftwareURL; break;
                case "SoftwareDataURL": sResult = sSoftwareDataURL; break;
                case "SoftwareVersionURL": sResult = sSoftwareVersionURL; break;
                case "SoftwareRequestURL": sResult = sSoftwareRequestURL; break;
                
                case "LoginURL": sResult = sLoginURL; break;
                
                case "AjaxReq": sResult = sAjaxReq; break;
                case "AddReq": sResult = sAddReq; break;
                case "FireFixParam": sResult = sFireFixParam; break;
                
                case "CurrentURL": sResult = sCurrentURL; break;
                
                default: Error("ERROR : Constant '" + sConstant + "' is undefined");
            }
            break;
            
        case "Set":
            switch(sConstant){
                case "ServerURL": sServerURL = sValue; break;
                case "SoftwareSiteId": sSoftwareSiteId = sValue; break;
                
                case "CurrentURL": sCurrentURL = sValue; break;
                
                default: Error("ERROR : Constant '" + sConstant + "' cannot be modified or is undefined");
            }
            if(sConstant == "ServerURL" || sConstant == "SoftwareSiteId"){
                sSoftwareURL = sServerURL + "/" + sSoftwareSiteId + "/";
                sSoftwareDataURL = sSoftwareURL + sGoAspU + "/Referent/FFRq";
                sSoftwareVersionURL = sSoftwareURL + sGoAspU +  "/Referent/FFix";
                sSoftwareRequestURL = sSoftwareURL + sGoAspU + "/Referent/Rqtes";
                sLoginURL = sServerURL + "/enablon/go.asp?OStId=" + sSoftwareSiteId;
            }
            break;
            
        default: Error("ERROR : sMode invalid : " + sMode);
    }
    
    if(sMode == "Get") { sResult = xApplySocleMode(sResult, xSocleMode); }
    return sResult;
}



function sGetSiteVersionURL(sURL, sMode, xSocleMode){
    
    var sResult;
    var sXGoAspU;
    if(sURL.substr(0,4) != "http") sURL = xURLElement("Get", sURL, null);
    if(sURL.search(sGoAspx) == -1) { sXGoAspU = sGoAspU; } else { sXGoAspU = sGoAspxU; }
    
	switch(sMode){
		case "Socle":
			var asURL = sURL.split(sGoAsp, 1);
			sResult = asURL[0] + sXGoAspU + sVer;
			break;
            
		case "Application":
			var nMax = 7;
			var asURL = sURL.split("/", nMax);
			var asURLLength = asURL.length;
			
			//Check for localhost
			if(asURL[2] == sLocalHost){
				if(asURLLength == nMax){ asURL.pop(); asURLLength--;}
				nMax--;
			}
            
            //Retrieve Application
            var sApp;
            if(asURLLength == nMax) {
            
                //Check for adm
                if(typeof asURL[nMax - 1] !== "undefined"){
                    var sCheckAdm = asURL[nMax - 1].toLowerCase();
                    if(sCheckAdm != sAdm) { sApp = asURL[nMax - 1] }
                }
                //If adm was found
                if( !sApp ){
                    asURL.pop(); //Remove adm from the array
                    
                    //Look for the App in the URL parameters "&bs=XX"
                    var asAdmURL = sURL.split("/", nMax + 1);
                    var asAdmParameters = asAdmURL[nMax].split("&");
                    for(var i=0; i < asAdmParameters.length; i++){
                        if(asAdmParameters[i].search("bs") != -1){
                            var asApp = asAdmParameters[i].split("=");
                            asURL.push(asApp[1]); //Add the App to the URL if found
                        }
                    }
                }
            }
            
            //Fill array with go.asp?u=
            asURL[nMax - 2] = sXGoAspU;
            
            //Fill array with ver
            asURL.push(sVer);
			sResult =  asURL.join("/");
			break;
            
		default:
			Error("ERROR : Mode undefined");
	}
	
    return xApplySocleMode(sResult, xSocleMode);
}



/** ===============  TOOLS =============== **/

//Default Mode is an Ajax request (&pm=9)
function xApplySocleMode (sURL, xSocleMode){

    var sSocleMode;
    
    if (xSocleMode == "NormalMode"){
        sSocleMode = "";
    } else if (xSocleMode == "AddMode"){
        sSocleMode = sAddReq;
    } else {
        sSocleMode = sAjaxReq;
    }
    
    return sURL + sSocleMode;
}
