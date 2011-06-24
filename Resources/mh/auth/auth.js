(function(){
	
	mh.auth = {};
	
	mh.auth.attachLogin = function(buttonClick, callback) {
		mh.auth.oauth.attachLogin(buttonClick, callback);	
	};
	
	mh.auth.wvUrl = mh.config.oauth_url + "/authorize?display=touch&simple=true&response_type=code&redirect_uri=" + mh.config.oauth_url + "/done.json&client_id=" + mh.config.oauth_client_id + "&scope=" + mh.config.oauth_scope;
	
	var OAuth = function(loginWindow) {
		
		var property = 'access_token';
		
		var token; // set per session after successful auth or token check
		
		var getToken = function() {
			return token;
		};
		
		var getStoredToken = function() {
			return Ti.App.Properties.getString(property);
		};
		
		var setToken = function(t) {
			token = t;
			Ti.App.Properties.setString(property, t);
		};
		
		var logout = function(callback) {
			//TODO Nuke Cache
			token = null;
			Ti.App.Properties.removeProperty(property);
			callback();
		};
		
		var isLoggedIn = function() {
			if (token) {
				return true;
			} else {
				return false;
			}
		};
		
		var checkToken = function(onLoadCallback, onErrorCallback) {
			debug('running mh.auth.oauth.checkToken');
			if (!getStoredToken()) {
				debug('stopping mh.auth.oauth.checkToken: no stored token');
				return false;
			}
			
			var xhr = Ti.Network.createHTTPClient();
			
			xhr.onload = function(e) {
				onLoadCallback({
					location: this.location,
					response: this.responseText,
					token: getStoredToken()
				});
			};
			
			xhr.onerror = function(e) {
				onErrorCallback({
					location: this.location,
					response: this.responseText,
					token: getStoredToken()
				});
			};
			
			xhr.open('GET', mh.config.api_url+'/people/me.json?access_token='+Titanium.Network.encodeURIComponent(getStoredToken()));
			info(mh.config.api_url+'/people/me.json?access_token='+Titanium.Network.encodeURIComponent(getStoredToken()));
			xhr.send();
			
			return true;
		};
		
		var getTokenFromCode = function(code, onLoadCallback, onErrorCallback) {
			debug('running mh.auth.oauth.getTokenFromCode with code: ' + code);
			
			var xhr = Ti.Network.createHTTPClient();
			
			xhr.onload = function(e) {
				onLoadCallback({
					location: this.location,
					response: this.responseText
				});
			};
			
			xhr.onerror = function(e) {
				onErrorCallback({
					location: this.location,
					response: this.responseText
				});
			};
			
			xhr.open('POST',mh.config.oauth_url+'/access_token');
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send({
				client_id:mh.config.oauth_client_id,
				client_secret:mh.config.oauth_client_secret,
				code:code,
				grant_type:'authorization_code',
				scope: mh.config.oauth_scope,
				redirect_uri:mh.config.oauth_url+'/done.json'
			});
		};
		
		var grantAccess = function(authorization, onLoadCallback, onErrorCallback) {
			debug('running mh.auth.oauth.grantAccess with authorization: ' + authorization);
			var xhr = Ti.Network.createHTTPClient();
			
			xhr.onload = function(e) {
				onLoadCallback({
					location: this.location,
					response: this.responseText
				});
			};
			
			xhr.onerror = function(e) {
				onErrorCallback({
					location: this.location,
					response: this.responseText
				});
			};
			
			xhr.open('GET',mh.config.oauth_url+'/grant.json?authorization='+Titanium.Network.encodeURIComponent(authorization));
			if (android) {
				var db = Ti.Database.open('webview.db');
				var cookieRS = db.execute('SELECT name,value,domain FROM cookies');			
				
				var name, value, domain;
				while (cookieRS.isValidRow()) {
					name = cookieRS.fieldByName('name');
					value = cookieRS.fieldByName('value');
					domain = cookieRS.fieldByName('domain');
					cookieRS.next();
				}
				cookieRS.close();
				db.close();
				if (name && value && domain) {
					Ti.API.info(name + "=" + value);
					xhr.setRequestHeader("Cookie", name+"="+value);
				} else {
					//TODO: Display Error
				}
			}
			xhr.send();			
		};
		
		var attachLogin = function(attachFunction, callback) {
			attachFunction(function() {
				if (token) {
					callback();
				} else {
					loginWindow.show(callback);
				}
			});
		};
		
		return {
			attachLogin: attachLogin,
			checkToken: checkToken,
			getToken: getToken,
			getTokenFromCode: getTokenFromCode,
			grantAccess: grantAccess,
			isLoggedIn: isLoggedIn,
			logout: logout,
			setToken: setToken
		};
	};
	
	mh.auth.oauth = new OAuth(mh.ui.login.window);
})();
