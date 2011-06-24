(function() {
	
	mh.config = {
		oauth_url: 'http://hub.ccci.us/oauth',
		oauth_client_id: '4',
		oauth_client_secret: 'a0f7de3c353d69c61d4c8a94b338c073d09ebd381bcb4a3b304c59cf4b15bfd5',
		oauth_scope: 'userinfo,contacts,contact_assignment,followup_comments',
		api_url: 'http://hub.ccci.us/api/v1',
		
		// oauth_url: 'http://test.ccci.us:8881/oauth',
		// oauth_client_id: '4',
		// oauth_client_secret: 'a0f7de3c353d69c61d4c8a94b338c073d09ebd381bcb4a3b304c59cf4b15bfd5',
		// oauth_scope: 'userinfo,contacts,contact_assignment,followup_comments',
		// api_url: 'http://test.ccci.us:8881/api/v1',
		
		cache: {
			disable: false,
			cache_expiration_interval: 60
		}
	};
	
})();

Ti.include('/mh/config/colors.js');
