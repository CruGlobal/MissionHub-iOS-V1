MH.UI.Tab = function(_params) {
	var defaultParams = {
		backgroundColor:'#333',
		borderRadius:2,
		focusable: true
	};
	this.view = Ti.UI.createView(MH.Utils.mergeJSON(defaultParams, _params));
	
	var defaultParams = {
		textAlign: 'center',
		color: 'white',
		font: {fontSize:15}
	};
	
	this.view.labelparams = MH.Utils.mergeJSON(defaultParams, _params.labelparams);
	
	this.view.label = null;
	
	/* For Object Comparison */
	MH.UI.Tab.numTabs++;
	this.view.id = MH.UI.Tab.numTabs;
	
	/* Functions */
	this.view.redraw = MH.UI.Tab.redraw;

	this.view.redraw();
	
	return this.view;
}

MH.UI.Tab.numTabs = 0;

MH.UI.Tab.redraw = function() {
	if(this.label) {
		this.remove(this.label);
	}
	
	var label = Ti.UI.createLabel(this.labelparams);
	this.add(label);
	label.window = this.view.window;
	this.label = label;
}