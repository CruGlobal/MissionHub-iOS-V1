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
UI.createCachedFBImageView = function(imageDirectoryName, url, imageViewObject, filename, type) {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);
	
	if (file.exists()) {
		if (type == "img") {
			imageViewObject.image = file.nativePath;
		} else {
			imageViewObject.backgroundImage = file.nativePath;
		}
	} else {
		var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName);
		if (!g.exists()) {
			g.createDirectory();
		};
		var xhr = Ti.Network.createHTTPClient();
		xhr.trys = 0;
		
		xhr.onload = function(e) {
			if (xhr.status == 200) {
				file.write(xhr.responseData);
				if (type == "img") {
					imageViewObject.image = file.nativePath;
				} else {
					imageViewObject.backgroundImage = file.nativePath;
				}
			};
		};
		xhr.onerror = function(e) {
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

/**
 * MagicImage Scaler/Downloader/Cacher
 */
UI.MagicImage = function(_params) {
	var v = Ti.UI.createView(_params);
	var i = '';
	v.height = 0;
	v.width = 0;
	
	// Cache expiration
	if (!_params.expire) {
		_params.expire = 60*60*24; // 1 day
	}
	
	// Update the View Image and Size
	v.update = function(e) {
		// Calculate the image dimensions	
		var tmpimg = Ti.UI.createImageView({
			width: 'auto',
			height: 'auto',
			image: i
		});
		var img = tmpimg.toImage();
		var dimensions = {height: img.height, width: img.width};
		tmpimg = null;
		img = null;
		
		var wRatio = dimensions.width/v.maxWidth;
		var hRadio = dimensions.height/v.maxHeight;
		
		if (wRatio > hRadio) {
			v.width = v.maxWidth;
			v.height = Math.round(v.maxWidth * (dimensions.height / dimensions.width));
		} else {
			v.height = v.maxHeight;
			v.width = Math.round(v.maxHeight * (dimensions.width / dimensions.height));
		}
		
		//Update the image at the end to avoid flash
		v.backgroundImage = i;
		// Fire custom event
		if (e.fireEvent) {
			v.loaded = true;
			v.fireEvent('MagicImage:updated', {height: v.height, width: v.width, image: i});	
		}
	};
	v.addEventListener('MagicImage:update', v.update);
	
	function setup() {
		v.loaded = false;
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		if (regexp.test(_params.image)) {
			// If File Is Remote
			var filename = _params.image.toString().replace(/[^A-Za-z0-9_\.]/g,"");
			var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'img_cache', filename);
			
			// Keep Cache Fresh
			if (file.exists()) {
				var date = new Date(file.modificationTimestamp());
				date = date.getTime();
				var now = new Date();
				now = now.getTime();
				if (date+(_params.expire) < now) {
					file.deleteFile();
				}
			}
			
			if (file.exists()) {
				// Display Cached File
				i = file.nativePath;
				v.fireEvent('MagicImage:update', {fireEvent: true});
			} else {
				// Fetch Remote Image
				if (_params.defaultImage) {
					i = _params.defaultImage;
					v.fireEvent('MagicImage:update', {fireEvent: false});
				}
				
				var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'img_cache');
				if (!g.exists()) {
					g.createDirectory();
				}
				var xhr = Ti.Network.createHTTPClient({
					timeout: 5000
				});
				xhr.trys = 0;
				xhr.onload = function(e) {
					if (xhr.status == 200) {
						file.write(xhr.responseData);
						i = file.nativePath;
						v.fireEvent('MagicImage:update', {fireEvent: true});
					} else {
						xhr.onerror(e);
					}
				};
				xhr.onerror = function(e) {
					xhr.trys++;
					if (xhr.trys < 3) {
						xhr.open('GET', _params.image);
						xhr.send();
					}
				};
				xhr.open('GET', _params.image);
				xhr.send();
			}
		} else {
			i = _params.image;
			v.fireEvent('MagicImage:update', {fireEvent: true});
		}
	}
	
	setup();
	
	v.setImage = function(img) {
		_params.image = img;
		setup();
	};
	
	return v;
};

/**
 * Creates a MagicImage View
 */
UI.createMagicImage = function(_params) {
	return new UI.MagicImage(_params);
};

/** 
 * Creates a DropDown View
 */

UI.createDropDown = function(_params) {
	return new UI.DropDown(_params);
};

/* Static Var For Number of DropDowns */
UI.dropdowns = 0;

/**
 * DropDown View Creator
 */
UI.DropDown = function(_params) {
	UI.dropdowns++;
	_params.backgroundColor = 'transparent';
	_params.scalesPageToFit = false;
	
	var v = Ti.UI.createWebView(_params);	
	v.id = UI.dropdowns;
	
	if (_params.options) {
		v.options = _params.options;
	} else {
		v.options = [];
	}
	v.selected = _params.selected;
	
	Ti.App.addEventListener('uidd_'+v.id+'_change', function(e){
		v.selected = e.value;
		v.value = v.options[v.selected];
		v.fireEvent('selection', {selected: v.selected, value: v.value});
	});
	v.g = "";
	v.generate = function() {
		if (v.options.length > 0) {
			v.value = v.options[0];
		}
		v.g = '<html><head><meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0"/></head><body style="padding:0px;margin:0px;">';
		v.g += '<select id="uidd_'+v.id+'" name="uidd_'+v.id+'" style="padding:0px;margin:0px;'+_params.style+'">';
		for (var i = 0; i < v.options.length; i++) { 
			if (i == v.selected) {
				v.value = v.options[i];
				v.g += '<option value="'+i+'" selected="selected">'+v.options[i]+'</option>';
			} else {
				v.g += '<option value="'+i+'">'+v.options[i]+'</option>';
			}
		}
		v.g += '</select>';
		v.g += "<script type='text/javascript'>";
		v.g += 'document.getElementById("uidd_'+v.id+'").onchange = function(){ Titanium.App.fireEvent("uidd_'+v.id+'_change",{value:this.value}); };';
		v.g += 'document.ontouchmove = function(event){ event.preventDefault(); }';
		v.g += "</script>";
		v.g += '</body></html>';
		v.html = v.g;
	};
	v.getSelection = function() {
		return v.selected;
	};
	v.getValue = function() {
		return v.value;
	};
	v.generate();
	return v;
};