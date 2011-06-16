/**
 * Utility Class
 */

MH.Utils = {};

/**
 * Returns a hash of params from a url string
 */ 
MH.Utils.uri_params = function uri_params(uri) {
	var result = {};
    var params = (uri.split('?')[1] || '').split('&');
    for(var param in params) {
        if (params.hasOwnProperty(param)) {
            paramParts = params[param].split('=');
            result[paramParts[0]] = decodeURIComponent(paramParts[1] || "");
        }
    }
    return result;
}

MH.Utils.mergeJSON = function (json1, json2) {
	var i = 0;
	for (var z in json2) {
		if (json2.hasOwnProperty(z)) {
			json1[z] = json2[z];
		}
	} return json1;
}

MH.Utils.isJSON = function (json) {
	try {
		var j = json.toString()
		if (j.charAt(0) == '{' || j.charAt(0) == '[') {
			return true;
		}
	} catch (e) {}
	return false;
}

MH.Utils.clearImageCache = function(directory) {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, directory);
	if (file.exists()) {
		file.deleteDirectory();
	}
}

function isAndroid() {
	if (Titanium.Platform.osname == 'android') {
		return true;
	}
	return false;
}

function isIOS() {
	return (isIPad() || isIPhone());
}

function isIPad() {
	if (Titanium.Platform.osname == 'ipad') {
		return true;
	}
	return false;
}

function isIPhone() {
	if (Titanium.Platform.osname == 'iphone') {
		return true;
	}
	return false;
}