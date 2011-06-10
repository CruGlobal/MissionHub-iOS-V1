/**
 * Utility Class
 */

function Utils()
{
}

/**
 * Returns a hash of params from a url string
 */ 
Utils.uri_params = function uri_params(uri) {
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