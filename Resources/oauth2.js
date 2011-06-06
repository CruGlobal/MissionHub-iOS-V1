/*
 * OAuth2 Library and Access Storage
 * 
 * 2011 C. Roemmich
 */

function OAuth2() {
	Ti.include("oauth2_credentials.js");
	var access_token = Titanium.App.Properties.getString("access_token", false);
	
	OAuth2.prototype.displayAuthDialog = function() {
		var t = Titanium.UI.create2DMatrix();
		t = t.scale(0);
		
		var w = Titanium.UI.createWindow({
			backgroundColor:'#336699',
			borderWidth:8,
			borderColor:'#999',
			height:400,
			width:300,
			transform:t
		});
		
		var t1 = Titanium.UI.create2DMatrix();
		t1 = t1.scale(1.1);
		var a = Titanium.UI.createAnimation();
		a.transform = t1;
		a.duration = 200;
		
		// when this animation completes, scale to normal size
		a.addEventListener('complete', function()
		{
			var t2 = Titanium.UI.create2DMatrix();
			t2 = t2.scale(1.0);
			w.animate({transform:t2, duration:200});
		});
		
		webview = Ti.UI.createWebView();
		webview.scalesPageToFit = false;
		webview.canGoBack = false;
		webview.canGoForward = false;
		webview.url = oauth_url + "/authorize?display=touch&response_type=code&redirect_uri="+oauth_url+"/admin&client_id="+client_id;
		
		var authorization = false;
		var code = false;
		
		webview.addEventListener("beforeload", function(e){
			Ti.API.info(e);
		});
		
		webview.addEventListener("load", function(e) {
			var params = uri_params(e.url);
			
			if (params['authorization']) {
				authorization = params['authorization'];
			}
			
			if (params['code']) {
				code = params['code'];
			}
			
			if (authorization && code) {
				access_token = getAccessToken(code);
				Titanium.App.Properties.setString("access_token", access_token);
				w.close()
			}
		});
		
		webview.addEventListener("error", function(e) {
			Ti.API.error(e);
		});
		
		w.add(webview);
		
		w.open(a);	
	}
	
	function getAccessToken(code) {
		var xhr = Ti.Network.createHTTPClient();
		
		xhr.onload = function() {
			var data = JSON.parse(this.responseText)
			Ti.API.info(data);
			return data['access_token'];
		};
		
		xhr.onerror = function(e) {
			Ti.API.info(e);
			return e;
		};
		
		xhr.open('POST',oauth_url+'/access_token');
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send({
			client_id:client_id,
			client_secret:client_secret,
			code:code,
			grant_type:'authorization_code',
			scope: 'oauth-admin',
			redirect_uri: oauth_url+'/admin'
		});
	}
}