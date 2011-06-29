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
	
	var person, orgID;
	var roles = {};
	
	mh.app.ROLE_NONE = -1;
	mh.app.ROLE_ADMIN = 0;
	mh.app.ROLE_LEADER = 1;
	mh.app.ROLE_CONTACT = 2;
	
	mh.app.person = function() {
		if (mh.auth.oauth && mh.auth.oauth.isLoggedIn() && person) {
			return person;
		}
	};
	
	mh.app.getRoles = function() {
		return roles;
	};
	
	mh.app.setPerson = function(p) {
		person = p;
		calculateRoles();
	};
	
	mh.app.orgID = function() {
		if (mh.auth.oauth && mh.auth.oauth.isLoggedIn() && person) {
			return orgID;
		}
	};
	
	mh.app.setOrgID = function(o) {
		orgID = o;
		calculateRoles();
	};
	
	function calculateRoles() {
		roles = {};
		for (var index in person.organization_membership) {
			var org_membership = person.organization_membership[index];
			roles[org_membership.org_id] = {name: org_membership.name};
			if (org_membership.primary === true) {
				orgID = org_membership.org_id;
				roles[org_membership.org_id].primary = true;
			} else {
				roles[org_membership.org_id].primary = false;
			}
			roles[org_membership.org_id].role = mh.app.ROLE_NONE;
		}
		for (var index in person.organizational_roles) {
			var role = person.organizational_roles[index];
			if (role.role == 'admin') {
				roles[role.org_id].role = mh.app.ROLE_ADMIN;
			} else if (role.role == 'leader') {
				roles[role.org_id].role = mh.app.ROLE_LEADER;
			} else if (role.role == 'contact') {
				roles[role.org_id].role = mh.app.ROLE_CONTACT;
			} else {
				roles[role.org_id].role = mh.app.ROLE_NONE;
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