/*!
 * MissionHub Login Window
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 *  
 * Description: Login Window and OAuth Authentication
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Sat, 18 Jun 2011 00:20:54 -0400
 */

Ti.include('/include/includes.js');

var w = Ti.UI.currentWindow;

w.addEventListener('android:back', function(e){}); /* Lock in Android Users */

(function(){ /* Activity Indicator */
	w.indicator = null;
	if (android) {
		w.indicator = Ti.UI.createActivityIndicator({
			messageid: 'loading',
			type: 1,
			location: 0
		});
		w.add(w.indicator);
	} else {
		w.indicator = Titanium.UI.createActivityIndicator();
	    w.setRightNavButton(w.indicator);
	}
	w.indicator.show();
})();

(function(){ /* Login View */
	w.back = Ti.UI.createView({
		backgroundColor: 'black'
	});
	w.add(w.back);
})();

(function(){ /* Login WebView */
	w.wv = Ti.UI.createWebView({
		canGoBack:false,
		canGoForward:false
	});
})();

function showWebView() { /* Shows the WebView */
	w.add(w.wv);
	w.remove(w.back);
}

function hideWebView() { /* Hide the WebView */
	w.wv.stopLoading();
	w.wv.hide();
	w.add(w.back);
	w.remove(w.wv);
}

var authorization; /* Authorization Code */
var code; /* Grant Code */

function checkToken() { /* Fetch the Access Token */
	if (!getToken()) {
		fetchToken();
		return;
	}
	w.indicator.show();
	
	w.adCheck = Ti.UI.createAlertDialog({
		buttonNames: [Ti.Locale.getString('close', 'Cancel'), Ti.Locale.getString('retry', 'Retry')]
	});
	w.adCheck.addEventListener("click", function(e){
		if (e.index === 0) {
			hideWebView();
		} else {
			checkToken();
		}
	});
	
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function(e) {
		w.indicator.show();
		var response = Net.makeValid(this.responseText);
		if (response.error) {
			w.adCheck.title = getErrorTitle(response.error, 'bad_login');
			w.adCheck.message = getErrorMsg(response.error, 'bad_login');
			w.adCheck.show();
		} else {
			hideWebView();
			Ti.App.fireEvent("profile:update", {person: response[0]});
			Ti.App.fireEvent("oauth:complete");
		}
	};
	
	xhr.onerror = function(e) {
		w.indicator.hide();
		var response = Net.makeValid(this.responseText);
		w.adCheck.title = getErrorTitle(response.error, 'bad_login');
		w.adCheck.message = getErrorMsg(response.error, 'bad_login');
		w.adCheck.show();
	};
	
	xhr.ondatastream = function(e) {
		w.indicator.value = (e.progress*100);
	};

	xhr.open('GET',Settings.api_url+'/people/me.json?access_token='+Titanium.Network.encodeURIComponent(getToken()));
	info(Settings.api_url+'/people/me.json?access_token='+Titanium.Network.encodeURIComponent(getToken()));
	xhr.send();
}

function fetchToken() { /* Check the user's Access Token and fetch person's data */
	if (!w.wv.hasListeners) {
		w.wv.hasListeners = true;
		
		w.adFetch = Ti.UI.createAlertDialog({
			buttonNames: [Ti.Locale.getString('close', 'Close'), Ti.Locale.getString('retry', 'Retry')]
		});
		w.adFetch.addEventListener("click", function(e){
			if (e.index === 0) {
				hideWebView();
			} else {
				checkToken();
			}
		});
		
		w.wv.addEventListener('beforeload', function(e) {
			w.indicator.show();
		});
		
		w.wv.addEventListener('load', function(e) {
			w.indicator.hide();
			
			var params = Net.uri_params(e.url);
			if (params.error) {
				w.adFetch.title = getErrorTitle(params.error);
				w.adFetch.message = getErrorMsg(params.error);
				w.adFetch.show();
				return;
			}
			
			if (params.authorization) {
				authorization = params.authorization;
			}
			
			if (params.code) {
				code = params.code;
			}
			
			if (authorization && code) {
				hideWebView();
				getTokenFromCode();
			}
		});
		
		w.wv.addEventListener('error', function(e) {
			w.indicator.hide();
			w.adFetch.title = getErrorTitle('no_data');
			w.adFetch.message = getErrorMsg('no_data');
			w.adFetch.show();
		});
	}
	
	showWebView();
	w.wv.stopLoading();
	w.wv.url = Settings.oauth_url + "/authorize?display=touch&simple=true&response_type=code&redirect_uri=" + Settings.oauth_url + "/done&client_id=" + Settings.oauth_client_id + "&scope=" + Settings.oauth_scope;
}

function getTokenFromCode() { /* Gets the access_token from the grant code */
	w.indicator.show();
	
	w.adToken = Ti.UI.createAlertDialog({
		buttonNames: [Ti.Locale.getString('close', 'Cancel'), Ti.Locale.getString('retry', 'Retry')]
	});
	w.adToken.addEventListener("click", function(e){
		if (e.index === 0) {
			hideWebView();
		} else {
			fetchToken();
		}
	});
	
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function(e) {
		w.indicator.hide();
		
		var response = Net.makeValid(this.responseText);
		if (response.error || !response.access_token) {
			w.adToken.title = getErrorTitle(response.error, 'bad_login');
			w.adToken.message = getErrorMsg(response.error, 'bad_login');
			w.adToken.show();
		} else {
			setToken(response.access_token);
			hideWebView();
			Ti.App.fireEvent('oauth:complete');
			Ti.App.fireEvent('profile:update', {person: response.person});
		}
	};
	
	xhr.onerror = function(e) {
		w.indicator.hide();
		var response = Net.makeValid(this.responseText);
		w.adToken.title = getErrorTitle(response.error, 'bad_login');
		w.adToken.message = getErrorMsg(response.error, 'bad_login');
		w.adToken.show();
	};
	
	xhr.ondatastream = function(e) {
		w.indicator.value = (e.progress*100);
	};
	
	xhr.open('POST',Settings.oauth_url+'/access_token');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send({
		client_id:Settings.oauth_client_id,
		client_secret:Settings.oauth_client_secret,
		code:code,
		grant_type:'authorization_code',
		scope: Settings.oauth_scope,
		redirect_uri:Settings.oauth_url+'/done'
	});
}

checkToken();