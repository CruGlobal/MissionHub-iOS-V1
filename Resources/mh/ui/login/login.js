/*!
 * MissionHub Login Window
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Builds and Controls Login Window and Processes
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Wed, 29 Jun 2011 14:29:42 -0400
 */

(function() {

	mh.ui.login = {};

	mh.ui.login.window = function() {

		var loginWindow, authWebView, signingIn, callback, indicator;

		var show = function(cb) {
			debug('running mh.ui.login.window.show');

			if (signingIn !== true) {
				signingIn = true;
				
				callback = cb;
				
				loginWindow = Ti.UI.createWindow({
					navBarHidden: true
				});
				
				loginWindow.addEventListener('android:back', function() {
					destroy();
				});

				authWebView = Ti.UI.createWebView({
					url: mh.auth.wvUrl,
					top: 0,
					zIndex: 99,
					autoDetect: [ Ti.UI.AUTODETECT_NONE ],
					canGoBack:false,
					canGoForward:false
				});

				// Force Landscape mode only
				var t = Ti.UI.create2DMatrix().scale(0);

				var authView = Ti.UI.createView({
					top: 5,
					left: 5,
					width: Ti.Platform.displayCaps.platformWidth-10,
					height: Ti.Platform.displayCaps.platformHeight-30,
					border: 5,
					backgroundColor: 'white',
					borderColor: '#333',
					borderRadius: 5,
					borderWidth: 5,
					zIndex: -1,
					transform: t
				});
				loginWindow.add(authView);

				// Activity indicator AJAX
				indicator = Ti.UI.createActivityIndicator({
					backgroundColor: "black",
					borderRadius: 4,
					height: 50,
					width: 50,
					zIndex: 90,
					style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN,
					visible: false
				});
				authWebView.add(indicator);

				//Close button
				var btn_close = Titanium.UI.createButton({
					backgroundImage: 'images/close5.png',
					width: 20,
					height: 20,
					top: 14,
					right: 12,
					zIndex: 100,
					visible: true
				});
				authView.add(btn_close);

				authView.add(authWebView);

				loginWindow.open();

				authWebView.addEventListener("beforeload", function(e) {
					indicator.show();
				});
				
				authWebView.addEventListener('load', webViewOnLoad);
				authWebView.addEventListener('error', webViewOnError);
				
				// Creating the Open Transition
				// create first transform to go beyond normal size
				var t1 = Titanium.UI.create2DMatrix();
				t1 = t1.scale(1.1);

				var a = Titanium.UI.createAnimation();
				a.transform = t1;
				a.duration = 200;

				// when this animation completes, scale to normal size
				a.addEventListener('complete', function() {
					var t2 = Titanium.UI.create2DMatrix();
					t2 = t2.scale(1.0);
					authView.animate({
						transform:t2,
						duration:200
					});
				});
				// Starts the Animation
				authView.animate(a);

				// Closes the Authentication Window
				btn_close.addEventListener('click', destroy);
			}
		};
		
		var destroy = function() {
			debug('running mh.ui.login.window.destroy');
			if (loginWindow === null) {
				return;
			}

			try {
				loginWindow.removeEventListener('load', webViewOnLoad);
				loginWindow.removeEventListener('error', webViewOnError);
				loginWindow.close();
				signingIn = false;
			} catch(ex) {
				debug('Cannot destroy the authorize UI, ignoring. reason: '+ ex.message);
			}

			loginWindow  = null;
			authWebView = null;
		};
		
		var webViewOnLoad = function (e) {
			debug('running mh.ui.login.window.webViewOnLoad');
			if (e.url) {
				var params = mh.util.uriParams(e.url);
				
				if (params.error) {
					debug("params.error : " + params.error);

					var options = {
						errorCallback: function(click) {
							if (click.index === 0) {
								authWebView.url = mh.auth.wvUrl;								
							}
							if (click.index === 1) {
								destroy();
							}
						},
						buttonNames: [L('retry'),L('cancel')]						
					};
					mh.error.handleError('', options, params.error);
					return;
				}
				
				if (params.authorization) {
					destroy();
					mh.ui.main.indicator.message = "    Logging In...  ";
					mh.ui.main.showIndicator('grantAccess'); 
					mh.auth.oauth.grantAccess(params.authorization, grantAccessOnLoad, grantAccessOnError);
				}
			}
			else {
				var options = {
					errorCallback: function() {}
				};
				mh.error.handleError('', options, 'unknown');
			}
			indicator.hide();
			mh.ui.main.hideIndicator('webViewLoad');

		};
		
		var webViewOnError = function(e) {
			debug('running mh.ui.login.window.webViewOnError');
			indicator.hide();
			mh.ui.main.hideIndicator('webViewLoad');

			var options = {
				errorCallback: function(click) {
					if (click.index === 0) {
						authWebView.url = mh.auth.wvUrl;
					}
					if (click.index === 1) {
						destroy();
					}
				},
				buttonNames: [L('retry'),L('cancel')]
			};
			mh.error.handleError('', options, 'no_data');
		};
		
		var grantAccessOnLoad = function (e) {
			debug('running mh.ui.login.window.grantAccessOnLoad');
			
			var options = {
				errorCallback: function(click) {
					if (click.index === 0) {
						mh.auth.oauth.grantAccess(e.authorization, grantAccessOnLoad, grantAccessOnError);
					}
				},
				buttonNames: [L('retry'),L('cancel')]
			};

			var response = mh.util.makeValid(e.response);
			if (response.error || !response.code) {
				if (response.error) {
					mh.error.handleError(response.error, options);
				}
				else {
					mh.error.handleError('', options, 'authentication');
				}
			} else {
				mh.ui.main.indicator.message = "    Logging In...  ";
				mh.ui.main.showIndicator('getToken');
				mh.auth.oauth.getTokenFromCode(response.code, getTokenOnLoad, getTokenOnError);
			}
			
			mh.ui.main.hideIndicator('grantAccess');
		};
		
		var grantAccessOnError = function (e) {
			debug('running mh.ui.login.window.grantAccessOnError');

			info(e);
			var options = {
				errorCallback: function(click) {
					if (click.index === 0) {
						mh.auth.oauth.grantAccess(e.authorization, grantAccessOnLoad, grantAccessOnError);
					}
				},
				buttonNames: [L('retry'),L('cancel')]
			};
			mh.error.handleError('', options, 'authentication');
			mh.ui.main.hideIndicator('grantAccess');
		};
		
		var getTokenOnLoad = function(e) {
			debug('running mh.ui.login.window.getTokenOnLoad');
			
			var options = {
				errorCallback: function(click) {
					if (click.index === 0) {
						mh.auth.oauth.getTokenFromCode(e.code, getTokenOnLoad, getTokenOnError);
					}
				},
				buttonNames: [L('retry'),L('cancel')]
			};
			
			var response = mh.util.makeValid(e.response);
			if (response.error || !response.access_token) {
				if (response.error) {
					mh.error.handleError(response.error, options);
				}
				else {
					mh.error.handleError('', options, 'authentication');
				}
			} else {
				mh.auth.oauth.setToken(response.access_token);
				mh.app.setPerson(response.person);
				mh.app.setOrgID(response.person.request_org_id);
				info(response.person.request_org_id);
				info("Logged in with access token: " + response.access_token);
				destroy();
				callback();
			}			
			mh.ui.main.hideIndicator('getToken');
		};
		
		var getTokenOnError = function(e) {
			debug('running mh.ui.login.window.getTokenOnError');
			var options = {
				errorCallback: function(click) {
					if (click.index === 0) {
						mh.auth.oauth.getTokenFromCode(e.code, getTokenOnLoad, getTokenOnError);
					}
				},
				buttonNames: [L('retry'),L('cancel')]
			};
			info(e);
			mh.error.handleError('', options, 'authentication');
			mh.ui.main.hideIndicator('getToken');
		};
		
		return {
			show: show
		};

	}();
})();