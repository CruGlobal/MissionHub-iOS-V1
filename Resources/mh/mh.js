/*!
 * MissionHub
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: MissionHub Main
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Thu, 16 Jun 2011 12:48:32 -0400
 */

var mh = {};

(function(){
	mh.app = {};
	
	mh.app.lang = function() {
		var lang = Ti.Locale.currentLanguage;
		if (/(en)/.test(lang)) {
			return lang;
		}
		return 'en';
	};
	
	var person;
	
	mh.app.person = function() {
		if (mh.auth.oauth && mh.auth.oauth.isLoggedIn() && person) {
			return person;
		}
	};
	
	mh.app.setPerson = function(p) {
		person = p;
	};
	
})();

Ti.include('/mh/config/config.js');
Ti.include('/mh/util/util.js');
Ti.include('/mh/error/error.js');
Ti.include('/mh/api/api.js');
Ti.include('/mh/ui/ui.js');
Ti.include('/mh/auth/auth.js');