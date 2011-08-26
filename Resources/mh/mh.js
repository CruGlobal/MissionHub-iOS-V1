/*!
 * MissionHub
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: MissionHub Main Application
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
	var roles = {};
	var privledgedRoles = {};
	
	mh.app.ROLE_NONE = -1;
	mh.app.ROLE_ADMIN = 1;
	mh.app.ROLE_LEADER = 4;
	mh.app.ROLE_CONTACT = 2;
	
	mh.app.getPerson = function() {
		if (mh.auth.oauth && mh.auth.oauth.isLoggedIn() && person) {
			return person;
		}
	};
	
	mh.app.getRoles = function() {
		return roles;
	};
	
	mh.app.getRole = function(org) {
		if (org && roles.length > 0) {
			return roles[org].role;
		} else {
			return roles[Ti.App.Properties.getInt('orgid', 0)].role;
		}
	};
	
	mh.app.setPerson = function(p) {
		person = p;
		calculateRoles();
	};
	
	mh.app.orgID = function() {
		if (mh.auth.oauth && mh.auth.oauth.isLoggedIn() && person) {
			var roleid = Ti.App.Properties.getInt('orgid', -1);
			info('stored role id: ' + roleid);
			if (roleid >= 0 && privledgedRoles[roleid]) {
				return roleid;
			} else if (roles.length > 0 && privledgedRoles[0]) {
				return roles[0].org_id;
			} else {
				return;
			}
		}
	};
	
	mh.app.setOrgID = function(o) {
		info('set stored role id = ' + o);
		Ti.App.Properties.setInt('orgid', o);
	};
	
	function calculateRoles() {
		roles = {};
		var primaryOrg = -1;
		for (var index in person.organization_membership) {
			var org_membership = person.organization_membership[index];
			roles[org_membership.org_id] = {name: org_membership.name};
			if (org_membership.primary == 'true' || org_membership.primary === 'true') {
				primaryOrg = org_membership.org_id;
				roles[org_membership.org_id].primary = true;
			} else {
				roles[org_membership.org_id].primary = false;
			}
			roles[org_membership.org_id].role = mh.app.ROLE_NONE;
			roles[org_membership.org_id].org_id = org_membership.org_id;
		}
		
		for (var index in person.organizational_roles) {
			var role = person.organizational_roles[index];
			if (roles[role.org_id] == null) {
				continue;
			}
			if (role.role == 'admin') {
				roles[role.org_id].role = mh.app.ROLE_ADMIN;
				privledgedRoles[role.org_id] = true;
			} else if (role.role == 'leader') {
				privledgedRoles[role.org_id] = true;
				roles[role.org_id].role = mh.app.ROLE_LEADER;
			} else if (role.role == 'contact') {
				roles[role.org_id].role = mh.app.ROLE_CONTACT;
			} else {
				roles[role.org_id].role = mh.app.ROLE_NONE;
			}
		}
		
		if (Ti.App.Properties.getInt('orgid', -1) < 0) {
			Ti.App.Properties.setInt('orgid', primaryOrg);
		}
	}
	
})();

Ti.include('/mh/config/config.js');
Ti.include('/mh/util/util.js');
Ti.include('/mh/error/error.js');
Ti.include('/mh/api/api.js');
Ti.include('/mh/ui/ui.js');
Ti.include('/mh/auth/auth.js');