var currentContactsTab = 0;
var contactsLoadingIndicator;

createContactsWindow = function() {
	MH.UI.winContacts = Titanium.UI.createWindow({
	    titleid:'win_title_contacts'
	});
	
	if (isIOS()) {
		contactsLoadingIndicator = Titanium.UI.createActivityIndicator();
		MH.UI.winContacts.setRightNavButton(contactsLoadingIndicator);
	} else {
		contactsLoadingIndicator = Ti.UI.createActivityIndicator({
			messageid: 'loading'
		});
		MH.UI.winContacts.add(contactsLoadingIndicator);
	}
	
	var tabbar = Titanium.UI.createView({
		top:0,
		left:0,
		height: 40,
		focusable: true,
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
	
	/* Includes create views for each tab */
	Ti.include('/windows/contacts_inprogress.js');
	Ti.include('/windows/contacts_completed.js');
	Ti.include('/windows/contacts_unassigned.js');
	
	tab1.addEventListener('click', function(e){
		currentContactsTab = 0;
		Ti.App.fireEvent('click_contacts_inprogress');
		tab1.backgroundColor = '#333';
		tab1.children[0].color = '#fff';
		tab2.backgroundColor = '#000';
		tab2.children[0].color = '#666';
		tab3.backgroundColor = '#000';
		tab3.children[0].color = '#666';
		inprogress.show();
		completed.hide();
		unassigned.hide();
	});
	
	tab2.addEventListener('click', function(e){
		currentContactsTab = 1;
		Ti.App.fireEvent('click_contacts_completed');
		tab1.backgroundColor = '#000';
		tab1.children[0].color = '#666';
		tab2.backgroundColor = '#333';
		tab2.children[0].color = '#fff';
		tab3.backgroundColor = '#000';
		tab3.children[0].color = '#666';
		inprogress.hide();
		completed.show();
		unassigned.hide();
	});
	
	tab3.addEventListener('click', function(e){
		currentContactsTab = 2;
		Ti.App.fireEvent('click_contacts_unassigned');
		tab1.backgroundColor = '#000';
		tab1.children[0].color = '#666';
		tab2.backgroundColor = '#000';
		tab2.children[0].color = '#666';
		tab3.backgroundColor = '#333';
		tab3.children[0].color = '#fff';
		inprogress.hide();
		completed.hide();
		unassigned.show();
	});
	
	MH.UI.winContacts.add(tabbar);
	MH.UI.winContacts.add(inprogress);
	MH.UI.winContacts.add(completed);
	MH.UI.winContacts.add(unassigned);
	
	tab1.fireEvent('click', {});
}