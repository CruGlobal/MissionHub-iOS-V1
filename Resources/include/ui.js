/*!
 * MissionHub UI Helpers
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Custom UI classes and helpers
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Sun, 19 Jun 2011 12:18:42 -0400
 */

var UI = {};


/* 
	Developed by Kevin L. Hopkins (http://kevin.h-pk-ns.com)
	You may borrow, steal, use this in any way you feel necessary but please
	leave attribution to me as the source.  If you feel especially grateful,
	give me a linkback from your blog, a shoutout @Devneck on Twitter, or 
	my company profile @ http://wearefound.com. */

/* Expects parameters of the directory name you wish to save it under, the url of the remote image, 
   and the Image View Object its being assigned to. */
UI.createCachedFBImageView = function(imageDirectoryName, url, imageViewObject, filename) {
	Ti.API.info(imageDirectoryName + ":" + url + ":" + imageViewObject + ":" + filename);
	
	
	
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);
	
	if (file.exists()) {
		imageViewObject.backgroundImage = file.nativePath;
	} else {
		var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName);
		if (!g.exists()) {
			g.createDirectory();
		};
		
		var xhr = Ti.Network.createHTTPClient();
		xhr.trys = 0;
		
		xhr.onload = function(e) {
			Ti.API.info(e);
			
			if (xhr.status == 200) {
				file.write(xhr.responseData);
				imageViewObject.backgroundImage = file.nativePath;
			};
		};
		
		xhr.onerror = function(e) {
			
			Ti.API.error(e);
			xhr.trys++;
			if (xhr.trys < 3) {
				xhr.open('GET', url);
				xhr.send();
			}		
		};
		
		xhr.open('GET', url);
		xhr.send();
	};
};

/* Create a pull to refresh tableview for iOS with a custom scrolldown event */
UI.createIOSTableView = function(_params) {
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
		backgroundColor: Colors.ctvPdBorder,
		height:2,
		bottom:0
	});
	var tableHeader = Ti.UI.createView({
		backgroundColor: Colors.ctvPdBg,
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
		color: Colors.ctvPdTxt,
		textAlign:"center",
		font:{fontSize:13,fontWeight:"bold"},
	});
	
	var lastUpdatedLabel = Ti.UI.createLabel({
		text:"Last Updated: "+formatDate(),
		left:65,
		width:200,
		bottom:15,
		height:"auto",
		color: Colors.ctvPdTxt,
		textAlign:"center",
		font:{fontSize:12},
	});
	
	var actInd = Titanium.UI.createActivityIndicator({
		left:20,
		bottom:13,
		width:30,
		height:30
	});
	
	if (ipad) {
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

/* Create a tableview with a custom scrolldown event for Android */
UI.createAndroidTableView = function(_params) {
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