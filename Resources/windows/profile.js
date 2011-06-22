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
var w = Ti.UI.currentWindow;

(function(){ /* Profile Picture */
	var params;
	w.picture = UI.createMagicImage(JSON.merge({
		image: '/images/facebook_question.gif',
		maxHeight: 150,
		maxWidth: 110,
		top: 0,
		left: 0,
		borderWidth: 3,
		borderRadius: 5,
		borderColor: '#000'
	}, params));
	w.add(w.picture);
})();

/* Name */
w.name = Ti.UI.createLabel({
	top: 6,
	left: 60,
	height: 50,
	width: Ti.Platform.displayCaps.platformWidth-60,
	color: '#fff'
});
w.add(w.name);

/* Logout Button */
w.logout = Ti.UI.createButton({
	titleid: 'logout',
	width: 200,
	height: 100
});
w.logout.addEventListener('click', function(e){
	Ti.API.info("click");
	
	Ti.App.fireEvent('logout');
});
w.add(w.logout);

w.update = function() {
	w.person = JSON.parse(Ti.App.Properties.getString("person", "{}"));
	if (w.person) {
		if (w.person.picture) {
			w.picture.setImage(w.person.picture+"?type=large");
		}
		if (w.person.name) {
			w.name.text = w.person.name;
		}
	}
};
w.addEventListener('profile:update', w.update);
w.update();