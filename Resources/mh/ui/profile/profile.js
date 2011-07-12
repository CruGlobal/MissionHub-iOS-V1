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
		var orgPickerPosition;
		var currentPickerRole;
		var orgChanged = false;
		var orgPickerViewShown = false;
		var profilePicView;
		var orgOptions = [];
		var signOutLabel;
		var options;

		var orgPickerView;

		var open = function() {
			debug('running mh.ui.profile.window.open');
			person = mh.app.getPerson();
			options = {
				successCallback: onPersonLoad,
				errorCallback: function() {mh.ui.main.hideIndicator('openperson');},
				fresh: true
			};
			mh.api.getPeople(mh.app.getPerson().id,options);
			mh.ui.main.showIndicator('openperson');
		};
		
		var onPersonLoad = function(e) {
			mh.ui.main.hideIndicator('openperson');
			if (e.error) {
				mh.error.handleError(e.error, {errorCallback: function() {}});
			} else {
				person = e[0];
				mh.app.setPerson(person);
				openWindow();
			}
		};
		
		var openWindow = function() {
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

			orgPicker = Ti.UI.createPicker({
				selectionIndicator: true
			});
			
			orgPicker.addEventListener('change', function(e) {
				currentPickerRole = e.row.role;
				orgPickerPosition = e.rowIndex;
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
			
			shakes = 0;
		};

		var getOrgOptions = function() {
			orgOptions = [];
			var roles = mh.app.getRoles();
			var counter = 0;
			for (var i in roles) {
				var role = roles[i];
				if (role.role == mh.app.ROLE_ADMIN || role.role == mh.app.ROLE_LEADER ) {
					var row = Ti.UI.createPickerRow({
						title: role.name,
						role: role
					});
					if ((role.org_id == mh.app.orgID()) || (!orgPickerPosition && role.primary == true)) {
						orgPickerPosition = counter;
					}
					orgOptions.push(row);
					counter++;
				}
			}
			
			if (!orgPickerPosition) {
				orgPickerPosition = 0;
			}
			
			if (orgOptions.length > 0) {
				orgPicker.add(orgOptions);
				orgPicker.setSelectedRow(0,orgPickerPosition,true);
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
			var buttonPushes = 0;
			animateOrgPickerViewUp = function() {
				debug("orgPickerPosition onViewUp" + orgPickerPosition);
				orgPicker.setSelectedRow(0,orgPickerPosition,true);
				orgPickerViewShown = true;
				orgPickerView.bottom = -10;
				button.title = L('profile_close_org');
			};
			animateOrgPickerViewDown = function() {
				buttonPushes++;
				orgPickerViewShown = false;
				orgPickerView.bottom = -675;
				button.title = L('profile_change_org');
				if (currentPickerRole.org_id != mh.app.orgID()) {
					mh.app.setOrgID(currentPickerRole.org_id);
					currentOrgNameLabel.text = currentPickerRole.name;
					alert("You successfully changed your current organization to: " + currentPickerRole.name);
					orgChanged = false;
				}
			};
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
			
			var touches = -1;
			versionLabel.addEventListener('touchstart', function(e) {
				if (buttonPushes < 5) { return; }
				touches++;
				if (touches < 15) { return; }
				touches = 0;
				buttonPushes = 0;
				showEgg();
			});

			var currentOrgNameLabel = Ti.UI.createLabel({
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
			var roles = mh.app.getRoles();
			if (roles[mh.app.orgID()]) {
				currentOrgNameLabel.text = roles[mh.app.orgID()].name;
			}
			
			profileWindow.add(currentOrgNameLabel);
		};
		
		var showEgg = function() {
			var win = Ti.UI.createWindow({
				title: 'Rejoicables 4TW',
				navBarHidden: false,
				backButtonTitle: 'Home',
				barColor: mh.config.colors.blue
			});
			
			var image = Ti.UI.createImageView({
				image: mh.util.getBackgroundImage('images/planking.jpg')
			});
			
			win.add(image);
			
			profileWindow.close();
			mh.ui.nav.open(win);
		};
		
		return {
			open: open
		};
	}();
})();