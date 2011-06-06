// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

Titanium.include("url_utils.js");
Titanium.include("network_status.js");
Titanium.include("oauth2.js");

if (Titanium.Network.online) {
	// create tab group
	var tabGroup = Titanium.UI.createTabGroup();
	
	//
	// create base UI tab and root window
	//
	var win1 = Titanium.UI.createWindow({  
	    title:'Tab 1',
	    backgroundColor:'#fff'
	});
	var tab1 = Titanium.UI.createTab({  
	    icon:'KS_nav_views.png',
	    title:'Tab 1',
	    window:win1
	});
	
	var label1 = Titanium.UI.createLabel({
		color:'#999',
		text:Ti.Locale.getString("tab1_content"),
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		textAlign:'center',
		width:'auto'
	});
	
	win1.add(label1);
	
	//
	// create controls tab and root window
	//
	var win2 = Titanium.UI.createWindow({  
	    title:'Tab 2',
	    backgroundColor:'#fff'
	});
	var tab2 = Titanium.UI.createTab({  
	    icon:'KS_nav_ui.png',
	    title:'Tab 2',
	    window:win2
	});
	
	var label2 = Titanium.UI.createLabel({
		color:'#999',
		text:Ti.Locale.getString("tab2_content"),
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		textAlign:'center',
		width:'auto'
	});
	
	win2.add(label2);
	
	//
	//  add tabs
	//
	tabGroup.addTab(tab1);  
	tabGroup.addTab(tab2);  
	
	
	// open tab group
	tabGroup.open();
} else {
	offlineNotification();
}

var oauth2 = new OAuth2();
oauth2.displayAuthDialog();
