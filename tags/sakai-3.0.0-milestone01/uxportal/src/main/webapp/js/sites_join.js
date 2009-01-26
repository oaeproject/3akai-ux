var sakai = sakai || {};
sakai.sites_join = function(){

	var currentPage = 1;
	var pageSize = 5;
	var currentSearch = "";
	var searchReturn;
	var courseSiteCount = 0;
	var nonCourseSiteCount = 0;
	var activeSiteCount = 0;
	var inactiveSiteCount = 0; 
	
	sdata.widgets.WidgetLoader.insertWidgets("createsitecontainer");
		
	var getSiteJsonUrl = function(){
		var siteJsonUrl;
		if (window.location.protocol == "file:") {
			siteJsonUrl = "js/demo_joinable_sites.json";
		}
		else {
			siteJsonUrl = "/direct/site.json?selectionType=joinable&criteria=";
		}
		getSiteJsonUrl = function(){
			return siteJsonUrl + currentSearch + "&sid=" + Math.random();
		};
		return siteJsonUrl;
	};
	
	
	var showCreatNewSite = function(){		
		$("#createsitecontainer").show();
		sakai.createsite.initialise();		
		return false;
	};
	
	var showSearchResults = function(){
		var searchResults = {};
		
		var total = searchReturn.site_collection.length;
		
		searchResults['query'] = currentSearch;
		searchResults['currentPage'] = currentPage;
		searchResults['pageSize'] = pageSize;
		searchResults['total'] = total;
		searchResults['pages'] = {};
		searchResults['items'] = {};
		
		var addpage = 0;
		if (total % pageSize) {
			addpage = 1;
		}
		//paging tool bar setup
		for (var i = 1; i <= parseInt(total / pageSize) + addpage; i++) {
			searchResults['pages'][i] = i;
		}
		//paged results
		var start = eval(currentPage * pageSize - pageSize);
		var end = eval(start + pageSize - 1);
		
		if (end > total && end > pageSize) 
			end = eval(total - pageSize + start - 1);
		if (total < pageSize) 
			end = total - 1;
		if (end >= total) 
			end = total - 1;
		
		
		for (var i = start; i <= end; i++) {
			searchResults['items'][i] = searchReturn.site_collection[i];
		}
		
		try {
			var html = sdata.html.Template.render("search-result", searchResults);
		} 
		catch (e) {
		}
		$("#search-replaceable1").html(html);
		$("#search-replaceable").css("display", "none");
		$("#search-replaceable1").show();
		$("#clearSearch").bind("click", clearSearch);
		$('.type-search').bind("click", findSitesByType);
		$('.status-search').bind("click", findSitesByStatus);		
		$(".stjr-paging a").bind("click", changePage)
		
		$("#course-site-count").html("("+courseSiteCount+")");
		$("#noncourse-site-count").html("("+nonCourseSiteCount+")");
		$("#active-site-count").html("("+activeSiteCount+")");
		$("#inactive-site-count").html("("+inactiveSiteCount+")");
		
		
		
	};
	
	var changePage = function(event){
		var linkText = $(this).text();
		// Evil hack... very evil needs a better way
		if (linkText == 'Next') {
			currentPage++;
		}
		else {
			currentPage = linkText;
		}
		showSearchResults();
		return false; //Stop the link going
	};
	
	var findSites = function(event){
		var searchText = $('#site-search-input').val();
		if (searchText == undefined || searchText == "What are you looking for?") {
			$(".msg-text").text("Please enter a search criteria");
			$(".msg-error").show();
		}
		else if (searchText == "") {
			clearSearch();
			updateRecentSearches();
		} else {
			
			var data = {"query" : searchText};
			sdata.Ajax.request({
				url: "/sdata/searchcloud",
				httpMethod: "POST",
				onSuccess: function(data){
					// Continue
				},
				onFail: function(status){
					// Ignore
				},
				postData: data,
				contentType: "application/x-www-form-urlencoded"
			});
			
			if (!searchText) {
				searchText = "";
			}
			currentSearch = searchText;				
			updateRecentSearches(searchText);
			doSearch();
		}
	};
	
	var findSitesByAlpha = function(event){
		var searchText = $(this).html();
		if (!searchText) {
			searchText = "";
		}
		
		courseSiteCount = 0;
		nonCourseSiteCount = 0;
		activeSiteCount = 0;
		inactiveSiteCount = 0; 
	
		currentSearch = searchText;
		updateRecentSearches(searchText);
		removeErrorMessages();
		var filteredSites = new Array();
		$.ajax({
			type: "GET",
			url: getSiteJsonUrl(),
			dataType: "json",
			cache: false,
			success: function(data){
				var pos = 0;
				$.each(data.site_collection, function(i, item){
					//iterate through the feed find feed titles that dont begin with "alpha" remove from feed
					if (item.entityTitle.substring(0, 1).toUpperCase() != currentSearch) {
						filteredSites.push(i);
						pos++;
					}
					if (item.type == "course") {
						courseSiteCount++;													
					}
					if (item.published) {
						activeSiteCount++;																			
					}
				});
				
				nonCourseSiteCount = data.site_collection.length - courseSiteCount;
				inactiveSiteCount  = data.site_collection.length  - activeSiteCount;
			
				console.log(filteredSites.toSource());
				$.each(filteredSites, function(i, item){
					data.site_collection.splice(item, 1);
				});
				
				searchReturn = data;
				showSearchResults();
			},
			error: function(data){
			}
		});
		
		return false;
		
	};
	
	var findSitesByType = function(event){
		
		var siteType = $(this).attr("id");
		if (!siteType) {
			siteType = "";
		}	
				
		courseSiteCount = 0;
		nonCourseSiteCount = 0;
		activeSiteCount = 0;
		inactiveSiteCount = 0; 
		
		updateRecentSearches(siteType);
		removeErrorMessages();		
		var filteredSites = new Array();
		$.ajax({
			type: "GET",
			url: getSiteJsonUrl(),
			dataType: "json",
			cache: false,
			success: function(data){
				var pos = 0;
				$.each(data.site_collection, function(i, item){				
					if (siteType == "Course Sites") {					
						if (item.type != "course") {
							if(console)console.log("filter for course sites, current type is: "+item.type);
							filteredSites.push(i);
							pos++;
						}
					}
					if (siteType != "Course Sites") {
						if (item.type == "course") {
							filteredSites.push(i);
							pos++;
						}
					}
					
					if (item.type == "course") {
						courseSiteCount++;													
					}
					if (item.published) {
						activeSiteCount++;																			
					}
				});
				function sortNumber(a,b){
					return b -a;
				}
				
				nonCourseSiteCount = data.site_collection.length - courseSiteCount;
				inactiveSiteCount  = data.site_collection.length  - activeSiteCount;
				
				filteredSites.sort(sortNumber);
				$.each(filteredSites, function(i, item){					
					data.site_collection.splice(item, 1);
				});
				if(console)console.log("records returned "+data.site_collection.length);
				searchReturn = data;
				showSearchResults();
			},
			error: function(data){
				if(console)console.log("error retrieving data");
			}
		});
		
		return false;
		
	};
	
	var findSitesByStatus = function(event){
		
		var siteStatus = $(this).attr("id");
		if (!siteStatus) {
			siteStatus = "";
		}
		
		courseSiteCount = 0;
		nonCourseSiteCount = 0;
		activeSiteCount = 0;
		inactiveSiteCount = 0; 
				
		updateRecentSearches(siteStatus);
		removeErrorMessages();		
		var filteredSites = new Array();
		$.ajax({
			type: "GET",
			url: getSiteJsonUrl(),
			dataType: "json",
			cache: false,
			success: function(data){
				var pos = 0;			
				$.each(data.site_collection, function(i, item){	
					if (siteStatus != "Active") {
						console.log("status: "+item.published)	
						if (item.published) {
						if(console)console.log("filter out active sites");
							filteredSites.push(i);
							pos++;
						}
					}
												
					if (siteStatus == "Active") {	
						if (!item.published) {
							if(console)console.log("filter active : "+item.published);
							filteredSites.push(i);
							pos++;
						}
					}
					if (item.type == "course") {
						courseSiteCount++;													
					}
					if (item.published) {
						activeSiteCount++;																			
					}
					
				});
				
				nonCourseSiteCount = data.site_collection.length - courseSiteCount;
				inactiveSiteCount  = data.site_collection.length  - activeSiteCount;
				
				function sortNumber(a,b){
					return b -a;
				}
				filteredSites.sort(sortNumber);
				console.log(filteredSites.toSource());
				$.each(filteredSites, function(i, item){
					data.site_collection.splice(item, 1);
				});
				if(console)console.log("records returned "+data.site_collection.length);
				searchReturn = data;
				showSearchResults();
			},
			error: function(data){
				if(console)console.log("error retrieving data");
			}
		});
		
		return false;
		
	};
		
	var clearSearch = function(event){
		currentPage = 1;
		$('#site-search-input').val('');
		$('#site-search-input').css("color", "#000000");
		$("#search-replaceable1").empty();
		$("#search-replaceable1").css("display", "none");
		$("#search-replaceable").show();
		return false;
	};
	
	$("#site-search-input").bind("click", function(ev){
		if ($("#site-search-input").val() == $("#site-search-input-standard").val()) {
			currentPage = 1;
			$('#site-search-input').val('');
			$('#site-search-input').css("color", "#333333");
			$("#search-replaceable1").empty();
			$("#search-replaceable1").css("display", "none");
			$("#search-replaceable").show();
		}
		return false;
	});
	
	var viewAll = function(){
		currentSearch = "";
		doSearch();
		return false;
	};
	
	var doSearch = function(){
		removeErrorMessages();
		
		courseSiteCount = 0;
		nonCourseSiteCount = 0;
		activeSiteCount = 0;
		inactiveSiteCount = 0; 
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: getSiteJsonUrl(),
			onSuccess: function(data){
				data = eval('(' + data + ')');
				$.each(data.site_collection, function(i, item){																	
					if (item.type == "course") {
						courseSiteCount++;													
					}
					if (item.published) {
						activeSiteCount++;																			
					}					
				});				
				nonCourseSiteCount = data.site_collection.length - courseSiteCount;
				inactiveSiteCount  = data.site_collection.length  - activeSiteCount;
				
				searchReturn = data;
				showSearchResults();
			},
			onFail: function(data){
			}
		});
	};
	
	var getNewestSites = function(){
		var newSites = {};
		$.ajax({
			type: "GET",
			url: getSiteJsonUrl(),
			dataType: "json",
			cache: false,
			success: function(data){
				var items = data.site_collection;
				// create a new array for sites
				var siteArray = new Array();
				for (var i = 0; i < items.length; i++) {
					siteArray[i] = {
						"title": items[i].entityTitle,
						"id": items[i].id,
						"createDate": items[i].createdTime.time
					};
				}
				//sort array by date descending to get the newest sites
				function sortbyDateCreated(a, b){
					var x = a.createDate;
					var y = b.createDate;
					return ((x < y) ? 1 : ((x > y) ? -1 : 0));
				}
				siteArray.sort(sortbyDateCreated);
				siteArray.splice(4, siteArray.length - 5);
				newSites = {
					"sites": siteArray
				};
				$("#newest_out").html(sdata.html.Template.render("newest_template", newSites));
			},
			error: function(data){
			}
		});
	};
	
	$('#site-search').bind("click", findSites);
	$("#site-search-input").bind("keydown", function(ev){
		if (ev.which == 13) {
			findSites();
			return false;
		}
	});
	$('.alpha-search').bind("click", findSitesByAlpha);	
	
	//Populate recent searches
	var getRecentSearches = function(success){
		if (success) {
			sdata.widgets.WidgetPreference.get("recent_site_searches", renderRecentSearches);
		}
		
		//Populate popular recent searches
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/searchcloud?sid=" + Math.random(),
			onSuccess: function(data){
				// Sort alphabetically
				var tagcloud = eval('(' + data + ')');
				tagcloud.items.sort(sortArray);
				generateCloud(tagcloud);
			},
			onFail: function(data){
			}
		});
		
	};
	
	function getFontSize(min,max,val) {
    	return Math.round((150.0*(1.0+(1.5*val-max/2)/max)));
  	}
 
  	function generateCloud(cloud) {
    	
		var logarithmic = false;
 
    	var min = 10000000000;
    	var max = 0;
    	for (var i = 0; i < cloud.items.length; i++) {
			var data = [];
			data[0] = parseFloat(cloud.items[i].number);
			if (data[0] > max) 
				max = data[0];
			if (data[0] < min) 
				min = data[0];
		}
   
   		var render = {};
		render.items = [];
   
    	for(var i=0;i<cloud.items.length;i++) {
      		var val = cloud.items[i].number;
      		var fsize = getFontSize(min,max,val);
			render.items[i] = {};
			render.items[i].fsize = "" + fsize + "%";
			render.items[i].searchquery = cloud.items[i].searchquery;
      	}
		
		$("#searchcloud_container").html(sdata.html.Template.render("searchcloud_template",render));
		
		$(".rec_searches_record2").bind("click", function(ev){
			var searchvalue = $(this).text();
			$('#site-search-input').val(searchvalue);
			findSites();
			return false;
		});
    
  	}
	
	var sortArray = function(a,b){
		if (a.searchquery < b.searchquery){
			return -1;
		} else {
			return 1;
		}
	}
	
	var renderRecentSearches = function(searches, exists){
		if (exists) {
			$("#rec_searches_out").html(sdata.html.Template.render("rec_searches_template", JSON.parse(searches)));
			$(".rec_searches_record").bind("click", function(ev){
				var searchvalue = $(this).text();
				$('#site-search-input').val(searchvalue);
				findSites();
				return false;
			});
		}
	};
	
	var updateRecentSearches = function(myQuery){
		var addQuery = function(searches, exists){
			if (exists) {
				searches = JSON.parse(searches);
				// set a maximum number of queries to keep - 1 more than the splice
				searches.searches.splice(7);
				searches.searches.unshift({
					query: myQuery
				});
			}
			else {
				searches = {
					searches: [{
						query: myQuery
					}]
				};
			}
			sdata.widgets.WidgetPreference.save("/sdata/p/widgets/","recent_site_searches", JSON.stringify(searches), getRecentSearches);
		};
		sdata.widgets.WidgetPreference.get("recent_site_searches", addQuery);
	};
	
	var clearRecentSearches = function(){
		searches = {
			searches: []
		};
		sdata.widgets.WidgetPreference.save("/sdata/p/widgets/","recent_site_searches", JSON.stringify(searches), getRecentSearches);
	};
	
	var removeErrorMessages = function(){
		$(".msg-text").text('');
		$(".msg-error").hide();
	};
	
	$("#clear-recent").bind("click", clearRecentSearches);
	$(".add-widgets").bind("click", showCreatNewSite);
	$("#view-all").bind("click", viewAll);
	$(".msg-remove").bind("click", removeErrorMessages);
	getRecentSearches(true);
	getNewestSites();

	
};

sdata.registerForLoad("sakai.sites_join");