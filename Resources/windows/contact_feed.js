(function(){ /* Feed View */
	var data = [{title:"Row 1"},{title:"Row 2"},{title:"Row 2"},{title:"Row 2"},{title:"Row 2"},{title:"Row 2"},{title:"Row 2"},{title:"Row 2"},{title:"Row 2"}];
	w.fv = Titanium.UI.createTableView({
		visible: false,
		opacity: false,	
		data:data,
		scrollable: false,
		height: 600,
		backgroundColor: 'transparent',
		left: pad,
		width: Titanium.Platform.displayCaps.platformWidth - pad - pad
	});
	w.sv.add(w.fv);
})();

w.updateFeedUI = function(e) {
	w.indicator.show();
	if (e.action == 'person') {
		w.updateFeed();
	}
	
	if (e.action == 'picture') {
		w.fv.top = w.tv.height + pad + w.cv.height;
	}
	
	if (e.action == 'feed') {
		for (var index in w.followUpComments) {
			var comment = w.followUpComments[index];
			if (comment) {
				//Ti.API.info(comment);
			}
		}
		
		setTimeout(function(){
			var anim_in = Titanium.UI.createAnimation();
			anim_in.opacity=1;
			anim_in.duration = 500;
			w.fv.show();
			w.fv.animate(anim_in);
			w.indicator.hide();
		}, 100);
	}
}
w.addEventListener('updateFeedUI', w.updateFeedUI);

w.updateFeed = function() { /* Update Person */
	if (w.updatingFeed) {
		return;
	}
	w.updatingFeed = true;
	w.indicator.show();
	
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function(e) {
		w.updatingFeed = false;
		w.indicator.hide();
		var response = Net.makeValid(this.responseText);
		if (response.error || !response) {
			w.ad.title = getErrorTitle(response.error);
			w.ad.message = getErrorMsg(response.error);
			w.ad.show();
		} else {
			w.followUpComments = response;
			w.fireEvent('updateFeedUI', {action: 'feed'});
		}
	};
	
	xhr.onerror = function(e) {
		w.updatingFeed = false;
		w.indicator.hide();
		var response = Net.makeValid(this.responseText);
		if (response.error) {
			Ti.API.info(response.error);
		}
		w.ad.title = getErrorTitle(response.error);
		w.ad.message = getErrorMsg(response.error);
		w.ad.show();
	};
	
	xhr.open('GET',Settings.api_url+'/followup_comments/'+w.person.id+'.json?access_token='+Titanium.Network.encodeURIComponent(getToken()));
	Ti.API.info(Settings.api_url+'/followup_comments/'+w.person.id+'.json?access_token='+Titanium.Network.encodeURIComponent(getToken()));
	xhr.send();
};
