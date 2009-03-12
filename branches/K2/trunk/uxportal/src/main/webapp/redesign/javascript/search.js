var sakai = sakai || {};

sakai._search = {};
sakai.search = function(){
	
	/*
		Config variables
 	*/
	
	var peopleToSearch = 10;
	
	var meObj = false;
	var foundPeople = false;
	var hasHadFocus = false;

	var doInit = function(){
		
		sdata.Ajax.request({
			url: "/rest/me?sid=" + Math.random(),
			onSuccess: function(response){
			
				meObj = eval('(' + response + ')');
				if (meObj.preferences.uuid){
					inituser = meObj.profile.firstName + " " + meObj.profile.lastName;
					$("#userid").text(inituser);
					placeImage();
				} else {
					document.location = "/dev/index.html";
				}
				
			}
		});
		
	}
	
	var placeImage = function(){
		// Fix small arrow horizontal position
		$('.explore_nav_selected_arrow').css('right', $('.explore_nav_selected').width() / 2 + 10);
		
		// Round cornners for elements with '.rounded_corners' class
		$('.rounded_corners').corners("2px");
		
		// IE Fixes
		if (($.browser.msie) && ($.browser.version < 8)) {
			// Tab fix
			$('.fl-tabs li a').css('bottom','-1px');
			$('.fl-tabs .fl-activeTab a').css('bottom','-1px');
			
			//Search button fix
			$('.search_button').css('top','4px');
			
			// Small Arrow Fix
			$('.explore_nav_selected_arrow').css('bottom','-10px');
		}
	}
	
	var doSearch = function(){
		
		var searchterm = $("#search_text").val();
		
		if (searchterm) {
		
			// Set off the 3 AJAX requests
			
				// People Search
			
				var peoplesearchterm = "";
				var splitted = searchterm.split(" ");
				for (var i = 0; i < splitted.length; i++){
					peoplesearchterm += splitted[i] + "~" + " " + splitted[i] + "*" + " ";
				}
				
				sdata.Ajax.request({
					httpMethod: "GET",
					url: "/rest/search?p=0&path=/_private&n=" + peopleToSearch + "&q=" + peoplesearchterm + "&mimetype=text/plain&s=sakai:firstName&s=sakai:lastName&sid=" + Math.random(),
					onSuccess: function(data){
						foundPeople = eval('(' + data + ')');
						renderPeople();
					},
					onFail: function(status){
						foundPeople = {};
						renderPeople();
					}
				});
			
			// Set searching messages
			
			$("#mysearchterm").text(searchterm);
			$("#content_media_search_result").html("<b>To Do ...</b>");
			$("#people_search_result").html("<b>Searching ...</b>");
			$("#courses_sites_search_result").html("<b>To Do ...</b>");
			
			// Set everything visible
			
			$("#introduction_text").hide();
			$("#display_more_people").hide();
			$("#content_media_header").show();
			$("#people_header").show();
			$("#courses_sites_header").show();
			$("#search_result_title").show();
			$(".search_results_part_footer").show();
			
		} else {
			
			
			
		}
	
	}
	
	
	/*
		People search 
	*/
	
	var renderPeople = function(){
		
		var finaljson = {};
		finaljson.items = [];
		
		var currentTotal = parseInt($("#numberfound").text());
		currentTotal += foundPeople.size;
		$("#numberfound").text(currentTotal);
		
		if (foundPeople.size > peopleToSearch){
			$("#display_more_people").show();
			$("#display_more_people_number").text(foundPeople.size);
		}
		
		if (foundPeople && foundPeople.results) {
			for (var i = 0; i < foundPeople.results.length; i++) {
				var item = foundPeople.results[i];
				var person = eval('(' + item.content + ')');
				if (person) {
					var index = finaljson.items.length;
					finaljson.items[index] = {};
					finaljson.items[index].userid = item.path.split("/")[4];
					var sha = sha1Hash(finaljson.items[index].userid).toUpperCase();
					var path = sha.substring(0, 2) + "/" + sha.substring(2, 4);
					if (person.picture) {
						var picture = eval('(' + person.picture + ')');
						finaljson.items[index].picture = "/sdata/f/_private/" + path + "/" + finaljson.items[index].userid + "/" + picture.name;
					}
					if (person.firstName || person.lastName) {
						var str = person.firstName;
						str += " " + person.lastName;
						finaljson.items[index].name = str;
					}
					else {
						finaljson.items[index].name = finaljson.items[index].userid;
					}
					if (person.basic) {
						var basic = eval('(' + person.basic + ')');
						if (basic.unirole) {
							finaljson.items[index].extra = basic.unirole;
						}
						else if (basic.unicollege) {
							finaljson.items[index].extra = basic.unicollege;
						}
						else if (basic.unidepartment) {
							finaljson.items[index].extra = basic.unidepartment;
						}
					}
				}
			}
		}
		
		$("#people_search_result").html(sdata.html.Template.render("people_search_result_template", finaljson));
		
	}
	
	
	/*
		Event listeners 
	*/
	
	$("#search_text").bind("focus", function(ev){
		if (!hasHadFocus){
			$("#search_text").val("");
			$("#search_text").addClass("search_bar_selected");
		}
		hasHadFocus = true;
	});
	
	$("#search_text").bind("keypress", function(ev){
		if (ev.keyCode == 13){
			doSearch();
		}
	});
	
	$("#search_text_button").bind("click", function(ev){
		doSearch();
	});
	
	doInit();
	
}

sdata.registerForLoad("sakai.search");