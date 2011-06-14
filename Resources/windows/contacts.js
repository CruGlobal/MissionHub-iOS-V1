createContactsWindow = function() {
	var win = Titanium.UI.createWindow({
	    titleid:'win_title_contacts'
	});
	
	var tabbar = Titanium.UI.createView({
		top:0,
		left:0,
		height: 40,
		backgroundColor: 'black',
	});
	
	/* In-Progress Contacts */
	var tab1 = Titanium.UI.createView({
		left: 0,
		width: Titanium.Platform.displayCaps.platformWidth/3,
		focusable: true,
		backgroundColor: '#333',
	});
	var tab1label = Titanium.UI.createLabel({
		textid: 'controls_title_inprogress',
		textAlign: 'center',
		color: '#fff',
		font: {fontSize:15}
	})
	tab1.add(tab1label);
	tabbar.add(tab1);
	
	/* Completed Contacts */
	var tab2 = Titanium.UI.createView({
		left: Titanium.Platform.displayCaps.platformWidth/3,
		width: Titanium.Platform.displayCaps.platformWidth/3,
		focusable: true,
		backgroundColor: '#000',
	});
	var tab2label = Titanium.UI.createLabel({
		textid: 'controls_title_completed',
		textAlign: 'center',
		color: '#666',
		font: {fontSize:15}
	})
	tab2.add(tab2label);
	tabbar.add(tab2);
	
	/* Unassigned Contacts */
	var tab3 = Titanium.UI.createView({
		left: (Titanium.Platform.displayCaps.platformWidth/3) * 2,
		width: Titanium.Platform.displayCaps.platformWidth/3,
		focusable: true,
		backgroundColor: '#000',
	});
	var tab3label = Titanium.UI.createLabel({
		textid: 'controls_title_unassigned',
		textAlign: 'center',
		color: '#666',
		font: {fontSize:15}
	})
	tab3.add(tab3label);
	tabbar.add(tab3);

	Ti.include('/windows/contacts_inprogress.js');
	Ti.include('/windows/contacts_unassigned.js');
	Ti.include('/windows/contacts_completed.js');

	Ti.App.fireEvent('load_contacts_inprogress');
	Ti.App.fireEvent('load_contacts_completed');
	Ti.App.fireEvent('load_contacts_unassigned');
	
	tab1.addEventListener('click', function(e){
		tab1.backgroundColor = '#333';
		tab1.children[0].color = '#fff';
		tab2.backgroundColor = '#000';
		tab2.children[0].color = '#666';
		tab3.backgroundColor = '#000';
		tab3.children[0].color = '#666';
		win1.show();
		win2.hide();
		win3.hide();
	})
	
	tab2.addEventListener('click', function(e){
		tab1.backgroundColor = '#000';
		tab1.children[0].color = '#666';
		tab2.backgroundColor = '#333';
		tab2.children[0].color = '#fff';
		tab3.backgroundColor = '#000';
		tab3.children[0].color = '#666';
		win1.hide();
		win2.show();
		win3.hide();
	})
	
	tab3.addEventListener('click', function(e){
		tab1.backgroundColor = '#000';
		tab1.children[0].color = '#666';
		tab2.backgroundColor = '#000';
		tab2.children[0].color = '#666';
		tab3.backgroundColor = '#333';
		tab3.children[0].color = '#fff';
		win1.hide();
		win2.hide();
		win3.show();
	})	
	
	win.add(tabbar);
	win.add(win1);
	win.add(win2);
	win.add(win3);

	return win;
}