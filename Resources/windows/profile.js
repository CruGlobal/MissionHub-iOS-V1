createProfileWindow = function() {
	var win = Titanium.UI.createWindow({
	    titleid:'win_title_profile'
	});
	
	var person = JSON.parse(Ti.App.Properties.getString("person", "{}"));
	
	var name = Ti.UI.createLabel({
		text: person.name,
		height: 40,
		color: '#fff',
		top: 0,
		left: 0,
		width: Titanium.Platform.displayCaps.platformWidth,
		textAlign: 'center'
	})
	win.add(name);
	
	
	var img = Ti.UI.createImageView({
		image: '/images/default_contact.jpg',
		top: 50,
		width: 50,
		height: 50
	});
	MH.UI.createCachedImageView('contact', person.picture+"?type=square", img);
	win.add(img);
	
	
	return win;
}