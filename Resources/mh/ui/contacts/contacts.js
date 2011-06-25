(function(){
	
	mh.ui.contacts = {};
	
	mh.ui.contacts.window = function() {
		
		var contactsWindow;
		
		var open = function() {
			debug('running mh.ui.contacts.window.open');
			contactsWindow = Ti.UI.createWindow({
				backgroundImage: 'images/bg.png',
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth,
				left: Ti.Platform.displayCaps.platformWidth
			});
			
			createHeader();
			
			contactsWindow.open();
			contactsWindow.animate({duration: 250, left: 0});
		};

		var createHeader = function() {
			debug('running mh.ui.contacts.window.createHeader');
			var contactsBar = Ti.UI.createView({
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: 'images/navbar_bg.png'
			});
			contactsWindow.add(contactsBar);
			
			var contactsLabel = Ti.UI.createLabel({
				text: L('contacts_title'),
				color: 'white',
				height: 22,
				left: 60,
				width: 200,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			contactsBar.add(contactsLabel);

			var doneButton = Ti.UI.createButton({
				top: 5,
				right: 5,
				height: 30,
				width: 60,
				backgroundImage: 'images/btn_done.png',
				title: L('contacts_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica Neue', fontWeight: 'Bold' }
			});
			doneButton.addEventListener('click', function() {
				var animation = Ti.UI.createAnimation({duration: 250, left: Ti.Platform.displayCaps.platformWidth});
				animation.addEventListener('complete', function() {
					contactsWindow.close();
				});
				contactsWindow.animate(animation);
			});
			contactsBar.add(doneButton);
		};

		return {
			open: open
		};
	}();
	
})();
