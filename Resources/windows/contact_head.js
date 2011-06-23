(function(){ /* Top View */
	w.tv = Ti.UI.createView({
		top: 0,
		left: 0,
		width: Titanium.Platform.displayCaps.platformWidth,
		height: 162,
		opacity: 0,
		visible: false
	});
	w.sv.add(w.tv);
})();

(function(){ /* Top View Border */
	w.tvborder = Ti.UI.createView({
		backgroundColor: Colors.blue,
		bottom: 0,
		left: pad,
		width: Titanium.Platform.displayCaps.platformWidth - pad - pad,
		height: 2,
		borderRadius: 1
	});
	w.tv.add(w.tvborder);
})();

(function(){ /* Profile Picture */
	var defaultImage = '/images/facebook_question.gif';
	if (w.person.gender && w.person.gender == 'female') {
		defaultImage = '/images/facebook_female.gif';
	} else {
		defaultImage = '/images/facebook_male.gif';
	}
	var params;
	if (w.person.picture) {
		params = {
			image: w.person.picture+"?type=large"
		};
	} else {
		params = {
			image: defaultImage
		};
	}
	w.picture = UI.createMagicImage(JSON.merge({
		defaultImage: defaultImage,
		maxHeight: 150,
		maxWidth: 110,
		borderWidth: 3,
		borderRadius: 5,
		borderColor: '#000',
		visible: false
	}, params));
	w.tv.add(w.picture);
	
	w.picture.addEventListener('MagicImage:updated', function(e) {
		w.fireEvent('updateUI', JSON.merge({action: 'picture'}, e));
	});
})();

(function(){ /* NameView */
	w.nv = Ti.UI.createView({
		height: 81,
		visible: false
	});
	w.tv.add(w.nv);
})();

(function(){ /* Person's Name */
	w.name = Ti.UI.createLabel({
		color: '#000',
		width: 'auto',
		height: 44,
		left: 0,
		top: 0,
		text: w.person.name,
		visible: false,
		font: {fontSize:20, fontFamily: 'ArialRoundedMTBold'}
	});
	w.nv.add(w.name);
})();

(function(){ /* Phone */ 
	w.phone = UI.createMagicImage({
		image:'/images/telephone.png',
		maxHeight: 32,
		maxWidth: 32,
		left: 0,
		top: w.name.height + 5,
		visible: false,
		focusable: true
	});
	w.phone.addEventListener('click', function(e) {
		if (w.person.phone_number) {
			Titanium.Platform.openURL('tel:' + w.person.phone_number);
		}
	});
	
	w.nv.add(w.phone);
})();

(function(){ /* SMS */ 
	w.sms = UI.createMagicImage({
		image:'/images/sms.png',
		maxHeight: 32,
		maxWidth: 32,
		left: 32 + 5,
		top: w.name.height + 5,
		visible: false,
		focusable: true
	});
	w.sms.addEventListener('click', function(e) {
		if (w.person.phone_number) {
			Titanium.Platform.openURL('sms:' + w.person.phone_number);
		}
	});
	
	w.nv.add(w.sms);
})();

(function(){ /* Email */ 
	w.email = UI.createMagicImage({
		image:'/images/mail.png',
		maxHeight: 32,
		maxWidth: 32,
		left: 64 + 10,
		top: w.name.height + 5,
		visible: false,
		focusable: true
	});
	w.email.addEventListener('click', function(e) {
		if (w.person.email_address) {
			if (android) {
				var activity = Ti.Android.currentActivity;
				var intent = Ti.Android.createIntent({
					action: Ti.Android.ACTION_SEND,
					data:w.person.email_address,
					type:'message/rfc822'
				});			
				activity.startActivity(Ti.Android.createIntentChooser(intent, 'Choose Email Client: '));
			} else {
				Titanium.Platform.openURL("mailto:"+w.person.email_address);
			}
		}
	});
	w.nv.add(w.email);
})();

w.updateHeadUI = function(e) {
	w.indicator.show();
	if (e.action == 'picture') {
		w.tv.height = 2*pad + e.height + 3;
		w.picture.top = (w.tv.height-3 - e.height)/2;
		w.picture.left = pad;
		w.nv.left = e.width+(3*pad);
		w.nv.top = (w.tv.height-3 - w.nv.height)/2;
		w.nv.width = Titanium.Platform.displayCaps.platformWidth - w.nv.left - pad;
	}
	
	var showPhone = true;
	var showSMS = true;
	var showEmail = true;
	
	if (!w.person.phone_number) {
		showPhone = false;
		showSMS = false;
	}
	
	if (!w.person.email_address) {
		showEmail = false;
	}
	
	if (ios) {
		if (!Titanium.Platform.canOpenURL('tel:' + w.person.phone_number)) {
			showPhone = false;
		}
		if (!Titanium.Platform.canOpenURL('sms:' + w.person.phone_number)) {
			showSMS = false;	
		}
		if (!Titanium.Platform.canOpenURL('mailto:' + w.person.email_address)) {
			showEmail = false;
		}
	}
	
	if (showPhone) {
		w.phone.left = 0;
		w.phone.show();
	}
	
	if (showSMS) {
		if (showPhone) {
			w.sms.left = w.phone.left + w.phone.width + 17;	
		} else {
			w.sms.left = 0;
		}
		w.sms.show();
	}
	
	if (showEmail) {
		if (showPhone && showSMS) {
			w.email.left = w.sms.left + w.sms.width + 25;	
		} else if (showPhone || showSMS) {
			w.email.left = w.phone.left + w.phone.width + 17;	
		} else {
			w.email.left = 0;	
		}
		w.email.show();
	}
	
	if (e.action == 'picture') {
		setTimeout(function(){
			var anim_in = Titanium.UI.createAnimation();
			anim_in.opacity=1;
			anim_in.duration = 500;
			w.tv.show();
			w.picture.show();
			w.nv.show();
			w.name.show();
			w.tv.animate(anim_in);
			w.indicator.hide();
		}, 100);
	}
} 