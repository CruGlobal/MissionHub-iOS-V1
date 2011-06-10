/*
 * Displays an unclosable window when a network connection is lost.
 * 
 * The user is able to close the app or wait
 * until the network becomes available again.
 *
 * 2011 C. Roemmich
 *  
 */

function NetworkMonitor() {
	
}

NetworkMonitor.notify_window;
NetworkMonitor.animation;

NetworkMonitor.showNotification = function() {
	if (!NetworkMonitor.notify_window) {
		var options = {
			height:0,
			width:0,
			backgroundColor:'#336699',
			bottom:0,
			right:0
		};
		if (Ti.Platform.name == 'android') {
			options.navBarHidden = true;
		}
		NetworkMonitor.notify_window = Titanium.UI.createWindow(options);
		NetworkMonitor.notify_window.addEventListener('android:back',function(e) {
		    // Do Nothing
		});
		
		//TODO: Make pretty
		var l2 = Titanium.UI.createLabel({
		    text:'No Internet',
		    height:'auto',
		    width:'auto',
		    shadowColor:'#aaa',
		    shadowOffset:{x:5,y:5},
		    color:'#900',
		    font:{fontSize:48},
		    textAlign:'center'
		});
		NetworkMonitor.notify_window.add(l2);
				
	}
	if (!NetworkMonitor.animation) {
		NetworkMonitor.animation = Titanium.UI.createAnimation();
		NetworkMonitor.animation.height = Titanium.Platform.displayCaps.platformHeight;
		NetworkMonitor.animation.width = Titanium.Platform.displayCaps.platformWidth;
		NetworkMonitor.animation.duration = 300;
	}
	NetworkMonitor.notify_window.open(NetworkMonitor.animation);
}

NetworkMonitor.hideNotification = function() {
	if (NetworkMonitor.notify_window) {
		NetworkMonitor.notify_window.close();
		NetworkMonitor.notify_window = null;
	}
}

Titanium.Network.addEventListener('change', function(e)
{
	if (!e.online) {
		NetworkMonitor.showNotification();
	} else {
		NetworkMonitor.hideNotification();
	}
});