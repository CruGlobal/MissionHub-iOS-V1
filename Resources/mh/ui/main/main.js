/*!
 * MissionHub Main Window
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Creates and shows the main application window
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Wed, 29 Jun 2011 14:29:42 -0400
 */

(function(){
	
	mh.ui.main = {};
	
	mh.ui.main.indicator = Ti.UI.createActivityIndicator({
		backgroundColor: "black",
		borderRadius: 4,
		height: 50,
		width: 'auto',
		color: '#fff',
		zIndex: 90,
		style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN,
		font: {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'}
	});
	
	mh.ui.main.processes = [];
	
	mh.ui.main.showIndicator = function(process) {
		mh.ui.main.indicator.width = 160;
		mh.ui.main.processes.push(process);
		mh.ui.main.indicator.show();
	};
	
	mh.ui.main.hideIndicator = function(process) {
		var idx = mh.ui.main.processes.indexOf(process);
		if(idx!=-1) { mh.ui.main.processes.splice(idx, 1); }
		
		if (mh.ui.main.processes.length <= 0) {
			mh.ui.main.indicator.hide();
		}
	};
	
	mh.ui.main.window = function() {
	
		var mainWindow, loggedOutView, loggedInView, logoView;
		
		var open = function() {
			debug('running mh.ui.main.window.open');
			
			var win = Titanium.UI.createWindow({
				orientationModes: [Titanium.UI.PORTRAIT, Titanium.UI.UPSIDE_PORTRAIT]
			});
			
			mainWindow = Titanium.UI.createWindow({
				backgroundImage: mh.util.getBackgroundImage('/images/MH_Background3.png'),
				navBarHidden: true
			});			
			mainWindow.add(mh.ui.main.indicator);
			
			createHeader();
			createLoggedInView();
			createLoggedOutView();
			
			mh.ui.nav = Titanium.UI.iPhone.createNavigationGroup({
			   window: mainWindow
			});
			win.add(mh.ui.nav);
			win.open();
			
			refresh();
			
			mh.ui.main.indicator.message = " Logging In... ";
			if (mh.auth.oauth.checkToken(checkTokenOnLoad, checkTokenOnError)){
				mh.ui.main.showIndicator('checkToken');
			}
		};
		
		var checkTokenOnLoad = function(e) {
			debug('running mh.ui.login.window.getTokenOnLoad');
			mh.ui.main.hideIndicator('checkToken');
			var response = mh.util.makeValid(e.response);
			if (response.error || !response || !e.token) {
				
				var options = {
					errorCallback: function(e) {
						if (e.index === 0) {
							if (mh.auth.oauth.checkToken(checkTokenOnLoad, checkTokenOnError)){
								mh.ui.main.showIndicator('checkToken');
							}
						}
					},
					buttonNames: [L('retry'),L('cancel')]
				};
				
				if (response.error) {
					mh.error.handleError(response.error, options);
				}
				else {
					mh.error.handleError('', options, 'no_access_token');
				}
			} else {
				mh.auth.oauth.setToken(e.token);
				mh.app.setPerson(response[0]);
				info("Logged in with access token: " + e.token);
				refresh();
			}
		};
		
		var checkTokenOnError = function(e) {
			debug('running mh.ui.login.window.getTokenOnError');
			mh.ui.main.hideIndicator('checkToken');
			var options = {
				errorCallback: function(e) {
					if (e.index === 0) {
						if (mh.auth.oauth.checkToken(checkTokenOnLoad, checkTokenOnError)){
							mh.ui.main.showIndicator('checkToken');
						}
					}
				},
				buttonNames: [L('retry'),L('cancel')]
			};
			mh.error.handleError('',options, 'access_token_fetch');
		};
		
		var show = function() {
			debug('running mh.ui.main.window.show');
			mainWindow.animate({
				left: 0,
				duration: 250
			});
		};
		
		var hideToLeft = function() {
			debug('running mh.ui.main.window.hideToLeft');
			mainWindow.animate({
				left: -(Ti.Platform.displayCaps.platformWidth),
				duration: 250
			});
		};
		
		var hideToRight = function() {
			debug('running mh.ui.main.window.hideToRight');
			mainWindow.animate({
				left: Ti.Platform.displayCaps.platformWidth,
				duration: 250
			});
		};
		
		var refresh = function() {
			debug('running mh.ui.main.window.refresh');
			setTimeout(function() {
				var animation = Ti.UI.createAnimation({
					duration: 250,
					top: Ti.Platform.displayCaps.platformHeight
				});
				if (mh.auth.oauth && mh.auth.oauth.isLoggedIn()) {
					showView = loggedInView; hideView = loggedOutView;
					showOrHideLogoutBar = showLogoutBar;
					configureLoggedInView();
					animation.addEventListener('complete', function() {
						loggedInView.animate({ duration: 250, top: Ti.Platform.displayCaps.platformHeight - 18 -loggedInView.height });
					});
					loggedOutView.animate(animation);
					showLogoutBar();
				} else {
					animation.addEventListener('complete', function() {
						loggedOutView.animate({ duration: 250, top: Ti.Platform.displayCaps.platformHeight - 18 - loggedOutView.height });
					});
					loggedInView.animate(animation);
					hideLogoutBar();
				}
			}, 125);
		};
		
		var configureLogoutBar, showLogoutBar, hideLogoutBar;
		var createHeader = function() {
			debug('running mh.ui.main.window.createHeader');
			// Logo
			
			if (ipad) {
				logoView = Ti.UI.createView({
					backgroundImage: mh.util.getBackgroundImage('images/' + mh.app.lang() + '/MH_Logo2.png'),
					top: 65,
					left: Math.round((Ti.Platform.displayCaps.platformWidth-570)/2),
					width:570,
					height:206,
					visible: true
				});
			} else {
				logoView = Ti.UI.createView({
					backgroundImage: mh.util.getBackgroundImage('images/' + mh.app.lang() + '/MH_Logo2.png'),
					top: 65,
					left: Math.round((Ti.Platform.displayCaps.platformWidth-285)/2),
					width:285,
					height:103,
					visible: true
				});
			}
			
			mainWindow.add(logoView);
			
			// Top Bar
			var logoutBarView = Ti.UI.createView({
				backgroundImage: mh.util.getBackgroundImage('images/MH_TopBar.png'),
				top: -33,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 33
			});
			mainWindow.add(logoutBarView);
			
			// Top Bar Left 
			var iButton = Ti.UI.createButton({
				top: 3,
				left: 9,
				backgroundImage: mh.util.getBackgroundImage('images/MH_Profile_Icon.png'),
				height:29,
				width:29
			});
			
			iButton.addEventListener('click', function() {
				mh.ui.profile.window.open();
			});
			logoutBarView.add(iButton);
			
			// Top Bar Right
			var signOutLabel = Ti.UI.createLabel({
				top: 0,
				right: 9,
				height: 31,
				width: 'auto',
				color: mh.config.colors.blue,
				textAlign: 'right',
				font: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
				text: L('main_sign_out')
			});
			signOutLabel.addEventListener('click', function(e) {
				mh.auth.oauth.logout(function() {
					refresh();
				});
			});
			logoutBarView.add(signOutLabel);
			
				// Top Bar Center
			var middleContainerView = Ti.UI.createView({
				top: 0,
				left: iButton.left + iButton.width + 10,
				width: Ti.Platform.displayCaps.platformWidth - 10 - (iButton.left + iButton.width + signOutLabel.width + signOutLabel.right),
				height: 33
			});
			logoutBarView.add(middleContainerView);

			var usernameLabel = Ti.UI.createLabel({
				top: 9,
				height: 14,
				textAlign: 'center',
				color: 'white',
				font: { fontSize: 12, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			middleContainerView.add(usernameLabel);
			
			showLogoutBar = function() {
				logoutBarView.animate({ top: 0 });
				if (ipad) {
					logoView.animate({ top: 280 });
				} else {
					logoView.animate({ top: 140 });
				}
			};

			hideLogoutBar = function() {
				logoutBarView.animate({ top: -33 });
				if (ipad) {
					logoView.animate({ top: 200 });
				} else {
					logoView.animate({ top: 65 });
				}
			};
			
			configureLogoutBar = function() {
				usernameLabel.text = mh.app.getPerson().name;
			};
		};
		
		var configureLoggedInView;
		var createLoggedInView = function() {
			debug('running mh.ui.main.window.createLoggedInView');
			loggedInView = Ti.UI.createView({
				top: Ti.Platform.displayCaps.platformHeight,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 110
			});
			mainWindow.add(loggedInView);
			
			var contactsButton = Titanium.UI.createButton({
				left: 0,
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 110,
				title: L('profile_contacts_button'),
				backgroundImage: mh.util.getBackgroundImage('/images/MH_Button.png'),
				shadowColor: 'black',
				shadowOffset: {x: -2, y: 2},				
				color: 'white',
				font: { fontSize: 36, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			
			contactsButton.addEventListener('click', function() {
				mh.ui.contacts.window.open();
			});
			
			loggedInView.add(contactsButton);

			configureLoggedInView = function() {
				configureLogoutBar();
			};
		};
		
		var createLoggedOutView = function() {
			debug('running mh.ui.main.window.createLoggedOutView');
			loggedOutView = Ti.UI.createView({
				top: Ti.Platform.displayCaps.platformHeight,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 220
			});
			mainWindow.add(loggedOutView);
			
			var tryNowButton = Titanium.UI.createButton({
				left: 0,
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 110,
				title: L('profile_about_button'),
				shadowColor: 'black',
				shadowOffset: {x: -2, y: 2},
				font: {fontFamily:'Helvetica Neue', fontSize:24,fontWeight:'bold'},
				backgroundImage: mh.util.getBackgroundImage('/images/MH_Button.png')
			});
			
			tryNowButton.addEventListener('click', function() {
				mh.ui.openLink({
					title: L('home_about_alert_title'),
					message: L('home_about_alert_message'),
					url: 'http://www.missionhub.com?mobile=0'
				});
			});
			loggedOutView.add(tryNowButton);

			var signInButton = Titanium.UI.createButton({
				left: 0,
				top: 110,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 110,
				title: 'Sign-In',
				font:{fontFamily:'Helvetica Neue', fontSize:24,fontWeight:'bold'},
				backgroundImage: mh.util.getBackgroundImage('/images/MH_Button.png')
			});
			loggedOutView.add(signInButton);

			var signInButtonClick = function(continuation) {
				var clickTimeoutSignIn = 0;
				signInButton.addEventListener('click', function() {
					clearTimeout(clickTimeoutSignIn);
					clickTimeoutSignIn = setTimeout(function() {
						continuation();
					}, 100);
				});
			};
			mh.auth.attachLogin(signInButtonClick, refresh);
		};
		
		return {
			hideToLeft: hideToLeft,
			hideToRight: hideToRight,
			open: open,
			show: show,
			refresh: refresh
		};
		
	}();
	
})();
