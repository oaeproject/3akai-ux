var sakai = sakai || {};

sakai.twitter = function(tuid,placement,showSettings){
	var currentSubContainer = ""; // The current subcontainer (get/set)
	var json = false; // json object
	var me; // me object
	var me_json; // json me object
	var rootel = $("#" + tuid);
	var url_base="http://twitter.com/"; // base url that is used for communication with the services
	
	/**
	 * Encode to correct data
	 * @param {String} input The data that needs to be encoded
	 */
	var encodeData = function(input){
		input= input.replace(/ /g,"%20");
		return input;
	};
	
	/**
	 * Reset the values of the json object
	 */
	var resetValues = function(){
		json = {};
		json.error = "";
		json.info = "";
		json.screen_name = "";
		json.password= "";
	};
	
	/**
	 * Get the me object
	 * @param {Boolean} refresh Refresh the me object or not
	 */
	var getMe = function(refresh){
		if(refresh){
			$.ajax({
				url: "/rest/me",
				cache: false,
				success: function(data){
				    me = $.evalJSON(data);
					me_json = me.profile;
				}
			});	
		}else{
			me = sdata.me;
			me_json = me.profile;	
		}
	};

	/**
	 * Sets the error message to the json object and renders the template
	 * @param {String} errorInput Error message
	 */
	var setError = function(errorInput){
		json.error = errorInput;
		renderTemplate("message");
	};
	/**
	 * Sets the info message to the json object and renders the template
	 * @param {String} errorInput Error message
	 */
	var setInfo = function(infoInput){
		json.info = infoInput;
		renderTemplate("message");
	};
	
	/**
	 * Clears the error message
	 */
	var clearError = function(){
		/** Only clear the error if there was one in the first place */
		if(json.error !== ""){
			setError("");
		}
	};
	
	/**
	 * Clears the info message
	 */
	var clearInfo = function(){
		/** Only clear the error if there was one in the first place */
		if(json.info !== ""){
			setInfo("");
		}
	};
	
	/**
	 * Clear the info and error messages
	 */
	var clearErrorAndInfo = function(){
		clearError();
		clearInfo();
	};

	/**
	 * Change the status for the user
	 */
	var changeLocalStatus = function(){
		if(json.status){
			basic = {};
			basic.status = json.status;
			
			data = {"basic":$.toJSON(basic)};
			
			a = ["u"];
			k = ["basic"];
			v = [$.toJSON(basic)];
			
			tosend = {"k":k,"v":v,"a":a};
			
			$.ajax({
	        	url :"/rest/patch/f/_private" + me.userStoragePrefix + "profile.json",
	        	type : "POST",
	            data : tosend,
	            success : function(data) {
					setInfo("Your status has been succesfully updated.");
					ev = {};
					ev.value = json.status;
				},
				error : function(data){
					setError("An error occurend when sending the status to the server.");
				}
			});
		}else{
			setError("No status from twitter found.");
		}
	};
		
	/**
	 * Parse the twitter status object
	 * @param {String} response Json response
	 * @param {Boolean} exists Check if the discussion exists
	 */
	var parseTwitterStatus = function(response, exists){
		if(exists){
			data = $.evalJSON(response);
			json.status = "";
			json.status = data[0].text;
			changeLocalStatus();
		}else{
			setError("Could not find the last status for: " + json.screen_name);
		}
	};
	
	/**
	 * Parse the response after the update
	 * @param {Object} response
	 * @param {Object} exists
	 */
	var parseTwitterResponse = function(response, exists){
		if(exists){
			data = $.evalJSON(response);
			setInfo("Your twitter status has been succesfully updated.");
		}else{
			setError("Could not update the twitter status.");
		}
	};
	
	/**
	 * Set the screenname of the json object
	 * @param {Boolean} check If true, perform a check if the field is empty or not
	 */
	var setScreenName = function(check){
		var val = $("#twitter_input_screen_name",rootel).val();
		if(!check){
			json.screen_name = val;
			return true;
		}else{
			if (!val || val.replace(/ /g, "") === "") {
				setError("Please insert your twitter name.");
				return false;
			}
			else {
				json.screen_name = val;
				return true;
			}
		}
	};
	
	/**
	 * Set the password to the json object
	 */
	var setPassword = function(){
		var val = $("#twitter_input_password",rootel).val();
		if (!val || val.replace(/ /g, "") === "") {
			setError("Please insert your password.");
			return false;
		}
		else {
			json.password = val;
			return true;
		}
	};
	
	/**
	 * Get the status from twitter
	 */
	var getStatusFromTwitter = function(){
		if(setScreenName(true)){
			var oPostData = {"method" : "GET", "url" : url_base + "statuses/user_timeline/" + json.screen_name + ".json?page=1"};
			oPostData.url = encodeData(oPostData.url);
	        $.ajax({
	            url :"/proxy/proxy",
	            type : "POST",
	            success : function(data) {
					parseTwitterStatus(data, true);
	            },
	            error : function(status) {
	            	parseTwitterStatus(status, false);
	            },
	            data : oPostData
	        });
		}
	};
	
	/**
	 * Set the status to twitter
	 */
	var setStatusToTwitter = function(){
		if(setScreenName(true) && setPassword()){
			getMe(true);
			currentBasic = me_json.basic;
			if(me_json.basic.status && me_json.basic.status !== ""){
				dataToTwitter = "status=" + encodeURIComponent(currentBasic.status);
				var oPostData = {"method" : "POST", "url" : url_base + "statuses/update.json", "user" : json.screen_name, "password" : json.password, "post" : dataToTwitter};
				oPostData.url = encodeData(oPostData.url);
		        $.ajax({
		            url :"/proxy/proxy",
		            type : "POST",
		            success : function(data) {
						parseTwitterResponse(data, true);
		            },
		            error : function(status) {
		            	parseTwitterResponse(status, false);
		            },
		            data : oPostData
		        });
			}else {
				setError("Your sakai status is empty.");
			}
		}
	};
	
	/**
	 * Show a sub container
	 * @param {String} target Id of the container that needs to be shown
	 */
	var showSubContainer = function(target){
		switch(target){
			case "get":
				if(currentSubContainer != target){
					setScreenName(false);
					renderTemplate("get_status");
					addBinding("get_status");
					clearErrorAndInfo();
				}
				break;
			case "set":
				if(currentSubContainer != target){
					setScreenName(false);
					renderTemplate("set_status");
					addBinding("set_status");
					clearErrorAndInfo();
				}
				break;
		}
	};
	
	/**
	 * Add binding
	 * @param {String} container Container were the binding should be added
	 */
	var addBinding = function(container){
		switch(container){
			case "get_status":
				$("#twitter_link_get_status", rootel).bind("click",function(e,ui){
					clearErrorAndInfo();
					getStatusFromTwitter();
				});
				break;
			case "set_status":
				$("#twitter_link_set_status", rootel).bind("click",function(e,ui){
					clearErrorAndInfo();
					setStatusToTwitter();
				});
				break;
		}
		$("input[name=twitter_input_get_set]").bind("click",function(e,ui){
			showSubContainer(e.target.id.replace("twitter_input_", ""));
		});
	};
	
	/**
	 * Render the template of a container
	 * @param {String} container Container that will be rendered
	 */
	var renderTemplate = function(container){
		switch(container){
			case "get_status":
				currentSubContainer = "get";
				$("#twitter_sub_container", rootel).html($.Template.render('twitter_template_get_status',json));
				break;
			case "set_status":
				currentSubContainer = "set";
				$("#twitter_sub_container", rootel).html($.Template.render('twitter_template_set_status',json));
				break;
			case "message":
				$("#twitter_message_container", rootel).html($.Template.render('twitter_template_message',json));
				break;
		}
	};
	
	/**
	 * Function that will be launched if the widget is loaded
	 */
	var init = function(){
		getMe(false);
		resetValues();
		renderTemplate("get_status");
		addBinding("get_status");
		renderTemplate("error");
		
		$("#twitter_main_container").show();
	};
	init();
};

sdata.widgets.WidgetLoader.informOnLoad("twitter");