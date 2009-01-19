var sakai = sakai || {};

sakai.poll = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	var siteid = placement.split("/")[0];
	var json = false;
	var polljson = false;

	var doInit = function(){
		if (showSettings) {
			$("#poll_settings", rootel).show();
		}
		else {
			$("#poll_output", rootel).show();
		}
		
		$(".poll_select_existing", rootel).bind("click", function(ev){
			$("#poll_details", rootel).hide();
			selectExistingPoll();
		});
		$(".poll_select_create_new", rootel).bind("click", function(ev){
			$("#poll_details", rootel).hide();
			createNewPoll();
		});
		
		$("#poll_create_new_button", rootel).bind("click", function(ev){
			doNewPoll();
		});
		
		
			$('.date-pick', rootel).datePicker();
		
		
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/poll" + "?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				checkExistence(data,true);
			},
			onFail : function(status) {
				checkExistence(status,false);
			}
		});
	}
	
	var extractToOne = function(string){
		try {
			if (string.substring(0,1) == "0"){
				return string.substring(1,2);
			} else {
				return string;
			}
		} catch (err){
			return 0;
		}
	}
	
	var extractToTwo = function(string){
		try {
			if (string < 10){
				return "0" + string;
			} else {
				return string;
			}
		} catch (err){
			return string;
		}
	}
	
	var doNewPoll = function(){
		var el = $("#poll_new_form", rootel);
		var size = 0;
		for (var i in polljson.processedOptions){
			polljson.processedOptions["option" + size].option = $("#poll_new_option_" + size,rootel).attr("value");
			size++;
		}
  		var json = sdata.FormBinder.serialize(el);
		if (json["pollText"] == "" || json["poll_new_opendate"] == "" || json["poll_new_closedate"] == ""){
			alert("Please fill out all of the fields");
		} else {
			try {
				
				//Parse dates
			
				var fromdate = json["poll_new_opendate"];
				var begindate = new Date();
				begindate.setYear(parseInt(fromdate.split("/")[2]));
				begindate.setMonth(parseInt(extractToOne(fromdate.split("/")[1])) - 1);
				begindate.setDate(parseInt(extractToOne(fromdate.split("/")[0])));
				begindate.setHours(parseInt(extractToOne(json["poll_new_openhour"][0])));
				begindate.setMinutes(parseInt(extractToOne(json["poll_new_openminute"][0])));
				begindate.setSeconds(0);
				var iFromDate = begindate.getTime();
				if (isNaN(begindate.getTime())) {
					throw "No valid date";
				}
				
				var closedate = json["poll_new_closedate"];
				var enddate = new Date();
				enddate.setYear(parseInt(extractToOne(closedate.split("/")[2])));
				enddate.setMonth(parseInt(extractToOne(closedate.split("/")[1])) - 1);
				enddate.setDate(parseInt(extractToOne(closedate.split("/")[0])));
				enddate.setHours(parseInt(extractToOne(json["poll_new_closehour"][0])));
				enddate.setMinutes(parseInt(extractToOne(json["poll_new_closeminute"][0])));
				enddate.setSeconds(0);
				var iCloseDate = enddate.getTime();
				if (isNaN(enddate.getTime())) {
					throw "No valid date";
				}
			
				//Determine options
				
				var totaloptions = 0;
				var toprocess = [];
				for (var i in polljson.processedOptions){
					if (polljson.processedOptions[i].isActive){
						totaloptions ++;
						var index = toprocess.length;
						toprocess[index] = {};
						toprocess[index] = polljson.processedOptions[i];
					}
				}
			
				//Send initial data
				
				var tosend = {"maxOptions":1, "minOption":1, "description": json["description"],
					"pollText": json["pollText"], "siteId": siteid, "voteClose": iCloseDate, 
					"voteOpen": iFromDate};
				
				sdata.Ajax.request({
					url :"/direct/poll/new",
					httpMethod : "POST",
					onSuccess : function(data) {
						
						var id = parseInt(data);
						
						var url = "/direct/batch?_refs=";
						var params = {};
						params.pollId = id;
						
						for (var ii = 0; ii < totaloptions; ii++){
							url += "/direct/poll-option/new,"
							params["ref" + ii + ".optionText"] = toprocess[ii].option;
						}
							
						sdata.Ajax.request({
							url : url,
							httpMethod : "POST",
							onSuccess : function(data) {
								selectExisting(id);
							},
							onFail : function(status) {
								selectExisting(id);
							},
							postData : params,
							contentType : "application/x-www-form-urlencoded"
						});

					},
					onFail : function(status) {
						alert("An error has occured");
					},
					postData : tosend,
					contentType : "application/x-www-form-urlencoded"
				});
				
				
			} catch(err){
				alert("Please make sure the dates have got a valid format (dd/MM/yyyy)");
			}
		}
	}
	
	var createNewPoll = function(){
		$("#poll_initial_settings", rootel).hide();
		$("#poll_create_new", rootel).show();
		polljson = {};
		polljson.processedOptions = {};
		$("#poll_new_options_list", rootel).html(sdata.html.Template.render("poll_new_options_list_template", polljson));
		$("#poll_new_add_option", rootel).bind("click", function(ev){
			var size = 0;
			for (var i in polljson.processedOptions){
				polljson.processedOptions["option" + size].option = $("#poll_new_option_" + size,rootel).attr("value");
				size++;
			}
			polljson.processedOptions["option" + size] = {};
			polljson.processedOptions["option" + size].option = "";
			polljson.processedOptions["option" + size].id = size;
			polljson.processedOptions["option" + size].isActive = true;
			$("#poll_new_options_list",rootel).html(sdata.html.Template.render("poll_new_options_list_template",polljson));
			renderNewPollOptions();
		})	
		renderNewPollOptions();
	}	
	
	var renderNewPollOptions = function(){
		$(".poll_new_delete_option", rootel).bind("click", function(ev){
			var size = 0;
			for (var i in polljson.processedOptions){
				polljson.processedOptions["option" + size].option = $("#poll_new_option_" + size,rootel).attr("value");
				size++;
			}
			var selected = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			polljson.processedOptions["option" + selected].isActive = false;
			$("#poll_new_options_list",rootel).html(sdata.html.Template.render("poll_new_options_list_template",polljson));
			renderNewPollOptions();
		});
	}
	
	var checkExistence= function(response, exists){
		if (exists){
			json = eval('(' + response + ')');
		} else {
			$("#poll_initial_settings", rootel).show();
		}
		
		if (showSettings){
			if (json){
				loadPollSettings();
			} else {
				
			}
		} else {
			showPoll();
		}
	}
	
	var showPoll = function(){
		sdata.Ajax.request({
			url :"/direct/poll/" + json.id + ".json?includeOptions=true&includeVotes=true" + "&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				polljson = eval('(' + data + ')')
				printPoll();
			},
			onFail : function(status) {
				$("#poll_output_no_available", rootel).show();
			}
		});
	}
	
	var printPoll = function(){
		var isTooSoon = false;
		var isTooLate = false;
		
		var now = new Date().getTime();
		
		//2008-09-08 10:02:58.0
		var start = polljson.voteOpen;
		var end = polljson.voteClose;
		
		var startdate = new Date();
		startdate.setTime(polljson.voteOpen);
		var iOpenDate = startdate.getTime();
		
		var enddate = new Date();
		enddate.setTime(polljson.voteClose);
		var iCloseDate = enddate.getTime();
		
		isTooSoon = now < iOpenDate;
		isTooLate = now > iCloseDate;
		
		if (polljson.currentUserVoted || isTooLate){
			polljson.processedOptions = {};
			$("#poll_results",rootel).show();
			
			var totalvotes = 0;
			totalvotes = polljson.votes.length;
		
			for (var i = 0; i < polljson.pollOptions.length; i++) {
				var option = polljson.pollOptions[i];
				polljson.processedOptions["option" + i] = {};
				polljson.processedOptions["option" + i].option = ("" + option.text);
				polljson.processedOptions["option" + i].id = option.id;
					
				var chosen = 0;
				var chosen = 0;
				
				for (var ii = 0; ii < polljson.votes.length; ii++) {
					var vote = polljson.votes[ii];
					if (vote.pollOption == option.id) {
						chosen++;
					}
				}
					
				polljson.processedOptions["option" + i].noVotes = chosen;
				if (totalvotes == 0) {
					polljson.processedOptions["option" + i].percentages = "0 %";
					polljson.processedOptions["option" + i].percentage = 0;
				}
				else {
					polljson.processedOptions["option" + i].percentages = Math.round(chosen / totalvotes * 100) + " %";
					polljson.processedOptions["option" + i].percentage = Math.round(chosen / totalvotes * 100);
				}
			}
			
			polljson.chart = "http://chart.apis.google.com/chart?cht=p3&chd=t:";
			for (var i in polljson.processedOptions){
				polljson.chart += polljson.processedOptions[i].percentage + ",";
			}
			polljson.chart = polljson.chart.substring(0,polljson.chart.length - 1);
			polljson.chart += "&chs=350x150&chl=";
			for (var i in polljson.processedOptions){
				polljson.chart += ("" + polljson.processedOptions[i].option).replace(/<br\/>/g,"") + "|";
			}
			polljson.chart = polljson.chart.substring(0,polljson.chart.length - 1);
			$("#poll_results", rootel).html(sdata.html.Template.render('poll_results_template',polljson));
			
		}
			else if (isTooSoon){
				$("#poll_take", rootel).show();
				$("#poll_take", rootel).text("This poll hasn't started yet");
			
		} else {
			polljson.processedOptions = {};
			$("#poll_take",rootel).show();
			for (var i = 0; i < polljson.pollOptions.length; i++){
				var option = polljson.pollOptions[i];
				polljson.processedOptions["option" + i] = {};
				polljson.processedOptions["option" + i].option = ("" + option.text).replace(/<br\/>/g,"");
				polljson.processedOptions["option" + i].id = option.id;
				polljson.tuid = tuid;
			}
			polljson.description = polljson.description.replace(/<br\/>/,"");
			$("#poll_take", rootel).html(sdata.html.Template.render('poll_take_template',polljson));
			$("#poll_vote_button", rootel).bind("click", function(ev){
				var el = $("#poll_answer_form", rootel);
  				var json = sdata.FormBinder.serialize(el);
				var resp = json["answering_" + tuid];

				var params = {pollId: polljson.pollId, pollOption: resp};
				sdata.Ajax.request({
					url : "/direct/poll-vote/new",
					httpMethod : "POST",
					onSuccess : function(data) {
						$("#poll_take", rootel).hide();
						showPoll();
					},
					onFail : function(status) {
						alert("An error has occured, please try again later");
					},
					postData : params,
					contentType : "application/x-www-form-urlencoded"
				});
				
			});
		}
	}
	
	var loadPollSettings = function(){
		sdata.Ajax.request({
			url :"/direct/poll/" + json.id + ".json?includeOptions=true" + "&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				polljson = eval('(' + data + ')')
				showPollSettings();
			},
			onFail : function(status) {
				$("#poll_not_exists", rootel).show();
			}
		});
	}
	
	var showPollSettings = function(){
		$("#poll_details", rootel).show();
		$("#poll_existing_screen", rootel).hide();
		
		polljson.processedOptions = {};
		
		for (var i = 0; i < polljson.pollOptions.length; i++) {
			var option = polljson.pollOptions[i];
			polljson.processedOptions["option" + option.id] = {};
			polljson.processedOptions["option" + option.id].option = option.text;
			polljson.processedOptions["option" + option.id].id = option.id;	
			polljson.processedOptions["option" + option.id].existing = true;
			polljson.processedOptions["option" + option.id].isActive = true;
		}
		
		$("#poll_current_question", rootel).attr("value",polljson.pollText);
		$("#poll_current_description", rootel).attr("value",polljson.description);
		
		var openVote = new Date();
		openVote.setTime(polljson.voteOpen);
		var year = openVote.getFullYear();
		var month = extractToTwo(openVote.getMonth() + 1);
		var day = extractToTwo(openVote.getDate());
		var hour = extractToTwo(openVote.getHours());
		var minute = extractToTwo(openVote.getMinutes());
		
		$("#poll_current_opendate", rootel).attr("value", day + "/" + month + "/" + year);
		$("#poll_current_openhour", rootel).attr("value", hour);
		$("#poll_current_openminute", rootel).attr("value", minute);
		
		var closeVote = new Date();
		closeVote.setTime(polljson.voteClose);
		year = closeVote.getFullYear();
		month = extractToTwo(closeVote.getMonth() + 1);
		day = extractToTwo(closeVote.getDate());
		hour = extractToTwo(closeVote.getHours());
		minute = extractToTwo(closeVote.getMinutes());
		
		$("#poll_current_closedate", rootel).attr("value", day + "/" + month + "/" + year);
		$("#poll_current_closehour", rootel).attr("value", hour);
		$("#poll_current_closeminute", rootel).attr("value", minute);
		
		$("#poll_selected_options_list",rootel).html(sdata.html.Template.render("poll_selected_options_list_template",polljson));
	
		$("#poll_current_add_option", rootel).bind("click", function(ev){
			var size = 0;
			for (var i in polljson.processedOptions){
				if (polljson.processedOptions[i].existing){
					polljson.processedOptions[i].option = $("#poll_current_existing_option_" + polljson.processedOptions[i].id,rootel).attr("value");
				} else {
					polljson.processedOptions[i].option = $("#poll_current_new_option_" + polljson.processedOptions[i].id,rootel).attr("value");
				}
				size++;
			}
			polljson.processedOptions["newoption" + size] = {};
			polljson.processedOptions["newoption" + size].option = "";
			polljson.processedOptions["newoption" + size].id = size;
			polljson.processedOptions["newoption" + size].isActive = true;
			polljson.processedOptions["newoption" + size].existing = false;
			$("#poll_selected_options_list",rootel).html(sdata.html.Template.render("poll_selected_options_list_template",polljson));
			renderCurrentPollOptions();
		})	
		
		$("#poll_save_changes_button", rootel).bind("click", function(ev){
			doUpdatePoll();
		});
		
		renderCurrentPollOptions();
			
		//alert(sdata.JSON.stringify(polljson));
	}
	
	var doUpdatePoll = function(){
		var el = $("#poll_current_form", rootel);
		for (var i in polljson.processedOptions){
			if (polljson.processedOptions[i].existing){
					polljson.processedOptions[i].option = $("#poll_current_existing_option_" + polljson.processedOptions[i].id,rootel).attr("value");
			} else {
				polljson.processedOptions[i].option = $("#poll_current_new_option_" + polljson.processedOptions[i].id,rootel).attr("value");
			}
		}
  		var json = sdata.FormBinder.serialize(el);
		if (json["pollText"] == "" || json["poll_current_opendate"] == "" || json["poll_current_closedate"] == ""){
			alert("Please fill out all of the fields");
		} else {
			try {
				
				//Parse dates
			
				var fromdate = json["poll_current_opendate"];
				var begindate = new Date();
				begindate.setYear(parseInt(fromdate.split("/")[2]));
				begindate.setMonth(parseInt(extractToOne(fromdate.split("/")[1])) - 1);
				begindate.setDate(parseInt(extractToOne(fromdate.split("/")[0])));
				begindate.setHours(parseInt(extractToOne(json["poll_current_openhour"][0])));
				begindate.setMinutes(parseInt(extractToOne(json["poll_current_openminute"][0])));
				begindate.setSeconds(0);
				var iFromDate = begindate.getTime();
				if (isNaN(begindate.getTime())) {
					throw "No valid date";
				}
				
				var closedate = json["poll_current_closedate"];
				var enddate = new Date();
				enddate.setYear(parseInt(extractToOne(closedate.split("/")[2])));
				enddate.setMonth(parseInt(extractToOne(closedate.split("/")[1])) - 1);
				enddate.setDate(parseInt(extractToOne(closedate.split("/")[0])));
				enddate.setHours(parseInt(extractToOne(json["poll_current_closehour"][0])));
				enddate.setMinutes(parseInt(extractToOne(json["poll_current_closeminute"][0])));
				enddate.setSeconds(0);
				var iCloseDate = enddate.getTime();
				if (isNaN(enddate.getTime())) {
					throw "No valid date";
				}
			
				//Determine options
				
				var totaloptions = 0;
				var toprocess = [];
				for (var i in polljson.processedOptions){
					if (polljson.processedOptions[i].isActive){
						totaloptions ++;
						var index = toprocess.length;
						toprocess[index] = {};
						toprocess[index] = polljson.processedOptions[i];
					}
				}
			
				//Send initial data
				
				var tosend = {"description": json["description"],
					"pollText": json["pollText"], "siteId": siteid, "voteClose": iCloseDate, 
					"voteOpen": iFromDate};
				
				sdata.Ajax.request({
					url :"/direct/poll/" + polljson.pollId + "/edit",
					httpMethod : "POST",
					onSuccess : function(data) {
						
						// Do delete of existing ones
						
						var todelete = [];
						for (var i in polljson.processedOptions){
							if (polljson.processedOptions[i].existing && polljson.processedOptions[i].isActive == false){
								todelete[todelete.length] = polljson.processedOptions[i];
							}
						}
						
						var toupdate = [];
						for (var i in polljson.processedOptions){
							if (polljson.processedOptions[i].existing && polljson.processedOptions[i].isActive == true){
								toupdate[toupdate.length] = polljson.processedOptions[i];
							}
						}
						
						var newtodo = [];
						for (var i in polljson.processedOptions){
							if (polljson.processedOptions[i].existing == false && polljson.processedOptions[i].isActive == true){
								newtodo[newtodo.length] = polljson.processedOptions[i];
							}
						}

						updateDeleteExisting(todelete,toupdate,newtodo);

					},
					onFail : function(status) {
						alert("An error has occured");
					},
					postData : tosend,
					contentType : "application/x-www-form-urlencoded"
				});
				
				
			} catch(err){
				alert(err);
				alert("Please make sure the dates have got a valid format (dd/MM/yyyy)");
			}
		}
	}
	
	var updateDeleteExisting = function(todelete, toupdate, newtodo){
		var url = "/direct/batch?_refs=";
		for (var ii = 0; ii < todelete.length; ii++) {
			url += "/direct/poll-option/" + todelete[ii].id + "/delete" + ",";
		}
		sdata.Ajax.request({
			url :url,
			httpMethod : "DELETE",
			onSuccess : function(data) {
				updateUpdateExisting(toupdate, newtodo);
			},
			onFail : function(status) {
				updateUpdateExisting(toupdate, newtodo);
			}
		});
	}
	
	var updateUpdateExisting = function(toupdate, newtodo){
		var url = "/direct/batch?_refs=";
		var params = {};
		for (var ii = 0; ii < toupdate.length; ii++) {
			var option = toupdate[ii];
			url += "/direct/poll-option/" + option.id + "/edit" + ",";
			params["ref" + ii + ".optionText"] = option.option;
		}
		sdata.Ajax.request({
			url :url,
			httpMethod : "POST",
			onSuccess : function(data) {
				updateNew(newtodo);
			},
			onFail : function(status) {
				updateNew(newtodo);
			},
			postData : params,
			contentType : "application/x-www-form-urlencoded"
		})
	}
	
	var updateNew = function(newtodo){
		var params = {};
		params["pollId"] = polljson.pollId;
		var url = "/direct/batch?_refs=";
		for (var ii = 0; ii < newtodo.length; ii++) {
			url += "/direct/poll-option/new" + ",";
			params["ref" + ii + ".optionText"] = newtodo[ii].option;
		}
		sdata.Ajax.request({
			url :url,
			httpMethod : "POST",
			onSuccess : function(data) {
				selectExisting(polljson.pollId);
			},
			onFail : function(status) {
				selectExisting(polljson.pollId);
			},
			postData : params,
			contentType : "application/x-www-form-urlencoded"
		})
	}
	
	var renderCurrentPollOptions = function(){
		$(".poll_current_delete_option", rootel).bind("click", function(ev){
			var size = 0;
			for (var i in polljson.processedOptions){
				if (polljson.processedOptions[i].existing){
					polljson.processedOptions[i].option = $("#poll_current_existing_option_" + polljson.processedOptions[i].id,rootel).attr("value");
				} else {
					polljson.processedOptions[i].option = $("#poll_current_new_option_" + polljson.processedOptions[i].id,rootel).attr("value");
				}
				size++;
			}
			var selected = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			if (ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 2] == "existing"){
				polljson.processedOptions["option" + selected].isActive = false;
			} else {
				polljson.processedOptions["newoption" + selected].isActive = false;
			}
			$("#poll_selected_options_list",rootel).html(sdata.html.Template.render("poll_selected_options_list_template",polljson));
			renderCurrentPollOptions();
		});
	}
	
	var selectExistingPoll = function(){
		$("#poll_initial_settings",rootel).hide();
		$("#poll_existing_screen",rootel).show();
		sdata.Ajax.request({
			url :"/direct/poll.json?siteId=" + siteid + "&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				renderPolls(data,true);
			},
			onFail : function(status) {
				renderPolls(status,false);
			}
		});
	}
	
	var renderPolls = function(response, exists){
		if (exists){
			var tussenjson = eval('(' + response + ')');
			$("#poll_existing_list",rootel).html(sdata.html.Template.render("poll_existing_list_template",tussenjson));
			$(".poll_existing_poll",rootel).bind("click", function(ev){
				var id = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
				selectExisting(id);
			});
		} else {
			$("#poll_existing_list", rootel).text("No polls available");
		}
	}
	
	var selectExisting = function(id){
		$("#poll_create_new", rootel).hide();
		json = {"id": id};
		var val = sdata.JSON.stringify(json);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "poll", val, finishSelectExisting);
	}
	
	var finishSelectExisting = function(success){
		if (success){
			//loadPollSettings();
			$("#poll_output",rootel).show();
			$("#poll_settings",rootel).hide();
			showPoll();
		} else {
			alert("An error has occured");
		}
	}
	
	doInit();

};

sdata.widgets.WidgetLoader.informOnLoad("poll");