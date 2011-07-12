/*!
 * MissionHub Profile
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Shows logged in person profile and allows changing org
 * Author: Matt Webb <matt.webb@cojourners.com>
 * Date: Wed, 29 Jun 2011 14:29:42 -0400
 */

(function() {

	mh.ui.surveys = {};

	mh.ui.surveys.window = function() {
		
		var surveysWindow, webview, indicator;
		
		var surveyUrl = mh.api.getSurveysUrl();
		
		var open = function() {
			debug('running mh.ui.surveys.window.open');
			surveysWindow = Ti.UI.createWindow({
				backgroundImage: mh.util.getBackgroundImage('images/MH_Background.png'),
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth
			});
			
			surveyUrl = mh.api.getSurveysUrl({
				access_token: mh.auth.oauth.getToken(),
				org_id: mh.app.orgID()
			});
			
			createHeader();
			createWebView();
			
			mh.ui.nav.open(surveysWindow);
			
			if (!Ti.App.Properties.hasProperty('guide_surveys')) {
				mh.ui.alert({
					buttonNames: [L('alert_btn_close'), L('alert_btn_dont_show')],
					title: L('guide_surveys'),
					message: L('guide_surveys_msg'),
					onClick: function(e) {
						if (e.index === 1) {
							Ti.App.Properties.setBool('guide_surveys', true);
						}
					}
				});
			}
		};

		var createHeader = function() {
			debug('running mh.ui.surveys.window.createHeader');
			var surveysBar = Ti.UI.createView({
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: mh.util.getBackgroundImage('images/MH_Nav_Bar.png'),
				zIndex: 99
			});
			surveysWindow.add(surveysBar);
			
			surveysWindow.contactsLabel = Ti.UI.createLabel({
				text: L('surveys_title'),
				color: 'white',
				height: 22,
				top: 8,
				left: 65,
				width: Ti.Platform.displayCaps.platformWidth-65-65,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica-Bold'}
			});
			surveysBar.add(surveysWindow.contactsLabel);

			var doneButton = Ti.UI.createButton({
				top: 4,
				left: 5,
				height: 30,
				width: 60,
				backgroundImage: mh.util.getBackgroundImage('/images/btn_done.png'),
				title: L('contacts_btn_back'),
				font: { fontSize: 12, fontFamily: 'Helvetica-Bold'},
				color: mh.config.colors.navButton
			});
			doneButton.addEventListener('click', function() {
				var animation = Ti.UI.createAnimation({duration: 250, left: Ti.Platform.displayCaps.platformWidth});
				animation.addEventListener('complete', function() {
					mh.ui.nav.pop();
				});
				surveysWindow.animate(animation);
				mh.ui.main.window.show();
			});
			surveysBar.add(doneButton);
						
			indicator = Ti.UI.createActivityIndicator({
				right: 10,
				top: 9,
				style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
				width: 'auto',
				height: 'auto'
			});
			surveysBar.add(indicator);
		};
		
		var createWebView = function() {
			webview = Ti.UI.createWebView({
				url: surveyUrl,
				top: 40,
				zIndex: 99,
				autoDetect: [ Ti.UI.AUTODETECT_NONE ],
				canGoBack:false,
				canGoForward:false
			});
			
			webview.addEventListener('beforeload', function(e) {
				indicator.show();
			});
			
			var errorOptions = {
				errorCallback: function(click) {
					if (click.index === 0) {
						webview.url = surveyUrl;
					}
					if (click.index === 1) {
						surveysWindow.close();
					}
				},
				buttonNames: [L('retry'),L('cancel')]						
			};
			
			webview.addEventListener('load', function(e) {
				indicator.hide();
				if (e.url) {
					var params = mh.util.uriParams(e.url);
					var response = webview.html;
					if (params.error || mh.util.validJSON(response)) {
						response = mh.util.makeValid(response);
						if (response.error) {
							webview.hide();
							mh.error.handleError(response, errorOptions);
							return;	
						} else if (params.error) {
							webview.hide();
							mh.error.handleError('', errorOptions, params.error);
							return;
						}
					}
					webview.show();
				} else {
					mh.error.handleError('', errorOptions, 'unknown');
				}
			});
			
			webview.addEventListener('error', function(e) {
				indicator.hide();
				mh.error.handleError('', errorOptions, 'no_data');
			});
			
			surveysWindow.add(webview);
		};
		
		return {
			open: open
		};
	}();
})();