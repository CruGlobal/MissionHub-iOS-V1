/*!
 * MissionHub
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: MissionHub iPhone
 * Author: Matt Webb <matt.webb@cojourners.com>
 * Date: Fri, 24 Jun 2011 23:16:47 -0400
 */

(function() {

	mh.api = {};

	//Used to pull down contact lists to populate TableViews
	// required in options object: 
	//  successCallback:   function fired when request succeeds
	//  errorCallback:     function fired when request fails
	//  start:             start parameter in the query
	//  limit:             limit # of contacts returned
	// optional:
	//  assigned_to_id:    only show contacts assigned to value of assigned_to_id
	//  sort:              array of hashes.  allowed: [ {name:  [time, status], direction: [asc, desc] } ] 
	//  filters:           array of hashes.  allowed: [ {name: [gender, status], value: [male, female, do_not_contact, uncontacted, contacted, finished, completed]} ]
	//  fresh:             boolean.  set to true if you want a fresh copy of the API call
	//  cacheSeconds:      the number of seconds until the cache'd API request expires
	mh.api.getContactsList = function (options) {
		options.cacheKey = false;  // DO NOT PASS IN A CACHEKEY
		
		var queryParams = sortFilterAssign(options);
		queryParams.access_token = mh.auth.oauth.getToken();
	
		//now we actually build the query string
		var queryString = buildQueryParams(queryParams);
		
		//figure out the request URL we want to use
		var requestURL;
		if(options.term) {
			requestURL = mh.config.api_url + '/contacts/search.json?' + queryString;
		} else {
			requestURL = mh.config.api_url + '/contacts.json?' + queryString;
		}
		
		if (!options.fresh) {
			options.cacheKey = mh.util.stripBadCharacters(requestURL);
		}
		return fireGetRequest(requestURL, options);
	};
		
		
	//Used to pull down a single or multiple full contact descriptions
	// required parameter ids -- array of person IDs OR just a single integer
	// required in options object: 
	//  successCallback:   function fired when getContacts succeeds
	//  errorCallback:     function fired when getContacts fails
	// optional:
	//  fresh:             boolean.  set to true if you want a fresh copy of the API call
	//  cacheSeconds:      the number of seconds until the cache'd API request expires
	mh.api.getContacts = function (ids, options) {
		options.cacheKey = null;  // DO NOT PASS IN A CACHEKEY
		idString = generateIDString(ids);
		var queryParams = {};
		queryParams.access_token = mh.auth.oauth.getToken();
		var queryString = buildQueryParams(queryParams);
		var requestURL = mh.config.api_url + '/contacts/' + idString + '.json?' + queryString;
		if (!options.fresh) {
			options.cacheKey = mh.util.stripBadCharacters(requestURL);
		}
		return fireGetRequest(requestURL, options);
	};
	
	//Used to pull down a single or multiple full person descriptions
	// required parameter ids -- array of person IDs OR just a single integer
	// required in options object: 
	//  successCallback:   function fired when request succeeds
	//  errorCallback:     function fired when request fails
	// optional:
	//  fresh:             boolean.  set to true if you want a fresh copy of the API call
	//  cacheSeconds:      the number of seconds until the cache'd API request expires
	mh.api.getPeople = function (ids, options) {
		options.cacheKey = null;  // DO NOT PASS IN A CACHEKEY
		
		idString = generateIDString(ids);
		var queryParams = {};
		queryParams.access_token = mh.auth.oauth.getToken();
		//now we actually build the query string
		var queryString = buildQueryParams(queryParams);

		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/people/' + idString + '.json?' + queryString;
		
		if (!options.fresh) {
			options.cacheKey = mh.util.stripBadCharacters(requestURL);
		}
		return fireGetRequest(requestURL, options);
	};
	
	
	//Used to pull down followup comments for a person
	// required parameter id -- integer (personID)
	// required in options object: 
	//  successCallback:   function fired when request succeeds
	//  errorCallback:     function fired when request fails
	// optional:
	//  fresh:             boolean.  set to true if you want a fresh copy of the API call
	//  cacheSeconds:      the number of seconds until the cache'd API request expires
	mh.api.getFollowupComments = function (id, options) {
		options.cacheKey = null;  // DO NOT PASS IN A CACHEKEY
		
		var queryParams = {};
		queryParams.access_token = mh.auth.oauth.getToken();
		//now we actually build the query string
		var queryString = buildQueryParams(queryParams);

		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/followup_comments/' + id + '.json?' + queryString;
		
		if (!options.fresh) {
			options.cacheKey = mh.util.stripBadCharacters(requestURL);
		}
		return fireGetRequest(requestURL, options);
	};
	
	
	//mh.api.postFollowupComment -- Post a followup comment to a person's contact card
	// required data object:
	//  var data = {
	//   	followup_comment: {
	// 			organization_id: integer,
	// 			contact_id: integer,
	// 			commenter_id: integer,
	// 			status: string,
	// 			comment: value from comment box,
	// 			},
	// 		rejoicables: ['spiritual_conversation','prayed_to_receive','gospel_presentation']};  any of the three options shown in arary
	// required in options object: 
	//  successCallback:   function fired when request succeeds
	//  errorCallback:     function fired when request fails
	mh.api.postFollowupComment = function (data, options) {
		realData = { json: JSON.stringify(data) };
		realData.access_token = mh.auth.oauth.getToken();
		var requestURL = mh.config.api_url + '/followup_comments.json';
		return firePostRequest(requestURL, options, realData);
	};


	//mh.api.createContactAssignment -- assign a person to a contact for followup 
	//NOTE: deletes all other assignments to that contact
	// required data object:
	//  var data = {
	//   	ids: integer OR array,
	//		assign_to: integer,
	//		org_id: integer };
	// required in options object: 
	//  successCallback:   function fired when request succeeds
	//  errorCallback:     function fired when request fails
	mh.api.createContactAssignment = function (data, options) {
		data.access_token = mh.auth.oauth.getToken();
		var requestURL = mh.config.api_url + '/contact_assignments/';
		return firePostRequest(requestURL, options, data);
	};


	//mh.api.deleteContactAssignment -- remove a contact assignment from a person 
	// required in options object: 
	//  successCallback:   function fired when request succeeds
	//  errorCallback:     function fired when request fails
	mh.api.deleteContactAssignment = function (id, options) {
		var data = {};
		data['_method'] = 'delete';
		var requestURL = mh.config.api_url + '/contact_assignments/' + id + '.json?access_token=' + mh.auth.oauth.getToken();
		return firePostRequest(requestURL, options, data);
	};
	
	//mh.api.deleteComment -- remove a comment 
	// required in options object: 
	//  successCallback:   function fired when request succeeds
	//  errorCallback:     function fired when request fails
	mh.api.deleteComment = function (id, options) {
		var data = {};
		data['_method'] = 'delete';
		var requestURL = mh.config.api_url + '/followup_comments/' + id + '.json?access_token=' + mh.auth.oauth.getToken();
		return firePostRequest(requestURL, options, data);
	};
	
	
	function firePostRequest(requestURL, options, data) {
		//TODO: PUT LOADING INDICATOR HERE w.indicator.show();
		debug("running mh.api.firePostRequest");
		info("requestURL: " + requestURL);
				
		var xhr = Ti.Network.createHTTPClient();
		xhr.trys = 0;
	
		xhr.onload = function(e) {
			debug("in mh.api.firePostRequest.xhr.onload");
			//TODO: HALT LOADING INDICATOR HERE w.indicator.hide();
			
			if (mh.error.handleResponse(this.responseText, options)) {
				var response = mh.util.makeValid(this.responseText);
				return options.successCallback(response);
			}
		};
		
		xhr.onerror = function(e) {
			debug("whoops... in mh.api.firePostRequest.xhr.onerror");
			if (xhr.trys < 3) {
				info("retrying...");
				xhr.trys++;
				xhr.open('POST',requestURL);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.send(data);
			} else {
				debug("response: " + this.responseText);
				mh.error.handleResponse(this.responseText,options);
			}
		};
		
		xhr.open('POST',requestURL);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(data);
		return xhr;
	};
	
	function fireGetRequest(requestURL, options) {
		//TODO: PUT LOADING INDICATOR HERE   w.indicator.show();
		var xhr;
		var cacheSeconds = 11;
		if (options.cacheSeconds) {
			cacheSeconds = options.cacheSeconds;
		}

		var jsonResponse = false;

		if (options.cacheKey) {
			jsonResponse = mh.api.cache.get(options.cacheKey);
			if (jsonResponse) {
				var response = mh.util.makeValid(jsonResponse);
				if (mh.error.handleResponse(jsonResponse, options)) {
					debug("I'm using a cached response");
					xhr = false;
					return options.successCallback(response);
				}
			}
		}
		
		if (!jsonResponse) {
			xhr = Ti.Network.createHTTPClient();
			xhr.trys = 0;

			xhr.onload = function(e) {
				//TODO: TURN OFF LOADING INDICATOR   w.indicator.hide();
				if (mh.error.handleResponse(this.responseText, options)) {
					if (options.cacheKey) {
						if (options.fresh) {
							mh.api.cache.del(options.cacheKey);
						}
						info("I'm storing the cache key");
						mh.api.cache.put(options.cacheKey, this.responseText, cacheSeconds);
					}
					var response = mh.util.makeValid(this.responseText);
					debug("in onload callback" + JSON.stringify(response));
					return options.successCallback(response);
				}
			};

			xhr.onerror = function(e) {
				if (xhr.trys < 3) {
					debug("retrying...");
					xhr.trys++;
					xhr.open('GET', requestURL);
					xhr.send();
				} else {
					debug("whoops... mh.api.fireGetRequest.xhr.onerror");
					mh.error.handleResponse(this.responseText,options);
				}
			};

		xhr.open('GET', requestURL);
		info("Request:  " + requestURL);
		xhr.send();
		return xhr;
		}
	}

	function sortFilterAssign(options) {
		//inspect options and figure out what type of requests we want to build	
		//figure out and build the query parameters
		var queryParams = {};
		queryParams.limit = options.limit;
		queryParams.start = options.start;
		
		if (options.assigned_to_id) {
			queryParams.assigned_to = options.assigned_to_id;
		}
		
		if (options.sort) {
			queryParams.sort = '';
			queryParams.direction = '';
			
			for (var x in options.sort) {
				queryParams.sort += options.sort[x].name;
				queryParams.direction += options.sort[x].direction;
				
				if (x != (options.sort.length-1)) {
					queryParams.sort += ',';
					queryParams.direction += ',';
				}
			}
		}
		
		if (options.filters) {
			queryParams.filters = '';
			queryParams.values = '';
			
			for (var x in options.filters) {
				queryParams.filters += options.filters[x].name;
				queryParams.values += options.filters[x].value;
				
				if (options.sort) {
					if (x != (options.sort.length-1)) {
						queryParams.filters += ',';
						queryParams.values += ',';
					}
				}
			}
		}
		if (options.term) {
			queryParams.term = options.term;
		}

		return queryParams;
	}
	
	
	function buildQueryParams(hash) {
		var query = '';
		var numParams = hash.length;
		for (var paramName in hash) {
			query += paramName + '=' + hash[paramName] + '&';
		}
		return query;
	}
	
	
	function generateIDString(ids) {
		var idString = '';
				if (mh.util.isArray(ids)) {
			for (var x in ids) {
					idString += ids[x];				
				if (x != (ids.length-1)) {
					idString += ',';
				}
			}
		}
		else {
			idString = ids;
		}
		return idString;
	}
})();

Ti.include(
	'/mh/api/cache.js'
);