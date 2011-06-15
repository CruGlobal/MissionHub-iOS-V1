var unassigned = Titanium.UI.createView({
    backgroundColor: '#333',
    visible: false,
    top: 40,
});

(function() {
	/* Loading Indicator */
	var activityIndicator = Ti.UI.createActivityIndicator({
		messageid: 'loading'
	});
	unassigned.add(activityIndicator);
	
	/* Alert Dialog For Errors*/
	var alertDialog = Titanium.UI.createAlertDialog({
	    title: 'Error',
	    message: '',
	    buttonNames: ['OK']
	});
	//unassigned.add(alertDialog); //TODO:
	
	/* The TableView and Data */
	var ids = [];
	if (isIOS && false) {
		Ti.API.info("Foo");
		
		var tableView = MH.UI.createPulldownTableView({
			data:ids
		});
	} else {
		var tableView = Titanium.UI.createTableView({
			data:ids
		});	
	}
	unassigned.add(tableView);
	
	firstView = true; // True after this view has been shown
	loadingData = false; // True when loading remote data
	lastStart = 0; // last start record
	defaultLimit = 10; // default number of contacts to fetch per attempt
	hasLastContact = false; // True when last contact has been feteched
	
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
	
	function fetchTableViewData(start, limit) {
		if (loadingData) { return };
		loadingData = true;
		
		var xhr = Ti.Network.createHTTPClient();
		
		xhr.onload = function(e) {
			loadingData = false;
			lastStart = start;
			activityIndicator.hide();
			//TODO check for json errors
			appendTableViewData(JSON.parse(this.responseText));
		};
		
		xhr.onerror = function(e) {
			loadingData = false;
			activityIndicator.hide();
			if (this.responseText) {
				var data = JSON.parse(this.responseText);
				alertDialog.message = data['error'];
			} else {
				//TODO better errors
			}
			alertDialog.show();
		};
		
		xhr.open('GET',MH.Setting.api_url+'/contacts.json?start='+start+'&limit='+limit+'&access_token='+Titanium.Network.encodeURIComponent(Ti.App.Properties.getString("access_token")));
		Ti.API.info(MH.Setting.api_url+'/contacts.json?start='+start+'&limit='+limit+'&access_token='+Titanium.Network.encodeURIComponent(Ti.App.Properties.getString("access_token")));
		xhr.send();
		
		activityIndicator.show();
	}
	
	/**
	 * Appends json persons to the tableview
	 */
	function appendTableViewData(data) {
		for (var index in data) {
			var person = data[index].person;
			if (person) {	
				if (person.id && ids.indexOf(person.id) < 0) {
					tableView.appendRow(createTableRow(person));
					ids.push(person.id);
				}
			}
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
		fetchTableViewData(0, 25);
	}
	
	/**
	 * Create a single table view row from a json person object
	 */
	function createTableRow(person) {
		var row = Ti.UI.createTableViewRow({
			title: person.first_name + " " + person.last_name
		});
		row.person = person;
		
		row.addEventListener('click', function(e) {
			if (isAndroid()) {
				Ti.UI.createNotification({ message : "Clicked: " + this.title}).show();
			} 
		});
		return row;
	}
})();