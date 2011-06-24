/*!
 * MissionHub
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 *
 * Description: Application Loader
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Thu, 16 Jun 2011 12:48:32 -0400
 */

Ti.include('/mh/mh.js');

options = {
	limit: 15,
	start: 0,
	sort: [{
		name: 'time',
		direction: 'desc'
	}],
	successCallback: function(e) {
		Ti.API.info("SUCCESS!!");
		Ti.API.info("successCallback response: " + JSON.stringify(e));
	},
	errorCallback: function(e) {
		Ti.API.info("FAILURE!!!" + e);
	}
};

var options3 = {
	fresh: true,
	successCallback: function(e) {
		Ti.API.info("SUCCESS!!  with refresh");
		Ti.API.info("successCallback response: " + JSON.stringify(e));
	},
	errorCallback: function(e) {
		Ti.API.info("FAILURE!!!  3");
	}
};

//mh.api.getContactsList(options);
//mh.api.getContacts([1282204,244771],options3);
mh.api.getPeople(['me',244771],options3);
	var data = {
		followup_comment: {
			organization_id: 1825,
			contact_id: 1282204,
			commenter_id: 1282204,
			status: 'do_not_contact',
			comment:'testing comment!',
		},
		rejoicables: ['spiritual_conversation']
	};
	
mh.api.postFollowupComment(data, options);

mh.ui.main.window.open();