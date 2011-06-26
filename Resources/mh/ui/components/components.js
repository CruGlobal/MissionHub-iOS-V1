(function(){
	
	mh.ui.components = {};
	
	mh.ui.components.PullTableView = function(_params, reloadStartCallback) {
		
		var tableView = Ti.UI.createTableView(_params);
		
		var lastY = 0;
		tableView.addEventListener('scroll', function(e) {
			var y = e.contentOffset.y;		
			if (y > lastY && y >= 0) {
				var height = e.size.height;
				var cHeight = e.contentSize.height;
				if (y > cHeight-(2*height)) {
					tableView.fireEvent('nearbottom', e);
				}
			}
			if (e.contentOffset.y < 0) {
				lastY = 0;
			} else {
				lastY = e.contentOffset.y;
			}
		});
		
		var border = Ti.UI.createView({
			backgroundColor:"#576c89",
			height:2,
			bottom:0
		});
		var tableHeader = Ti.UI.createView({
			backgroundColor:"#e2e7ed",
			width:320,
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
			textid: 'tableview_pull_to_reload',
			left:55,
			width:200,
			bottom:30,
			height:"auto",
			color:"#576c89",
			textAlign:"center",
			font:{fontSize:13,fontWeight:"bold"},
			shadowColor:"#999",
			shadowOffset:{x:0,y:1}
		});
		var lastUpdatedLabel = Ti.UI.createLabel({
			text: L('tableview_last_updated') + ': ' + mh.util.formatedNow(),
			left:55,
			width:200,
			bottom:15,
			height:"auto",
			color:"#576c89",
			textAlign:"center",
			font:{fontSize:12},
			shadowColor:"#999",
			shadowOffset:{x:0,y:1}
		});
		
		var actInd = Titanium.UI.createActivityIndicator({
			left:20,
			bottom:13,
			width:30,
			height:30
		});
		tableHeader.add(arrow);
		tableHeader.add(statusLabel);
		tableHeader.add(lastUpdatedLabel);
		tableHeader.add(actInd);
		tableView.headerPullView = tableHeader;
		
		var pulling = false;
				
		tableView.updateLastUpdated = function() {
			lastUpdatedLabel.text = L('tableview_last_updated') + ': ' + mh.util.formatedNow();
		};
		
		tableView.startReload = function() {
			tableView.reloading = true;
			reloadStartCallback();
		};
		
		tableView.endReload = function() {
			tableView.reloading = false;
			tableView.setContentInsets({top:0},{animated:true});
			lastUpdatedLabel.text = L('tableview_last_updated') + ': ' + mh.util.formatedNow();
			statusLabel.text = L('tableview_pull_down_to_reload');
			actInd.hide();
			arrow.show();
		};
		
		tableView.addEventListener('scroll',function(e) {
			var offset = e.contentOffset.y;
			if (offset <= -65.0 && !pulling) {
				var t = Ti.UI.create2DMatrix();
				t = t.rotate(-180);
				pulling = true;
				arrow.animate({transform:t,duration:180});
				statusLabel.text = L('tableview_release_to_reload');
			} else if (pulling && offset > -65.0 && offset < 0) {
				pulling = false;
				var t = Ti.UI.create2DMatrix();
				arrow.animate({transform:t,duration:180});
				statusLabel.text = L('tableview_pull_down_to_reload');
			}
		});
		
		tableView.addEventListener('scrollEnd',function(e) {
			if (pulling && !tableView.reloading && e.contentOffset.y <= -65.0) {
				reloading = true;
				pulling = false;
				arrow.hide();
				actInd.show();
				statusLabel.text = L('tableview_reloading');
				tableView.setContentInsets({top:60},{animated:true});
				arrow.transform=Ti.UI.create2DMatrix();
				tableView.startReload();
			}
		});
		
		return tableView;
	};
	
	mh.ui.components.createPullTableView = function(_params) {
		return new mh.ui.components.PullTableView(_params);
	};
	
	mh.ui.components.MagicImage = function(_params) {
		var v = Ti.UI.createView(_params); v.height = 0; v.width = 0;
		var curImage = 1;
		var img1 = Ti.UI.createView({top: 0, left: 0}); img1.height = 0; img1.width = 0;
		var img2 = Ti.UI.createView({top: 0, left: 0}); img2.height = 0; img2.width = 0; img2.opacity = 0;
		v.add(img1);
		v.add(img2);
		var i = '';
		
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
			
			if (!e.fireEvent) {
				img1.backgroundImage = i;
				img1.width = v.width; img1.height = v.height;
				Ti.API.info("here");
			} else {
				if (curImage === 1) {
					curImage = 2;
					img2.backgroundImage = i;
					img2.width = v.width; img2.height = v.height;
					img1.animate({opacity: 0, duration: 500});
					img2.animate({opacity: 1, duration: 500});
					Ti.API.info("here1");
				} else {
					curImage = 1;
					img1.backgroundImage = i;
					img1.width = v.width; img1.height = v.height;
					img2.animate({opacity: 0, duration: 500});
					img1.animate({opacity: 1, duration: 500});
					Ti.API.info("here2");
				}
			}
			
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
		
		v.setImage = function(e) {
			TI.API.info('set image');
			//_params.image = imageUrl;
			//setup();
		};
		
		v.defineImage = function(e) {
			_params.image = e;
			setup();
			Ti.API.info(e);
		};
		
		
		return v;
	};
	
	mh.ui.components.createMagicImage = function(_params) {
		return new mh.ui.components.MagicImage(_params);
	};
	
})();
