/* *** Exported Functions *** */
exports.addToolbarButton = addToolbarButton;
exports.removeToolbarButton = removeToolbarButton;


/* *** Import Libraries *** */
var Panels = require("./Panels");

/* *** Used APIs *** */
var data = require("self").data;
var {Cc, Ci, Cu, Cr} = require('chrome');

/* *** General Variables *** */
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
var document = mediator.getMostRecentWindow('navigator:browser').document; // this document is an XUL document



/** ===============  CREATE THE BUTTON =============== **/

function addToolbarButton() {
    var navBar = document.getElementById('nav-bar');
    if (!navBar) {
        return;
    };
    
    //Main Button
    var btn = document.createElement('toolbarbutton');    
        btn.setAttribute('id', 'reportButton'); //id de l'element
        btn.setAttribute('tooltiptext', 'Report bug'); // text on hover
        btn.setAttribute('type', 'menu-button');  //menu-button permet d'afficher la petite fleche pour le menu
    	btn.setAttribute('class', 'toolbarbutton-1'); //permet d'encadrer le bouton
        btn.setAttribute('image', data.url('img/GreyMainIcon.png'));
    	btn.setAttribute('orient', 'horizontal');
    	btn.setAttribute('label', 'Report');
    
    
    //menu popup
    var menupopup = document.createElement('menupopup');
        menupopup.setAttribute('id', 'menupopup');
        
    
    //menu items
    var menuitem1 = document.createElement('menuitem');
        menuitem1.setAttribute('id', 'menuitem1');
        menuitem1.setAttribute('label', 'Default Values');
        menuitem1.setAttribute('class', 'menuitem-iconic');
        menuitem1.addEventListener('command', function(event) {
            Panels.manageMenu(2, "Hide");
            Panels.manageMenu(3, "Hide");
            Panels.manageMenu(1, "Show");
            event.stopPropagation();
        }
        , false);
    
    var menuitem2 = document.createElement('menuitem');  
        menuitem2.setAttribute('id', 'menuitem2');
        menuitem2.setAttribute('label', 'Configuration');
        menuitem2.addEventListener('command', function(event) {
            Panels.manageMenu(1, "Hide");
            Panels.manageMenu(3, "Hide");
            Panels.manageMenu(2, "Show");
            event.stopPropagation();
        }
        , false);
    
    var menuitem3 = document.createElement('menuitem');  
        menuitem3.setAttribute('id', 'menuitem3');
        menuitem3.setAttribute('label', 'Documentation');
        menuitem3.addEventListener('command', function(event) {
            Panels.manageMenu(1, "Hide");
            Panels.manageMenu(2, "Hide");
            Panels.manageMenu(3, "Show");
            event.stopPropagation();
        }
        , false);
    
    //construction des dépendances
    menupopup.appendChild(menuitem1);
    menupopup.appendChild(menuitem2);
    menupopup.appendChild(menuitem3);
	btn.appendChild(menupopup);
    navBar.appendChild(btn);
    
}



/** ===============  SUPRESS THE BUTTON =============== **/

function removeToolbarButton() {	
	var navBar = document.getElementById('nav-bar');
	var btn = document.getElementById('reportButton');
	if (navBar && btn) {
		navBar.removeChild(btn);
	}
}
