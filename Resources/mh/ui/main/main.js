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
		mh.ui.main.indicator.width = 140;
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
	
		var mainWindow, loggedOutView, loggedInView;
		
		var open = function() {
			debug('running mh.ui.main.window.open');
			
			mainWindow = Titanium.UI.createWindow({
				backgroundImage: '/images/bg.png',
				orientationModes: [Ti.UI.PORTRAIT],
				exitOnClose: true
			});
			
			mainWindow.add(mh.ui.main.indicator);
			
			createHeader();
			createLoggedInView();
			createLoggedOutView();
			
			mainWindow.open();
			
			refresh();
			
			mh.ui.main.indicator.message = "Logging In...";
			if (mh.auth.oauth.checkToken(checkTokenOnLoad, checkTokenOnError)){
				mh.ui.main.showIndicator('checkToken');
			}
		};
		
		var checkTokenOnLoad = function(e) {
			debug('running mh.ui.login.window.getTokenOnLoad');
			
			var response = mh.util.makeValid(e.response);
			if (response.error || !response || !e.token) {
				//TODO: Add Error
			} else {
				mh.auth.oauth.setToken(e.token);
				mh.app.setPerson(response[0]);
				info("Logged in with access token: " + e.token);
				refresh();
			}
			mh.ui.main.hideIndicator('checkToken');
		};
		
		var checkTokenOnError = function(e) {
			// TODO: Add Error
			mh.ui.main.hideIndicator('checkToken');
		};
		
		var show = function() {
			debug('running mh.ui.main.window.show');
			mainWindow.animate({
				left: 0,
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
					configureLogoutBar();
					configureLoggedInView();
					animation.addEventListener('complete', function() {
						loggedInView.animate({ duration: 250, top: 240 });
					});
					loggedOutView.animate(animation);
					showLogoutBar();
				} else {
					animation.addEventListener('complete', function() {
						loggedOutView.animate({ duration: 250, top: 240 });
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
			var logoView = Ti.UI.createView({
				backgroundImage: 'images/' + mh.app.lang() + '/logo.png',
				top: 57,
				left: Math.round((Ti.Platform.displayCaps.platformWidth-287)/2),
				width: 287,
				height: 126,
				visible: true
			});
			mainWindow.add(logoView);
			
			// Top Bar
			var logoutBarView = Ti.UI.createView({
				backgroundImage: 'images/top_bar.png',
				top: -33,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 33
			});
			mainWindow.add(logoutBarView);
			
			// Top Bar Left 
			var iButton = Ti.UI.createButton({
				top: 6,
				left: 9,
				style: Titanium.UI.iPhone.SystemButton.INFO_LIGHT
			});
			iButton.addEventListener('click', mh.ui.profile.window.open);
			logoutBarView.add(iButton);
			
			// Top Bar Right
			var signOutLabel = Ti.UI.createLabel({
				top: 0,
				right: 9,
				height: 31,
				width: 'auto',
				color: '#9F1392',
				textAlign: 'right',
				font: { fontSize: 11, fontFamily: 'Helvetica' },
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
				left: iButton.left + iButton.width,
				width: Ti.Platform.displayCaps.platformWidth - (iButton.left + iButton.width + signOutLabel.width + signOutLabel.right),
				height: 33
			});
			logoutBarView.add(middleContainerView);

			var textBarView = Ti.UI.createView({
				width: 'auto',
				height: 33
			});
			middleContainerView.add(textBarView);

			var signedInAsLabel = Ti.UI.createLabel({
				top: 8,
				left: 0,
				height: 14,
				width: 'auto',
				color: '#999',
				font: { fontSize: 10, fontFamily: 'Helvetica' },
				text: L('main_signed_in_as')
			});
			textBarView.add(signedInAsLabel);

			var usernameLabel = Ti.UI.createLabel({
				top: 9,
				left: signedInAsLabel.width + 4,
				height: 14,
				width: 'auto',
				color: 'white',
				font: { fontSize: 12, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			textBarView.add(usernameLabel);
			
			showLogoutBar = function() {
				logoutBarView.animate({ top: 0 });
				logoView.animate({ top: 75 });
			};

			hideLogoutBar = function() {
				logoutBarView.animate({ top: -33 });
				logoView.animate({ top: 57 });
			};
			
			configureLogoutBar = function() {
				usernameLabel.text = mh.app.person().name;
			};
		};
		
		var configureLoggedInView;
		var createLoggedInView = function() {
			debug('running mh.ui.main.window.createLoggedInView');
			loggedInView = Ti.UI.createView({
				top: Ti.Platform.displayCaps.platformHeight,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 220
			});
			mainWindow.add(loggedInView);
			
			var createPostButton = Titanium.UI.createButton({
				//image: 'images/' + mh.app.lang() + '/home_button_create_post.png',
				left: 0,
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 110,
				title: 'Contacts',
				color: 'black'
			});
			createPostButton.addEventListener('click', function() {
				mh.ui.contacts.window.open();
			});
			
			loggedInView.add(createPostButton);

			configureLoggedInView = function() {
				//TODO If needed
			};
		};
		
		var createLoggedOutView = function() {
			debug('running mh.ui.main.window.createLoggedOutView');
			loggedOutView = Ti.UI.createView({
				top: Ti.Platform.displayCaps.platformHeight,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 200
			});
			mainWindow.add(loggedOutView);
			
			var tryNowButton = Titanium.UI.createButton({
				// TODO: image: 'images/' + mh.app.lang() + '/home_button_tryitnow.png',
				left: 0,
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 110,
				title: 'Try'
			});
			tryNowButton.addEventListener('click', function() {
				mh.ui.openLink({
					title: L('home_try_it_now_alert_title'),
					message: L('home_try_it_now_alert_message'),
					url: 'http://meme.yahoo.com/confirm'
				});
			});
			loggedOutView.add(tryNowButton);

			var signInButton = Titanium.UI.createButton({
				// TODO: image: 'images/' + meme.app.lang() + '/home_button_signin.png',
				left: 0,
				top: 110,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 110,
				title: 'Sign-In'
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
			open: open,
			show: show,
			refresh: refresh
		};
		
	}();
	
})();
