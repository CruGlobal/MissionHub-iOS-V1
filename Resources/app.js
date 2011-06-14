/**
 * MissionHub Mobile Main
 * 
 * 2011 C. Roemmich
 */

var MH = {};

Ti.include("settings.js");
Ti.include("lib/utils.js");
Ti.include("lib/ui.js");
Ti.include("lib/oauth.js");

//TODO: Remove before production, forces user to login every time.
//Ti.App.Properties.removeProperty("access_token");

MH.UI.initGUI();

/* Listens for events from OAuth */
Ti.App.addEventListener("access_token", function(data) {
	MH.UI.openMain();
});

/* Listens for events from OAuth */
Ti.App.addEventListener("close_oauth", function(data) {
	MH.OAuth.closeLoginPrompt();
});

/* Opens a modal login window if the access token is invalid or does not exist. */
MH.OAuth.prepareAccessToken();

if (Titanium.Platform.osname == 'android') {
	var tab_activity = Ti.Android.currentActivity;
	  ['create', 'destroy', 'pause', 'resume', 'start','stop'].forEach( function (e) {
	    tab_activity.addEventListener(e, function () {
	      Ti.API.info((new Date()) +" Tab Activity: " + e + " HIT!");
	    })
	  });
}