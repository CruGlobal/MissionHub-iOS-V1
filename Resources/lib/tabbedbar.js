MH.UI.TabbedBar= {};

MH.UI.TabbedBar = function(_params) {
	this.view = Ti.UI.createView(_params);
	
	this.view.tabs = new Array();
	
	if (_params.tabspacing) {
		this.view.tabspacing = _params.tabspacing;
	} else {
		this.view.tabspacing = 0;
	}
	
	/* Functions */
	this.view.redraw = MH.UI.TabbedBar.prototype.redraw;
	this.view.addTab = MH.UI.TabbedBar.prototype.addTab;
	this.view.removeTab = MH.UI.TabbedBar.prototype.removeTab;
	
	return this.view;
}

MH.UI.TabbedBar.prototype.addTab = function(tab) {
	var tabs = this.tabs;
	tabs.push(tab);
	this.tabs = tabs;
	this.redraw();
}

MH.UI.TabbedBar.prototype.removeTab = function(tab) {
	var tabs = this.tabs;
	var index = -1;
	for (var i = 0; i < tabs.length; i++) {
		if (tabs[i].id == tab.id) {
			index = i;
			break;
		}
	}
	if (index>=0) {
		tabs.splice(index, 1);
		this.tabs = tabs;
		this.remove(tab);
		tab.remove
		this.redraw();
	}
}

MH.UI.TabbedBar.prototype.redraw = function() {
	var tabs = this.tabs;
	var curleft = 0;
	
	for (var index in tabs) {
		var tab = tabs[index];
		if (index == 0) {
			tab.left = 0;
		} else {
			tab.left = this.tabspacing + curleft;
		}
		curleft = tab.width + tab.left;
	}
	
	this.add(tab);
}