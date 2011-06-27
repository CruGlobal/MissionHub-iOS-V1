(function(){
	
	mh.ui.profile = {};
	
	mh.ui.profile.window = function() {

		var person;
		var profileWindow;
		var orgPicker;
		var button;
		var animateOrgPickerViewUp;
		var animateOrgPickerViewDown;
		var currentPickerOrgID;
		var currentPickerOrgName;
		var orgChanged = false;
		var initialOrgID;
		var orgPickerViewShown = false;
				
		var options = {
			successCallback: function(e) {
				info("success in calling my person");
				person = e[0];
				updateOrgPicker();
			},
			errorCallback: function(e) {
				info(e);
			},
			fresh: true
		};
		
		var orgPickerView;
		
		var open = function() {
			debug('running mh.ui.profile.window.open');
			person = mh.app.person();
			mh.api.getPeople(1282204,options);
			profileWindow = Ti.UI.createWindow({
				backgroundImage: 'images/bg.png',
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth,
				left: -(Ti.Platform.displayCaps.platformWidth)
			});
		
		orgPickerView = Titanium.UI.createView({
			backgroundColor: 'transparent',
			height:250,
			width: Ti.Platform.displayCaps.platformWidth,
			bottom: -675,
			zindex: 101
		});
		
		orgPicker = Ti.UI.createPicker();
		orgPicker.selectionIndicator = true;
		
		orgPicker.addEventListener('change', function(e) {
			Ti.API.info("You selected row: "+e.row+", column: "+e.column+", custom_item: "+e.row.org_id);
			currentPickerOrgID = e.row.org_id;
			currentPickerOrgName = e.row.title;
			if (e.row.org_id != initialOrgID) {
				orgChanged = true;
			}
		});
		
		createHeader();
		profileWindow.add(button);

		profileWindow.add(orgPickerView);
		profileWindow.open();
		profileWindow.animate({duration: 250, left: 0});
		}
		
		//draw the picker with vars

		var updateOrgPicker = function() {
			var orgOptions = [];
			var counter=0;
			for (var x = 0; x < person.organization_membership.length; x++ ) {
				if (person.organization_membership[x].role == 'admin' || person.organization_membership[x].role == 'leader') {
					info("in for loop with true if statement" + person.organization_membership[x].name);
					orgOptions[counter] = Ti.UI.createPickerRow({
						title: person.organization_membership[x].name,
						org_id: person.organization_membership[x].org_id
					});
					counter++;
				}
			}
			info(JSON.stringify(orgOptions));
			orgPicker.add(orgOptions);
			orgPickerView.add(orgPicker);
		}
		
		var createHeader = function() {
			debug('running mh.ui.profile.window.createHeader');
			var profileBar = Ti.UI.createView({
				top: 10,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				zindex: 60,
				backgroundImage: 'images/navbar_bg.png'
			});
			profileWindow.add(profileBar);

			button = Ti.UI.createButton({
				title:'Change Current Organization',
				top:84,
				width:240,
				height:30
			});
			
			button.addEventListener('click', function(e) {
				if (orgPickerViewShown) {
					animateOrgPickerViewDown();
				}
				else {
					animateOrgPickerViewUp();					
				}
			});
			
			animateOrgPickerViewUp = function() {
				orgPickerViewShown = true;
				orgPickerView.bottom = -10;
				button.title = 'Click to Close';
				if (mh.app.orgID != null) {
					initialOrgID = mh.app.orgID;
				}
				else {
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
				button.title = 'Change Current Organization';
				mh.app.setOrgID(currentPickerOrgID);
				info("just set orgid = " + currentPickerOrgID);
				if (orgChanged) {
				alert("You successfully changed your current organization to: " + currentPickerOrgName);
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
				font: { fontSize: 20, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			profileBar.add(profileLabel);
			
			var doneButton = Ti.UI.createButton({
				top: 4,
				right: 5,
				height: 30,
				width: 60,
				zindex: 41,
				backgroundImage: 'images/btn_done.png',
				title: L('profile_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica Neue', fontWeight: 'Bold' }
			});
			
			doneButton.addEventListener('click', function() {
				var animation = Ti.UI.createAnimation({duration: 250, left: -(Ti.Platform.displayCaps.platformWidth)});
				animation.addEventListener('complete', function() {
					profileWindow.close();
				});
				profileWindow.animate(animation);
			});
			profileBar.add(doneButton);

			var logoView = Ti.UI.createView({
				top: 40,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 119,
				zindex: 40,
				//backgroundImage: 'images/' + meme.app.lang() + '/profile_memeforiphone.png'
			});
			profileWindow.add(logoView);

			var versionLabel = Ti.UI.createLabel({
				text: String.format(L('profile_version'), Ti.App.version),
				color: 'white',
				top: 59,
				left: 100,
				height: 15,
				zindex: 50,
				font: { fontSize: 11, fontFamily: 'Helvetica', fontWeight: 'Light' }
			});
			logoView.add(versionLabel);
		};
		
		return {
			open: open
		};
	}();
	
})();
