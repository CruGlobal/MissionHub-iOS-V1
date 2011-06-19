/*!
 * MissionHub Utilities
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Generic utility functions and helpers
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Thu, 16 Jun 2011 12:50:18 -0400
 */

/* Platform Selectors */
var android = false;
var ios = false;
var ipad = false;
var iphone = false;
if (Titanium.Platform.osname == 'android') {
	android = true;
} else if (Titanium.Platform.osname == 'ipad') {
	ipad = true;
	ios = true;
} else if (Titanium.Platform.osname == 'iphone') {
	iphone = true;
	ios = true;
}

/* Easy Log */
function info(msg) {
	Ti.API.info(msg);
}

function error(msg) {
	Ti.API.error(msg);
}

function getErrorTitle(code, alt) {
	if (alt) {
		return Ti.Locale.getString('error_'+code, Ti.Locale.getString('error_'+alt));
	} else {
		return Ti.Locale.getString('error_'+code, Ti.Locale.getString('error_unknown'));
	}
}

function getErrorMsg(code, alt) {
	if (alt) {
		return Ti.Locale.getString('error_'+code+'_msg', Ti.Locale.getString('error_'+alt+'_msg'));
	} else {
		return Ti.Locale.getString('error_'+code+'_msg', Ti.Locale.getString('error_unknown_msg'));
	}
}

function setToken(token) {
	Ti.App.Properties.setString("access_token", token);
}

function getToken() {
	return Ti.App.Properties.getString("access_token");
}
