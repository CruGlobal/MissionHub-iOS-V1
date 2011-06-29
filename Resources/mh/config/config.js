/*!
 * MissionHub Config
 * https://www.missionhub.com
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Configuration for MissionHub Mobile
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Wed, 29 Jun 2011 14:29:42 -0400
 */

(function() {
	
	mh.config = {	
		base_url: '',
		oauth_url: '',
		oauth_client_id: '',
		oauth_client_secret: '',
		oauth_scope: '',
		api_url: '',

		cache: {
			disable: false,
			cache_expiration_interval: 15
		}
	};
	
})();

Ti.include('/mh/config/colors.js');