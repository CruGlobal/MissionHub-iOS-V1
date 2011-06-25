(function(){
	
	mh.ui.profile = {};
	
	mh.ui.profile.window = function() {
		
		var profileWindow;
		
		var open = function() {
			debug('running mh.ui.profile.window.open');
			profileWindow = Ti.UI.createWindow({
				backgroundImage: 'images/bg.png',
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth,
				left: -(Ti.Platform.displayCaps.platformWidth)
			});
			
			createHeader();
			
			profileWindow.open();
			profileWindow.animate({duration: 250, left: 0});
		};
		
		var createHeader = function() {
			debug('running mh.ui.profile.window.createHeader');
			var profileBar = Ti.UI.createView({
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: 'images/navbar_bg.png'
			});
			profileWindow.add(profileBar);

			var profileLabel = Ti.UI.createLabel({
				text: L('profile_title'),
				color: 'white',
				height: 22,
				left: 60,
				width: 200,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			profileBar.add(profileLabel);

			var doneButton = Ti.UI.createButton({
				top: 5,
				right: 5,
				height: 30,
				width: 60,
				backgroundImage: 'images/btn_done.png',
				title: L('profile_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica Neue', fontWeight: 'Bold' }
			});
			doneButton.addEventListener('click', function() {
				var animation = Ti.UI.createAnimation({duration: 250, left: -(Ti.Platform.displayCaps.platformWidth)});
				animation.addEventListener('complete', function() {
					profileWindow.close();
				});
				profileWindow.animate(animation);
			});
			profileBar.add(doneButton);

			var logoView = Ti.UI.createView({
				top: 40,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 119
				//backgroundImage: 'images/' + meme.app.lang() + '/profile_memeforiphone.png'
			});
			profileWindow.add(logoView);

			var versionLabel = Ti.UI.createLabel({
				text: String.format(L('profile_version'), Ti.App.version),
				color: 'white',
				top: 59,
				left: 100,
				height: 15,
				font: { fontSize: 11, fontFamily: 'Helvetica', fontWeight: 'Light' }
			});
			logoView.add(versionLabel);
		};
		
		return {
			open: open
		};
	}();
	
})();
