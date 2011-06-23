(function() {
	
	mh.config.colors = {};
	
	/* Primary Colors */
	mh.config.colors.blue = '#0376ac';
	mh.config.colors.lightBlue = '#e6f1f7';
	mh.config.colors.green = '#c4d76c';
	mh.config.colors.lightGray = '#f2f2f2';
	
	/* Tabs and Navbar */
	mh.config.colors.bar = mh.config.colors.blue;
	mh.config.colors.tabBg = '#000';
	mh.config.colors.tabFoc = mh.config.colors.blue;
	mh.config.colors.tabSel = mh.config.colors.blue;
	
	/* Contacts Tab Bar */
	mh.config.colors.ctbBorder = '#666';
	mh.config.colors.ctbBg = mh.config.colors.lightBlue;
	mh.config.colors.ctbItmBgFoc = mh.config.colors.green; // Android
	mh.config.colors.ctbItmBgSel = mh.config.colors.green; // Android
	mh.config.colors.ctbItmBg = mh.config.colors.lightBlue;
	mh.config.colors.ctbItmBgActive = mh.config.colors.blue;
	mh.config.colors.ctbTxt = '#000';
	mh.config.colors.ctbTxtActive = '#fff';
	
	/* Contacts Table Views */
	mh.config.colors.ctvBg = '#fff';
	mh.config.colors.ctvBgDis = '#333'; // Android
	mh.config.colors.ctvBgFoc = mh.config.colors.green; // Android
	mh.config.colors.ctvBgSel = mh.config.colors.green; // Android
	mh.config.colors.ctvSep = mh.config.colors.lightGray;
	mh.config.colors.ctvTxt = '#000';
	mh.config.colors.ctvSelStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY; // iOS
	/* iOS Pull Down */
	mh.config.colors.ctvPdBorder = mh.config.colors.lightBlue;
	mh.config.colors.ctvPdBg = mh.config.colors.lightGray;
	mh.config.colors.ctvPdTxt = mh.config.colors.blue;
	
})();