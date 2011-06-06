/*
 * Displays an unclosable window when a network connection is lost.
 * 
 * The user is able to close the app or wait
 * until the network becomes available again.
 *
 * 2011 C. Roemmich
 *  
 */

var offline_notification = false;

Titanium.Network.addEventListener('change', function(e)
{
	if (!e.online) {
		offlineNotification();
	} else {
		offline_notification = false;
	}
});

function offlineNotification() {
	if (!offline_notification) {
		offline_notification = true;
		var options = {
				//modal:true,
				height:0,
				width:0,
				backgroundColor:'#336699',
				bottom:0,
				right:0
			};
		if (Ti.Platform.name == 'android') {
			options.navBarHidden = true;
		}
		var w = Titanium.UI.createWindow(options);
		var a = Titanium.UI.createAnimation();
	
		// NOTE: good example of making dynamic platform height / width values
		// iPad vs. iPhone vs Android etc.
		a.height = Titanium.Platform.displayCaps.platformHeight;
		a.width = Titanium.Platform.displayCaps.platformWidth;
		a.duration = 300;
	
		// create a button to close window
		var b = Titanium.UI.createButton({
			title:'Close',
			height:30,
			width:150
		});
		w.add(b);
		b.addEventListener('click', function()
		{
			a.height = 0;
			a.width = 0;
			w.close(a);
		});
	
		w.addEventListener('android:back',function(e)
		{
		    
		});
	
		w.open(a);
	}
}