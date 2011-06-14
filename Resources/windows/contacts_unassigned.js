var win3 = Titanium.UI.createView({
    backgroundColor: '#333',
    visible: false,
    top: 40,
});

loading_unassigned = false;

Ti.App.addEventListener("load_contacts_unassigned", function(e) {
	loading_unassigned = true;	
});

Ti.App.addEventListener("load_contacts_unassigned_complete", function(e) {
	loading_unassigned = false;
});