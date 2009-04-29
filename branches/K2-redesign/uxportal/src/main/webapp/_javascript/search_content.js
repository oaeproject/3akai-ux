var sakai = sakai ||
{};

sakai._search = {};
sakai.search = function() {

	/*
	 Config variables
	 */
	var contentToSearch = 10;
	
	var meObj = false;
	var foundcontent = false;
	var hasHadFocus = false;
	var searchterm = "";
	var currentpage = 0;
	
	sakai._search.reset = function() {
		$("#search_result_title").hide();
		$(".search_results_part_footer").hide();
		$("#introduction_text").show();
		$("#display_more_content").show();
	}
	
	var doInit = function() {
	
		sdata.Ajax.request({
			url: "/rest/me?sid=" + Math.random(),
			onSuccess: function(response) {
			
				meObj = eval('(' + response + ')');
				if (meObj.preferences.uuid) {
					inituser = meObj.profile.firstName + " " + meObj.profile.lastName;
					$("#userid").text(inituser);
					placeImage();
					getMySites();
				}
				else {
					document.location = "/dev/redesign/index.html";
				}
				
			}
		});
		
	};
	
	var getMySites = function() {
		sdata.Ajax.request({
			url: "/rest/sites?sid=" + Math.random(),
			onSuccess: function(response) {
				var data = json_parse(response);
				var finaljson = {}
				finaljson.items = [];
				if (data.entry) {
					finaljson.items = data.entry;
				}
				$("#search_filter_my_sites").html(sdata.html.Template.render("search_filter_my_sites_template", finaljson));
				History.history_change();
				
			}
		});
	};
	
	var placeImage = function() {
		// Fix small arrow horizontal position
		$('.explore_nav_selected_arrow').css('right', $('.explore_nav_selected').width() / 2 + 10);
		
		// Round cornners for elements with '.rounded_corners' class
		$('.rounded_corners').corners("2px");
		
		// IE Fixes
		if (($.browser.msie) && ($.browser.version < 8)) {
			// Tab fix
			$('.fl-tabs li a').css('bottom', '-1px');
			$('.fl-tabs .fl-activeTab a').css('bottom', '-1px');
			
			//Search button fix
			$('.search_button').css('top', '4px');
			
			// Small Arrow Fix
			$('.explore_nav_selected_arrow').css('bottom', '-10px');
		}
	}
	
	sakai._search.doHSearch = function(page, searchquery) {
		if (!page) {
			page = 1;
		}
		if (!searchquery) {
			searchquery = $("#search_text").val().toLowerCase();
		}
		currentpage = page;
		History.addBEvent("" + page + "|" + searchquery);
	}
	
	sakai._search.doSearch = function(page, searchquery) {
	
		currentpage = parseInt(page);
		
		if (searchquery) {
			$("#search_text").val(searchquery);
			$("#search_text").addClass("search_bar_selected");
		}
		
		searchterm = $("#search_text").val().toLowerCase();
		
		if (searchterm) {
			// Set searching messages
			
			$("#mysearchterm").text(searchterm);
			$("#numberfound").text("0");
			
			// Set everything visible
			
			$("#introduction_text").hide();
			$("#display_more_content").hide();
			$("#content_media_header").show();
			$("#content_header").show();
			$("#courses_content_header").show();
			$("#search_result_title").show();
			$(".search_results_part_footer").show();
			
			// Set off the AJAX request
			
			// content Search
			var searchFilter = $('#search_filter option:selected"').val();
			var searchWhere = '*';
			if (searchFilter === 'entire_community') {
				searchWhere = '*';
			}
			else if (searchFilter === 'all_my_sites') {
				searchWhere = 'mysites';
			}
			else {
				//	Specific site add the location.
				searchWhere = searchFilter;
			}
			
			var contentsearchterm = "";
			var splitted = searchterm.split(" ");
			for (var i = 0; i < splitted.length; i++) {
				contentsearchterm += splitted[i] + "~" + " " + splitted[i] + "*" + " ";
			}
			
			sdata.Ajax.request({
				httpMethod: "GET",
				url: "/dev/redesign/dummyjson/searchContent.json?p=" + (currentpage - 1) + "&path=/_private&n=" + contentToSearch + "&q=" + contentsearchterm + "&sites=" + searchWhere + "&mimetype=text/plain&s=sakai:firstName&s=sakai:lastName&sid=" + Math.random(),
				onSuccess: function(data) {
					foundcontent = eval('(' + data + ')');
					rendercontent();
				},
				onFail: function(status) {
					foundcontent = {};
					rendercontent();
				}
			});
			
		}
		else {
		
			sakai._search.reset();
			
		}
		
	}
	
	
	/*
	 content search
	 */
	// Pager click handler
	var pager_click_handler = function(pageclickednumber) {
		currentpage = pageclickednumber;
		sakai._search.doHSearch(currentpage, searchterm);
	}
	
	var _currentTotal = 0;
	
	var rendercontent = function() {
	
		var finaljson = {};
		finaljson.items = [];
		
		$("#numberfound").text(foundcontent.size);
		_currentTotal = foundcontent.size;
		
		// Pager Init
		
		$(".jq_pager").pager({
			pagenumber: currentpage,
			pagecount: Math.ceil(_currentTotal / contentToSearch),
			buttonClickCallback: pager_click_handler
		});
		
		if (foundcontent.size > contentToSearch) {
			$("#display_more_content").show();
			$("#display_more_content_number").text(foundcontent.size);
			$("#display_more_content").attr("href", "search_b_content.html#1|" + searchterm);
		}
		
		if (foundcontent && foundcontent.results) {
			finaljson.items = foundcontent.results;
		}
		$("#content_search_results").html(sdata.html.Template.render("content_search_results_remplate", finaljson));
		
		if (finaljson.items.length == 0) {
			$(".jq_pager").hide();
		}
		else {
			$(".jq_pager").show();
		}
		
	}
	
	/*
	 Event listeners
	 */
    $("#tab_search_all, #tab_search_content, #tab_search_people, #tab_search_sites").bind("click", function(ev){
        if (searchterm) {
            $(this).attr("href", $(this).attr("href").split('#')[0] + "#1|" + searchterm);
        }
        return true;
    });
	
	$("#search_text").bind("focus", function(ev) {
		if (!hasHadFocus) {
			$("#search_text").val("");
			$("#search_text").addClass("search_bar_selected");
		}
		hasHadFocus = true;
	});
	
	$("#search_text").bind("keypress", function(ev) {
		if (ev.keyCode == 13) {
			sakai._search.doHSearch();
		}
	});
	
	$("#search_button").bind("click", function(ev) {
		sakai._search.doHSearch();
	});
	
	doInit();
	
}

sdata.registerForLoad("sakai.search");
