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
		queryParams.access_token = 'e7c01a607441887f30467bdfe74c2bed02e464585ca62a5b8cc0207218dbfd12'; //Titanium.Network.encodeURIComponent(getToken());
	
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
		queryParams.access_token = 'e7c01a607441887f30467bdfe74c2bed02e464585ca62a5b8cc0207218dbfd12'; //Titanium.Network.encodeURIComponent(getToken());
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
		queryParams.access_token = 'e7c01a607441887f30467bdfe74c2bed02e464585ca62a5b8cc0207218dbfd12'; //Titanium.Network.encodeURIComponent(getToken());
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
		
		data.access_token = 'e7c01a607441887f30467bdfe74c2bed02e464585ca62a5b8cc0207218dbfd12'; //Titanium.Network.encodeURIComponent(getToken());
		
		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/followup_comments.json?' + queryString;
		
		firePostRequest(requestURL, options, data);
	};
	

	
	function firePostRequest(requestURL, options, data) {
		//TODO: PUT LOADING INDICATOR HERE w.indicator.show();
	
		var xhr = Ti.Network.createHTTPClient();
	
		xhr.onload = function(e) {
			//TODO: HALT LOADING INDICATOR HERE w.indicator.hide();
			var response = mh.util.makeValid(this.responseText);
			if (response.error || !response) {
				handleError('',options.errorCallback, response.error)
			} 
			else {
				return response;
			}
		};
		
		xhr.onerror = function(e) {
			//TODO: HALT LOADING INDICATOR HERE w.indicator.hide();
			Ti.API.info("whoops... in xhr.onerror");
			if (validResponse(this.responseText,options.errorCallback) || !this.responseText) {
				if (!Ti.Network.online) {
					return handleError('', options.errorCallback, 'no_network');
				}
				else {
					return handleError('', options.errorCallback, 'no_data');
				}
			}
			// var response = ui.util.makeValid(this.responseText);
			// if (response.error) {
				// Ti.API.info(response.error);
				// handleError('',options.errorCallback, response.error)
			// }
		xhr.open('POST',requestURL);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(data);
		};
	};
	function fireGetRequest(requestURL, options) {
		//TODO: PUT LOADING INDICATOR HERE   w.indicator.show();
		
		var cacheSeconds = 11;
		if (options.cacheSeconds) {
			cacheSeconds = options.cacheSeconds;
		}
		
		var jsonResponse = false;
		
		if (options.cacheKey) {
			jsonResponse = mh.api.cache.get(options.cacheKey);
			if (validResponse(jsonResponse, options.errorCallback)) {
				Ti.API.info("I'm using a cached response");
				return options.successCallback(jsonResponse);
			}
		}
		
		if (!jsonResponse) {
			
			var xhr = Ti.Network.createHTTPClient();

			xhr.onload = function(e) {
				//TODO: TURN OFF LOADING INDICATOR   w.indicator.hide();
				if (validResponse(this.responseText, options.errorCallback)) {
					if (options.cacheKey) {
						if (options.fresh) {
							mh.api.cache.del(options.cacheKey);
						}
						Ti.API.info("I'm storing the cache key");
						mh.api.cache.put(options.cacheKey, this.responseText, cacheSeconds);
					}
					Ti.API.info("I made a request!");
					return options.successCallback(this.responseText);
				}
			};
		
			xhr.onerror = function(e) {
				//TODO: TURN OFF LOADING INDICATOR   w.indicator.hide();
				Ti.API.info("whoops... in xhr.onerror");
				if (validResponse(this.responseText,options.errorCallback) || !this.responseText) {
					if (!Ti.Network.online) {
						return handleError('', options.errorCallback, 'no_network');
					}
					else {
						return handleError('', options.errorCallback, 'no_data');
					}
				}
			};

		xhr.open('GET',requestURL);
		Ti.API.info("Request:  "  + requestURL);
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


	//Pass in an XHR response to validate and a callback function to execute if response is not valid
	//OPTIONAL: alternate code to lookup in i18n file
	function validResponse(response, callback, alt) {
		if (response) {
			if (mh.util.validJSON(response)) {
				var data = JSON.parse(response);
				if (data.error) {
					handleError(data.error, callback, alt);
				} else {
					return true;
				}
			}
		}
		return false;
	}
	
	
	//Pass in an error JSON object (has code & message attributes), a function to call when OK is hit on the error window.
	//OPTIONAL:  alt -- alternate code to look up in Locale i18n file
	function handleError(code, callback, alt) {
		var hash = {};
		var error_code='';
		var message;
		
		hash.onClick = callback;
		
		if (code.code) {
			error_code = code.code;
			message = code.message;
		}
		
		if (alt) {
			hash.title = L('error_'+error_code, L('error_'+alt));
			hash.message = L('error_'+error_code+'_msg', L('error_'+alt+'_msg'));
		} else {
			hash.title =  L('error_'+error_code, L('error_unknown'));
			hash.message = L('error_'+error_code+'_msg', message);
		}
		mh.ui.alert(hash);
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