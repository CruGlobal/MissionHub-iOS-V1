(function() {

	mh.api = {};

	//Used to pull down contact lists to populate TableViews
	// required in options object: 
	//  successCallback:   function fired when getContacts succeeds
	//  errorCallback:     function fired when getContacts fails
	//  start:             start parameter in the query
	//  limit:             limit # of contacts returned
	// optional:
	//  assigned_to_id:    only show contacts assigned to value of assigned_to_id
	//  sort:  						 array of hashes.  allowed: [ {name:  [time, status], direction: [asc, desc] } ] 
	//  filters:           array of hashes.  allowed: [ {name: [gender, status], value: [male, female, do_not_contact, uncontacted, contacted, finished, completed]} ]
	//  fresh:             boolean.  set to true if you want a fresh copy of the API call
	//  cacheSeconds:      the number of seconds until the cache'd API request expires
	mh.api.getContactsList = function (options) {
		options.cacheKey = false;  // DO NOT PASS IN A CACHEKEY
		
		var queryParams = sortFilterAssign(options);
		queryParams.access_token = 'c1d65450bcb7c26efcedcd41497cae4b66e2194388c8c124914499b2094ebbed';//mh.auth.oauth.getToken();
	
		//now we actually build the query string
		var queryString = buildQueryParams(queryParams);

		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/contacts.json?' + queryString;
		
		if (!options.fresh) {
			options.cacheKey = mh.util.stripBadCharacters(requestURL);
		}
		fireGetRequest(requestURL, options);
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
		
		var queryParams = {}
		queryParams.access_token = mh.auth.oauth.getToken();
		//now we actually build the query string
		var queryString = buildQueryParams(queryParams);

		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/contacts/' + idString + '.json?' + queryString;
		
		if (!options.fresh) {
			options.cacheKey = mh.util.stripBadCharacters(requestURL);
		}
		fireGetRequest(requestURL, options);
	};
	
		//Used to pull down a single or multiple full person descriptions
	// required parameter ids -- array of person IDs OR just a single integer
	// required in options object: 
	//  successCallback:   function fired when getContacts succeeds
	//  errorCallback:     function fired when getContacts fails
	// optional:
	//  fresh:             boolean.  set to true if you want a fresh copy of the API call
	//  cacheSeconds:      the number of seconds until the cache'd API request expires
	mh.api.getPeople = function (ids, options) {
		options.cacheKey = null;  // DO NOT PASS IN A CACHEKEY
		
		idString = generateIDString(ids);
		var queryParams = {}
		queryParams.access_token = mh.auth.oauth.getToken();
		//now we actually build the query string
		var queryString = buildQueryParams(queryParams);

		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/people/' + idString + '.json?' + queryString;
		
		if (!options.fresh) {
			options.cacheKey = mh.util.stripBadCharacters(requestURL);
		}
		fireGetRequest(requestURL, options);
	};
	
	// var data = {
		// followup_comment: {
			// organization_id: w.person.request_org_id,
			// contact_id: w.person.id,
			// commenter_id: JSON.parse(Ti.App.Properties.getString("person", "{}")).id,
			// status: status,
			// comment:w.comment.value,
		// },
		// rejoicables: ['spiritual_conversation']
	// };
	
	mh.api.postFollowupComment = function (data, options) {
		realData = {
			json: JSON.stringify(data)
		}
		realData.access_token = mh.auth.oauth.getToken();
		
		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/followup_comments/';
		
		firePostRequest(requestURL, options, realData);
	};
	
	mh.api.createContactAssignment = function (data, options) {

		data.access_token = mh.auth.oauth.getToken();
		
		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/contact_assignments/';
		
		firePostRequest(requestURL, options, data);
	};
	
	mh.api.deleteContactAssignment = function (id, options) {
		var data = {};
		data['_method'] = 'delete';
		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/contact_assignments/' + id + '.json?access_token=' + mh.auth.oauth.getToken();
		
		firePostRequest(requestURL, options, data);
	};
	

	
	// function firePostRequest(requestURL, options, data) {
		// //TODO: PUT LOADING INDICATOR HERE w.indicator.show();
		// info("running mh.api.firePostRequest");
		// info("requestURL: " + requestURL);
// 				
		// var xhr = Ti.Network.createHTTPClient();
// 	
		// xhr.onload = function(e) {
			// info("in mh.api.firePostRequest.xhr.onload");
			// //TODO: HALT LOADING INDICATOR HERE w.indicator.hide();
			// var response = mh.util.makeValid(this.responseText);
			// debug("response:" + JSON.stringify(response));
			// if (validResponse(response, options.errorCallback)) {
				// Ti.API.info("RESPONSE VALID & NOT WITH AN ERROR");
				// return options.successCallback(response);
			// }
		// };
// 		
		// xhr.onerror = function(e) {
			// //TODO: HALT LOADING INDICATOR HERE w.indicator.hide();
// 			
			// var response = mh.util.makeValid(this.responseText);
			// Ti.API.info("whoops... in xhr.onerror");
			// if (validResponse(response,options.errorCallback) || !this.responseText) {
				// if (!Ti.Network.online) {
					// return handleError('', options.errorCallback, 'no_network');
				// }
				// else {
					// return handleError('', options.errorCallback, 'no_data');
				// }
			// }
			// // var response = ui.util.makeValid(this.responseText);
			// // if (response.error) {
				// // Ti.API.info(response.error);
				// // handleError('',options.errorCallback, response.error)
			// // }
		// };
		// xhr.open('POST',requestURL);
		// xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		// xhr.send(data);
// 
	// };
	function fireGetRequest(requestURL, options) {
		//TODO: PUT LOADING INDICATOR HERE   w.indicator.show();
		
		var cacheSeconds = 11;
		if (options.cacheSeconds) {
			cacheSeconds = options.cacheSeconds;
		}
		
		var jsonResponse = false;
		
		if (options.cacheKey) {
			jsonResponse = mh.api.cache.get(options.cacheKey);
			var response = mh.util.makeValid(jsonResponse);
			if (mh.error.handleResponse(jsonResponse, options.errorCallback)) {
				Ti.API.info("I'm using a cached response");
				return options.successCallback(response);
			}
		}
		
		if (!jsonResponse) {
			var xhr = Ti.Network.createHTTPClient();

			xhr.onload = function(e) {
				//TODO: TURN OFF LOADING INDICATOR   w.indicator.hide();
				if (mh.error.handleResponse(this.responseText, options.errorCallback)) {
					if (options.cacheKey) {
						if (options.fresh) {
							mh.api.cache.del(options.cacheKey);
						}
						Ti.API.info("I'm storing the cache key");
						mh.api.cache.put(options.cacheKey, this.responseText, cacheSeconds);
					}
					return options.successCallback(response);
				}
			};
		
			xhr.onerror = function(e) {
				//TODO: TURN OFF LOADING INDICATOR   w.indicator.hide();
				Ti.API.info("whoops... in xhr.onerror");
				mh.error.handleResponse(this.responseText,options.errorCallback);
			};

		xhr.open('GET', requestURL);
		Ti.API.info("Request:  " + requestURL);
		xhr.send();		
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
				
				if (x != (options.sort.length-1)) {
					queryParams.filters += ',';
					queryParams.values += ',';
				}
			}
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