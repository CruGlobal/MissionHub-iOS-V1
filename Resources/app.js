/**
 * MissionHub Mobile Main
 * 
 * 2011 C. Roemmich
 */

Ti.include("settings.js");
Ti.include("utils.js");
Ti.include("oauth.js");

//TODO: Remove before production, forces user to login every time.
Ti.App.Properties.removeProperty("access_token");

/* Create the background window */
/* Keeps the app open during login process */
var back = Ti.UI.createWindow({
	backgroundColor: '#000000',
	titleid:'app',
	exitOnClose: true,
	fullscreen: false
});
back.open();

/* Global variable for the TabGroup */
var main;

/* Listens for events from OAuth */
Ti.App.addEventListener("access_token", function(data) {
	openMain();
});

/* Opens a modal login window if the access token is invalid or does not exist. */
OAuth.prepareAccessToken();

function openMain() {
	main = Ti.UI.createTabGroup({
		exitOnClose: true
	});
	var win_tab_contacts = Titanium.UI.createWindow({
	    url:'windows/contacts.js',
	    titleid:'win_title_contacts'
	});
	var tab_contacts = Titanium.UI.createTab({
	    titleid:'controls_title_contacts',
	    window:win_tab_contacts
	});
	main.addTab(tab_contacts);	
	main.open();
}

if (Titanium.Platform.osname == 'android') {
	var tab_activity = Ti.Android.currentActivity;
	  ['create', 'destroy', 'pause', 'resume', 'start','stop'].forEach( function (e) {
	    tab_activity.addEventListener(e, function () {
	      Ti.API.info((new Date()) +" Tab Activity: " + e + " HIT!");
	    })
	  });
}