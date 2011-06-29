/*!
 * MissionHub
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: MissionHub iPhone
 * Author: Matt Webb <matt.webb@cojourners.com>
 * Date: Fri, 24 Jun 2011 23:16:47 -0400
 */

(function() {
	
	mh.error = {};
	
	mh.error.VALID_RESPONSE = 2;
	mh.error.INVALID_RESPONSE = 1;
	mh.error.NO_RESPONSE = 0;
	
	mh.error.handleResponse = function(response,options) {
			debug("1");
		var validity = mh.error.validResponse(response);
		debug("validity:  " + validity);
		if (!Ti.Network.online && validity == mh.error.NO_RESPONSE) {
			debug("2");
			return mh.error.handleError('', options, 'no_network');
		} 
		else if (!Ti.Network.online && validity != mh.error.NO_RESPONSE) {
			debug("3");
			return mh.error.handleError('', options, 'no_data');
		}
		else if(Ti.Network.online && validity == mh.error.INVALID_RESPONSE) {
			debug("4");
			return mh.error.handleError('', options, 'not_json');
		}
		else if (Ti.Network.online && validity == mh.error.NO_RESPONSE){
			debug("5");
			return mh.error.handleError('', options, 'no_data');
		}
		else if (Ti.Network.online && validity == mh.error.VALID_RESPONSE) {
			var json_object = JSON.parse(response);
			if (json_object.error) {
				debug("6");
				return mh.error.handleError(json_object.error, options);
			}
			else {
				debug("7");
				return json_object;
			}
		}
	};
	
	//input a string response straight from the server
	mh.error.validResponse = function(response) {
		debug("response in validResponse: " + response);
		debug("validJSON return in validResponse: " + mh.util.validJSON(response));
		if (response) {
			if (mh.util.validJSON(response)) {
				return mh.error.VALID_RESPONSE;
			} else {
				return mh.error.INVALID_RESPONSE;
			}
		} else {
			return mh.error.NO_RESPONSE;
		}
	};
	
	//Pass in an error JSON object (has code & message attributes), a function to call when OK is hit on the error window.
	//OPTIONAL:  alt -- alternate code to look up in Locale i18n file
	mh.error.handleError = function(code, options, alt) {
		var hash = {};
		var error_code='';
		var message='Unknown Error.';
		debug("in handleError: " + JSON.stringify(code));
		debug("and the alt:  " + alt);
		
		hash.onClick = options.errorCallback;
		if (options.buttonNames) {
			hash.buttonNames = options.buttonNames;
		}
		
		if (code.code) {
			error_code = code.code;
			message = code.message;
		}
		
		if (alt) {
			hash.title = L('error_'+error_code, L('error_'+alt));
			hash.message = L('error_'+error_code+'_msg', L('error_'+alt+'_msg'));
		} else {
			hash.title =  L('error_'+error_code, L('error_unknown'));
			hash.message = L('error_'+error_code+'_msg', message);
		}
		mh.ui.alert(hash);
	};
})();
