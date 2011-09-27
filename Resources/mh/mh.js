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
	var organizations = {};
	var organizationID = -1;
	var primaryOrganizationID = -1;
	var roles = {};
	
	mh.app.getPerson = function() {
		if (mh.auth.oauth && mh.auth.oauth.isLoggedIn() && person) {
			return person;
		}
	};
	
	mh.app.setPerson = function(p) {
		person = p;
		initOrgsRoles();
	};
	
	mh.app.getOrganizations = function() {
		return organizations;
	};
	
	mh.app.getOrganizationID = function() {
		if (organizationID > -1) {
			return organizationID;
		} else {
			return Ti.App.Properties.getInt('orgid', mh.app.getPrimaryOrganizationID());
		}
	};
	
	mh.app.setOrganizationID = function(orgID) {
		if (organizations[orgID]) {
			organizationID = orgID;
			Ti.App.Properties.setInt('orgid', orgID);
		}
	};
	
	mh.app.getPrimaryOrganizationID = function() {
		return primaryOrganizationID;
	};
	
	mh.app.setPrimaryOrganizationID = function(orgID) {
		if (organizations[orgID]) {
			primaryOrganizationID = orgID;
		}
	};
	
	mh.app.getRoles = function() {
		return roles;
	};
	
	mh.app.getOrganizationRoles = function(orgID) {
		if (orgID) {
			return roles[orgID];
		} else {
			return roles[mh.app.getOrganizationID()];
		}
	};
	
	mh.app.hasMembership = function(orgID) {
		if (organizations[orgID]) {
			return true;
		}
		return false;
	};
	
	mh.app.hasRole = function(role, orgID) {
		if (!orgID) { orgID = mh.app.getOrganizationID(); }
		try {
			var orgRoles = roles[orgID];
			if (orgRoles.indexOf(role) > -1) {
				return true;
			}
		} catch (e) {}
		return false;
	};
	
	function initOrgsRoles() {
		organizations = {};
		roles = {};
		primaryOrganizationID = -1;
		
		for (var index in person.organizational_roles) {
			var role = person.organizational_roles[index];
			if (!organizations[role.org_id]) {
				organizations[role.org_id] = {name: role.name, org_id: role.org_id};
			}
			if (role.primary === true || mh.app.getPrimaryOrganizationID() < 0) {
				if (role.role == "leader" || role.role == "admin") {
					mh.app.setPrimaryOrganizationID(role.org_id);
				}
			}
			if (!roles[role.org_id]) {
				roles[role.org_id] = [];
			}
			roles[role.org_id].push(role.role);
		}
		
		if (organizationID > 0) {
			if (!organizations[organizationID]) {
				organizationID = -1;
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