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

mh.ui.main.window.open();

var options = {
	term: 'Matt',
	limit: 15,
	start: 0,
	sort: [{
		name: 'time',
		direction: 'desc'
	}],
	successCallback: function(e) {
		Ti.API.info("successCallback response: " + JSON.stringify(e));
	},
	errorCallback: function(e) {
		Ti.API.info("FAILURE!!!" + JSON.stringify(e));
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
	
		var data2 = {
		ids: '1282204',
		assign_to: '1282204',
		org_id: '1825'
	};
	
// var xyz;
//setTimeout(function() {mh.api.getContactsList(options)}, 5000);
//setTimeout(function() {xyz = mh.api.searchContactsList(options)}, 5000);
//info("ok, let's abort!");
//setTimeout(function() {xyz.onerror = function() {info("I'm onerroring, but new")}},5150);
//setTimeout(function() {xyz.abort()},5300)
//mh.api.getContacts([1282204,244771],options3);
//mh.api.getPeople(['me',244771],options3);
//mh.api.postFollowupComment(data, options);
//setTimeout(function() {mh.api.createContactAssignment(data2,options)},5000);
//setTimeout(function() {mh.api.deleteContactAssignment(1282204,options3)},15000);	