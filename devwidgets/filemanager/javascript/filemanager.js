/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $, sdata, Config, fluid, AIM, window, doPaging */

var sakai = sakai || {};

sakai.filemanager = function(tuid, placement, showSettings){

	////////////////////
	// Help variables //
	////////////////////

	var pageSize = 15;				// How many items you want to see on 1 page
	var searchURL = "/devwidgets/filemanager/json/files.json";

	var rootel = $("#" + tuid);
	var options = {};				// Contains the different search options
	var globaldata = {};			// Contains the data of the files for the current page
	var selectedFiles = {};			// Object with the files that are currently selected
	var currentpage = 0;			// The page you are currently on
	var basicUploadFilename = "";	// The filename when you use the basic upload

	/////////////////////////////
	// Configuration variables //
	/////////////////////////////
	
	var jqPagerClass = ".jq_pager";
	
	var filemanagerId = "#filemanager";
	
	var filemanagerClose = filemanagerId + "_close";
	var filemanagerFilesContainer = filemanagerId + "_files_container";
	var filemanagerOverlay = filemanagerId + "_overlay";
	var filemanagerUploaderBasicSuccessful = "#filemanager_uploader_basic_successful";
	
	// Class
	var filemanagerAccordionListClass = "filemanager_accordion_list";
	var filemanagerDisabledClass = "filemanager_disabled";
	var filemanagerDropActiveClass = "filmanager_drop_active";
	var filemanagerDropHoverClass = "filmanager_drop_hover";
	var filemanagerFileClass = "filemanager_file";
	var filemanagerFileSelectedClass = "filemanager_file_selected";
	var filemanagerSelectedItemClass = "filemanager_selecteditem";
	
	// Template
	var filemanagerDragTooltipTemplate = "filemanager_drag_tooltip_template";
	var filemanagerDropMessageTemplate = "filemanager_drop_message_template";
	var filemanagerDialogRemoveListTemplate = "filemanager_dialog_remove_list_template";
	var filemanagerFilesContainerTemplate = "filemanager_files_container_template";
	var filemanagerListTitleTemplate = "filemanager_list_title_template";
	
	var filemanagerUploaderBasicSuccessfulTemplate = "filemanager_uploader_basic_successful_template";

	// Accordion
	var filemanagerAccordion = filemanagerId + "_accordion";
	var filemanagerAccordionList = filemanagerAccordion + "_list";
	var filemanagerAccordionListSite = filemanagerAccordionList  + "_site";
	var filemanagerAccordionListSiteBookmarks = filemanagerAccordionListSite + "_bookmarks";
	var filemanagerAccordionListTag =  filemanagerAccordionList  + "_tag";
	
	// Actions
	var filemanagerActionsEdit = filemanagerId + "_actions_edit";
	var filemanagerActionsRemove = filemanagerId + "_actions_remove";
	
	// Dialogs
	var filemanagerDialog = filemanagerId + "_dialog";
	var filemanagerDialogAssociations = filemanagerDialog + "_associations";
	var filemanagerDialogAssociationsMove = filemanagerDialogAssociations + "_move";
	var filemanagerDialogAssociationsMoveAll = filemanagerDialogAssociationsMove + "_all";
	var filemanagerDialogAssociationsMoveSelected = filemanagerDialogAssociationsMove + "_selected";
	var filemanagerDialogAssociationsSelect = filemanagerDialogAssociations + "_select";
	var filemanagerDialogAssociationsSelectAll = filemanagerDialogAssociationsSelect + "_all";
	var filemanagerDialogAssociationsSelectSelected = filemanagerDialogAssociationsSelect + "_selected";
	var filemanagerDialogAssociationsTrigger = filemanagerDialogAssociations + "_trigger";
	var filemanagerDialogEdit = filemanagerDialog + "_edit";
	var filemanagerDialogPermissions = filemanagerDialog + "_permissions";
	var filemanagerDialogPermissionsTrigger = filemanagerDialogPermissions + "_trigger";
	var filemanagerDialogRemove = filemanagerDialog + "_remove";
	var filemanagerDialogRemoveConfirm = filemanagerDialogRemove + "_confirm";
	var filemanagerDialogRemoveDecline = filemanagerDialogRemove + "_decline";
	var filemanagerDialogRemoveList = filemanagerDialogRemove + "_list";
	
	// Drag Drop
	var filemanagerDragTooltipClass = "filemanager_drag_tooltip";
	var filemanagerDrop = filemanagerId + "_drop";
	var filemanagerDropMessage = filemanagerDrop + "_message";
	
	// List
	var filemanagerListTitle = filemanagerId + "_list_title";
	
	// Pop up
	var filemanagerPopupContent = filemanagerId + "_popup_content";
	var filemanagerPopupContentMiddle = filemanagerPopupContent + "_middle";
	
	// Search
	var filemanagerSearch = filemanagerId + "_search";
	
	// Uploader
	var filemanagerUploader = filemanagerId + "_uploader";
	var filemanagerUploaderBasic = filemanagerUploader + "_basic";
	var filemanagerUploaderBasicName = filemanagerUploaderBasic + "_name";

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
	 * Make an array containing the URLs of the selected files
	 * @return {Array} Array with the URLs of the selected files
	 */
	var doSelectedFilesURLToArray = function(){
		var filesToDeleteArray = [];
		$.each(selectedFiles.items, function(i){
			filesToDeleteArray.push(selectedFiles.items[i].URL);
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
			$(filemanagerUploaderBasicSuccessful, rootel).html($.Template.render(filemanagerUploaderBasicSuccessfulTemplate, jsonT));
		}
	};
	
	/** TODO remove */
	/*var myQueueListenerFunc = function(file){
		alert(file);
	};*/
	
	/*
	var doIdProcessing = function(){
		
		// Check if the results object exists in the globaldata 
		// object and if there are any items in it
		if(globaldata.results && globaldata.results.length > 0){
			for(var i = 0; i < globaldata.results.length; i++){
				
				// Encode the url and replace the dots with underscores
				// (an HTML id should not contain dots, spaces or /)
				globaldata.results[i].id = $.URLEncode(globaldata.results[i].URL).replace(".", "_");
			}
		}
	};*/
	
	/**
	 * Show a message when you drop files/folders on a tag/site
	 * @param {Object} movedFiles JSON object with information about the files and where it is dropped
	 * @param {String} Id of the div where you want to show the message in
	 */
	var showDroppedMessage = function(movedFiles, showDroppedMessageIn){
		// Render the message and add animation to show the message
		$(filemanagerDropMessage).hide();
		$.Template.render(filemanagerDropMessageTemplate, movedFiles, $(filemanagerDropMessage));
		$(showDroppedMessageIn).append($(filemanagerDropMessage));
		$(filemanagerDropMessage).show();
		$(filemanagerDropMessage).fadeOut(2000);
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
		
		if(movedFiles.kind === "site"){
			confirmation = confirm("Should the members of the sites you want to add be a maintainer?");
		}
		
		for (var i = 0; i < selectedFiles.items.length; i++) {

			// Count how many ajax requests where successful
			var countAjax = selectedFiles.items.length;

			// Variable that will contain the POST data
			var postData = {};

			// We need to set the mixinTypes because some of the files are nt:file
			// otherwise they don't accept custom properties
			postData = {
				"jcr:mixinTypes": "sakai:propertiesmix"
			};

			// Check if it is a tag, site or something else to set the 
			// appropriate properties
			if(movedFiles.kind === "tag"){
				selectedFiles.items[i].tags.push(movedFiles.dropped);

				postData.tags = selectedFiles.items[i].tags;
				postData["tags@TypeHint"] = "string[]";

			}else{
				var tempArray = [];
				
				for(var k = 0; k < selectedFiles.items[i].usedIn.length; k++){
					tempArray.push(selectedFiles.items[i].usedIn[k].id);
				}
				
				tempArray = tempArray.concat(movedFiles.dropped);

				postData.sites = tempArray;
				postData["sites@TypeHint"] = "string[]";

			}
			
			postData["_charset_"] = "utf-8";
			
			$.ajax({
				type: "POST",
				data: postData,
				url: selectedFiles.items[i].URL,
				cache: false,
				success: function(data){
					countAjax--;
					
					// Show a message if the counter is 0 and if the showDroppedMessageIn is not null
					if (countAjax === 0 && showDroppedMessageIn) {
						showDroppedMessage(movedFiles, showDroppedMessageIn);
					}
				},
				error: function(xhr, textStatus, thrownError) {
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

		if(selectedFiles.maintainer){
			droppableElements = "."  + filemanagerAccordionListClass  + " a";
		}else{
			$("."  + filemanagerAccordionListClass  + " a").droppable('destroy');
			droppableElements = filemanagerAccordionListSiteBookmarks;
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
				if ($(filemanagerAccordionListTag).is(":visible")) {
				
					// The file/folder is dropped on a tag
					movedFiles.kind = "tag";
					movedFiles.dropped = [];
					movedFiles.dropped.push($("span", this).text());
					
					showDroppedMessageIn = filemanagerAccordionListTag;
					
					/** TODO Remove 
					$.ajax({
						data: {
							"tags": movedFiles.dropped,
							":applyTo" : doSelectedFilesURLToArray(),
							"_charset_":"utf-8"
						},
						type: "POST",
						url: "/",
						cache: false,
						success: function(data){
			
							// If the post was successful, we redo the search
							doFileSearch(options);
						},
						error: function(xhr, textStatus, thrownError) {
							alert("An error has occured");
						}
					});*/
				}
				else {

					// The file/folder is dropped on a site
					movedFiles.kind = "site";
					movedFiles.dropped = [];
					movedFiles.dropped.push($(this).text());
					
					showDroppedMessageIn = filemanagerAccordionListSite;
					
				}
				
				sendTagSitePost(movedFiles, showDroppedMessageIn);
			},
			activeClass: filemanagerDropActiveClass,
			hoverClass: filemanagerDropHoverClass,
			tolerance: 'pointer'
		});
	};
	
	/**
	 * Set up the jQuery UI draggable plug-in
	 */
	var initialiseDraggable = function(){
		$("." + filemanagerFileSelectedClass).draggable({
			containment: filemanagerPopupContentMiddle,
			cursor: 'move',
			cursorAt: { top: 5, left: -20 },
			helper: function(event) {
				
				return $('<div class="'+ filemanagerDragTooltipClass + '">Move ' + selectedFiles.items.length + ' files</div>');
				//$.Template.render(filemanagerDragTooltipTemplate, selectedFiles, filemanagerDragTooltip);
				//return $(filemanagerDragTooltip);
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
	 * screen. An example of the data model can be found in /devwidgets/filemanager/json/files.json
	 */
	var doFileRender = function(data){

		// Set the globaldata variable
		globaldata = data;

		// Render files
		$(filemanagerFilesContainer, rootel).html($.Template.render(filemanagerFilesContainerTemplate,data));
		
		// Render paging
		$(jqPagerClass, rootel).pager({
			pagenumber: currentpage + 1,
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
	 *		"context" : "All Files" or "/sites/siteid",
	 *		"search" : false or "searchquery",
	 *		"tag" : false or ["tag1","tag2","tag3"],
	 * 		"page" : 0
	 *	}
	 */
	var doFileSearch = function(_options){

		// Make sure we have actual values
		options.context = _options.context || "All Files";
		options.search = _options.search || "";
		options.tag = _options.tag || false;

		// Set the title of the file list
		$(filemanagerListTitle, rootel).html($.Template.render(filemanagerListTitleTemplate, options));

		// Construct the URL
		var tags = "";
		if (options.tag){
			for (var i = 0; i < options.tag.length; i++){
				tags += "&tag=" + options.tag[i];
			}
		}
		var url = searchURL + "?page=" + currentpage + "&items=" + pageSize + "&context=" + options.context + "&search=" + options.search + tags;

		// Request the file data 
		$.ajax({
			url: url,
			cache: false,
			success: function(data){
				doFileRender($.evalJSON(data));
			},
			error: function(xhr, textStatus, thrownError) {
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
		currentpage = clickedPage - 1;
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
			if(options.tag === false){
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
			options.tag = false;
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
	 * Remove the context filter
	 */
	var removeContextFilter = function(){

		// Set the value of the context filter to an empty string
		options.context = "";
		
		// Remove the selected status of the current selected context/site
		$(filemanagerAccordionListSite + " ." + filemanagerSelectedItemClass, rootel).removeClass(filemanagerSelectedItemClass);
	};
	
	/**
	 * Enable or disable the edit and delete link
	 * These links need to be disabled when
	 *  - there are no files selected
	 *  - as soon as the selected files contain a file where you are no maintainer on
	 */
	var enableDisableEditDelete = function(){
		if(selectedFiles.maintainer === true){
			$(filemanagerActionsEdit, rootel).removeClass(filemanagerDisabledClass);
			$(filemanagerActionsRemove, rootel).removeClass(filemanagerDisabledClass);
		}else{
			if(!$(filemanagerActionsEdit, rootel).hasClass(filemanagerDisabledClass)){
				$(filemanagerActionsEdit, rootel).addClass(filemanagerDisabledClass);
				$(filemanagerActionsRemove, rootel).addClass(filemanagerDisabledClass);
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
		if($(filemanagerDialogAssociationsSelectAll + " :selected").length > 0){
			$(filemanagerDialogAssociationsMoveSelected).removeClass(filemanagerDisabledClass);
		}else{
			$(filemanagerDialogAssociationsMoveSelected).addClass(filemanagerDisabledClass);
		}
		
		if($(filemanagerDialogAssociationsSelectSelected + " :selected").length > 0){
			$(filemanagerDialogAssociationsMoveAll).removeClass(filemanagerDisabledClass);
		}else{
			$(filemanagerDialogAssociationsMoveAll).addClass(filemanagerDisabledClass);
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
		$.Template.render(filemanagerDialogRemoveListTemplate, selectedFiles, $(filemanagerDialogRemoveList));
		
		// Finally show the jqModal pop-up
		hash.w.show();
	};
	
	

	////////////////////
	// Event Handlers //
	////////////////////

	/**
	 * Top right hand close button
	 */
	$(filemanagerClose, rootel).live("click", function(ev){
		$(filemanagerOverlay, rootel).hide();
		$(filemanagerPopupContent, rootel).hide();
	});

	/**
	 * This will select / deselect files when clicked
	 */
	$("." + filemanagerFileClass, rootel).live("click", function(ev){

		// Get the index of the file
		var splitId = this.id.split("_");
		var index = parseInt(splitId[splitId.length -1], 10);

		if ($(this).hasClass(filemanagerFileSelectedClass)){
			$(this).removeClass(filemanagerFileSelectedClass);
			
			// Remove the file from selected files
			removeFromSelectedFiles(index);
		} else {
			$(this).addClass(filemanagerFileSelectedClass);

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
	$("." + filemanagerFileClass, rootel).live("dblclick", function(ev){
		var newWindow = window.open($(".filemanager_hidden", this).text().trim(), '_blank');
		newWindow.focus();
		return false;
	});
	
	
	/**
	 * Bind the actions edit button
	 */
	$(filemanagerActionsEdit, rootel).live("click", function(){

		// Only do something if you have permissions on all the files
		if(selectedFiles.maintainer){
			$(filemanagerDialogEdit, rootel).jqmShow();
		}
	});
	
	/**
	 * Bind the actions remove button
	 */
	$(filemanagerActionsRemove, rootel).live("click", function(){

		// Only do something if you have permissions on all the files
		if(selectedFiles.maintainer){
			$(filemanagerDialogRemove, rootel).jqmShow();
		}
	});

	/**
	 * Remove the search filter and fetch the files
	 */
	$("#filemanager_remove_filter_search", rootel).live("click", function(){
		
		// Set the search option to false
		options.search = false;
		
		// Fetch the files without the search filter
		doFileSearch(options);
	});

	/**
	 * Remove the tag filter(s) and fetch the files
	 */
	$("#filemanager_remove_filter_tag", rootel).live("click", function(){
		
		// Set the tag option to false
		options.tag = false;
		
		// Remove the selected status of all the tags
		$("#filemanager_accordion_list_tag .filemanager_accordion_list ." + filemanagerSelectedItemClass, rootel).removeClass(filemanagerSelectedItemClass);
		
		// Fetch the files without the tags filter
		doFileSearch(options);
	});
	
	/**
	 * Remove the context filter and fetch the files
	 */
	$("#filemanager_remove_filter_context", rootel).live("click", function(){

		// Remove the context filter
		removeContextFilter();
		
		// Select the "All Files"
		$("#filemanager_accordion_list_site_all", rootel).addClass(filemanagerSelectedItemClass);

		// Fetch the files without the context/search filter
		doFileSearch(options);
	});

	/**
	 * Add or remove a certain tag to the general tag filter
	 */
	$("#filemanager_accordion_list_tag .filemanager_accordion_list a", rootel).live("click", function(){
		if ($(this).hasClass(filemanagerSelectedItemClass)){
			$(this).removeClass(filemanagerSelectedItemClass);

			// Remove the tag from the main tag filter
			removeTagFilter($(this.firstChild).text());
		}else{
			$(this).addClass(filemanagerSelectedItemClass);
			
			// Add the tag to the main tag filter
			addTagFilter($(this.firstChild).text());
		}
	
		// Fetch the files with the added or removed tag
		doFileSearch(options);
	});

	/**
	 * Set or remove the context filter
	 */
	$("#filemanager_accordion_list_site a", rootel).live("click", function(){
		if ($(this).hasClass(filemanagerSelectedItemClass)){

			// Remove the context filter
			removeContextFilter();

			// Select the "All Files"
			$("#filemanager_accordion_list_site_all", rootel).addClass(filemanagerSelectedItemClass);
		}else{

			// Remove the context filter
			removeContextFilter();

			$(this).addClass(filemanagerSelectedItemClass);

			// Set the context filter
			setContextFilter(this.text);
		}

		// Fetch the files with or without a context filter
		doFileSearch(options);
	});
	
	/**
	 * Show the pop up when the user goes over a file
	 */
	$("." + filemanagerFileClass, rootel).live("mouseover", function(){

		// Get the id of the pop up that you want to see
		var popupId = this.id.replace("filemanager_filename_", "filemanager_fileinfo_");
		
		// Change the position of the pop up
		if(this.offsetTop - 80 < 0){
			$("#" + popupId).css("top", 0);
		}else{
			$("#" + popupId).css("top", this.offsetTop - 80);
		}
		$("#" + popupId).css("left", this.offsetLeft);
		
		// Show the pop up
		$("#" + popupId).show();
	});
	
	/**
	 * Hide the pop up when the user goes out of a file
	 */
	$("." + filemanagerFileClass, rootel).live("mouseout", function(){

		// Get the id of the pop up that you want to hide
		var popupId = this.id.replace("filemanager_filename_", "filemanager_fileinfo_");
		
		// Hide the pop up
		$("#" + popupId).hide();
	});

	/**
	 * When the search input gets focus from the cursor, add the
	 * selected class and empty the input box
	 */
	$(filemanagerSearch + " input", rootel).focus(function(){
		if (!$(this).hasClass("selected")){
			$(this).addClass("selected");
			
			// Empty the input box
			$(this).val("");
		}
	});
	
	/**
	 * Hide/show the permission tab
	 */
	$(filemanagerDialogPermissionsTrigger).live("click", function(){
		$(filemanagerDialogAssociations).hide();
		$(filemanagerDialogPermissions).show();
	});

	/**
	 * Hide/show the associations tab
	 */
	$(filemanagerDialogAssociationsTrigger).live("click", function(){
		$(filemanagerDialogPermissions).hide();
		$(filemanagerDialogAssociations).show();
	});
	
	/**
	 * Enable/disable the buttons when you change your selection
	 */
	$(filemanagerDialogAssociationsSelectAll).change(function(){
		enableDisableMoveButtons();
	});
	
	/**
	 * Enable/disable the buttons when you change your selection
	 */
	$(filemanagerDialogAssociationsSelectSelected).change(function(){
		enableDisableMoveButtons();
	});
	
	/**
	 * Button that moves the files from the all box to the selected box
	 * when you click it
	 */
	$(filemanagerDialogAssociationsMoveSelected).live("click", function(){
		
		var sitesArray = [];
		
		$(filemanagerDialogAssociationsSelectAll + " :selected").each(function(i, selected){
			$(filemanagerDialogAssociationsSelectSelected).append(selected);
			sitesArray.push(selected.value);
		});

		enableDisableMoveButtons();

		sortOptions(filemanagerDialogAssociationsSelectSelected);
		
		var movedFiles = {};
		movedFiles.kind = "site";
		// Deep clone the array
		movedFiles.dropped = sitesArray;
		
		sendTagSitePost(movedFiles, null);
	
	});
	
	/**
	 * Move the files from the selected box to the all box
	 */
	$(filemanagerDialogAssociationsMoveAll).live("click", function(){
		$(filemanagerDialogAssociationsSelectSelected + " :selected").each(function(i, selected){
			$(filemanagerDialogAssociationsSelectAll).append(selected);
		});
		enableDisableMoveButtons();

		sortOptions(filemanagerDialogAssociationsSelectAll);
	});

	/**
	 * When the user confirms to delete the selected files
	 */
	$(filemanagerDialogRemoveConfirm).live("click", function(){
		
		// We send a POST request with a delete operation and in the applyTo we
		// supply an array with the URLs of the files that need to be deleted
		$.ajax({
			data: {
				":operation" : "delete",
				":applyTo" : doSelectedFilesURLToArray(),
				"_charset_":"utf-8"
			},
			type: "POST",
			url: "/.json",
			cache: false,
			success: function(data){

				// If the post was successful, we redo the search
				doFileSearch(options);
			},
			error: function(xhr, textStatus, thrownError) {
				alert("An error has while deleting the files occured");
			}
		});
		
		/** TODO remove
		 * 
		 for(var i = 0; i < selectedFiles.items.length; i++){
			$.ajax({
				type: "DELETE",
				url: selectedFiles.items[i].URL,
				//url: "/sites/tests/_files/add.png",
				cache: false,
				success: function(data){
					alert(data);
				},
				error: function(xhr, textStatus, thrownError) {
					alert("An error has occured");
				}
			});
		}*/

	});


	///////////////////////
	// Initial functions //
	/////////////////////// 

	/**
	 * Initialise the search box
	 */
	var initialiseSearch = function(){
		// Catch the search for files
		$(filemanagerSearch + " form", rootel).submit(function(){
			
			// Get the value from the input box
			var searchvalue = $(filemanagerSearch + " form input", rootel).val();
			
			// Check if there is anything in the search box
			if(searchvalue.replace(/ /g,'').length > 0){
				options.search = searchvalue;
				
				// Fetch the list of files
				doFileSearch(options);
			}
			
			return false;
		});
	};
	
	/**
	 * Set the various settings for the fluid uploader component
	 */
	var initialiseUploader = function(){
		
		// Show the Uploader's markup immediately, since we're not using progressive enhancement.
		$(".fl-progEnhance-basic", rootel).hide();
		$(".fl-progEnhance-enhanced", rootel).show();
		
		var myUpload = fluid.progressiveEnhanceableUploader(".flc-uploader", ".fl-progEnhance-basic", {
			uploadManager: {
				type: "fluid.swfUploadManager",
	
				options: {
					// Set the uploadURL to the URL for posting files to your server.
					uploadURL: "http://localhost:8080/sites/tests/files",
					
					// This option points to the location of the SWFUpload Flash object that ships with Fluid Infusion.
					flashURL: "/dev/_lib/Fluid/fluid-components/swfupload/swfupload.swf",
					
					postParams: {
						name: "Kakejiku.gif"
					}
				}
			},
			decorators: [{
				type: "fluid.swfUploadSetupDecorator",
				options: {
					 // This option points to the location of the Browse Files button used with Flash 10 clients.
					flashButtonImageURL: "/dev/_lib/Fluid/fluid-components/images/uploader/browse.png"
				}
			}],
			listeners: {
				//afterFileQueued: myQueueListenerFunc
			}

		});
		
		// Set the settings for when the users uses the single file uploader (without flash)
		$(".fl-progEnhance-basic", rootel).submit(function() {
			if($(filemanagerUploaderBasicName, rootel).val().length > 3){
				basicUploadFilename = $(filemanagerUploaderBasicName, rootel).val();
				$(filemanagerUploaderBasicName, rootel).attr("name", basicUploadFilename);
			}
			
			return AIM.submit(this, {'onStart' : startUpload, 'onComplete' : completeUpload});
		});
	};
	
	/**
	 * Initialise the modal dialogs
	 */
	var initialiseModalDialogs = function(){
		/*
		 * Bring up de modal dialog that contains permissions and site associations.
		 * Before we show it on the screen, we'll render the list of sites/current permissions
		 */
		$(filemanagerDialogEdit).jqm({
			modal: true,
			overlay: 20,
			toTop: true,
			onShow: renderEdit
		}); 
		
		$(filemanagerDialogEdit, rootel).jqmAddClose('.jqmClose');
		
		
		/*
		 * Bring up de modal dialog that contains a confirmation for removing the files
		 * Before we show it on the screen, we'll render the list of files/folders that needs to be deleted
		 */
		$(filemanagerDialogRemove).jqm({
			modal: true,
			overlay: 20,
			toTop: true,
			onShow: renderRemove
		}); 
		
		$(filemanagerDialogRemove, rootel).jqmAddClose('.jqmClose');
		$(filemanagerDialogRemove, rootel).jqmAddClose(filemanagerDialogRemoveDecline);
	};

	/**
	 * Initialise the filemanager
	 * @param {Object} _options  identifier for the current context, initial search
	 *   query and initial tag filter
	 *   {
	 *		"context" : "All Files" or "/sites/siteid",
	 *		"search" : false or "searchquery",
	 *		"tag" : false or ["tag1","tag2","tag3"],
	 * 		"page" : 0
	 *	}
	 */
	sakai.filemanager.initialise = function(_options){
		// Save options object
		options = _options;

		// Initialize the selected files object
		resetSelectedFiles();
		
		// Disable the edit and delete link on startup
		updateMaintainerSelectedFiles();

		// Show the lightbox
		$(filemanagerOverlay, rootel).show();
		$(filemanagerPopupContent, rootel).show();

		// Fetch the initial list of files
		doFileSearch(options);

		// Accordion functionality
		$("#filemanager_accordion", rootel).accordion({
			fillSpace: true
		});

		// Initialise search
		initialiseSearch();

		// Initialise the uploader
		initialiseUploader();
		
		// Initialise the modal dialogs
		initialiseModalDialogs();
	};
};

sdata.widgets.WidgetLoader.informOnLoad("filemanager");