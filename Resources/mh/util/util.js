(function(){
	
	mh.util = {};
	
	mh.util.mergeJSON = function (json1, json2) {
		for (var z in json2) {
			if (json2.hasOwnProperty(z)) {
				json1[z] = json2[z];
			}
		} return json1;
	};
	
	mh.util.validJSON = function(json) {
		try {
			var j = json.toString();
			if (j.charAt(0) == '{' || j.charAt(0) == '[') {
				return true;
			}
		} catch (e) {}
		return false;
	};
	
	mh.util.stripBadCharacters = function(value) {
		return value.toString().replace(/[^A-Za-z0-9_\.]/g,"");
	};
	
	mh.util.isArray = function(obj) {
    	return obj.constructor == Array;
	}
	
	mh.util.makeValid = function(response) {
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
	
	mh.util.uriParams = function (uri) {
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
})();

/* Globals Platform Vars */
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
