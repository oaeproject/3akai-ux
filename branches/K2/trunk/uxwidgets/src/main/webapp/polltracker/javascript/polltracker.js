var sakai = sakai || {};

sakai.polltracker = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	var siteid = placement.split("/")[0];
	var json = false;
	var polljson = false;
	var mcp = false;
	
	var doInit = function(){
		if (showSettings) {
			$("#poll_settings", rootel).show();
			selectExistingPoll();
		}
		else {
			
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
			
			$("#poll_output", rootel).show();
		}
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
		
			polljson.processedOptions = {};
			$("#poll_results",rootel).show();
			
			var totalvotes = 0;
			if (polljson.votes){
				totalvotes = polljson.votes.length;
			}
			
			for (var i = 0; i < polljson.pollOptions.length; i++) {
				var option = polljson.pollOptions[i];
				polljson.processedOptions["option" + i] = {};
				polljson.processedOptions["option" + i].option = ("" + option.text);
				polljson.processedOptions["option" + i].id = option.id;
					
				var chosen = 0;
				try {
					for (var ii = 0; ii < polljson.votes.length; ii++) {
						var vote = polljson.votes[ii];
						if (vote.pollOption == option.optionId) {
							chosen++;
						}
					}
				} catch (err){}
				
				
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
	
	var loadPollSettings = function(){
		sdata.Ajax.request({
			url :"/direct/poll/" + json.pollId + ".json?includeOptions=true" + "&sid=" + Math.random(),
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
	
	var selectExistingPoll = function(){
		$("#poll_initial_settings",rootel).hide();
		$("#poll_existing_screen",rootel).show();
		sdata.Ajax.request({
			url :"/sdata/mcp?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				mcp = eval('(' + data + ')');
				sdata.Ajax.request({
					url :"/direct/poll.json?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						renderPolls(data,true);
					},
					onFail : function(status) {
						renderPolls(status,false);
					}
				});
			},
			onFail : function(status) {
				alert("An error has occured");
			}
		});
	}
	
	var renderPolls = function(response, exists){
		if (exists){
			var tussenjson = eval('(' + response + ')');
			
			var finaljson = {};
			finaljson.sites = {};
			
			for (var i = 0; i < tussenjson.poll_collection.length; i++){
				
				var siteid = tussenjson.poll_collection[i].siteId;
				var index = false;
				for (var ii in finaljson.sites){
					if (ii == siteid){
						index = true;
						finaljson.sites[ii].polls[finaljson.sites[ii].polls.length] = tussenjson.poll_collection[i];
					}
				}
				
				if (index == false){
					finaljson.sites[siteid] = {};
					finaljson.sites[siteid].sitename = siteid;
					for (var iii = 0; iii < mcp.items.length; iii++){
						if (mcp.items[iii].id == siteid){
							finaljson.sites[siteid].sitename = mcp.items[iii].title;
						}
					}
					finaljson.sites[siteid].polls = [];
					finaljson.sites[siteid].polls[finaljson.sites[siteid].polls.length] = tussenjson.poll_collection[i];
				}
				
			}
			
			$("#poll_existing_list",rootel).html(sdata.html.Template.render("poll_existing_list_template",finaljson));
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

sdata.widgets.WidgetLoader.informOnLoad("polltracker");