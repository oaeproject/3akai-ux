var sakai = sakai || {};
var $ = $ || function() { throw "JQuery is undefined"; };
var sdata = sdata || function() { throw "Sdata is undefined"; };
var json_parse = json_parse || function() { throw "Json_parse is undefined"; };

/**
 * Initialize the pollwow widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement Widget place
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.pollwow = function(tuid, placement, showSettings){
	var json = false; // Variable used to recieve information by json
	var jsonAll = false; // Contains all the pollwows
	var me = sdata.me; // Contains information about the current user
	var pollwow = false; // Json object that contains info about the poll
	var rootel = $("#" + tuid); // Get the main div used by the widget
	var colors = ["663300","e07000","0070e0","660000","990080","c4fc95","c4e3fc","79c365","5ba940","f5f4bf","f1eca1","c3e2fc","f2eda2","8ad769","ac9d7d","79ccff","00a4e4","ac9c7d","9f8c60","abe652","f6b5b5","cd9c9c","ad8181","ee5858","ce1616"];
	var isAdvancedSettingsVisible = false; // Are the advanced settings visible
	var addNewOptionOnEnter = true; // Add a new option when pressing enter
	var existingLoaded = false; // Is the existing tab loaded?
	var saveAllToDatabase = false; // Save the poll to the list of polls
	
	/**
	 * Convert to 2 numbers
	 * @param {int} integer Number that needs to be converted
	 */
	var extractToTwo = function(integer){
		integer+= "";
		try {
			if(integer < 10){
				return "0" + integer;
			} else {
				return integer;
			}
		}catch(err){
			return integer;
		}
	};
	
	/**
	 * Convert a date
	 * @param {String} date Date in format dd/mm/yyyy
	 * @param {String} hour Number of hours
	 * @param {String} minute Number of minutes
	 */
	var convertDate = function(date, hour, minute){
		var dArray = date.split("/");
		var d = new Date();
		d.setFullYear(dArray[2], dArray[1]-1, dArray[0]);
		d.setHours(hour);
		d.setMinutes(minute);
		d.setSeconds(0);
		return d;
	};
	
	/**
	 * Check if the dates are ok
	 */
	var checkDates = function(){
		var today = new Date();
		
		var startdate = convertDate(json.pollwow.startdate, json.pollwow.starthour, json.pollwow.startmin);
		var stopdate = convertDate(json.pollwow.stopdate, json.pollwow.stophour, json.pollwow.stopmin);
		if(startdate > today){
			json.pollwow.temp.polldateok = 0;
		}else{
			json.pollwow.temp.polldateok = 1;
			if(stopdate < today){
				json.pollwow.temp.polldateok = 0;
			}
		}
	};
	
		
	/**
	 * Render the show question of the widget
	 */
	var renderShowQuestion = function(){
		$("#pollwow_show_question", rootel).html(sdata.html.Template.render('pollwow_show_question_view_rendered_template',json));
	};
	
	/**
	 * Render the show chart view of the widget
	 */
	var renderShowChart = function(){
		$("#pollwow_show_chart", rootel).html(sdata.html.Template.render('pollwow_show_chart_view_rendered_template',json));
	};
	
	/**
	 * Render the preview of the widget
	 */
	var renderPreview = function(){
		$("#pollwow_preview_question", rootel).html(sdata.html.Template.render('pollwow_question_view_rendered_template',json));
		$("#pollwow_preview_chart", rootel).html(sdata.html.Template.render('pollwow_chart_view_rendered_template',json));
	};
	
	/**
	 * Render the settings of the widget
	 */
	var renderSettings = function(){
		$("#pollwow_settings", rootel).html(sdata.html.Template.render('pollwow_rendered_template',json));
		$("#pollwow_options", rootel).html(sdata.html.Template.render('pollwow_options_rendered_template',json));
	};
	
	/**
	 * Process the pollwow information
	 */
	var processPoll = function(preview){
		var totalvotes = 0;
		var totalvotescount = 0;
		if(preview){
			json.pollwow.temp={};
			json.pollwow.temp.options = [];
			json.pollwow.temp.options = [{answer: "Option 1"},{answer: "Option 2"},{answer: "Option 3"},{answer: "Option 4"},{answer: "Option 5"}];
			
			json.pollwow.temp.votes = [];
			json.pollwow.temp.votes = [180,124,45,78,250];
			
			totalvotes = json.pollwow.temp.votes.length;
			totalvotescount = 0;
			for(var i = 0; i < json.pollwow.temp.votes.length; i++){
				totalvotescount += json.pollwow.temp.votes[i];
				json.pollwow.temp.options[i].color = colors[i];
			}
			
			json.pollwow.temp.processedVotes = [];
			for(var j = 0; j < json.pollwow.temp.votes.length; j++){
				json.pollwow.temp.processedVotes[j] = {};
				json.pollwow.temp.processedVotes[j].percentage = Math.round(json.pollwow.temp.votes[j] / totalvotescount * 100);
			}
			json.pollwow.temp.question = "How is the weather in England?";
		}else{
			totalvotes = json.pollwow.votes.length;
			totalvotescount = 0;
			for(var m = 0; m < json.pollwow.votes.length; m++){
				totalvotescount += json.pollwow.votes[m];
			}
			json.pollwow.processedVotes = [];
			
			if(totalvotescount === 0){
				for(var k = 0; k < json.pollwow.votes.length; k++){
					json.pollwow.processedVotes[k] = {};
					json.pollwow.processedVotes[k].percentage = 0;
				}
			}else{
				for(var l = 0; l < json.pollwow.votes.length; l++){
					json.pollwow.processedVotes[l] = {};
					json.pollwow.processedVotes[l].percentage = Math.round(json.pollwow.votes[l] / totalvotescount * 100);
				}
			}
			
		}
	};
	
	/** 
	 * Add data to the image
	 */
	var renderPoll_addData = function(){
		/** add values */
		json.pollwow.image += "&chd=t:";				
		for(var i = 0; i < json.pollwow.processedVotes.length; i++){
			json.pollwow.image += json.pollwow.processedVotes[i].percentage + ",";
		}
		json.pollwow.image = json.pollwow.image.substring(0,json.pollwow.image.length - 1);
	};
	
	/** 
	 * Add colors to the image
	 */
	var renderPoll_addColors = function (){
		json.pollwow.image += "&chco=";
		for(var i = 0; i < json.pollwow.processedVotes.length; i++){
			json.pollwow.options[i].color = colors[i];
			json.pollwow.image += colors[i]+"|";
		}
		json.pollwow.image = json.pollwow.image.substring(0,json.pollwow.image.length - 1);
	};
	
	/**
	 * Render the poll widget
	 * @param {Boolean} preview True if it a preview
	 */
	var renderPoll = function(preview){
		if(json){
			if(preview){
				processPoll(preview);
				switch(json.pollwow.poll_type){
					case 0:
						json.pollwow.image = "http://chart.apis.google.com/chart?cht=bvs&chs=310x180&chd=t:27,18,7,12,37&chxt=x&chxl=0:|27%|18%|7%|12%|37%&chco=663300|e07000|0070e0|660000|990080";
					break;
					case 1:
						json.pollwow.image = "http://chart.apis.google.com/chart?cht=bhs&chs=310x170&chd=t:27,18,7,12,37&chxt=y&chxl=0:|37%|12%|7%|18%|27%&chco=663300|e07000|0070e0|660000|990080";
					break;
					case 2:
						json.pollwow.image = "http://chart.apis.google.com/chart?cht=p&chs=310x250&chd=t:27,18,7,12,37&chl=27%|18%|7%|12%|37%&chco=663300|e07000|0070e0|660000|990080";
					break;
					case 3:
						for(var i = 0; i < json.pollwow.temp.processedVotes.length; i++){
							json.pollwow.temp.options[i].percentage = json.pollwow.temp.processedVotes[i].percentage + "%";
							json.pollwow.temp.options[i].color = colors[i];
						}
					break;
				}
			}else {
				processPoll(preview);
				switch(json.pollwow.poll_type){
					case 0:
						var width = 0;
						if(json.pollwow.processedVotes.length > 11){
							width = 300 + (json.pollwow.processedVotes.length-11) *30;
						}else
						{
							width = 310;
						}
						json.pollwow.image = "http://chart.apis.google.com/chart?cht=bvs&chs=" + width + "x180";
					
						renderPoll_addData();
						
						/** add percentages */
						json.pollwow.image += "&chxt=x&chxl=0:|";
						for(var j = 0; j < json.pollwow.processedVotes.length; j++){
							json.pollwow.image += json.pollwow.processedVotes[j].percentage + "%|";
						}
						json.pollwow.image = json.pollwow.image.substring(0,json.pollwow.image.length - 1);
						
						renderPoll_addColors();
					break;
					case 1:
						//http://chart.apis.google.com/chart?cht=bhs&chs=310x250&chd=t:1,12,4,7,76&chxt=x,y&chxl=1:|1%20%|12%20%|4%20%|7%20%|76%20%
						var height = 20 + (json.pollwow.processedVotes.length*30);
						
						json.pollwow.image = "http://chart.apis.google.com/chart?cht=bhs&chs=310x" + height;
					
						renderPoll_addData();
						
						/** add percentages */
						json.pollwow.image += "&chxt=y&chxl=0:|";
						for(var k = json.pollwow.processedVotes.length-1; k >=0 ; k--){
							json.pollwow.image += json.pollwow.processedVotes[k].percentage + "%|";
						}
						json.pollwow.image = json.pollwow.image.substring(0,json.pollwow.image.length - 1);
						
						renderPoll_addColors();
					break;
					case 2:
						json.pollwow.image = "http://chart.apis.google.com/chart?cht=p&chs=310x250";
						
						renderPoll_addData();
						
						/** add percentages */
						json.pollwow.image += "&chl=";
						for(var l = 0; l < json.pollwow.processedVotes.length; l++){
							json.pollwow.image += json.pollwow.processedVotes[l].percentage + "%|";
						}
						json.pollwow.image = json.pollwow.image.substring(0,json.pollwow.image.length - 1);
	
						renderPoll_addColors();
					break;
					case 3:
						for(var m = 0; m < json.pollwow.processedVotes.length; m++){
							json.pollwow.options[m].percentage = json.pollwow.processedVotes[m].percentage + "%";
							json.pollwow.options[m].color = colors[m];
						}
					break;
				}
			}
		}
	};
	
	/**
	 * Show or hide the chart of the widget
	 * @param {Boolean} show If true, the chart of the widget is shown
	 */
	var showHideChart = function(show){
		if(show){
			$("#pollwow_show_question", rootel).hide();
			$("#pollwow_show_chart", rootel).show();
		}else {
			$("#pollwow_show_chart", rootel).hide();
			$("#pollwow_show_question", rootel).show();
		}
	};

	/**
	 * Bind or unbind an element and execute a function
	 * @param {Object} element Element that needs to be binded or unbinded
	 * @param {function} finishFunction Function that will be binded or unbinded
	 * @param {Boolean} bind Bind the element if true
	 */
	var bindUnbind = function(element, finishFunction, bind){
		if(bind){
			element.bind("click",finishFunction);
		}else{
			element.unbind("click",finishFunction);
		}
	};
	
	/**
	 * Save the pollwow to the database
	 * @param {function} functionOnComplete Function that will be executed after a save
	 * @param {Boolean} saveAll Save all the posts
	 */
	var savePollwowToDatabase = function(functionOnComplete, saveAll){
		saveAllToDatabase = saveAll;
		json.pollwow.pollwows = []; // clear pollwows array
		var jsonToString = sdata.JSON.stringify(json);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "pollwow", jsonToString, functionOnComplete);		
	};
	
	/**
	 * View the questions of the poll
	 */
	var viewQuestions = function(){
		renderShowQuestion();
		if(json.pollwow.placeholder === 0){
			addShowBinding();
		}
		showHideChart(false);
	};
	
	/**
	 * After a vote has been registered
	 */
	var finishVoting = function(){
		json.pollwow.temp.userVoted = 1;
		if(json.pollwow.not_see_chart_view === 1){
			viewQuestions();
		}else{
			viewResults();
		}
	};
	
	/**
	 * Register the vote of a user
	 */
	var registerVote = function(){
		if(me){
			if(!json.pollwow.users.contains(me.preferences.uuid)){
				if($('input[name=pollwow_question_view_options]:checked').length === 0){
					alert("Please select at least one option.");
				}else if ($('input[name=pollwow_question_view_options]:checked').length === 1){
					json.pollwow.votes[parseInt($('input[name=pollwow_question_view_options]:checked').val(), 10)] +=1;
					
					json.pollwow.users.push(me.preferences.uuid);
					savePollwowToDatabase(finishVoting, false);
				}else{
					for(var i = 0; i < $('input[name=pollwow_question_view_options]:checked').length; i++){
						json.pollwow.votes[parseInt($("#" + $('input[name=pollwow_question_view_options]:checked')[i].id).val(), 10)] += 1;
					}
					
					json.pollwow.users.push(me.preferences.uuid);
					savePollwowToDatabase(finishVoting, false);
				}
			}
			else{
				alert("You already registered a vote.");
			}
		}else{
			alert("Can not get the current user.");
		}
	};
	
	/**
	 * Bind or unbind the vote buttonbindUnbindVote
	 */
	var bindUnbindVote = function(){
		if ($('input[name=pollwow_question_view_options]:checked').length > 0){
			bindUnbind($("#pollwow_question_view_vote"), registerVote, true);
		}				
		else{
			bindUnbind($("#pollwow_question_view_vote", rootel), registerVote, false);
		}
	};
	
	/**
	 * Add binding when the pollwow is shown in a page
	 */
	var addShowBinding = function(){
		$("#pollwow_question_view_results", rootel).bind("click",function(e,ui){
			viewResults();
		});
		$("input[name=pollwow_question_view_options]").bind("click",function(e,ui){
			bindUnbindVote();
		});
		bindUnbindVote();
	};
	
	/**
	 * Add binding when the chart of the pollwow is shown
	 */
	var addShowChartBinding = function(){
		if($("#pollwow_chart_view_back", rootel)){
			$("#pollwow_chart_view_back", rootel).bind("click",function(e,ui){
				viewQuestions();
			});
		}
	};
	
	/**
	 * View the results of the poll
	 */
	var viewResults = function(){
		renderPoll(false);
		renderShowChart();
		addShowChartBinding();
		showHideChart(true);
	};
	
	/**
	 * Show the pollwow
	 * @param {String} response Json response with the pollwow
	 * @param {Boolean} exists Check if the discussion exists
	 */
	var showPollwow = function(response, exists){
		if (exists){
			if(me){
				try {
					json = json_parse(response);
					
					json.pollwow.temp = {};
					
					checkDates();
					if (json.pollwow.users.contains(me.preferences.uuid)) {
						json.pollwow.temp.userVoted = 1;
						if(json.pollwow.not_see_chart_view === 1){
							viewQuestions();
						}else{
							viewResults();
						}
					}else{
						json.pollwow.temp.userVoted = 0;
						if(json.pollwow.temp.polldateok === 1){
							viewQuestions();
						}else{
							if(json.pollwow.not_see_chart_view === 1){
								viewQuestions();
							}else{
								viewResults();
							}
						}
					}
				} catch (err){
					alert(err);
				}
			}
			else {
				showPollwow(response, exists);
			}
		} else {
			alert('Failed to show the posts.');
		}
	};
	
	/**
	 * Show or hide the preview of the widget
	 * @param {Boolean} show If true, the preview of the widget is shown
	 */
	var showHidePreview = function(show){
		if(show){
			$("#pollwow_settings", rootel).hide();
			$("#pollwow_preview", rootel).show();
		}else {
			$("#pollwow_preview", rootel).hide();
			$("#pollwow_settings", rootel).show();
		}
	};
	
	/**
	 * Toggle time
	 * @param {Object} toggleOnButton Button where the toggle is on
	 * @param {Object} toggleToButton Button where the toggle needs to go
	 */
	var toggleTime = function(toggleOnButton, toggleToButton) {
		toggleOnButton.toggle(1, function(){
			toggleOnButton.css("top", toggleToButton.position().top + toggleToButton.height() + 8);
			toggleOnButton.css("left",toggleToButton.position().left + 10);
		});
	};
	
	/** 
	 * Make and bind hours and minutes
	 * @param {String} input Name of the elements that need to be created
	 * @param {Integer} count How many fields there need to be created
	 */
	var makeBindDiv = function(input, count){
		for(var i = 0; i < count; i++){
			var a = document.createElement('a');
			a.setAttribute('class', input);
			a.setAttribute('id', input+i);
			a.setAttribute('href', "java-event");
			var text = document.createTextNode(extractToTwo(i)+"");
			a.appendChild(text);
			$("#"+input+"_div").append(a);
		}
		/** If you click on a field, insert the value into the input box and change class */
		$("#" + input + "_div a", rootel).bind("click",function(e,ui){
			var id_original = e.target.id;
			var id = id_original.replace(input, "");
				
			$("#" + input + "_div a", rootel).removeClass("pollwow_time_active");
			$("#" + input).val(extractToTwo(id)+"");
			$("#" + id_original, rootel).addClass("pollwow_time_active");
			$("#"+ input + "_div").hide();
			return false;
		});
		/** Add the binding to show the elements */
		$("#"+ input, rootel).bind("click",function(e,ui){
			toggleTime($("#"+ input + "_div"), $("#"+ input));
		});
		$("#"+ input + "_down", rootel).bind("click",function(e,ui){
			toggleTime($("#"+ input + "_div"), $("#"+ input));
		});
	};
	
	/**
	 * Add to all the pollwows
	 * @param {String} response Json response with the pollwow
	 * @param {Boolean} exists Check if the discussion exists
	 */
	var parseAllPollwow = function(response, exists){
		if (exists) {
			if (me) {
				try {
					jsonAll = json_parse(response);
					if(jsonAll && jsonAll.pollwows.length > 0){
						json.pollwow.pollwows = jsonAll.pollwows;
					}else{
						json.pollwow.pollwows = [];
					}
				}
				catch (err) {
					alert(err);
				}
			}
			else {
				parseAllPollwow(response, exists);
			}
		}
		else {
			jsonAll = {};
			jsonAll.pollwows = [];
		}
	};
			
	/**
	 * Function that will be executed after the save to the database
	 */
	var finishSettingsAfterSave = function(){
		sdata.container.informFinish(tuid);
	};
	
	/**
	 * Add the current item to the list of pollwows
	 */
	var addCurrentToAllPollwow = function(){
		/** Remove from all the posts */
		for(var i = 0; i < jsonAll.pollwows.length; i++){
			if(jsonAll.pollwows[i].tuid === tuid){
				jsonAll.pollwows.splice(i,1);
			}
		}
		
		/** Add the tuid to the poll */
		json.pollwow.tuid = tuid;
		json.pollwow.pollwows = []; 
		json.pollwow.temp = {};
		jsonAll.pollwows.push(json.pollwow);
		
		var jsonToString = sdata.JSON.stringify(jsonAll);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/", "_pollwow", jsonToString, finishSettingsAfterSave);
	};
	
	/**
	 * Get all the pollwows from the current site
	 * @param {Boolean} addToAll Add to all the pollwows
	 * @param {Function} functionOnComplete Function to be executed on completion
	 */
	var getAllPollwow = function(addToAll, functionOnComplete){
		sdata.Ajax.request({
			url: "/sdata/f/" + placement + "/_pollwow?sid=" + Math.random(),
			httpMethod: "GET",
			onSuccess: function(data){
				parseAllPollwow(data, true);
				if (addToAll){addCurrentToAllPollwow();}
				if (functionOnComplete !== null){
					functionOnComplete();
					$("#pollwow_insert_existing", rootel).hide();
				}
			},
			onFail: function(status){
				parseAllPollwow(status, false);
				if (addToAll) {addCurrentToAllPollwow();}
				if (functionOnComplete !== null) {
					functionOnComplete();
					$("#pollwow_insert_existing", rootel).hide();
				}
			}
		});
	};
	
	/**
	 * Finish after the first save
	 * @param {Boolean} success
	 */
	var finishNewSettings = function(success){
		if(saveAllToDatabase){
			getAllPollwow(true, null);
		}else{
			sdata.container.informFinish(tuid);
		}
	};
	
	/**
	 * Create a placeholder for the widget
	 */
	var createPlaceHolder = function(){
		json.pollwow.placeholder = 1;
		savePollwowToDatabase(finishNewSettings, false);
	};
		
	/**
	 * Save the options to the global json variable
	 */
	var saveOptions = function(){
		var tempArray = [];
		for(var i = 0; i < $("#pollwow_options", rootel).children().length; i++){ // -2 because we don't need the buttonbar
			var tempValue = $("#pollwow_question_input"+i, rootel).val();
			tempArray.push({answer: tempValue});
		}
		json.pollwow.options = tempArray;
	};
	
	/** 
	 * Add a new option
	 */
	var addNewOption = function(){
		if(json){
			saveOptions();
			json.pollwow.options.push({answer: ""});
			$("#pollwow_options", rootel).html(sdata.html.Template.render('pollwow_options_rendered_template',json));
			if (json.pollwow.options.length > 0) {
				$("#pollwow_question_input" + (json.pollwow.options.length-1),rootel).focus();
			}
			bindOptions();
		}
	};
	
	/**
	 * Bind all the elements in the options div
	 */
	var bindOptions = function() {		
		/** Bind the remove option buttons */
		$(".pollwow_close", rootel).bind("click",function(e,ui){
			var id = e.target.parentNode.id;
			/** Remove option */
			if(json){
				saveOptions();
				id = id.replace("pollwow_question","");
				var id_int = parseInt(id, 10);
				json.pollwow.options.splice(id_int,1);
				$("#pollwow_options", rootel).html(sdata.html.Template.render('pollwow_options_rendered_template',json));
				if (json.pollwow.options.length > 0) {
					$("#pollwow_question_input" + (json.pollwow.options.length-1),rootel).focus();
				}
				bindOptions();
			}
		});
		
		/** Bind add new option on enter in last box */
		if(addNewOptionOnEnter){
			if (json.pollwow.options.length > 0) {
	        	$("#pollwow_question_input" + (json.pollwow.options.length-1),rootel).keypress(function(e){
					if (e.which === 13) {
						addNewOption();
						return false;
					}
				});
			}
		}
	};
	
	/**
	 * Save the polltype to the global json variable
	 * @param {String} id Id of the type that needs to be saved
	 */
	var savePollType = function(id){
		if(json){
			var id_int = 0;
			switch(id) {
				case "pollwow_polltype_vertical":
				id_int = 0;
			  	break;
				case "pollwow_polltype_horizontal":
				id_int = 1;
			  	break;
				case "pollwow_polltype_pie":
				id_int = 2;
			  	break;
				case "pollwow_polltype_text":
				id_int = 3;
			  	break;
			}
			json.pollwow.poll_type = id_int;
		}
	};
	
		
	/**
	 * Save a value of a input tag to the json object
	 * @param {String} field Id of the field that needs to be saved to the json object
	 */
	var saveInputValue = function(field){
		var tempElement = $("#pollwow_" + field, rootel);
		/** Check if the type of the field is checkbox or text (or textarea) */
		if(tempElement.attr("type") === "checkbox") {
			if (tempElement.attr("checked")) {
				json.pollwow[field] = 1;
			} else{
				json.pollwow[field] = 0;
			}
		}else{
			json.pollwow[field] = tempElement.val();
		}
	};
	
	/**
	 *  Save to the json object
	 */
	var savePollwow = function(){
		/** General save */
		saveInputValue("question");
		saveInputValue("allow_multiple");
		saveInputValue("not_see_chart_view");
		saveInputValue("allow_see_results");

		/** Save dates, hours and minutes */
		saveInputValue("startdate");
		saveInputValue("starthour");
		saveInputValue("startmin");
		saveInputValue("stopdate");
		saveInputValue("stophour");
		saveInputValue("stopmin");
		
		/** Save options */
		saveOptions();
		
		/** Clear votes */
		json.pollwow.votes =[];
		for(var i = 0; i<json.pollwow.options.length; i++){
			json.pollwow.votes.push(0);
		}
	};
	
	/**
	 * Add binding to the tabs
	 */
	var addTabBinding = function(){
		$("#pollwow_create_new_tab", rootel).bind("click",function(e,ui){
			$("#pollwow_insert_existing", rootel).hide();
			$(".pollwow_selectedtab").removeClass("pollwow_selectedtab");
			$("#pollwow_create_new_tab").addClass("pollwow_selectedtab");
			$("#pollwow_create_new", rootel).show();
		});
		$("#pollwow_insert_existing_tab", rootel).bind("click",function(e,ui){
			$("#pollwow_create_new", rootel).hide();
			$(".pollwow_selectedtab").removeClass("pollwow_selectedtab");
			$("#pollwow_insert_existing_tab").addClass("pollwow_selectedtab");
			$("#pollwow_insert_existing", rootel).show();
		});
	};
	
		
	/** 
	 * Get the element that needs to be inserted
	 * @param {String} id Id of the element
	 */
	var getInsertElement = function(id){
		for(var i = 0; i < jsonAll.pollwows.length; i++){
			if(id === jsonAll.pollwows[i].tuid){
				return jsonAll.pollwows[i];
			}
		}
		return false;
	};
	
	/**
	 * Add binding to the buttons and date picker
	 * Needs to happen after the render
	 */
	var addBinding = function(){
		/** Bind the create placeholder button */
		$("#pollwow_create_placeholder", rootel).click(function(){
			createPlaceHolder();
		});
		
		/** Bind the add new option button */
		$("#pollwow_add_new_option", rootel).click(function(){
			addNewOption();
		});
		
		/** Bind the toggle advanced settings button */
		$("#pollwow_toggle_advanced_settings", rootel).click(function(){
			$("#pollwow_advanced_settings", rootel).slideToggle(400);
			if($("#pollwow_toggle_advanced_settings_up", rootel).is(":visible")){
				$("#pollwow_toggle_advanced_settings_up").hide();
				$("#pollwow_toggle_advanced_settings_down").show();
			}else{
				$("#pollwow_toggle_advanced_settings_down").hide();
				$("#pollwow_toggle_advanced_settings_up").show();
			}
		});
		/** Hide or show advanced settings */
		if(isAdvancedSettingsVisible){
			$("#pollwow_advanced_settings", rootel).show();
			$("#pollwow_toggle_advanced_settings_down").hide();
			$("#pollwow_toggle_advanced_settings_up").show();	
		}else{
			$("#pollwow_advanced_settings", rootel).hide();
			$("#pollwow_toggle_advanced_settings_up").hide();
			$("#pollwow_toggle_advanced_settings_down").show();
		}
		
		bindOptions();
		
		/** Bind the pollwow types */
		$("#pollwow_polltype li a", rootel).bind("click",function(e,ui){
			var id = e.target.parentNode.id;
			$(".pollwow_polltype_active").removeClass("pollwow_polltype_active");
			savePollType(id);
			$("#"+id, rootel).addClass("pollwow_polltype_active");
		});
		
		/** Bind datepickers */
		var d = new Date();
		$("#pollwow_startdate", rootel).datepicker({
			showOn: 'both',
			showAnim: 'slideDown',
			buttonImage: '/devwidgets/pollwow/images/pollwow_drop_down.gif',
			buttonImageOnly: true,
			buttonText: "Please select a start date",
			dateFormat: 'dd/mm/yy',
			defaultDate: d,
			minDate: d
		});

		$("#pollwow_stopdate", rootel).datepicker({
			showOn: 'both',
			showAnim: 'slideDown',
			buttonImage: '/devwidgets/pollwow/images/pollwow_drop_down.gif',
			buttonImageOnly: true,
			buttonText: "Please select a stop date",
			dateFormat: 'dd/mm/yy',
			defaultDate: +7,
			minDate: d
		});
		
		/** Make and bind the hours and minutes div */
		makeBindDiv('pollwow_starthour', 24);
		makeBindDiv('pollwow_startmin', 60);
		makeBindDiv('pollwow_stophour', 24);
		makeBindDiv('pollwow_stopmin', 60);
		
		/** Bind the settings cancel button */
		$("#pollwow_cancel", rootel).bind("click",function(e,ui){
			sdata.container.informCancel(tuid);
		});
		
		/** Bind the settings cancel button on the existing tab */
		$("#pollwow_cancel_existing", rootel).bind("click",function(e,ui){
			sdata.container.informCancel(tuid);
		});
		
		/** Bind the preview button */
		$("#pollwow_preview_button", rootel).bind("click",function(e,ui){
			if(json){
				isAdvancedSettingsVisible = $("#pollwow_advanced_settings", rootel).is(':visible');
				savePollwow();
				showHidePreview(true);
				renderPoll(true);
				renderPreview();
				json.pollwow.placeholder = 0;
				$("#pollwow_preview_insert", rootel).bind("click",function(e,ui){
					savePollwowToDatabase(finishNewSettings, true);
				});
				
			}
		});
		
		/** Bind the preview back button */
		$("#pollwow_widget_insert", rootel).bind("click",function(e,ui){
			var id = $(".pollwow_insert_existing_selected", rootel)[0].id;
			if(id !== undefined){
				id = id.replace("pollwow_insert_existing_item", "");
				
				var pollwowElement = getInsertElement(id);
				if(pollwowElement){
					pollwowElement.votes =[];
					for(var i = 0; i<pollwowElement.options.length; i++){
						pollwowElement.votes.push(0);
					}
					pollwowElement.tuid = tuid;
					pollwowElement.pollwows = []; 
					pollwowElement.temp = {};
					json.pollwow = pollwowElement;
					savePollwowToDatabase(finishNewSettings, true);
				}else {
					alert("Could not recieve the id of the element");
				}
			}else{
				alert("Could not recieve the selected element.");
			}
		});
		
		/** Bind the insert existing items */
		if(jsonAll && jsonAll.pollwows.length > 0){
			$("#pollwow_insert_existing_items a", rootel).bind("click",function(e,ui){
				$("#pollwow_insert_existing_items a", rootel).removeClass("pollwow_insert_existing_selected");
				var id = e.target.id;
				$("#"+id, rootel).addClass("pollwow_insert_existing_selected");
			});
			$("#pollwow_insert_existing_item"+jsonAll.pollwows[0].tuid, rootel).addClass("pollwow_insert_existing_selected");
		}
		
		/** Bind the preview back button */
		$("#pollwow_preview_back", rootel).bind("click",function(e,ui){
			showHidePreview(false);
			renderSettings();
			addBinding(); // add binding			

			$("#pollwow_insert_existing", rootel).hide();
			$(".pollwow_selectedtab").removeClass("pollwow_selectedtab");
			$("#pollwow_create_new_tab").addClass("pollwow_selectedtab");
			$("#pollwow_create_new", rootel).show();
		});
		
		/** Add binding to the tabs */
		addTabBinding();
	};
	
	/**
	 * Render the settings of the widget
	 */
	var renderAndBindSettings = function(){		
		renderSettings();

		addBinding(); // add binding
	};
		
	/**
	 * Get the id of the pollwow widget and show the post including replies
	 */
	var fillInUniqueId = function(){
		sdata.Ajax.request({
			url: "/sdata/f/" + placement + "/" + tuid + "/pollwow?sid=" + Math.random(),
			httpMethod: "GET",
			onSuccess: function(data){
				showPollwow(data, true);
			},
			onFail: function(status){
				showPollwow(status, false);
			}
		});
	};
	
	/**
	 * Insert some basic values into the json object
	 */
	var insertValues = function(){
		var d = new Date();
		json.pollwow.startdate = extractToTwo(d.getDate())+"/"+extractToTwo(d.getMonth()+1)+"/"+d.getFullYear();
		json.pollwow.starthour = extractToTwo(d.getHours());
		json.pollwow.startmin = extractToTwo(d.getMinutes());
		
		var dNextWeek = new Date();
		var day = dNextWeek.getDate() + 7;
		dNextWeek.setDate(day);
		
		json.pollwow.stopdate = extractToTwo(dNextWeek.getDate())+"/"+extractToTwo(dNextWeek.getMonth()+1)+"/"+dNextWeek.getFullYear();
		json.pollwow.stophour = extractToTwo(d.getHours());
		json.pollwow.stopmin = extractToTwo(d.getMinutes());
		
		getAllPollwow(false, renderAndBindSettings);
	};
	
	/**
	 * Show the pollwow in the pop-up settings window
	 * @param {String} response Json response with all the posts
	 * @param {Boolean} exists Check if the pollwow exists
	 */
	var showPollwowSettings = function(response, exists){
		/** Check if a pollwow exists */
		if (exists) {
			json = json_parse(response);
			renderAndBindSettings();
			$("#pollwow_insert_existing", rootel).hide();
		}
		else {
			pollwow = {
				allow_multiple : 0,
				allow_see_results : 0,
				stopdate: "",
				stophour: "",
				stopmin: "",
				options : [
				{answer: ""},
				{answer: ""}
				],
				placeholder: 0,
				poll_type: 0,
				question : "",
				not_see_chart_view : 0,
				startdate: "",
				starthour: "",
				startmin: "",
				users: [],
				votes: []
			}; // Initialize pollwow obj
			json = {};
			json.pollwow = pollwow;
			
			insertValues();
		}
	};
	
	/**
	 * Switch between main and settings page
	 * @param {Boolean} showSettings Show the settings of the widget or not
	 */
	if (showSettings) {
		$("#pollwow_show", rootel).hide();

		showHidePreview(false);
		
		sdata.Ajax.request({
			url: "/sdata/f/" + placement + "/" + tuid + "/pollwow?sid=" + Math.random(),
			httpMethod: "GET",
			onSuccess: function(data){
				showPollwowSettings(data, true);
			},
			onFail: function(status){
				showPollwowSettings(status, false);
			}
		});
		$("#pollwow_show_container", rootel).hide();
		$("#pollwow_container", rootel).show();
		$("#pollwow_main_container", rootel).show();
	}
	else {
		$("#pollwow_container", rootel).hide();
		$("#pollwow_show_container", rootel).show();
		fillInUniqueId();
		$("#pollwow_main_container", rootel).show();
	}
};
sdata.widgets.WidgetLoader.informOnLoad("pollwow");