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
	mh.api.getContacts = function (options) {
		//TODO: PUT LOADING INDICATOR HERE   w.indicator.show();
		var xhr = Ti.Network.createHTTPClient();
		
		//inspect options and figure out what type of requests we want to build	
		
		//figure out and build the query parameters
		var queryParams = {};
		queryParams.limit = options.limit;
		queryParams.start = options.start;
		queryParams.access_token = 'e7c01a607441887f30467bdfe74c2bed02e464585ca62a5b8cc0207218dbfd12' //Titanium.Network.encodeURIComponent(getToken());
		
		if (options.assigned_to_id) {
			queryParams.assigned_to = options.assigned_to_id;
		}
		
		if (options.sort) {
			queryParams.sort = '';
			queryParams.direction = '';
			
			for (var x in options.sort) {
				queryParams.sort += options.sort[x].name;
				queryParams.direction += options.sort[x].direction;
				
				if (x != options.sort.length) {
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
				
				if (x != options.sort.length) {
					queryParams.filters += ',';
					queryParams.values += ',';
				}
			}
		}

		//now we actually build the query string
		var queryString = buildQueryParams(queryParams);
		
		//figure out the request URL we want to use
		var requestURL = mh.config.api_url + '/contacts.json?' + queryString;

		xhr.onload = function(e) {
			Ti.API.info(e);
			//TODO: TURN OFF LOADING INDICATOR   w.indicator.hide();
			if (validResponse(this.responseText)) {
				Ti.API.info(this.responseText);
				options.successCallback(this.responseText);
			}
		};
		
		xhr.onerror = function(e) {			
			//TODO: TURN OFF LOADING INDICATOR   w.indicator.hide();
			Ti.API.info(this.responseText);
			validResponse(this.responseText,options.errorCallback);
		};
		
		xhr.open('GET',requestURL);
		Ti.API.info(requestURL);
		
		//mh.util.stripBadCharacters
		xhr.send();
	};
	
	
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
			Ti.API.info("I have a response");
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
	function handleError(code, clickFunction, alt) {
		var hash = {};
		var error_code;
		var message;
		
		hash.onClick = clickFunction;
		
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
})();

//Ti.include(
//	'/mh/api/cache.js'
//);
