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
	w.indicator.show();
})();

(function(){ /* Alert Dialog */
	w.ad = Titanium.UI.createAlertDialog({
		title: 'Error',
		message: '',
		buttonNames: ['OK']
   });
})();

(function(){ /* ScrollView */
	w.sv = Ti.UI.createScrollView({
		contentWidth:'auto',
	    contentHeight:'auto',
	    top:0,
	    left: 0,
	    showVerticalScrollIndicator:true,
	    showHorizontalScrollIndicator:false,
	    scrollType: 'vertical',
	    maxZoomScale: 1,
	    minZoomScale: 1
	});
	w.add(w.sv);
})();

var pad = 6;

Ti.include('/windows/contact_head.js');
Ti.include('/windows/contact_comment.js');
Ti.include('/windows/contact_feed.js');

w.updateUI = function(e) { /* Layout UI Elements */
	w.updateHeadUI(e);
	w.updateCommentUI(e);
	w.updateFeedUI(e);
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
			Ti.API.info(w.person);
			w.fireEvent('updateUI', {action: 'person'});
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