/*!
 * MissionHub Contacts
 * http://hub.ccci.us
 *
 * Copyright 2011, Campus Crusade for Christ International
 * 
 * Description: Contacts Window
 * Author: Chris Roemmich <chris.roemmich@cojourners.com>
 * Date: Sun, 19 Jun 2011 12:18:42 -0400
 */

Ti.include('/include/includes.js');
var w = Ti.UI.currentWindow;

(function(){ /* Activity Indicator */
	w.indicator = null;
	if (android) {
		w.indicator = Ti.UI.createActivityIndicator({
			messageid: 'loading',
			type: 1,
			location: 0
		});
		w.add(w.indicator);
	} else {
		w.indicator = Titanium.UI.createActivityIndicator();
	    w.setRightNavButton(w.indicator);
	}
})();

var tabbar = Titanium.UI.createView({
	top:0,
	left:0,
	height: 40,
	backgroundColor: Colors.ctbBg,
});

/* In-Progress Contacts */
var tab1 = Titanium.UI.createView({
	left: 0,
	width: Titanium.Platform.displayCaps.platformWidth/3,
	focusable: true,
	backgroundColor: Colors.ctbBg,
	backgroundFocusedColor: Colors.ctbItmBgFoc,
	backgroundSelectedColor: Colors.ctbItmBgSel,
});
var tab1label = Titanium.UI.createLabel({
	textid: 'controls_title_inprogress',
	textAlign: 'center',
	color: Colors.ctbTxt,
	font: {fontSize:15, fontFamily: 'ArialRoundedMTBold'}
})
tab1.add(tab1label);
tabbar.add(tab1);

/* Completed Contacts */
var tab2 = Titanium.UI.createView({
	left: Titanium.Platform.displayCaps.platformWidth/3,
	width: Titanium.Platform.displayCaps.platformWidth/3,
	focusable: true,
	backgroundColor: Colors.ctbBg,
	backgroundFocusedColor: Colors.ctbItmBgFoc,
	backgroundSelectedColor: Colors.ctbItmBgSel,
});
var tab2label = Titanium.UI.createLabel({
	textid: 'controls_title_completed',
	textAlign: 'center',
	color: Colors.ctbTxt,
	font: {fontSize:15, fontFamily: 'ArialRoundedMTBold'}
})
tab2.add(tab2label);
tabbar.add(tab2);

/* Unassigned Contacts */
var tab3 = Titanium.UI.createView({
	left: (Titanium.Platform.displayCaps.platformWidth/3) * 2,
	width: Titanium.Platform.displayCaps.platformWidth/3,
	focusable: true,
	backgroundColor: Colors.ctbBg,
	backgroundFocusedColor: Colors.ctbItmBgFoc,
	backgroundSelectedColor: Colors.ctbItmBgSel,
});
var tab3label = Titanium.UI.createLabel({
	textid: 'controls_title_unassigned',
	textAlign: 'center',
	color: Colors.ctbTxt,
	font: {fontSize:15, fontFamily: 'ArialRoundedMTBold'}
})
tab3.add(tab3label);
tabbar.add(tab3);

var border = Titanium.UI.createView({
	bottom: 0,
	height: 2,
	backgroundColor: Colors.ctbBorder
})
tabbar.add(border);

/* Includes create views for each tab */
Ti.include('/windows/contacts_inprogress.js');
Ti.include('/windows/contacts_completed.js');
Ti.include('/windows/contacts_unassigned.js');

tab1.addEventListener('click', function(e){
	currentContactsTab = 0;
	w.fireEvent('click_contacts_inprogress');
	tab1.backgroundColor = Colors.ctbItmBgActive;
	tab1.children[0].color = Colors.ctbTxtActive;
	tab2.backgroundColor = Colors.ctbItmBg;
	tab2.children[0].color = Colors.ctbTxt;
	tab3.backgroundColor = Colors.ctbItmBg;
	tab3.children[0].color = Colors.ctbTxt;
	inprogress.show();
	completed.hide();
	unassigned.hide();
});

tab2.addEventListener('click', function(e){
	currentContactsTab = 1;
	w.fireEvent('click_contacts_completed');
	tab1.backgroundColor = Colors.ctbItmBg;
	tab1.children[0].color = Colors.ctbTxt;
	tab2.backgroundColor = Colors.ctbItmBgActive;
	tab2.children[0].color = Colors.ctbTxtActive;
	tab3.backgroundColor = Colors.ctbItmBg;
	tab3.children[0].color = Colors.ctbTxt;
	inprogress.hide();
	completed.show();
	unassigned.hide();
});

tab3.addEventListener('click', function(e){
	currentContactsTab = 2;
	w.fireEvent('click_contacts_unassigned');
	tab1.backgroundColor = Colors.ctbItmBg;
	tab1.children[0].color = Colors.ctbTxt;
	tab2.backgroundColor = Colors.ctbItmBg;
	tab2.children[0].color = Colors.ctbTxt;
	tab3.backgroundColor = Colors.ctbItmBgActive;
	tab3.children[0].color = Colors.ctbTxtActive;
	inprogress.hide();
	completed.hide();
	unassigned.show();
});

w.add(tabbar);
w.add(inprogress);
w.add(completed);
w.add(unassigned);

tab1.fireEvent('click', {});