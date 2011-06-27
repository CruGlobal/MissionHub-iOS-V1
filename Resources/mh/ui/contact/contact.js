(function(){
	
	mh.ui.contact = {};
	
	mh.ui.contact.window = function() {
		
		var contactWindow, person, tabbedBar, tableView, tableViewHeader, statusSelector, indicator;
		
		var open = function(p) {
			debug('running mh.ui.contact.window.open with contact: ' + p.name);
			
			person = p;
			
			contactWindow = Ti.UI.createWindow({
				backgroundImage: 'images/bg.png',
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
		
		var processes = [];
	
		var showIndicator = function(process) {
			processes.push(process);
			indicator.show();
		};
		
		var hideIndicator = function(process) {
			var idx = processes.indexOf(process);
			if(idx!=-1) { processes.splice(idx, 1); }
			
			if (processes.length <= 0) {
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
			
			setTimeout(function() {
				resetTableView();
				onGetMoreComments(true);
			}, 500);
		};
		
		var onPersonLoad = function(e) {
			hideIndicator('person');
		};
		
		var onPersonError= function(e) {
			error(e);
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
			
			if (force) {
				tableView.updateLastUpdated();
			}
			
			if (prevXhr && force) {
				prevXhr.onload = function(){};
				prevXhr.onerror = function(){};
				if (tableView.reloading === true) { 
					tableView.endReload();
				}
				hideIndicator('comments');
				prevXhr.abort();
			}
			
			showIndicator('comments');
			prevXhr = mh.api.getFollowupComments(person.id, options);
		};
		
		var onCommentFetch = function(e) {
			debug('mh.ui.window.contact.onCommentFetch');
			
			if (e.length < options.limit) {
				hasLastComment = true;
			} else {
				hasLastComment = false;
			}
			
			options.start = options.limit + options.start;
			
			try {
				tableViewHeader.commentField.blur();
				tableViewHeader.commentField.enabled = false;
			} catch (exception2) {}
			
			if (e.length > 0) {
				tableView.data = [];
			}
			
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
			
			if (tableView.data.length <= 0) {
				try {
					tableView.data = [{title:''}];
				} catch(exception) {}
			}
			try {
				tableViewHeader.commentField.enabled = true;
			} catch (exception2) {}
			
			if (tableView.reloading === true) { 
				tableView.endReload();
			}
			
			hideIndicator('comments');
			loadingData = false;
		};
		
		var onCommentFetchError = function(e) {
			debug('mh.ui.window.contact.onCommentFetchError');
			
			if (tableView.reloading === true) { 
				tableView.endReload();
			}
			
			hideIndicator('comments');
			loadingData = false;
		};
		
		
		var createTableRow = function(followupComment) {
			
			info(followupComment);
			
			debug('mh.ui.window.contacts.createTableRow');
			var row = Ti.UI.createTableViewRow({
				className:"comment",
				color: mh.config.colors.ctvTxt,
				backgroundColor: mh.config.colors.ctvBg,
				backgroundDisabledColor: mh.config.colors.ctvBgDisabled,
				backgroundFocusedColor: mh.config.colors.ctvBgFocused,
				backgroundSelectedColor: mh.config.colors.ctvBgSelected,
				selectionStyle: mh.config.colors.ctvSelStyle,
				height: 'auto'
			});
			
			var image;
			if (followupComment.comment.commenter.picture) {
				image = followupComment.comment.commenter.picture+'?type=square';
			} else {
				image = '/images/default_contact.jpg';
			}
			
			var img = Ti.UI.createImageView({
				defaultImage: '/images/default_contact.jpg',
				image: image,
				top: 3,
				left: 3,
				width: 50,
				height: 50
			});
			row.image = img;
			row.add(img);
			
			var name = Ti.UI.createLabel({
				color: 'black',
				text: followupComment.comment.commenter.name,
				top: 10,
				left: 60,
				height: 14,
				width: Ti.Platform.displayCaps.platformWidth - 60,
				font: { fontSize: 14, fontFamily: 'Helvetica' }
			});
			row.add(name);
			
			row.comment = followupComment;
			return row;
		};		
		
		var createHeader = function() {
			debug('running mh.ui.contact.window.createHeader');
			var contactBar = Ti.UI.createView({
				top: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 40,
				backgroundImage: 'images/navbar_bg.png'
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
				font: { fontSize: 20, fontFamily: 'Helvetica', fontWeight: 'Bold' }
			});
			contactBar.add(contactLabel);
			
			var doneButton = Ti.UI.createButton({
				top: 4,
				left: 5,
				height: 30,
				width: 60,
				backgroundImage: 'images/btn_done.png',
				title: L('contact_btn_done'),
				font: { fontSize: 12, fontFamily: 'Helvetica Neue', fontWeight: 'Bold' }
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
				backgroundColor: mh.config.colors.blue
			});
			
			tableView = mh.ui.components.createPullTableView({
				headerView: tableViewHeader,
				width: Ti.Platform.displayCaps.platformWidth,
				height: Ti.Platform.displayCaps.platformHeight - 10 - 40 - 36,
				top: 40,
				opacity: 0,
				backgroundColor: 'white',
				data: [{title:''}] // Fixes strange keyboard bug
			}, refresh);
			
			tableView.addEventListener('click', function(e){
				//TODO
			});
			
			tableView.addEventListener('nearbottom', function(e) {
				//TODO
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
				backgroundColor: mh.config.colors.blue,
				top: 0,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				height: 150 + 8 + 8
			});
			
			tableViewHeader.commentView = Ti.UI.createView({
				backgroundColor: mh.config.colors.lightGray,
				height: 97,
				left: 0,
				width: Ti.Platform.displayCaps.platformWidth,
				top: tableViewHeader.contactView.height
			});			
			tableViewHeader.add(tableViewHeader.contactView);
			tableViewHeader.add(tableViewHeader.commentView);
			
			tableViewHeader.profilePic = mh.ui.components.createMagicImage({
				image: image,
				defaultImage: defaultImage,
				top: 8,
				left: 8,
				maxHeight: 150,
				maxWidth: 110,
				borderWidth: 3,
				borderRadius: 5,
				borderColor: '#000'
			});
			tableViewHeader.contactView.add(tableViewHeader.profilePic);
			
			tableViewHeader.profilePic.addEventListener('MagicImage:updated', function(e) {
				tableViewHeader.profilePic.animate({top: (tableViewHeader.contactView.height-e.height)/2, duration: 500});
			});
			
			tableViewHeader.nv = Ti.UI.createView({
				height: 81,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 110 - 6 - 8,
				left: 8 + 110 + 6 + 8
			});
			tableViewHeader.contactView.add(tableViewHeader.nv);
			
			tableViewHeader.name = Ti.UI.createLabel({
				height: 44,
				text: person.name,
				color: 'white',
				font: { fontSize:20, fontFamily: 'ArialRoundedMTBold' }
			});
			tableViewHeader.nv.add(tableViewHeader.name);
			
			// Comment View
			tableViewHeader.commentField = Ti.UI.createTextArea({
				top: 8,
				left: 8,
				height: 46,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 8,
				autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
				autoLink: false,
				editable: true,
				borderColor: 'black',
				borderWidth: 1,
				borderRadius: 5,
				value: ''
			});
			tableViewHeader.commentView.add(tableViewHeader.commentField);
			
			tableViewHeader.rejoicables = Ti.UI.createButton({
				title: 'rejoice',
				width: 32,
				height: 32,
				left: 8,
				top: 8 + 46 + 4
			});
			tableViewHeader.commentView.add(tableViewHeader.rejoicables);
			
			tableViewHeader.postButton = Ti.UI.createButton({
				title: 'Post',
				top: 8 + 46 + 4,
				right: 8,
				width: 70,
				height: 32,
				enabled: false
			});
			tableViewHeader.commentView.add(tableViewHeader.postButton);
			
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
				left: 8 + 32 + 4,
				height: 32,
				top: 8 + 46 + 4,
				width: Ti.Platform.displayCaps.platformWidth - 8 - 32 - 4 - 70 - 4 - 8
			});
			tableViewHeader.commentView.add(tableViewHeader.statusButton);
			tableViewHeader.statusButton.addEventListener('click', function(e){
				statusSelector.show();
			});
			
			statusSelector.addEventListener('click', function(e){
				tableViewHeader.statusButton.title = L(options[e.index]);
			});
		};
		
		var updateHeader = function() {
			tableViewHeader.profilePic.defineImage(person.picture);
			tableViewHeader.name.text = person.name;
		};
		
		var createFooter = function() {
			
			tabbedBar = Ti.UI.createTabbedBar({
				labels:[L('contact_contact'), L('contact_more_info')],
				backgroundColor:'#333',
			    top:tableView.top+tableView.height,
			    height:30,
			    style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
			    width:Ti.Platform.displayCaps.platformWidth,
			    index: 0
			});
			contactWindow.add(tabbedBar);
			
		};
		
		return {
			open: open	
		};
		
	}();
})();
