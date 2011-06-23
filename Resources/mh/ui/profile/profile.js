(function(){
	
	mh.ui.profile = {};
	
	mh.ui.profile.window = function() {
		
		var aboutWindow;
		
		var open = function() {
			aboutWindow = Ti.UI.createWindow({
				backgroundImage: 'images/bg.png',
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth
			});
			
			createHeader();
			
			aboutWindow.open({
				transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT,
				duration: 500
			});
		};
		
		var createHeader = function() {
			var aboutBar = Ti.UI.createView({
				top: 0,
				width: 320,
				height: 40,
				backgroundImage: 'images/navbar_bg.png'
			});
			aboutWindow.add(aboutBar);

			var aboutLabel = Ti.UI.createLabel({
				text: L('about_title'),
				color: 'white',
				height: 22,
				left: 60,
				width: 200,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			aboutBar.add(aboutLabel);

			var doneButton = Ti.UI.createButton({
				top: 5,
				right: 5,
				height: 30,
				width: 60,
				backgroundImage: 'images/btn_done.png',
				title: L('about_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica Neue', fontWeight: 'Bold' }
			});
			doneButton.addEventListener('click', function() {
				aboutWindow.close({
					transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT,
					duration: 500
				});
			});
			aboutBar.add(doneButton);

			var logoView = Ti.UI.createView({
				top: 40,
				width: 320,
				height: 119
				//backgroundImage: 'images/' + meme.app.lang() + '/about_memeforiphone.png'
			});
			aboutWindow.add(logoView);

			var versionLabel = Ti.UI.createLabel({
				text: String.format(L('about_version'), Ti.App.version),
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
