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

/*global $, sdata, Config */

var sakai = sakai || {};

sakai.filemanager = function(tuid, placement, showSettings){

	////////////////////
	// Help variables //
	////////////////////

	var pageSize = 15;
	var searchURL = "/devwidgets/filemanager/json/files.json";


	////////////////////
	// Help variables //
	////////////////////

	var rootel = $("#" + tuid);
	var options = {};
	var currentpage = 0;
	
	/**
	 * Initialise the filemanager
	 * @param {Object} _options  identifier for the current context, initial search
	 *   query and initial tag filter
	 *   {
	 *		"context" : "myfiles" or "/sites/siteid",
	 *		"search" : false or "searchquery",
	 *		"tag" : false or ["tag1","tag2","tag3"],
	 * 		"page" : 0
	 *	}
	 */
	sakai.filemanager.initialise = function(_options){
		// Save options object
		options = _options;
		
		// Show the lightbox
		$("#overlay", rootel).show();
		$("#filemanager_popup_content", rootel).show();
		
		//Fetch the initial list of files
		doFileSearch(options);
		
	}
	
	/**
	 * 
	 * @param {Object} options  identifier for the current context, initial search
	 *   query and initial tag filter
	 *   {
	 *		"context" : "myfiles" or "/sites/siteid",
	 *		"search" : false or "searchquery",
	 *		"tag" : false or ["tag1","tag2","tag3"],
	 * 		"page" : 0
	 *	}
	 */
	var doFileSearch = function(_options){
		
		// Make sure we have actual values
		options.context = _options.context || "myfiles";
		options.search = _options.search || "";
		options.tag = _options.tag || false;
		
		// Set the title of the file list
		$("#filemanager_list_title").html($.Template.render("filemanager_list_title_template", options));
		
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
		currentpage = clickedPage - 1;
		doFileSearch(currentpage);
	};
	
	/**
	 * 
	 * @param {Object} data  JSON object with all of the files to be displayed on the
	 * screen. An example of the data model can be found in /devwidgets/filemanager/json/files.json
	 */
	var doFileRender = function(data){
		
		// Render files
		$("#filemanager_files_container").html($.Template.render("filemanager_files_container_template",data));
		
		// Render paging
		$(".jq_pager").pager({
			pagenumber: currentpage + 1,
			pagecount: Math.ceil(data.total / pageSize),
			buttonClickCallback: doPaging
		}); 
	
	}
	
	
	////////////////////
	// Event Handlers //
	////////////////////
	
	/**
	 * Top right hand close button
	 * @param {Object} ev
	 */
	$("#filemanager_close").live("click", function(ev){
		$("#overlay", rootel).hide();
		$("#filemanager_popup_content", rootel).hide();
	});
	
	/**
	 * This will select / deselect files when clicked
	 * @param {Object} ev
	 */
	$(".filemanager_file").live("click", function(ev){
		if ($(this).hasClass("filemanager_file_selected")){
			$(this).removeClass("filemanager_file_selected");
		} else {
			$(this).addClass("filemanager_file_selected");
		}
	});
	
	/**
	 * Will open a file in a new window/tab when doubleclicked on it
	 * @param {Object} ev
	 */
	$(".filemanager_file").live("dblclick", function(ev){
		var newWindow = window.open("http://www.google.be", '_blank');
		newWindow.focus();
		return false;
	});
	
}

sdata.widgets.WidgetLoader.informOnLoad("filemanager");