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
	
})();
