var win2 = Titanium.UI.createView({
    backgroundColor: '#333',
    visible: false,
    top: 40,
});

loading_completed = false;

Ti.App.addEventListener("load_contacts_completed", function(e) {
	loading_completed = true;
});

Ti.App.addEventListener("load_contacts_completed_complete", function(e) {
	loading_completed = false;
});