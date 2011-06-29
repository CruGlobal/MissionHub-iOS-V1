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
	};
	
	mh.util.makeValid = function(response) {
		if (response) {
			if (mh.util.validJSON(response)) {
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
	
	mh.util.pad = function pad(string, pad, length){
		string = string.toString();
		pad = pad.toString();
		while(string.length<length){
			string = pad + string;
		}
		return string;
	};
	
	mh.util.formatedNow = function () {
		var date = new Date();
		var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
		if (date.getHours()>=12) {
			datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+mh.util.pad(date.getMinutes(), 0, 2)+' PM';
		} else {
			datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
		}
		return datestr;
	};
	
	mh.util.dateFromString = function(utcString) {
		var r = /^\s*(\d{4})-(\d\d)-(\d\d)\s+(\d\d):(\d\d):(\d\d)\s+UTC\s*$/;
		var m = (""+utcString).match(r);
		var now = new Date();
		var utc = Date.UTC(m[1], m[2]-1, m[3], m[4], m[5], m[6]) - now.getTimezoneOffset();
		return (m) ? new Date(utc) : undefined;
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
function debug(msg) {
	Ti.API.debug(msg);
}

function info(msg) {
	Ti.API.info(msg);
}

function error(msg) {
	Ti.API.error(msg);
}
