/* General variables */
var sErrorMessage;

/* Check for an error message on the page*/
sErrorMessage = $('.MsgError').text();

/* Check for an error message in an error pop-up*/
if(!sErrorMessage) { sErrorMessage = $('.GPPER').text(); }

/* Send the Result */
self.postMessage(sErrorMessage);