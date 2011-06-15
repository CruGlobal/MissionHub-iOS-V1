var unassigned = Titanium.UI.createView({
    backgroundColor: '#333',
    visible: false,
    top: 40,
});

(function() {
	/* Alert Dialog For Errors*/
	var alertDialog = Titanium.UI.createAlertDialog({
	    title: 'Error',
	    message: '',
	    buttonNames: ['OK']
	});
	//unassigned.add(alertDialog); //TODO:
	
	/* The TableView and Data */
	var ids = [];
	var tableView;
	if (isIOS()) {
		tableView = MH.UI.createIOSTableView({
			data:ids
		});
	} else {
		tableView = MH.UI.createAndroidTableView({
			data:ids
		});	
	}
	unassigned.add(tableView);
	
	var firstView = true; // True after this view has been shown
	var loadingData = false; // True when loading remote data
	var lastStart = 0; // last start record
	var defaultLimit = 20; // default number of contacts to fetch per attempt
	var hasLastContact = false; // True when last contact has been feteched
	
	tableView.addEventListener('click', function(e){
		if (e.row) {
			if (e.row.person) {
				Ti.App.fireEvent("open_contact", {person:e.row.person});
			}
		}
	});
	
	tableView.addEventListener('scrolldown', function(e) {
		fetchTableViewData(lastStart+defaultLimit, defaultLimit);
	});
	
	/* Tab item is clicked */
	Ti.App.addEventListener('click_contacts_unassigned', function(e) {
		if (firstView == true) {
			firstView = false;
			fetchTableViewData(0, defaultLimit); //fetch 25 records from the beginning
		}
	});
	
	Ti.App.addEventListener('refresh_contacts', function(e) {
		if (currentContactsTab == 2) {
			refreshTableViewData();
		}
	});
	
	function validResponse(response) {
		var dialog = false;
		if (response) {
			if (MH.Utils.isJSON(response)) {
				var data = JSON.parse(response);
				if (data['error']) {
					alertDialog.message = Ti.Locale.getString('error_'+data['error'], data['error']);
					dialog = true;
				} else {
					return true;
				}
			}
		}
		if (!dialog) {
			alertDialog.message = Ti.Locale.getString('error_could_not_fetch_contacts');
		}
		alertDialog.show();
		return false;
	}
	
	function fetchTableViewData(start, limit) {
		if (loadingData || hasLastContact) { return };
		loadingData = true;
		
		var xhr = Ti.Network.createHTTPClient();
		
		xhr.onload = function(e) {
			loadingData = false;
			lastStart = start;
			if (isIOS()) {
				tableView.fireEvent('refresh_finished');
			}
			contactsLoadingIndicator.hide();
			if (validResponse(this.responseText)) {
				appendTableViewData(JSON.parse(this.responseText))
			}
		};
		
		xhr.onerror = function(e) {
			loadingData = false;
			var dialog = false;
			if (isIOS()) {
				tableView.fireEvent('refresh_finished');
			}
			contactsLoadingIndicator.hide();
			validResponse(this.responseText);
		};
		
		xhr.open('GET',MH.Setting.api_url+'/contacts.json?start='+start+'&limit='+limit+'&access_token='+Titanium.Network.encodeURIComponent(Ti.App.Properties.getString("access_token")));
		Ti.API.info(MH.Setting.api_url+'/contacts.json?start='+start+'&limit='+limit+'&access_token='+Titanium.Network.encodeURIComponent(Ti.App.Properties.getString("access_token")));
		xhr.send();
		
		if (isIOS()) {
			contactsLoadingIndicator.show();
		} else {
			if (start == 0) {
				contactsLoadingIndicator.show();
			}
		}
	}
	
	/**
	 * Appends json persons to the tableview
	 */
	function appendTableViewData(data) {
		var index = 0;
		for (index in data) {
			var person = data[index].person;
			if (person) {	
				if (person.id && ids.indexOf(person.id) < 0) {
					tableView.appendRow(createTableRow(person));
					ids.push(person.id);
				}
			}
		}
		if (index+1 < defaultLimit) {
			hasLastContact = true;
		} else {
			hasLastContact = false;
		}
		
	}
	
	/**
	 * Complete refreshes the data in the tableview
	 */
	function refreshTableViewData() {
		ids = [];
		tableView.setData(ids);
		lastStart = 0;
		hasLastContact = false;
		fetchTableViewData(0, defaultLimit);
	}
	
	/**
	 * Create a single table view row from a json person object
	 */
	function createTableRow(person) {
		var row = Ti.UI.createTableViewRow({
			title: person.first_name + " " + person.last_name
		});
		row.person = person;
		return row;
	}
	
	Ti.App.addEventListener('open_contact', function(e) {
		var person = e.person;
		var contact_win = MH.UI.createContactWindow(person);
		MH.UI.tabContacts.open(contact_win,{animated:true});
	});
})();