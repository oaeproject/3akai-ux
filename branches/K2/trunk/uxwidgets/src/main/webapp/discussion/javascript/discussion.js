var sakai = sakai || {};

/**
 * Initialize the discussion widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement Widget place
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.discussion = function(tuid, placement, showSettings){
	var json = false;				// Variable used to recieve information by json
	var me = false;					// Contains information about the current user
	var rootel = $("#" + tuid);		// Get the main div used by the widget
	var alwaysExpand = true;		// Always show all posts
	var editing = false;			// Currently editing a post
	var isCurrentPostNew = false;	// Is the post being send a new one or not
	var currentEditId;				// ID of the element that is currently being edited
	var currentReplyId = "0";		// ID of the post that is currently being replied to
	var selectedExistingDiscussionID // ID of the discussion-widget which is currently selected in the insert existing discussion form
	var hoveredExistingDiscussionID // ID of the discussion-widget which is currently hovered in the insert existing discussion form
	
	/**
	 * Get the id of the dicussion widget and show the post including replies
	 */
	var fillInUniqueId = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				showPosts(data,true);
			},
			onFail : function(status) {
				showPosts(status,false);
			}
		});
	}
	
	/**
	 * Format an input date (used by TrimPath)
	 * @param {Date} d Date that needs to be formatted
	 */
	var formatDate = function(d){
		var names_of_months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
		var am_or_pm = "";
		
		var current_hour = d.getHours();
		if (current_hour < 12) {am_or_pm = "AM";} else{am_or_pm = "PM";}
		if (current_hour == 0){current_hour = 12;}
		if (current_hour > 12){current_hour = current_hour - 12;}
		
		var current_minutes = d.getMinutes() + "";
		if (current_minutes.length == 1){current_minutes = "0" + current_minutes;}
		
		return(names_of_months[d.getMonth()].substring(0,3) + " " + d.getDate() + ", " +  d.getFullYear() + " at " + current_hour + ":" + current_minutes + am_or_pm);
	}
	
	/**
	 * Get the current user
	 */
	var getCurrentUser = function() {
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/me",
			onSuccess: function(data){
				me = eval('(' + data + ')');
				if (!me) {
					alert('An error occured when getting the current user.');
				}
			},
			onFail: function(status){
				alert("Couldn't connect to the server.");
			}
		});
	}
	getCurrentUser();
	
	/**
	 * Switch between main and settings page
	 * @param {Boolean} showSettings Show the settings of the widget or not
	 */
	if (showSettings){
		$("#discussion_mainContainer", rootel).hide();
		$("#discussion_settings", rootel).show();
		
		/** Check if it is an edit or a new post */
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				showPostInSettings(data,true);
			},
			onFail : function(status) {
				showPostInSettings(status,false);
			}
		});
	} else {
		$("#discussion_settings", rootel).hide();
		$("#discussion_mainContainer", rootel).show();
		fillInUniqueId();
	}
	
	/**
	 * Show the post in the pop-up settings window
	 * @param {String} response Json response with all the posts
	 * @param {Boolean} exists Check if the discussion exists
	 */
	var showPostInSettings = function(response, exists){
		/** Check if a post exists */
		if (exists) {
			/** Bind editPost to the submit button if the post is edited in the pop-up settings window */
			$("#discussion_SettingsSubmit", rootel).bind("click",function(e,ui){
				editPost(0, $("#discussion_txtSettingsSubject", rootel).val(), $("#discussion_txtSettingsBody", rootel).val());
				sdata.container.informFinish(tuid);
			});
			
			arrAllPosts = eval('(' + response + ')'); // Evaluate all the posts
			firstPost = arrAllPosts[0]; // Get the first post
			/** Change the input of the subject and body div with the subject and body of the first post */
			$("#discussion_txtSettingsSubject", rootel).val(firstPost.subject);
			$("#discussion_txtSettingsBody", rootel).val(firstPost.body);

		}else {
			/** Bind saveNewSettings to the submit button if the post doesn't already exists */
			$("#discussion_SettingsSubmit", rootel).bind("click",function(e,ui){
				addPost(false, "0");
			});
		}
	}
	
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
		$("#discussion_messages" + id, rootel).hide(); // Hide the div of the post you want to edit
		$("#discussion_postActions" + id, rootel).hide(); // Hide the actions of the post you are editing
		
		editContainer = $("#discussion_edit_template", rootel).clone();	// Clone the edit template div
		
		$("#discussion_messages" + id, rootel).after($(editContainer));	// Insert the cloned div after the hided div with the original post
		/** Insert the text of the post you want to edit in the input fields */
		$("#discussion_txtEditSubject", editContainer).val($("#discussion_postSubject"+id, rootel).text());
		sMessage = "";
		sMessage = $("#discussion_postMessage"+id, rootel).html();
		sMessage = sMessage.replace(/<br>/g, "\n"); // Replace br tags with \n tags 
		$("#discussion_txtEditMessage", editContainer).val(sMessage);
		
		/** Add binding to the cancel button */
		$("#discussion_edit_Cancel", editContainer).bind("click",function(e,ui){
			stopEditing(id);
		});
		
		/** Add binding to the save button */
		$("#discussion_edit_Save", editContainer).bind("click",function(e,ui){
			subject = $("#discussion_txtEditSubject", editContainer).val();
			message = $("#discussion_txtEditMessage", editContainer).val();
			
			editPost(id, subject, message);
			$("#discussion_postActions" + id, rootel).show();
		});
		$(editContainer).show();
		$("#discussion_txtEditSubject", editContainer).focus();
	}
	
	/**
	 * Stop editing
	 * @param {String} id Id of the post that you stop editing
	 */
	var stopEditing = function(id){
		$("#discussion_messages" + id, rootel).show();
		$("#discussion_postActions" + id, rootel).show();
		$(editContainer, rootel).remove();
		editing = false;
	}
	
	/**
	 * Compare 2 strings with each other
	 * @param {String} a
	 * @param {String} b
	 */
	var compare = function(a, b){
		a = a.toLowerCase();
		b = b.toLowerCase();
		return a < b ? -1 : a > b ? 1 : 0;
	}
	
	/**
	 * Save all the posts
	 * @param {String[]} posts Array containing all the posts
	 * @param {function} functionOnComplete Function that will be executed after a save
	 */
	var savePostsToDatabase = function(posts, functionOnComplete){
		posts.sort(function(a, b){
			return compare(a.postId, b.postId);
		})
		str = sdata.JSON.stringify(posts); // Convert the posts to a JSON string
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "discussion", str, functionOnComplete);
	}

	/**
	 * Get a post out off an array by entering the id
	 * @param {String} id Id of the post
	 * @returns {[Object, Integer]} returns the post object and the id of the post inside the array
	 */
	var getPostWithIndex = function(id, posts) {
		var currentPostWithIndex = [];
		var currentPost = {};
		jQuery.each(posts, function(intIndex){
			var extraVar = this;
			if (extraVar.postId == id){
				currentPostWithIndex.push(extraVar);
				currentPostWithIndex.push(intIndex);
				return false;
			}
		});
		return currentPostWithIndex;
	}
	
	/**
	 * Get a discussion out off an array by entering the tuid
	 * @param {String} id tuid of the post
	 * @returns {[Object, Integer]} returns the discussion object and the index of the post inside the array
	 */
	var getDiscussionIndex = function(id, discussions){
		var currentDiscussionWithIndex = [];
		for (var i = 0; i < discussions.length; i++) {
			if(typeof discussions != "undefined"){
				if (discussions[i].tuid == id){
				currentDiscussionWithIndex.push(discussions[i]);
				currentDiscussionWithIndex.push(i);
				return currentDiscussionWithIndex;
				}
			}
			
		}
		return currentDiscussionWithIndex;
	}
	
	/**
	 * Submit the edited post
	 * Gets all the posts, changes the post that has been edited and then sends them back to the server
	 * @param {String} id Id of the post that is edited
	 * @param {String} subject Subject of the post that is edited
	 * @param {String} message Body of the post that is edited
	 */
	var editPost = function(id, subject, message){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				arrPosts = eval('(' + data + ')'); // Evaluate all the posts
				
				/** Change the subject and body of the post */
				var postWithIndex = getPostWithIndex(id, arrPosts);
				post = postWithIndex[0];
				post.subject = subject;
				post.body = message.replace(/\n/g, "<br />");
				post.editedBy = me.preferences.uuid;
				post.editedDate = new Date();
				arrPosts[postWithIndex[1]] = post;

				savePostsToDatabase(arrPosts, editComplete); // Save the adjusted posts to the database
			},
			onFail : function(status) {
				alert("The posts could not be recieved from the server.")
			}
		});
		if(id == "0"){
			sdata.Ajax.request({
				url: "/sdata/f/" + placement.split('/',1)[0] + "/_discussion?sid=" + Math.random(),
				httpMethod: "GET",
				onSuccess: function(data){
					arrDiscussions = eval('(' + data + ')'); // Evaluate all the discussions
					var postWithIndex = getDiscussionIndex(tuid, arrDiscussions.items);
					post2 = postWithIndex[0];
					post2.subject = subject;
					post2.body = message.replace(/\n/g, "<br />");
					post2.editedBy = me.preferences.uuid;
					post2.editedDate = new Date();
					arrDiscussions.items[postWithIndex[1]] = post2;
					
					var tostring = sdata.JSON.stringify(arrDiscussions);
					sdata.widgets.WidgetPreference.save("/sdata/f/" + placement.split('/',1)[0], "_discussion", tostring, finishNewSettings);
					
				},
				onFail: function(status){
					
					alert("The posts could not be recieved from the server.");
				}
			});
		}
	}
	
	/**
	 * When the edit is completed
	 */
	var editComplete = function(){
		/** Show new values */		
		if (typeof editContainer != "undefined") {
			$(editContainer, rootel).remove();
		}else {
			sakai.dashboard.showWidgetPreviewEdit();
		}
		/** Render the posts with the template engine */
		fillInUniqueId();
	}
	
	/**
	 * Reply to a post
	 * @param {String} id Id of the post that is replied to
	 */
	var replyPost = function(id){
		$("#discussion_inputForm", rootel).show();
		scrollTo($("#discussion_inputForm", rootel)); // Jump to reply form
		$("#discussion_txtSubject", rootel).focus(); // Focus on the subject field
		$("#discussion_txtSubject", rootel).val("Re: " + $("#discussion_postSubject" + id,rootel).text());
	}
	
	/**
	 * Deletes a post
	 * @param {String} id Id of the post that needs to be deleted
	 */
	var deletePost = function(id){
		if(id == "0"){
			var arrPosts = [];
			savePostsToDatabase(arrPosts, deleteComplete); // Save the adjusted posts to the database
		}else {
			sdata.Ajax.request({
				url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
				httpMethod : "GET",
				onSuccess : function(data) {
					var arrPosts = eval('(' + data + ')'); // Evaluate all the posts
					arrPosts.splice(getPostWithIndex(id, arrPosts)[1],1); // Remove the post out of the array
					
					deleteNextPosts(arrPosts, id);
					
					adjustIdAfterDelete(arrPosts, id);
					
					savePostsToDatabase(arrPosts, deleteComplete); // Save the adjusted posts to the database
				},
				onFail : function(status) {
					alert("The posts could not be found.")
				}
			});
		}
		
		if(id == "0"){
			sdata.Ajax.request({
				url: "/sdata/f/" + placement.split('/',1)[0] + "/_discussion?sid=" + Math.random(),
				httpMethod: "GET",
				onSuccess: function(data){
					arrDiscussions = eval('(' + data + ')'); // Evaluate all the discussions
					
					arrDiscussions.items.splice(getDiscussionIndex(tuid, arrDiscussions.items)[1],1);
					
					var tostring = sdata.JSON.stringify(arrDiscussions);
					sdata.widgets.WidgetPreference.save("/sdata/f/" + placement.split('/',1)[0], "_discussion", tostring, finishNewSettings);
					
				},
				onFail: function(status){
					
					alert("The posts could not be recieved from the server.");
				}
			});
		}
		
	}
	
	/**
	 * Delete all the posts of a specific id
	 * @param {Array} posts All the posts
	 * @param {String} id Id of the post
	 */
	var deleteNextPosts = function(posts, id){
		counter = 0
		while(true){
			if(getPostWithIndex(id+"_"+counter, posts).length > 0){
				posts.splice(getPostWithIndex(id+"_"+counter, posts)[1],1);
				deleteNextPosts(posts, id+"_"+counter);
				counter++;
			}else{
				break;
			}
		}
	}
	
	/**
	 * Adjust the posts after deleting
	 * @param {Array} posts All the posts
	 * @param {String} id Id of the post
	 */
	var adjustIdAfterDelete = function(posts, id){
		counter = 0;
		tempArray = id.split("_");
		
		while (true) {
			tempElement = tempArray[tempArray.length - 1]; // Get last element
			tempElementInt = parseInt(tempElement);
			tempElementInt++; // Raise by 1
			tempArray[tempArray.length - 1] = tempElementInt + "";
			
			tempPost = getPostWithIndex(tempArray.join("_"), posts);
			if (tempPost.length > 0) {
				tempArray2 = tempPost[0].postId.split("_");
				tempElement2 = tempArray[tempArray.length - 1]; // Get last element
				tempElementInt2 = parseInt(tempElement2);
				tempElementInt2--;
				tempArray2[tempArray2.length - 1] = tempElementInt2 + "";
				tempPost[0].postId = tempArray2.join("_");
				posts[tempPost[1]] = tempPost[0];
				adjustIdAfterDelete(posts, tempPost[0].postId);
			}
			else {
				break;
			}
		}
	}
	
	/**
	 * When the delete is completed
	 * @param {String} id Id of the post that is deleted
	 * @param {Int} countPosts Total number of replies
	 */
	var deleteComplete = function(){
		fillInUniqueId();
	}
	
	/**
	 * Parse a json string to a valid date
	 * @param {String} dateInput String of a date that needs to be parsed
	 * @returns {Date}
	 */
	var parseDate = function(dateInput) {
		/** Get the date with the use of regular expressions */
		match = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/.exec(dateInput); // 2009-03-03T17:53:48Z
		d = new Date();
		d.setDate(match[3]);
		d.setMonth(match[2]-1);
		d.setYear(match[1]);
		d.setHours(match[4]);
		d.setMinutes(match[5]);
		d.setSeconds(match[6]);
		
		return d;
	}
	
	/**
	 * Show all the posts
	 * @param {String} response Json response with all the posts
	 * @param {Boolean} exists Check if the discussion exists
	 */
	var showPosts = function(response, exists){
		if (exists){
			try {
				var arrPosts = eval('(' + response + ')'); // Evaluate all the posts
				
				if(!(arrPosts.length > 0)){
					$("#discussion_noPosts", rootel).show();
					$("#discussion_container", rootel).hide();
					$("#discussion_inputForm", rootel).hide(); // Hide the input form
				} else{
					$("#discussion_noPosts", rootel).hide();
					var posters = [];
					var uids = [];
					/** Add the unique id to the array of uids if the uid is not in it already */
					var addToUids = function(uid) {
						if(!uids.contains(uid)) {
							uids.push(uid);
						};
					};
					
					var getPostInfo = function() {					
						sdata.Ajax.request({
							httpMethod: "GET",
							url: "/rest/me/" + uids,
							onSuccess: function(data){
								json = eval('(' + data + ')'); // Evaluate the info of the current user
								jQuery.each(json.users, function(intIndex){
										var user = this;
										posters[intIndex] = user;
									}
								);
								
								$("#discussion_posts", rootel).empty(); // Clear the old posts
								$("#discussion_inputForm", rootel).hide(); // Hide the input form
								arrNPosts = [];
								jQuery.each(arrPosts, function(intIndex){
										var post = this;
										uid = post.uid;
										post.date = formatDate(parseDate(post.date));
										post.body = post.body.replace(/\n/g,"<br \>");
										post.showEdit = false;
										post.showDelete = false;
										
										var tempArray = post.postId.split("_");
										(tempArray[tempArray.length-1] == "0") ? post.firstReply = true : post.firstReply = false; // Check if it's the first reply of a section
										
										/** Check if the post is the last reply of a section */
										post.lastReply = false;
										post.countCloseDivs = 0;
										if (intIndex > 0) {
											var lastElement = tempArray[tempArray.length-1];
											var lastElementInt = parseInt(lastElement);
											lastElementInt ++;
											
											tempArray[tempArray.length-1] = lastElementInt + "";											
										
											var tempElement = getPostWithIndex(tempArray.join("_"), arrPosts); // Gets the post with next index e.g. 0_1 -> 0_2 
											var tempElement2 = arrPosts[intIndex + 1]; // Next post in the array
											if (tempElement.length>0) {
												post.lastReply = false;
											}else{
												if (tempElement2 != undefined) {
													if (tempElement2.postId == tempArray.join("_")) {
														post.lastReply = false;
													}
													else {
														if(getPostWithIndex(post.postId + "_0", arrPosts).length > 0){
															post.lastReply = false;
														}else{
															countCloseDivs = post.postId.split("_").length - tempElement2.postId.split("_").length;
															countCloseDivsArr = [];
															for (i = 0; i < countCloseDivs; i++) {
																countCloseDivsArr.push("1");
															}
															post.countCloseDivs = countCloseDivsArr;
															post.lastReply = true;
														}
													}
												} else {
													post.lastReply = false;
												}
											}
										}
										
										/** Gets the total amount of replies on a post */
										if(intIndex == 0){
											post.replies = arrPosts.length-1;
										}else {
											count = 0;
											post.replies = 0;
											tempArray = post.postId.split("_");
											while(true){
												tempArray.push(count+"");
												
												if(getPostWithIndex(tempArray.join("_"), arrPosts).length > 0) {
													count ++;
													tempArray.pop();
												}else{
													break;
												}
											}
											post.replies = count;
										}
										
										/** Show or hide the edit or delete button */
										if(me.preferences.superUser || me.preferences.uuid == uid){
											post.showEdit = true;
											post.showDelete = true;
										}
										
										/** Get the user's firstName, lastName and picture if it's in the database */
										for(var i = 0; i < uids.length; i++) {
											if(uids[i] == uid) {
												post.picture = "";
												if (posters[i].profile) {
													post.name = posters[i].profile.firstName + " " + posters[i].profile.lastName
													
													if (posters[i].profile.picture) {
														image = eval('(' + posters[i].profile.picture + ')');
														post.picture = "/sdata/f/_private" + posters[i].userStoragePrefix + image.name;
													}
												}
												else {
													post.name = uid; // if the name can't be recieved, use the uid
												}
											}
										}
										
										if(post.editedBy != ""){
											for (var i = 0; i < uids.length; i++) {
												if (uids[i] == post.editedBy) {
													if (posters[i].profile) {
														post.editedByName = posters[i].profile.firstName + " " + posters[i].profile.lastName;
													}else{
														post.editedByName = post.editedBy;
													}
												}
											}
											post.editedByDate = formatDate(parseDate(post.editedDate));
										}
										arrNPosts.push(post);
									}
								);
								json = {};
								json.posts = arrNPosts;
								
								/** Render the posts with the template engine */
								$("#discussion_container", rootel).html(sdata.html.Template.render('discussion_rendered_template',json));
								
								if (alwaysExpand) {
									$("#discussion_posts", rootel).show();
									$("#discussion_showall", rootel).text("Hide all");
								}
								else {
									$("#discussion_posts", rootel).hide();
									$("#discussion_showall", rootel).text("Show all");
								}
								
								/** Add the action listeners */
								$(".discussion_t_showall", rootel).hide();
								$(".discussion_showall", rootel).bind("click",function(e,ui){
									//$(".discussion_posts", rootel).toggle();
									var id = e.target.id;
									id = id.replace("discussion_t_showall","");
									id = id.replace("discussion_t_hideall","")
									
									
									if (id == "0") {
										$("#discussion_first").next().toggle(1, toggleValue(id));
									}
									else {
										$("#discussion_post" + id, rootel).next().toggle(1, toggleValue(id));
									}
									
								});
								
								/** Bind the reply button */
								$(".discussion_reply", rootel).bind("click",function(e,ui){
									currentReplyId = e.target.id.replace("discussion_reply","");
									replyPost(currentReplyId);
								});
								/** Bind the delete button */
								$(".discussion_delete", rootel).bind("click",function(e,ui){
									deletePost(e.target.id.replace("discussion_delete",""));
								});
								/** Bind the edit button */
								$(".discussion_edit", rootel).bind("click",function(e,ui){
									showEditPost(e.target.id.replace("discussion_edit",""));
								});
							},
							onFail: function(status){
								alert('Failed to receive the posts.');
							}
						});
					}
				}

				/** Add the uid for each user to uids  */
				jQuery.each(arrPosts, function(intIndex){
					var post = this;
					addToUids(post.uid);
					addToUids(post.editedBy);
				});
				/** Only show the post if there is any unique id */
				if(uids) {
					getPostInfo();
				};
			} catch (err){
				alert(err);
			}
		} else {
			alert('Failed to show the posts.');
		}
	}
	
	/**
	 * Toggle replies of a post
	 * @param {String} id Id of the post where the replies need to be toggled
	 */
	var toggleValue = function(id){
		if($("#discussion_t_hideall" + id, rootel).is(':visible')) {
			$("#discussion_t_hideall" + id, rootel).hide();
			$("#discussion_t_showall" + id, rootel).show();
		}else {
			$("#discussion_t_hideall" + id, rootel).show();
			$("#discussion_t_showall" + id, rootel).hide();
		}
	}

	/**
	 * Gets the id of the reply that will be submitted
	 * @param {Array} posts Array containing all the posts
	 * @param {String} id Id of the post that needs to be adjusted
	 */
	var adjustPostId = function(posts, id){
		var counter = 0;
		var postWithIndex = getPostWithIndex(id+"_"+counter, posts);
		
		if(postWithIndex.length == 0){
			return id+"_"+counter;
		}else{
			var postExists = true;
			while(postExists){
				counter ++;
				var postWithIndex = getPostWithIndex(id+"_"+counter, posts);
				if (postWithIndex.length == 0) {
					return id + "_" + counter;
					break;
				}
			}
			return id+"_"+counter;
		}
	}

	/**
	 * Add a post to the discussion
	 * @param {Boolean} isNewPost Is it a new post or an existing one
	 */
	var addPost = function(isNewPost, postId){
		isCurrentPostNew = isNewPost;
		if(isNewPost){
			var subject = $("#discussion_txtSubject",rootel).val();
			var body = $("#discussion_txtBody",rootel).val();
		}else{
			var subject = $("#discussion_txtSettingsSubject",rootel).val();
			var body = $("#discussion_txtSettingsBody",rootel).val();
		}
		
		/** Check if the subject is empty */
		if ((!subject || subject.replace(/ /g,"%20") == "") && ($("#discussion_MakeNewForm", rootel).is(':visible'))){
			alert("Please enter a valid subject.");
		}
		else if (((typeof selectedExistingDiscussionID == "undefined") || (selectedExistingDiscussionID == "")) && ($("#discussion_ChooseExistingForm", rootel).is(':visible'))){
			alert("Please select an existing discussion.");
		}
		else {
			if (me){
				post = {"uid": me.preferences.uuid, "body": body, "subject": subject, "date" : new Date(), "postId" : postId+"", "editedBy" : ""}; // Fill in the JSON post object
				
				var arrPosts = new Array();
				
				if (isNewPost) {
					sdata.Ajax.request({
						url: "/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
						httpMethod: "GET",
						onSuccess: function(data){
							arrPosts = eval("(" + data + ")"); // Evaluate all the posts
							post.postId = adjustPostId(arrPosts, postId);
							arrPosts.push(post);
							
							savePostsToDatabase(arrPosts, finishNewSettings); // Save the posts to the database
							
							/** Clear the fields of the reply form */
							clearReplyFields();
						},
						onFail: function(status){
							alert("failed to retrieve other posts.");
						}
					});
				}else {
					if($("#discussion_MakeNewForm", rootel).is(':visible')){
						arrPosts.push(post); // Add the new post to the array
						savePostsToDatabase(arrPosts, finishNewSettings);
						
							if(postId == "0"){
								post2 = {"uid": me.preferences.uuid,"tuid": tuid, "body": body, "subject": subject, "date" : new Date(), "postId" : postId+""}; // Fill in the JSON post object
								sdata.Ajax.request({
								url: "/sdata/f/" + placement.split('/',1)[0] + "/_discussion?sid=" + Math.random(),
								httpMethod: "GET",
								onSuccess: function(data){
									createExcistingDiscussion(data,true,post2);
								
								},
								onFail: function(status){
								
									createExcistingDiscussion(status,false,post2);
								}
							});
						}
					}
					else{
						sdata.Ajax.request({
							url :"/sdata/f/" + placement + "/" + selectedExistingDiscussionID + "/discussion?sid=" + Math.random(),
							httpMethod : "GET",
							onSuccess : function(data) {
								sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "discussion", data, finishNewSettings);
							},
							onFail : function(status) {
								alert("failed to retrieve posts.");
							}
						});
					}
				}
			} else {
				alert('An error occured when getting the current user.')
			}
		}
	}
	
	/**
	 * Gets all the existing discussions from current site
	 */
	var fillListWithExistingDiscussions = function(){
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/f/" + placement.split('/',1)[0] + "/_discussion?sid=" + Math.random(),
			onSuccess: function(data){
					var json = eval('(' + data + ')');
					if (typeof json.items != undefined) {
						$(".discussions_noDiscussions", rootel).hide()
				
						/** Render the posts with the template engine */
						$("#discussion_ChooseExistingForm", rootel).html(sdata.html.Template.render('discussion_ChooseExistingTemplate',json));
						
						/** Bind discussions cmb */
						$(".discussion_listItem", rootel).bind("click",function(e,ui){
							if(typeof $("#discussion_listItem"  + selectedExistingDiscussionID, rootel) != "undefined"){
								$("#discussion_listItem" + selectedExistingDiscussionID, rootel).addClass("discussion_listItem");
								$("#discussion_listItem" + selectedExistingDiscussionID, rootel).removeClass("discussion_SelectedlistItem");
							}
							selectedExistingDiscussionID = e.target.id.replace("discussion_listItem","");
							e.target.className = "discussion_SelectedlistItem";
							
						});
						$(".discussion_listItem", rootel).bind("mouseover",function(e,ui){
							if(typeof $("#discussion_listItem"  + hoveredExistingDiscussionID, rootel) != "undefined" && hoveredExistingDiscussionID != selectedExistingDiscussionID){
								$("#discussion_listItem" + hoveredExistingDiscussionID, rootel).addClass("discussion_listItem");
								$("#discussion_listItem" + hoveredExistingDiscussionID, rootel).removeClass("discussion_SelectedlistItem");
							}
							hoveredExistingDiscussionID = e.target.id.replace("discussion_listItem","");
							e.target.className = "discussion_SelectedlistItem";
							
						});
					}
					else{
						$(".discussions_noDiscussions", rootel).show()
					}
			},
			onFail: function(status){
				$(".discussions_noDiscussions", rootel).show()
			}
		});
	}
	
	/**
	 * Creates a new discussion in the _discussion file 
	 * @param {Object} response
	 * @param {Object} exists
	 */
	var createExcistingDiscussion = function(response, exists,post){
		var json = {};
		json.items = [];
		if (exists){
			json = eval('(' + response + ')');
		}

		var index = json.items.length;
		json.items[index] = post;
		var tostring = sdata.JSON.stringify(json);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement.split('/',1)[0], "_discussion", tostring, finishNewSettings);
	}
	
	/** 
	 * Scroll to a specific element in a page
	 * @param {Object} element The element you want to scroll to
	 */
	var scrollTo = function(element) {
		$('html, body').animate({scrollTop: element.offset().top}, 1);
	}
	
	/**
	 * Executes after a post has been added to the database
	 */
	var finishNewSettings = function() {
		if (!isCurrentPostNew) {
			sdata.container.informFinish(tuid);
		}else{
			fillInUniqueId();
		}
	}
	
	/**
	 * Clear the fields of the reply form
	 */
	var clearReplyFields = function() {
		$("#discussion_txtSubject", rootel).val('');
		$("#discussion_txtBody", rootel).val('');
	}
	
	/** Bind the submit button */
	$("#discussion_Submit", rootel).bind("click",function(e,ui){
		addPost(true, currentReplyId);
	});
	
	/** Bind the cancel button */
	$("#discussion_Cancel", rootel).bind("click",function(e,ui){
		clearReplyFields();
		$("#discussion_inputForm", rootel).hide(); // Hide the input form
	});
	
	/** Bind the settings cancel button */
	$("#discussion_SettingsCancel", rootel).bind("click",function(e,ui){
		$("#discussion_inputForm", rootel).hide();
		sdata.container.informCancel(tuid);
	});
	
	/** Bind the new discussion button */
	$("#discussion_MakeNew", rootel).bind("click",function(e,ui){
		$("#discussion_MakeNewForm", rootel).show();
		$("#discussion_MakeNew", rootel).removeClass("discussion_selectedtab");
		$("#discussion_MakeNew", rootel).addClass("discussion_tab");
		$("#discussion_ChooseExisting", rootel).removeClass("discussion_tab");
		$("#discussion_ChooseExisting", rootel).addClass("discussion_selectedtab");
		$("#discussion_ChooseExistingForm", rootel).hide();
	});
	
	/** Bind the existing discussion button */
	$("#discussion_ChooseExisting", rootel).bind("click",function(e,ui){
		$("#discussion_ChooseExistingForm", rootel).show();
		$("#discussion_MakeNew", rootel).removeClass("discussion_tab");
		$("#discussion_MakeNew", rootel).addClass("discussion_selectedtab");
		$("#discussion_ChooseExisting", rootel).removeClass("discussion_selectedtab");
		$("#discussion_ChooseExisting", rootel).addClass("discussion_tab");
		$("#discussion_MakeNewForm", rootel).hide();
		fillListWithExistingDiscussions();
	});
};

sdata.widgets.WidgetLoader.informOnLoad("discussion");