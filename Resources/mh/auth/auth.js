(function(){
	
	mh.auth = {};
	
	mh.auth.attachLogin = function(buttonClick, callback) {
		mh.auth.oauth.attachLogin(buttonClick, callback);	
	};
	
	var OAuth = function(loginWindow) {
		
		var property = 'access_token';
		
		var token; // set per session after successful auth or token check
		
		var getToken = function() {
			return Ti.App.Properties.getString(property);
		};
		
		var setToken = function(t) {
			token = t;
			Ti.App.Properties.setString(property, t);
		};
		
		var logout = function(callback) {
			token = null;
			Ti.App.Properties.removeProperty(property);
			callback();
		};
		
		var login = function(callback) {
			if (!token) {
				w.login(callback);
			} else {
				callback();
			}
		};
		
		var isLoggedIn = function() {
			if (token) {
				return true;
			} else {
				return false;
			}
		};
		
		var checkToken = function(onLoadCallback, onErrorCallback) {
			var xhr = Ti.Network.createHTTPClient();
			
			xhr.onload = function(e) {
				onLoadCallback({
					e: e,
					response: this.responseText
				});
			};
			
			xhr.onerror = function(e) {
				onErrorCallback({
					e: e,
					response: this.responseText
				});
			};
			
			xhr.open('GET', mh.config.api_url+'/people/me.json?access_token='+Titanium.Network.encodeURIComponent(token));
			info(mh.config.api_url+'/people/me.json?access_token='+Titanium.Network.encodeURIComponent(token));
			xhr.send();
		};
		
		var getTokenFromCode = function(code, onLoadCallback, onErrorCallback) {
			var xhr = Ti.Network.createHTTPClient();
			
			xhr.onload = function(e) {
				onLoadCallback({
					e: e,
					response: this.responseText
				});
			};
			
			xhr.onerror = function(e) {
				onErrorCallback({
					e: e,
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
				redirect_uri:mh.config.oauth_url+'/done'
			});
		};
		
		var grantAccess = function(authorization, onLoadCallback, onErrorCallback) {
			// TODO
			var xhr = Ti.Network.createHTTPClient();
			
			xhr.onload = function(e) {
				onLoadCallback({
					e: e,
					response: this.responseText
				});
			};
			
			xhr.onerror = function(e) {
				onErrorCallback({
					e: e,
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
				redirect_uri:mh.config.oauth_url+'/done'
			});
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
			login: login,
			logout: logout,
			setToken: setToken
		};
	};
	
	mh.auth.oauth = new OAuth(mh.ui.login.window);
})();
