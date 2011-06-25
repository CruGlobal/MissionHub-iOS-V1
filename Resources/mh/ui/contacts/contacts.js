(function(){
	
	mh.ui.contacts = {};
	
	mh.ui.contacts.window = function() {
		
		var contactsWindow, tabbedBar, tableView, indicator;
		
		var open = function() {
			debug('running mh.ui.contacts.window.open');
			contactsWindow = Ti.UI.createWindow({
				backgroundImage: 'images/bg.png',
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth,
				left: Ti.Platform.displayCaps.platformWidth
			});
			
			createHeader();
			createSearchFilters();
			createTableView();
			
			contactsWindow.open();
			contactsWindow.animate({duration: 250, left: 0});
		};

		var createHeader = function() {
			debug('running mh.ui.contacts.window.createHeader');
			var contactsBar = Ti.UI.createView({
				top: 10,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: '/images/navbar_bg.png',
				zIndex: 99
			});
			contactsWindow.add(contactsBar);
			
			var contactsLabel = Ti.UI.createLabel({
				text: L('contacts_title'),
				color: 'white',
				height: 22,
				top: 8,
				left: 65,
				width: Ti.Platform.displayCaps.platformWidth-65-65,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			contactsBar.add(contactsLabel);

			var doneButton = Ti.UI.createButton({
				top: 4,
				left: 5,
				height: 30,
				width: 60,
				backgroundImage: '/images/btn_done.png',
				title: L('contacts_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica Neue', fontWeight: 'Bold' }
			});
			doneButton.addEventListener('click', function() {
				var animation = Ti.UI.createAnimation({duration: 250, left: Ti.Platform.displayCaps.platformWidth});
				animation.addEventListener('complete', function() {
					contactsWindow.close();
				});
				contactsWindow.animate(animation);
				mh.ui.main.window.show();
			});
			contactsBar.add(doneButton);
						
			indicator = Ti.UI.createActivityIndicator({
				right: 10,
				top: 9,
				style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
				width: 'auto',
				height: 'auto'
			});
			contactsBar.add(indicator);
		};
		
		var processes = [];
	
		var showIndicator = function(process) {
			processes.push(process);
			indicator.show();
		};
		
		var hideIndicator = function(process) {
			var idx = processes.indexOf(process);
			if(idx!=-1) { processes.splice(idx, 1); }
			if (processes.length <= 0) {
				indicator.hide();
			}
		};
		
		var createSearchFilters = function() {
			var search = Titanium.UI.createSearchBar({
				barColor:'#333',
				showCancel:false,
				hintText:'search',
				right: 35,
				top:5,
				height: 35,
				zIndex: 50
			});
			search.addEventListener('change', searchOnChange);
			
			contactsWindow.add(search);
			
			setTimeout(function() {
				search.animate({duration: 250, top: 50});
			}, 1000);
		};
		
		var searchOnChange = function(e) {
			
		};
		
		var createTableView = function() {		
			
			var bottomView = Ti.UI.createView({
				top:Ti.Platform.displayCaps.platformHeight,
				height: Ti.Platform.displayCaps.platformHeight-40-35-10,
				width: Ti.Platform.displayCaps.platformWidth
			});
			contactsWindow.add(bottomView);

			function formatDate() {
				var date = new Date();
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
			
			tableView = Ti.UI.createTableView({
				top: 0,
				left: 0,
				height: bottomView.height-36 //tabbar
			});
			
			bottomView.add(tableView);
			
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
				text:"Pull to reload",
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
				text:"Last Updated: "+formatDate(),
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
			var reloading = false;
			
			function beginReloading() {
				// just mock out the reload
				setTimeout(endReloading,2000);
			}
			
			function endReloading() {
				// when you're done, just reset
				tableView.setContentInsets({top:0},{animated:true});
				reloading = false;
				lastUpdatedLabel.text = "Last Updated: "+formatDate();
				statusLabel.text = "Pull down to refresh...";
				actInd.hide();
				arrow.show();
			}
			
			tableView.addEventListener('scroll',function(e) {
				var offset = e.contentOffset.y;
				if (offset <= -65.0 && !pulling) {
					var t = Ti.UI.create2DMatrix();
					t = t.rotate(-180);
					pulling = true;
					arrow.animate({transform:t,duration:180});
					statusLabel.text = "Release to refresh...";
				} else if (pulling && offset > -65.0 && offset < 0) {
					pulling = false;
					var t = Ti.UI.create2DMatrix();
					arrow.animate({transform:t,duration:180});
					statusLabel.text = "Pull down to refresh...";
				}
			});
			
			tableView.addEventListener('scrollEnd',function(e) {
				if (pulling && !reloading && e.contentOffset.y <= -65.0) {
					reloading = true;
					pulling = false;
					arrow.hide();
					actInd.show();
					statusLabel.text = "Reloading...";
					tableView.setContentInsets({top:60},{animated:true});
					arrow.transform=Ti.UI.create2DMatrix();
					beginReloading();
				}
			});
			
			tabbedBar = Ti.UI.createTabbedBar({
				labels:['My Contacts', 'Completed', 'Unassigned'],
				backgroundColor:'#333',
			    top:tableView.height,
			    height:30,
			    style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
			    width:Ti.Platform.displayCaps.platformWidth,
			    index: 0
			});
			bottomView.add(tabbedBar);
			
			tabbedBar.addEventListener('click', function(e) {
				handleBarClick(e.index);
			});
			
			setTimeout(function() {
				bottomView.animate({duration: 250, top: 40+35+10});
			}, 1000);
			
			loadDefaultData();
		};
		
		var loadDefaultData = function() {
			
		};
		
		var handleBarClick = function(index) {
			
		};
		
		return {
			open: open
		};
	}();
	
})();
