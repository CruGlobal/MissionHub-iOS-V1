MH.UI = {};

Ti.include('/lib/colors.js');
Ti.include('/windows/contacts.js');
Ti.include('/windows/profile.js');

/* Create the background window */
/* Keeps the app open during login process */
MH.UI.backWindow =Ti.UI.createWindow({
	titleid:'app',
	exitOnClose: true,
	fullscreen: false,
	barColor: MH.UI.Colors.navbar
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
MH.UI.tabContacts = null;
MH.UI.tabProfile = null;

/* Create the main TabGroup window */
MH.UI.main = null;
MH.UI.openMain = function() {
	MH.UI.main = Ti.UI.createTabGroup({
		backgroundColor: '#000000',
		exitOnClose: true,
		allowUserCustomization: false,
		editButtonTitle: false
	});
	
	createContactsWindow();
	MH.UI.tabContacts = Titanium.UI.createTab({
		icon: 'images/contacts.png',
	    titleid:'controls_title_contacts',
	    window:MH.UI.winContacts
	});
	if (isAndroid()) {
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
	MH.UI.main.addTab(MH.UI.tabContacts);
	
	MH.UI.winProfile = createProfileWindow();
	MH.UI.tabProfile = Titanium.UI.createTab({
		icon: 'images/profile.png',
	    titleid:'controls_title_profile',
	    window:MH.UI.winProfile
	});
	if (isAndroid()) {
		MH.UI.winProfile.activity.onCreateOptionsMenu = function(e) {
		    MH.UI.androidProfileMenu = e.menu;
		};
	}
	MH.UI.main.addTab(MH.UI.tabProfile);
	MH.UI.main.open();
}

MH.UI.createContactWindow = function(person) {
	Ti.API.info(person);
	
	var w = Ti.UI.createWindow({
		title: person.first_name + " " + person.last_name,
		barColor: MH.UI.Colors.navbar
	});
	
	return w;
}

MH.UI.createIOSTableView = function(_params) {
	var tv = Ti.UI.createTableView(_params);
	var lastY = 0;
	
	tv.addEventListener('scroll', function(e) {
		var y = e.contentOffset.y;		
		if (y > lastY && y >= 0) {
			var height = e.size.height;
			var cHeight = e.contentSize.height;
			if (y > cHeight-(2*height)) {
				tv.fireEvent('scrolldown', e);
			}
		}
		if (e.contentOffset.y < 0) {
			lastY = 0;
		} else {
			lastY = e.contentOffset.y;
		}
	});
	
	function formatDate() {
		var date = new Date;
		var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
		if (date.getHours()>=12)
		{
			datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
		}
		else
		{
			datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
		}
		return datestr;
	}
	
	var border = Ti.UI.createView({
		backgroundColor: MH.UI.Colors.contactsPdBorder,
		height:2,
		bottom:0
	});
	var tableHeader = Ti.UI.createView({
		backgroundColor: MH.UI.Colors.contactsPdBg,
		width:Titanium.Platform.displayCaps.platformWidth,
		height:60
	});
	tableHeader.add(border);
	var arrow = Ti.UI.createView({
		backgroundImage:"/images/whiteArrow.png",
		width:23,
		height:60,
		bottom:10,
		left:20
	});
	
	var statusLabel = Ti.UI.createLabel({
		text:"Pull to reload",
		left:65,
		width:200,
		bottom:30,
		height:"auto",
		color: MH.UI.Colors.contactsPdText,
		textAlign:"center",
		font:{fontSize:13,fontWeight:"bold"},
	});
	
	var lastUpdatedLabel = Ti.UI.createLabel({
		text:"Last Updated: "+formatDate(),
		left:65,
		width:200,
		bottom:15,
		height:"auto",
		color: MH.UI.Colors.contactsPdText,
		textAlign:"center",
		font:{fontSize:12},
	});
	
	var actInd = Titanium.UI.createActivityIndicator({
		left:20,
		bottom:13,
		width:30,
		height:30
	});
	
	if (isIPad()) {
		arrow.left = arrow.left + 224;
		statusLabel.left = statusLabel.left + 224;
		lastUpdatedLabel.left = lastUpdatedLabel.left + 224;
		actInd.left = actInd.left + 224;
	};
	
	tableHeader.add(arrow);
	tableHeader.add(statusLabel);
	tableHeader.add(lastUpdatedLabel);
	tableHeader.add(actInd);
	tv.headerPullView = tableHeader;
	
	var pulling = false;
	var reloading = false;
	
	tv.addEventListener('refresh_finished', function(e) {
		tv.setContentInsets({top:0},{animated:true});
		reloading = false;
		lastUpdatedLabel.text = "Last Updated: "+formatDate();
		statusLabel.text = "Pull down to refresh...";
		actInd.hide();
		arrow.show();
	})
	
	tv.addEventListener('scroll',function(e)
	{
		var offset = e.contentOffset.y;
		if (offset <= -65.0 && !pulling)
		{
			var t = Ti.UI.create2DMatrix();
			t = t.rotate(-180);
			pulling = true;
			arrow.animate({transform:t,duration:180});
			statusLabel.text = "Release to refresh...";
		}
		else if (pulling && offset > -65.0 && offset < 0)
		{
			pulling = false;
			var t = Ti.UI.create2DMatrix();
			arrow.animate({transform:t,duration:180});
			statusLabel.text = "Pull down to refresh...";
		}
	});
	
	tv.addEventListener('scrollEnd',function(e)
	{
		if (pulling && !reloading && e.contentOffset.y <= -65.0)
		{
			reloading = true;
			pulling = false;
			arrow.hide();
			actInd.show();
			statusLabel.text = "Reloading...";
			tv.setContentInsets({top:60},{animated:true});
			arrow.transform=Ti.UI.create2DMatrix();
			Ti.App.fireEvent('refresh_contacts');
		}
	});
	
	return tv;
}

MH.UI.createAndroidTableView = function(_params) {
	var tv = Ti.UI.createTableView(_params);
	var lastindex = 0;
	
	tv.addEventListener('scroll', function(e) {
		if (e.firstVisibleItem > lastindex) {
			if (e.firstVisibleItem > e.totalItemCount-(2*e.visibleItemCount)) {
				tv.fireEvent('scrolldown', e);
			}
		}
		lastindex = e.firstVisibleItem;
	});
	
	return tv;
}

/* 
	Developed by Kevin L. Hopkins (http://kevin.h-pk-ns.com)
	You may borrow, steal, use this in any way you feel necessary but please
	leave attribution to me as the source.  If you feel especially grateful,
	give me a linkback from your blog, a shoutout @Devneck on Twitter, or 
	my company profile @ http://wearefound.com.

/* Expects parameters of the directory name you wish to save it under, the url of the remote image, 
   and the Image View Object its being assigned to. */
MH.UI.createCachedFBImageView = function(imageDirectoryName, url, imageViewObject, filename)
{
	// Try and get the file that has been previously cached
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);
	
	if (file.exists()) {
		// If it has been cached, assign the local asset path to the image view object.
		imageViewObject.backgroundImage = file.nativePath;
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
				imageViewObject.backgroundImage = file.nativePath;
			};
		};
		
		// Issuing a GET request to the remote URL
		xhr.open('GET', url);
		// Finally, sending the request out.
		xhr.send();
	};
};