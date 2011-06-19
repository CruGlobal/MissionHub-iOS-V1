/*!
 * MissionHub JSON Utilities
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 *  
 * Description: Additional methods for Titanium JSON class
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Thu, 16 Jun 2011 12:50:18 -0400
 */

/**
 * Merge two JSONs
 */
JSON.merge = function (json1, json2) {
	for (var z in json2) {
		if (json2.hasOwnProperty(z)) {
			json1[z] = json2[z];
		}
	} return json1;
};

/**
 * Check if a string is (somewhat) valid JSON
 */
JSON.valid = function(json) {
	try {
		var j = json.toString();
		if (j.charAt(0) == '{' || j.charAt(0) == '[') {
			return true;
		}
	} catch (e) {}
	return false;
};