/*!
 * MissionHub Person Profile
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Window to display profile of logged in person
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Sun, 19 Jun 2011 12:10:41 -0400
 */

Ti.include('/include/includes.js');
var win = Ti.UI.currentWindow;

/* Profile Picture */
win.picture = Ti.UI.createView({
	backgroundImage: '/images/default_contact.jpg',
	top: 0,
	left: 0,
	width: 50,
	height: 50
});
win.add(win.picture);

/* Name */
win.name = Ti.UI.createLabel({
	top: 6,
	left: 60,
	height: 50,
	width: Ti.Platform.displayCaps.platformWidth-60,
	color: '#fff'
});
win.add(win.name);

/* Logout Button */
win.logout = Ti.UI.createButton({
	titleid: 'logout',
	width: 200,
	height: 100
});
win.logout.addEventListener('click', function(e){
	Ti.API.info("click");
	
	Ti.App.fireEvent('logout');
});
win.add(win.logout);

win.update = function() {
	win.person = JSON.parse(Ti.App.Properties.getString("person", "{}"));
	if (win.person) {
		if (win.person.picture && win.person.id) {
			UI.createCachedFBImageView('imgcache_profile', win.person.picture+"?type=square", win.picture, win.person.id);
		}
		
		if (win.person.name) {
			win.name.text = win.person.name;
		}
	}
};
win.addEventListener('update', win.update);
win.update();