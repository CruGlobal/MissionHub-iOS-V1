(function(){ /* Comment View */
	w.cv = Ti.UI.createView({
		top: w.tv.height,
		left: pad,
		width: Titanium.Platform.displayCaps.platformWidth - pad - pad,
		height: 94,
		opacity: 0,
		visible: false
	});
	w.sv.add(w.cv);
})();

(function(){ /* Comment View Border */
	w.cvborder = Ti.UI.createView({
		backgroundColor: Colors.blue,
		bottom: 0,
		left: 0,
		width: Titanium.Platform.displayCaps.platformWidth - pad - pad,
		height: 2,
		borderRadius: 1
	});
	w.cv.add(w.cvborder);
})();

(function() { /* Comment Field */ 
	w.comment = Titanium.UI.createTextArea({
		top: 0,
		left: 0,
		height: 46,
		width: w.cv.width,
		suppressReturn: true,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
		autoLink: false,
		editable: true,
		borderColor: 'black',
		borderWidth: 1,
		borderRadius: 5
	});
	w.cv.add(w.comment);
})();

(function() { /* Rejoiceables Button */
	
})();

(function() { /* Post Button */
	w.post = Ti.UI.createButton({
		title: "Post",
		top: w.comment.top + w.comment.height + pad,
		right: 0,
		width: 70,
		height: 33
	});
	w.post.addEventListener('click', function(e) {
		w.postComment();
	});
	w.cv.add(w.post);
})();

(function() { /* Status Selector */
	w.status = UI.createDropDown({
	  top: w.comment.top + w.comment.height + pad,
	  right: w.post.right + w.post.width,
	  width: 200,
	  height: 35,
	  style: "width:198;height:33px;font-size:15;font-family:ArialRoundedMTBold;padding:2px;font-weight:bold;",
	  options: ['Uncontacted', 'Attempted Contact', 'Contacted', 'Do Not Contact Again', 'Completed']
	});
	w.cv.add(w.status);
})();

w.updateCommentUI = function(e) {
	w.indicator.show();
	if (e.action == 'picture') {
		w.cv.top = w.tv.height + pad;
		
		setTimeout(function(){
			var anim_in = Titanium.UI.createAnimation();
			anim_in.opacity=1;
			anim_in.duration = 500;
			w.cv.show();
			w.cv.animate(anim_in);
			w.indicator.hide();
		}, 100);
	}
	
	if (e.action == 'person') {
		switch(w.person.status) {
			case 'uncontacted': w.status.selected=0; break;
			case 'attempted_contact': w.status.selected=1; break;
			case 'contacted': w.status.selected=2; break;
			case 'do_not_contact': w.status.selected=3; break;
			case 'completed': w.status.selected=4; break;
			default: w.status.selected=0; break;
		}
		w.status.generate();
	}
}

w.postComment = function() {
	if (w.postingComment) {
		return;
	}
	w.postingComment = true;
	w.indicator.show();
	
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function(e) {
		w.postingComment = false;
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
		w.postingComment = false;
		w.indicator.hide();
		var response = Net.makeValid(this.responseText);
		if (response.error) {
			Ti.API.info(response.error);
		}
		w.ad.title = getErrorTitle(response.error);
		w.ad.message = getErrorMsg(response.error);
		w.ad.show();
	};
	
	var status = 'uncontacted';
	switch(w.status.getSelected()) {
		case 0: status = 'uncontacted'; break;
		case 1: status = 'attempted_contact'; break;
		case 2: status = 'contacted'; break;
		case 3: status = 'do_not_contact'; break;
		case 4: status = 'completed'; break;
		default: status = 'uncontacted'; break;
	}
	
	var data = {
		followup_comment: {
			organization_id: w.person.request_org_id,
			contact_id: w.person.id,
			commenter_id: JSON.parse(Ti.App.Properties.getString("person", "{}")).id,
			status: status,
			comment:w.comment.value,
		},
		rejoicables: ['spiritual_conversation']
	};
		
	xhr.open('POST',Settings.api_url+'/followup_comments/');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send({
		access_token: Titanium.Network.encodeURIComponent(getToken()),
		json: JSON.stringify(data)	
	});
	
	Ti.API.info("POST: " + Settings.api_url+'/followup_comments/');
	Ti.API.info({
		access_token: Titanium.Network.encodeURIComponent(getToken()),
		json: JSON.stringify(data)	
	});
};