(function(){
	
	mh.ui.contacts = {};
	
	mh.ui.contacts.window = function() {
		
		var contactsWindow, tabbedBar, tableView, search, indicator;
		
		var open = function() {
			debug('running mh.ui.contacts.window.open');
			contactsWindow = Ti.UI.createWindow({
				backgroundImage: 'images/bg.png',
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth,
				left: Ti.Platform.displayCaps.platformWidth
			});
			
			createHeader();
			createSearchFilters();
			createTableView();
			
			contactsWindow.open();
			contactsWindow.animate({duration: 250, left: 0});
		};

		var createHeader = function() {
			debug('running mh.ui.contacts.window.createHeader');
			var contactsBar = Ti.UI.createView({
				top: 10,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: '/images/navbar_bg.png',
				zIndex: 99
			});
			contactsWindow.add(contactsBar);
			
			var contactsLabel = Ti.UI.createLabel({
				text: L('contacts_title'),
				color: 'white',
				height: 22,
				top: 8,
				left: 65,
				width: Ti.Platform.displayCaps.platformWidth-65-65,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			contactsBar.add(contactsLabel);

			var doneButton = Ti.UI.createButton({
				top: 4,
				left: 5,
				height: 30,
				width: 60,
				backgroundImage: '/images/btn_done.png',
				title: L('contacts_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica Neue', fontWeight: 'Bold' }
			});
			doneButton.addEventListener('click', function() {
				var animation = Ti.UI.createAnimation({duration: 250, left: Ti.Platform.displayCaps.platformWidth});
				animation.addEventListener('complete', function() {
					contactsWindow.close();
				});
				contactsWindow.animate(animation);
				mh.ui.main.window.show();
				resetTableView();
			});
			contactsBar.add(doneButton);
						
			indicator = Ti.UI.createActivityIndicator({
				right: 10,
				top: 9,
				style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
				width: 'auto',
				height: 'auto'
			});
			contactsBar.add(indicator);
		};
		
		var createSearchFilters = function() {
			search = Titanium.UI.createSearchBar({
				barColor:'#333',
				showCancel:false,
				hintText:'search',
				right: 35,
				top:5,
				height: 35,
				zIndex: 50,
				keyboardType:Titanium.UI.KEYBOARD_DEFAULT
			});
			search.addEventListener('change', searchOnChange);
			
			var timeout;
			search.addEventListener('change', function() {
				if (timeout) { clearTimeout(timeout); }
				if (this.value.length == 0) {
					timeout = setTimeout(function() { search.blur(); }, 1000);
				} else {
					timeout = setTimeout(function() { search.blur(); }, 3000);
				}
			});
			search.addEventListener('return', function() {
				search.blur();
			});
			search.addEventListener('cancel', function() {
				search.blur();
			});
			
			contactsWindow.add(search);
			
			setTimeout(function() {
				search.animate({duration: 250, top: 50});
			}, 1000);
		};
		
		var createTableView = function() {		
			
			var bottomView = Ti.UI.createView({
				top:Ti.Platform.displayCaps.platformHeight,
				height: Ti.Platform.displayCaps.platformHeight-40-35-10,
				width: Ti.Platform.displayCaps.platformWidth
			});
			contactsWindow.add(bottomView);
			
			function formatDate() {
				var date = new Date();
				var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
				if (date.getHours()>=12)
				{
					datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+pad(date.getMinutes(), 2)+' PM';
				}
				else
				{
					datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
				}
				return datestr;
			}
			
			function pad(numNumber, numLength){
				var strString = '' + numNumber;
				while(strString.length<numLength){
					strString = '0' + strString;
				}
				return strString;
			}
			
			tableView = Ti.UI.createTableView({
				top: 0,
				left: 0,
				height: bottomView.height-36 //tabbar
			});
			bottomView.add(tableView);
			
			var lastY = 0;
			tableView.addEventListener('scroll', function(e) {
				var y = e.contentOffset.y;		
				if (y > lastY && y >= 0) {
					var height = e.size.height;
					var cHeight = e.contentSize.height;
					if (y > cHeight-(2*height)) {
						onGetMore();
					}
				}
				if (e.contentOffset.y < 0) {
					lastY = 0;
				} else {
					lastY = e.contentOffset.y;
				}
			});
			
			var border = Ti.UI.createView({
				backgroundColor:"#576c89",
				height:2,
				bottom:0
			});
			var tableHeader = Ti.UI.createView({
				backgroundColor:"#e2e7ed",
				width:320,
				height:60
			});
			tableHeader.add(border);
			var arrow = Ti.UI.createView({
				backgroundImage:"/images/whiteArrow.png",
				width:23,
				height:60,
				bottom:10,
				left:20
			});
			var statusLabel = Ti.UI.createLabel({
				text:"Pull to reload",
				left:55,
				width:200,
				bottom:30,
				height:"auto",
				color:"#576c89",
				textAlign:"center",
				font:{fontSize:13,fontWeight:"bold"},
				shadowColor:"#999",
				shadowOffset:{x:0,y:1}
			});
			var lastUpdatedLabel = Ti.UI.createLabel({
				text:"Last Updated: "+formatDate(),
				left:55,
				width:200,
				bottom:15,
				height:"auto",
				color:"#576c89",
				textAlign:"center",
				font:{fontSize:12},
				shadowColor:"#999",
				shadowOffset:{x:0,y:1}
			});
			
			tableView.updateLastUpdated = function() {
				lastUpdatedLabel.text = "Last Updated: "+formatDate();
			}
			
			var actInd = Titanium.UI.createActivityIndicator({
				left:20,
				bottom:13,
				width:30,
				height:30
			});
			tableHeader.add(arrow);
			tableHeader.add(statusLabel);
			tableHeader.add(lastUpdatedLabel);
			tableHeader.add(actInd);
			tableView.headerPullView = tableHeader;
			
			var pulling = false;
			
			function beginReloading() {
				resetTableView();
				tableView.reloading = true;
				onGetMore();
			};
			
			tableView.endReloading = function() {
				// when you're done, just reset
				tableView.reloading = false;
				tableView.setContentInsets({top:0},{animated:true});
				lastUpdatedLabel.text = "Last Updated: "+formatDate();
				statusLabel.text = "Pull down to refresh...";
				actInd.hide();
				arrow.show();
			};
			
			tableView.addEventListener('scroll',function(e) {
				var offset = e.contentOffset.y;
				if (offset <= -65.0 && !pulling) {
					var t = Ti.UI.create2DMatrix();
					t = t.rotate(-180);
					pulling = true;
					arrow.animate({transform:t,duration:180});
					statusLabel.text = "Release to refresh...";
				} else if (pulling && offset > -65.0 && offset < 0) {
					pulling = false;
					var t = Ti.UI.create2DMatrix();
					arrow.animate({transform:t,duration:180});
					statusLabel.text = "Pull down to refresh...";
				}
			});
			
			tableView.addEventListener('scrollEnd',function(e) {
				if (pulling && !tableView.reloading && e.contentOffset.y <= -65.0) {
					reloading = true;
					pulling = false;
					arrow.hide();
					actInd.show();
					statusLabel.text = "Reloading...";
					tableView.setContentInsets({top:60},{animated:true});
					arrow.transform=Ti.UI.create2DMatrix();
					beginReloading();
				}
			});
			
			tabbedBar = Ti.UI.createTabbedBar({
				labels:['My Contacts', 'My Completed', 'Unassigned'],
				backgroundColor:'#333',
			    top:tableView.height,
			    height:30,
			    style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
			    width:Ti.Platform.displayCaps.platformWidth,
			    index: 0
			});
			bottomView.add(tabbedBar);
			
			tabbedBar.addEventListener('click', function(e) {
				changeTab(e.index, true);
			});
			
			setTimeout(function() {
				bottomView.animate({duration: 250, top: 40+35+10});
			}, 1000);
			
			changeTab(0, true);
		};
		
		var ids = []; // id's of people in table to avoid duplicates
		var loadingData = false; // True when loading remote data
		var hasLastContact = false; // True when last contact has been feteched
		
		var options = {
			start: 0,
			limit: 15,
			successCallback: function(e){ onContactFetch(e); },
			errorCallback: function(e){ onContactFetchError(e); }
		};
		if (ipad) {
			options.limit = 30;
		}
		
		var filters = [];
		
		var resetTableView = function() {
			debug('mh.ui.window.contacts.resetTableView');
			loadingData = false; // reset state
			hasLastContact = false;  // reset state
			options.start = 0;
			ids=[];
			tableView.data = []; // clear table
		};
		
		var searching = false;
		var timeout;
		var searchOnChange = function(e) {
			if (this.value.length >= 3) {
				if (timeout) { clearTimeout(timeout); }
				timeout = setTimeout(function() {
					searching = true;
					addOption('term', search.value);
					changeTab(curTab, true);
				}, 300);
			} else {
				if (searching) {
					searching = false;
					removeOption('term');
					changeTab(curTab, true);
				}
			}
		};
		
		var prevXhr;
		var onGetMore = function(force) {
			debug('mh.ui.window.contacts.onGetMore');
			if (loadingData || hasLastContact) { return; }
			loadingData = true;
			
			if (force) {
				tableView.updateLastUpdated();
			}
			
			if (prevXhr && force) {
				prevXhr.onload = function(){};
				prevXhr.onerror = function(){};
				indicator.hide();
				prevXhr.abort();
			}
			
			indicator.show();
			
			options.filters = filters;
			prevXhr = mh.api.getContactsList(options);
		};
		
		var onContactFetch = function(e) {
			debug('mh.ui.window.contacts.onContactsFetch');
			
			if (e.length < options.limit) {
				hasLastContact = true;
			} else {
				hasLastContact = false;
			}
			
			options.start = options.limit + options.start;
			
			for (index in e) {
				var person = e[index].person;
				if (person) {
					if (person.id && ids.indexOf(person.id) < 0) {
						tableView.appendRow(createTableRow(person));
						ids.push(person.id);
					}
				}
			}
			
			if (tableView.reloading === true) { 
				tableView.endReloading();
			}
			
			indicator.hide();
			loadingData = false;
		};
		
		var onContactFetchError = function(e) {
			debug('mh.ui.window.contacts.onContactsFetchError');
			
			if (tableView.reloading === true) { 
				tableView.endReloading();
			}
			
			indicator.hide();
			loadingData = false;
		};
		
		
		var createTableRow = function(person) {
			debug('mh.ui.window.contacts.createTableRow');
			var row = Ti.UI.createTableViewRow({
				className:"person",
				color: mh.config.colors.ctvTxt,
				backgroundColor: mh.config.colors.ctvBg,
				backgroundDisabledColor: mh.config.colors.ctvBgDisabled,
				backgroundFocusedColor: mh.config.colors.ctvBgFocused,
				backgroundSelectedColor: mh.config.colors.ctvBgSelected,
				selectionStyle: mh.config.colors.ctvSelStyle,
				height: 56,
				hasChild:true
			});
			
			var img;
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
				img = Ti.UI.createImageView(mh.util.mergeJSON(params, {image: '/images/default_contact.jpg'}));
			}
			row.image = img;
			row.add(img);
			
			var name = Ti.UI.createLabel({
				color: 'black',
				text: person.name,
				top: 10,
				left: 60,
				height: 20,
				width: Ti.Platform.displayCaps.platformWidth - 60,
				font: { fontSize: 18 }
			})
			row.add(name);
			
			var status = Ti.UI.createLabel({
				color: 'black',
				text: person.status,
				top: 30,
				left: 60,
				height: 20,
				width: Ti.Platform.displayCaps.platformWidth - 60,
				font: { fontSize: 13, fontFamily: 'Helvetica' }
			})
			row.add(status);
			
			row.person = person;
			return row;
		};
		
		var curTab = 0;
		var changeTab = function(index, force) {
			if (index !== curTab || force) {
				curTab = index;
				resetTableView();
				switch (index) {
					case 0:	addOption('assigned_to_id', mh.app.person().id);
							addFilter('status', 'not_finished');
							break;
					case 1: addOption('assigned_to_id', mh.app.person().id);
							addFilter('status', 'finished');
							break;
					case 2: addOption('assigned_to_id', 'none');
							removeFilter('status');
							break;
				}
				onGetMore(force);
			}
		};
		
		var addOption = function(name, value) {
			options[name] = value;
		}
		
		var removeOption = function(name) {
			delete options[name];
		};
		
		var addFilter = function(name, value) {
			for (var index in filters) {
				var filter = filters[index];
				if (filter.name == name) {
					filters[index] = {name: name, value: value};	
					return;
				}
			}
			filters.push({name: name, value: value});
		}
		
		var removeFilter = function(name) {
			for (var i=0; i<filters.length; i++) {
				var filter = filters[i];
				if (filter.name == name) {
					filters.splice(i, 1);
				}
			}
		};
		
		return {
			open: open
		};
	}();
	
})();
