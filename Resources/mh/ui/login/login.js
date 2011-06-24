(function() {

	mh.ui.login = {};

	mh.ui.login.window = function() {

		var loginWindow, authWebView, signingIn, callback;

		var show = function(cb) {
			Ti.API.debug('mh.ui.login.window.show');

			if (signingIn !== true) {
				signingIn = true;
				
				callback = cb;
				
				loginWindow = Ti.UI.createWindow({
					navBarHidden: true
				});

				authWebView = Ti.UI.createWebView({
					url: 'http://google.com',
					top: 40,
					zIndex: 99,
					scalesPageToFit: true,
					autoDetect: [ Ti.UI.AUTODETECT_NONE ] // does not detects Phone numbers and links them automatically
				});

				// Force Landscape mode only
				var t = Ti.UI.create2DMatrix().scale(0);

				var authView = Ti.UI.createView({
					top: 5,
					left: 5,
					width: 310,
					height: 450,
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
				// var actInd = Ti.UI.createActivityIndicator({
					// top: 220,
					// backgroundColor: "black",
					// borderRadius: 4,
					// height: 50,
					// width: 50,
					// zIndex: 90,
					// style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN,
					// visible: false
				// });
				// authWebView.add(actInd);

				//Close button
				var btn_close = Titanium.UI.createButton({
					backgroundImage: 'images/close.png',
					width: 20,
					height: 20,
					top: 12,
					right: 12,
					zIndex: 10,
					visible: true
				});
				authView.add(btn_close);

				authView.add(authWebView);

				loginWindow.open();

				authWebView.addEventListener("beforeload", function(e) {
					//actInd.show();
				});
				
				authWebView.addEventListener('load', responseHandler);
				authWebView.addEventListener('error', responseHandler);
				
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
			Ti.API.debug('mh.ui.login.window.destroy');
			if (loginWindow === null) {
				return;
			}

			try {
				loginWindow.removeEventListener('load', responseHandler);
				loginWindow.removeEventListener('error', responseHandler);
				loginWindow.close();
				signingIn = false;
			} catch(ex) {
				Ti.API.debug('Cannot destroy the authorize UI, ignoring. reason: '+ ex.message);
			}

			loginWindow  = null;
			authWebView = null;
		};
		
		var responseHandler = function (e) {
			Ti.API.info(e);
		};
		
		return {
			show: show
		};

	}();
})();