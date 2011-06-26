(function(){
	
	mh.ui.contact = {};
	
	mh.ui.contact.window = function() {
		
		var contactWindow, person, tabbedBar, tableView, tableViewHeader;
		
		var open = function(p) {
			debug('running mh.ui.contact.window.open with contact: ' + p.name);
			
			person = p;
			
			contactWindow = Ti.UI.createWindow({
				backgroundImage: 'images/bg.png',
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth,
				left: Ti.Platform.displayCaps.platformWidth
			});
			
			createHeader();
			createTableView();
			createTableViewHeader();
			createTableViewContent();
			createFooter();
			
			mh.ui.nav.open(contactWindow);
		};
		
		var createHeader = function() {
			debug('running mh.ui.contact.window.createHeader');
			var contactBar = Ti.UI.createView({
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: 'images/navbar_bg.png'
			});
			contactWindow.add(contactBar);
			
			var contactLabel = Ti.UI.createLabel({
				text: L('contact_title'),
				color: 'white',
				height: 22,
				top: 8,
				left: 65,
				width: Ti.Platform.displayCaps.platformWidth-65-65,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			contactBar.add(contactLabel);
			
			var doneButton = Ti.UI.createButton({
				top: 4,
				left: 5,
				height: 30,
				width: 60,
				backgroundImage: 'images/btn_done.png',
				title: L('contact_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica Neue', fontWeight: 'Bold' }
			});
			doneButton.addEventListener('click', function() {
				mh.ui.nav.pop();
			});
			contactBar.add(doneButton);
		};
		
		var createTableView = function() {
			tableViewHeader = Ti.UI.createView({
				width: Ti.Platform.displayCaps.platformWidth,
				height: 200,
				backgroundColor: mh.config.colors.lightGray
			});
			
			tableView = Ti.UI.createTableView({
				headerView: tableViewHeader,
				width: Ti.Platform.displayCaps.platformWidth,
				height: Ti.Platform.displayCaps.platformHeight - 50 - 36,
				top: 40,
				opacity: 0,
				backgroundColor: mh.config.colors.lightGray
			});
			
			contactWindow.add(tableView);
			tableView.animate({opacity: 1.0, duration: 300});
		};
		
		var createTableViewHeader = function() {
			
		};
		
		var createTableViewContent = function() {
			
		};
		
		var createFooter = function() {
			
			tabbedBar = Ti.UI.createTabbedBar({
				labels:[L('contact_contact'), L('contact_more_info')],
				backgroundColor:'#333',
			    top:tableView.top+tableView.height,
			    height:30,
			    style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
			    width:Ti.Platform.displayCaps.platformWidth,
			    index: 0
			});
			contactWindow.add(tabbedBar);
			
		};
		
		return {
			open: open	
		};
		
	}();
})();
