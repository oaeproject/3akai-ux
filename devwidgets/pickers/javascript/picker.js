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

sakai.picker = function(tuid, placement, showSettings, endFormat){
    // General variables
    var rootel = $("#" + tuid);

    // This variable will hold the selected item.
    var selectedItem = "";
    var userSelection = {};
    // This variable will hold the current path. ex: /sites/mysite/_files/WeekOne/Part4
    // This variable will hold the resultset we get from the service.
    var currentFolderResults = [];
    // The currentpath in the folder browser.

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
    sakai.config.URL.SEARCH_RESOURCES = "/var/search/files/resources.json?path=__PATH__&resource=__RESOURCE__"
    var siteID = "/sites/" + placement.split("/")[0];
    var siteFiles = siteID + "/_files";
    var currentPath = siteFiles;

    //
    var resourceformats = {
        'link': 'link',
        'folder': 'folder',
        'all': 'all'
    };


    // CSS ID's and classes.
    var picker = "#picker";
    var pickerClass = ".picker";

    // Containers
    var picker_settings = picker + "_settings";
    var picker_main = picker + "_main";
    var picker_main_template = picker_main + "_template";

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
    var picker_selectedfile = picker + "_selectedfile";
    var picker_selectedfile_name = picker_selectedfile + "_name";
    var picker_selectedfile_location = picker_selectedfile + "_location";

    // Messages
    var picker_messages = picker + "_messages";
    var picker_messages_file = picker_messages + "_file";
    var picker_messages_file_pick = picker_messages_file + "_pick";
    var picker_messages_file_select = picker_messages_file + "_select";

    ///////////////
    // Functions //
    ///////////////

    /**
     * Sets the current selectedItem and sets the layout.
     * @param {Object} item
     */
    var setSelectedItem = function(item){
        selectedItem = item;
        $(picker_selectedfile_name).text(item.name);
        $(picker_selectedfile_name).attr('href', item.path);
        $(picker_selectedfile_location).text(item.path);

        var json = {
            'file': item,
            'icons': icons,
            'type' : sakai.files.getType(item["sakai:filename"])
        };

        // If we are not in settings mode and we are looking for a folder we show the breadcrumb screen.
        if (!showSettings && endFormat === "folder") {
            // Get all the stuff.
            sdata.files.getFiles(item.parentFolder, displayFolder);
        }
        else
            if (!showSettings && endFormat === "file") {
                $(picker_main, rootel).html($.TemplateRenderer(picker_main_template.replace("#", ""), json));
            }
    }


    /**
     * Writes the selected item's path and other usefull info to JCR so we can retrieve it later on.
     * @param {Object} item The item we should write to JCR.
     */
    var writeSelectedItemToJCR = function(item){
        data = item;
        if (item.file) {
            data["sakai:mimeType"] = item.file["sakai:mimeType"];
        }
        data.parentFolder = currentPath;
        // Make sure we dont take over the item's resource type.
        data["sling:resourceType"] = "sakai/settings";
        $.ajax({
            url: sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "picker"),
            cache: false,
            success: function(data){
                //    We successfully saved the file.
                //    Close this widget.
                sdata.container.informFinish(tuid);
            },
            error: function(xhr, textStatus, thrownError) {
                //    Something went wrong trying to save the selected item.
                alert("Something went wrong trying to save the selected item.");
            },
            type: 'POST',
            data: data
        });
    };


    /////////////////////////
    // Rendering functions //
    /////////////////////////

    var displayFolder = function(path, json){
        json.results = json.results.sort(sortOnPath);
        var data = json;
        data.icons = icons;
        $(picker_main, rootel).html($.TemplateRenderer(picker_main_template.replace("#", ""), data));

        displayBreadcrumb(picker_folder_breadcrumb, 'folder', path, userSelection.parentFolder);
    };

    var sortOnPath = function(a, b){
        return (a.name > b.name) ? -1 : (a.name == b.name) ? 0 : 1;
    };

    /**
     * Renders the data in the DOM.
     * @param {Object} data The data we got from the server
     * @param {Boolean} succes Wether or not it was a successfull request
     */
    var displayItems = function(data, succes){
        currentFolderResults = data;
        var json = {
            'results': data,
            'selected': userSelection,
            'endFormat': endFormat,
            'icons': icons
        };
        json.results = data;
        if (!succes) {
            json = {
                'results': []
            };
        }
        $(picker_tree, rootel).html($.TemplateRenderer(picker_tree_template.replace("#", ""), json));

        // Handle breadcrumbbar.
        displayBreadcrumb(picker_breadcrumb, '', currentPath, siteID);
    };

    /**
     * Renders a breadcrumbbar.
     * @param {Object} where
     * @param {Object} type
     * @param {Object} path
     * @param {Object} startingFrom
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
        $(where, rootel).html($.TemplateRenderer(picker_breadcrumb_template.replace("#", ""), breadcrumbJson));
    };

    /**
     * Gets the path a user selected and has saved to JCR.
     */
    var getUserSelectedPath = function(){
        $.ajax({
            url: sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "picker.json"),
            cache: false,
            success: function(data){
                var json = $.evalJSON(data);
                userSelection = json;
                if (json.path !== undefined && json.name !== undefined) {
                    setSelectedItem(json);
                }
                if (showSettings) {
                    currentPath = json.parentFolder;
                    sdata.files.getFiles(userSelection.parentFolder, displayItems);
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
        if (selectedItem === "") {
            alert("Please select an item first.");
        }
        else {
            // Write the selected item to JCR.
            writeSelectedItemToJCR(selectedItem);
        }
    });

    // A user clicked on an item. Wether it is a folder or a link.
    $(picker_item, rootel).live('click', function(e, ui){
        // Get the name.
        var parts = $(this).attr('id').split("_");
        var id = parseInt(parts[parts.length - 1], 10);

        var item = currentFolderResults[id];
        if (item !== undefined) {
            if (item["sling:resourceType"] === "sakai/folder") {
                // This is a folder.
                // This means the user wants to see all the file/folders of this folder.
                var path = item["path"];
                if (endFormat === "folder") {
                    setSelectedItem(item);
                }
                currentPath = path;
                sdata.files.getFiles(path, displayItems);
            }
            else {
                // It is a file.
                // Remove the previous selected file (if any.)
                $(picker_item + ".selected").removeClass('selected');
                // select the new file.
                $(this).addClass('selected');
                setSelectedItem(item);

            }
        }
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
        var format = resourceformats.all;
        if (endFormat === "folder") {
            format = resourceformats.folder;
        }

        if ($(this).hasClass("picker_breadcrumb_folder")) {
            sdata.files.getFiles(path, displayFolder);
        }
        else {
            currentPath = path;
            sdata.files.getFiles(path, displayItems);
        }
    });

    /*
     * Somebody clicks on a folder in the folder view.
     */
    $(picker_folder_item, rootel).live('click', function(){
        var parts = $(this).attr('id').split("_");
        var id = parseInt(parts[parts.length - 1], 10);

        var item = currentFolderResults[id];
        sdata.files.getFiles(item.path, displayFolder);
    });

    ///////////////////
    // Init function //
    ///////////////////
    if (showSettings) {
        $(picker_main).hide();
        $(picker_settings).show();
    }
    else {
        $(picker_settings).hide();
        $(picker_main).show();
    }
    getUserSelectedPath();

};



sdata.widgets.WidgetLoader.informOnLoad("filepicker");
