/*!
 * MissionHub Contacts View
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Contacts View
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Wed, 29 Jun 2011 14:29:42 -0400
 */

(function(){
	
	mh.ui.contacts = {};
	
	mh.ui.contacts.window = function() {
		
		var contactsWindow, tabbedBar, tableView, search, indicator;
		
		var open = function() {
			debug('running mh.ui.contacts.window.open');
			contactsWindow = Ti.UI.createWindow({
				backgroundImage: mh.util.getBackgroundImage('images/MH_Background.png')
			});
			
			createHeader();
			createSearchFilters();
			createTableView();
			
			mh.ui.nav.open(contactsWindow);
		};

		var createHeader = function() {
			debug('running mh.ui.contacts.window.createHeader');
			var contactsBar = Ti.UI.createView({
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: mh.util.getBackgroundImage('images/MH_Nav_Bar.png'),
				zIndex: 99
			});
			contactsWindow.add(contactsBar);
			
			contactsWindow.contactsLabel = Ti.UI.createLabel({
				text: L('contacts_title'),
				color: 'white',
				height: 22,
				top: 8,
				left: 65,
				width: Ti.Platform.displayCaps.platformWidth-65-65,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica-Bold'}
			});
			contactsBar.add(contactsWindow.contactsLabel);

			var doneButton = Ti.UI.createButton({
				top: 4,
				left: 5,
				height: 30,
				width: 60,
				backgroundImage: mh.util.getBackgroundImage('/images/btn_done.png'),
				title: L('contacts_btn_back'),
				font: { fontSize: 12, fontFamily: 'Helvetica-Bold'},
				color: mh.config.colors.navButton
			});
			doneButton.addEventListener('click', function() {
				mh.ui.nav.close(contactsWindow);
				resetTableView();
				delete options.term;
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
				backgroundImage: mh.util.getBackgroundImage('images/Search_Band.png'),
				barColor: 'transparent',
				showCancel:false,
				hint: L('contacts_search_hint'),
				left: 0,
				top:-5,
				height: 35,
				zIndex: 50,
				keyboardType:Titanium.UI.KEYBOARD_DEFAULT
			});
			search.addEventListener('change', searchOnChange);
			
			var timeout;
			search.addEventListener('change', function() {
				if (timeout) { clearTimeout(timeout); }
				if (this.value.length === 0) {
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
				search.animate({duration: 250, top: 40});
			}, 500);
		};
		
		var createTableView = function() {		
			
			var bottomView = Ti.UI.createView({
				top:Ti.Platform.displayCaps.platformHeight,
				height: Ti.Platform.displayCaps.platformHeight-40-35-10,
				width: Ti.Platform.displayCaps.platformWidth
			});
			contactsWindow.add(bottomView);
			
			var startReloadCallback = function() {
				resetTableView();
				onGetMore();
			};
			
			tableView = mh.ui.components.createPullTableView({
				top: 0,
				left: 0,
				height: bottomView.height-36 //tabbar
			}, startReloadCallback);
			bottomView.add(tableView);
						
			tableView.addEventListener('nearbottom', function(e) {
				onGetMore();
			});
			
			tabbedBar = Ti.UI.iOS.createTabbedBar({
				labels:[L('contacts_my_contacts'), L('contacts_my_completed'), L('contacts_my_unassigned')],
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
				bottomView.animate({duration: 250, top: 40+35});
			}, 500);
			
			changeTab(0, true);
		};
		
		var ids = []; // id's of people in table to avoid duplicates
		var loadingData = false; // True when loading remote data
		var hasLastContact = false; // True when last contact has been feteched
		
		var options = {
			start: 0,
			limit: 15,
			successCallback: function(e){ onContactFetch(e); },
			errorCallback: function(e){ onContactFetchError(e); },
			fresh: true
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
				if (tableView.reloading === true) { 
					tableView.endReload();
				}
				indicator.hide();
				prevXhr.abort();
			}
			
			indicator.show();
			debug("options hash:" + JSON.stringify(options));
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
			
			var noresults = false;
			if (options.start === 0 && e.length === 0) {
				tableView.data = [];
				noresults = true;
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
			
			if (noresults) {
				var row = Ti.UI.createTableViewRow();
				if (curTab == 0) {
					row.add(Ti.UI.createLabel({
						text: 'No Assigned Contacts',
						textAlign: 'center'
					}));
				} else if (curTab == 1) {
					row.add(Ti.UI.createLabel({
						text: 'No Completed Assigned Contacts',
						textAlign: 'center'
					}));
				} else if (curTab == 2) {
					row.add(Ti.UI.createLabel({
						text: 'No Unassigned Contacts',
						textAlign: 'center'
					}));
				}
				tableView.data =[row];
			}
			
			if (tableView.reloading === true) { 
				tableView.endReload();
			}
			
			indicator.hide();
			loadingData = false;
		};
		
		var onContactFetchError = function(e) {
			debug('mh.ui.window.contacts.onContactsFetchError');
			
			if (tableView.reloading === true) { 
				tableView.endReload();
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
				font: { fontSize: 18, fontFamily: 'Helvetica' }
			});
			row.add(name);
			
			var status = Ti.UI.createLabel({
				color: 'black',
				text: L('contacts_status_'+person.status),
				top: 30,
				left: 60,
				height: 20,
				width: Ti.Platform.displayCaps.platformWidth - 60,
				font: { fontSize: 13, fontFamily: 'Helvetica' }
			});
			row.add(status);
			
			row.person = person;
			
			var touched = false;
			var longclick = false;
			row.addEventListener('click', function(e)	{
			    touched = false;
			    if (!longclick) {
					tableViewClick(row);
				} else {
					longclick = false;
				}
			});
			row.addEventListener('touchstart', function(e) {
			    touched = true;
			    setTimeout(function(){
			        if (touched) {
						longclick = true;
						tableViewLongClick(row);
			        } else {
						longclick = false;
			        }
			        touched = false;
			    },800);
			});
			row.addEventListener('touchmove', function(e){
			    touched = false;
			});
			row.addEventListener('touchend', function(e){
			    touched = false;
			});
			
			return row;
		};
		
		var tableViewClick = function(row) {
			if (row.person) {
				mh.ui.contact.window.open(row.person);
			}
		};
		
		var tableViewLongClick = function(row) {
			if (mh.app.hasRole("admin") && row.person.organizational_roles) {
				var contactRole = 'contact';
				for (var index in row.person.organizational_roles) {
					var role = row.person.organizational_roles[index];
					if (role.org_id == mh.app.getOrganizationID()) {
						if (role.role == 'admin') {
							contactRole = 'admin';
						} else if (role.role == 'leader') {
							contactRole = 'leader';
							
						} else if (role.role == 'contact') {
							contactRole = 'contact';
						}
						break;
					}
				}
				
				var options = {
				    title: L('contacts_actions'),
				    cancel:1
				};
				
				var callbackOpts = {
					org_id:mh.app.getOrganizationID(),
					errorCallback: function(e) {
						indicator.hide();
					},
					successCallback: function(e) {
						indicator.hide();
						resetTableView();
						onGetMore(true);
					}
				};
				
				if (contactRole == 'contact') {
					options.options = [L('contacts_promote_to_leader'),L('cancel')];
					var dialog = Titanium.UI.createOptionDialog(options);
					dialog.show();
					dialog.addEventListener('click', function(e){
						if (e.index == 0) {
							indicator.show();
							mh.api.changeRole(row.person.id, "leader", callbackOpts);
						}
					});
				} else if (contactRole == 'leader') {
					options.options = [L('contacts_demote_to_contact'),L('cancel')];
					var dialog = Titanium.UI.createOptionDialog(options);
					dialog.show();
					dialog.addEventListener('click', function(e){
						if (e.index == 0) {
							indicator.show();
							mh.api.changeRole(row.person.id, "contact", callbackOpts);
						}
					});
				}
			}
		};
		
		var curTab = 0;
		var changeTab = function(index, force) {
			addOption('org_id', mh.app.getOrganizationID());
			if (index !== curTab || force) {
				curTab = index;
				resetTableView();
				switch (index) {
					case 0:	addOption('assigned_to_id', mh.app.getPerson().id);
							addFilter('status', 'not_finished');
							contactsWindow.contactsLabel.text = L('contacts_title_my');
							break;
					case 1: addOption('assigned_to_id', mh.app.getPerson().id);
							addFilter('status', 'finished');
							contactsWindow.contactsLabel.text = L('contacts_title_completed');
							break;
					case 2: addOption('assigned_to_id', 'none');
							removeFilter('status');
							contactsWindow.contactsLabel.text = L('contacts_title_unassigned');
							break;
				}
				if (index == 0) {
					if (!Ti.App.Properties.hasProperty('guide_contacts')) {
						mh.ui.alert({
							buttonNames: [L('alert_btn_close'), L('alert_btn_dont_show')],
							title: L('guide_contacts'),
							message: L('guide_contacts_msg'),
							onClick: function(e) {
								if (e.index === 1) {
									Ti.App.Properties.setBool('guide_contacts', true);
								}
							}
						});
					}
				}
				if (index == 2) {
					if (!Ti.App.Properties.hasProperty('guide_contacts_unassigned')) {
						mh.ui.alert({
							buttonNames: [L('alert_btn_close'), L('alert_btn_dont_show')],
							title: L('guide_contacts_unassigned'),
							message: L('guide_contacts_unassigned_msg'),
							onClick: function(e) {
								if (e.index === 1) {
									Ti.App.Properties.setBool('guide_contacts_unassigned', true);
								}
							}
						});
					}
				}
				onGetMore(force);
			}
		};
		
		var addOption = function(name, value) {
			options[name] = value;
		};
		
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
		};
		
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
