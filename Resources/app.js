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


// 
// 
// //Ti.App.Properties.removeProperty('access_token');
// //Ti.App.Properties.setString('access_token', 'dd8eed36840c5111e0895ac3b6c131b36df088e1ff4c8347348d80d10d943364');
// 
// Ti.include('/include/includes.js');
// 
// Titanium.UI.setBackgroundColor('#000');
// 
// /* Main Tab Group */
// var main = Ti.UI.createTabGroup({
	// exitOnClose: true,
	// allowUserCustomization: false,
	// editButtonTitle: false,
	// barColor: Colors.bar,
	// backgroundColor: '#000'
// });
// 
// /* Contacts Window */
// main.win_contacts = Ti.UI.createWindow({
	// titleid: 'win_title_contacts',
	// url: '/windows/contacts.js'
// });
// main.tab_contacts = Ti.UI.createTab({
	// titleid: 'tab_title_contacts',
	// window: main.win_contacts,
	// icon: '/images/contacts.png'
// });
// main.addTab(main.tab_contacts);
// 
// /* Profile Window */
// main.win_profile = Ti.UI.createWindow({
	// titleid: 'win_title_profile',
	// url: '/windows/profile.js'
// });
// main.tab_profile = Ti.UI.createTab({
	// titleid: 'tab_title_profile',
	// window: main.win_profile,
	// icon: '/images/profile.png'
// });
// main.addTab(main.tab_profile);
// 
// /** Open Login Window - Will Close on Success */
// var win_login;
// var params = {
	// titleid: 'win_title_login',
	// url: '/windows/login.js',
	// fullscreen: false,
	// barColor: Colors.bar,
	// exitOnClose: true
// };
// if (android) {
	// win_login = Ti.UI.createWindow(params);
// } else {
	// win_login = Ti.UI.createWindow(JSON.merge(params, {modal: true}));
// }
// 
// /* Listens for oauth:complete from login window */
// Ti.App.addEventListener('oauth:complete', function(e) {
	// main.open();
	// win_login.close();
// });
// 
// /* Listens for logout from profile window */
// Ti.App.addEventListener('logout', function(e) {
	// Ti.App.Properties.removeProperty('access_token');
	// Ti.App.Properties.setString('logout', true);
	// if (android) {
		// var activity = Titanium.Android.currentActivity;
		// activity.finish();
	// } else {
		// win_login.open();
		// main.close();
	// }
// });
// 
// /* Listens for profile:update from login window */
// Ti.App.addEventListener('profile:update', function(e) {
	// Ti.App.Properties.setString('person', JSON.stringify(e.person));
	// main.win_profile.fireEvent('profile:update');
// });
// 
// win_login.open();