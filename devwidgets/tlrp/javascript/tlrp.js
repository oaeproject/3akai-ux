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
/*global $, Config, jQuery, json_parse, sakai, sdata, Querystring, DOMParser */


/**
 * Initialize the rss widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement Widget place
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.tlrp = function(tuid, placement, showSettings) {

    var rootel = "#" + tuid;
    var jsonFilesLoaded = false;
	var jsonData={};
    var currentSearch = "";
	// Global objects for settings
	var settingsJSON = {};
	var filters = [];
	var resources = [
	{name : "British Educational Research Association", code : "bera"},
	{name : "National Centre for Research Method", code : "ncrm"},
	{name : "Dspace articles", code : "dspace"}];
	
    // Global object for searching.
    var searchObject = {};
	var currentTab = "narrower";
    
    // The different search objects
    var catSearch;
    var tagSearch;
    var authorSearch;
    var yearSearch;
    
    // Data files
    var json = [];
    json.skos = {
        url: "/devwidgets/tlrp/json/tlrp_bera_skos.js",
        data: {}
    };
    json.bera = {
        url: "/devwidgets/tlrp/json/bera.js",
        data: {}
    };
    json.ncrm = {
        url: "/devwidgets/tlrp/json/ncrm.js",
        data: {}
    };
    json.dspace = {
        url: "/devwidgets/tlrp/json/dspace.js",
        data: {}
    };
    var toLoad = ['skos'];
    var records = [];
    var keywords = [];
    
    /////////////////////////////
    // Configuration variables //
    /////////////////////////////	
    
    var tlrp = "tlrp";
    var tlrpID = "#tlrp";
    var tlrpClass = ".tlrp";
    
    // Containers
    var tlrpSettings = tlrpID + "_settings";
    var tlrpOutput = tlrpID + "_output";
	var tlrpBreadCrumBarMatches = "#tlrpBreadCrumbBarMatches";
	var tlrpBreadCrumBarRelated = "#tlrpBreadCrumbBarRelated";
    
    // Buttons (Settings)
    var tlrpSubmit = tlrpID + "_settings_insert";
    var tlrpCancel = tlrpID + "_settings_cancel";
    
    // Buttons (Output)
    var tlrpSeachBtn = tlrpID + "_searchBtn";
    
    // Textboxes (Output)
    var tlrpSeachTxt = tlrpID + "_txtSearch";
    
    // Tabs (Output)
    var tlrpTabs = tlrpClass + "_tabs";
    var tlrpTabContainers = tlrpClass + "_tabContainers";
    var tlrptabMatchBtn = tlrp + "tabMatchBtn";
    var tlrptabBroadBtn = tlrp + "tabBroadBtn";
    var tlrptabRelatedBtn = tlrp + "tabRelatedBtn";
    var tlrpTabAndContainers = [];
    tlrpTabAndContainers[tlrptabMatchBtn] = tlrpID + "tabMatchContainer";
    tlrpTabAndContainers[tlrptabBroadBtn] = tlrpID + "tabBroadContainer";
    tlrpTabAndContainers[tlrptabRelatedBtn] = tlrpID + "tabRelatedContainer";
    var tlrpLeftTabs = tlrpClass + "_leftTabs";
    var tlrpLeftTabsNormal = tlrp + "_leftTabs_tab";
    var tlrpLeftTabsSelected = tlrp + "_leftTabs_selected";
    var tlrpLeftTabContainer = tlrpClass + "LeftTabContainers";
    var tlrpCatBtn = tlrp + "CatBtn";
    var tlrpTagBtn = tlrp + "TagBtn";
    var tlrpYearBtn = tlrp + "YearBtn";
    var tlrpAuthorBtn = tlrp + "AuthorBtn";
    var tlrpLeftTabAndContainers = [];
    tlrpLeftTabAndContainers[tlrpCatBtn] = tlrpID + "LeftTabCatContainer";
    tlrpLeftTabAndContainers[tlrpTagBtn] = tlrpID + "LeftTabTagContainer";
    tlrpLeftTabAndContainers[tlrpYearBtn] = tlrpID + "LeftTabYearContainer";
    tlrpLeftTabAndContainers[tlrpAuthorBtn] = tlrpID + "LeftTabAuthorContainer";
    var selectedLeftTab = tlrpCatBtn;
    
    // Search field
    var roundedCornersClass = tlrpClass + "_rounded_corners";
    
    // Textfields
    var tlrpKeyword = tlrpClass + "_keyword";
    
    // Preloader
    var tlrpLeftTabPreloaderContainer = "#tlrpLeftTabPreloaderContainer";
    var tlrpLeftTabCatContainer = "#tlrpLeftTabCatContainer";
    var tlrpPreloaderTemplate = "tlrpPreloaderTemplate";
    var tlrpPreloaderContainer = "#tlrpPreloaderContainer";
	
	// Settings
	var tlrpAddFilter = "#tlrp_addFilter";
	var tlrpFilterTemplate = "tlrp_filterListTemplate";
	var tlrpFilterContainer = "#tlrp_filterListContainer";
	var tlrpDeleteFilter = ".tlrp_filter_delete";
	var tlrpFilterTxt = "#tlrp_settings_txtFilter";
	var tlrpRespositoryContainer= "#tlrp_respositoryListContainer";
	var tlrpRespositoryTemplate= "tlrp_respositoryListTemplate";
    var tlrpRespositoryItem = ".tlrp_respositoryListItem";
    var tlrpRespositoryItemChk = ".tlrp_respositoryListItem_checkbox";
	var tlrpRespositoryNumItems = ".tlrp_respositoryListItem_data_subscript";
	var tlrpSelectAllResp = "#tlrp_selectAllChk";
	
	var tlrpBallonTipClass = ".tlrpArticleWithBalloonTip";
	var tlrpArticleDescriptionID = "#tlrpArticleDescription";
	var tlrpArticleDescriptionClass = ".tlrpArticleDescription";
	var tlrpArticleNoDescriptionID = "#tlrpArticleNoDescription";
	var tlrpArticleNoDescriptionAuthorID = "#tlrpArticleDescriptionAuthor";
	var tlrpArticleNoDescriptionDescriptionID = "#tlrpArticleDescriptionDescription";
	var tlrpArticleCreatoClass= ".tlrpArticleCreator";
	var tlrpArticleClass= ".tlrpArticle";
	var tlrpArticleNoDot= "tlrpArticle";
	
	
	
    ////////////
    // Shared //
    ////////////
	
	/**
	 * Wil return a boolean stating if the filters match the string
	 * @param {Object} string
	 * @param {Object} filters
	 */
	var stringMatchesAllFilters = function(string, filters){
		for(var i=0; i< filters.length; i++){
			if(string.toLowerCase().indexOf(filters[i].toLowerCase()) === -1){
				return false;
			}
		}
		return true;
	};
	
	/**
	 * Returns a filtered array
	 * @param {Array} filters: the filters
	 * @param {Array} records: the array to filter
	 * @param {String} filterOn: the field to filter on
	 */
	var filterArray = function(filters, records, filterOn){
		if(filters.length > 0){
			var recordsTemp = [];
			var regex = new RegExp("(" + filters.join(")|(") + ")", "i");
			for(var i = 0; i < records.length; i ++){
				// if the property is an array first join it
				if(records[i][filterOn] && typeof records[i][filterOn] === "object"){
					var tempString = records[i][filterOn].join(",");
					if(stringMatchesAllFilters(tempString, filters)){
						recordsTemp.push(records[i]);
					}
				}
				else if(records[i][filterOn] && typeof records[i][filterOn] === "string"){
					if(stringMatchesAllFilters(records[i][filterOn], filters)){
						recordsTemp.push(records[i]);		
					}
				}
			}
			return recordsTemp;
		}
		return records;
		
	};
	
	/**
     * This will load a file from the json parameter. When its loaded it will move to the next one.
     * It will also show or hide the preloader.
     * @param {int} index The index in the toLoad array.
     */
    var loadJSONFile = function(index, completeFunction ,preloader) {
        $.ajax({
            url: json[toLoad[index]].url,
            httpMethod: "GET",
            success: function(data) {
                // Load in the data.
                json[toLoad[index]].data = eval("(" + data + ")");
				records = $.merge(records, json[toLoad[index]].data.items);
                // Show a small preloader
				if(preloader){
					showPreloader(index + 1, toLoad.length);
				}
                // Check if we loaded all of them
                if (index < (toLoad.length - 1)) {
                    loadJSONFile(index + 1, completeFunction, preloader);
                }
                else {
					completeFunction();
                }
                return true;
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Failed to retrieve a file.");
            }
        });
    };
	
	
    //////////////
    // Settings //
    //////////////
    
	/**
	 * Fills the resources list
	 */
	var loadResources = function(){
		$(tlrpRespositoryContainer, rootel).html($.Template.render(tlrpRespositoryTemplate, {items : resources}));
	};
	/**
	 * Update the number of items displayed with the resources-list items
	 */
	var updateNumItems = function(){
		if(jsonFilesLoaded){
			for(var j= 0;j < resources.length ; j++){
				$(tlrpRespositoryNumItems + " span:eq(" + j + ")").html(filterArray(filters ,json[resources[j].code].data.items, "subject").length);
			}
		}
	};
	/**
	 * Removes a filter from the filter list
	 * @param {Object} index
	 */
	var removeFilter = function(index){
		filters.splice(index, 1);
	  	$(tlrpFilterContainer, rootel).html($.Template.render(tlrpFilterTemplate, {filters : filters}));
		updateNumItems();
	};
	/**
	 * The eventhandler to remove a filter
	 * @param {Object} e
	 */
	var removeFilterHandler = function(e){
		var index = parseInt(e.target.id.replace(e.target.className, ""),10);
		removeFilter(index);
	};
	/**
	 * Loads the settings screen
	 * @param {Object} exists
	 */
    var loadSettings = function(exists) {
		// show the screen
        $(tlrpOutput, rootel).hide();
        $(tlrpSettings, rootel).show();
		// load the resources list
		loadResources();
		toLoad =[];
		for(var j= 0;j < resources.length ; j++){
			toLoad.push(resources[j].code);
		}
		// fill in the data that was already saved
		if(exists){
			for(var i= 0;i < jsonData.resources.length ; i++){
				for(j= 0;j < resources.length ; j++){
					if(jsonData.resources[i] === resources[j].code){
						$(tlrpRespositoryItemChk + " input[type=checkbox]:eq(" + i + ")").attr("checked", true);
					}
				}
			}
			filters = jsonData.filters;
			$(tlrpFilterContainer, rootel).html($.Template.render(tlrpFilterTemplate, {filters : filters}));
		}
		// load the json files
		loadJSONFile(0, function(){
			// update the number of items
			jsonFilesLoaded = true;
			updateNumItems();
		});
		// bind the remove filter button
		$(rootel + ' ' + tlrpDeleteFilter).die("click", removeFilterHandler);
		$(rootel + ' ' + tlrpDeleteFilter).live("click", removeFilterHandler);
    };
    
	/**
	 * Checks if the filter is already in the array (case insensitive)
	 * @param {Object} filter
	 */
	var checkIfFilterExists = function(filter){
		for(var i=0;i<filters.length ; i++){
			if(filters[i].toLowerCase() === filter.toLowerCase()){
				return true;
			}
		}
		return false;
	};
	
	/**
	 * Adds the filter to tha filter array and update the filter list
	 * @param {Object} filter
	 */
	var addFilter = function(filter){
		if(!checkIfFilterExists(filter)){
			filters.push(filter);
	  		$(tlrpFilterContainer, rootel).html($.Template.render(tlrpFilterTemplate, {filters : filters}));
			updateNumItems();
		}
		else{
			alert("This filter has already been added.");
		}
		
	};
    
	/**
	 * Retrieve the settings object based on the filled in data
	 */
	var getSettingsObject = function(){
		var settings = {};
		settings.filters = filters;
		settings.resources = [];
		for(var i = 0; i < $(tlrpRespositoryContainer + " " + tlrpRespositoryItem).length; i ++){
			if($(tlrpRespositoryItemChk + " input[type=checkbox]:eq(" + i + ")").is(":checked")){
				settings.resources.push(resources[i].code);
			}
		}
		return settings;
	};
    
    ////////////
    // Output //
    ////////////
    
    /**
     * Fix some rounded corner layout issues
     */
    var setRoundedCorners = function() {
        // Round corners for elements with '.rounded_corners' class
        $(roundedCornersClass, rootel).corners("10px");
    };
    
	/**
	 * Shows the preloader
	 * @param {Object} i: the number of files already loaded
	 * @param {Object} total: the number of files that need to be loaded
	 */
    var showPreloader = function(i, total) {
        var preloaded = {
            'i': i,
            'total': total
        };
        $(tlrpLeftTabPreloaderContainer, rootel).show();
        $(tlrpPreloaderContainer, rootel).html($.Template.render(tlrpPreloaderTemplate, preloaded));
    };
    
	var showOrHideRelatedTab = function(show){
		if(show && toLoad.indexOf("dspace") > -1){
			$("#" + tlrptabRelatedBtn, rootel).show();	
		}
		else{
			$("#" + tlrptabRelatedBtn, rootel).hide();
		}
	};
	
	/**
	 * Loads the correct seach based on the tab-id
	 * @param {Object} id: id of the tab clicked
	 * @param {Object} search: the search query
	 */
	var loadCorrectSearch = function(id, search) {
	    currentSearch = search;
		// load the correct search
		// check if the search is already initialized
		// set equal to searchObject
		// hide or show the related tab
		var showRelatedTab = false;
        if (id === tlrpCatBtn) {
            catSearch = catSearch || sakai.tlrp.category(records, json.skos.data, tuid);
            searchObject = catSearch;
			// setTab is needed to set catSearch to the right tab
			searchObject.setTab(currentTab);
			showRelatedTab = true;
        }
        else if (id === tlrpTagBtn) {
            tagSearch = tagSearch || sakai.tlrp.tags(records, tuid);
            searchObject = tagSearch;

        }
        else if (id === tlrpAuthorBtn) {
            authorSearch = authorSearch || sakai.tlrp.author(records, tuid);
            searchObject = authorSearch;

        }
        else if (id === tlrpYearBtn) {
            yearSearch = yearSearch || sakai.tlrp.year(records, tuid);
            searchObject = yearSearch;
        }
		showOrHideRelatedTab(showRelatedTab);
        // Set the breadcrumbar identifier
        $(tlrpBreadCrumBarMatches).attr('class', searchObject.getBreadCrumbBar());
		$(tlrpBreadCrumBarRelated).attr('class', searchObject.getBreadCrumbBar());
        // Do the search.
        searchObject.search(search);
    };
	
 	var loadOutput = function() {
        $(tlrpSettings, rootel).hide();
        $(tlrpOutput, rootel).show();
		toLoad = $.merge(toLoad,jsonData.resources);
	 	loadJSONFile(0, function(){
			// Everything is loaded, hide the preloader and show the author tab.
			$(tlrpLeftTabPreloaderContainer, rootel).hide();
			$(tlrpLeftTabAndContainers[tlrpAuthorBtn], rootel).show();
			jsonFilesLoaded = true;
			$(tlrpSeachTxt, rootel).attr("disabled", false);
			
			//filter records and keywords with the filters in jsonSettings
			records = filterArray(jsonData.filters, records, "subject");
			
			loadCorrectSearch(tlrpAuthorBtn, $(tlrpSeachTxt, rootel).val());
		}, true);
    };
	
    ////////////////////
    // Event Handlers //
    ////////////////////	
    
	/**
	 * Retrieves the settings object and saves it to JCR
	 */
    $(tlrpSubmit, rootel).click(function() {
        var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
		var tostring = $.toJSON(getSettingsObject());
        sdata.widgets.WidgetPreference.save(saveUrl, tlrp, tostring, sdata.container.informFinish(tuid));
    });
	/**
	 * Cancel the settings screen
	 */
    $(tlrpCancel, rootel).click(function() {
        sdata.container.informCancel(tuid);
    });
	/**
	 * When a tab related or narrower is clicked
	 * @param {Object} e
	 */
    $(tlrpTabs + " li a", rootel).click(function(e) {
        var containerID = tlrpTabAndContainers[e.target.id];
        $(tlrpTabContainers, rootel).hide();
        $(containerID, rootel).show();
		if(e.target.id === tlrptabMatchBtn){
			currentTab = "narrower";
		}else if(e.target.id === tlrptabRelatedBtn){
			currentTab = "related";
		}
		// load the correctsearch
		loadCorrectSearch(selectedLeftTab, currentSearch);
    });
	/**
	 * When the search button is clicked
	 */
    $(tlrpSeachBtn, rootel).click(function() {
		// only allow a search if the JSON-files are already loaded
        if (jsonFilesLoaded) {
            currentSearch = $(tlrpSeachTxt, rootel).val();
            $(tlrpKeyword, rootel).html(currentSearch);
            loadCorrectSearch(selectedLeftTab, currentSearch);
        }
    });
    $(tlrpSeachTxt, rootel).keydown(function(e) {
    	// only allow a search if the JSON-files are already loaded
        if (e.keyCode === 13 && jsonFilesLoaded) {
            currentSearch = $(tlrpSeachTxt, rootel).val();
            $(tlrpKeyword, rootel).html(currentSearch);
            loadCorrectSearch(selectedLeftTab, currentSearch);
        }
    });
	/**
	 * Bound to the left tabs
	 * @param {Object} e
	 */
    $(tlrpLeftTabs + " li a", rootel).click(function(e) {
		// load the correct search
        var containerID = tlrpLeftTabAndContainers[e.target.id];
        selectedLeftTab = e.target.id;
        loadCorrectSearch(selectedLeftTab, currentSearch);
        $(tlrpLeftTabContainer, rootel).hide();
        $(containerID, rootel).show();
        $("." + tlrpLeftTabsNormal, rootel).removeClass(tlrpLeftTabsSelected);
        $("#" + e.target.id, rootel).addClass(tlrpLeftTabsSelected);
        
    });
	/**
	 * Add a new filter in the settings
	 * @param {Object} e
	 */
	$(tlrpFilterTxt, rootel).keydown(function(e){
		if(e.keyCode === 13){
			addFilter($(tlrpFilterTxt, rootel).val());
			$(tlrpFilterTxt, rootel).val("");
		}
	});
	/**
	 * Add a new filter in the settings
	 * @param {Object} e
	 */
	$(tlrpAddFilter, rootel).click(function(){
		addFilter($(tlrpFilterTxt, rootel).val());
		$(tlrpFilterTxt, rootel).val("");
	});
	/**
	 * Check or uncheck all the resources in the resources list
	 */
	$(tlrpSelectAllResp).click(function(){
		$(tlrpRespositoryItemChk + " input[type=checkbox]").attr("checked", $(tlrpSelectAllResp).is(":checked"));
	});
    
    //////////////////////////////
    // Initialization functions //
    //////////////////////////////
    
    /**
     * Initializes the tlrp widget
     */
    var doInit = function() {
        var url = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "tlrp") + "?sid=" + Math.random();
        if (showSettings) {
            $.ajax({
                url: url,
                httpMethod: "GET",
                success: function(data) {
					jsonData = $.evalJSON(data);
                    loadSettings(true);
                },
                error: function(xhr, textStatus, thrownError) {
                    loadSettings(false);
                }
            });
        }
        else {
            $.ajax({
                url: url,
                httpMethod: "GET",
                success: function(data) {
					jsonData = $.evalJSON(data);
                    loadOutput();
                },
                error: function(xhr, textStatus, thrownError) {
                    alert("Problem while retrieving tlrp-widget settings.");
                }
            });
        }
        
        
        
        setRoundedCorners();
    };
    
    ////////////
    // EVENTS //
    ////////////
	

    /**
     * Article tooltip
     */
    $(tlrpBallonTipClass).live('mouseover', function(e) {
        // Get the balloon tip
        var balloon = $(tlrpArticleDescriptionID, rootel);
        
        // Adjust the description
        var desc = $(tlrpArticleDescriptionClass, this).text();
        if (desc === "") {
            desc = $(tlrpArticleNoDescriptionID, rootel).text();
        }
        if (desc.length > 100) {
            desc = desc.substring(0, 100) + "...";
        }
        
        $(tlrpArticleNoDescriptionAuthorID, balloon).text($(tlrpArticleCreatoClass, this).text());
        $(tlrpArticleNoDescriptionDescriptionID, balloon).text(desc);
        
        $(this).after(balloon);
        
        $(tlrpArticleDescriptionID).css({
            'opacity': '1',
            'left': 'auto',
            'top': 'auto',
            'position' : 'absolute'
        });
        $(tlrpArticleDescriptionID).stop();
        $(tlrpArticleDescriptionID).show();
    });
    $(tlrpArticleClass).live('mouseout', function(e) {
        if (e.target.className === tlrpArticleNoDot) {
            $(tlrpArticleDescriptionID).fadeOut();
        }
    });
    
    
    doInit();
    
};

sdata.widgets.WidgetLoader.informOnLoad("tlrp");
