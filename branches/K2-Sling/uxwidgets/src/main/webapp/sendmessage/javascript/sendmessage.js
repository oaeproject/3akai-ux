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

/*global $, sdata, opensocial, Config */

var sakai = sakai || {};
sakai.sendmessage = function(tuid, placement, showSettings) {

	//////////////////////////////
	// Configuration variables 	//
	//////////////////////////////

	var rootel = $(tuid);
	
	var user = false; 	//	user object that contains the information for the 
						//	user that should be posted to.
	var allowOthers = false;	//	If the user can add other receivers.
	var allFriends = [];		//	Array that will contain all the info about this users friends.
	var selectedFriendsToPostTo = [];
	var me = sdata.me;
	var fadeOutTime = 1500; //	The time it takes for the lightbox to fade out (in ms).
	var layover = true;		//	Will this widget be in a popup or inside another element.
	var putContentInId = null;	//	 if the widget runs in another element, this variable contains the id
	var callbackWhenDone = null;	//	Callback function for when the message gets sent
	var generalMessageFadeOutTime = 5000;	
	
	
	//	CSS IDs	
	var dialogBoxContainer = "#sendmessage_dialog_box";
	var dialogFooterContainer = "#sendmessage_dialog_footer";
	
	var messageDialogContainer = '#message_dialog';
	var messageDone = "#message_done";
	var messageForm = "#message_form";
	
	var messageSingleToContainer = "#sendmessage_fixed_to_user";
	var messageMultipleToContainer = "#sendmessage_multiple_to_container";
	var messageMultipleToInputContainer = "#sendmessage_multiple_to_input_container";
	var messageMultipleToBox = "#sendmessage_box_template";
	var messageMultipleToBoxResult = ".sendmessage_multipleBox_result";
	var messageMultipleToBoxDelete = ".sendmessage_multipleBox_delete";
	var messageMultipleToWhat = "#sendmessage_multiple_to_what";
	
	var messageFieldSubject = "#comp-subject";
	var messageFieldBody = "#comp-body";
	var messageFieldFrom = "#message_from";
	var messageFieldToSingle = "#message_to";
	var messageFieldMultipleTo = "#sendmessage_multiple_to";
	
	var messageToResult = ".sendmessage_compose_to_result";
	
	var buttonSendMessage = "#send_message";
	
	var invalidClass = "sendmessage_invalid";
	var errorClass = 'sendmessage_error_message';
	var normalClass = 'sendmessage_normal_message';
	var dialogBoxClass = "dialogue_box";
	var dialogFooterClass = "dialog_footer";
	var dialogHeaderClass = ".dialog_header";
	var dialogClass = ".dialog";
	
	var messageOK = "#sendmessage_message_ok";
	var messageError = "#sendmessage_message_error";
	var messageErrorFriends = "#sendmessage_friends_error";
		

	/**
	 * This function will show a message in either a red or a green square.
	 * @param {String} idToAppend The id of the element you wish to set this message in.
	 * @param {String} msg The message you want to display.
	 * @param {Boolean} isError true for error (red block)/false for normal message(green block).
	 * @param {Number} timeout The amount of milliseconds you want the message to be displayed, 0 = always (till the next message)
	 */
	var showGeneralMessage = function(idToAppend, msg, isError, timeout) {
		$(idToAppend).html(msg);
		if (isError) {
			$(idToAppend).addClass(errorClass);
			$(idToAppend).removeClass(normalClass);
		}
		else {
			$(idToAppend).removeClass(errorClass);
			$(idToAppend).addClass(normalClass);
		}
		
		$(idToAppend).show();
		if (typeof timeout === "undefined" || timeout !== 0) {
			$(idToAppend).fadeOut(generalMessageFadeOutTime);
		}
	};
		
	
	//////////////////////////
	// Autocomplete friends	//
	//////////////////////////
	
	/**
	 * This will start the auto complete functionality.
	 * 
	 * @param {Array} allFriends Array of all the friends
	 */
	var autoCompleteFriends = function(allFriends) {
		var bindSearchTo = messageMultipleToInputContainer;
		if (!layover) {
			bindSearchTo = putContentInId + " " + bindSearchTo;
		}
		$(messageFieldMultipleTo).autocomplete(allFriends, {
		    minChars: 1,
		    matchContains: true,
		    multiple: true,
		    width: 490,
		    bindTo: bindSearchTo,	//	THIS REQUIRES A MODIFIED VERSION OF AUTOCOMPLETE!
		    
		    formatMatch: function(row){
		        return row.profile.firstName + ' ' + row.profile.lastName;
		    },
		    //	The formatting of the results in the dropdown list.
		    formatItem: function(row){
		        var s = '<img src="_images/profile_icon.png" alt="profile icon" width="24" height="24" /> ';
		        if (row.profile.picture && $.evalJSON(row.profile.picture).name) {
		            s = '<img src="/_user/public/' + row.target + "/" + row.profile.picture.name + '" alt="profile icon" width="24" height="24" /> ';
		        }
		        return s + row.profile.firstName + ' ' + row.profile.lastName;
		    }
		});
	};
	
	/**
	 * This will create a box with the user his name in and add it to the users that need to receive this message.
	 * @param {String} name The first and last name of the user
	 * @param {String} uid The user his uuid.
	 */
    var createToBox = function(name, uid){
		var json = {'name' : name, 'uid' : uid};
		//	Get the tpl
		var box = $.Template.render(messageMultipleToBox.replace(/#/,''), json);
        
        //	Add it too the DOM tree.
        $(messageFieldMultipleTo).before(box);
        
        //	Add some nice corners
        $(messageMultipleToBoxResult).corners();
        
        //	Clear the input box
        $(messageFieldMultipleTo).val('');
                    
        //	add it too the selected list.
        selectedFriendsToPostTo.push(uid);
    };		
	
	/**
     * Will fetch all the friends of this user and start the autoComplete method.
     */
    var getAllFriends = function(){
        $.ajax({
            url: "/_user/contacts/accepted.json?page=0&items=100",
            success: function(data){
                var json = $.evalJSON(data);
                    allFriends = [];
                    if (json.results) {
                        var searchArray = [];
                        for (var i = 0; i < json.results.length; i++) {
                            //	add it too the array.
                            allFriends.push(json.results[i]);
                        }
                        //	This will give a nice drop down list with our friends.
						autoCompleteFriends(allFriends);
						$(messageFieldSubject).focus();
						$(messageFieldMultipleTo).focus();
                   }
                
            },
            error: function(status){
				showGeneralMessage(messageDone, $(messageErrorFriends).text(), true,0);
            }
        });
    };	
	
	
	///////////////////////////////
	// 		Aid functions		 //
	///////////////////////////////

	/**
	 * Fade the message and close it.
	 */
	var fadeMessage = function() {
		$(messageDone).fadeOut(fadeOutTime, function() {
			if (layover) {
				$(messageDialogContainer).jqmHide();
			}
		});
	};
	
	/**
	 * This will reset the whole widget to its default state. 
	 * It will clear any values or texts that might have been entered.
	 */
	var resetView = function() {
		$(dialogBoxContainer).addClass(dialogBoxClass);
		$(dialogFooterContainer).addClass(dialogFooterClass);

		//	Clear all the input fields
        $(messageFieldSubject + ", " + messageFieldBody + ", " + messageFieldMultipleTo).val('');
		
		//	Remove classes
		$(messageFieldSubject).removeClass(invalidClass);
		$(messageFieldBody).removeClass(invalidClass);
		$(messageMultipleToInputContainer).removeClass(invalidClass);
		$(messageFieldMultipleTo).removeClass(invalidClass);
		
		//	Remove al the inputted friends
		$(messageMultipleToInputContainer + " span").remove();
		selectedFriendsToPostTo = [];
		
		//	Remove all the results.
        $(messageToResult).remove();
		
		//	Reset the array with the selected friends.
        selectedFriendsToPostTo = [];
		
		//	Hide the multiple container and show the single (since is the default view)
		$(messageMultipleToContainer).hide();		
		$(messageSingleToContainer).show();
		
		//	Show the form and hide any previous messages.
		$(messageDone).hide();
		$(messageForm).show();
	};
	
	/**
	 * Shows the lightbox and fills in the from and to field.
	 * @param {Object} hash The jqModal hash.
	 */
	var loadMessageDialog = function(hash) {		
		//	Fill in the userdata
		$(messageFieldFrom).text(me.user.properties.firstName + " " + me.user.properties.lastName);
		
		//	Depending on the allowOthers variable we show the appropriate input
		if (allowOthers) {
			//	We have to get all the other friends.
			getAllFriends();
			
			//	We send this to multiple users.
			$(messageSingleToContainer).hide();		
			$(messageMultipleToContainer).show();
			
			//	Check if the user exists
			if (user !== null) {
				//	Fill in the username in a small box
				createToBox(user.firstName + " " + user.lastName, user.uuid);
			}
		}
		else {
			//	We send this to a specific user.
			//	Show the correct input box and fill in the name.
			$(messageMultipleToContainer).hide();		
			$(messageSingleToContainer).show();
			
			//	check for null
			if (user !== null) {
				//	Fill in the username
				$(messageFieldToSingle).text(user.firstName + " " + user.lastName);
			}
			
			//	We add it to the selectedFriendsList
			//	Although it will only be one item in the array.
			//	This is for our own convenience.
	        selectedFriendsToPostTo.push(user.uuid);
		}
				
		//	If this is a layover we show the popup.
		if (layover) {
			hash.w.show();
		}
	};
		
	/**
	 * This method will check if there are any required fields that are not filled in.
	 * If a field is not filled in the invalidClass will be added to that field.
	 * @return true = no errors, false = error
	 */
	var checkFieldsForErrors = function() {
		var subjectEl = $(messageFieldSubject);
		var bodyEl = $(messageFieldBody);
		
		var valid = true;
		var subject = subjectEl.val();
		var body = bodyEl.val();
		
		subjectEl.removeClass(invalidClass);
		bodyEl.removeClass(invalidClass);
		
		if (!subject) {
			valid = false;
			subjectEl.addClass(invalidClass);
		}
		if (!body) {
			valid = false;
			bodyEl.addClass(invalidClass);
		}
		
		if (selectedFriendsToPostTo.length === 0) {
			//	No user selected.
			valid = false;
			//	This can only happen when a user wants to add multiple persons.
			$(messageMultipleToInputContainer).addClass(invalidClass);
			$(messageFieldMultipleTo).addClass(invalidClass);
		}
		return valid;
	};
	
	
	//////////////////////////////
	//	Send message functions	//
	//////////////////////////////
	
	/**
	 * Called when the request to the server has been answered
	 * @param {Boolean} succes	If the request failed or succeeded.
	 */
	var showMessageSent = function(succes) {
		//	Clear the subject and body input fields
		$(messageFieldSubject).val("");
		$(messageFieldBody).val("");
		
		//	show a message
		//	We hide the formfield and show a message depending on the succes parameter.
		$(messageForm).hide();
		$(messageDone).show();
		
		//	Remove any previous classes that their might be.
		$(messageDone).removeClass(errorClass);
		$(messageDone).removeClass(normalClass);
		
		//	Depending on success we add the correct class and show the appropriate message.
		if (succes) {
			$(messageDone).addClass(normalClass);
			$(messageDone).text($(messageOK).text());
		}
		else {
			$(messageDone).addClass(errorClass);
			$(messageDone).text($(messageError).text());
		}
		
		//	If we have a valid callback function we call that
		//	and dont show the message
		//	If we dont have a callback we show a default message and fade out the layover.
		if (succes && callbackWhenDone !== null) {
			callbackWhenDone({"response" : "OK"});
		}
		else {
			fadeMessage();
		}
	};
	
	/**
	 * Should be called when the user clicks the send message button.
	 * Will also perform a check if all the required fields are filled in.
	 */
	var sendMessage = function() {
		//	Check the fields if there are any required fields that are not filled in.
		if (checkFieldsForErrors()) {
		
			var body = $(messageFieldBody).val();
			var subject = $(messageFieldSubject).val();
		
			var tosend = selectedFriendsToPostTo.length;
			var sent = 0;
			
			for (var i = 0; i < selectedFriendsToPostTo.length; i++){
				var toSend = {
					"sakai:type": "internal",
					"sakai:sendstate": "pending",
					"sakai:messagebox": "outbox",
					"sakai:to": selectedFriendsToPostTo[i],
					"sakai:from": sdata.me.user.userid,
					"sakai:subject": subject,
					"sakai:body":body,
					"sakai:category":"message"
				};
					
				$.ajax({
					url: "/_user/message.create.html",
					type: "POST",
					success: function(data) {
						sent++;
						if (sent === tosend){
							showMessageSent(true);
						}
					},
					error: function(status) {
						sent++;
						if (sent === tosend){
							showMessageSent(false);
						}
					},
					data: toSend
				});
			}
			
		}
	};
	
	var setSubject = function(subject) {
		$(messageFieldSubject).val(subject);
	};
	var setBody = function(body) {
		$(messageFieldBody).val(body);
	};
	
	
	///////////////////////////
	// 	Initialise function	 //
	///////////////////////////
	
	/**
	 * This is the method that can be called from other widgets or pages
	 * @param {Object} userObj The user object containing the nescecary information {uuid:  "user1", firstName: "foo", lastName: "bar"}
	 * @param {Boolean} allowOtherReceivers If the user can add other users, default = false	 
	 * @param {String} insertInId Insert the HTML into another element instead of showing it as a popup
	 * @param {Object} callback When the message is sent this function will be called. If no callback is provided a standard message will be shown that fades out.
	 */
	sakai.sendmessage.initialise = function(userObj, allowOtherReceivers, insertInId, callback, subject, body) {
		
		//	Make sure that everything is standard.
		resetView();
		
		//	The user we are sending a message to.
		user = userObj;
		
		//	Maybe this message can be sent to multiple people.
		allowOthers = false;
		if (allowOtherReceivers) {
			allowOthers = allowOtherReceivers;
		}
		
		//	Putting the subject and body which have been send in the textboxes
		$(messageFieldBody).val(body);
		$(messageFieldSubject).val(subject);
		
		//	Maybe we dont want to display a popup but instead want to add it in another div.
		if (insertInId) {
					
			//	Make sure this id exists.
			if ($(insertInId).length > 0) {
				//	The id exists!
				layover = false;
				putContentInId = insertInId;
				
				//	Remove the dialog stuff.
				$(dialogHeaderClass).remove();
				$(messageDialogContainer).removeClass(dialogClass.replace(/\./,''));
				$(dialogBoxContainer).removeClass(dialogBoxClass);
				$(dialogFooterContainer).removeClass(dialogFooterClass);
			
				//	Altough this isnt strictly nescecary it is cleaner.
				rootel = $(insertInId);
				rootel.append($(messageDialogContainer));
			}
			
		}
		
		//	Store the callback
		if (callback) {
			callbackWhenDone = callback;
		}
		
		//	show popup
		if (layover) {
			$(messageDialogContainer).jqmShow();
		}
		else {
			//	We want to add this in another element.
			loadMessageDialog();			
		}
		
		var o = {
			'setSubject' : setSubject,
			'setBody' : setBody
		};
		
		return o;
	};
	
	
	////////////////////
	// Event handling //
	////////////////////
	
	//	When someone clicks the send button.
	$(buttonSendMessage).bind("click", function(ev) {
		sendMessage();
	});	
	
	
	//////////////////////////
	//	AUTOCOMPLETE EVENTS	//
	//////////////////////////
	
	
	//	When the container gets clicked we focus the input box.
	$(messageMultipleToInputContainer).click(function(){
        $(messageFieldMultipleTo).focus();
    });
	
	//	When the input box looses focus
    $(messageFieldMultipleTo).blur(function(){
		//	Fadeout the "tooltip"
        $(messageMultipleToWhat).fadeOut("normal");        
		
		//	Clear the input box
        $(this).val('');
    }); 
		
	//	When someone focuses the to input field
	//	we will show the tooltip.
    $(messageFieldMultipleTo).focus(function(){
        $(messageMultipleToWhat).show();
    });
	
	
	/*
	//	Typing in the search box
    $(messageFieldMultipleTo).keydown(function(e){
        if ($(messageFieldMultipleTo).val() !== '') {
			//	If someone types in some text the tooltip can fade out.
			$(messageMultipleToWhat).fadeOut("normal");
        }
        else {
			//	If the inputbox is empty we show the tooltip
            $(messageMultipleToWhat).show();
        }
        return true;
    });
	*/
	
	
	//	If we delete a user
    $(messageMultipleToBoxDelete).live("click", function(){
		//	The userid resides in the id of the image.
		//	We filter it out.
		var userid = $(this).attr('id').replace(/sendmessage_to_result_img_/gi,'');
		
		//	Remove it out of the list with all the people were sending to.
        selectedFriendsToPostTo.splice(selectedFriendsToPostTo.indexOf(userid), 1);
		
		//	remove it out of the DOM
        $(this).parent().remove();
    });
	
	//	When we get a result
	$(messageFieldMultipleTo).result(function(event, data, formatted) {
		if ($.inArray(data.target, selectedFriendsToPostTo) === -1) {
            createToBox(data.profile.firstName + ' ' + data.profile.lastName, data.target);
        }
        $(this).val('');
    });
	
	
	////////////////////////
	//	jqModal functions //
	////////////////////////
	
	
	$(messageDialogContainer).jqm({
		modal: true,
		overlay: 20,
		toTop: true,
		onShow: loadMessageDialog
	});
};

sdata.widgets.WidgetLoader.informOnLoad("sendmessage");