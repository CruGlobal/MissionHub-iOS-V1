/*!
 * MissionHub Contact Window
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 *  
 * Description: Window for displaying a single contant
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Mon, 20 Jun 2011 13:38:53 +0000
 */

Ti.include('/include/includes.js');

var w = Ti.UI.currentWindow;
var updating = false;

(function(){ /* Activity Indicator */
	w.indicator = null;
	if (android) {
		w.indicator = Ti.UI.createActivityIndicator({
			messageid: 'loading',
			type: 1,
			location: 0
		});
		w.add(w.indicator);
	} else {
		w.indicator = Titanium.UI.createActivityIndicator();
	    w.setRightNavButton(w.indicator);
	}
})();

(function(){ /* Alert Dialog */
	w.ad = Titanium.UI.createAlertDialog({
    	title: 'Error',
    	message: '',
    	buttonNames: ['OK']
   });
})();

(function(){ /* Profile Picture */
	if (w.person.picture) {
		var defaultImage = '/images/facebook_question.gif';
		if (w.person.gender && w.person.gender == 'female') {
			defaultImage = '/images/facebook_female.gif';
		} else {
			defaultImage = '/images/facebook_male.gif';
		}
		w.picture = UI.createMagicImage({
			image: w.person.picture+"?type=large",
			defaultImage: defaultImage,
			maxHeight: 300,
			maxWidth: 125
		});
		w.add(w.picture);
	}
})();

(function(){ /* Person's Name */
	w.name = Ti.UI.createLabel({
		color: '#fff',
		width: 300,
		height: 50,
		left: 60,
		text: w.person.name
	});
})();

w.updateUI = function() { /* Update the UI after updating the person */
	w.picture.setImage(w.person.picture+"?type=large");
	w.name.text = w.person.name;
};
w.addEventListener('updateUI', w.updateUI);

w.updatePerson = function() { /* Update Person */
	if (updating) {
		return;
	}
	updating = true;
	w.indicator.show();
	
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function(e) {
		updating = false;
		w.indicator.hide();
		var response = Net.makeValid(this.responseText);
		if (response.error || !response[0]) {
			w.ad.title = getErrorTitle(response.error);
			w.ad.message = getErrorMsg(response.error);
			w.ad.show();
		} else {
			w.person = response[0];
			Ti.API.info(w.person.picture);
			w.fireEvent('updateUI');
		}
	};
	
	xhr.onerror = function(e) {
		updating = false;
		w.indicator.hide();
		var response = Net.makeValid(this.responseText);
		if (response.error) {
			Ti.API.info(response.error);
		}
		w.ad.title = getErrorTitle(response.error);
		w.ad.message = getErrorMsg(response.error);
		w.ad.show();
	};
	
	xhr.open('GET',Settings.api_url+'/people/'+w.person.id+'.json?access_token='+Titanium.Network.encodeURIComponent(getToken()));
	Ti.API.info(Settings.api_url+'/people/'+w.person.id+'.json?access_token='+Titanium.Network.encodeURIComponent(getToken()));
	xhr.send();
};
w.addEventListener('update', w.updatePerson);

w.updatePerson();