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
// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core", "underscore"], function($, sakai, _){

    /**
     * @name sakai_global.addarea
     *
     * @class addarea
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.addarea = function(tuid, showSettings){


        //////////////////////
        // WIDGET VARIABLES //
        //////////////////////

        var $rootel = $("#" + tuid);

        var $addAreaContainer = $("#addarea_container");
        var $groupCreateNewAreaButton = $("#group_create_new_area");

        // Navigation
        var addAreaNavigationButton = ".addarea_content_menu_item button";
        var addAreaContentMenuItem = ".addarea_content_menu_item";
        var addAreaSubnavButton = ".subnav_button";

        // Containers
        var addAreaContentContainer = "#addarea_content_container";

        // Elements
        var addareaCreateDocButton = "#addarea_create_doc_button";
        var addAreaExistingEverywhereSearchInput = "#addarea_existing_everywhere_search";
        var addAreaExistingMyLibrarySearchInput = "#addarea_existing_mylibrary_search";
        var addAreaExistingCurrentlyViewingInput = "#addarea_existing_currentlyviewing_search";
        var addareaExistingItem = ".addarea_existing_item";
        var addAreaGroupName = ".addarea_group_name";

        // Classes
        var selected = "selected";
        var addAreaSubnavButtonClass = "subnav_button";

        ///////////
        // UTILS //
        ///////////

        /**
         * Sort from A - Z or Z - A on the date of creation
         */
        var dateSort = function(a, b){
            return a["_created"] > b["_created"];
        };

        /**
         * Sort from A - Z or Z - A on a title
         */
        var titleSort = function(a, b){
            return a["sakai:pooled-content-file-name"] > b["sakai:pooled-content-file-name"];
        };

        /*
         * Centers the overlay on the screen and handles with variable widths of the overlay
         */
        var centerOverlay = function(){
            $addAreaContainer.animate({
                'margin-left': -1 * ($addAreaContainer.width() / 2 + 20)
            }, 400);
        };

        /*
         * Reset the UI for new Sakai Docs
         */
        var resetNewSakaiDoc = function(){
            $("#addarea_new_name").val("");
            $("#addarea_new_permissions").val("");
            $("#addarea_new_numberofpages").val("");
        };

        /*
         * Reset the UI for existing content
         */
        var resetExisting = function(){
            $(".addarea_existing_name").val("");
            $(".addarea_existing_permissions").val("");
            $(".addarea_existing_bottom").html("");
        };

        /*
         * Reset the UI for Content lists
         */
        var resetContentList = function(){
            $("#addarea_contentlist_name").val(sakai.api.i18n.getValueForKey("LIBRARY"));
            $("#addarea_contentlist_permissions").val("");
        };

        /*
         * Reset the UI for participant lists
         */
        var resetParticipantsList = function(){
            $("#addarea_participants_name").val(sakai.api.i18n.getValueForKey("PARTICIPANTS", "addarea"));
            $("#addarea_participants_permissions").val("");
        };

        /*
         * Reset the UI for Widget pages
         */
        var resetWidgetPage = function(){
            $("#addarea_widgets_name").val("");
            $("#addarea_widgets_permissions").val("");
            $("#addarea_widgets_numberofpages").val("");
        };

        var resetNavigation = function(){
            $("#addarea_content_menu .addarea_content_menu_item").removeClass("selected");
            $("#addarea_content_menu .addarea_content_menu_item:first").addClass("selected");
            $("#addarea_content_container > div").hide();
            // Do a click so it runs through switchNavigation
            $( "button[data-containertoshow='addarea_new_container']" ).click();
        };

        /*
         * Reset the UI completely
         */
        var resetWidget = function(){
            // Reset all navigation items
            resetNewSakaiDoc();
            resetExisting();
            resetContentList();
            resetParticipantsList();
            resetWidgetPage();
            resetNavigation();
            // Set Group Name
            $(addAreaGroupName).text(sakai_global.group.groupData["sakai:group-title"]);
            // Set permission defaults
            var permissionsSelect = sakai.api.Util.TemplateRenderer("addarea_permissions_template", {
                "groupVisibility": sakai_global.group.groupData["sakai:group-visible"],
                "newDoc": true
            });
            $("#addarea_new_permissions").html(permissionsSelect);
            $("#addarea_existing_permissions").html(permissionsSelect);
            $("#addarea_existing_permissions").html(permissionsSelect);
            $("#addarea_contentlist_permissions").html(permissionsSelect);
            $("#addarea_participants_permissions").html(permissionsSelect);
            $("#addarea_widgets_permissions").html(permissionsSelect);
            $(addareaCreateDocButton).attr("disabled", true);
        };

        var checkTitleProvided = function(){
            if($.trim($(".addarea_name_field:visible").val())){
                $(addareaCreateDocButton).removeAttr("disabled");
            } else {
                $(addareaCreateDocButton).attr("disabled", true);
            }
        };

        /*
         * Handles a click in the navigation and loads the new content if necessary
         */
        var switchNavigation = function(){
            resetExisting();
            $(addAreaContentMenuItem).removeClass(selected);
            $(this).parents(addAreaContentMenuItem).addClass(selected);
            if($(this).hasClass(addAreaSubnavButtonClass)){
                // Subnav item selected, add selected state
                $(addAreaSubnavButton).parent().removeClass("selected");
                $(this).parent().addClass("selected");
            } else if ($(this).hasClass("subnav_header")){
                $(addAreaSubnavButton).parent().removeClass("selected");
                $($(addAreaSubnavButton)[0]).parent().addClass("selected");
            }
            var containerToShow = $(this).data("containertoshow");
            if (!$("#" + containerToShow).is(":visible")){
                $(addAreaContentContainer + " > div").hide();
                $("#" + containerToShow).show();
                centerOverlay();
            }
            var $addAreaVisibleContainer = $(addAreaContentContainer + " > div:visible");
            if($addAreaVisibleContainer.data("doc-type") === "existing_everywhere" ||
               $addAreaVisibleContainer.data("doc-type") === "existing_mylibrary"){
                var query = $addAreaVisibleContainer.find(".addarea_existing_search").val();
                getAllExistingSakaiDocs(query, $addAreaVisibleContainer.data("doc-type") === "existing_mylibrary");
            } else if ($addAreaVisibleContainer.data("doc-type") === "existing_currentlyviewing"){
                getCurrentlyViewingDocs();
            }
            checkTitleProvided();
        };

        /*
         * Determines what type of Sakai Doc should be created and saved by looking at the visible container
         */
        var determineDocContext = function(){
            $(this).attr("disabled", "true");
            switch ($(addAreaContentContainer + " > div:visible").data("doc-type")){
                case "new":
                    createNewSakaiDoc();
                    break;
                case "contentlibrary":
                    createContentLibrary();
                    break;
                case "participants":
                    createParticipantsList();
                    break;
                case "widgets":
                    createWidgetPage();
                    break;
                case "existing_everywhere":
                    createExistingSakaiDoc();
                    break;
                case "existing_mylibrary":
                    createExistingSakaiDoc();
                    break;
                case "existing_currentlyviewing":
                    createExistingSakaiDoc();
                    break;
                default:
                  debug.warn("unrecognized area type: " + $(addAreaContentContainer + " > div:visible").data("doc-type"));
                  break;
            }
        };


        /////////////////////////////////////////
        // GENERAL CREATE SAKAI DOCS FUNCTIONS //
        /////////////////////////////////////////

        /*
         * Create a new Sakai Document
         * @param {String} title Title of the Sakai Document
         * @param {String} permission ID of the permissions to be set
         * @param {String} docStructure Default content to be set on the Sakai Doc
         * @param {String|Boolean} preferredTitle Used to make a unique URL, can also be set to false 
         * @param {Object} widgetContents Contains data about any widgets on the page
         * @param {Boolean} nonEditable Defines if the Sakai doc will be editable or not
         * @param {Function} callback Function to be executed after setting (or failing to set) the permissions
         */
        var createSakaiDoc = function(title, permission, docStructure, preferredTitle, nonEditable, callback) {
            var realPermission = permission;
            if (permission === 'advanced') {
                realPermission = 'private';
            }
            var parameters = {
                'sakai:pooled-content-file-name': title,
                'sakai:description': '',
                'sakai:permissions': permission,
                'sakai:copyright': 'creativecommons',
                'sakai:schemaversion': sakai.config.schemaVersion,
                'mimeType': 'x-sakai/document'
            };

            // Prepare Sakai Doc
            var structure0 = {},
                toCreate = {};
            for (var i = 0; i < docStructure.length; i++) {
                var pageID = '',
                    pageTitle = '';

                // for multi-page creation, we don't care as much about the URL
                // since they're auto-generated pages
                if (docStructure.length > 1) {
                    pageTitle = 'Page ' + (i+1);
                    // if we wanted to make the URL names 'Page 1', etc, we'd make
                    // that change here by..
                    //   pageID = sakai.api.Util.makeSafeURL(pageId);
                    // buf I figure since it's expected that the user will change these
                    // pages names an id might be better in the URL at least until
                    // we allow changing the lhnav title to change the url/data store of the page
                    pageID = sakai.api.Util.generateWidgetId();
                // if we have a preferred title, let's use that
                } else if (preferredTitle) {
                    pageTitle = title;
                    pageID = sakai.api.Util.makeUniqueURL(preferredTitle, title, sakai_global.group.pubdata.structure0);
                // otherwise use the title of the page for the URL
                } else {
                    pageTitle = title;
                    pageID = sakai.api.Util.makeUniqueURL(title, null, sakai_global.group.pubdata.structure0);
                }
                var refID = sakai.api.Util.generateWidgetId();

                structure0[pageID] = {
                    '_title': pageTitle,
                    '_order': i,
                    '_ref': refID,
                    '_nonEditable': nonEditable,
                    'main': {
                        '_title': pageTitle,
                        '_order': 0,
                        '_ref': refID,
                        '_nonEditable': nonEditable
                    }
                };
                toCreate[refID] = docStructure[i];
            }

            parameters['structure0'] = JSON.stringify(structure0);
            $.ajax({
                url: '/system/pool/createfile',
                type:'POST',
                data: parameters,
                dataType: 'json',
                success: function(data) {
                    var poolId = data._contentItem.poolId;
                    var struct = $.parseJSON(data._contentItem.item.structure0);
                    var itemURLName = '';
                    if (docStructure.length === 1) {
                        for (itemURLName in struct) {
                            if (struct.hasOwnProperty(itemURLName)) {
                                break;
                            }
                        }
                    } else {
                        itemURLName = sakai.api.Util.makeSafeURL(title);
                    }
                    var batchRequests = [];
                    $.each(struct, function(i, obj) {
                        batchRequests.push({
                            url: '/p/' + poolId + '/' + obj._ref + '.save.json',
                            method: 'POST',
                            parameters: {
                                'sling:resourceType': 'sakai/pagecontent',
                                'sakai:pagecontent': JSON.stringify(toCreate[obj._ref]),
                                '_charset_': 'utf-8'
                            }
                        });
                    });
                    sakai.api.Server.saveJSON('/p/' + poolId, toCreate, function(success2, data2) {
                        sakai.api.Server.batch(batchRequests, function(success3, data3) {
                            if (success3) {
                                callback(poolId, itemURLName);
                            }
                        });
                    });
                }
            });
        };

        /*
         * Fetches the roles in a group
         * @return {Object} JSON object containing information about the different roles in the group
         */
        var fetchGroupRoles = function(){
            return $.parseJSON(sakai_global.group.groupData["sakai:roles"]);
        };

        /*
         * Set permissions on an existing Sakai Document
         * @param {String} urlName Title of the Sakai Document
         * @param {String} poolId ID of the document saved in the pool
         * @param {String} docPermission ID of the permissions to be set
         * @param {Boolean} existingNotMine Determines if the settings should be applied to an existing Sakai Doc that I own
         * @param {Function} callback Function to be executed after setting (or failing to set) the permissions
         */
        var setSakaiDocPermissions = function(urlName, poolId, docPermission, existingNotMine, callback){
            var filesArray = {};
            var permission = "private";
            if (docPermission === "public"){
                permission = "public";
            } else if (docPermission === "everyone"){
                permission = "everyone";
            }
            filesArray[urlName] = {
                "hashpath": poolId,
                "permissions": permission
            };
            var viewRoles = [];
            var editRoles = [];
            var roles = fetchGroupRoles();
            for (var i = 0; i < roles.length; i++){
                var role = roles[i];
                if (role.isManagerRole){
                    editRoles.push(role.id);
                } else {
                    viewRoles.push(role.id);
                }
            }
            if (existingNotMine) {
                var batchRequests = [];
                for (var j = 0; j < editRoles.length; j++) {
                    batchRequests.push({
                        "url": "/p/" + poolId + ".members.html",
                        "method": "POST",
                        "parameters": {
                            ":viewer": sakai_global.group.groupId + "-" + editRoles[j]
                        }
                    });
                }
                if (docPermission !== "advanced") {
                    for (var k = 0; k < viewRoles.length; k++) {
                        batchRequests.push({
                            "url": "/p/" + poolId + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer": sakai_global.group.groupId + "-" + viewRoles[k]
                            }
                        });
                    }
                }
                sakai.api.Server.batch(batchRequests, function(success, data){
                    if (success) {
                        callback(poolId);
                    }
                 });
            } else {
                sakai.api.Content.setFilePermissions(filesArray, function(){
                    var batchRequests = [];
                    for (var l = 0; l < editRoles.length; l++) {
                        batchRequests.push({
                            "url": "/p/" + poolId + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":manager": sakai_global.group.groupId + "-" + editRoles[l]
                            }
                        });
                    }
                    if (docPermission !== "advanced") {
                        for (var m = 0; m < viewRoles.length; m++) {
                            batchRequests.push({
                                "url": "/p/" + poolId + ".members.html",
                                "method": "POST",
                                "parameters": {
                                    ":viewer": sakai_global.group.groupId + "-" + viewRoles[m]
                                }
                            });
                        }
                    }
                    sakai.api.Server.batch(batchRequests, function(success, data){
                        if (success) {
                            callback(poolId);
                        }
                    });
                });
            }
        };

        /*
         * Add a Sakai Doc to a world
         * @param {String} urlName Safe title of the Sakai Document as it's stored inside of the system
         * @param {String} poolId ID of the document saved in the pool
         * @param {String} docTitle Title of the Sakai Document
         * @param {String} docPermission ID of the permissions to be set
         * @param {Boolean} nonEditable Defines if the Sakai doc will be editable or not
         * @param {Boolean} existingNotMine Determines if the settings should be applied to an existing Sakai Doc that I own
         * @param {Function} callback Function to be executed after setting (or failing to set) the permissions
         */
        var addSakaiDocToWorld = function(urlName, poolId, docTitle, docPermission, nonEditable, existingNotMine, callback){
            // Refetch docstructure information
            $.ajax({
                 url: "/~" + sakai_global.group.groupId + "/docstructure.infinity.json",
                 cache: false,
                 success: function(data){

                    var pubdata = sakai.api.Server.cleanUpSakaiDocObject(data);
                    var newView = [];
                    var newEdit = [];

                    if (docPermission === "public"){
                        newView.push("everyone");
                        newView.push("anonymous");
                    } else if (docPermission === "everyone"){
                        newView.push("everyone");
                    }

                    var roles = fetchGroupRoles();
                    for (var i = 0; i < roles.length; i++){
                        var role = roles[i];
                        if (role.isManagerRole){
                            if (existingNotMine) {
                                newView.push("-" + role.id);
                            } else {
                                newEdit.push("-" + role.id);
                            }
                        } else if (docPermission !== "advanced"){
                            newView.push("-" + role.id);
                        }
                    }

                    pubdata.structure0[urlName] = {
                        "_title": docTitle,
                        "_order": _.size(pubdata.structure0),
                        "_pid": poolId,
                        "_view": JSON.stringify(newView),
                        "_edit": JSON.stringify(newEdit),
                        "_nonEditable": nonEditable
                    };

                    // Store view and edit roles
                    sakai_global.group.pubdata.structure0 = pubdata.structure0;
                    sakai.api.Server.saveJSON("/~" + sakai_global.group.groupId + "/docstructure", {
                        "structure0": JSON.stringify(pubdata.structure0)
                    }, function(){
                        callback(poolId, urlName);
                    });
                }
            });
        };

        /*
         * Selects a Sakai Doc in the world to show and triggers the permissions overlay if necessary
         */
        var selectPageAndShowPermissions = function(poolId, path, docPermission){
            sakai.api.Util.Modal.close($addAreaContainer);
            if (docPermission === "advanced"){
                $(window).trigger("permissions.area.trigger", [{
                    isManager: true,
	                pageSavePath: "/p/" + poolId,
	                path: path,
	                savePath: "/~" + sakai_global.group.groupId + "/docstructure"
                }]);
            }
            $(window).trigger("rerender.group.sakai", [path]);
        };

        /**
         * Remove the creator of a Sakai Doc as an explicit manager, in order to avoid world created
         * areas to show up in the personal library
         * @param {Object} poolId        Pooled content id of the new area
         * @param {Object} callback      Function to call when the creator has been removed
         */
        var removeCreatorAsManager = function(poolId, callback){
            sakai.api.Content.removeUser("manager", poolId, sakai.data.me.user.userid, callback);
        };

        ///////////////////////
        // CREATE SAKAI DOCS //
        ///////////////////////

        /*
         * Initiates the creation of a new Sakai Doc
         */
        var createNewSakaiDoc = function() {
            var docTitle = $('#addarea_new_name').val();
            var docPermission = $('#addarea_new_permissions').val();
            var numPages = parseInt($('#addarea_new_numberofpages').val(), 10);
            var nonEditable = false;
            var docStructure = [];
            for (var i = 0; i < numPages; i++) {
                docStructure.push({
                    'rows': [{
                        'id': sakai.api.Util.generateWidgetId(),
                        'columns': [{
                            'width': 1,
                            'elements': []
                        }]
                    }]
                });
            }
            createSakaiDoc(docTitle, docPermission, docStructure, false, nonEditable, function(poolId, urlName) {
                setSakaiDocPermissions(urlName, poolId, docPermission, false, function(poolId1) {
                    removeCreatorAsManager(poolId, function() {
                        addSakaiDocToWorld(urlName, poolId1, docTitle, docPermission, nonEditable, false, function(poolId2, path) {
                            selectPageAndShowPermissions(poolId2, path, docPermission);
                        });
                    });
                });
            });
        };

        /*
         * Initiates the creation of a new Content Library
         */
        var createContentLibrary = function() {
            var docTitle = $('#addarea_contentlist_name').val();
            var docPermission = $('#addarea_contentlist_permissions').val();
            var widgetID = sakai.api.Util.generateWidgetId();
            var docStructure = [{
                'rows': [{
                    'id': sakai.api.Util.generateWidgetId(),
                    'columns': [{
                        'width': 1,
                        'elements': [{
                            'id': widgetID,
                            'type': 'mylibrary'
                        }]
                    }]
                }]
            }];
            docStructure[0][widgetID] = {
                mylibrary: {
                    'groupid': sakai_global.group.groupId
                }
            };
            var nonEditable = true;
            createSakaiDoc(docTitle, docPermission, docStructure, 'library', nonEditable, function(poolId, urlName) {
                setSakaiDocPermissions(urlName, poolId, docPermission, false, function(poolId1) {
                    removeCreatorAsManager(poolId, function(){
                        addSakaiDocToWorld(urlName, poolId1, docTitle, docPermission, nonEditable, false, function(poolId2, path) {
                            selectPageAndShowPermissions(poolId2, path, docPermission);
                        });
                    });
                });
            });
        };

        /*
         * Initiates the creation of a new Participants List
         */
        var createParticipantsList = function() {
            var docTitle = $('#addarea_participants_name').val();
            var docPermission = $('#addarea_participants_permissions').val();
            var widgetID = sakai.api.Util.generateWidgetId();
            var docStructure = [{
                'rows': [{
                    'id': sakai.api.Util.generateWidgetId(),
                    'columns': [{
                        'width': 1,
                        'elements': [{
                            'id': widgetID,
                            'type': 'participants'
                        }]
                    }]
                }]
            }];
            docStructure[0][widgetID] = {
                participants: {
                    'groupid': sakai_global.group.groupId
                }
            };
            var nonEditable = true;
            createSakaiDoc(docTitle, docPermission, docStructure, 'participants', nonEditable, function(poolId, urlName) {
                setSakaiDocPermissions(urlName, poolId, docPermission, false, function(poolId1) {
                    removeCreatorAsManager(poolId, function() {
                        addSakaiDocToWorld(urlName, poolId1, docTitle, docPermission, nonEditable, false, function(poolId2, path) {
                            selectPageAndShowPermissions(poolId2, path, docPermission);
                        });
                    });
                });
            });
        };

        /*
         * Initiates the creation of a new Widget page
         */
        var createWidgetPage = function() {
            var docTitle = $('#addarea_widgets_name').val();
            var docPermission = $('#addarea_widgets_permissions').val();
            var selectedWidget = $('#addarea_widgets_widget').val();
            var widgetID = sakai.api.Util.generateWidgetId();
            var docStructure = [{
                'rows': [{
                    'id': sakai.api.Util.generateWidgetId(),
                    'columns': [{
                        'width': 1,
                        'elements': [{
                            'id': widgetID,
                            'type': selectedWidget
                        }]
                    }]
                }]
            }];
            docStructure[0][widgetID] = sakai.widgets[selectedWidget].defaultConfiguration || {};
            var nonEditable = false;
            createSakaiDoc(docTitle, docPermission, docStructure, false, nonEditable, function(poolId, urlName) {
                setSakaiDocPermissions(urlName, poolId, docPermission, false, function(poolId1) {
                    removeCreatorAsManager(poolId, function() {
                        addSakaiDocToWorld(urlName, poolId1, docTitle, docPermission, nonEditable, false, function(poolId2, path) {
                            selectPageAndShowPermissions(poolId2, path, docPermission);
                        });
                    });
                });
            });
        };

        var docMatches = function (query, docTitle){
            if(docTitle.toLowerCase().indexOf(query.toLowerCase())  != -1){
                return true;
            }
            return false;
        };

        var getCurrentlyViewingDocs = function(query){
            var currentDocs = [];
            query = query || "";
            $.each(sakai_global.group.pubdata.structure0, function(i, index) {
                if ($.isPlainObject(sakai_global.group.pubdata.structure0[i])) {
                    var docObj = {
                        "sakai:pooled-content-file-name": sakai_global.group.pubdata.structure0[i]["_title"],
                        "_path": sakai_global.group.pubdata.structure0[i]["_pid"],
                        "canManage": sakai_global.group.pubdata.structure0[i]["_canSubedit"],
                        "groupVisibility": sakai_global.group.groupData["sakai:group-visible"]
                    };
                    if (query && docMatches(query, docObj["sakai:pooled-content-file-name"])) {
                        currentDocs.push(docObj);
                    } else if (query === "") {
                        currentDocs.push(docObj);
                    }
                }
            });
            var sortOrder = $(".addarea_existing_container:visible").find(".addarea_existing_sort").val();
            currentDocs.sort(dateSort);
            if (sortOrder === "desc") {
                currentDocs.reverse();
            }
            // Render the results
            $("#addarea_existing_currentlyviewing_bottom").html(sakai.api.Util.TemplateRenderer("addarea_existing_bottom_template", {
                data: currentDocs,
                context: "currently_viewing"
            }));
        };

        /*
         * Initiates the linking of an existing Sakai Doc
         */
        var createExistingSakaiDoc = function(){
            var docTitle = $(".addarea_existing_container:visible").find(".addarea_existing_name").val();
            var docPermission = $(".addarea_existing_container:visible").find(".addarea_existing_permissions").val();
            var $selectedDoc = $(".addarea_existing_item.selected");
            var docId = $selectedDoc.data("doc-id");
            var existingNotMine = !$selectedDoc.data("sakai-manage");
            var nonEditable = false;
            setSakaiDocPermissions(docId, docId, docPermission, existingNotMine, function(poolId){
                addSakaiDocToWorld(poolId, poolId, docTitle, docPermission, nonEditable, existingNotMine, function(poolId, path){
                    selectPageAndShowPermissions(poolId, path, docPermission);
                });
            });
        };

        /*
         * Fetches all Sakai Docs queried for and depending on the context renders a different view
         */
        var getAllExistingSakaiDocs = function(query, library){
            var json = {
                mimetype: "x-sakai/document",
                q: query,
                items: 50
            };
            var url = "/var/search/pool/all.0.json";
            if (!query) {
                url = "/var/search/pool/all-all.0.json";
            }

            if (library) {
                json["userid"] = sakai.data.me.user.userid;
                url = sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER;
            }
            sakai.api.Server.loadJSON( url, function(success, data) {
                var sortOrder = $(".addarea_existing_container:visible").find(".addarea_existing_sort").val();
                data.results.sort(dateSort);
                if (sortOrder === "desc"){
                    data.results.reverse();
                }
                // Check which items I can manage
                for (var i = 0; i < data.results.length; i++) {
                    var manager = false;
                    var managers = data.results[i]["sakai:pooled-content-manager"];
                    for (var m = 0; m < managers.length; m++) {
                        if (managers[m] === sakai.data.me.user.userid ||
                        sakai.api.Groups.isCurrentUserAMember(managers[m], sakai.data.me)) {
                            manager = true;
                        }
                    }
                    data.results[i].canManage = manager;
                }
                var container = "#addarea_existing_everywhere_bottom";
                var context = "everywhere";
                if (library) {
                    container = "#addarea_existing_mylibrary_bottom";
                    context = "my_library";
                }
                // Render the results
                $(container).html(sakai.api.Util.TemplateRenderer("addarea_existing_bottom_template", {
                        data: data.results,
                        "context": context
                    })
                );
            }, json);
        };

        var handleSearch = function(ev){
            if(ev.keyCode === 13 || $(ev.currentTarget).hasClass("s3d-search-button") || $(ev.currentTarget).hasClass("addarea_existing_sort")){
                if($(".addarea_existing_container:visible").data("doc-type") !== "existing_currentlyviewing"){
                    $(".addarea_existing_bottom").html("");
                    getAllExistingSakaiDocs($(".addarea_existing_container:visible").find(".s3d-search-inputfield").val(), $(".addarea_existing_container:visible").data("doc-type") === "existing_mylibrary");
                } else {
                    $(".addarea_existing_bottom").html("");
                    getCurrentlyViewingDocs($(".addarea_existing_container:visible").find(".s3d-search-inputfield").val());
                }
            }
        };

        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /*
         * Shows the jqModal overlay for adding areas
         */
        var initializeJQM = function(){
            sakai.api.Util.Modal.setup($addAreaContainer, {
                modal: true,
                overlay: 20,
                toTop: true,
                onClose: resetWidget
            });
            centerOverlay();
            sakai.api.Util.Modal.open($addAreaContainer);
        };

        /*
         * Renders the widget page
         */
        var renderWidgets = function() {
            var widgets = [];
            var nameSet = false;
            for (var widget in sakai.widgets) {
                if (sakai.widgets[widget].sakaidocs) {
                    if (!nameSet) {
                        $('#addarea_widgets_name').val(sakai.api.Widgets.getWidgetTitle(sakai.widgets[widget].id));
                        nameSet = true;
                    }
                    widgets.push(sakai.widgets[widget]);
                }
            }
            $('#addarea_widgets_widget').html(sakai.api.Util.TemplateRenderer('addarea_widgets_widget_container', {data: widgets, sakai: sakai}));
        };

        /*
         * Add binding to elements in the widget
         */
        var addBinding = function(){
            $(addAreaNavigationButton).click(switchNavigation);
            $(addareaCreateDocButton).click(determineDocContext);
            $(addAreaExistingCurrentlyViewingInput).live("keyup", handleSearch);
            $(addAreaExistingEverywhereSearchInput).live("keyup", handleSearch);
            $(addAreaExistingMyLibrarySearchInput).live("keyup", handleSearch);
            $(".addarea_existing_sort").live("change", handleSearch);
            $(".s3d-search-button", $rootel).click(handleSearch);
            $("#addarea_widgets_widget").change(function(){
                $("#addarea_widgets_name").val(sakai.api.Widgets.getWidgetTitle($(this).val()));
            });
            $(addareaExistingItem).live("click", function(){
                $(addareaExistingItem).removeClass("selected");
                $(this).addClass("selected");
                $(".addarea_existing_container:visible").find(".addarea_existing_permissions").html(
                    sakai.api.Util.TemplateRenderer("addarea_permissions_template", {
                        "canManage": $(this).data("can-manage"),
                        "groupVisibility": sakai_global.group.groupData["sakai:group-visible"],
                        "newDoc": false
                    })
                );
                $(".addarea_existing_container:visible").find(".addarea_existing_name").val($(this).data("doc-title"));
                checkTitleProvided();
            });
            $(".addarea_name_field").live("keyup", checkTitleProvided);
        };

        /*
         * Binding to enable the Widget to be initialised from outside of the Widget
         */
        $(window).bind("addarea.initiate.sakai", function(){
            resetWidget();
            initializeJQM();
            renderWidgets();
        });

        addBinding();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("addarea");
});
