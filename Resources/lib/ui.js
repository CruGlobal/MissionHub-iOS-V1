MH.UI = {};

//Ti.include('/lib/tab.js');
//Ti.include('/lib/tabbedbar.js');
Ti.include('/windows/contacts.js');
Ti.include('/windows/profile.js');

/* Create the background window */
/* Keeps the app open during login process */
MH.UI.backWindow =Ti.UI.createWindow({
	backgroundColor: '#000000',
	titleid:'app',
	exitOnClose: true,
	fullscreen: false
});

MH.UI.initGUI = function() {
	var button = Ti.UI.createButton({
		titleid:'login',
		width: '80%',
		height: '100'
		});
	
	button.addEventListener('click', function(e) {
		MH.OAuth.prepareAccessToken();
	})
	MH.UI.backWindow.add(button);
	MH.UI.backWindow.open();
}

/* Create the main TabGroup window */
MH.UI.main = null;
MH.UI.openMain = function() {
	MH.UI.main = Ti.UI.createTabGroup({
		backgroundColor: '#000000',
		exitOnClose: true,
		allowUserCustomization: false,
		editButtonTitle: false
	});
	
	var win_tab_contacts = createContactsWindow();
	var tab_contacts = Titanium.UI.createTab({
		icon: 'images/contacts.png',
	    titleid:'controls_title_contacts',
	    window:win_tab_contacts
	});
	MH.UI.main.addTab(tab_contacts);
	
	var win_tab_profile = createProfileWindow();
	var tab_profile = Titanium.UI.createTab({
		icon: 'images/profile.png',
	    titleid:'controls_title_profile',
	    window:win_tab_profile
	});
	MH.UI.main.addTab(tab_profile);
	MH.UI.main.open();
}


/* 
	Developed by Kevin L. Hopkins (http://kevin.h-pk-ns.com)
	You may borrow, steal, use this in any way you feel necessary but please
	leave attribution to me as the source.  If you feel especially grateful,
	give me a linkback from your blog, a shoutout @Devneck on Twitter, or 
	my company profile @ http://wearefound.com.

/* Expects parameters of the directory name you wish to save it under, the url of the remote image, 
   and the Image View Object its being assigned to. */
MH.UI.createCachedImageView = function(imageDirectoryName, url, imageViewObject)
{
	// Grab the filename
	var filename = url.split('/');
	filename = filename[filename.length - 1];
	// Try and get the file that has been previously cached
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);
	
	if (file.exists()) {
		// If it has been cached, assign the local asset path to the image view object.
		imageViewObject.image = file.nativePath;
	} else {
		// If it hasn't been cached, grab the directory it will be stored in.
		var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName);
		if (!g.exists()) {
			// If the directory doesn't exist, make it
			g.createDirectory();
		};
		
		// Create the HTTP client to download the asset.
		var xhr = Ti.Network.createHTTPClient();
		
		xhr.onload = function() {
			if (xhr.status == 200) {
				// On successful load, take that image file we tried to grab before and 
				// save the remote image data to it.
				file.write(xhr.responseData);
				// Assign the local asset path to the image view object.
				imageViewObject.image = file.nativePath;
			};
		};
		
		// Issuing a GET request to the remote URL
		xhr.open('GET', url);
		// Finally, sending the request out.
		xhr.send();
	};
};