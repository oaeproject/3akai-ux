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

var sakai = sakai ||
{};
sakai.picker = sakai.picker ||
{};

sakai.filepicker = function(tuid, placement, showSettings){
    // General variables
    var rootel = $("#" + tuid);
    
    // This variable will hold the selecteded items.
    var selectedFiles = [];
    var userSelection = {};
    // This variable will hold the current path. ex: /sites/mysite/_files/WeekOne/Part4
    // This variable will hold the resultset we get from the service.
    var currentFolderResults = [];
    // The widget settings.
    var widgetSettings = {};
    // Page were currently looking at.
    var currentPage = 1;
    var settings_filesPerPage = 21;
    
    // All the icons for known mimetypes.
    var icons = {};
    icons["text/plain"] = "txt.png";
    icons["application/pdf"] = "pdf.png";
    icons["text/html"] = "html.png";
    icons["application/zip"] = "zip.png";
    icons["image/gif"] = "images.png";
    icons["image/jpg"] = "images.png";
    icons["image/jpeg"] = "images.png";
    icons["image/png"] = "images.png";
    
    
    // URL's
    Config.URL.SEARCH_RESOURCES = "/var/search/files/resources.json?path=__PATH__&resource=__RESOURCE__"
    var siteID = "/sites/" + placement.split("/")[0];
    var siteFiles = siteID + "/_files";
    // The currentpath in the folder browser.
    var currentPath = siteFiles;
    
    
    
    
    // CSS ID's and classes.
    var picker = "#picker";
    var pickerClass = ".picker";
    
    // Containers
    var picker_settings = picker + "_settings";
    var picker_main = picker + "_main";
    var picker_main_template = picker_main + "_template";
    var picker_pager = picker + "_pager";
    
    // Folders
    var picker_folder_item = pickerClass + "_folder_item";
    var picker_folder_template = picker + "_folder_template";
    var picker_folder_breadcrumb = picker + "_folder_breadcrumb";
    
    // Buttons
    var picker_button = picker + "_button";
    var picker_button_cancel = picker_button + "_cancel";
    var picker_button_select = picker_button + "_select";
    
    // Breadcrumbbar
    var picker_breadcrumb = picker + "_breadcrumb";
    var picker_breadcrumbClass = pickerClass + "_breadcrumb";
    var picker_breadcrumb_template = picker_breadcrumb + "_template";
    
    // Containers
    var picker_tree = picker + "_tree";
    var picker_tree_template = picker_tree + "_template";
    var picker_item = pickerClass + "_item";
    
    // Selected files
    var picker_selectedfiles = picker + "_selectedfiles";
    var picker_selectedfiles_template = picker_selectedfiles + "_template";
    var picker_selectedfileClass = pickerClass + "_selectedfile";
    
    // Messages
    var picker_messages = picker + "_messages";
    var picker_messages_file = picker_messages + "_file";
    var picker_messages_file_pick = picker_messages_file + "_pick";
    var picker_messages_file_select = picker_messages_file + "_select";
    
    ///////////////
    // Functions //
    ///////////////
    
    
    ////////////////////
    // Selected files //
    ////////////////////
    
    
    /**
     * Adds an item to the selected list.
     * @param {int} item The index of the item in the selectedFiles array.
     * @param {String} id The id of the item in the HTML.
     */
    var addSelectedItem = function(index, id){
        // Add item to list.
        var item = currentFolderResults[index];
        var add = true;
        for (var i = 0, j = selectedFiles.length; i < j; i++) {
            if (selectedFiles[i].path === currentFolderResults[index].path) {
                add = false;
                break;
            }
        }
        if (add) {
            item.index = index;
            selectedFiles.push(item);
            // Add selected class.
            $(id, rootel).addClass("selected");
            
            renderSelectedFiles();
        }
    };
    
    /**
     * Remove selected item
     * @param {int} item The index of the item in the selectedFiles array.
     * @param {String} id The id of the item in the HTML.
     */
    var removeSelectedItem = function(index, id){
        // Remove out of the list.
        selectedFiles.splice(index, 1);
        // Remove markup.
        $(id, rootel).removeClass("selected");
        renderSelectedFiles();
    };
    
    /**
     * Render the selected files.
     */
    var renderSelectedFiles = function(){
        var json = {
            'selectedFiles': selectedFiles
        };
        $(picker_selectedfiles, rootel).html($.Template.render(picker_selectedfiles_template.replace("#", ""), json));
        
        $(picker_selectedfileClass, rootel).corners();
    };
    
    /**
     * Renders the main view.
     */
    var renderMainView = function(){
        // Add the filetype for each file. (As in: Word document, image, PDF file, ...)
        for (var i = 0, j = selectedFiles.length; i < j; i++) {
            selectedFiles[i].fileType = sdata.files.getFileType(selectedFiles[i].name);
        }
        
        var json = {
            'files': selectedFiles,
            'icons': icons
        };
        
        $(picker_main, rootel).html($.Template.render(picker_main_template.replace("#", ""), json));
    };
    
    /////////////////////////
    // Rendering functions //
    /////////////////////////
    
    /**
     * Show the page
     * @param {int} page
     */
    var showPage = function(page){
        var from = (page - 1) * settings_filesPerPage;
        var to = page * settings_filesPerPage;
        var show = [];
        for (var i = 0, j = currentFolderResults.length; i < j; i++) {
            if (i >= from && i < to) {
                show.push(currentFolderResults[i]);
                show[show.length - 1].index = i;
            }
            if (i >= to) {
                break;
            }
        }
        
        
        var json = {
            'results': show,
            'selected': userSelection,
            'icons': icons
        };
        $(picker_tree, rootel).html($.Template.render(picker_tree_template.replace("#", ""), json));
        
        $(picker_pager, rootel).pager({
            pagenumber: page,
            pagecount: Math.ceil(currentFolderResults.length / settings_filesPerPage),
            buttonClickCallback: showPage
        });
        
        // corner the pager..
        $(picker_pager + " li", rootel).corners();
    };
    
    /**
     * Renders the data in the DOM.
     * @param {Object} data The data we got from the server
     * @param {Boolean} succes Wether or not it was a successfull request
     */
    var displayItems = function(data, succes){
        currentFolderResults = data;
        if (currentFolderResults.length > settings_filesPerPage) {
            $(picker_pager, rootel).pager({
                pagenumber: 1,
                pagecount: Math.ceil(currentFolderResults.length / settings_filesPerPage),
                buttonClickCallback: showPage
            });
        }
        if (succes) {
            showPage(1);
        }
        if (currentPath == undefined || currentPath === "") {
            currentPath = siteFiles;
        }
        
        // Handle breadcrumbbar.
        displayBreadcrumb(picker_breadcrumb, '', currentPath, siteID);
    };
    
    /**
     * Renders a breadcrumbbar.
     * @param {String} where
     * @param {String} type
     * @param {String} path
     * @param {String} startingFrom
     */
    var displayBreadcrumb = function(where, type, path, startingFrom){
        var beginningFolder = startingFrom.split("/");
        var locations = path.split("/");
        
        var breadcrumbs = [];
        for (var i = 0, j = locations.length; i < j; i++) {
            var json = {};
            json.folder = true;
            if (beginningFolder[i] === locations[i]) {
                json.folder = false;
            }
            json.name = locations[i];
            breadcrumbs.push(json);
        }
        
        var breadcrumbJson = {
            'locations': breadcrumbs,
            'type': type
        };
        $(where, rootel).html($.Template.render(picker_breadcrumb_template.replace("#", ""), breadcrumbJson));
    };
    
    /////////////////////
    // Widget settings //
    /////////////////////
    
    /**
     * Writes the selected items path's and other usefull info to JCR so we can retrieve it later on.
     * @param {Object} item The item we should write to JCR.
     */
    var saveWidgetSettings = function(){
        var data = {};
        data.parentFolder = currentPath;
        // Make sure we dont take over the item's resource type.
        data["sling:resourceType"] = "sakai/settings";
        data["selectedFiles"] = [];
        for (var i = 0, j = selectedFiles.length; i < j; i++) {
            var mime = selectedFiles[i]["sakai:mimeType"];
            if (typeof selectedFiles[i].file !== "undefined" && typeof selectedFiles[i].file["sakai:mimeType"] !== "undefined") {
                mime = selectedFiles[i].file["sakai:mimeType"];
            }
            var info = selectedFiles[i].path + ";" + selectedFiles[i].name + ";" + mime;
            data["selectedFiles"].push(info);
        }
        
        $.ajax({
            url: Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "picker"),
            cache: false,
            success: function(data){
                //	We successfully saved the files.
                //	Close this widget.
                if ($(".sakai_dashboard_page").is(":visible")) {
                    showSettings = false;
					init();
                }
                else {
                    sdata.container.informFinish(tuid);
                }
            },
            error: function(xhr, textStatus, thrownError) {
                //	Something went wrong trying to save the selected item.
                alert("Something went wrong trying to save the selected items.");
            },
            type: 'POST',
            data: data
        });
    };
    
    /**
     * Gets the widget settings.
     * If there are no settings, the files for this site will be retrieved.
     * If there are, then it will look for a selected file and retrieve all the info about it.
     */
    var getWidgetSettings = function(){
        $.ajax({
            url: Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "picker.json"),
            cache: false,
            success: function(data){
                widgetSettings = $.evalJSON(data);
                // We get our settings.
                // Now retrieve the actual info for the file.
                if (widgetSettings.selectedFiles) {
                    var arr = widgetSettings.selectedFiles;
                    if ((typeof arr).toLowerCase() === "object") {
                        for (var i = 0, j = arr.length; i < j; i++) {
                            var s = arr[i].split(";");
                            var o = {
                                'path': s[0],
                                'name': s[1]
                            };
                            o["sakai:mimeType"] = s[2];
                            selectedFiles.push(o);
                        }
                    }
                    else {
                        var s = arr.split(";");
                        var o = {
                            'path': s[0],
                            'name': s[1]
                        };
                        o["sakai:mimeType"] = s[2];
                        selectedFiles.push(o);
                    }
                    currentPath = widgetSettings.parentFolder;
                    if (showSettings) {
                        renderSelectedFiles();
                        sdata.files.getFiles(widgetSettings.parentFolder, displayItems);
                    }
                    else {
                        renderMainView();
                    }
                }
                else {
                    sdata.files.getFiles(siteFiles, displayItems);
                }
                
            },
            error: function(xhr, textStatus, thrownError) {
                // This is the first time this widget gets ran, so there are no settings yet.
                if (showSettings) {
                    sdata.files.getFiles(siteFiles, displayItems);
                }
            }
        });
    };
    
    
    ////////////
    // Events //
    ////////////
    
    
    // Cancel the picking of a ..
    $(picker_button_cancel, rootel).bind('click', function(){
        sdata.container.informCancel(tuid);
    });
    
    
    
    // Select something
    $(picker_button_select, rootel).bind('click', function(){
        if (selectedFiles.length === 0) {
            alert("Please select an item first.");
        }
        else {
            // Write the selected item to JCR.
            saveWidgetSettings();
        }
    });
    
    // A user clicked on an item. Wether it is a folder or a link.
    $(picker_item, rootel).live('click', function(e, ui){
        // Get the name.
        var id = $(this).attr('id');
        var parts = id.split("_");
        var index = parseInt(parts[parts.length - 1], 10);
        
        var item = currentFolderResults[index];
        if (item !== undefined) {
            if (item["sling:resourceType"] === "sakai/folder") {
                // This is a folder.
                // This means the user wants to see all the file/folders of this folder.
                var path = item["path"];
                currentPath = path;
                sdata.files.getFiles(path, displayItems);
            }
            else {
                // It is a file.
                if ($(this).hasClass("selected")) {
                    removeSelectedItem(index, id);
                }
                else {
                    addSelectedItem(index, id);
                }
            }
        }
    });
    
    /**
     * Someone wants to remove a selected file.
     */
    $(picker_selectedfileClass + " img", rootel).live("click", function(){
        var id = $(this).attr("id");
        var parts = id.split("_");
        var index = parseInt(parts[parts.length - 1], 10);
        removeSelectedItem(index, id);
    });
    
    // Someone clicked a breadcrumb bar.
    $(picker_breadcrumbClass, rootel).live('click', function(){
        var parts = $(this).attr('id').split("_");
        var id = parseInt(parts[parts.length - 1], 10);
        
        var pathParts = currentPath.split("/");
        var path = "";
        var i = 0;
        while (i <= id) {
            path += pathParts[i] + "/";
            i++;
        }
        path = path.substring(0, path.length - 1);
        
        currentPath = path;
        sdata.files.getFiles(path, displayItems);
    });
    
    
    ///////////////////
    // Init function //
    ///////////////////
    var init = function(){
        if (showSettings) {
            $(picker_main, rootel).hide();
            $(picker_settings, rootel).show();
        }
        else {
            $(picker_settings, rootel).hide();
            $(picker_main, rootel).show();
        }
        getWidgetSettings();
    }
	
	init();
    
};



sdata.widgets.WidgetLoader.informOnLoad("filepicker");
