(function() {

	mh.ui.contact = {};

	mh.ui.contact.window = function() {

		var contactWindow, person, contact, comments, tabbedBar, tableView, tableViewHeader, contactCard, statusSelector, indicator;

		var open = function(p) { /* Create And Open The Window For A Person (p) */
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
		
		var createHeader = function() { /* Create The View Header And Back Button */
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
				font: {
					fontSize: 20,
					fontFamily: 'Helvetica-Bold'
				}
			});
			contactBar.add(contactLabel);

			var doneButton = Ti.UI.createButton({
				top: 4,
				left: 5,
				height: 30,
				width: 60,
				backgroundImage: 'images/btn_done.png',
				title: L('contact_btn_done'),
				font: {
					fontSize: 12,
					fontFamily: 'Helvetica-Bold'
				},
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
		
		TAB_COMMENTS = 0; // constant for comment tab
		TAB_MORE_INFO = 1; // constant for more info tab
		TAB_QUESTIONNAIRE = 2; // constant for questionnaire tab
		
		var tab = TAB_COMMENTS;
		var commentData = [{title: '', editable:false}]; // Empty row to fix keyboard bug
		var moreInfoData = [{title: '', editable:false}]; // Empty row to fix keyboard bug
		var questionnaireData = [{title: '', editable:false}]; // Empty row to fix keyboard bug
		
		var createTableView = function() { /* Create the TableView */
			tableViewHeader = Ti.UI.createView({
				width: Ti.Platform.displayCaps.platformWidth,
				height: 8+150+8+97,
				backgroundImage: '/images/MH_Contact_Top_BG.png'
			});

			tableViewHeader.addEventListener('click', function(e) {
				try {
					tableViewHeader.commentField.blur();
				} catch (exception) {
				}
			});
			tableView = mh.ui.components.createPullTableView({
				headerView: tableViewHeader,
				width: Ti.Platform.displayCaps.platformWidth,
				height: Ti.Platform.displayCaps.platformHeight - 10 - 40 - 36,
				top: 40,
				opacity: 0,
				backgroundColor: 'white',
				data: [{
					title:'',
					editable: false
				}], // Fixes strange keyboard bug,
				editable:true,
				allowsSelectionDuringEditing:true,
				allowsSelection: false
			}, refresh);

			tableView.addEventListener('delete', function(e) {
				if (tab == TAB_COMMENTS) {
					try{
						tableViewHeader.commentField.blur();
					} catch (exception) {}
					var idx = commentData.indexOf(e.row);
					if(idx!=-1) {
						info('removed from array');
						commentData.splice(idx, 1);
					}
					
					if (commentData.length === 0) {
						commentData = [{ title:'', editable:false }];
						tableView.setData(commentData, {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
					}
					
					if (e.row.comment) {
						mh.api.deleteComment(e.row.comment.comment.id, {
							successCallback: function() {
							},
							errorCallback: function() {
							}
						});
					}
				}
			});
			contactWindow.add(tableView);

			setTimeout( function() {
				tableView.animate({
					opacity: 1.0,
					duration: 300
				});
			}, 250);
		};
		var createTableViewHeader = function() { /* Create the TableView Header and Post Area */

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

			contactCard = Ti.UI.createView({
				top: 0,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 150 + 8 + 8
			});

			tableViewHeader.commentView = Ti.UI.createView({
				backgroundColor: 'transparent',
				height: 97,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				top: contactCard.height,
				zIndex: 50
			});

			tableViewHeader.rejoicablesView = Ti.UI.createView({
				backgroundImage: 'images/MH_Rejoicable_BG.png',
				height: 97,
				left: -(Ti.Platform.displayCaps.platformWidth),
				width: Ti.Platform.displayCaps.platformWidth,
				top: contactCard.height,
				zIndex: 99
			});
			tableViewHeader.add(tableViewHeader.rejoicablesView);
			tableViewHeader.add(contactCard);
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
			contactCard.add(tableViewHeader.profilePic);

			tableViewHeader.profilePic.addEventListener('MagicImage:updated', function(e) {
				tableViewHeader.profilePic.animate({
					top: (contactCard.height-e.height)/2,
					duration: 500
				});
			});
			tableViewHeader.nv = Ti.UI.createView({
				height: 8+150+8,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 110 - 6 - 8,
				left: 8 + 110 + 6 + 8
			});
			contactCard.add(tableViewHeader.nv);

			tableViewHeader.nv.phone = Ti.UI.createButton({
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
				font: {
					fontSize:20,
					fontFamily: 'ArialRoundedMTBold'
				},
				top: 10
			});
			tableViewHeader.nv.add(tableViewHeader.name);

			tableViewHeader.nv.assignButton = Ti.UI.createButton({
				backgroundImage: '/images/assign_button.png',
				color: mh.config.colors.lightBlue,
				width: 177,
				height: 30,
				top: 8 + tableViewHeader.name.height + 47 + 20,
				left: 0,
				font: {
					fontSize:14,
					fontFamily: 'ArialRoundedMTBold'
				},
				title: 'Assign to Me'
			});

			tableViewHeader.nv.add(tableViewHeader.nv.assignButton);

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
				font: {
					fontSize: 14,
					fontFamily: 'Helvetica-Bold'
				},
				color:'black',
				suppressReturn:true,
				hintText: 'comment',
				appearance: Ti.UI.KEYBOARD_APPEARANCE_ALERT,
			    returnKeyType:Titanium.UI.RETURNKEY_DONE
			});
			tableViewHeader.commentView.add(tableViewHeader.commentField);

			tableViewHeader.rejoicables = Ti.UI.createButton({
				backgroundImage: 'images/rejoicables_button.png',
				title: 'R',
				font: {
					fontSize:16,
					fontFamily: 'Helvetica-Bold'
				},
				width: 37,
				height: 30,
				left: 8,
				top: 8 + 46 + 4 - 1
			});
			tableViewHeader.commentView.add(tableViewHeader.rejoicables);

			tableViewHeader.rejoicables.addEventListener('click', function(e) {
				tableViewHeader.rejoicablesView.animate({
					left: 0,
					duration: 250
				});
			});
			tableViewHeader.postButton = Ti.UI.createButton({
				backgroundImage: 'images/post_button.png',
				title: 'Post',
				top: 8 + 46 + 4,
				right: 8,
				width: 60,
				height: 30,
				font: {
					fontSize:16,
					fontFamily: 'Helvetica-Bold'
				}
			});
			tableViewHeader.commentView.add(tableViewHeader.postButton);
			tableViewHeader.postButton.addEventListener('click', function(e) {
				onPost();
			});
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

			updateStatus();

			tableViewHeader.statusButton = Ti.UI.createButton({
				title: L('contact_status_'+person.status),
				font: {
					fontFamily:'Helvetica-Bold',
					fontSize:16
				},
				left: 8 + 32 + 4 + 7,
				height: 30,
				top: 8 + 46 + 4 - 1,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 4 - 70 - 4 - 8,
				backgroundImage: 'images/status_button.png'
			});
			tableViewHeader.commentView.add(tableViewHeader.statusButton);
			tableViewHeader.statusButton.addEventListener('click', function(e) {
				statusSelector.show();
			});
			statusSelector.addEventListener('click', function(e) {
				tableViewHeader.statusButton.title = L(options[e.index]);
			});
			var rejoiceDone = Ti.UI.createButton({
				backgroundImage: 'images/rejoicables_button.png',
				title: 'R',
				font: {
					fontSize:16,
					fontFamily: 'Helvetica-Bold'
				},
				width: 37,
				height: 30,
				left: 8,
				top: 8 + 46 + 4 - 1
			});

			tableViewHeader.rejoicablesView.add(rejoiceDone);
			rejoiceDone.addEventListener('click', function(e) {
				tableViewHeader.rejoicablesView.animate({
					left: -(Ti.Platform.displayCaps.platformWidth),
					duration:250
				});
			});
			tableViewHeader.rejoicablesView.rejoiceSc = Ti.UI.createButton({
				backgroundImage: 'images/status_button.png',
				font: {
					fontSize: 14,
					fontFamily: 'Helvetica-Bold'
				},
				title: 'Spiritual Conversation',
				left: 8 + 32 + 8,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 8 - 8,
				top: 7,
				height: 24
			});
			tableViewHeader.rejoicablesView.add(tableViewHeader.rejoicablesView.rejoiceSc);
			tableViewHeader.rejoicablesView.rejoiceSc.addEventListener('click', function() {
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
				font: {
					fontSize: 14,
					fontFamily: 'Helvetica-Bold'
				},
				title: 'Prayed To Receive Christ',
				left: 8 + 32 + 8,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 8 - 8,
				top: 7 + 24 + 5,
				height: 24
			});
			tableViewHeader.rejoicablesView.add(tableViewHeader.rejoicablesView.rejoiceChrist);
			tableViewHeader.rejoicablesView.rejoiceChrist.addEventListener('click', function() {
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
				font: {
					fontSize: 14,
					fontFamily: 'Helvetica-Bold'
				},
				title: 'Gospel Presentation',
				left: 8 + 32 + 8,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 8 - 8,
				top: 7 + 24 + 5 + 24 + 5,
				height: 24
			});
			tableViewHeader.rejoicablesView.add(tableViewHeader.rejoicablesView.rejoiceGospel);
			tableViewHeader.rejoicablesView.rejoiceGospel.addEventListener('click', function() {
				if (this.on) {
					this.image = '';
					this.on = false;
				} else {
					this.image = '/images/check.png';
					this.on = true;
				}
			});
		};

		var processes = [];
		var showIndicator = function(process) { /* Show the ActivityIndicator for a process */
			processes.push(process);
			indicator.show();
		};
		var hideIndicator = function(process) { /* Hides the ActivityIndicator and Ends Table Pull to Refresh */
			var idx = processes.indexOf(process);
			if(idx!=-1) {
				processes.splice(idx, 1);
			}

			if (processes.length <= 0) {
				if (tableView.reloading === true) {
					tableView.endReload();
				}
				indicator.hide();
			}
		};
		
		var refresh = function() { /* Refresh The Entire View */
			debug('running mh.ui.window.contact.refresh');			
			getContact(true);
			getComments(true)
		};
		
		var updateHeader = function() { /* Update The Header Content */
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

			var showPhone = true;
			var showSMS = true;
			var showEmail = true;

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
		var updateStatus = function() { /* Update The Status Selector */
			switch(person.status) {
				case 'uncontacted':	statusSelector.cancel = 0; break;
				case 'attempted_contact': statusSelector.cancel = 1; break;
				case 'contacted': statusSelector.cancel = 2; break;
				case 'completed': statusSelector.cancel = 3; break;
				case 'do_not_contact': statusSelector.cancel = 4; statusSelector.destructive = -1; break;
			}
		};
		
		/* Post Comment */
		var onPost = function() { /* On Post Button Push */
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
					case L('contact_status_attempted_contact'):	status='attempted_contact'; break;
					case L('contact_status_contacted'): status='contacted'; break;
					case L('contact_status_completed'): status='completed';	break;
					case L('contact_status_do_not_contact'): status='do_not_contact'; break;
				}
				var data = {
					followup_comment: {
						organization_id: person.request_org_id,
						contact_id: person.id,
						commenter_id: mh.app.person().id,
						status: status,
						comment: tableViewHeader.commentField.value,
					},
					rejoicables: rejoicables
				};
				var options = {
					successCallback: function(e) {
						postSuccess(e)
					},
					errorCallback: function(e) {
						postError(e)
					}
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
		var postSuccess = function(e) { /* On Successful Post */
			tableViewHeader.postButton.enabled = true;
			tableViewHeader.commentField.value = '';
			tableViewHeader.rejoicablesView.rejoiceSc.on = false;
			tableViewHeader.rejoicablesView.rejoiceSc.image = '';
			tableViewHeader.rejoicablesView.rejoiceChrist.on = false;
			tableViewHeader.rejoicablesView.rejoiceChrist.image = '';
			tableViewHeader.rejoicablesView.rejoiceGospel.on = false;
			tableViewHeader.rejoicablesView.rejoiceGospel.image = '';
			hideIndicator('post');
			getComments(true);
		};
		var postError = function(e) { /* On Post Error */
			tableViewHeader.postButton.enabled = true;
			hideIndicator('post');
		};
		
		/* Get Contact */
		var getContact = function(fresh) { /* Get Full Contact From MissionHub */
			debug('running mh.ui.window.contact.getContact');
			showIndicator('contact');
			var options = {
				successCallback: function(e) {
					onContactLoad(e);
				},
				errorCallback: function(e) {
					onContactError(e);
				}
			};
			if (fresh) {
				mh.api.getContacts(person.id, mh.util.mergeJSON(options, {fresh: true}));
			} else {
				mh.api.getContacts(person.id, options);
			}
		};
		var onContactLoad = function(e) { /* On Contact Loaded */
			debug('running mh.ui.window.contact.onContactLoad');
			contact = e;
			person = e.people[0].person;
			updateHeader();
			updateStatus();
			createInfoRows();
			createQuestionnaireRows();
			hideIndicator('contact');
		};
		var onContactError= function(e) { /* On Contact Load Error */
			debug('running mh.ui.window.contact.onContactError');
			//TODO:
			hideIndicator('contact');
		};
		
		/* Get Comments */
		var getComments = function(fresh) { /* Get A Contact's Comments */
			debug('running mh.ui.window.contact.getComments');
			showIndicator('comments');
			try { 
				// Stupid Keyboard Bug
				tableViewHeader.commentField.blur();
				tableViewHeader.commentField.enabled = false;
			} catch(e) {}
			var options = {
				successCallback: function(e) {
					onCommentLoad(e);
				},
				errorCallback: function(e) {
					onCommentError(e);
				}
			};
			if (fresh) {
				mh.api.getFollowupComments(person.id, mh.util.mergeJSON(options,{fresh: true}));
			} else {
				mh.api.getFollowupComments(person.id, options);
			}
		};
		var onCommentLoad = function(e) { /* On Comments Loaded */
			debug('running mh.ui.window.contact.onCommentLoad');
			comments = e;
			createCommentRows();
			try { 
				// Stupid Keyboard Bug
				tableViewHeader.commentField.enabled = true;
			} catch(e) {}
			hideIndicator('comments');
		};
		var onCommentError = function(e) { /* On Comments Load Error */
			debug('running mh.ui.window.contact.onCommentError');
			//TODO;
			hideIndicator('comments');
		};
		
		/* Table View Content */
		var createCommentRows = function() { /* Create The TableView Content For Comments Tab */
			if(comments.length == 0) {
				commentData = [{title: '', editable:false}];
			} else {
				commentData = [];
				for (var index in comments) {
					var followupComment = comments[index];
					if (followupComment) {
						followupComment = followupComment.followup_comment;
						if (followupComment.comment) {
							commentData.push(createCommentRow(followupComment));
						}
					}
				}
			}
			if (tab == TAB_COMMENTS) {
				tableView.setData(commentData, {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
			}
		};
		var createCommentRow = function(followupComment) { /* Create A Comment TableView Row */
			//debug('mh.ui.window.contacts.createCommentRow');
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
				width: 140,
				font: {	fontSize: 14, fontFamily: 'Helvetica' }
			});
			row.add(name);

			var status = Ti.UI.createLabel({
				top: 5,
				left: 60 + 130 + 10,
				height: 13,
				textAlign: 'right',
				color: '#666',
				text: L('contact_status_'+followupComment.comment.status),
				font: {	fontSize: 13, fontFamily: 'Helvetica' },
				width: Ti.Platform.displayCaps.platformWidth - 60 - 130 - 10 - 5
			});
			//status.width = status.width - 5;
			row.add(status);
			
			
			var bottomBar = Ti.UI.createView({
				top: 5 + 33,
				left: 60,
				height: 16+5,
				width: Ti.Platform.displayCaps.platformWidth - 60 - 5
			});
			row.add(bottomBar);
			
			var time = Ti.UI.createLabel({
				left: 0,
				top: 0,
				color: '#666',
				font: {	fontSize: 12, fontFamily: 'Helvetica' },
				text: followupComment.comment.created_at
			})
			bottomBar.add(time);
			
			if (followupComment.rejoicables) {
				for (var index in followupComment.rejoicables) {
					var rejoicable = followupComment.rejoicables[index];
					var image;
					switch(rejoicable.what) {
						case 'spiritual_conversation': image = 'blue'; break;
						case 'prayed_to_receive': image = 'red'; break;
						case 'gospel_presentation': image = 'green'; break;
					}
					
					var icon = Ti.UI.createView({
						backgroundColor: image,
						width: 16,
						height: 16,
						right: index * 18,
						top: 0,
					})
					bottomBar.add(icon);
				}
			}
			
			if (followupComment.comment.comment && followupComment.comment.comment != '') {
				var comment = Ti.UI.createLabel({
					color: mh.config.colors.commentRowCommentTxt,
					top: status.top + status.height + 2,
					height: 'auto',
					font: {	fontSize: 13, fontFamily: 'Helvetica' },
					width: Ti.Platform.displayCaps.platformWidth - 60 - 5,
					text: followupComment.comment.comment,
					left: 60
				})
				comment.height += 2;
				bottomBar.top = comment.height + comment.top;
				row.add(comment);
			}

			row.comment = followupComment;
			return row;
		};
		var createInfoRows = function() { /* Create TableView Content For More Info Tab */
			if (tab == TAB_MORE_INFO) {
				tableView.setData(moreInfoData, {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
			}
		};
		var createQuestionnaireRows = function() { /* Create TableView Content For Quesitonnaire Tab */
			if (tab == TAB_QUESTIONNAIRE) {
				tableView.setData(questionnaireData, {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
			}
		}
		
		var createFooter = function() { /* Create The Footer Bar */
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
			tabbedBar.addEventListener('click', function(e) {
				tabbedBarOnClick(e.index);
			});
		};
		
		var tabbedBarOnClick = function(index) { /* Handle Change Tabs */
			if (tab != index) {
				if (index == 0) {
					tableView.headerView = null;
					contactCard.backgroundImage = '';
					tableViewHeader.add(contactCard);
					tableView.headerView = tableViewHeader;
					tableView.setData(commentData, {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
				} else {
					if (tab == 0) {
						tableView.headerView = null;
						tableViewHeader.remove(contactCard);
						contactCard.backgroundImage = 'images/MH_Contact_Very_Top_BG.png';
						tableView.headerView = contactCard
					}
					if (index == 1) {
						tableView.setData(moreInfoData, {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
					} else {
						tableView.setData(questionnaireData, {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
					}
				}
				tab = index;
			}
		};
		return {
			open: open
		};

	}();
})();