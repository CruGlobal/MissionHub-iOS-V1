var inprogress = Titanium.UI.createView({
    backgroundColor: '#333',
    visible: true,
    top: 40,
});

loadingInprogress = false;

Ti.App.addEventListener("load_contacts_inprogress", function(e) {
	loadingInprogress = true;
});

Ti.App.addEventListener("load_contacts_inprogress_complete", function(e) {
	loadingInprogress = false;
});

var tableViewInprogress;
var dataInprogress = [];