var sakai = sakai || {};
/*
 * Format an input date (used by TrimPath)
 */
var formatDate = function(d){
	return(d.toGMTString());
}
	
sakai.discussion = function(tuid, placement, showSettings){
	var json = false;
	var rootel = $("#" + tuid);		// gets the main div used by the widget
	var me = false;
	var argumentsCalleeDone = false;
	var alwaysExpand = true;		// true = expanded view
	
	/*
	 * Get the id of the dicussion widget and show the post including replies
	 */
	var fillInUniqueId = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				showPost(data,true);
			},
			onFail : function(status) {
				showPost(status,false);
			}
		});
	}
	
	/*
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
	
	if (showSettings){
		$("#discussion_mainContainer", rootel).hide();
		$("#discussion_settings", rootel).show();
		
		// check if it's an edit or a new post
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
		$("#" + tuid + " #discussion_settings").hide();
		$("#" + tuid + " #discussion_mainContainer").show();
		fillInUniqueId();
	}
	
	var showPostInSettings = function(response, exists){
		if (exists) {
			$("#discussion_SettingsSubmit", rootel).bind("click",function(e,ui){
				editPost(0, $("#discussion_txtSettingsSubject", rootel).val(), $("#discussion_txtSettingsBody", rootel).val());
			});
			
			arrAllPosts = eval('(' + response + ')');
			firstPost = arrAllPosts[0];
			$("#discussion_txtSettingsSubject", rootel).val(firstPost.subject);
			$("#discussion_txtSettingsBody", rootel).val(firstPost.body);

		}else {
			$("#discussion_SettingsSubmit", rootel).bind("click",function(e,ui){
				saveNewSettings();
			});
		}
	}
	
	var showEditPost = function(id) {
		$("#discussion_messages" + id, rootel).hide();		// hide the div of the post you want to edit
		
		editContainer = $("#discussion_edit_template", rootel).clone();	// clone the edit template div
		
		$("#discussion_messages" + id, rootel).after($(editContainer))	// insert the cloned div after the div you hided
		$("#discussion_txtEditSubject", editContainer).val($("#discussion_postSubject"+id, rootel).text()) // insert the text of the post you want to eddid in the input 
		$("#discussion_txtEditMessage", editContainer).val($("#discussion_postMessage"+id, rootel).text())
		
		// add binding to the cancel button
		$("#discussion_edit_Cancel", editContainer).bind("click",function(e,ui){
			$("#discussion_messages" + id, rootel).show();
			$(editContainer, rootel).remove();
		});
		
		//	add binding to the save button
		$("#discussion_edit_Save", editContainer).bind("click",function(e,ui){
			subject = $("#discussion_txtEditSubject", editContainer).val();
			message = $("#discussion_txtEditMessage", editContainer).val();
			editPost(id, subject, message);		
		});

		$(editContainer).show();
	}
	
	var savePostsToDatabase = function(posts, functionOnComplete){
		str = sdata.JSON.stringify(posts);
		// save all posts to the database
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "discussion", str, functionOnComplete);
	}
	
	/*
	 * Submit the edited post
	 * Gets all the posts, changes the post that has been edited and then sends them back to the server
	 */
	var editPost = function(id, subject, message){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				arrPosts = eval('(' + data + ')');
				
				post = arrPosts[id];
				post.subject = subject;
				post.body = message;
				
				arrPosts[id] = post;

				savePostsToDatabase(arrPosts, editComplete(id, subject, message));
			},
			onFail : function(status) {
				alert("The posts could not be recieved from the server.")
			}
		});
	}
	
	/*
	 * When the edit is completed
	 */
	var editComplete = function(id, subject, message){
		// show new values			
		$("#discussion_postSubject"+id, rootel).text(subject);
		$("#discussion_postMessage"+id, rootel).text(message);
		
		$("#discussion_messages" + id, rootel).show();
		if (typeof editContainer != "undefined") {
			$(editContainer, rootel).remove();
		}else {
			sakai.dashboard.showWidgetPreviewEdit();
		}
	}
	
	/*
	 * Deletes a post
	 */
	var deletePost = function(id){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				var arrPosts = eval('(' + data + ')');
				arrPosts.splice(id,1);
				
				savePostsToDatabase(arrPosts, deleteComplete(id, arrPosts.length - 1));
			},
			onFail : function(status) {
				alert("The posts could not be found.")
			}
		});
	}
	
	/*
	 * When the edit is completed
	 */
	var deleteComplete = function(id, countPosts){
		$("#post" + id, rootel).remove();
		// change the number of people who have responded
		setNumberOfReplies(countPosts);
	}
	
	/*
	 * Change the number of replies
	 */
	var setNumberOfReplies = function(iReplies) {
		s = iReplies + " ";
		if (iReplies == 1) {
			s += "person has " 
		}
		else {
			s += "people have "
		}
		$("#discussion_totalReplies", rootel).text(s);
		
	}
	
	/*
	 * Show all the posts
	 */
	var showPost = function(response, exists){
		if (exists){
			try {
				var arrPosts = eval('(' + response + ')');
				
				// Adds contains functionality to Array
				Array.prototype.contains = function (element) {
					for (var i = 0; i < this.length; i++) {
						if (this[i] == element) {
							return true;
						}
					}
					return false;
				}

				var uids = [];
				var addToUids = function(uid) {
					if(!uids.contains(uid)) {
						uids.push(uid);
					};
				};
				var posters = [];
					
				var getUserInfo = function() {					
					sdata.Ajax.request({
						httpMethod: "GET",
						url: "/rest/me/" + uids,
						onSuccess: function(data){
							json = eval('(' + data + ')');
							jQuery.each(json.users, function(intIndex){
									var user = this;
									/*
									if (user.profile) {
										posters[intIndex] = user.profile.firstName + ' ' + user.profile.lastName;
									}
									else {
										posters[intIndex] = uids[intIndex]; 
									}
									*/
									posters[intIndex] = user;
									
								}
							);
							
							//	clear all old posts
							$("#discussion_posts", rootel).empty();
								
							$("#discussion_inputForm", rootel).hide();
							arrNewPosts = [];
							arrFirstPost = [];
							jQuery.each(arrPosts, function(intIndex){
									var post = this;
										
									var uid = post.uid;
									post.id = intIndex;
									// 2009-03-03T17:53:48Z
									var match = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/.exec(post.date);
									d = new Date();
									d.setDate(match[3]);
									d.setMonth(match[2]-1);
									d.setYear(match[1]);
									d.setHours(match[4]);
									d.setMinutes(match[5]);
									d.setSeconds(match[6]);
									
									post.date = d;
									
									post.showEdit = false;
									post.showDelete = false;
									
									if(me.preferences.superUser || me.preferences.uuid == uid){
										post.showEdit = true;
										post.showDelete = true;
									}
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
												// couldn't find a name, insert uid
												post.name = uid;
											}
										}
									}
									if (intIndex == 0) {
										arrFirstPost.push(post);
									}
									else {
										arrNewPosts.push(post);
									}										
								}
							
							
							);
							//alert(arrNewPosts);
							
							//$("#contactinformation_list_output", rootel).html(sdata.html.Template.render('contactinformation_list_template',mockupfeed));
							json = {};
							json.firstPost = arrFirstPost;
							json.items = arrNewPosts;
							json.firstPost[0].totalReplies = arrNewPosts.length;
							$("#discussion_first", rootel).html(sdata.html.Template.render('discussion_rendered_template',json));
							$("#discussion_posts", rootel).html(sdata.html.Template.render('discussion_rendered_template_reply',json));
							
							// show the number of people who have responded
							setNumberOfReplies(arrNewPosts.length);
							
							// add the action listeners
							
							if (alwaysExpand) {
								$("#discussion_posts", rootel).show();
								$("#discussion_showAll", rootel).text("Hide all");
							}
							else {
								$("#discussion_showAll", rootel).text("Show all");
								$("#discussion_posts", rootel).hide();
							}
								
								
							$("#discussion_showAll", rootel).bind("click",function(e,ui){
								$("#discussion_posts", rootel).toggle();
								if($("#discussion_showAll", rootel).text() == "Show all"){
									$("#discussion_showAll", rootel).text("Hide all");
								}else
								{
									$("#discussion_showAll", rootel).text("Show all");
								}
							});
							
							// show form

							$(".discussion_reply", rootel).bind("click",function(e,ui){
								$("#discussion_inputForm", rootel).show();
								// jump to form
								//$("#discussion_inputForm", rootel).scrollTop = $("#discussion_inputForm", rootel).offsetTop;
								scrollTo($("#discussion_inputForm", rootel));
							});	
							//delete
							$(".discussion_delete", rootel).bind("click",function(e,ui){
								deletePost(e.target.id.replace("discussion_delete",""));
							});	
							//edit
							$(".discussion_edit", rootel).bind("click",function(e,ui){
								showEditPost(e.target.id.replace("discussion_edit",""));
							});	
							
						},
						onFail: function(status){
							alert('Failed');
						}
					});
				}
				
				jQuery.each(arrPosts, function(intIndex){
						var post = this;
						addToUids(post["uid"]);
					}
				);
				if(uids) {
					getUserInfo();
				};
				
				

				
			} catch (err){

				alert(err);

				//$("#tangler_output", rootel).text("No valid Tangler forum found");
			}
		} else {
			alert('failed');
		//	$("#tangler_output", rootel).text("No valid Tangler forum found");
		}
	}

	var saveNewSettings = function(){
		var subject = $("#discussion_txtSettingsSubject",rootel).val();
		var body = $("#discussion_txtSettingsBody",rootel).val();
		if (!subject || subject.replace(/ /g,"%20") == ""){
			sdata.Ajax.request({
				url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
				httpMethod : "DELETE",
				onSuccess : function(data) {
					finishNewSettings(true);
				},
				onFail : function(status) {
					finishNewSettings(false);
				}
			});
		}
		else {
			if (me){
				
				post = {"uid": me.preferences.uuid, "body": body, "subject": subject, "date" : new Date()};
				
				var arrPosts = new Array();
				arrPosts.push(post);
				
				//	save all posts too db
				var str = sdata.JSON.stringify(arrPosts);
				//	save post
				sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "discussion", str, finishNewSettings);
			} else {
				alert('An error occured when getting the current user.')
			}
		}
	}
	
	var addNewPost = function(){
		var subject = $("#discussion_txtSubject",rootel).val();
		var body = $("#discussion_txtBody",rootel).val();
		if (!subject || subject.replace(/ /g,"%20") == ""){
			alert("Please enter a valid subject.")
		}
		else {
			if (me){
				d = new Date();
				//July 21, 1983 01:15:00"
				post = {"uid": me.preferences.uuid, "body": body, "subject": subject, "date" : d };
				
				var allPosts;
				sdata.Ajax.request({
					url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						allPosts = eval("(" + data + ")");
						allPosts.push(post);
						//	save all posts too db
						var str = sdata.JSON.stringify(allPosts);
						//	save post
						sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "discussion", str, finishNewSettings);
						$("#discussion_txtSubject",rootel).val('');
						$("#discussion_txtBody",rootel).val('');
					},
					onFail : function(status) {
						alert("failed to retrieve other posts");
					}
				});
			} else {
				alert('An error occured when getting the current user.')
			}
		}
	}
	
	var scrollTo = function(theElement) {

		var selectedPosX = 0;
		var selectedPosY = 0;
		              
		while(theElement != null){
		    selectedPosX += theElement.offsetLeft;
		    selectedPosY += theElement.offsetTop;
		    theElement = theElement.offsetParent;
		}
		                        		      
		 window.scrollTo(selectedPosX,selectedPosY);


	}

	var finishNewSettings = function(success) {
	
		fillInUniqueId();
		$("#" + tuid + " #discussion_mainContainer").show();
		$("#" + tuid + " #discussion_settings").hide();
	}
	
	$("#discussion_Submit", rootel).bind("click",function(e,ui){
		addNewPost();
	});
	$("#discussion_SettingsCancel", rootel).bind("click",function(e,ui){
		$("#discussion_inputForm", rootel).hide();
	});	
	
	

};


sdata.widgets.WidgetLoader.informOnLoad("discussion");