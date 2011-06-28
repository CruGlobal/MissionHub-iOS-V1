(function(){
	
	mh.ui.contact = {};
	
	mh.ui.contact.window = function() {
		
		var contactWindow, person, tabbedBar, tableView, tableViewHeader, statusSelector, indicator, secondaryTableView, moreInfoView, questionnaireView;
		var showPhone = true;
		var showSMS = true;
		var showEmail = true;
		
		var open = function(p) {
			debug('running mh.ui.contact.window.open with contact: ' + p.name);
			
			person = p;
			
			contactWindow = Ti.UI.createWindow({
				backgroundImage: 'images/MH_Background.png',
				height: Ti.Platform.displayCaps.platformHeight,
				width: Ti.Platform.displayCaps.platformWidth,
				left: Ti.Platform.displayCaps.platformWidth
			});
			
			createHeader();
			createTableView();
			createTableViewHeader();
			
			createFooter();
			
			refresh();
			
			mh.ui.nav.open(contactWindow);
		};
		
		var createHeader = function() {
			debug('running mh.ui.contact.window.createHeader');
			var contactBar = Ti.UI.createView({
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: 'images/MH_Nav_Bar.png'
			});
			contactWindow.add(contactBar);
			
			var contactLabel = Ti.UI.createLabel({
				text: L('contact_title'),
				color: 'white',
				height: 22,
				top: 8,
				left: 65,
				width: Ti.Platform.displayCaps.platformWidth-65-65,
				textAlign: 'center',
				font: { fontSize: 20, fontFamily: 'Helvetica-Bold'}
			});
			contactBar.add(contactLabel);
			
			var doneButton = Ti.UI.createButton({
				top: 4,
				left: 5,
				height: 30,
				width: 60,
				backgroundImage: 'images/btn_done.png',
				title: L('contact_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica-Bold'},
				color: mh.config.colors.navButton
			});
			doneButton.addEventListener('click', function() {
				mh.ui.nav.pop();
			});
			contactBar.add(doneButton);
			
			indicator = Ti.UI.createActivityIndicator({
				right: 10,
				top: 9,
				style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
				width: 'auto',
				height: 'auto'
			});
			contactBar.add(indicator);
		};
		
		var createTableView = function() {
			tableViewHeader = Ti.UI.createView({
				width: Ti.Platform.displayCaps.platformWidth,
				height: 8+150+8+97,
				backgroundImage: '/images/MH_Contact_Top_BG.png'
				//backgroundColor: mh.config.colors.blue
			});
			
			tableViewHeader.addEventListener('click', function(e){
				try {
					tableViewHeader.commentField.blur();
				} catch (exception) {}
			});
			
			tableView = mh.ui.components.createPullTableView({
				headerView: tableViewHeader,
				width: Ti.Platform.displayCaps.platformWidth,
				height: Ti.Platform.displayCaps.platformHeight - 10 - 40 - 36,
				top: 40,
				opacity: 0,
				backgroundColor: 'white',
				data: [{title:'', editable: false}], // Fixes strange keyboard bug,
				editable:true,
				allowsSelectionDuringEditing:true,
				allowsSelection: false
			}, refresh);
			
			tableView.addEventListener('delete', function(e) {
				if (tableView.data.length === 0) {
					tableViewHeader.commentField.blur();
					tableView.data = [{title:'', editable:false}];
				}
				if (e.row.comment) {
					mh.api.deleteComment(e.row.comment.comment.id, {
						successCallback: function() {},
						errorCallback: function() {}
					});
				}
			});
			
			contactWindow.add(tableView);
			
			setTimeout(function(){
				tableView.animate({opacity: 1.0, duration: 300});
			}, 250);
		};
		
		var createTableViewHeader = function() {
			
			var defaultImage = '/images/facebook_question.gif';
			if (person.gender && person.gender == 'female') {
				defaultImage = '/images/facebook_female.gif';
			} else if (person.gender && person.gender == 'male') {
				defaultImage = '/images/facebook_male.gif';
			}
			
			var image = defaultImage;
			if (person.picture) {
				image = person.picture+'?type=large';
			}
			
			tableViewHeader.contactView = Ti.UI.createView({
				//backgroundColor: mh.config.colors.headerBg,
				//backgroundImage: 'images/Carbon_Fiber_Contact_BG.png',
				top: 0,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 150 + 8 + 8
			});
			
			tableViewHeader.commentView = Ti.UI.createView({
				backgroundColor: 'transparent',//mh.config.colors.commentBg,
				height: 97,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				top: tableViewHeader.contactView.height,
				zIndex: 50
			});
			
			tableViewHeader.rejoicablesView = Ti.UI.createView({
				backgroundImage: 'images/MH_Rejoicable_BG.png',
				//backgroundColor: mh.config.colors.rejoicablesBg,
				height: 97,
				left: -(Ti.Platform.displayCaps.platformWidth),
				width: Ti.Platform.displayCaps.platformWidth,
				top: tableViewHeader.contactView.height,
				zIndex: 99
			});
			tableViewHeader.add(tableViewHeader.rejoicablesView);
			tableViewHeader.add(tableViewHeader.contactView);
			tableViewHeader.add(tableViewHeader.commentView);
			
			tableViewHeader.profilePic = mh.ui.components.createMagicImage({
				image: image,
				defaultImage: defaultImage,
				top: 8,
				left: 8,
				maxHeight: 150,
				maxWidth: 110,
				borderWidth: 2,
				borderRadius: 1,
				borderColor: mh.config.colors.profilePicBorder
			});
			tableViewHeader.contactView.add(tableViewHeader.profilePic);
			
			tableViewHeader.profilePic.addEventListener('MagicImage:updated', function(e) {
				tableViewHeader.profilePic.animate({top: (tableViewHeader.contactView.height-e.height)/2, duration: 500});
			});
			
			tableViewHeader.nv = Ti.UI.createView({
				height: 8+150+8,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 110 - 6 - 8,
				left: 8 + 110 + 6 + 8
			});
			tableViewHeader.contactView.add(tableViewHeader.nv);
			
		tableViewHeader.nv.phone = Ti.UI.createButton({
			//mh.ui.components.createMagicImage({
		backgroundImage:'/images/75-phone2.png',
		width: 47,
		height: 38,
		left: 0,
		top: 70,
		visible: false
	});
	
		tableViewHeader.nv.phone.addEventListener('click', function(e) {
		if (person.phone_number) {
			Titanium.Platform.openURL('tel:' + person.phone_number);
		}
	});
	
		tableViewHeader.nv.add(tableViewHeader.nv.phone);

tableViewHeader.nv.sms = Ti.UI.createButton({
		backgroundImage:'/images/08-chat2.png',
		height: 38,
		width: 47,
		//left: 50 + 5,
		top: 70,
		visible: false
	});
	
tableViewHeader.nv.sms.addEventListener('click', function(e) {
		if (person.phone_number) {
			Titanium.Platform.openURL('sms:' + person.phone_number);
		}
	});
	
tableViewHeader.nv.add(tableViewHeader.nv.sms);

tableViewHeader.nv.email = Ti.UI.createButton({
		image:'/images/18-envelope2.png',
		height: 38,
		width: 47,
		//left: 100 + 10,
		top: 70,
		visible: false
	});
	tableViewHeader.nv.email.addEventListener('click', function(e) {
		if (person.email_address) {
			Titanium.Platform.openURL("mailto:" + person.email_address);
		}
	});
	tableViewHeader.nv.add(tableViewHeader.nv.email);
			
			tableViewHeader.name = Ti.UI.createLabel({
				height: 44,
				text: person.name,
				color: mh.config.colors.headerNameTxt,
				font: { fontSize:20, fontFamily: 'ArialRoundedMTBold' },
				top: 10
			});
			tableViewHeader.nv.add(tableViewHeader.name);
			
			// Comment View
			tableViewHeader.commentField = Ti.UI.createTextArea({
				top: 8,
				left: 8,
				height: 46,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 8,
				autoLink: false,
				editable: true,
				borderColor: mh.config.colors.commentTxtBorder,
				borderWidth: 1,
				borderRadius: 3,
				value: '',
				opacity: 0.8,
				font: {fontSize: 14, fontFamily: 'Helvetica-Bold'},
				color:'black',
				suppressReturn:false,
				appearance: Ti.UI.KEYBOARD_APPEARANCE_ALERT
			});
			tableViewHeader.commentView.add(tableViewHeader.commentField);
			
			tableViewHeader.rejoicables = Ti.UI.createButton({
				backgroundImage: 'images/rejoicables_button.png',
				title: 'R',
				font: {fontSize:16, fontFamily: 'Helvetica-Bold'},
				width: 37,
				height: 30,
				left: 8,
				top: 8 + 46 + 4 - 1
			});
			tableViewHeader.commentView.add(tableViewHeader.rejoicables);
			
			tableViewHeader.rejoicables.addEventListener('click', function(e) {
				tableViewHeader.rejoicablesView.animate({left: 0, duration: 250});
			});
			
			tableViewHeader.postButton = Ti.UI.createButton({
				backgroundImage: 'images/post_button.png',
				title: 'Post',
				top: 8 + 46 + 4,
				right: 8,
				width: 60,
				height: 30,
				font: {fontSize:16, fontFamily: 'Helvetica-Bold'}
			});
			tableViewHeader.commentView.add(tableViewHeader.postButton);
			tableViewHeader.postButton.addEventListener('click', function(e){ onPost(); });
			
			var options = [];
			options[0]=L('contact_status_uncontacted');
			options[1]=L('contact_status_attempted_contact');
			options[2]=L('contact_status_contacted');
			options[3]=L('contact_status_completed');
			options[4]=L('contact_status_do_not_contact');
			statusSelector = Ti.UI.createOptionDialog({
				options:options,
				title:'Choose Status',
				destructive: 4
			});
			
			switch(person.status) {
				case 'uncontacted': statusSelector.cancel = 0; break;
				case 'attempted_contact': statusSelector.cancel = 1; break;
				case 'contacted': statusSelector.cancel = 2; break;
				case 'completed': statusSelector.cancel = 3; break;
				case 'do_not_contact': statusSelector.cancel = 4; statusSelector.destructive = -1; break;
			}
			
			tableViewHeader.statusButton = Ti.UI.createButton({
				title: L('contact_status_'+person.status),
				font: {fontFamily:'Helvetica-Bold', fontSize:16},
				left: 8 + 32 + 4 + 7,
				height: 30,
				top: 8 + 46 + 4 - 1,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 4 - 70 - 4 - 8,
				backgroundImage: 'images/status_button.png'
			});
			tableViewHeader.commentView.add(tableViewHeader.statusButton);
			tableViewHeader.statusButton.addEventListener('click', function(e){
				statusSelector.show();
			});
			
			statusSelector.addEventListener('click', function(e){
				tableViewHeader.statusButton.title = L(options[e.index]);
			});
			
			
			var rejoiceDone = Ti.UI.createButton({
				backgroundImage: 'images/rejoicables_button.png',
				title: 'R',
				font: {fontSize:16, fontFamily: 'Helvetica-Bold'},
				width: 37,
				height: 30,
				left: 8,
				top: 8 + 46 + 4 - 1
			});

			tableViewHeader.rejoicablesView.add(rejoiceDone);
			rejoiceDone.addEventListener('click', function(e) {
				tableViewHeader.rejoicablesView.animate({left: -(Ti.Platform.displayCaps.platformWidth), duration:250});
			});
			
			tableViewHeader.rejoicablesView.rejoiceSc = Ti.UI.createButton({
				backgroundImage: 'images/status_button.png',
				font: {fontSize: 14, fontFamily: 'Helvetica-Bold'},
				title: 'Spiritual Conversation',
				left: 8 + 32 + 8,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 8 - 8,
				top: 7,
				height: 24
			});
			tableViewHeader.rejoicablesView.add(tableViewHeader.rejoicablesView.rejoiceSc);
			tableViewHeader.rejoicablesView.rejoiceSc.addEventListener('click', function(){
				if (this.on) {
					this.image = '';
					this.on = false;
				} else {
					this.image = '/images/check.png';
					this.on = true;
				}
			});
			
			tableViewHeader.rejoicablesView.rejoiceChrist = Ti.UI.createButton({
				backgroundImage: 'images/status_button.png',
				font: {fontSize: 14, fontFamily: 'Helvetica-Bold'},
				title: 'Prayed To Receive Christ',
				left: 8 + 32 + 8,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 8 - 8,
				top: 7 + 24 + 5,
				height: 24
			});
			tableViewHeader.rejoicablesView.add(tableViewHeader.rejoicablesView.rejoiceChrist);
			tableViewHeader.rejoicablesView.rejoiceChrist.addEventListener('click', function(){
				if (this.on) {
					this.image = '';
					this.on = false;
				} else {
					this.image = '/images/check.png';
					this.on = true;
				}
			});
			
			tableViewHeader.rejoicablesView.rejoiceGospel = Ti.UI.createButton({
				backgroundImage: 'images/status_button.png',
				font: {fontSize: 14, fontFamily: 'Helvetica-Bold'},
				title: 'Gospel Presentation',
				left: 8 + 32 + 8,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 8 - 8,
				top: 7 + 24 + 5 + 24 + 5,
				height: 24
			});
			tableViewHeader.rejoicablesView.add(tableViewHeader.rejoicablesView.rejoiceGospel);
			tableViewHeader.rejoicablesView.rejoiceGospel.addEventListener('click', function(){
				if (this.on) {
					this.image = '';
					this.on = false;
				} else {
					this.image = '/images/check.png';
					this.on = true;
				}
			});
		};
		
		var updateHeader = function() {
			debug('mh.ui.window.contact.updateHeader');
			if (person.picture) {
				tableViewHeader.profilePic.defineImage(person.picture+'?type=large');
			}
			if (person.name) {
				tableViewHeader.name.text = person.name;
			}
			if (person.status) {
				tableViewHeader.statusButton.title = L('contact_status_' + person.status);
			}
			
			showPhone = true;
			showSMS = true;
			showEmail = true;
			
			if (!person.phone_number) {
				showPhone = false;
				showSMS = false;
			}
			debug("phone # : " + person.phone_number);
			debug("email : " + person.email_address);
			debug("person " + JSON.stringify(person));
			
			if (!person.email_address) {
				showEmail = false;
			}
			
			if (!Titanium.Platform.canOpenURL('tel:' + person.phone_number)) {
				showPhone = false;
			}
			if (!Titanium.Platform.canOpenURL('sms:' + person.phone_number)) {
				showSMS = false;	
			}
			if (!Titanium.Platform.canOpenURL('mailto:' + person.email_address)) {
				showEmail = false;
			}
			debug("showPhone = " + showPhone);
			debug("showSMS = " + showSMS);
			debug("showEmail = " + showEmail);
			if (showPhone) {
				tableViewHeader.nv.phone.left = 0;
				tableViewHeader.nv.phone.show();
			}
			
			if (showSMS) {
				if (showPhone) {
					tableViewHeader.nv.sms.left = tableViewHeader.nv.phone.left + tableViewHeader.nv.phone.width + 17;	
				} else {
					tableViewHeader.nv.sms.left = 0;
				}
				tableViewHeader.nv.sms.show();
			}
			
			if (showEmail) {
				if (showPhone && showSMS) {
					tableViewHeader.nv.email.left = tableViewHeader.nv.sms.left + tableViewHeader.nv.sms.width + 17;	
				} else if (showPhone || showSMS) {
					tableViewHeader.nv.email.left = tableViewHeader.nv.phone.left + tableViewHeader.nv.phone.width + 17;	
				} else {
					tableViewHeader.nv.email.left = 0;	
				}
				tableViewHeader.nv.email.show();
			}
		};
		
		var onPost = function() {
			var changedStatus = false;
			var hasRejoice = false;
			var hasMessage = false;
			var canPost = false;
			if (tableViewHeader.statusButton.title != L('contact_status_'+person.status)) {
				changedStatus = true;
				canPost = true;
			}
			
			var rejoicables = [];
			if (tableViewHeader.rejoicablesView.rejoiceSc.on) {
				rejoicables.push('spiritual_conversation');
			}
			if (tableViewHeader.rejoicablesView.rejoiceChrist.on) {
				rejoicables.push('prayed_to_receive');
			}
			if (tableViewHeader.rejoicablesView.rejoiceGospel.on) {
				rejoicables.push('gospel_presentation');
			}
			
			if (rejoicables.length > 0) {
				hasRejoice = true;
				canPost = true;
			}
			
			if (tableViewHeader.commentField.value.length > 0) {
				hasMessage = true;
				canPost = true;
			}
			
			var status;
			if (canPost) {
				switch (tableViewHeader.statusButton.title) {
					case L('contact_status_uncontacted'): status='uncontacted'; break;
					case L('contact_status_attempted_contact'): status='attempted_contact'; break;
					case L('contact_status_contacted'): status='contacted'; break;
					case L('contact_status_completed'): status='completed'; break;
					case L('contact_status_do_not_contact'): status='do_not_contact'; break;
				}
				var data = { 
					followup_comment: {
						organization_id: person.request_org_id,
						contact_id: person.id,
						commenter_id: mh.app.person().id,
						status: status,
						comment: tableViewHeader.commentField.value,
					}, rejoicables: rejoicables};
				var options = {
					successCallback: function(e) { postFollowUpSuccess(e) },
					errorCallback: function(e) { postFollowUpError(e) }
				};
				
				showIndicator('post');
				tableViewHeader.postButton.enabled = false;
				debug("about to post followup comment:" + JSON.stringify(data));
				debug("and the options:" + options);
				mh.api.postFollowupComment(data, options);
			} else {
				mh.ui.alert({
					buttonNames: [L('alert_btn_ok')],
					title: L('contact_cannot_post'),
					message: L('contact_cannot_post_msg')
				});
			}
		};
		
		var postFollowUpSuccess = function(e) {
			tableViewHeader.postButton.enabled = true;
			tableViewHeader.commentField.value = '';
			tableViewHeader.rejoicablesView.rejoiceSc.on = false;
			tableViewHeader.rejoicablesView.rejoiceSc.image = '';
			tableViewHeader.rejoicablesView.rejoiceChrist.on = false;
			tableViewHeader.rejoicablesView.rejoiceChrist.image = '';
			tableViewHeader.rejoicablesView.rejoiceGospel.on = false;
			tableViewHeader.rejoicablesView.rejoiceGospel.image = '';
			hideIndicator('post');
			refresh();
		};
		
		var postFollowUpError = function(e) {
			tableViewHeader.postButton.enabled = true;
			hideIndicator('post');
			//TODO
		};
		
		var processes = [];
	
		var showIndicator = function(process) {
			processes.push(process);
			indicator.show();
		};
		
		var hideIndicator = function(process) {
			var idx = processes.indexOf(process);
			if(idx!=-1) { processes.splice(idx, 1); }
			
			if (processes.length <= 0) {
				if (tableView.reloading === true) {
					tableView.endReload();
				}
				indicator.hide();
			}
		};
		
		var refresh = function() {
			try {
				tableViewHeader.commentField.blur();
				tableViewHeader.commentField.enabled = false;
			} catch(e) {}
			
			showIndicator('person');
			mh.api.getPeople(person.id, {
				successCallback: function(e) { onPersonLoad(e); },
				errorCallback: function(e) { onPersonError(e); }
			});
			
			resetTableView();
			onGetMoreComments(true);
		};
		
		var onPersonLoad = function(e) {
			person = e[0];
			updateHeader();
			switch(person.status) {
				case 'uncontacted': statusSelector.cancel = 0; break;
				case 'attempted_contact': statusSelector.cancel = 1; break;
				case 'contacted': statusSelector.cancel = 2; break;
				case 'completed': statusSelector.cancel = 3; break;
				case 'do_not_contact': statusSelector.cancel = 4; statusSelector.destructive = -1; break;
			}
			hideIndicator('person');
		};
		
		var onPersonError= function(e) {
			hideIndicator('person');
		};
		
		var hasLastComment = false;
		var ids = [];
		var loadingCommentData = false; // True when loading comment data
		
		var options = {
			start: 0,
			limit: 15,
			successCallback: function(e){ onCommentFetch(e); },
			errorCallback: function(e){ onCommentFetchError(e); }
		};
		if (ipad) {
			options.limit = 30;
		}
		
		var resetTableView = function() {
			loadingData = false; // reset state
			hasLastComment = false;  // reset state
			options.start = 0;
			ids=[];
			tableView.data = [{title: ''}]; // clear table
		};
		
		var prevXhr;
		var onGetMoreComments = function(force) {
			debug('mh.ui.window.contact.onGetMoreComments');
			if (loadingData || hasLastComment) { return; }
			loadingData = true;
			
			if (prevXhr && force) {
				prevXhr.onload = function(){};
				prevXhr.onerror = function(){};
				hideIndicator('comments');
				prevXhr.abort();
			}
			
			showIndicator('comments');
						
			if (force) {
				prevXhr = mh.api.getFollowupComments(person.id, mh.util.mergeJSON(options, {fresh: true}));
			} else {
				prevXhr = mh.api.getFollowupComments(person.id, options);
			}
		};
		
		var onCommentFetch = function(e) {
			debug('mh.ui.window.contact.onCommentFetch');
			
			if (e.length < options.limit) {
				hasLastComment = true;
			} else {
				hasLastComment = false;
			}
			
			if (e.length > 0 && options.start == 0) {
				tableView.data = [];
			}
			
			options.start = options.limit + options.start;
			
			try {
				tableViewHeader.commentField.blur();
				tableViewHeader.commentField.enabled = false;
			} catch (exception2) {}
			
			for (var index in e) {
				var followupComment = e[index];
				if (followupComment) {
					followupComment = followupComment.followup_comment;
					if (followupComment.comment && followupComment.comment.id && ids.indexOf(followupComment.comment.id) < 0) {
						tableView.appendRow(createTableRow(followupComment));
						ids.push(followupComment.comment.id);
					}
				}
			}
			
			if (ids.length == 0) {
				try {
					tableView.data = [{title:'', editable:false}];
				} catch(exception) {}
			}
			try {
				tableViewHeader.commentField.enabled = true;
			} catch (exception2) {}
			
			hideIndicator('comments');
			loadingData = false;
		};
		
		var onCommentFetchError = function(e) {
			debug('mh.ui.window.contact.onCommentFetchError');
			hideIndicator('comments');
			loadingData = false;
		};
		
		var createTableRow = function(followupComment) {			
			debug('mh.ui.window.contacts.createTableRow');
			var row = Ti.UI.createTableViewRow({
				className:"comment",
				color: mh.config.colors.ctvTxt,
				backgroundColor: mh.config.colors.ctvBg,
				backgroundDisabledColor: mh.config.colors.ctvBgDisabled,
				backgroundFocusedColor: mh.config.colors.ctvBgFocused,
				backgroundSelectedColor: mh.config.colors.ctvBgSelected,
				selectionStyle: mh.config.colors.ctvSelStyle,
				height: 'auto',
				editable: false
			});
			
			if (mh.app.getRole() == mh.app.ROLE_ADMIN) {
				row.editable = true;
			} else if (mh.app.getRole() == mh.app.ROLE_LEADER) {
				if (followupComment.comment.commenter.id == mh.app.person().id) {
					row.editable = true;
				}
			}
			
			var image;
			if (followupComment.comment.commenter.picture) {
				image = followupComment.comment.commenter.picture+'?type=square';
			} else {
				image = '/images/default_contact.jpg';
			}
			
			var minSize = Ti.UI.createView({
				left: 0,
				top: 0,
				height: 60,
				width: Ti.Platform.displayCaps.platformWidth,
			});
			row.add(minSize);
			
			var img = Ti.UI.createImageView({
				defaultImage: '/images/default_contact.jpg',
				image: image,
				top: 5,
				left: 5,
				width: 50,
				height: 50
			});
			row.image = img;
			row.add(img);
			
			var name = Ti.UI.createLabel({
				color: mh.config.colors.commentRowTxt,
				text: followupComment.comment.commenter.name,
				top: 5,
				left: 60,
				height: 14,
				width: 150,
				font: { fontSize: 14, fontFamily: 'Helvetica' }
			});
			row.add(name);
			
			var status = Ti.UI.createLabel({
				top: 6,
				left: 60 + 150 + 10,
				height: 13,
				textAlign: 'right',
				color: '#666',
				text: L('contact_status_'+followupComment.comment.status),
				font: { fontSize: 13, fontFamily: 'Helvetica' },
				width: Ti.Platform.displayCaps.platformWidth - 60 - 150 - 10 - 5
			});
			//status.width = status.width - 5;
			row.add(status);
			
			if (followupComment.comment.comment && followupComment.comment.comment != '') {
				var comment = Ti.UI.createLabel({
					color: mh.config.colors.commentRowCommentTxt,
					top: status.top + status.height + 2,
					height: 'auto',
					font: { fontSize: 13, fontFamily: 'Helvetica' },
					width: Ti.Platform.displayCaps.platformWidth - 60 - 5,
					text: followupComment.comment.comment,
					left: 60
				})
				comment.height += 6;
				row.add(comment);
			}
			
			row.comment = followupComment;
			return row;
		};
		
		var createFooter = function() {
			tabbedBar = Ti.UI.createTabbedBar({
				labels:[L('contact_contact'), L('contact_more_info'), L('contact_questionnaire')],
				backgroundColor:mh.config.colors.commentFooterBg,
			    top:tableView.top+tableView.height,
			    height:30,
			    style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
			    width:Ti.Platform.displayCaps.platformWidth,
			    index: 0
			});
			contactWindow.add(tabbedBar);
			tabbedBar.addEventListener('click', function(e){
				tabbedBarOnClick(e.index);
			});
		};
		
		return {
			open: open	
		};
		
	}();
})();
