var sakai = sakai || {};
var $ = $ || function() { throw "JQuery undefined"; };
var sdata = sdata || function() { throw "sdata undefined"; };
var json_parse = json_parse || function() { throw "json_parse undefined"; };
var opensocial = opensocial || function() { throw "opensocial undefined"; };
var Config = Config || function() { throw "Config undefined"; };

sakai.sendmessage = function(tuid, placement, showSettings) {
	var user = false; //	user object that should be posted to.
	var me = sdata.me;
	var fadeOutTime = 1500; //	The time it takes for the lightbox to fade out.
	
	
	/**
	 * Initialises the popover.
	 * @param {Object} userObj The user object containing the nescecary information
	 */
	sakai.sendmessage.initialise = function(userObj) {
		user = userObj;
		//	show form
		$("#message_done").hide();
		$("#message_form").show();
		//	show popup
		$("#message_dialog").jqmShow();
	};
	
	
	/**
	 * Shows the lightbox and fills in the from and to field.
	 * @param {Object} hash
	 */
	var loadMessageDialog = function(hash) {
	
		$("#message_from").text(me.profile.firstName + " " + me.profile.lastName);
		$("#message_to").text(user.firstName + " " + user.lastName);
		
		$("#comp-subject").val('');
		$("#comp-body").val('');
		$("#comp-subject").removeClass('invalid');
		$("#comp-body").removeClass('invalid');
		
		hash.w.show();
	};
	
	/**
	 * Gets called when the request to the server has been answered
	 * @param {Object} succes	If the request failed or succeeded.
	 */
	var showMessageSent = function(succes) {
		//	clear box
		$("#comp-subject").val("");
		$("#comp-body").val("");
		
		//	show a message
		$("#message_form").hide();
		$("#message_done").show();
		$("#message_done").removeClass('error_message');
		$("#message_done").removeClass('normal_message');
		if (succes) {
			$("#message_done").addClass('normal_message');
			$("#message_done").text("The message has been sent.");
		}
		else {
			$("#message_done").addClass('error_message');
			$("#message_done").text("The message could not be sent.");
		}
		fadeMessage();
	};
	
	
	/**
	 * Fade the message and close it.
	 */
	var fadeMessage = function() {
		$('#message_done').fadeOut(fadeOutTime, function() {
			$('#message_dialog').jqmHide();
		});
	};
	
	
	/*
	 * EVENTS
	 */
	//	When someone clicks the button.
	$("#send_message").bind("click", function(ev) {
	
		var subjectEl = $("#comp-subject");
		var bodyEl = $("#comp-body");
		
		var valid = true;
		var subject = subjectEl.val();
		var body = bodyEl.val();
		
		subjectEl.removeClass("invalid");
		bodyEl.removeClass("invalid");
		
		if (!subject) {
			valid = false;
			subjectEl.addClass("invalid");
		}
		if (!body) {
			valid = false;
			bodyEl.addClass("invalid");
		}
		
		if (!valid) { return false; }
		else {
		
			//	Construct the message.
			var openSocialMessage = new opensocial.Message(body, {
				"title": subject,
				"type": Config.Messages.Categories.message
			});
			var toSend = {
				"to": user.uuid,
				"message": sdata.JSON.stringify(openSocialMessage)
			};
			
			
			sdata.Ajax.request({
				url: "/_rest/messages/send",
				httpMethod: "POST",
				onSuccess: function(data) {
					var json = json_parse(data);
					if (json.response === "OK") {
						showMessageSent(true);
					}
					else {
						showMessageSent(false);
					}
				},
				onFail: function(status) {
					showMessageSent(false);
				},
				postData: toSend,
				contentType: "application/x-www-form-urlencoded"
			});
		}
	});
	
	
	$('#message_dialog').jqm({
		modal: true,
		overlay: 20,
		toTop: true,
		onShow: loadMessageDialog
	});
};


sdata.widgets.WidgetLoader.informOnLoad("sendmessage");