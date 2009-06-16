/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global Config, $, sdata */

var sakai = sakai || {};

/**
 * Initialize the discussion widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement The place of the widget - usualy the location of the site
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.discussion = function(tuid, placement, showSettings){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var me = sdata.me;				// Contains information about the current user
	var rootel = $("#" + tuid);		// Get the main div used by the widget
	var editing = false;			// Currently editing a post
	var isCurrentPostNew = false;	// Is the post being send a new one or not
	var currentEditId = "";		// ID of the element that is currently being edited
	var currentReplyId = "0";		// ID of the post that is currently being replied to
	var selectedExistingDiscussionID = false; // ID of the discussion-widget which is currently selected in the insert existing discussion form
	var editContainer = "";
	var uids = [];

	// - Main Id
	var discussion = "#discussion";
	var discussionFirst = discussion + "_first";
	var discussionPost = discussion + "_post";
	var discussionPosts = discussion + "_posts";
	
	// Class
	var discussionClass = ".discussion";
	var discussionContentClass = discussionClass + "_content";
	var discussionContentDeleteClass = discussionContentClass + "_delete";
	var discussionContentEditClass = discussionContentClass + "_edit";
	var discussionContentReplyClass = discussionContentClass + "_reply";
	var discussionToggleShowAllClass = discussionClass + "_toggle_showall";
	var discussionToggleShowHideAllClass = discussionClass + "_toggle_showhideall";
	
	// Class without .
	var discussionSettingsListItemClass = "discussion_settings_list_item";
	var discussionSettingsListItemSelectedClass = discussionSettingsListItemClass + "_selected";
	var discussionSettingsTabClass = "discussion_settings_tab";
	var discussionSettingsTabSelectedClass = discussionSettingsTabClass + "_selected";
	
	// Container
	var discussionContainer = discussion + "_container";
	var discussionMainContainer = discussion + "_main_container";

	// Content
	var discussionContent = discussion + "_content";
	var discussionContentActions = discussionContent + "_actions";
	var discussionContentContainer = discussionContent + "_container";
	var discussionContentMessage = discussionContent + "_message";
	var discussionContentSubject = discussionContent + "_subject";
	
	// Edit
	var discussionEdit = discussion + "_edit";
	var discussionEditCancel = discussionEdit + "_cancel";
	var discussionEditContainer = discussionEdit + "_container";
	var discussionEditMessage = discussionEdit + "_message";
	var discussionEditSave = discussionEdit + "_save";
	var discussionEditSubject = discussionEdit + "_subject";
	
	// No (when there are none)
	var discussionNo = discussion + "_no";
	var discussionNoPosts = discussionNo + "_posts";
	var discussionNoDiscussions = discussionNo + "_discussions";
	
	// Reply 
	var discussionReply = discussion + "_reply";
	var discussionReplyBody = discussionReply + "_body";
	var discussionReplyCancel = discussionReply + "_cancel";
	var discussionReplyContainer = discussionReply + "_container";
	var discussionReplySubject = discussionReply + "_subject";
	var discussionReplySubmit = discussionReply + "_submit";
	
	// Settings
	var discussionSettings = discussion + "_settings";
	
	var discussionSettingsExisting = discussionSettings + "_existing";
	var discussionSettingsExistingContainer = discussionSettingsExisting + "_container";
	var discussionSettingsExistingTab = discussionSettingsExisting + "_tab";
	
	var discussionSettingsList = discussionSettings + "_list";
	var discussionSettingsListItem = discussionSettingsList + "_item";
	
	var discussionSettingsNew = discussionSettings + "_new";
	var discussionSettingsNewBody = discussionSettingsNew + "_body";
	var discussionSettingsNewContainer = discussionSettingsNew + "_container";
	var discussionSettingsNewSubject = discussionSettingsNew + "_subject";
	var discussionSettingsNewTab = discussionSettingsNew + "_tab";
	
	var discussionSettingsSubmit = discussionSettings + "_submit";
	
	// Template
	var discussionContainerTemplate = "discussion_container_template";
	var discussionSettingsExistingContainerTemplate =  "discussion_settings_existing_container_template";
	
	// Toggle
	var discussionToggle = discussion + "_toggle";
	var discussionToggleHideAll = discussionToggle + "_hideall";
	var discussionToggleShowAll = discussionToggle + "_showall";


	///////////////////////
	// Utility functions //
	///////////////////////
	
	/*
	 * Placeholders that will be replaced by the real functions. This
	 * is necessary to comply with the JSLint rules
	 */
	var showPosts = function(){};
	var editPost = function(){};
	var addPost = function(){};
	
	/**
	 * Format an input date (used by TrimPath)
	 * @param {Date} d Date that needs to be formatted
	 * @return {String} A string that beautifies the date e.g. May 11, 2009 at 9:11AM
	 */
	var formatDate = function(d){
		var names_of_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var am_or_pm = "";
		
		var current_hour = d.getHours();
		if (current_hour < 12) {am_or_pm = "AM";} else{am_or_pm = "PM";}
		if (current_hour === 0){current_hour = 12;}
		if (current_hour > 12){current_hour = current_hour - 12;}
		
		var current_minutes = d.getMinutes() + "";
		if (current_minutes.length === 1){current_minutes = "0" + current_minutes;}
		
		return (names_of_months[d.getMonth()].substring(0,3) + " " + d.getDate() + ", " +  d.getFullYear() + " at " + current_hour + ":" + current_minutes + am_or_pm);
	};
		
	/**
	 * Parse a json integer to a valid date
	 * @param {Integer} dateInput Integer of a date that needs to be parsed
	 * @returns {Date}
	 */
	var parseDate = function(dateInput) {
		var d = new Date(dateInput);
		return d;
	};
	
	/**
	 * Get the current date time since 1970 (just number)
	 */
	var getCurrentDateTime = function(){
		var d = new Date();
		return d.getTime();
	};
	
	/**
	 * Compare 2 strings with each other
	 * @param {String} a First string that needs to be compared
	 * @param {String} b Second string that needs to be compared
	 */
	var compare = function(a, b){
		a = a.toLowerCase();
		b = b.toLowerCase();
		return a < b ? -1 : a > b ? 1 : 0;
	};
	
	/**
	 * Scroll to a specific element in a page
	 * @param {Object} element The element you want to scroll to
	 */
	var scrollTo = function(element) {
		$('html, body').animate({scrollTop: element.offset().top}, 1);
	};
	
	/**
	 * Toggle the show all/hide all values
	 * @param {String} id Id of the post where the replies need to be toggled
	 */
	var toggleValue = function(id){
		var toggleHideId = discussionToggleHideAll + "_" + id;
		var toggleShowId = discussionToggleShowAll + "_" + id;
		if($(toggleHideId, rootel).is(':visible')) {
			$(toggleHideId, rootel).hide();
			$(toggleShowId, rootel).show();
		}else {
			$(toggleShowId, rootel).hide();
			$(toggleHideId, rootel).show();
		}
	};
	
	/**
	 * Clear the input fields for the reply form
	 */
	var clearReplyFields = function() {
		$(discussionReplySubject, rootel).val('');
		$(discussionReplyBody, rootel).val('');
	};
	
	/**
	 * Parse the name for a user
	 * @param {String} uuid Uuid of the user
	 * @param {String} firstName Firstname of the user
	 * @param {String} lastName Lastname of the user
	 */
	var parseName = function(uuid, firstName, lastName){
		if (firstName && lastName) {
			return firstName + " " + lastName;
		}
		else {
			return uuid;
		}
	};
	
	/**
	 * Parse the picture for a user
	 * @param {String} picture The picture path for a user
	 * @param {String} userStoragePrefix The user's storage prefix
	 */
	var parsePicture = function(picture, userStoragePrefix){
		// Check if the picture is undefined or not
		// The picture name will be undefined if the other user is in process of
		// changing his/her picture
		if (picture && picture.name) {
			return Config.URL.WEBDAV_PRIVATE_URL + userStoragePrefix + picture.name;				
		}
		return Config.URL.PERSON_ICON_URL;
	};

	/**
	 * Get the id of the dicussion widget and show the post including replies
	 */
	var getPostsFromJCR = function(){
		$.ajax({
			url : Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "discussion"),
			cache: false,
			success : function(data) {
				showPosts(data,true);
			},
			error : function(status) {
				showPosts(status,false);
			}
		});
	};
	
	/**
	 * Executed after a post has been added/edited or deleted
	 */
	var finishNewSettings = function() {
		if (isCurrentPostNew) {
			sdata.container.informFinish(tuid);
		}else{
			getPostsFromJCR();
		}
	};
	
		
	/**
	 * Save all the posts to the jcr database
	 * @param {String[]} posts Array containing all the posts
	 * @param {function} functionOnComplete Function that will be executed after the save
	 */
	var savePostsToDatabase = function(posts, functionOnComplete){
		// First sort the posts before saving them to JCR
		posts.sort(function(a, b){
			return compare(a.postId, b.postId);
		});
		
		// Convert the posts to a JSON string
		var str = $.toJSON(posts);
		
		// Do the actual save and execute a function after completion
		var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
		sdata.widgets.WidgetPreference.save(saveUrl, "discussion", str, functionOnComplete);
	};


	////////////////////
	// Edit functions //
	////////////////////
	
	/**
	 * Stop editing and show/hide the appropriate divs
	 * @param {String} id Id of the post that you stop editing
	 */
	var stopEditing = function(id){
		$(discussionContentContainer + "_" + id, rootel).show();
		$(discussionContentActions + "_" + id, rootel).show();
		$(editContainer, rootel).remove();
		editing = false;
	};
	
	/**
	 * Show the edit form
	 * @param {String} id Id of the post that needs to be edited
	 */
	var showEditPost = function(id) {
		if(editing){
			stopEditing(currentEditId);
		}
		editing = true;
		currentEditId = id;
		
		// Hide the div of the post you want to edit
		$(discussionContentContainer + "_" + id, rootel).hide();
		// Hide the actions of the post you are editing
		$(discussionContentActions + "_" + id, rootel).hide();
		
		// Clone the edit template div
		// We need to do this so we don't modify the original div
		editContainer = $(discussionEditContainer, rootel).clone();
		
		// Insert the cloned div after the hidden div with the original post
		$(discussionContentContainer + "_" + id, rootel).after($(editContainer));
		
		// Insert the text of the post you want to edit in the input fields //
		$(discussionEditSubject, editContainer).val($(discussionContentSubject + "_"+id, rootel).text());
		
		var sMessage = "";
		sMessage = $(discussionContentMessage + "_" + id, rootel).html();
		sMessage = sMessage.replace(/(<br\s*\/?>)+/g, "\n"); // Replace br or br/ tags with \n tags 
		$(discussionEditMessage, editContainer).val(sMessage);
		
		// Add binding to the cancel button
		$(discussionEditCancel, editContainer).bind("click",function(e,ui){
			stopEditing(id);
		});
		
		// Add binding to the save button
		$(discussionEditSave, editContainer).bind("click",function(e,ui){
			var subject = $(discussionEditSubject, editContainer).val();
			var message = $(discussionEditMessage, editContainer).val();
			
			editPost(id, subject, message);
			$(discussionContentActions + "_" + id, rootel).show();
		});
		
		// Show the edit form and add focus to the first field in that form
		$(editContainer).show();
		$(discussionEditSubject, editContainer).focus();
	};

	/**
	 * Get a post out off an array by entering the id
	 * @param {String} id Id of the post
	 * @returns {[Object, Integer]} Returns the post object and the id of the post inside the array
	 */
	var getPostWithIndex = function(id, posts) {
		var currentPostWithIndex = [];
		$.each(posts, function(intIndex){
			if (this.postId === id){
				currentPostWithIndex.push(this);
				currentPostWithIndex.push(intIndex);
				return currentPostWithIndex;
			}
		});
		return currentPostWithIndex;
	};
	
	/**
	 * Get a discussion out off an array by entering the tuid
	 * @param {String} id tuid of the post
	 * @returns {[Object, Integer]} returns the discussion object and the index of the post inside the array
	 */
	var getDiscussionIndex = function(id, discussions){
		var currentDiscussionWithIndex = [];
		if(discussions){
			for (var i = 0; i < discussions.length; i++) {	
				if (discussions[i].tuid === id){
					currentDiscussionWithIndex.push(discussions[i]);
					currentDiscussionWithIndex.push(i);
					return currentDiscussionWithIndex;
				}
			}
		}
		return currentDiscussionWithIndex;
	};
	
	/**
	 * Function that is executed after the edit is completed
	 */
	var editComplete = function(){
		// Show new values		
		if (editContainer.length > 0) {
			$(editContainer, rootel).remove();
			
			// Render the posts with the template engine
			getPostsFromJCR();
		}
	};
	
	/**
	 * Submit the edited post
	 * Gets all the posts, changes the post that has been edited and then sends them back to the server
	 * @param {String} id Id of the post that is edited
	 * @param {String} subject Subject of the post that is edited
	 * @param {String} message Body of the post that is edited
	 */
	editPost = function(id, subject, message){
		$.ajax({
			url : Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "discussion"),
			cache: false,
			success : function(data) {
				var arrPosts = $.evalJSON(data);
				
				// Change the subject and body of the post
				var postWithIndex = getPostWithIndex(id, arrPosts);
				var post = {};
				
				// The postindex will not exist if the discussion was first empty and then changed
				if(!postWithIndex[0]){
					post = {};
					post.editedBy = "";
					post.editedDate = "";
					post.subject = subject;
					post.body = message.replace(/\n/g, "<br />");
					post.uid = me.preferences.uuid;
					post.date = getCurrentDateTime();
					post.postId = "0";
					
					arrPosts[0] = post;

					// Save the adjusted posts to the database
					savePostsToDatabase(arrPosts, null);
				}else {
					post = postWithIndex[0];
					post.editedBy = me.preferences.uuid;
					post.editedDate = getCurrentDateTime();
					post.subject = subject;
					post.body = message.replace(/\n/g, "<br />");
					
					arrPosts[postWithIndex[1]] = post;

					// Save the adjusted posts to the database
					savePostsToDatabase(arrPosts, editComplete);
				}				
			},
			error : function(status) {
				alert("The posts could not be recieved from the server.");
			}
		});
		// If the id is 0, it means that you edited the post on top of the hierarchy.
		// So you also have to update the discussion that is in the "all discussions" list
		if(id === "0"){
			$.ajax({
				url: Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement) + "/_discussion",
				cache: false,
				success: function(data){
					var arrDiscussions = $.evalJSON(data); // Evaluate all the discussions
					var postWithIndex = getDiscussionIndex(tuid, arrDiscussions.items);
					var post2 = postWithIndex[0];
					if(post2){
						post2.subject = subject;
						post2.body = message.replace(/\n/g, "<br />");
						post2.editedBy = me.preferences.uuid;
						post2.editedDate = getCurrentDateTime();
						arrDiscussions.items[postWithIndex[1]] = post2;
						
						var tostring = $.toJSON(arrDiscussions);
						sdata.widgets.WidgetPreference.save(Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement), "_discussion", tostring, finishNewSettings);
					}
				},
				error: function(status){
					alert("The posts could not be recieved from the server.");
				}
			});
		}
	};
	
	/**
	 * Reply to a post
	 * This function will show the necessary divs, put focus in the first element and add
	 * RE: in front of the subject.
	 * @param {String} id Id of the post that is replied to
	 */
	var replyPost = function(id){
		$(discussionReplyContainer, rootel).show();
		
		// Jump to reply form
		scrollTo($(discussionReplyContainer, rootel));
		
		// Focus on the subject field
		$(discussionReplySubject, rootel).focus();
		
		// Add RE: in front of the subject
		$(discussionReplySubject, rootel).val("Re: " + $(discussionContentSubject + "_" + id,rootel).text());
	};
	
	/**
	 * When the delete is completed
	 */
	var deleteComplete = function(){
		getPostsFromJCR();
	};
	
	/**
	 * Delete all the posts of a specific id
	 * We need this function because the structure of the posts is hierarhical.
	 * @param {Array} posts All the posts of the discussion
	 * @param {String} id Id of the post which sub posts need to be deleted
	 */
	var deleteNextPosts = function(posts, id){
		var counter = 0;
		while(true){
			if(getPostWithIndex(id + "-" + counter, posts).length > 0){
				posts.splice(getPostWithIndex(id + "-" + counter, posts)[1],1);
				deleteNextPosts(posts, id + "-" + counter);
				counter++;
			}else{
				break;
			}
		}
	};
	
	/**
	 * Adjust the posts after deleting
	 * We do this because we need to adjust the id of each post if the previous post
	 * is deleted. So if we have posts 0.0, 0.1 and 0.2 and we delete 0.1 then the
	 * id of 0.2 should become 0.1
	 * @param {Array} posts All the posts
	 * @param {String} id Id of the post
	 */
	var adjustIdAfterDelete = function(posts, id){
		var postIdSplit = id.split("-");
		
		while (true) {
			// Get the last section of the post id
			var postIdLastSection = postIdSplit[postIdSplit.length - 1];
			// Convert it to an integer
			var postIdLastSectionInt = parseInt(postIdLastSection, 10);
			// Raise it by 1
			postIdLastSectionInt++;
			// Set the last section of the post id to the raised by 1
			postIdSplit[postIdSplit.length - 1] = postIdLastSectionInt + "";
			
			// Get the post that is raised by 1
			var postRaised = getPostWithIndex(postIdSplit.join("-"), posts);
			// Check if that element exists
			if (postRaised.length > 0) {
				var postRaisedIdSplit = postRaised[0].postId.split("-");
				// Get the last section of the raised post id
				var postRaisedIdLastSection = postIdSplit[postIdSplit.length - 1];
				// Convert it to an integer
				var postRaisedIdLastSectionInt = parseInt(postRaisedIdLastSection, 10);
				postRaisedIdLastSectionInt--;
				postRaisedIdSplit[postRaisedIdSplit.length - 1] = postRaisedIdLastSectionInt + "";
				postRaised[0].postId = postRaisedIdSplit.join("-");
				posts[postRaised[1]] = postRaised[0];
				adjustIdAfterDelete(posts, postRaised[0].postId);
			}
			else {
				break;
			}
		}
	};
	
	/**
	 * Deletes a specific post
	 * @param {String} id Id of the post that needs to be deleted
	 */
	var deletePost = function(id){
		if(id === "0"){
			var arrPosts = [];
			 // Save the adjusted posts to the database
			savePostsToDatabase(arrPosts, deleteComplete);
			
			// If we delete the first post, we also need do delete it from the list with all the discussions
			$.ajax({
				url: Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement) + "/_discussion",
				cache: false,
				success: function(data){
					var arrDiscussions = $.evalJSON(data);
					
					arrDiscussions.items.splice(getDiscussionIndex(tuid, arrDiscussions.items)[1],1);
					
					var tostring = $.toJSON(arrDiscussions);
					sdata.widgets.WidgetPreference.save(Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement), "_discussion", tostring, finishNewSettings);
					
				},
				error: function(status){
					alert("The posts could not be recieved from the server.");
				}
			});
		}else {
			// First get all the posts (they may be modified by another user) and then remove the post(s)
			$.ajax({
				url : Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "discussion"),
				cache: false,
				success : function(data) {
					var arrPosts = $.evalJSON(data);
					
					// Remove the post out of the array
					arrPosts.splice(getPostWithIndex(id, arrPosts)[1],1);
					
					// Delete all the posts beneath the current id
					deleteNextPosts(arrPosts, id);
					
					// Adjust the id of the posts that are next to the current id
					adjustIdAfterDelete(arrPosts, id);
					
					// Save the adjusted posts to the database
					savePostsToDatabase(arrPosts, deleteComplete);
				},
				error : function(status) {
					alert("The posts could not be found.");
				}
			});
		}		
	};
	
	// Add the unique id to the array of uids if the uid is not in it already
	
	/**
	 * Add a uid for a certain user to the list of all uids.
	 * We do this to not have to get the profile information for one user twice
	 * @param {String} uid The uid that will be added if it is not in the list
	 */
	var addToUids = function(uid) {
		// We also check if the uid that we are adding is not empty
		uid = $.trim(uid);
		if(!($.inArray(uids, uid) > -1) && uid !== "") {
			uids.push(uid);
		}
	};
	
	/**
	 * Check if the reply is the first in a section.
	 * We need this so we know how much we need to intend the reply
	 * @param {String} postIdLastSection The last section of an id
	 */
	var isFirstReply = function (postIdLastSection){
		if (postIdLastSection === "0"){
			return true;
		}else {
			return false;
		}
	};
	
	/**
	 * Check if the reply is the last reply in a section of replies
	 * @param {Object[]} arrPosts Array containing all the posts
	 * @param {Object} post The current post object you are recursing in the loop
	 * @param {String[]} postIdSplit Array containing all the sections of an id (1-2-3) -> [1,2,3]
	 * @param {String} postIdLastSection The last section of the id 1-2-3 -> 3
	 * @param {Integer} index The index you get by recursing the loop
	 */
	var isLastReply = function (arrPosts, post, postIdSplit, postIdLastSection, index){
		// Contains how many divs there need to be closed after the reply
		post.countCloseDivs = 0;
		
		// Check if it is the first element in the array
		if (index > 0) {
			// Clone the object to not touch the original one
			var postIdSplitClone = postIdSplit.slice(0);
			var postIdLastSectionInt = parseInt(postIdLastSection, 10);
			
			// Raise the last section in the id with 1
			// e.g. 0-1 -> 0-2 
			postIdLastSectionInt ++;
			postIdSplitClone[postIdSplitClone.length-1] = postIdLastSectionInt + "";											
			
			// Gets the post with the raised last section 
			var postRaisedLastSection = getPostWithIndex(postIdSplitClone.join("-"), arrPosts);
			
			// Next post in the array
			var postNextReply = arrPosts[index + 1];
			
			// Check if it's the last post in the array
			if (postRaisedLastSection.length > 0) {
				return false;
			}else{
				if (postNextReply) {
					// The reply is not the last reply if the id of that reply is the same
					// as the raised id
					if (postNextReply.postId === postIdSplitClone.join("-")) {
						return false;
					}
					else {
						if(getPostWithIndex(post.postId + "-0", arrPosts).length > 0){
							return false;
						}else{
							var countCloseDivs = post.postId.split("-").length - postNextReply.postId.split("-").length;
							var countCloseDivsArr = [];
							for (var i = 0; i < countCloseDivs; i++) {
								countCloseDivsArr.push("1");
							}
							post.countCloseDivs = countCloseDivsArr;
							return true;
						}
					}
				} else {
					return false;
				}
			}
		}else{
			// The first post in a discussion is the main post and never a reply
			return false;
		}
	};
	
	/**
	 * Count the replies for a post
	 * @param {Object[]} arrPosts Array containing all the posts
	 * @param {String[]} postIdSplit Array containing all the sections of an id (1-2-3) -> [1,2,3]
	 * @param {Integer} index The index you get by recursing the loop
	 */
	var countReplies = function(arrPosts, postIdSplit, index){
		if(index === 0){
			return arrPosts.length-1;
		}else {
			var count = 0;
			
			// We clone the array containing all the sections for an id
			// because we don't want to change the original object
			var postIdSplitClone = postIdSplit.slice(0);
			while(true){
				// Check every sub reply for a post/reply
				// So if we have the id 0-1 we check if 0-1-0, 0-1-1, ... exist
				// if it doesn't, we know there are no more replies for it
				postIdSplitClone.push(count+"");
				
				if(getPostWithIndex(postIdSplitClone.join("-"), arrPosts).length > 0) {
					count ++;
					// Remove the last element from the array
					postIdSplitClone.pop();
				}else{
					// Exit the while loop
					break;
				}
			}
			return count;
		}	
	};
	
	/**
	 * Get the index of the uid in the uids array
	 * @param {String} uid The uid that you need to get the index of
	 */
	var getUidIndex = function(uid){
		for(var i = 0; i < uids.length; i++) {
			if(uids[i] === uid) {
				return i;
			}
		}
	};
	
	/**
	 * Render the discussion posts
	 * @param {Object} jsonPosts The posts that needs to be rendered
	 */
	var renderPostsAddBinding = function(jsonPosts){

		// Render the posts with the template engine
		$(discussionContainer, rootel).html($.Template.render(discussionContainerTemplate, jsonPosts));
	};

	/**
	 * Add binding to the elements of the posts
	 */
	var addBinding = function(){

		// Add the action listeners
		$(discussionToggleShowAllClass, rootel).hide();
		$(discussionToggleShowHideAllClass, rootel).bind("click",function(e,ui){
			var id = e.target.id.split("_")[e.target.id.split("_").length - 1];
			
			if (id === "0") {
				$(discussionFirst).next().toggle(1, toggleValue(id));
			}
			else {
				$(discussionPost + id, rootel).next().toggle(1, toggleValue(id));
			}
			
		});
		
		// Bind the reply button
		$(discussionContentReplyClass, rootel).bind("click",function(e,ui){
			currentReplyId = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
			replyPost(currentReplyId);
		});
		// Bind the delete button
		$(discussionContentDeleteClass, rootel).bind("click",function(e,ui){
			deletePost($(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1]);
		});
		// Bind the edit button
		$(discussionContentEditClass, rootel).bind("click",function(e,ui){
			showEditPost($(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1]);
		});
	};

	/**
	 * Get the information for a post.
	 * @param {Object[]} arrPosts An array containing all the posts
	 * @param {String,Boolean} data Will contain a string with information
	 * about all the users and is false if the user is logged out and was not
	 * able to receive the user information
	 */
	var getPostInfo = function(arrPosts, data) {
		if(data){

			// Parse the info of the users
			var users = $.evalJSON(data).users;
		}

		// Clear the old posts
		$(discussionPosts, rootel).empty();

		// Hide the reply form
		$(discussionReplyContainer, rootel).hide();

		// We create a new array that contains all the information about
		// the posts. We do this to not have to modify the original array
		var arrParsedPosts = [];
		for(var i = 0; i < arrPosts.length; i++){
			var post = arrPosts[i];
			var uid = post.uid;
			post.date = formatDate(parseDate(post.date));
			post.body = post.body.replace(/\n/g,"<br />");
			post.showEdit = false;
			post.showDelete = false;

			// Split the id into different sections (array)
			var postIdSplit = post.postId.split("-");

			// The last section of the id
			// e.g. the last section of the id "0-1-2" is 2
			var postIdLastSection = postIdSplit[postIdSplit.length-1];

			// Check if it's the first reply of a section
			post.firstReply = isFirstReply(postIdLastSection);

			// Check if the post is the last reply of a section
			post.lastReply = isLastReply(arrPosts, post, postIdSplit, postIdLastSection, i);

			// Gets the total amount of replies on a post
			post.replies = countReplies(arrPosts, postIdSplit, i);

			// Show or hide the edit or delete button
			if(me.preferences.superUser || me.preferences.uuid === uid){
				post.showEdit = true;
				post.showDelete = true;
			}

			if(data){

				// Get the index for the user in the uids array
				var uidIndex = getUidIndex(uid);

				// Get the user's firstName, lastName and picture if it's in the database
				post.name = parseName(uid, users[uidIndex].profile.firstName, users[uidIndex].profile.lastName);
				post.picture = parsePicture(users[uidIndex].profile.picture, users[uidIndex].userStoragePrefix);
				
				// Check if someone edited the post
				if(post.editedBy !== ""){

					// Get the index for the user in the uids array
					var uidIndexEditedBy = getUidIndex(post.editedBy);

					// Get the profile info from the user that edited the post
					post.editedByName = parseName(post.editedBy, users[uidIndexEditedBy].profile.firstName, users[uidIndexEditedBy].profile.lastName);
					post.editedByDate = formatDate(parseDate(post.editedDate));
				}
			}
			arrParsedPosts.push(post);
		}
		
		var jsonPosts = {};
		jsonPosts.posts = arrParsedPosts;
		
		// Pass a variable loggedIn to the json object so we are able
		// to see in the template whether the user is logged in or not
		if(data){
			jsonPosts.loggedIn = true;
		}else{
			jsonPosts.loggedIn = false;
		}
		
		renderPosts(jsonPosts);
		addBinding();
	};
	
	/**
	 * Get the information for the users
	 * @param {Object[]} arrPosts An array containing all the posts
	 */
	var getUserInfo = function(arrPosts) {					
		$.ajax({
			url: Config.URL.ME_SERVICE + "/" + uids.join(','),
			success: function(data){
				getPostInfo(arrPosts, data);
			},
			error: function(status){

				// This will result in a fail when the user is logged out
				// but even then he should be able to see the posts
				getPostInfo(arrPosts, false);
			}
		});
	};
	
	/**
	 * Show all the posts in the main view
	 * @param {String} response Json response with all the posts
	 * @param {Boolean} exists Check if the discussion exists
	 */
	showPosts = function(response, exists){
		if (exists){
			try {
				var arrPosts = $.evalJSON(response);
				
				$(discussionNoPosts, rootel).hide();
				$(discussionContainer, rootel).show();
				uids = [];
				
				// Add the uid for each user to uids
				for(var i = 0; i < arrPosts.length; i++){

					// The this object contains the post you are iterating
					addToUids(arrPosts[i].uid);
					addToUids(arrPosts[i].editedBy);
				}
				
				// Only show the post if there is any unique id
				if(uids) {
					getUserInfo(arrPosts);
				}
			}
			catch (err){
				alert(err);
			}
		} else {
			alert('Failed to show the posts.');
		}
	};

	/**
	 * Gets the id of the reply that will be submitted
	 * @param {Array} posts Array containing all the posts
	 * @param {String} id Id of the post that needs to be adjusted
	 */
	var adjustPostId = function(posts, id){
		var counter = 0;
		var postWithIndex = getPostWithIndex(id+"-"+counter, posts);
		
		if(postWithIndex.length === 0){
			return id + "-" + counter;
		}else{
			var postExists = true;
			while(postExists){
				counter ++;
				postWithIndex = getPostWithIndex(id+"-"+counter, posts);
				if (postWithIndex.length === 0) {
					return id + "-" + counter;
				}
			}
			return id+"-"+counter;
		}
	};

	/**
	 * Creates a new discussion in the _discussion file 
	 * @param {Object} response JSON object containing all the posts
	 * @param {Boolean} exists
	 * 	true: there are already discussions for the current site
	 * 	false: there aren't any discussions for the current site
	 * @param {Object} post JSON object containing the information about the first post
	 */
	var createExistingDiscussion = function(response, exists, post){
		var json = {};
		json.items = [];
		if (exists){
			json = $.evalJSON(response);
		}

		var index = json.items.length;
		json.items[index] = post;
		var tostring = $.toJSON(json);
		sdata.widgets.WidgetPreference.save(Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement), "_discussion", tostring);
	};

	/**
	 * Add a post to the discussion
	 * @param {Boolean} isNewPost Is it a new post or an existing one
	 */
	addPost = function(isNewPost, postId){
		isCurrentPostNew = isNewPost;
		var subject = "";
		var body = "";
		if(isNewPost){
			subject = $(discussionSettingsNewSubject,rootel).val();
			body = $(discussionSettingsNewBody,rootel).val();
		}else{
			subject = $(discussionReplySubject,rootel).val();
			body = $(discussionReplyBody,rootel).val();
		}

		// Check if the subject input field is empty
		if ((!subject || subject.replace(/ /g,"%20") === "") && ($(discussionSettingsNewContainer, rootel).is(':visible'))){
			alert("Please enter a valid subject.");
		}
		else if ((selectedExistingDiscussionID || (selectedExistingDiscussionID === "")) && ($(discussionSettingsExistingContainer, rootel).is(':visible'))){
			alert("Please select an existing discussion.");
		}
		else {
			if (me){

				// Fill in the JSON post object
				var post = {
					"uid": me.preferences.uuid,
					"body": body,
					"subject": subject,
					"date" : getCurrentDateTime(),
					"postId" : postId+"", 
					"editedBy" : ""
				};
				
				var arrPosts = [];
				
				if (isNewPost) {
					if($(discussionSettingsNewContainer, rootel).is(':visible')){
						arrPosts.push(post); // Add the new post to the array

						if(postId === "0"){
							// Fill in the JSON post object
							var post2 = {
								"uid": me.preferences.uuid,
								"tuid": tuid,
								"body": body,
								"subject": subject,
								"date" : getCurrentDateTime(),
								"postId" : postId+""
							};
							$.ajax({
								url: Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement) + "/_discussion",
								cache: false,
								success: function(data){
									createExistingDiscussion(data, true, post2);
									savePostsToDatabase(arrPosts, finishNewSettings);
								},
								error: function(status){
								
									createExistingDiscussion(status, false, post2);
									savePostsToDatabase(arrPosts, finishNewSettings);
								}
							});
						}else{
							savePostsToDatabase(arrPosts, finishNewSettings);
						}
					}
					else{
						$.ajax({
							url : Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, selectedExistingDiscussionID).replace(/__NAME__/, "discussion"),
							cache: false,
							success : function(data) {
								var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
								sdata.widgets.WidgetPreference.save(saveUrl, "discussion", data, finishNewSettings);
							},
							error : function(status) {
								alert("failed to retrieve posts.");
							}
						});
					}
				}else {
					$.ajax({
						url: Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "discussion"),
						cache: false,
						success: function(data){
							// Parse all the posts
							arrPosts = $.evalJSON(data);

							// Adjust the id for the posts
							post.postId = adjustPostId(arrPosts, postId);

							// Add the current post to all the posts
							arrPosts.push(post);

							// Save the posts to the database
							savePostsToDatabase(arrPosts, finishNewSettings);

							// Clear the fields of the reply form
							clearReplyFields();
						},
						error: function(status){
							alert("failed to retrieve other posts.");
						}
					});
				}
			} else {
				alert('An error occured when getting the current user.');
			}
		}
	};
	
	/**
	 * Gets all the existing discussions for the current site
	 */
	var fillListWithExistingDiscussions = function(){
		$.ajax({
			cache: false,
			url: Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement) + "/_discussion",
			success: function(data){
				var json = $.evalJSON(data);
				if (json.items) {
					$(discussionNoDiscussions, rootel).hide();

					// Render the list that contains the existing discussions
					$(discussionSettingsExistingContainer, rootel).html($.Template.render(discussionSettingsExistingContainerTemplate,json));

					// Bind the discussion list items
					$("." + discussionSettingsListItemClass, rootel).bind("click",function(e,ui){
						if($(discussionSettingsListItem  + selectedExistingDiscussionID, rootel).length > 0){
							$(discussionSettingsListItem + selectedExistingDiscussionID, rootel).addClass(discussionSettingsListItemClass);
							$(discussionSettingsListItem + selectedExistingDiscussionID, rootel).removeClass(discussionSettingsListItemSelectedClass);
						}
						selectedExistingDiscussionID = e.target.id.split("_")[e.target.id.split("_").length - 1];
						e.target.className = discussionSettingsListItemSelectedClass;
						
					});
				}
				else{
					$(discussionNoDiscussions, rootel).show();
				}
			},
			error: function(status){
				$(discussionNoDiscussions, rootel).show();
			}
		});
	};

	////////////////////
	// Event Handlers //
	////////////////////

	/* 
	 * Bind the submit button
	 */
	$(discussionReplySubmit, rootel).bind("click",function(e,ui){
		addPost(false, currentReplyId);
	});

	/* 
	 * Bind the cancel button 
	 */
	$(discussionReplyCancel, rootel).bind("click",function(e,ui){

		// Clear everything in the reply fields
		clearReplyFields();
		
		// Hide the input form
		$(discussionReplyContainer, rootel).hide();
	});

	/*
	 * Bind the settings cancel button
	 */
	$("#discussion_settings_cancel", rootel).bind("click",function(e,ui){
		$(discussionReplyContainer, rootel).hide();
		sdata.container.informCancel(tuid);
	});

	/*
	 * Bind the new discussion tab
	 */
	$(discussionSettingsNewTab, rootel).bind("click",function(e,ui){
		$(discussionSettingsExistingContainer, rootel).hide();
		$(discussionSettingsNewTab, rootel).removeClass(discussionSettingsTabClass);
		$(discussionSettingsNewTab, rootel).addClass(discussionSettingsTabSelectedClass);
		$(discussionSettingsExistingTab, rootel).removeClass(discussionSettingsTabSelectedClass);
		$(discussionSettingsExistingTab, rootel).addClass(discussionSettingsTabClass);
		$(discussionSettingsNewContainer, rootel).show();
	});

	/*
	 * Bind the existing discussion tab
	 */
	$(discussionSettingsExistingTab, rootel).bind("click",function(e,ui){
		$(discussionSettingsNewContainer, rootel).hide();
		$(discussionSettingsNewTab, rootel).removeClass(discussionSettingsTabSelectedClass);
		$(discussionSettingsNewTab, rootel).addClass(discussionSettingsTabClass);
		$(discussionSettingsExistingTab, rootel).removeClass(discussionSettingsTabClass);
		$(discussionSettingsExistingTab, rootel).addClass(discussionSettingsTabSelectedClass);
		$(discussionSettingsExistingContainer, rootel).show();
		fillListWithExistingDiscussions();
	});


	///////////////////////
	// Initial functions //
	///////////////////////
	
	/**
	 * Show the post in the pop-up settings window
	 * @param {String} response Json response with all the posts
	 * @param {Boolean} exists Check if the discussion exists
	 */
	var showPostInSettings = function(response, exists){
		// Check if there was already a post
		if (exists) {
			// Bind editPost to the submit button if the post is edited in the pop-up settings window
			$(discussionSettingsSubmit, rootel).bind("click",function(e,ui){
				editPost("0", $(discussionSettingsNewSubject, rootel).val(), $(discussionSettingsNewBody, rootel).val());
				sdata.container.informFinish(tuid);
			});
			
			// Parse all the posts
			var arrAllPosts = $.evalJSON(response);
			
			// Get the first post
			var firstPost = arrAllPosts[0];
			
			// Change the input of the subject and body with the subject and body of the first post
			// The firstpost is empty if there are no posts in the discussion
			if(firstPost){
				$(discussionSettingsNewSubject, rootel).val(firstPost.subject);
				$(discussionSettingsNewBody, rootel).val(firstPost.body);	
			}
		}else {
			$(discussionSettingsSubmit, rootel).bind("click",function(e,ui){
				addPost(true, "0");
			});
		}
	};
	
	/**
	 * Switch between main and settings page
	 * @param {Boolean} showSettings Show the settings of the widget or not
	 */
	if (showSettings){
		$(discussionMainContainer, rootel).hide();
		$(discussionSettings, rootel).show();
		
		// Check if you are editing a post or making a new one
		$.ajax({
			url : Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "discussion"),
			cache: false,
			success : function(data) {
				showPostInSettings(data,true);
			},
			error : function(status) {
				showPostInSettings(status,false);
			}
		});
	} else {
		$(discussionSettings, rootel).hide();
		$(discussionMainContainer, rootel).show();
		getPostsFromJCR();
	}
};

sdata.widgets.WidgetLoader.informOnLoad("discussion");