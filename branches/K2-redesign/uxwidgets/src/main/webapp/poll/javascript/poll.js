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

/*global $, Config, sdata */

var sakai = sakai || {};

/**
 * Initialize the poll widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement Place where the widget is located in the jcr system
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.poll = function(tuid, placement, showSettings){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var json = false; 						// Variable used to recieve information by json
	var jsonAll = false; 					// Contains all the polls
	var me = sdata.me; 						// Contains information about the current user
	var rootel = $("#" + tuid); 			// Get the main div used by the widget
	var colors = ["663300","e07000","0070e0",
	"660000","990080","c4fc95","c4e3fc","79c365",
	"5ba940","f5f4bf","f1eca1","c3e2fc","f2eda2",
	"8ad769","ac9d7d","79ccff","00a4e4","ac9c7d",
	"9f8c60","abe652","f6b5b5","cd9c9c","ad8181",
	"ee5858","ce1616"];
	var isAdvancedSettingsVisible = false; 	// Are the advanced settings visible
	var addNewOptionOnEnter = true; 		// Add a new option when pressing enter
	var saveAllToDatabase = false; 			// Save the poll to the list of polls

	// - ID
	var poll = "#poll";
	var pollAddNewOption = poll + "_add_new_option";
	var pollAdvancedSettings = poll + "_advanced_settings";
	var pollContainer = poll + "_container";
	var pollMainContainer = poll + "_main_container";
	var pollOptions = poll + "_options";
	var pollPolltype = poll + "_polltype";
	var pollSettings = poll + "_settings";
	var pollStartdate = poll + "_startdate";
	var pollStopdate = poll + "_stopdate";
	var pollWidgetInsert = poll + "_widget_insert";
	
	// Cancel
	var pollCancel = poll + "_cancel";
	var pollCancelExisting = pollCancel + "_existing";
	
	// Class
	var pollInsertExistingItemClass = "poll_insert_existing_item";
	var pollInsertExistingSelectedClass = "poll_insert_existing_selected";
	
	var pollPolltypeClass = "poll_polltype";
	var pollPolltypeActiveClass = pollPolltypeClass + "_active";
	var pollPolltypePieClass = pollPolltypeClass + "_pie";
	var pollPolltypeHorizontalClass = pollPolltypeClass + "_horizontal";
	var pollPolltypeTextClass = pollPolltypeClass + "_text";
	var pollPolltypeVerticalClass = pollPolltypeClass + "_vertical";
	
	var pollQuestionClass = "poll_question";
	var pollQuestionViewOptionsClass = "poll_question_view_options";
	
	var pollSelectedTabClass = "poll_selectedtab";
	
	var pollStartHourClass =  "poll_starthour";
	var pollStartMinClass = "poll_startmin";
	var pollStopHourClass = "poll_stophour";
	var pollStopMinClass = "poll_stopmin";
	
	var pollTimeActiveClass = "poll_time_active";
	
	// Class with .
	var pollClose = ".poll_close";
	
	// Chart
	var pollChart = poll + "_chart";
	var pollChartView = pollChart + "_view";
	var pollChartViewBack = pollChartView + "_back";
	
	// Create
	var pollCreate = poll + "_create";
	var pollCreateNew = pollCreate + "_new";
	var pollCreateNewTab = pollCreateNew + "_tab";
	var pollCreatePlaceholder = pollCreate + "_placeholder";
	
	// Insert
	var pollInsert = poll + "_insert";
	var pollInsertExisting = pollInsert + "_existing";
	var pollInsertExistingItem = pollInsertExisting + "_item";
	var pollInsertExistingItems = pollInsertExisting + "_items";
	var pollInsertExistingTab = pollInsertExisting + "_tab";
	
	// Preview
	var pollPreview = poll + "_preview";
	var pollPreviewBack = pollPreview + "_back";
	var pollPreviewButton = pollPreview + "_button";
	var pollPreviewChart = pollPreview + "_chart";
	var pollPreviewInsert = pollPreview + "_insert";
	var pollPreviewQuestion = pollPreview + "_question";
	
	// Question
	var pollQuestion = poll + "_question";
	var pollQuestionInput = pollQuestion + "_input";
	var pollQuestionView = pollQuestion + "_view";
	var pollQuestionViewResults = pollQuestionView + "_results";
	var pollQuestionViewVote = pollQuestionView + "_vote";
	
	// Show
	var pollShow = poll + "_show";
	var pollShowChart = pollShow + "_chart";
	var pollShowContainer = pollShow + "_container";
	var pollShowQuestion = pollShow + "_question";
	
	// Template
	var pollOptionsTemplate = "poll_options_template";
	var pollPreviewChartTemplate = "poll_preview_chart_template";
	var pollPreviewQuestionTemplate = "poll_preview_question_template";
	var pollSettingsTemplate = "poll_settings_template";
	var pollShowChartTemplate = "poll_show_chart_template";
	var pollShowQuestionTemplate = "poll_show_question_template";

	// Toggle
	var pollToggleAdvancedSettings = poll + "_toggle_advanced_settings";
	var pollToggleAdvancedSettingsDown = pollToggleAdvancedSettings + "_down";
	var pollToggleAdvancedSettingsUp = pollToggleAdvancedSettings + "_up";


	///////////////////////
	// Utility functions //
	///////////////////////

	/*global addShowBinding, viewResults, bindOptions */

	/**
	 * Convert to 2 numbers, we use this for converting hours and minutes
	 * 	e.g.
	 * 	2 -> 02
	 * 	5 -> 05
	 * 	23 -> 23
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
	 * @return {Date} the converted date
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
	 * This means that the startdate should be before the stopdate
	 */
	var checkDates = function(){
		var today = new Date();
		
		var startdate = convertDate(json.poll.startdate, json.poll.starthour, json.poll.startmin);
		var stopdate = convertDate(json.poll.stopdate, json.poll.stophour, json.poll.stopmin);
		if(startdate > today){
			json.poll.temp.polldateok = 0;
		}else{
			json.poll.temp.polldateok = 1;
			if(stopdate < today){
				json.poll.temp.polldateok = 0;
			}
		}
	};


	////////////////////////////////
	// Render & process functions //
	////////////////////////////////
		
	/**
	 * Render the show question of the widget
	 */
	var renderShowQuestion = function(){
		$(pollShowQuestion, rootel).html($.Template.render(pollShowQuestionTemplate,json));
	};
	
	/**
	 * Render the show chart view of the widget
	 */
	var renderShowChart = function(){
		$(pollShowChart, rootel).html($.Template.render(pollShowChartTemplate,json));
	};
	
	/**
	 * Render the preview of the widget
	 */
	var renderPreview = function(){
		$(pollPreviewQuestion, rootel).html($.Template.render(pollPreviewQuestionTemplate,json));
		$(pollPreviewChart, rootel).html($.Template.render(pollPreviewChartTemplate,json));
	};
	
	/**
	 * Render the options for the poll
	 */
	var renderOptions = function(){
		$(pollOptions, rootel).html($.Template.render(pollOptionsTemplate,json));
	};
	
	/**
	 * Render the settings of the widget
	 */
	var renderSettings = function(){
		$(pollSettings, rootel).html($.Template.render(pollSettingsTemplate,json));
		renderOptions();
	};
	
	/**
	 * Process the poll information (options/votes)
	 * @param {Boolean} preview Is in preview mode or not
	 */
	var processPoll = function(preview){
		var totalvotes = 0;
		var totalvotescount = 0;
		
		// Check if the poll is in preview mode or not
		if(preview){
			
			// If the poll is in preview mode, we add some dummy data
			json.poll.temp={};
			json.poll.temp.options = [];
			json.poll.temp.options = [{answer: "Option 1"},{answer: "Option 2"},{answer: "Option 3"},{answer: "Option 4"},{answer: "Option 5"}];
			
			json.poll.temp.votes = [];
			json.poll.temp.votes = [180,124,45,78,250];
			
			totalvotes = json.poll.temp.votes.length;
			totalvotescount = 0;
			for(var i = 0; i < json.poll.temp.votes.length; i++){
				totalvotescount += json.poll.temp.votes[i];
				json.poll.temp.options[i].color = colors[i];
			}
			
			json.poll.temp.processedVotes = [];
			for(var j = 0; j < json.poll.temp.votes.length; j++){
				json.poll.temp.processedVotes[j] = {};
				json.poll.temp.processedVotes[j].percentage = Math.round(json.poll.temp.votes[j] / totalvotescount * 100);
			}
			json.poll.temp.question = "How is the weather in England?";
			
		}else{
			
			// If the poll is not in preview mode, we add real data
			totalvotes = json.poll.votes.length;
			totalvotescount = 0;
			for(var m = 0; m < json.poll.votes.length; m++){
				totalvotescount += json.poll.votes[m];
			}
			json.poll.processedVotes = [];
			
			if(totalvotescount === 0){
				// If the there are no votes, all the percentages should be 0
				for(var k = 0; k < json.poll.votes.length; k++){
					json.poll.processedVotes[k] = {};
					json.poll.processedVotes[k].percentage = 0;
				}
			}else{
				// If there are votes, we calculate the percentages
				for(var l = 0; l < json.poll.votes.length; l++){
					json.poll.processedVotes[l] = {};
					json.poll.processedVotes[l].percentage = Math.round(json.poll.votes[l] / totalvotescount * 100);
				}
			}
		}
	};
	
	/** 
	 * Add the data to the chart
	 */
	var renderPoll_addData = function(){
		// Add the percentages to the chart
		json.poll.image += "&chd=t:";				
		for(var i = 0; i < json.poll.processedVotes.length; i++){
			json.poll.image += json.poll.processedVotes[i].percentage + ",";
		}
		// Remove the last "," at the end of the image
		json.poll.image = json.poll.image.substring(0,json.poll.image.length - 1);
	};
	
	/** 
	 * Add colors to the chart
	 */
	var renderPoll_addColors = function (){
		// Add the colors to both the options and the image/chart itself
		// The options are the list above the image
		json.poll.image += "&chco=";
		for(var i = 0; i < json.poll.processedVotes.length; i++){
			json.poll.options[i].color = colors[i];
			json.poll.image += colors[i]+"|";
		}
		// Remove the last "," at the end of the image
		json.poll.image = json.poll.image.substring(0,json.poll.image.length - 1);
	};
	
	
	/**
	 * Add the percentage signs to the chart image
	 * @param {Boolean} reverse
	 * 	true: Run through the elements in reverse order
	 * 	false: Run over the elements in normal order
	 */
	var renderPoll_addPercentages = function(reverse){
		if(reverse){
			for(var k = json.poll.processedVotes.length-1; k >=0 ; k--){
				json.poll.image += json.poll.processedVotes[k].percentage + "%|";
			}
		}else{
			for(var j = 0; j < json.poll.processedVotes.length; j++){
				json.poll.image += json.poll.processedVotes[j].percentage + "%|";
			}
		}
		json.poll.image = json.poll.image.substring(0,json.poll.image.length - 1);
	};
	
	/**
	 * Render the poll widget
	 * @param {Boolean} preview True if it a preview
	 */
	var renderPoll = function(preview){
		if(json){
			if(preview){
				
				// The poll is in preview mode
				processPoll(preview);
				switch(json.poll.poll_type){
					case 0:
						json.poll.image = Config.URL.API_GOOGLE_CHARTS + "?cht=bvs&chs=310x180&chd=t:27,18,7,12,37&chxt=x&chxl=0:|27%|18%|7%|12%|37%&chco=663300|e07000|0070e0|660000|990080";
					break;
					case 1:
						json.poll.image = Config.URL.API_GOOGLE_CHARTS + "?cht=bhs&chs=310x170&chd=t:27,18,7,12,37&chxt=y&chxl=0:|37%|12%|7%|18%|27%&chco=663300|e07000|0070e0|660000|990080";
					break;
					case 2:
						json.poll.image = Config.URL.API_GOOGLE_CHARTS + "?cht=p&chs=310x250&chd=t:27,18,7,12,37&chl=27%|18%|7%|12%|37%&chco=663300|e07000|0070e0|660000|990080";
					break;
					case 3:
						for(var i = 0; i < json.poll.temp.processedVotes.length; i++){
							json.poll.temp.options[i].percentage = json.poll.temp.processedVotes[i].percentage + "%";
							json.poll.temp.options[i].color = colors[i];
						}
					break;
				}
			}else {
				processPoll(preview);
				switch(json.poll.poll_type){
					// Switch over the different poll types
					// 0: Vertical bars
					// 1: Horizontal bars
					// 2: Pie chart
					// 3: Text only
					case 0:
						var width = 0;
						if(json.poll.processedVotes.length > 11){
							width = 300 + (json.poll.processedVotes.length-11) *30;
						}else
						{
							width = 310;
						}
						json.poll.image = Config.URL.API_GOOGLE_CHARTS + "?cht=bvs&chs=" + width + "x180";
					
						renderPoll_addData();
												
						json.poll.image += "&chxt=x&chxl=0:|";
						
						renderPoll_addPercentages(false);
						
						renderPoll_addColors();
					break;
					case 1:
						//http://chart.apis.google.com/chart?cht=bhs&chs=310x250&chd=t:1,12,4,7,76&chxt=x,y&chxl=1:|1%20%|12%20%|4%20%|7%20%|76%20%
						var height = 20 + (json.poll.processedVotes.length*30);
						
						json.poll.image = Config.URL.API_GOOGLE_CHARTS + "?cht=bhs&chs=310x" + height;
					
						renderPoll_addData();
						
						json.poll.image += "&chxt=y&chxl=0:|";
						
						renderPoll_addPercentages(true);
						
						renderPoll_addColors();
					break;
					case 2:
						json.poll.image = Config.URL.API_GOOGLE_CHARTS + "?cht=p&chs=310x250";
						
						renderPoll_addData();
						
						json.poll.image += "&chl=";
						
						renderPoll_addPercentages(false);
	
						renderPoll_addColors();
					break;
					case 3:
						for(var m = 0; m < json.poll.processedVotes.length; m++){
							json.poll.options[m].percentage = json.poll.processedVotes[m].percentage + "%";
							json.poll.options[m].color = colors[m];
						}
					break;
				}
			}
		}
	};
	
	/**
	 * Show or hide the chart of the widget
	 * @param {Boolean} show
	 * 	true: The chart of the poll are shown
	 * 	false: The questions of the poll are shown
	 */
	var showHideChart = function(show){
		if(show){
			$(pollShowQuestion, rootel).hide();
			$(pollShowChart, rootel).show();
		}else {
			$(pollShowChart, rootel).hide();
			$(pollShowQuestion, rootel).show();
		}
	};
	
	/**
	 * Save the poll to the database
	 * @param {function} functionOnComplete Function that will be executed after a save
	 * @param {Boolean} saveAll Save all the posts
	 */
	var savePollToDatabase = function(functionOnComplete, saveAll){
		saveAllToDatabase = saveAll;
		 // Clear polls array
		json.poll.polls = [];
		var jsonToString = $.toJSON(json);
		var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
		sdata.widgets.WidgetPreference.save(saveUrl, "poll", jsonToString, functionOnComplete);		
	};
	
	/**
	 * View the questions of the poll
	 */
	var viewQuestions = function(){
		renderShowQuestion();
		if(json.poll.placeholder === 0){
			addShowBinding();
		}
		showHideChart(false);
	};
	
	/**
	 * After a vote has been registered
	 */
	var finishVoting = function(){
		json.poll.temp.userVoted = 1;
		if(json.poll.not_see_chart_view === 1){
			viewQuestions();
		}else{
			viewResults();
		}
	};
	
	/**
	 * Register the vote of a user
	 */
	var registerVote = function(){
		
		// Check if we can get the me object for the current user
		if(me){
			
			// A user can only vote once
			if(!json.poll.users.contains(me.preferences.uuid)){
				
				// Double check (it is already checked in the bindUnbindVote function)
				// if the user has checked an element. We do this double check to make it
				// more secure.
				if($('input[name=' + pollQuestionViewOptionsClass + ']:checked').length === 0){
					alert("Please select at least one option.");
					
				// If the user selected one option
				}else if ($('input[name=' + pollQuestionViewOptionsClass + ']:checked').length === 1){
					json.poll.votes[parseInt($('input[name=' + pollQuestionViewOptionsClass + ']:checked').val(), 10)] +=1;
					
					json.poll.users.push(me.preferences.uuid);
					savePollToDatabase(finishVoting, false);
				
				// If the user selected multiple options
				}else{
					for(var i = 0; i < $('input[name=' + pollQuestionViewOptionsClass + ']:checked').length; i++){
						json.poll.votes[parseInt($("#" + $('input[name=' + pollQuestionViewOptionsClass + ']:checked')[i].id).val(), 10)] += 1;
					}
					
					json.poll.users.push(me.preferences.uuid);
					savePollToDatabase(finishVoting, false);
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
	 * Bind or unbind the vote button bindUnbindVote
	 * We only make it possible to click the vote button if one of the elements is checked
	 */
	var bindUnbindVote = function(){
		if ($('input[name=' + pollQuestionViewOptionsClass + ']:checked').length > 0){
			bindUnbind($(pollQuestionViewVote), registerVote, true);
		}				
		else{
			bindUnbind($(pollQuestionViewVote, rootel), registerVote, false);
		}
	};
	
	/**
	 * Add binding when the poll is shown in a page
	 */
	var addShowBinding = function(){
		$(pollQuestionViewResults, rootel).bind("click",function(e,ui){
			viewResults();
		});
		$("input[name=" + pollQuestionViewOptionsClass + "]").bind("click",function(e,ui){
			bindUnbindVote();
		});
		bindUnbindVote();
	};
	
	/**
	 * Add binding when the chart of the poll is shown
	 */
	var addShowChartBinding = function(){
		// Add binding to the back button
		$(pollChartViewBack, rootel).bind("click",function(e,ui){
			viewQuestions();
		});
	};
	
	/**
	 * View the results for the poll
	 */
	var viewResults = function(){
		
		// Render the poll
		renderPoll(false);
		
		// Render the chart
		renderShowChart();
		
		// Add the binding
		addShowChartBinding();
		
		// Show the chart and hide the questions
		showHideChart(true);
	};
	
	/**
	 * Show the poll
	 * @param {String} response Json response with the poll
	 * @param {Boolean} exists Check if the discussion exists
	 */
	var showPoll = function(response, exists){
		if (exists){
			if(me){
				try {
					json = $.evalJSON(response);
					
					json.poll.temp = {};
					
					// Check if the date are correct
					checkDates();
					
					if (json.poll.users.contains(me.preferences.uuid)) {
						json.poll.temp.userVoted = 1;
						
						// Check if the user is allowed to see the chart or not
						if(json.poll.not_see_chart_view === 1){
							viewQuestions();
						}else{
							viewResults();
						}
					}else{
						json.poll.temp.userVoted = 0;
						if(json.poll.temp.polldateok === 1){
							viewQuestions();
						}else{
							if(json.poll.not_see_chart_view === 1){
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
				showPoll(response, exists);
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
			$(pollSettings, rootel).hide();
			$(pollPreview, rootel).show();
		}else {
			$(pollPreview, rootel).hide();
			$(pollSettings, rootel).show();
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
	 * We do this by making a dynamic element that is added to the appropriate div
	 * @param {String} input Name of the elements that need to be created
	 * @param {Integer} count How many fields there need to be created
	 */
	var makeBindDiv = function(input, count){
		for(var i = 0; i < count; i++){
			
			// Create the dynamic element
			var a = document.createElement('a');
			
			// Set the class and id
			a.setAttribute('class', input);
			a.setAttribute('id', input+i);
			
			// We can not add "#" or "javascript:":
			//	"#" When we do this and you click on it, you go to the top of the page
			//	"javascript:" Will not parse through JSLint
			a.setAttribute('href', "java-event");
			
			// Create the text for in the a tag and convert it to 2 characters (2 -> 02)
			var text = document.createTextNode(extractToTwo(i)+"");
			
			// Add the text to the a tag
			a.appendChild(text);
			
			// Add the a tag to the div
			$("#"+input+"_div").append(a);
		}
		
		// If you click on a field, insert the value into the input box and change class
		$("#" + input + "_div a", rootel).bind("click",function(e,ui){
			
			// Get the original id (the id from the element you clicked on)
			var id_original = e.target.id;
			
			// Remove the front part of the id (only keep the last part e.g. 21)
			var id = id_original.replace(input, "");
			
			// Remove the active class from the other elements
			$("#" + input + "_div a", rootel).removeClass(pollTimeActiveClass);
			
			// Set the text in the inputbox (above the drop down) to the number you clicked on
			$("#" + input).val(extractToTwo(id)+"");
			
			// Add the active class to the number you clicked
			$("#" + id_original, rootel).addClass(pollTimeActiveClass);
			
			// Hide the div containing all the numbers
			$("#"+ input + "_div").hide();
			
			// We do this to not reload the page again
			return false;
		});
		
		// Add the binding to the input field and the image to show the dropdown
		$("#"+ input, rootel).bind("click",function(e,ui){
			toggleTime($("#"+ input + "_div"), $("#"+ input));
		});
		$("#"+ input + "_down", rootel).bind("click",function(e,ui){
			toggleTime($("#"+ input + "_div"), $("#"+ input));
		});
	};
	
	/**
	 * Add to all the polls
	 * @param {String} response Json response with the poll
	 * @param {Boolean} exists Check if the poll exists
	 */
	var parseAllPoll = function(response, exists){
		if (exists) {
			if (me) {
				try {
					jsonAll = $.evalJSON(response);
					if(jsonAll && jsonAll.polls.length > 0){
						json.poll.polls = jsonAll.polls;
					}else{
						json.poll.polls = [];
					}
				}
				catch (err) {
					alert(err);
				}
			}
			else {
				parseAllPoll(response, exists);
			}
		}
		else {
			jsonAll = {};
			jsonAll.polls = [];
		}
	};
			
	/**
	 * Function that will be executed after the save to the database
	 */
	var finishSettingsAfterSave = function(){
		// Informes the sdata container that you are finished editing the widget.
		// This will close the lightbox
		sdata.container.informFinish(tuid);
	};
	
	/**
	 * Add the current item to the list of polls
	 */
	var addCurrentToAllPoll = function(){
		// Remove from all the polls
		for(var i = 0; i < jsonAll.polls.length; i++){
			if(jsonAll.polls[i].tuid === tuid){
				jsonAll.polls.splice(i,1);
			}
		}
		
		// Add the tuid of the poll
		json.poll.tuid = tuid;
		json.poll.polls = []; 
		json.poll.temp = {};
		jsonAll.polls.push(json.poll);
		
		var jsonToString = $.toJSON(jsonAll);
		sdata.widgets.WidgetPreference.save(Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement) + "/", "_poll", jsonToString, finishSettingsAfterSave);
	};
	
	/**
	 * Get all the polls from the current site
	 * @param {Boolean} addToAll Add to all the polls
	 * @param {Function} functionOnComplete Function to be executed on completion
	 */
	var getAllPoll = function(addToAll, functionOnComplete){
		$.ajax({
			url: Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, placement) + "/_poll",
			cache: false,
			success: function(data){
				parseAllPoll(data, true);
				if (addToAll){addCurrentToAllPoll();}
				if (functionOnComplete !== null){
					functionOnComplete();
					$(pollInsertExisting, rootel).hide();
				}
			},
			error: function(status){
				parseAllPoll(status, false);
				if (addToAll) {addCurrentToAllPoll();}
				if (functionOnComplete !== null) {
					functionOnComplete();
					$(pollInsertExisting, rootel).hide();
				}
			}
		});
	};

	/**
	 * Executed after clicking on the save button
	 */
	var finishNewSettings = function(){
		if(saveAllToDatabase){
			getAllPoll(true, null);
		}else{
			sdata.container.informFinish(tuid);
		}
	};
	
	/**
	 * Create a placeholder for the widget
	 */
	var createPlaceHolder = function(){
		
		// Set the placeholder option to 1
		json.poll.placeholder = 1;
		
		// Save the poll to the database
		savePollToDatabase(finishNewSettings, false);
	};
		
	/**
	 * Save the options to the global json variable
	 */
	var saveOptions = function(){
		
		// Create an array that will contain all the options the user entered
		var pollOptionsArray = [];
		
		// Run over all the options on the page
		for(var i = 0; i < $(pollOptions, rootel).children().length; i++){
			
			// Get the value you inputed for the option
			var pollOptionItem = $(pollQuestionInput+i, rootel).val();
			
			// Add that value to the array
			pollOptionsArray.push({answer: pollOptionItem});
		}
		
		// Set the poll option to the array containing all the options
		json.poll.options = pollOptionsArray;
	};
	
	/**
	 * Set the focus of the cursor on the last option input field if there are any options
	 */
	var setFocusOnLastOption = function(){
		if (json.poll.options.length > 0) {
			$(pollQuestionInput + (json.poll.options.length-1),rootel).focus();
		}
	};
	
	/** 
	 * Add a new option
	 * Function is executed when pressing enter in the last option input field
	 * or when clicking the add new option button.
	 */
	var addNewOption = function(){
		
		// Check if the json object exists
		if(json){
			
			// Save all the previous options
			saveOptions();
			
			// Add an empty answer to the options list (will result in an empty input field)
			json.poll.options.push({answer: ""});
			
			// Render the option fields
			renderOptions();
			
			// Set the focus of the cursor
			setFocusOnLastOption();
			
			// Add binding to the options
			bindOptions();
		}
	};
	
	/**
	 * Bind all the elements in the options div
	 */
	var bindOptions = function() {
		
		// Bind the remove option buttons
		$(pollClose, rootel).bind("click",function(e,ui){
			
			// Get the id of the textfield next to the close button
			var id = e.target.parentNode.id;
			
			// Remove an option from the list
			if(json){
				
				// Save all the previous options
				saveOptions();
				
				// Remove the first part of the id
				id = id.replace(pollQuestionClass,"");
				
				// Parse it to an integer so it is easy to remove the element from the array
				var id_int = parseInt(id, 10);
				
				// Remove the option from the array
				json.poll.options.splice(id_int, 1);
				
				// Render the option fields
				renderOptions();
				
				// Set the focus of the cursor
				setFocusOnLastOption();
				
				// Add binding to the options
				bindOptions();
			}
		});
		
		// Bind add new option when you press enter in last option inputbox
		if(addNewOptionOnEnter){
			if (json.poll.options.length > 0) {
	        	$(pollQuestionInput + (json.poll.options.length-1),rootel).keypress(function(e){
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
				case pollPolltypeVerticalClass:
					id_int = 0;
				  	break;
				case pollPolltypeHorizontalClass:
					id_int = 1;
				  	break;
				case pollPolltypePieClass:
					id_int = 2;
				  	break;
				case pollPolltypeTextClass:
					id_int = 3;
				  	break;
			}
			json.poll.poll_type = id_int;
		}
	};
		
	/**
	 * Save a value of a input tag to the json object
	 * @param {String} field Id of the field that needs to be saved to the json object
	 */
	var saveInputValue = function(field){
		
		var element = $(poll + "_" + field, rootel);
		
		// Check if the type of the field is checkbox or text (or textarea)
		if(element.attr("type") === "checkbox") {
			
			// Check if the element is checked or not
			if (element.is(':checked')) {
				json.poll[field] = 1;
			} else{
				json.poll[field] = 0;
			}
		}else{
			
			// If the field is a text/textarea get the value
			json.poll[field] = element.val();
		}
	};
	
	/**
	 *  Save to the json object
	 */
	var savePoll = function(){
		// General save to json object (input fields and checkboxes)
		saveInputValue("question");
		saveInputValue("allow_multiple");
		saveInputValue("not_see_chart_view");
		saveInputValue("allow_see_results");

		// Save dates, hours and minutes to the json object
		saveInputValue("startdate");
		saveInputValue("starthour");
		saveInputValue("startmin");
		saveInputValue("stopdate");
		saveInputValue("stophour");
		saveInputValue("stopmin");
		
		// Save options to the json object
		saveOptions();
		
		// Remove all the votes that were made before
		json.poll.votes =[];
		for(var i = 0; i<json.poll.options.length; i++){
			json.poll.votes.push(0);
		}
	};
	
	/**
	 * Add binding to the tabs
	 */
	var addTabBinding = function(){
		$(pollCreateNewTab, rootel).bind("click",function(e,ui){
			$(pollInsertExisting, rootel).hide();
			$("." + pollSelectedTabClass).removeClass(pollSelectedTabClass);
			$(pollCreateNewTab).addClass(pollSelectedTabClass);
			$(pollCreateNew, rootel).show();
		});
		$(pollInsertExistingTab, rootel).bind("click",function(e,ui){
			$(pollCreateNew, rootel).hide();
			$("." + pollSelectedTabClass).removeClass(pollSelectedTabClass);
			$(pollInsertExistingTab).addClass(pollSelectedTabClass);
			$(pollInsertExisting, rootel).show();
		});
	};
		
	/** 
	 * Get the element that needs to be inserted
	 * @param {String} id Id of the element
	 */
	var getInsertElement = function(id){
		for(var i = 0; i < jsonAll.polls.length; i++){
			if(id === jsonAll.polls[i].tuid){
				return jsonAll.polls[i];
			}
		}
		return false;
	};
	
	/**
	 * Add binding to the buttons and date picker
	 * Needs to happen after the render
	 */
	var addBinding = function(){
		
		// Bind the create placeholder button
		$(pollCreatePlaceholder, rootel).click(function(){
			createPlaceHolder();
		});
		
		// Bind the add new option button
		$(pollAddNewOption, rootel).click(function(){
			addNewOption();
		});
		
		// Bind the toggle advanced settings button
		$(pollToggleAdvancedSettings, rootel).click(function(){
			
			// Slide toggle lets you toggle the container and add some animation to it
			$(pollAdvancedSettings, rootel).slideToggle(400);
			
			// Check if the up or down arrow is visible
			if($(pollToggleAdvancedSettingsUp, rootel).is(":visible")){
				$(pollToggleAdvancedSettingsUp).hide();
				$(pollToggleAdvancedSettingsDown).show();
			}else{
				$(pollToggleAdvancedSettingsDown).hide();
				$(pollToggleAdvancedSettingsUp).show();
			}
		});
		
		// Hide or show advanced settings (executed on first load and
		// when you press back in the preview screen
		if(isAdvancedSettingsVisible){
			$(pollAdvancedSettings, rootel).show();
			$(pollToggleAdvancedSettingsDown).hide();
			$(pollToggleAdvancedSettingsUp).show();	
		}else{
			$(pollAdvancedSettings, rootel).hide();
			$(pollToggleAdvancedSettingsUp).hide();
			$(pollToggleAdvancedSettingsDown).show();
		}
		
		// Add binding to the option fields
		bindOptions();
		
		// Bind the poll types
		$(pollPolltype + " li a", rootel).bind("click",function(e,ui){
			
			// Get the id for the parentnode
			var id = e.target.parentNode.id;
			
			// Remove all the the active classes
			$("." + pollPolltypeActiveClass).removeClass(pollPolltypeActiveClass);
			
			// Save the polltype you clicked on to the json object
			savePollType(id);
			
			// Add the active class to the element you clicked on
			$("#"+id, rootel).addClass(pollPolltypeActiveClass);
		});
		
		// Bind datepickers
		var d = new Date();
		$(pollStartdate, rootel).datepicker({
			showOn: 'both',
			showAnim: 'slideDown',
			buttonImage: Config.URL.POLL_DROPDOWN_ICON_URL,
			buttonImageOnly: true,
			buttonText: "Please select a start date",
			dateFormat: 'dd/mm/yy',
			defaultDate: d,
			minDate: d
		});

		$(pollStopdate, rootel).datepicker({
			showOn: 'both',
			showAnim: 'slideDown',
			buttonImage: Config.URL.POLL_DROPDOWN_ICON_URL,
			buttonImageOnly: true,
			buttonText: "Please select a stop date",
			dateFormat: 'dd/mm/yy',
			// We set the default date for the stop date to a week later
			defaultDate: +7,
			minDate: d
		});
		
		// Make and bind the divs containing the hours and minutes
		makeBindDiv(pollStartHourClass, 24);
		makeBindDiv(pollStartMinClass, 60);
		makeBindDiv(pollStopHourClass, 24);
		makeBindDiv(pollStopMinClass, 60);
		
		// Bind the settings cancel button
		$(pollCancel, rootel).bind("click",function(e,ui){
			// Informs the sdata container that you pressed cancel and
			// this will close the pop up
			sdata.container.informCancel(tuid);
		});
		
		// Bind the settings cancel button on the existing tab
		$(pollCancelExisting, rootel).bind("click",function(e,ui){
			// Informs the sdata container that you pressed cancel and
			// this will close the pop up
			sdata.container.informCancel(tuid);
		});
		
		// Bind the preview button
		$(pollPreviewButton, rootel).bind("click",function(e,ui){
			
			// Check if the json object exists
			if(json){
				
				// Save the value that contains whether the advanced settings is shown or not
				// we need this for when we press the back button in the preview mode
				isAdvancedSettingsVisible = $(pollAdvancedSettings, rootel).is(':visible');
				
				// Save the current poll to the json object
				savePoll();
				
				// Hide the first screen (with the input fields) and show the preview mode
				showHidePreview(true);
				
				// Render the poll
				renderPoll(true);
				
				// Render the preview
				renderPreview();
				
				// Set the placeholder value to 0
				json.poll.placeholder = 0;
				
				// Add binding to the insert button (on the preview screen)
				$(pollPreviewInsert, rootel).bind("click",function(e,ui){
					
					// Save the posts to the database
					savePollToDatabase(finishNewSettings, true);
				});
				
			}
		});
		
		// Add binding to the insert button on the insert existing tab screen
		$(pollWidgetInsert, rootel).bind("click",function(e,ui){
			
			// Get the id of the element that is selected
			var id = $("." + pollInsertExistingSelectedClass, rootel)[0].id;
			
			// Check if there is an element selected
			if(id !== undefined){
				
				// Get first part of the id
				id = id.replace(pollInsertExistingItemClass, "");
				
				// Get the poll element from the id you just parsed
				var pollElement = getInsertElement(id);
				
				// Check if that element exists
				if(pollElement){
					
					// Reset some properties of that pollwow
					pollElement.votes =[];
					for(var i = 0; i<pollElement.options.length; i++){
						pollElement.votes.push(0);
					}
					pollElement.tuid = tuid;
					pollElement.polls = []; 
					pollElement.temp = {};
					pollElement.users = [];
					json.poll = pollElement;
					
					// Save that poll to the database
					savePollToDatabase(finishNewSettings, true);
				}else {
					alert("Could not recieve the id of the element");
				}
			}else{
				alert("Could not recieve the selected element.");
			}
		});
		
		
		if(jsonAll && jsonAll.polls.length > 0){
			
			// Bind the insert existing items
			$(pollInsertExistingItems + " a", rootel).bind("click",function(e,ui){
				
				// Remove all the selected classes from all the elements
				$(pollInsertExistingItems + " a", rootel).removeClass(pollInsertExistingSelectedClass);
				
				// Get the id of the element the user clicked on
				var id = e.target.id;
				
				// Add the selected class to that element
				$("#"+id, rootel).addClass(pollInsertExistingSelectedClass);
			});
			
			// The first time when this script is loaded, it automatically selects the first item in the existing list
			$(pollInsertExistingItem + jsonAll.polls[0].tuid, rootel).addClass(pollInsertExistingSelectedClass);
		}
		
		// Bind the preview back button
		$(pollPreviewBack, rootel).bind("click",function(e,ui){
			
			// Hide the preview screen and show the screen with all the input fields
			showHidePreview(false);
			
			// Render the settings screen
			renderSettings();
			
			// Add binding to the elements
			addBinding();			
			
			// Hide/show the appropriate divs and make sure the correct tab is selected
			$(pollInsertExisting, rootel).hide();
			$("." + pollSelectedTabClass).removeClass(pollSelectedTabClass);
			$(pollCreateNewTab).addClass(pollSelectedTabClass);
			$(pollCreateNew, rootel).show();
		});
		
		// Add binding to the tabs
		addTabBinding();
	};
	
	/**
	 * Render and bind the settings view of the widget
	 */
	var renderAndBindSettings = function(){
		
		// Render the settings of the poll
		renderSettings();
		
		// Add binding to the various elements
		addBinding();
	};
		
	/**
	 * Get the post including replies
	 */
	var getPostsFromJCR = function(){
		$.ajax({
			url: Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "poll"),
			cache: false,
			success: function(data){
				showPoll(data, true);
			},
			error: function(status){
				showPoll(status, false);
			}
		});
	};
	
	/**
	 * Insert some basic values into the json object
	 */
	var insertValues = function(){
		var d = new Date();
		json.poll.startdate = extractToTwo(d.getDate())+"/"+extractToTwo(d.getMonth()+1)+"/"+d.getFullYear();
		json.poll.starthour = extractToTwo(d.getHours());
		json.poll.startmin = extractToTwo(d.getMinutes());
		
		var dNextWeek = new Date();
		var day = dNextWeek.getDate() + 7;
		dNextWeek.setDate(day);
		
		json.poll.stopdate = extractToTwo(dNextWeek.getDate())+"/"+extractToTwo(dNextWeek.getMonth()+1)+"/"+dNextWeek.getFullYear();
		json.poll.stophour = extractToTwo(d.getHours());
		json.poll.stopmin = extractToTwo(d.getMinutes());
		
		getAllPoll(false, renderAndBindSettings);
	};
	
	/**
	 * Show the poll in the pop-up settings window
	 * @param {String} response Json response with all the posts
	 * @param {Boolean} exists Check if the poll exists
	 */
	var showPollSettings = function(response, exists){
		
		// Check if a poll exists
		if (exists) {
			
			// Parse the response to a json object
			json = $.evalJSON(response);
			
			// Render and bind the settings
			renderAndBindSettings();
			
			// Hide the insert existing container
			$(pollInsertExisting, rootel).hide();
		}
		else {
			// Initialize poll obj
			var jsonPoll = {
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
			};
			json = {};
			json.poll = jsonPoll;
			
			// Insert some basic values (dates, ...)
			insertValues();
		}
	};
	
	/**
	 * Switch between main and settings page
	 * @param {Boolean} showSettings Show the settings of the widget or not
	 */
	if (showSettings) {
		$(pollShow, rootel).hide();

		showHidePreview(false);
		
		$.ajax({
			url: Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "poll"),
			cache: false,
			success: function(data){
				showPollSettings(data, true);
			},
			error: function(status){
				showPollSettings(status, false);
			}
		});
		$(pollShowContainer, rootel).hide();
		$(pollContainer, rootel).show();
		$(pollMainContainer, rootel).show();
	}
	else {
		$(pollContainer, rootel).hide();
		$(pollShowContainer, rootel).show();
		getPostsFromJCR();
		$(pollMainContainer, rootel).show();
	}
};
sdata.widgets.WidgetLoader.informOnLoad("poll");