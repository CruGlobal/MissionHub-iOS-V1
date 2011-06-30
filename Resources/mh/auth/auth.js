/*!
 * MissionHub OAuth Handler
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 *
 * Description: Handles OAuth Requests
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Wed, 29 Jun 2011 14:28:31 -0400
 */

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
		
		var logout = function(callback, safe) {
			
			var win = Ti.UI.createWindow();

			var indicator = Ti.UI.createActivityIndicator({
				backgroundColor: "black",
				borderRadius: 4,
				height: 50,
				width: 50,
				zIndex: 90,
				style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
			});
			win.add(indicator);
						
			var wv = Ti.UI.createWebView({
				opacity: 0,
				url: mh.config.base_url + '/auth/facebook/logout'
			});
			win.add(wv);
			
			wv.addEventListener('load', function(e) {
				indicator.hide();
				win.close();
				if (!safe) {
					token = null;
					Ti.App.Properties.removeProperty(property);
				}
				callback();
			});
			
			wv.addEventListener('error', function(e) {
				indicator.hide();
				win.close();
				mh.error.handleResponse(e, {
					buttonNames: [L('alert_btn_close')],
					onClick: function() {}
				});
			});
			win.open();
			indicator.show();
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
					response: this.responseText,
					code: code
				});
			};
			
			xhr.onerror = function(e) {
				onErrorCallback({
					location: this.location,
					response: this.responseText,
					code: code
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
					response: this.responseText,
					authorization: authorization
				});
			};
			
			xhr.onerror = function(e) {
				onErrorCallback({
					location: this.location,
					response: this.responseText,
					authorization: authorization
				});
			};
			
			xhr.open('GET',mh.config.oauth_url+'/grant.json?authorization='+Titanium.Network.encodeURIComponent(authorization));
			xhr.send();			
		};
		
		var attachLogin = function(attachFunction, callback) {
			attachFunction(function() {
				if (token) {
					logout(function() {
						callback();
					}, true);
				} else {
					logout(function() {
						setTimeout(function(){
							loginWindow.show(callback);
						}, 200);
					});
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
