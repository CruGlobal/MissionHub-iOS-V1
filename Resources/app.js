/**
 * MissionHub Mobile Main
 * 
 * 2011 C. Roemmich
 */

var MH = {};

Ti.include("settings.js");
Ti.include("lib/utils.js");
Ti.include("lib/oauth.js");

//TODO: Remove before production, forces user to login every time.
//Ti.App.Properties.removeProperty("access_token");

/* Create the background window */
/* Keeps the app open during login process */
var back = Ti.UI.createWindow({
	backgroundColor: '#000000',
	titleid:'app',
	exitOnClose: true,
	fullscreen: false
});

var button = Ti.UI.createButton({
	titleid:'login',
	width: '80%',
	height: '100'
});

button.addEventListener('click', function(e) {
	MH.OAuth.prepareAccessToken();
})
back.add(button);

back.open();

/* Global variable for the TabGroup */
var main;

/* Listens for events from OAuth */
Ti.App.addEventListener("access_token", function(data) {
	openMain();
});

/* Listens for events from OAuth */
Ti.App.addEventListener("close_oauth", function(data) {
	MH.OAuth.closeLoginPrompt();
});

/* Opens a modal login window if the access token is invalid or does not exist. */
MH.OAuth.prepareAccessToken();

function openMain() {
	main = Ti.UI.createTabGroup({
		backgroundColor: '#000000',
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