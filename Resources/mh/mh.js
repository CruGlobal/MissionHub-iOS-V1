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
	
	var person, orgID, role;
	
	mh.app.ROLE_ADMIN = 0;
	mh.app.ROLE_LEADER = 1;
	
	mh.app.getPerson = function() {
		if (mh.auth.oauth && mh.auth.oauth.isLoggedIn() && person) {
			return person;
		}
	};
	
	mh.app.getRole = function() {
		return role;
	};
	
	mh.app.setPerson = function(p) {
		person = p;
		calculateRole();
	};
	
	mh.app.orgID = function() {
		if (mh.auth.oauth && mh.auth.oauth.isLoggedIn() && person) {
			return orgID;
		}
	};
	
	mh.app.setOrgID = function(o) {
		orgID = o;
		calculateRole();
	};
	
	function calculateRole() {
		for (var index in person.organization_membership) {
			var org = person.organization_membership[index];
			if (orgID) {
				if (org.org_id == orgID) {
					if (org.role == 'admin') {
						role = mh.app.ROLE_ADMIN;
					} else if (org.role == 'leader') {
						role = mh.app.ROLE_LEADER;
					}
				}
			} else {
				if (org.primary === true) {
					if (org.role == 'admin') {
						role = mh.app.ROLE_ADMIN;
					} else if (org.role == 'leader') {
						role = mh.app.ROLE_LEADER;
					}
				}
			}
		}
	}
	
})();

Ti.include('/mh/config/config.js');
Ti.include('/mh/util/util.js');
Ti.include('/mh/error/error.js');
Ti.include('/mh/api/api.js');
Ti.include('/mh/ui/ui.js');
Ti.include('/mh/auth/auth.js');