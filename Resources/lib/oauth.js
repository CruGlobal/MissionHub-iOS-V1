/*
 * OAuth2 Library
 * 
 * 2011 C. Roemmich
 */

MH.OAuth = {}

MH.OAuth.auth_window = null;
MH.OAuth.auth_webview = null;
MH.OAuth.auth_indicator = null;
MH.OAuth.displayed = null;
MH.OAuth.alert = null;
MH.OAuth.nalAlert = null;

/**
 * Perpare the access_token for use if it is null
 * TODO: Check for validity
 */
MH.OAuth.prepareAccessToken = function() {
	if (!Titanium.App.Properties.getString("access_token", null)) {
		MH.OAuth.openLoginPrompt();
	} else {
		Ti.App.fireEvent("access_token", {access_token:Titanium.App.Properties.getString("access_token", null)});
	}
}

/**
 * Returns the access_token
 */
MH.OAuth.getAccessToken = function() {
	return Titanium.App.Properties.getString("access_token", null);
}

/**
 * Opens the login prompt
 */
MH.OAuth.openLoginPrompt = function() {
	if (MH.OAuth.displayed) {
		MH.OAuth.auth_window.open();
		return;
	}
	
	MH.OAuth.resetLoginPrompt();
	MH.OAuth.displayed = true;
	
	var authorization = false;
	var code = false;
	
	if (Titanium.Platform.osname != 'android') {
		MH.OAuth.auth_window = Titanium.UI.createWindow({
			titleid: 'login',
			backgroundColor: '#999999',
			modal: true,
		});
	} else {
		MH.OAuth.auth_window = Titanium.UI.createWindow({
			titleid: 'login',
			backgroundColor: '#999999',
			fullscreen: false
		});
	}
	
	Ti.App.addEventListener( 'resume', MH.OAuth.reloadWebView);
	
	MH.OAuth.auth_webview = Ti.UI.createWebView({
		canGoBack:false,
		canGoForward:false,
		url:MH.Setting.oauth_url + "/authorize?display=touch&simple=true&response_type=code&redirect_uri="+MH.Setting.oauth_url+"/done&client_id="+MH.Setting.oauth_client_id+"&scope="+MH.Setting.oauth_scope,
		backgroundColor:'transparent'
	});
    
    if (Titanium.Platform.osname != 'android') {
	    MH.OAuth.auth_indicator = Titanium.UI.createActivityIndicator();
    	MH.OAuth.auth_window.setRightNavButton(MH.OAuth.auth_indicator);
    } else {
    	MH.OAuth.auth_indicator = Titanium.UI.createActivityIndicator({
	        messageid:'loading'
	    });
    	MH.OAuth.auth_webview.add(MH.OAuth.auth_indicator);
    }
    
    Ti.Locale.getString('error_no_network');
    
    MH.OAuth.alert = Titanium.UI.createAlertDialog({
	    title: Ti.Locale.getString('error_no_network'),
	    message: Ti.Locale.getString('error_no_network_msg'),
	    buttonNames: [Ti.Locale.getString('cancel'), Ti.Locale.getString('retry')]
	});
	MH.OAuth.alert.addEventListener("click", function(e){
		if (e.index == 0) {
			MH.OAuth.closeLoginPrompt();
		} else {
			MH.OAuth.openLoginPrompt();
			//TODO: make better
			MH.OAuth.auth_webview.url = MH.Setting.oauth_url + "/authorize?display=touch&simple=true&response_type=code&redirect_uri="+MH.Setting.oauth_url+"/done&client_id="+MH.Setting.oauth_client_id+"&scope="+MH.Setting.oauth_scope;
		}
	});
	
	MH.OAuth.nalAlert = Titanium.UI.createAlertDialog({
	    title: Ti.Locale.getString('error_not_a_leader'),
	    message: Ti.Locale.getString('error_not_a_leader_msg'),
	    buttonNames: [Ti.Locale.getString('close')]
	});
	
	MH.OAuth.nalAlert.addEventListener("click", function(e){
		MH.OAuth.closeLoginPrompt();
	});
	
	MH.OAuth.auth_webview.addEventListener("beforeload", function(e) {
		if (Titanium.Platform.osname != 'android') {
			MH.OAuth.auth_indicator.show();
		}
	});
	
	MH.OAuth.auth_webview.addEventListener("load", function(e) {
		if (Titanium.Platform.osname != 'android') {
			MH.OAuth.auth_indicator.hide();
		}
		var params = MH.Utils.uri_params(e.url);
		
		if (params['authorization']) {
			authorization = params['authorization'];
		}
		
		if (params['code']) {
			code = params['code'];
		}
		
		if (authorization && code) {
			MH.OAuth.auth_window.close(); MH.OAuth.displayed = false;
			Ti.App.fireEvent("MH.OAuth.fetchAccessToken", {code:code});
		}
	});
	
	MH.OAuth.auth_webview.addEventListener("error", function(e) {
		MH.OAuth.auth_indicator.hide();
		MH.OAuth.alert.show();
	});
	
	MH.OAuth.auth_window.add(MH.OAuth.auth_webview);
	MH.OAuth.auth_window.open();
}

MH.OAuth.reloadWebView = function() {
	MH.OAuth.auth_webview.reload();
}

/**
 * Closes and resets the login prompt
 */
MH.OAuth.closeLoginPrompt = function() {
	MH.OAuth.resetLoginPrompt();
}

MH.OAuth.resetLoginPrompt = function() {
	if (MH.OAuth.auth_window) {
		Ti.App.removeEventListener( 'resume', MH.OAuth.reloadWebView);
		
		if (MH.OAuth.alert) {
			MH.OAuth.alert.hide();
			MH.OAuth.alert = null;
		}
		if (MH.OAuth.nalAlert) {
			MH.OAuth.nalAlert.hide();
			MH.OAuth.nalAlert = null;
		}
		if (MH.OAuth.auth_webview) {
			if (MH.OAuth.auth_indicator) {
				MH.OAuth.auth_indicator.hide();
				if (Titanium.Platform.osname != 'android') {
					MH.OAuth.auth_window.setRightNavButton(MH.OAuth.auth_indicator);
				} else {
					MH.OAuth.auth_webview.remove(MH.OAuth.auth_indicator);
				}
				MH.OAuth.auth_indicator = null;
			}
			MH.OAuth.auth_webview = null;
		}
		MH.OAuth.auth_window.close();
		MH.OAuth.auth_window = null;
	}
	MH.OAuth.displayed = false;
}

/**
 * Listen for requests to fetch access token
 */
Ti.App.addEventListener("MH.OAuth.fetchAccessToken", function(data) {
	MH.OAuth.fetchAccessToken(data.code);
});

/**
 * Fetches the access token from the OAuth Server
 */
MH.OAuth.fetchAccessToken = function (code) {
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function() {
		if (!this.responseText) {
			var data = {error: 'no_reponse'};
		} else if (!MH.Utils.isJSON(this.responseText)) {
			var data = {error: this.responseText};
		} else {
			var data = JSON.parse(this.responseText)
		}
		
		if (data && data['access_token']) {
			Ti.App.Properties.setString("access_token", data['access_token']);
			Ti.App.Properties.setString("person", JSON.stringify(data['person']));
			Ti.App.fireEvent("access_token", {access_token:Titanium.App.Properties.getString("access_token", null)});
		} else {
			var dialog = false;
			if (data['error']) {
				if (data['error'] == "not_a_leader") {
					MH.OAuth.nalAlert.show();
					dialog = true;
				}
			}
			if (!dialog) {
				MH.OAuth.alert.show();
			}
			Ti.App.Properties.removeProperty("access_token");
			//TODO: better error?
		}
		MH.UI.activityIndicator.hide();
	};
	
	xhr.onerror = function(e) {
		MH.OAuth.alert.show();
		MH.UI.activityIndicator.hide();
	};
	
	xhr.open('POST',MH.Setting.oauth_url+'/access_token');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send({
		client_id:MH.Setting.oauth_client_id,
		client_secret:MH.Setting.oauth_client_secret,
		code:code,
		grant_type:'authorization_code',
		scope: MH.Setting.oauth_scope,
		redirect_uri: MH.Setting.oauth_url+'/done'
	});
	
	MH.UI.activityIndicator.show();
}

/**
 * Convience method to get access_token url param
 */
MH.OAuth.getAccessParam = function() {
	return "access_token="+Ti.Network.encodeURIComponent(MH.OAuth.getAccessToken());
}