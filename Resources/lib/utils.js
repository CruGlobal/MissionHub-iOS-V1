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