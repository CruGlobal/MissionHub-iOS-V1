/*!
 * MissionHub Base UI
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Creates Base UI Methods and Includes UI Files
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Wed, 29 Jun 2011 14:29:42 -0400
 */

(function() {

	mh.ui = {};
	
	mh.ui.alert = function(options) {
		var buttonNames = [L('alert_btn_ok')];
		if (options.buttonNames) {
			buttonNames = options.buttonNames;
		}
		
		var alert = Titanium.UI.createAlertDialog({
			title: options.title,
			message: options.message,
			buttonNames: buttonNames
		});
		
		if (options.onClick) {
			alert.addEventListener('click', options.onClick);
		}
		alert.show();
	};
	
	mh.ui.openLink = function(options) {
		if (!options.title) {
			options.title = L('alert_openlink_title');
		}
		if (!options.message) {
			options.message = L('alert_openlink_message');
		}
		options.buttonNames = [L('alert_btn_ok'), L('alert_btn_cancel')];
		options.onClick = function(e) {
				if (e.index === 0) {
					Ti.Platform.openURL(options.url);
				}
		};
		mh.ui.alert(options);
	};
	
	mh.ui.nav = null;
	
})();

Ti.include('/mh/ui/components/components.js');
Ti.include('/mh/ui/contact/contact.js');
Ti.include('/mh/ui/contacts/contacts.js');
Ti.include('/mh/ui/login/login.js');
Ti.include('/mh/ui/main/main.js');
Ti.include('/mh/ui/profile/profile.js');
Ti.include('/mh/ui/surveys/surveys.js');
