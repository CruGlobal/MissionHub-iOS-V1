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
	if (ios) {
		tableView = UI.createIOSTableView({
			separatorColor: Colors.ctvSep,
			backgroundColor: Colors.ctvBg,
			data:ids
		});
	} else {
		tableView = UI.createAndroidTableView({
			separatorColor: Colors.ctvSep,
			backgroundColor: Colors.ctvBg,
			data:ids
		});	
	}
	unassigned.add(tableView);
	
	var firstView = true; // True after this view has been shown
	var loadingData = false; // True when loading remote data
	var lastStart = 0; // last start record
	var defaultLimit = 15; // default number of contacts to fetch per attempt
	if (ipad) {
		defaultLimit = 30;
	}
	
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
	w.addEventListener('click_contacts_unassigned', function(e) {
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
			if (JSON.valid(response)) {
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
		
		w.indicator.show();
		
		var xhr = Ti.Network.createHTTPClient();
		
		xhr.onload = function(e) {
			loadingData = false;
			lastStart = start;
			if (ios) {
				tableView.fireEvent('refresh_finished');
			}
			w.indicator.hide();
			if (validResponse(this.responseText)) {
				appendTableViewData(JSON.parse(this.responseText))
			}
		};
		
		xhr.onerror = function(e) {
			loadingData = false;
			var dialog = false;
			if (ios) {
				tableView.fireEvent('refresh_finished');
			}
			w.indicator.hide();
			validResponse(this.responseText);
		};
		
		xhr.open('GET',Settings.api_url+'/contacts.json?start='+start+'&limit='+limit+'&access_token='+Titanium.Network.encodeURIComponent(getToken()));
		Ti.API.info(Settings.api_url+'/contacts.json?start='+start+'&limit='+limit+'&access_token='+Titanium.Network.encodeURIComponent(getToken()));
		xhr.send();
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
		//MH.Utils.clearImageCache('imgcache_unassigned');
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
			className:"person",
			color: Colors.ctvTxt,
			backgroundColor: Colors.ctvBg,
			backgroundDisabledColor: Colors.ctvBgDisabled,
			backgroundFocusedColor: Colors.ctvBgFocused,
			backgroundSelectedColor: Colors.ctvBgSelected,
			selectionStyle: Colors.ctvSelStyle,
			height: 56,
			hasChild:true
		});
		
		var img;
		if (ios) {
			var params = {
				defaultImage: '/images/default_contact.jpg',
				image: person.picture+"?type=square",
				top: 3,
				left: 3,
				width: 50,
				height: 50
			};
			
			if (person.picture) {
				img = Ti.UI.createImageView(params);
			} else {
				img = Ti.UI.createImageView(JSON.merge(params, {image: '/images/default_contact.jpg'}));
			}
		} else {
			img = Ti.UI.createView({
				backgroundImage: '/images/default_contact.jpg',
				top: 3,
				left: 3,
				width: 50,
				height: 50
			});
			if (person.picture) {
				UI.createCachedFBImageView('imgcache_contacts', person.picture+"?type=square", img, person.id);
			}
		}
		row.image = img;
		row.add(img);
		
		var name = Ti.UI.createLabel({
			color: 'black',
			text: person.name,
			top: 10,
			left: 60,
			height: 20,
			width: Ti.Platform.displayCaps.platformWidth - 60
		})
		row.add(name);
		
		var gender = Ti.UI.createLabel({
			color: 'black',
			text: person.gender,
			top: 30,
			left: 60,
			height: 20,
			width: Ti.Platform.displayCaps.platformWidth - 60
		})
		row.add(gender);
		
		row.person = person;
		return row;
	}
	
	Ti.App.addEventListener('open_contact', function(e) {
		var person = e.person;
		var contact_win = Ti.UI.createWindow({
			url: '/windows/contact.js',
			titleid: 'win_title_contact',
			tabBarHidden: true,
			backgroundColor: Colors.lightBlue
		});
		contact_win.person = person;
		Ti.UI.currentTab.open(contact_win, {animated:true});
	});
})();