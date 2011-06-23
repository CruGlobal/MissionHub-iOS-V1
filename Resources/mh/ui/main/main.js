(function(){
	
	mh.ui.main = {};
	
	mh.ui.main.window = function() {
	
		var mainWindow, loggedOutView, loggedInView;
		
		var open = function() {
			Ti.API.info('running mh.ui.main.window.open');
			
			mainWindow = Titanium.UI.createWindow({
				backgroundImage: '/images/bg.png',
				orientationModes: [Ti.UI.PORTRAIT],
				exitOnClose: true
			});
			
			createHeader();
			createLoggedInView();
			createLoggedOutView();
			
			mainWindow.open();
			
			refresh();
			
			if (android) {
				setTimeout(function() {
					refresh();
				}, 1500);
			}
		};
		
		var show = function() {
			Ti.API.info('running mh.ui.main.window.show');
			mainWindow.animate({
				left: 0,
				duration: 250
			});
		};
		
		var refresh = function() {
			Ti.API.info('running mh.ui.main.window.refresh');
			setTimeout(function() {
				var showView = loggedOutView, hideView = loggedInView;
				var showOrHideLogoutBar = hideLogoutBar;
				if (mh.auth.odapter && mh.auth.oadapter.isLoggedIn()) {
					showView = loggedInView; hideView = loggedOutView;
					showOrHideLogoutBar = showLogoutBar;
					configureLogoutBar();
					configureLoggedInView();
				}
				
				var animation = Ti.UI.createAnimation({
					duration: 250,
					top: Ti.Platform.displayCaps.platformHeight
				});
				animation.addEventListener('complete', function() {
					showView.animate({ duration: 250, top: 240 });
				});
				hideView.animate(animation);
				showOrHideLogoutBar();
			}, 125);
		};
		
		var configureLogoutBar, showLogoutBar, hideLogoutBar;
		var createHeader = function() {
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
			//TODO iButton.addEventListener('click', mh.ui.about.window.open);
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
				mh.auth.oadapter.logout(function() {
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
				height: 110
			});
			createPostButton.addEventListener('click', function() {
				meme.ui.post.window.open();
				homeWindow.animate({
					duration: 250,
					left: -(Ti.Platform.displayCaps.platformWidth)
				});
			});
			
			loggedInView.add(createPostButton);

			var yourBlogButton = Titanium.UI.createButton({
				//image: 'images/' + mh.app.lang() + '/home_button_your_blog.png',
				left: 0,
				top: 110,
				width: Ti.Platform.displayCaps.platformWidth, 
				height: 110
			});

			var blogUrlLabel = Ti.UI.createLabel({
				top: 36,
				left: 26,
				color: 'white',
				font: { fontSize: 14, fontFamily:'Gotham Rounded', fontWeight: 'Light' }
			});
			yourBlogButton.add(blogUrlLabel);
			yourBlogButton.addEventListener('click', function() {
				mh.ui.openLink({
					url: 'http://hub.ccci.us'
				});
			});
			loggedInView.add(yourBlogButton);

			configureLoggedInView = function() {
				blogUrlLabel.text = '/' + mh.app.person().name;
			};
		};
		
		var createLoggedOutView = function() {
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