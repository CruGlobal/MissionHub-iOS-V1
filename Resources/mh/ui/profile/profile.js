/*!
 * MissionHub Profile
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Shows logged in person profile and allows changing org
 * Author: Matt Webb <matt.webb@cojourners.com>
 * Date: Wed, 29 Jun 2011 14:29:42 -0400
 */

(function() {

	mh.ui.profile = {};

	mh.ui.profile.window = function() {

		var person;
		var profileWindow;
		var orgPicker;
		var button;
		var animateOrgPickerViewUp;
		var animateOrgPickerViewDown;
		var currentPickerOrgID;
		var orgPickerPosition = 0;
		var currentPickerOrgName;
		var orgChanged = false;
		var initialOrgID;
		var orgPickerViewShown = false;
		var profilePicView;
		var orgOptions = [];
		var signOutLabel;
		var options;
		var nonDefaultOrg;

		var orgPickerView;

		var open = function() {
			debug('running mh.ui.profile.window.open');
			
			person = mh.app.getPerson();
			
			options = {		
				successCallback: function(e) {
					var response = mh.util.makeValid(e);
					if (response.error) {
						profileWindow.close();
						mh.error.handleError(response.error, {errorCallback: function() {}});
					} else {
						person = e[0];
						mh.app.setPerson(person);
						if (mh.app.orgID() !== null) {
							currentPickerOrgID = mh.app.orgID();
						} else {
							currentPickerOrgID = person.request_org_id;
						}
					}
				},
				errorCallback: function(e) {
					profileWindow.close();
					var response = mh.util.makeValid(e);
					mh.error.handleError(response.error, {errorCallback: function() {}});
				},
				fresh: true,
				org_id: mh.app.orgID()
			};

			mh.api.getPeople(mh.app.getPerson().id,options);
			profileWindow = Ti.UI.createWindow({
				backgroundImage: mh.util.getBackgroundImage('images/MH_Background.png'),
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth,
				left: -(Ti.Platform.displayCaps.platformWidth)
			});

			orgPickerView = Titanium.UI.createView({
				backgroundColor: 'transparent',
				height:230,
				width: Ti.Platform.displayCaps.platformWidth,
				bottom: -675,
				zindex: 101
			});

			orgPicker = Ti.UI.createPicker();
			orgPicker.selectionIndicator = true;

			orgPicker.addEventListener('change', function(e) {
				debug("onChange : " + JSON.stringify(e));
				//Ti.API.info("You selected row: "+e.row+", column: "+e.column+", custom_item: "+e.row.org_id);
				currentPickerOrgID = e.row.org_id;
				currentPickerOrgName = e.row.title;
				if (e.row.org_id != initialOrgID) {
					orgChanged = true;
					orgPickerPosition = e.row.index;
				}

			});
			
			getOrgOptions();
			createHeader();

			profileWindow.add(button);
			profileWindow.add(profilePicView);
			profileWindow.add(orgPickerView);
			profileWindow.add(signOutLabel);
			profileWindow.open();
			profileWindow.animate({
				duration: 250,
				left: 0
			});
		};
		//draw the picker with vars

		var getOrgOptions = function() {
			var roles = mh.app.getRoles();
			var counter = 0;

			for (var org in roles) {
				if (roles[org].role == mh.app.ROLE_ADMIN || roles[org].role == mh.app.ROLE_LEADER ) {
					if (nonDefaultOrg && (roles[org].org_id == mh.app.orgID())) {
						orgPickerPosition = counter;
						currentPickerOrgName = roles[org].name;
					} else {
						if (roles[org].primary === true && !nonDefaultOrg) {
							orgPickerPosition = counter;
							currentPickerOrgName = roles[org].name;
						}
					}
					orgOptions[counter] = Ti.UI.createPickerRow({
						title: roles[org].name,
						org_id: roles[org].org_id,
						index: counter
					});
					counter++;
				}
			}
			updateOrgPicker();
		};
		var updateOrgPicker = function() {
			if (orgOptions.length > 0) {
				orgPicker.add(orgOptions);
			}
			orgPickerView.add(orgPicker);
		};
		var createHeader = function() {

			var defaultImage = '/images/facebook_question.gif';

			if (person.gender && person.gender == 'female') {
				defaultImage = '/images/facebook_female.gif';
			} else if (person.gender && person.gender == 'male') {
				defaultImage = '/images/facebook_male.gif';
			}

			var image = defaultImage;
			if (person.picture) {
				image = person.picture+'?type=large';
			}

			signOutLabel = Ti.UI.createLabel({
				top: 10,
				left: 9,
				height: 31,
				width: 'auto',
				color: mh.config.colors.blue,
				textAlign: 'left',
				font: {
					fontSize: 11,
					fontFamily: 'Helvetica-Bold'
				},
				text: L('main_sign_out')
			});

			signOutLabel.addEventListener('click', function(e) {
				var animation = Ti.UI.createAnimation({
					duration: 250,
					left: -(Ti.Platform.displayCaps.platformWidth)
				});
				mh.auth.oauth.logout( function() {
					animation.addEventListener('complete', function() {
						profileWindow.close();
					});
					profileWindow.animate(animation);
					mh.ui.main.window.refresh();
				});
			});
			profilePicView = Ti.UI.createView({
				width: Ti.Platform.displayCaps.platformWidth,
				height: 160,
				top: 50,
				backgroundColor: 'transparent'
			});

			profilePicView.image = mh.ui.components.createMagicImage({
				image: image,
				defaultImage: defaultImage,
				top: 0,
				left: 8,
				maxHeight: 150,
				maxWidth: 110,
				borderWidth: 3,
				borderRadius: 5,
				borderColor: '#000'
			});

			profilePicView.image.addEventListener('MagicImage:updated', function(e) {
				profilePicView.image.animate({
					top: (profilePicView.height-e.height)/2,
					duration: 500
				});
			});
			profilePicView.add(profilePicView.image);

			profilePicView.name = Ti.UI.createLabel({
				height: 44,
				width: Ti.Platform.displayCaps.platformWidth-131-10,
				top: (profilePicView.height-44)/2 - 30,
				left: 131,
				text: person.name,
				color: 'white',
				shadowColor: '#333',
				shadowOffset: {
					x: -1,
					y:2
				},
				font: {
					fontSize:20,
					fontFamily: 'ArialRoundedMTBold'
				}
			});
			profilePicView.add(profilePicView.name);

			debug('running mh.ui.profile.window.createHeader1');

			var profileBar = Ti.UI.createView({
				top: 10,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				zindex: 60,
				backgroundImage: mh.util.getBackgroundImage('images/MH_Nav_Bar.png')
			});
			
			profileWindow.add(profileBar);

			debug('running mh.ui.profile.window.createHeader2');

			button = Ti.UI.createButton({
				backgroundImage: mh.util.getBackgroundImage('images/status_button.png'),
				font: {
					fontSize: 14,
					fontFamily: 'Helvetica-Bold'
				},
				title:L('profile_change_org'),
				top:230,
				width:240,
				height:30
			});

			debug('running mh.ui.profile.window.createHeader3');

			button.addEventListener('click', function(e) {
				if (orgPickerViewShown) {
					animateOrgPickerViewDown();
				} else {
					animateOrgPickerViewUp();
				}
			});
			debug('running mh.ui.profile.window.createHeader4');
			animateOrgPickerViewUp = function() {
				debug("orgPickerPosition onViewUp" + orgPickerPosition);
				orgPicker.setSelectedRow(0,orgPickerPosition,true);
				orgPickerViewShown = true;
				orgPickerView.bottom = -10;
				orgChanged = false;
				button.title = L('profile_close_org');

				if(mh.app.orgID != person.request_org_id) {
					nonDefaultOrg = true;
				}

				if (mh.app.orgID != null) {
					initialOrgID = mh.app.orgID();
				} else {
					initialOrgID = person.request_org_id;
				}

				// orgPickerView.animate({
				// bottom: 120,
				// height: 'auto',
				// duration: 250
				// });
			}
			animateOrgPickerViewDown = function() {
				orgPickerViewShown = false;
				orgPickerView.bottom = -675;
				button.title = L('profile_change_org');
				debug("hoeuaoe" + currentPickerOrgID);
				mh.app.setOrgID(currentPickerOrgID);
				info("just set orgid = " + mh.app.orgID());
				if (orgChanged) {
					currentOrgNameLabel.text = currentPickerOrgName;
					orgPicker.setSelectedRow(0,orgPickerPosition,true);
					alert("You successfully changed your current organization to: " + currentPickerOrgName);
					orgChanged = false;
				}

				// orgPickerView.animate({
				// bottom: -675,
				// height: 'auto',
				// duration: 250
				// });
			}
			var profileLabel = Ti.UI.createLabel({
				text: L('profile_title'),
				color: 'white',
				height: 22,
				top: 8,
				left: 65,
				width: Ti.Platform.displayCaps.platformWidth-65-65,
				textAlign: 'center',
				zindex: 100,
				font: {
					fontSize: 20,
					fontFamily: 'Helvetica-Bold'
				}
			});
			profileBar.add(profileLabel);

			var doneButton = Ti.UI.createButton({
				top: 4,
				right: 5,
				height: 30,
				width: 60,
				zindex: 41,
				backgroundImage: mh.util.getBackgroundImage('images/btn_done.png'),
				title: L('profile_button_done'),
				font: {
					fontSize: 12,
					fontFamily: 'Helvetica-Bold'
				},
				color: mh.config.colors.navButton
			});

			doneButton.addEventListener('click', function() {
				var animation = Ti.UI.createAnimation({
					duration: 250,
					left: -(Ti.Platform.displayCaps.platformWidth)
				});
				animation.addEventListener('complete', function() {
					profileWindow.close();
				});
				profileWindow.animate(animation);
			});
			profileBar.add(doneButton);

			var versionLabel = Ti.UI.createLabel({
				text: L('profile_version') + ' ' + Ti.App.version,
				color: '#CCC',
				bottom: 5,
				textAlign: 'center',
				height: 30,
				zindex: 50,
				font: {
					fontSize: 12,
					fontFamily: 'Helvetica-Bold'
				}
			});
			profileWindow.add(versionLabel);

			var currentOrgNameLabel = Ti.UI.createLabel({
				text: currentPickerOrgName,
				backgroundColor: 'transparent',
				color: '#CCC',
				top: 125,
				left: 132,
				height: 40,
				width: 200,
				zindex: 50,
				font: {
					fontSize: 14,
					fontFamily: 'Helvetica-Bold'
				}
			});
			profileWindow.add(currentOrgNameLabel);
		};
		return {
			open: open
		};
	}();
})();