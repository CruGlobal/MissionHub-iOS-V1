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