/*
 * OAuth2 Library
 * 
 * 2011 C. Roemmich
 */

function OAuth() {
}

OAuth.auth_window = null;
OAuth.auth_webview = null;
OAuth.auth_indicator = null;
OAuth.displayed = null;

/**
 * Perpare the access_token for use if it is null
 * TODO: Check for validity
 */
OAuth.prepareAccessToken = function() {
	if (!Titanium.App.Properties.getString("access_token", null)) {
		OAuth.openLoginPrompt();
	} else {
		Ti.App.fireEvent("access_token", {access_token:Titanium.App.Properties.getString("access_token", null)});
	}
}

/**
 * Returns the access_token
 */
OAuth.getAccessToken = function() {
	return Titanium.App.Properties.getString("access_token", null);
}

/**
 * Opens the login prompt
 */
OAuth.openLoginPrompt = function() {
	if (OAuth.displayed) {
		OAuth.auth_window.show();
		return;
	}
	
	OAuth.resetLoginPrompt();
	OAuth.displayed = true;
	
	var authorization = false;
	var code = false;
	
	if (Titanium.Platform.osname != 'android') {
		OAuth.auth_window = Titanium.UI.createWindow({
			titleid: 'login',
			backgroundColor: '#999999',
			modal: true,
		});
	} else {
		OAuth.auth_window = Titanium.UI.createWindow({
			titleid: 'login',
			backgroundColor: '#999999',
			fullscreen: false
		});
	}
	
	/*
	OAuth.auth_window.addEventListener('close', function(e) {
		Ti.API.info('closed');
	})
	*/
	
	OAuth.auth_webview = Ti.UI.createWebView({
		canGoBack:false,
		canGoForward:false,
		url:oauth_url + "/authorize?display=touch&simple=true&response_type=code&redirect_uri="+oauth_url+"/done&client_id="+client_id,
		backgroundColor:'transparent'
	});
    
    if (Titanium.Platform.osname != 'android') {
	    OAuth.auth_indicator = Titanium.UI.createActivityIndicator();
    	OAuth.auth_window.setRightNavButton(OAuth.auth_indicator);
    } else {
    	OAuth.auth_indicator = Titanium.UI.createActivityIndicator({
	        messageid:'loading'
	    });
    	OAuth.auth_webview.add(OAuth.auth_indicator);
    }
	
	OAuth.auth_webview.addEventListener("beforeload", function(e) {
		OAuth.auth_indicator.show();
	});
	
	OAuth.auth_webview.addEventListener("load", function(e) {
		OAuth.auth_indicator.hide();
		var params = Utils.uri_params(e.url);
		
		if (params['authorization']) {
			authorization = params['authorization'];
		}
		
		if (params['code']) {
			code = params['code'];
		}
		
		if (authorization && code) {
			OAuth.auth_window.close(); OAuth.displayed = false;
			Ti.App.fireEvent("OAuth.fetchAccessToken", {code:code});
		}
	});
	
	OAuth.auth_webview.addEventListener("error", function(e) {
		var alertDialog = Titanium.UI.createAlertDialog({
		    title: 'Login Error',
		    message: 'The login server could not be contacted. Please retry or try again later.',
		    buttonNames: ['Cancel', 'Retry']
		});
		alertDialog.addEventListener("click", function(e){
			if (e.index = 0) {
				OAuth.closeLoginPrompt();
			} else {
				OAuth.auth_webview.url = oauth_url + "/authorize?display=touch&simple=true&response_type=code&redirect_uri="+oauth_url+"/done&client_id="+client_id;
			}
		});
		OAuth.auth_indicator.hide();
		alertDialog.show();
	});
	
	OAuth.auth_window.add(OAuth.auth_webview);
	OAuth.auth_window.open();
}

/**
 * Closes and resets the login prompt
 */
OAuth.closeLoginPrompt = function() {
	OAuth.resetLoginPrompt();
}

OAuth.resetLoginPrompt = function() {
	if (OAuth.auth_window) {
		if (OAuth.auth_webview) {
			if (OAuth.auth_indicator) {
				OAuth.auth_indicator.hide();
				if (Titanium.Platform.osname != 'android') {
					OAuth.auth_window.setRightNavButton(OAuth.auth_indicator);
				} else {
					OAuth.auth_webview.remove(OAuth.auth_indicator);
				}
				OAuth.auth_indicator = null;
			}
			OAuth.auth_window.remove();
			OAuth.auth_webview = null;
		}
		OAuth.auth_window.close();
		OAuth.auth_window = null;
	}
}

/**
 * Listen for requests to fetch access token
 */
Ti.App.addEventListener("OAuth.fetchAccessToken", function(data) {
	OAuth.fetchAccessToken(data.code);
});

/**
 * Fetches the access token from the OAuth Server
 */
OAuth.fetchAccessToken = function (code) {
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function() {
		var data = JSON.parse(this.responseText)
		if (data['access_token']) {
			Ti.App.Properties.setString("access_token", data['access_token']);
			Ti.App.fireEvent("access_token", {access_token:Titanium.App.Properties.getString("access_token", null)});
		} else {
			Ti.App.Properties.removeProperty("access_token");
			Ti.App.fireEvent("access_token", {error:"badtoken"});
		}
	};
	
	xhr.onerror = function(e) {
		Ti.fireEvent("access_token", {error:e});
	};
	
	xhr.open('POST',oauth_url+'/access_token');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send({
		client_id:client_id,
		client_secret:client_secret,
		code:code,
		grant_type:'authorization_code',
		scope: 'userinfo,contacts',
		redirect_uri: oauth_url+'/done'
	});
}

/**
 * Convience method to get access_token url param
 */
OAuth.getAccessParam = function() {
	return "access_token="+Ti.Network.encodeURIComponent(OAuth.getAccessToken());
}