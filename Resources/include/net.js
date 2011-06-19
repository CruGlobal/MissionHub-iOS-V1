/*!
 * MissionHub Settings
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 *  
 * Description: Functions for networking and requests
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Thu, 16 Jun 2011 13:28:20 -0400
 */

var Net = {};

/**
 * Get the parameters from a url
 */
Net.uri_params = function uri_params(uri) {
	var result = {};
    var params = (uri.split('?')[1] || '').split('&');
    for(var param in params) {
        if (params.hasOwnProperty(param)) {
            var paramParts = params[param].split('=');
            result[paramParts[0]] = decodeURIComponent(paramParts[1] || "");
        }
    }
    return result;
};

Net.makeValid = function(response) {
	if (response) {
		if (JSON.valid(response)) {
			return JSON.parse(response);
		} else {
			return ({error: 'not_json'});
		}
	} else {
		return ({error: 'no_data'});
	}
};