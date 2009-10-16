/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $, sdata, Config, fluid, AIM, window, doPaging, get_cookie, Querystring */

var sakai = sakai || {};

sakai.contentmedia = function(){

	////////////////////
	// Help variables //
	////////////////////

	var options = {};				// Contains the different search options
	var globaldata = {};			// Contains the data of the files for the current page
	var selectedFiles = {};			// Object with the files that are currently selected
	var basicUploadFilename = "";	// The filename when you use the basic upload
	var enableFolder = false;		// Enable seeing folder or not

	// Paging
	var pageCurrent = 0;			// The page you are currently on
	var pageSize = 14;			// How many items you want to see on 1 page
	
	// Search URL mapping
	var searchURLmap = {
		allfiles : Config.URL.SEARCH_ALL_FILES,
		mybookmarks : Config.URL.SEARCH_MY_BOOKMARKS,
		mycontacts : Config.URL.SEARCH_MY_CONTACTS,
		myfiles : Config.URL.SEARCH_MY_FILES,
		mysites : Config.URL.SEARCH_MY_SITES
	};


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////
	
	var jqPagerClass = ".jq_pager";
	
	var contentmediaId = "#contentmedia";

	var contentmediaFilesContainer = contentmediaId + "_files_container";
	var contentmediaUploaderBasicSuccessful = contentmediaId + "_uploader_basic_successful";

	// Class
	var contentmediaAccordionListClass = "contentmedia_accordion_list";
	var contentmediaDisabledClass = "contentmedia_disabled";
	var contentmediaDropActiveClass = "contentmedia_drop_active";
	var contentmediaDropHoverClass = "contentmedia_drop_hover";
	var contentmediaHiddenClass = "contentmedia_hidden";
	var contentmediaFileClass = "contentmedia_file";
	var contentmediaFileSelectedClass = "contentmedia_file_selected";
	var contentmediaSelectedItemClass = "contentmedia_selecteditem";
	var contentmediaViewClass = "contentmedia_view";
	var contentmediaViewThumbnailClass = contentmediaViewClass + "_thumbnail";

	// Template
	var contentmediaAccordionListSiteTemplate = "contentmedia_accordion_list_site_template";
	var contentmediaDragTooltipTemplate = "contentmedia_drag_tooltip_template";
	var contentmediaDropMessageTemplate = "contentmedia_drop_message_template";
	var contentmediaDialogRemoveListTemplate = "contentmedia_dialog_remove_list_template";
	var contentmediaFilesContainerTemplate = "contentmedia_files_container_template";
	var contentmediaListTitleTemplate = "contentmedia_list_title_template";
	var contentmediaUploaderBasicSuccessfulTemplate = "contentmedia_uploader_basic_successful_template";

	// Accordion
	var contentmediaAccordion = contentmediaId + "_accordion";
	var contentmediaAccordionList = contentmediaAccordion + "_list";
	var contentmediaAccordionListSite = contentmediaAccordionList  + "_site";
	var contentmediaAccordionListSiteBookmarks = contentmediaAccordionListSite + "_bookmarks";
	var contentmediaAccordionListTag =  contentmediaAccordionList  + "_tag";
	
	// Actions
	var contentmediaActionsEdit = contentmediaId + "_actions_edit";
	var contentmediaActionsRemove = contentmediaId + "_actions_remove";
	var contentmediaActionsView = contentmediaId + "_actions_view";
	var contentmediaActionsViewList = contentmediaActionsView + "_list";
	var contentmediaActionsViewThumbnail = contentmediaActionsView + "_thumbnail";
	
	// Context
	var contentmediaContextFilter = contentmediaId + "_context_filters";
	var contentmediaContextFilterMyfiles = contentmediaContextFilter + "_myfiles";
	
	// Dialogs
	var contentmediaDialog = contentmediaId + "_dialog";
	var contentmediaDialogAssociations = contentmediaDialog + "_associations";
	var contentmediaDialogAssociationsMove = contentmediaDialogAssociations + "_move";
	var contentmediaDialogAssociationsMoveAll = contentmediaDialogAssociationsMove + "_all";
	var contentmediaDialogAssociationsMoveSelected = contentmediaDialogAssociationsMove + "_selected";
	var contentmediaDialogAssociationsSelect = contentmediaDialogAssociations + "_select";
	var contentmediaDialogAssociationsSelectAll = contentmediaDialogAssociationsSelect + "_all";
	var contentmediaDialogAssociationsSelectSelected = contentmediaDialogAssociationsSelect + "_selected";
	var contentmediaDialogAssociationsTrigger = contentmediaDialogAssociations + "_trigger";
	var contentmediaDialogEdit = contentmediaDialog + "_edit";
	var contentmediaDialogPermissions = contentmediaDialog + "_permissions";
	var contentmediaDialogPermissionsTrigger = contentmediaDialogPermissions + "_trigger";
	var contentmediaDialogRemove = contentmediaDialog + "_remove";
	var contentmediaDialogRemoveConfirm = contentmediaDialogRemove + "_confirm";
	var contentmediaDialogRemoveDecline = contentmediaDialogRemove + "_decline";
	var contentmediaDialogRemoveList = contentmediaDialogRemove + "_list";
	var contentmediaDialogUploader = contentmediaDialog + "_uploader";
	
	// Drag Drop
	var contentmediaDragTooltipClass = "contentmedia_drag_tooltip";
	var contentmediaDrop = contentmediaId + "_drop";
	var contentmediaDropMessage = contentmediaDrop + "_message";
	
	// Folders
	var contentmediaFolders = contentmediaId + "_folders";
	var contentmediaFoldersTrigger = contentmediaFolders + "_trigger";
	
	// List
	var contentmediaListTitle = contentmediaId + "_list_title";
	
	// Pop up
	var contentmediaContent = ".contentmedia_content";
	var contentmediaContentWrapper = contentmediaContent + "_wrapper";
	
	// Search
	var contentmediaSearch = contentmediaId + "_search";
	var contentmediaSearchButton = contentmediaSearch + "_button";
	
	// Uploader
	var contentmediaUploader = contentmediaId + "_uploader";
	var contentmediaUploaderBasic = contentmediaUploader + "_basic";
	var contentmediaUploaderBasicName = contentmediaUploaderBasic + "_name";
	var contentmediaUploaderTrigger = contentmediaUploader + "_trigger";

	///////////////////////
	// Utility functions //
	///////////////////////

	/**
	 * Method to sort a select element with different option elements
	 * @param {Object} element The select element that needs to be sorted
	 */
	var sortOptions = function(element){
		var sortedVals = $.makeArray($(element + ' option')).sort(function(a,b){ 
			return $(a).text() > $(b).text() ? 1: -1; 
		}); 
		$(element).empty().html(sortedVals);
	};

	/**
	 * Returns a formated file size
	 * @param {Int} bytes Number of bytes you want to show
	 * @param {Array} suffixes Array of suffixes used to show the formated filesize
	 */
	var filesizeFormat = function(bytes, suffixes){
	    var b = parseInt(bytes, 10);
	    var s = suffixes || ['byte', 'bytes', 'KB', 'MB', 'GB'];
	    if (isNaN(b) || b === 0) { return '0 ' + s[0]; }
	    if (b == 1)              { return '1 ' + s[0]; }
	    if (b < 1024)            { return  b.toFixed(2) + ' ' + s[1]; }
	    if (b < 1048576)         { return (b / 1024).toFixed(2) + ' ' + s[2]; }
	    if (b < 1073741824)      { return (b / 1048576).toFixed(2) + ' '+ s[3]; }
	    else                     { return (b / 1073741824).toFixed(2) + ' '+ s[4]; }
	};
	
	/**
	 * Format the date for a file
	 * @param {String} date_input Date that needs to be formatted
	 */
	var dateFormat = function(date_input){
		var date = new Date(date_input);
		return $.L10N.transformDate(date);
	};
	
	/**
	 * Add the session id to the url so the user is authenticated.
	 * This is to solve the flash cookie bug.
	 * @param {String} url The url where you want to add the session to
	 */
	var getServerUrl = function(url){
		return url + ";jsessionid=" + encodeURIComponent(get_cookie("JSESSIONID"));
	};
		
	/**
	 * Make an array containing the URLs of the selected files
	 * @return {Array} Array with the URLs of the selected files
	 */
	var doSelectedFilesURLToArray = function(){
		var filesToDeleteArray = [];
		$.each(selectedFiles.items, function(i){
			filesToDeleteArray.push(selectedFiles.items[i].path);
		});
		return filesToDeleteArray;
	};

	/**
	 * Reset the selected files variable
	 */
	var resetSelectedFiles = function(){
		selectedFiles.items = [];
		selectedFiles.maintainer = false;
	};

	/**
	 * Method that gets called when we submit the form
	 */
	var startUpload = function(){
		return true;
	};
	
	////////////////////
	// Main functions //
	////////////////////

	/**
	 * When the upload is completed
	 */
	var completeUpload = function(response){
		/** TODO Check for correct statuscodes */
		if(response){
			
			// Make a temporary JSON object and set the filename property (for rendering the template)
			var jsonT = {};
			jsonT.filename = basicUploadFilename;

			// Show a response that the upload was successful
			$(contentmediaUploaderBasicSuccessful).html($.Template.render(contentmediaUploaderBasicSuccessfulTemplate, jsonT));
		}
	};
	
	/**
	 * Show a message when you drop files/folders on a tag/site
	 * @param {Object} movedFiles JSON object with information about the files and where it is dropped
	 * @param {String} Id of the div where you want to show the message in
	 */
	var showDroppedMessage = function(movedFiles, showDroppedMessageIn){
		// Render the message and add animation to show the message
		$(contentmediaDropMessage).hide();
		$.Template.render(contentmediaDropMessageTemplate, movedFiles, $(contentmediaDropMessage));
		$(showDroppedMessageIn).append($(contentmediaDropMessage));
		$(contentmediaDropMessage).show();
		$(contentmediaDropMessage).fadeOut(2000);
	};
	
	/**
	 * Send a POST to the files where you need to add a tag/site
	 * 
	 *	movedFiles = {
	 *		count: 1,
	 *		kind: "tag" or "site",
	 *		dropped: on what the file is dropped
	 *	}
	 *  
	 * @param {Object} movedFiles Object containing information about where to send to files and how many there are
	 * @param {String} showDroppedMessageIn The id of the element where you want to show the message in
	 */
	var sendTagSitePost = function(movedFiles, showDroppedMessageIn){
		
		var confirmation = false;
		
		// Ask for a confirmation if you want to make the members of a site maintainer
		if(movedFiles.kind === "site"){
			//confirmation = confirm("Should the members of the sites you want to add be a maintainer?");
		}
		
		for (var i = 0; i < selectedFiles.items.length; i++) {

			// Count how many ajax requests where successful
			var countAjax = selectedFiles.items.length;

			// Variable that will contain the POST data
			var postData = {};
			
			// Set the url for site/tag
			var url = selectedFiles.items[i].path;
			
			// Check if it is a tag, site or something else to set the 
			// appropriate properties
			if(movedFiles.kind === "tag"){

				// Check if there is already an array of tags
				if(!selectedFiles.items[i]["sakai:tags"]){
					selectedFiles.items[i]["sakai:tags"] = [];
				}
				
				// Only add the tag if it is not yet in the array
				if($.inArray(movedFiles.dropped[0], selectedFiles.items[i]["sakai:tags"]) === -1){
					selectedFiles.items[i]["sakai:tags"].push(movedFiles.dropped[0]);
				}

				postData[":operation"] = "addProperty";
				postData["sakai:tags"] = selectedFiles.items[i]["sakai:tags"];

			}else{
				
				// Change the url to make a link for the file
				url = selectedFiles.items[i].path + ".link.json";

				// Set the site and link property for sending the post
				postData.site = movedFiles.dropped[0];
				postData.link = movedFiles.dropped[0] + "/_files";
			}

			// Send the ajax post
			$.ajax({
				type: "POST",
				data: postData,
				url: url,
				cache: false,
				success: function(data){
					countAjax--;
					
					// Show a message if the counter is 0 and if the showDroppedMessageIn is not null
					if (countAjax === 0 && showDroppedMessageIn) {
						showDroppedMessage(movedFiles, showDroppedMessageIn);
						
						// TODO update the fileinfo on the page after sending the post
						
					}
				},
				error: function(status){
					alert("An error has occured");
				}
			});
		}
	};
        
	/**
	 * Initialise the jQuery droppable plugin
	 */
	var initialiseDroppable = function(){
		var droppableElements = "";

		// Check if the current user is a maintainer of the files
		if(selectedFiles.maintainer){
			
			// If the current user is a maintainer, make all files
			// from the contentmediaAccordionList class droppable
			droppableElements = "."  + contentmediaAccordionListClass  + " a";
		}else{
			
			// If the current user isn't a maintainer, undo the droppable on the elements in the accordion
			// and only make the myBookmarks droppable
			$("."  + contentmediaAccordionListClass  + " a").droppable('destroy');
			droppableElements = contentmediaAccordionListSiteBookmarks;
		}

		$(droppableElements).droppable({
			drop: function(event, ui) {			

				// Where the message needs to be shown in
				var showDroppedMessageIn = null;

				// JSON object the contains how many files, which kind and where the files are dropped
				var movedFiles = {
					count: selectedFiles.items.length
				};

				// Check if it is dropped on a tag or a site
				if ($(contentmediaAccordionListTag).is(":visible")) {

					// The file/folder is dropped on a tag
					movedFiles.kind = "tag";
					movedFiles.dropped = [];
					movedFiles.dropped.push($("span", this).text());
					
					showDroppedMessageIn = contentmediaAccordionListTag;

				}
				else {

					// The file/folder is dropped on a site
					movedFiles.kind = "site";
					movedFiles.dropped = [];
					movedFiles.dropped.push($("span", this).text());
					
					showDroppedMessageIn = contentmediaAccordionListSite;
					
				}
				
				sendTagSitePost(movedFiles, showDroppedMessageIn);
			},
			activeClass: contentmediaDropActiveClass,
			hoverClass: contentmediaDropHoverClass,
			tolerance: 'pointer'
		});
	};
	
	/**
	 * Set up the jQuery UI draggable plug-in
	 */
	var initialiseDraggable = function(){
		$("." + contentmediaFileSelectedClass).draggable({
			containment: $(contentmediaContentWrapper),
			cursor: 'move',
			cursorAt: { top: 5, left: -20 },
			helper: function(event) {
				
				return $('<div class="'+ contentmediaDragTooltipClass + '">Move ' + selectedFiles.items.length + ' files</div>');
				//$.Template.render(contentmediaDragTooltipTemplate, selectedFiles, contentmediaDragTooltip);
				//return $(contentmediaDragTooltip);
			}
		});
	};
	
	/** 
	 * Initialise both the jQuery plug-ins: drag and drop
	 */
	var initialiseDragDrop = function(){
		initialiseDraggable();
		initialiseDroppable();
	};
	
	/**
	 * 
	 * @param {Object} data  JSON object with all of the files to be displayed on the
	 * screen. An example of the data model can be found in /devwidgets/contentmedia/json/files.json
	 */
	var doFileRender = function(data){

		// Set the globaldata variable
		globaldata = data;

		// Set the formatted file size and format the date
		for(var i = 0; i < globaldata.results.length; i++){
			if(globaldata.results[i].filesize){
				globaldata.results[i].formattedFilesize = filesizeFormat(globaldata.results[i].filesize);
				globaldata.results[i].formattedDateModified = dateFormat($.ParseJCRDate(globaldata.results[i]["jcr:lastModified"]));
			}
		}

		// Render files
		$(contentmediaFilesContainer).html($.Template.render(contentmediaFilesContainerTemplate, data));
		
		// Render paging
		$(jqPagerClass).pager({
			pagenumber: pageCurrent + 1,
			pagecount: Math.ceil(data.total / pageSize),
			buttonClickCallback: doPaging
		});
		
		// Initialise the dragging and dropping of files
		initialiseDragDrop();
		
		// Reset the selected files variable
		resetSelectedFiles();
	};

	/**
	 * 
	 * @param {Object} options  identifier for the current context, initial search
	 *   query and initial tag filter
	 *   {
	 *		"context" : "myfiles", "allfiles", ...,
	 *		"site": false or ["/sites/test"]
	 *		"search" : false or "searchquery",
	 *		"tag" : false or ["tag1","tag2","tag3"],
	 *		"page" : 0
	 *	}
	 */
	var doFileSearch = function(_options){

		// Make sure we have actual values
		options.context = _options.context || "myfiles";
		options.search = _options.search || "*";
		options.tag = _options.tag || false;
		options.site = _options.site || false;

		// Set the title of the file list
		$(contentmediaListTitle).html($.Template.render(contentmediaListTitleTemplate, options));

		var url = "";

		// Check if there is a site defined, if so we need to change the url to all files
		if(options.site.length > 0){
			url = searchURLmap.allfiles;
		}else {
			url = searchURLmap[options.context];
			
			if(options.context === "myfiles"){
				$(contentmediaContextFilterMyfiles).addClass(contentmediaSelectedItemClass);
			}
		}
		
		var usedIn = [];
		if(options.site[0]){
			usedIn = options.site[0].path;
		}
		
		// Until search service is fixed we attach a star to the options
		if (options.search !== "*") {
			options.search = options.search + "*";
		}
		
		// Request the file data 
		$.ajax({
			url: url,
			data: {
				"search" : options.search,
				//"type" : type,
				"page" : pageCurrent,
				"items" : pageSize,
				"sakai:tags" : options.tag,
				"usedin" : usedIn
			},
			cache: false,
			success: function(data){
				doFileRender($.evalJSON(data));
			},
			error: function(status){
				alert("An error has occured");
			}
		});
	};

	/**
	 * Will be called when the pager is being clicked.
	 * This will initiate a new search query and rerender
	 * the current files
	 * @param {Object} clickedPage
	 */
	var doPaging = function(clickedPage){
		pageCurrent = clickedPage - 1;
		doFileSearch(options);
	};

	/**
	 * Add a certain tag to the tag.options array
	 * @param {String} tag Tag that needs to be added to the array
	 */
	var addTagFilter = function(tag){
		if($.inArray(tag, options.tag) === -1){
			
			// Check if the option.tag is equal to false
			// because then we need to create an array.
			if(options.tag.length === 0){
				options.tag = [];
			}
			
			// Add the tag to the array
			options.tag.push(tag);
		}
	};

	/**
	 * Remove a tag from the tag.options
	 * @param {String} tag Tag that needs to be removed from the array
	 */
	var removeTagFilter = function(tag){

		// Remove the tag from the array
		for (var i = 0; i < options.tag.length; i++){
			if(options.tag[i] === tag){
				options.tag.splice(i, 1);
			}
		}
		
		// If there are no elements in the array, set
		// the value to false
		if(options.tag.length === 0){
			options.tag = [];
		}
	};

	/**
	 * Set the context filter to a specific term
	 * @param {String} term The term that needs to be searched
	 */
	var setContextFilter = function(term){
		
		// Set the value of the context filter to the term passed by the function
		options.context = term;
	};
	
	/**
	 * Set the site filter for the site
	 * @param {String} site The site that needs to be set
	 */
	var setSiteFilter = function(sitepath, sitename){
		
		// Set the site object to an empty array
		options.site = [];
		
		// Construct the site object with a path and name
		var site = {
			path : sitepath,
			name : sitename 
		};
		
		// Set the site filter
		options.site.push(site);
	};

	/**
	 * Remove the context filter
	 */
	var removeContextFilter = function(){

		// Set the value of the context filter to an empty string
		options.context = "";
		
		// Remove the selected status of the current selected context and site
		$(contentmediaContextFilter + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
		//$(contentmediaAccordionListSite + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
	};
	
	/**
	 * Remove the site filter
	 */
	var removeSiteFilter = function(){

		// Set the value of the site filter to an empty array
		options.site = [];
		
		// Remove the selected status of the current selected context and site
		//$(contentmediaContextFilter + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
		$(contentmediaAccordionListSite + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
	};
	
	/**
	 * Remove the context site filter
	 */
	var removeContextSiteFilter = function(){
		
		removeContextFilter();
		removeSiteFilter();
	};
	
	/**
	 * Enable or disable the edit and delete link
	 * These links need to be disabled when
	 *  - there are no files selected
	 *  - as soon as the selected files contain a file where you are no maintainer on
	 */
	var enableDisableEditDelete = function(){
		if(selectedFiles.maintainer === true){
			$(contentmediaActionsEdit).removeClass(contentmediaDisabledClass);
			$(contentmediaActionsRemove).removeClass(contentmediaDisabledClass);
		}else{
			if(!$(contentmediaActionsEdit).hasClass(contentmediaDisabledClass)){
				$(contentmediaActionsEdit).addClass(contentmediaDisabledClass);
				$(contentmediaActionsRemove).addClass(contentmediaDisabledClass);
			}
		}
	};

	/**
	 * Run over all the files in the selected files and check if there is 
	 */
	var updateMaintainerSelectedFiles = function(){
		
		selectedFiles.maintainer = false;
		
		// Only run over the array if there are any files in it
		// otherwise the user can not edit or remove the files
		if(selectedFiles.items.length > 0){
			for(var i = 0; i <= selectedFiles.items.length; i++){
				if(i === selectedFiles.items.length){
					selectedFiles.maintainer = true;
					break;
				}
				if(selectedFiles.items[i].maintainer === false){
					break;
				}
			}
		}
		
		enableDisableEditDelete();
		
		initialiseDragDrop();
	};
	
	/**
	 * Add a file to the selected files
	 * @param {Integer} index The index of the selected file
	 */
	var addToSelectedFiles = function(index){

		// Add the file to the selected files array
		selectedFiles.items.push(globaldata.results[index]);
		
		updateMaintainerSelectedFiles();
	};
	
	/**
	 * Remove a file from the selected files
	 * @param {Object} index The index of the file that needs to removed from the list
	 */
	var removeFromSelectedFiles = function(index){
		
		// Run across files in the selected files array
		// and remove the file where the URL is the same as the globaldata index file
		// (the URL is the only unique thing)
		for(var i = 0; i < selectedFiles.items.length; i++){
			if(selectedFiles.items[i].URL === globaldata.results[index].URL){
				selectedFiles.items.splice(i, 1);
				break;
			}
		}
		
		updateMaintainerSelectedFiles();
	};
	
	/**
	 * Enable/disable the buttons used to move sites in the dialog
	 */
	var enableDisableMoveButtons = function(){
		if($(contentmediaDialogAssociationsSelectAll + " :selected").length > 0){
			$(contentmediaDialogAssociationsMoveSelected).removeClass(contentmediaDisabledClass);
		}else{
			$(contentmediaDialogAssociationsMoveSelected).addClass(contentmediaDisabledClass);
		}
		
		if($(contentmediaDialogAssociationsSelectSelected + " :selected").length > 0){
			$(contentmediaDialogAssociationsMoveAll).removeClass(contentmediaDisabledClass);
		}else{
			$(contentmediaDialogAssociationsMoveAll).addClass(contentmediaDisabledClass);
		}
	};
	
	/**
	 * Before we show the dialog, we need to parse the data
	 * @param {Object} hash The jqModal object, we need the to show it on the end of the function
	 */
	var renderEdit = function(hash){
		
		// Enable/disable the move buttons
		enableDisableMoveButtons();
		
		// Finally show the jqModal pop-up
		hash.w.show();
	};
	
	/**
	 * Before we show the dialog, we need to parse the data
	 * @param {Object} hash The jqModal object, we need the to show it on the end of the function
	 */
	var renderRemove = function(hash){
		
		// Render the template with the selected files
		$.Template.render(contentmediaDialogRemoveListTemplate, selectedFiles, $(contentmediaDialogRemoveList));
		
		// Finally show the jqModal pop-up
		hash.w.show();
	};
	
	/**
	 * Set the view for listing the files
	 * @param {Object} view
	 */
	var setView = function(view){
		
		// Set the class name
		var className = contentmediaViewClass + "_" + view;
		
		// Check if the files container already has that class
		if(!$(contentmediaFilesContainer).hasClass(className)){
			
			// If not, remove all classes
			$(contentmediaFilesContainer).removeClass();
		
			// Add the new class
			$(contentmediaFilesContainer).addClass(className);
		}
	};
	

	////////////////////
	// Event Handlers //
	////////////////////

	/**
	 * This will select / deselect files when clicked
	 */
	$("." + contentmediaFileClass).live("click", function(ev){

		// Get the index of the file
		var splitId = this.id.split("_");
		var index = parseInt(splitId[splitId.length -1], 10);

		if ($(this).hasClass(contentmediaFileSelectedClass)){
			$(this).removeClass(contentmediaFileSelectedClass);

			// Remove the file from selected files
			removeFromSelectedFiles(index);
		} else {
			$(this).addClass(contentmediaFileSelectedClass);

			// Add file to selected files
			addToSelectedFiles(index);

			// Initialise the dragging and dropping of files
			initialiseDragDrop();
		}
	});

	/**
	 * Open a file in a new window/tab when you doubleclicked on it
	 * @param {Object} ev
	 */
	$("." + contentmediaFileClass).live("dblclick", function(ev){
		var newWindow = window.open($.trim($("." + contentmediaHiddenClass, this).text()), '_blank');
		newWindow.focus();
		return false;
	});
	
	/**
	 * Bind the contenmediaContextFilter
	 */
	$(contentmediaContextFilter + " a").live("click", function(){

		// Remove the context/site filter
		removeContextSiteFilter();

		// Add a class to the current context you clicked on
		$(this).addClass(contentmediaSelectedItemClass);

		// Set the context option on the options object
		setContextFilter($("." + contentmediaHiddenClass, this).text());

		// Perform a search for files
		doFileSearch(options);
	});

	/**
	 * Bind the actions edit button
	 */
	$(contentmediaActionsEdit).live("click", function(){

		// Only do something if you have permissions on all the files
		if(selectedFiles.maintainer){
			$(contentmediaDialogEdit).jqmShow();
		}
	});

	/**
	 * Bind the actions remove button
	 */
	$(contentmediaActionsRemove).live("click", function(){

		// Only do something if you have permissions on all the files
		if(selectedFiles.maintainer){
			$(contentmediaDialogRemove).jqmShow();
		}
	});
	
	/**
	 * Bind the actions list view button
	 */
	$(contentmediaActionsViewList).live("click", function(){

		// Set to list view
		setView("list");
	});
	
	/**
	 * Bind the actions thumbnail view button
	 */
	$(contentmediaActionsViewThumbnail).live("click", function(){

		// Set to thumbnail view
		setView("thumbnail");
	});
	
	/**
	 * Bind actions to the uploader button
	 */
	$(contentmediaUploaderTrigger).live("click", function(){
		
		// Show the uploader dialog
		$(contentmediaDialogUploader).jqmShow();
	});

	/**
	 * Remove the search filter and fetch the files
	 */
	$("#contentmedia_remove_filter_search").live("click", function(){
		
		// Set the search option to an asterix
		options.search = "*";
		
		// Fetch the files without the search filter
		doFileSearch(options);
	});

	/**
	 * Remove the tag filter(s) and fetch the files
	 */
	$("#contentmedia_remove_filter_tag").live("click", function(){
		
		// Set the tag option to an empty array
		options.tag = [];

		// Remove the selected status of all the tags
		$("#contentmedia_accordion_list_tag .contentmedia_accordion_list ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);

		// Fetch the files without the tags filter
		doFileSearch(options);
	});
	
	/**
	 * Remove the context filter and fetch the files
	 */
	$("#contentmedia_remove_filter_context").live("click", function(){

		// Remove the context/site filter
		removeContextSiteFilter();

		// Fetch the files without the context/search filter
		doFileSearch(options);
	});

	/**
	 * Add or remove a certain tag to the general tag filter
	 */
	$("#contentmedia_accordion_list_tag .contentmedia_accordion_list a").live("click", function(){
		if ($(this).hasClass(contentmediaSelectedItemClass)){
			$(this).removeClass(contentmediaSelectedItemClass);

			// Remove the tag from the main tag filter
			removeTagFilter($(this.firstChild).text());
		}else{
			$(this).addClass(contentmediaSelectedItemClass);
			
			// Add the tag to the main tag filter
			addTagFilter($(this.firstChild).text());
		}
	
		// Fetch the files with the added or removed tag
		doFileSearch(options);
	});

	/**
	 * Set or remove the context filter
	 */
	$("#contentmedia_accordion_list_site a").live("click", function(){
		if ($(this).hasClass(contentmediaSelectedItemClass)){

			// Remove the context/site filter
			removeContextSiteFilter();
		}else{

			// Remove the context/site filter
			removeContextSiteFilter();

			// Add the selected class to the site you selected
			$(this).addClass(contentmediaSelectedItemClass);

			// Set the site filter
			var allText = $(this).text();
			var pathText = $("." + contentmediaHiddenClass, this).text();
			setSiteFilter(pathText, allText.replace(pathText, ""));
		}

		// Fetch the files with or without a context filter
		doFileSearch(options);
	});
	
	/**
	 * Show the pop up when the user goes over a file
	 */
	$("." + contentmediaViewThumbnailClass + " ." + contentmediaFileClass).live("mouseover", function(){

		// Get the id of the pop up that you want to see
		var popupId = this.id.replace("contentmedia_filename_", "contentmedia_fileinfo_");
		var containerId = this.id.replace("contentmedia_fileinfo_", "contentmedia_filename_");
		
		// Change the position of the pop up
		//if(this.offsetTop - 80 < 0){
		//	$("#" + popupId).css("bottom", 0);
		//}else{
		//	$("#" + popupId).css("bottom", this.offsetTop);
		//}
		$("#" + popupId).css("left", this.offsetLeft);
		$("#" + popupId).css("top", this.offsetTop + 102);
		$("#" + popupId).css("border-left", "1px solid #ddd");
		$("#" + popupId).css("border-right", "1px solid #ddd");
		$("#" + popupId).css("border-bottom", "1px solid #ddd");
		$("#" + containerId).css("border-left", "1px solid #ddd");
		$("#" + containerId).css("border-right", "1px solid #ddd");
		$("#" + containerId).css("border-top", "1px solid #ddd");
		
		// Show the pop up
		$("#" + popupId).css("display","block");
	});
	
	/**
	 * Hide the pop up when the user goes out of a file
	 */
	$("." + contentmediaViewThumbnailClass + " ." + contentmediaFileClass).live("mouseout", function(){

		// Get the id of the pop up that you want to hide
		var popupId = this.id.replace("contentmedia_filename_", "contentmedia_fileinfo_");
		var containerId = this.id.replace("contentmedia_fileinfo_", "contentmedia_filename_");
		
		$("#" + popupId).css("border-left", "1px solid #fff");
		$("#" + popupId).css("border-right", "1px solid #fff");
		$("#" + popupId).css("border-bottom", "1px solid #fff");
		$("#" + containerId).css("border-left", "1px solid #fff");
		$("#" + containerId).css("border-right", "1px solid #fff");
		$("#" + containerId).css("border-top", "1px solid #fff");

		
		// Hide the pop up
		$("#" + popupId).css("display","none");
	});

	/**
	 * When the search input gets focus from the cursor, add the
	 * selected class and empty the input box
	 */
	$(contentmediaSearch + " input").focus(function(){
		if (!$(this).hasClass("selected")){
			$(this).addClass("selected");
			
			// Empty the input box
			$(this).val("");
		}
	});

	/**
	 * Hide/show the permission tab
	 */
	$(contentmediaDialogPermissionsTrigger).live("click", function(){
		$(contentmediaDialogAssociations).hide();
		$(contentmediaDialogPermissions).show();
	});

	/**
	 * Hide/show the associations tab
	 */
	$(contentmediaDialogAssociationsTrigger).live("click", function(){
		$(contentmediaDialogPermissions).hide();
		$(contentmediaDialogAssociations).show();
	});
	
	/**
	 * Enable/disable the buttons when you change your selection
	 */
	$(contentmediaDialogAssociationsSelectAll).change(function(){
		enableDisableMoveButtons();
	});
	
	/**
	 * Enable/disable the buttons when you change your selection
	 */
	$(contentmediaDialogAssociationsSelectSelected).change(function(){
		enableDisableMoveButtons();
	});
	
	/**
	 * Button that moves the files from the all box to the selected box
	 * when you click it
	 */
	$(contentmediaDialogAssociationsMoveSelected).live("click", function(){
		
		var sitesArray = [];
		
		$(contentmediaDialogAssociationsSelectAll + " :selected").each(function(i, selected){
			$(contentmediaDialogAssociationsSelectSelected).append(selected);
			sitesArray.push(selected.value);
		});

		enableDisableMoveButtons();

		sortOptions(contentmediaDialogAssociationsSelectSelected);
		
		var movedFiles = {};
		movedFiles.kind = "site";
		// Deep clone the array
		movedFiles.dropped = sitesArray;
		
		sendTagSitePost(movedFiles, null);
	
	});
	
	/**
	 * Move the files from the selected box to the all box
	 */
	$(contentmediaDialogAssociationsMoveAll).live("click", function(){
		$(contentmediaDialogAssociationsSelectSelected + " :selected").each(function(i, selected){
			$(contentmediaDialogAssociationsSelectAll).append(selected);
		});
		enableDisableMoveButtons();

		sortOptions(contentmediaDialogAssociationsSelectAll);
	});

	/**
	 * When the user confirms to delete the selected files
	 */
	$(contentmediaDialogRemoveConfirm).live("click", function(){
		
		// We send a POST request with a delete operation and in the applyTo we
		// supply an array with the URLs of the files that need to be deleted
		$.ajax({
			data: {
				"resources" : doSelectedFilesURLToArray()
			},
			type: "POST",
			url: "/system/batch/delete",
			cache: false,
			success: function(data){
				
				// Hide the dialog if the delete was succesful
				$(contentmediaDialogRemove).jqmHide();

				// If the post was successful, we redo the search
				doFileSearch(options);
			},
			error: function(status){
				alert("An error has while deleting the files occured");
			}
		});
	});


	///////////////////////
	// Initial functions //
	/////////////////////// 

	/**
	 * Initialise the search box
	 */
	var initialiseSearch = function(){
		// Catch the search for files
		$(contentmediaSearch + " form").submit(function(){

			// Get the value from the input box
			var searchvalue = $(contentmediaSearch + " form input").val();
			
			// Check if there is anything in the search box
			if(searchvalue.replace(/ /g,'').length > 0){
				
				// Set the search option to the value the person entered
				options.search = searchvalue;
				
				// Fetch the list of files
				doFileSearch(options);
			}else {
				
				// We check if there is a current search keyword or not
				// if there is one, we remove the search filter, otherwise we do nothing
				if(options.search){

					// Set the search option to false
					options.search = false;
					
					// Fetch the files without the search filter
					doFileSearch(options);
				}
			}
			
			return false;
		});
		
		/**
		 * Bind the search button
		 */
		$(contentmediaSearchButton).live("click", function(){
			
			// Execute the submit event on the parent form
			$(this).parents().filter("form").trigger("submit");
		});
		
	};
	
	/**
	 * This event is fired at the end of an upload cycle when all the files have either been uploaded, 
	 * failed to upload, the user stopped the upload cycle, 
	 * or there was an unrecoverable error in the upload process and the upload cycle was stopped.
	 * @param {Array} fileList The list of File objects that "completed" (either succeeded or failed), in this upload. 
	 */
	var uploadCompleteListener = function(fileList){
		doFileSearch(options);
	};
	
	/**
	 * Set the various settings for the fluid uploader component
	 */
	var initialiseUploader = function(){
		
		// Show the Uploader's markup immediately, since we're not using progressive enhancement.
		$(".fl-progEnhance-basic").hide();
		$(".fl-progEnhance-enhanced").show();
		
		var myUpload = fluid.progressiveEnhanceableUploader(".flc-uploader", ".fl-progEnhance-basic", {
			uploadManager: {
				type: "fluid.swfUploadManager",
	
				options: {
					// Set the uploadURL to the URL for posting files to your server.
					uploadURL: getServerUrl(Config.URL.UPLOAD_URL),
					
					// This option points to the location of the SWFUpload Flash object that ships with Fluid Infusion.
					flashURL: "/dev/_lib/Fluid/fluid-components/swfupload/swfupload.swf"
					
					// Hide the postparams because we do not need to create a link (for now) -- if we upload files into sites, we do
					/*var linkUrl = "/sites/test/_files";
					var siteUrl = "/sites/test";
					postParams: {
						"link" : linkUrl,
						"site" : siteUrl
					}*/
				}
			},
			decorators: [{
				type: "fluid.swfUploadSetupDecorator",
				options: {
					 // This option points to the location of the Browse Files button used with Flash 10 clients.
					flashButtonImageURL: "/dev/_images/uploader/browse.png"
				}
			}],
			listeners: {
				//afterFileQueued: myQueueListenerFunc
				afterUploadComplete : uploadCompleteListener
			}

		});
		
		// Set the settings for when the users uses the single file uploader (without flash)
		/*$(".fl-progEnhance-basic").submit(function() {
			if($(contentmediaUploaderBasicName).val().length > 3){
				basicUploadFilename = $(contentmediaUploaderBasicName).val();
				$(contentmediaUploaderBasicName).attr("name", basicUploadFilename);
			}
			
			return AIM.submit(this, {'onStart' : startUpload, 'onComplete' : completeUpload});
		});*/
	};
	
	/**
	 * Initialise the modal dialogs
	 */
	var initialiseModalDialogs = function(){
		/*
		 * Bring up de modal dialog that contains permissions and site associations.
		 * Before we show it on the screen, we'll render the list of sites/current permissions
		 */
		$(contentmediaDialogEdit).jqm({
			modal: true,
			overlay: 20,
			toTop: true,
			onShow: renderEdit
		}); 
		
		$(contentmediaDialogEdit).jqmAddClose('.jqmClose');
		
		
		/*
		 * Bring up de modal dialog that contains a confirmation for removing the files
		 * Before we show it on the screen, we'll render the list of files/folders that needs to be deleted
		 */
		$(contentmediaDialogRemove).jqm({
			modal: true,
			overlay: 20,
			toTop: true,
			onShow: renderRemove
		}); 
		
		$(contentmediaDialogRemove).jqmAddClose('.jqmClose');
		$(contentmediaDialogRemove).jqmAddClose(contentmediaDialogRemoveDecline);
		
		$(contentmediaDialogUploader).jqm({
			modal: true,
			overlay: 20,
			toTop: true
		});
	};
	
	/*
	var recursiveTree = function(treeData){
		for (var i in treeData) {
		
			// We need to add the hasOwnProperty to pass to JSLint and it is also a security issue
			if (treeData.hasOwnProperty(i)) {

				if(treeData[i]["jcr:primaryType"] === "sling:Folder"){
					
					globalTree.push({
						attributes: {
							id: $.URLEncode(i)
						},
						data: i,
						children : recursiveTree(treeData[i])
					});
				}
			}
		}
	};*/
	
	/**
	 * Parse the data from the json request
	 * @param {Object} treeData
	 */
	/*
	var parseTreeData = function(treeData){
		globalTree = [];
		
		recursiveTree(treeData);
		
		console.log(globalTree);
		
		$(contentmediaFolders).tree({
            data: {
                type: "json",
                json: globalTree
			}
		});
		
		for(var i = 0; i < treeData.results.length; i++){
			if(treeData.results[i]["jcr:primaryType"] === "sling:folder"){
				console.log(treeData.results[i]); 
				//globalTree.push({
					
				//});
			}
		}
	};*/
	
	/**
	 * Initialise the tree for folders
	 * The plug-in we use is called jsTree
	 * You can find more information on http://www.jstree.com/
	 */
    /*var initialiseTree = function(){

		$.ajax({
			url: options.context + ".infinity.json",
			//url: searchURL,
			//data: {
			//	path: options.context,
			//	type: "sling:Folder"
			//},
			cache: false,
			success: function(data){
				parseTreeData($.evalJSON(data));
				//doFileRender($.evalJSON(data));
			},
			error: function(status){
				alert("An error has occured");
			}
		});
		
		
		
        $(contentmediaFolders).tree({
            data: {
                type: "json",
                json: [{
                    attributes: {
                        id: "pjson_1"
                    },
                    state: "open",
                    data: "Root node 1",
                    children: [{
                        attributes: {
                            id: "pjson_2"
                        },
                        data: {
                            title: "Custom icon"
                        }
                    }, {
                        attributes: {
                            id: "pjson_3"
                        },
                        data: "Child node 2"
                    }, {
                        attributes: {
                            id: "pjson_4"
                        },
                        data: "Some other child node"
                    }]
                }, {
                    attributes: {
                        id: "pjson_5"
                    },
                    data: "Root node 2"
                }]
            }
        });
    };*/
	
	/**
	 * Parse the querystring from the browser
	 */
	var parseQueryString = function(){
		var querystring = new Querystring();
		
		// Check if the querystring contains the site id of a site
		if(querystring.contains("siteid")){
			var siteid = querystring.get("siteid");
			
			$.ajax({
				url: Config.URL.SITE_CONFIGFOLDER.replace("__SITEID__", siteid) + ".json",
				cache: false,
				success: function(data){
					var parsedData = $.evalJSON(data);
					setSiteFilter(Config.URL.SITE_FILES_URL.replace("__SITEID__", siteid), parsedData.name);
					
					// Fetch the initial list of files
					doFileSearch(options);
				},
				error: function(status){
					//alert("An error has occured");
				}
			});
		}else{
			// Fetch the initial list of files
			doFileSearch(options);
		}
	};
	
	/**
	 * Load sites for the current user
	 * @param {Object} sites Object response from JSON
	 */
	var loadSites = function(sites){
		var jsonSites = {};
		jsonSites.items = sites;

		// Render the template with the selected files
		$.Template.render(contentmediaAccordionListSiteTemplate, jsonSites, $(contentmediaAccordionListSite));
	};
	
	/**
	 * Initialise the sites tab
	 */
	var initialiseSites = function(){
		$.ajax({
			url: Config.URL.SITES_SERVICE,
			cache: false,
			success: function(data){
				loadSites($.evalJSON(data));
			}
		});
	};

	/**
	 * Initialise the contentmedia
	 * @param {Object} _options  identifier for the current context, initial search
	 *   query and initial tag filter
	 *   {
	 *		"context" : "All Files" or "/sites/siteid",
	 *		"search" : false or "searchquery",
	 *		"tag" : false or ["tag1","tag2","tag3"],
	 * 		"page" : 0
	 *	}
	 */
	sakai.contentmedia.initialise = function(_options){
		// Save options object
		options = _options;

		// Initialize the selected files object
		resetSelectedFiles();
		
		// Disable the edit and delete link on startup
		updateMaintainerSelectedFiles();

		// Show the lightbox
		$(contentmediaContent).show();
		
		// Set the view to thumbnails
		setView("thumbnail");
		
		// Parse the querystring in the browser
		parseQueryString();
		
		// Check if we have the enableFolder function on or not
		if (!enableFolder) {

			// Hide the contentmedia folders tab if the enableFolder is false
			// We have to use the remove event, otherwise you'll see a big gap on the bottom
			$(contentmediaFolders).remove();
			$(contentmediaFoldersTrigger).remove();
		}else{
			
			// Initialise the tree for folder
			//initialiseTree();
		}
		
		// Initialise the uploader
		initialiseUploader();
		
		// Accordion functionality
		$(contentmediaAccordion).accordion({
			//fillSpace: true
			autoHeight: false
		});

		// Initialise search
		initialiseSearch();
		
		// Initialise the modal dialogs
		initialiseModalDialogs();
		
		// Initialise the sites tab
		initialiseSites();
	};
	
	sakai.contentmedia.initialise({
		"context" : "myfiles",
		"search" : false,
		"tag" : [],
		"site" : []
	});
};

sdata.container.registerForLoad("sakai.contentmedia");