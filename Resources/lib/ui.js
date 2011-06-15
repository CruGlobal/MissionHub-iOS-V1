MH.UI = {};

Ti.include('/windows/contacts.js');
Ti.include('/windows/profile.js');

/* Create the background window */
/* Keeps the app open during login process */
MH.UI.backWindow =Ti.UI.createWindow({
	backgroundColor: '#555',
	titleid:'app',
	exitOnClose: true,
	fullscreen: false
});

MH.UI.activityIndicator;

MH.UI.initGUI = function() {
	var button = Ti.UI.createButton({
		titleid:'login',
		width: '80%',
		height: '100'
		});
	
	button.addEventListener('click', function(e) {
		MH.OAuth.prepareAccessToken();
	});
	
	if (Titanium.Platform.osname != 'android') {
	    MH.UI.activityIndicator = Titanium.UI.createActivityIndicator({
	    	top:0,
	    	left: 0,
	    	height: 50,
    		width:Titanium.Platform.displayCaps.platformWidth,
    		style: Titanium.UI.iPhone.ActivityIndicatorStyle.BIG
    	});
    } else {
    	MH.UI.activityIndicator = Titanium.UI.createActivityIndicator({
	        message: Ti.Locale.getString('loading')
	    });
    }
    MH.UI.backWindow.add(MH.UI.activityIndicator);
	MH.UI.backWindow.add(button);
	MH.UI.backWindow.open();
}

MH.UI.androidContactsMenu = null;
MH.UI.androidProfileMenu = null;
MH.UI.winContacts = null;
MH.UI.winProfile = null;


/* Create the main TabGroup window */
MH.UI.main = null;
MH.UI.openMain = function() {
	MH.UI.main = Ti.UI.createTabGroup({
		backgroundColor: '#000000',
		exitOnClose: true,
		allowUserCustomization: false,
		editButtonTitle: false
	});
	
	MH.UI.winContacts = createContactsWindow();
	var tab_contacts = Titanium.UI.createTab({
		icon: 'images/contacts.png',
	    titleid:'controls_title_contacts',
	    window:MH.UI.winContacts
	});
	if (isAndroid) {
		MH.UI.winContacts.activity.onCreateOptionsMenu = function(e) {
		    MH.UI.androidContactsMenu = e.menu;
		    var refreshMenuItem =  MH.UI.androidContactsMenu.add({
				itemId : 1,
				order : 1,
				title : 'Refresh'
			});
			refreshMenuItem.addEventListener('click', function(e){
				Ti.App.fireEvent('refresh_contacts');
			});
		};
	}
	MH.UI.main.addTab(tab_contacts);
	
	MH.UI.winProfile = createProfileWindow();
	var tab_profile = Titanium.UI.createTab({
		icon: 'images/profile.png',
	    titleid:'controls_title_profile',
	    window:MH.UI.winProfile
	});
	if (isAndroid) {
		MH.UI.winProfile.activity.onCreateOptionsMenu = function(e) {
		    MH.UI.androidProfileMenu = e.menu;
		};
	}
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