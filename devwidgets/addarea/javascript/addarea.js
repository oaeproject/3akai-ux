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
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

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

        //default, private, logged in only (if goup visible for logged in), public (if group public), advanced

        // Containers
        var $addareaContentsContainerDescription = $("#addarea_contents_container_description");
        var $addareaContentsContainerForm = $("#addarea_contents_container_form");

        // Classes
        var addareaContentsSelectedListItemClass = "addarea_contents_selected_list_item";

        // Templates
        var addareaContentsContainerDescriptionTemplate = "addarea_contents_container_description_template";

        // Elements
        var addareaContentsListItem = ".addarea_contents_list_item";
        var addareaContentsSelectedListItem = ".addarea_contents_selected_list_item";
        var addareaContentsListFirstItem = "#addarea_contents_list_first_item";
        var addareaSelectTemplate = ".addarea_select_template";

        var context = "";

        // Mapping
        var descriptionMap = {
            "pages": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "PAGE_AUTHORING_AND_WIDGETS"),
            "sakaidoc": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "FIND_EXISTING_CONTENT_AND"),
            "dashboardoverview": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "AN_OVERVIEW_OF_CURRENT_ACTIVITY"),
            "participantlist": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "PARTICIPATING_PEOPLE_AND_GROUPS"),
            "timetable": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "KEEP_TRACK_OF_EVENTS_IN_A_TIMETABLE"),
            "contentlibrary": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "DISPLAY_A_LIBRARY_OF_CONTENT_ITEMS"),
            "widgetpage": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "DISPLAY_WIDGETS_ON_A_PAGE"),
            "sakaitwotool": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "UTILISE_A_PREVIOUS_SAKAI_TOOL")
        };

        var switchSelection = function($el){
            $(addareaContentsSelectedListItem).removeClass(addareaContentsSelectedListItemClass);
            $el.addClass(addareaContentsSelectedListItemClass);
        };

        var renderDescription = function(){
            if(!$(this).hasClass(addareaContentsSelectedListItemClass)){
                context = $(this).attr("data-context");
                var areadescription = descriptionMap[context];
                switchSelection($(this));
                $addareaContentsContainerDescription.html(sakai.api.Util.TemplateRenderer(addareaContentsContainerDescriptionTemplate, {
                    areadescription: areadescription,
                    context: context,
                    group: sakai_global.group.groupData
                }));
                $addareaContentsContainerForm.hide();
                $("#addarea_action_buttons").hide();
                $addareaContentsContainerForm.html("");
            }
        };

        /**
         * Render the form
         * @param {Boolean} true when the template should be rendered
         * @param {Object} data contains data relating to the context of the clicked item in the left hand list
         */
        var renderForm = function(success, data){
            if (success) {
                $addareaContentsContainerForm.html(sakai.api.Util.TemplateRenderer("addarea_" + context + "_form_template", {
                    context: context,
                    data: data,
                    group: sakai_global.group.groupData
                }));
                $(addareaSelectTemplate).hide();

                var width = "250px";
                if(context == "sakaidoc"){
                    width = "500px";
                }
                if (context === "sakaidoc"){
                    showSearchResults();
                }

                $("#addarea_action_buttons").show();
                $("#addarea_create_new_area").attr("disabled", true);

                $addareaContentsContainerForm.css({"width":"1px","display":"block"}).animate({
                    width: width
                }, 300, "linear");
            }
        };

        /////////////////////////////////////
        // Dealing with listing Sakai Docs //
        /////////////////////////////////////

        var selectedSakaiDoc = false;
        var selectedCanManage = false;

        var showSearchResults = function(query){
            selectedSakaiDoc = false;
            selectedCanManage = false;
            checkExistingReady();
            var url = "/var/search/pool/all.infinity.json";
            if (!query){
                url = "/var/search/pool/all-all.infinity.json";
            }
            sakai.api.Server.loadJSON(url,
                function(success, data){
                    var sortOrder = $("#addarea_sakaidoc_existingdocs_sort").val();
                    data.results.sort(filenameSort);
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
                    // Render the results
                    $("#addarea_sakaidoc_existingdocscontainer").html(sakai.api.Util.TemplateRenderer("addarea_existing_sakaidoc_template", {
                        data: data
                    }));
                }, {
                    q: query,
                    items: 50
                }
            );
        };

        $("#addarea_sakaidoc_search_clear").live("click", function(){
            var searchquery = $.trim($("#addarea_sakaidoc_searchfield").val());
            if (searchquery){
                $("#addarea_sakaidoc_searchfield").val("");
                showSearchResults();
            }
        });

        $("#addarea_sakaidoc_searchfield").live("keyup", function(ev){
            if (ev.keyCode === 13){
                var searchquery = $.trim($("#addarea_sakaidoc_searchfield").val());
                showSearchResults(searchquery);
            }
        });

        $("#addarea_sakaidoc_existingdocs_sort").live("change", function(ev){
            var searchquery = $.trim($("#addarea_sakaidoc_searchfield").val());
            showSearchResults(searchquery);
        });

        var filenameSort = function(a, b){
            return a["sakai:pooled-content-file-name"] > b["sakai:pooled-content-file-name"];
        };

        $(".addarea_existing_sakaidoc_item").live("click", function(){
            $(".addarea_existing_sakaidoc_item").removeClass("addarea_existing_sakaidoc_item_selected");
            $(this).addClass("addarea_existing_sakaidoc_item_selected");
            selectedSakaiDoc = $(this).data("sakai-poolid");
            selectedCanManage = $(this).data("sakai-manage");
            $("#addarea_sakaidoc_permissions").html(sakai.api.Util.TemplateRenderer("addarea_existing_sakaidoc_visibility_template", {
                canManage: selectedCanManage,
                group: sakai_global.group.groupData
            }));
            checkExistingReady();
        });

        ///////////////////////////////////
        // Rendering the different panes //
        ///////////////////////////////////

        /**
         * Decide to render the form straight away or fetch some data first
         */
        var decideRenderForm = function(){
            context = $(this).attr("data-context");
            if(context){
                if (context == "widgetpage") {
                    var widgets = [];
                    for (var widget in sakai.widgets){
                        if(sakai.widgets[widget].sakaidocs){
                            widgets.push(sakai.widgets[widget]);
                        }
                    }
                    renderForm(true, widgets);
                } else {
                    renderForm(true, {});
                }
            }
        };

        var addBinding = function(){
            $(addareaContentsListItem).bind("click", renderDescription);
            $(addareaSelectTemplate).live("click", decideRenderForm);
            sakai.api.Util.hideOnClickOut(".addarea_dropdown", "#group_create_new_area", toggleOverlay);
        };

        var doInit = function(){
            addBinding();
            $(addareaContentsListFirstItem).click();
        };

        ////////////////////////
        // Creating new areas //
        ////////////////////////

        $("#addarea_create_new_area").live("click", function(){
            switch(context){
                case "pages":
                    createNewSakaiDoc();
                    break;
                case "sakaidoc":
                    createExistingSakaiDoc();
                    break;
                case "participantlist":
                    createParticipantsList();
                    break;
                case "contentlibrary":
                    createContentLibrary();
                    break;
                case "widgetpage":
                    createWidgetPage();
                    break;
                case "sakaitwotool":
                    createSakai2Tool();
                    break;
                default:
                  debug.warn("unrecognized area type: " + context);
                  break;
            }
        });

        var createExistingSakaiDoc = function(){
            var docTitle = $("#addarea_sakaidoc_page_name").val();
            var docPermission = $("#addarea_sakaidoc_permissions").val();
            var docId = selectedSakaiDoc;
            var existingNotMine = !selectedCanManage;
            var nonEditable = false;
            setSakaiDocPermissions(docId, docId, docPermission, existingNotMine, function(poolId){
                addSakaiDocToWorld(poolId, poolId, docTitle, docPermission, nonEditable, existingNotMine, function(poolId, path){
                    selectPageAndShowPermissions(poolId, path, docPermission);
                });
            });
        };

        var createNewSakaiDoc = function(){
            var docTitle = $("#addarea_pages_page_name").val();
            var docPermission = $("#addarea_pages_permissions").val();
            var numPages = parseInt($("#addarea_pages_numberofpages").val(), 10);
            var nonEditable = false;
            var pageContents = [];
            for (var i = 0; i < numPages; i++){
                // TODO put this in config.js
                pageContents.push("Default Content");
            }
            createSakaiDoc(docTitle, docPermission, pageContents, false, {}, nonEditable, function(poolId, urlName){
                setSakaiDocPermissions(urlName, poolId, docPermission, false, function(poolId1){
                    addSakaiDocToWorld(urlName, poolId1, docTitle, docPermission, nonEditable, false, function(poolId2, path){
                        selectPageAndShowPermissions(poolId2, path, docPermission);
                    });
                });
            });
        };

        var createParticipantsList = function(){
            var docTitle = $("#addarea_participantlist_page_name").val();
            var docPermission = $("#addarea_participantlist_permissions").val();
            var widgetID = sakai.api.Util.generateWidgetId();
            var pageContents = ["<img id='widget_participants_" + widgetID + "' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'></p>"];
            var nonEditable = true;
            var widgetContents = {};
            widgetContents[widgetID] = {
                participants: {
                    "groupid": sakai_global.group.groupId
                }
            };
            createSakaiDoc(docTitle, docPermission, pageContents, "participants", widgetContents, nonEditable, function(poolId, urlName){
                setSakaiDocPermissions(urlName, poolId, docPermission, false, function(poolId1){
                    addSakaiDocToWorld(urlName, poolId1, docTitle, docPermission, nonEditable, false, function(poolId2, path){
                        selectPageAndShowPermissions(poolId2, path, docPermission);
                    });
                });
            });
        };

        var createContentLibrary = function(){
            var docTitle = $("#addarea_contentlibrary_page_name").val();
            var docPermission = $("#addarea_contentlibrary_permissions").val();
            var widgetID = sakai.api.Util.generateWidgetId();
            var pageContents = ["<img id='widget_mylibrary_" + widgetID + "' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'></p>"];
            var nonEditable = true;
            var widgetContents = {};
            widgetContents[widgetID] = {
                mylibrary: {
                    "groupid": sakai_global.group.groupId
                }
            };
            createSakaiDoc(docTitle, docPermission, pageContents, "library", widgetContents, nonEditable, function(poolId, urlName){
                setSakaiDocPermissions(urlName, poolId, docPermission, false, function(poolId1){
                    addSakaiDocToWorld(urlName, poolId1, docTitle, docPermission, nonEditable, false, function(poolId2, path){
                        selectPageAndShowPermissions(poolId2, path, docPermission);
                    });
                });
            });
        };

        var createWidgetPage = function(){
            var docTitle = $("#addarea_widgetpage_page_name").val();
            var docPermission = $("#addarea_widgetpage_permissions").val();
            var selectedWidget = $("#addarea_widgetpage_selectwidget").val();
            var widgetID = sakai.api.Util.generateWidgetId();
            var avatar = "";
            var widgetContents = {};
            for (var widget in sakai.widgets) {
                if (sakai.widgets[widget].id === selectedWidget){
                    avatar = sakai.widgets[widget].img;
                    if (sakai.widgets[widget].defaultConfiguration) {
                        widgetContents[widgetID] = sakai.widgets[widget].defaultConfiguration;
                    }
                    break;
                }
            }
            var pageContents = ["<img id='widget_" + selectedWidget + "_" + widgetID + "' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='" + avatar + "' data-mce-src='" + avatar + "' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'></p>"];
            var nonEditable = false;
            createSakaiDoc(docTitle, docPermission, pageContents, false, widgetContents, nonEditable, function(poolId, urlName){
                setSakaiDocPermissions(urlName, poolId, docPermission, false, function(poolId1){
                    addSakaiDocToWorld(urlName, poolId1, docTitle, docPermission, nonEditable, false, function(poolId2, path){
                        selectPageAndShowPermissions(poolId2, path, docPermission);
                    });
                });
            });
        };

        var createSakai2Tool = function(){
            // TODO: Have to wait until the Sakai 2 integration works
        };

        /////////////////////////
        // Actual doc creation //
        /////////////////////////

        var getTotalCount = function(structure){
            var total = 0;
            for (var i in structure){
                total++;
            }
            return total;
        };

        var fetchGroupRoles = function(){
            return $.parseJSON(sakai_global.group.groupData["sakai:roles"]);
        };

        var selectPageAndShowPermissions = function(poolId, path, docPermission){
            toggleOverlay();
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

        var addSakaiDocToWorld = function(urlName, poolId, docTitle, docPermission, nonEditable, existingNotMine, callback){
            // Refetch docstructure information
            $.ajax({
                 url: "/~" + sakai_global.group.groupId + "/docstructure.infinity.json",
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
                        if (role.allowManage){
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
                        "_order": getTotalCount(pubdata.structure0),
                        "_pid": poolId,
                        "_view": $.toJSON(newView),
                        "_edit": $.toJSON(newEdit),
                        "_nonEditable": nonEditable
                    };

                    // Store view and edit roles
                    sakai_global.group.pubdata.structure0 = pubdata.structure0;
                    sakai.api.Server.saveJSON("/~" + sakai_global.group.groupId + "/docstructure", {
                        "structure0": $.toJSON(pubdata.structure0)
                    }, function(){
                        callback(poolId, urlName);
                    });
                }
            });
        };

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
                if (role.allowManage){
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

        var createSakaiDoc = function(title, permission, pageContents, preferredTitle, widgetContents, nonEditable, callback){
            var batchRequests = [];
            var realPermission = permission;
            if (permission === "advanced"){
                realPermission = "private";
            }
            var parameters = {
                "sakai:pooled-content-file-name": title,
                "sakai:description": "",
                "sakai:permissions": permission,
                "sakai:copyright": "creativecommons",
                "sakai:custom-mimetype": "x-sakai/document"
            };

            // Prepare Sakai Doc
            var structure0 = {},
                toCreate = {};
            for (var i = 0; i < pageContents.length; i++) {
                var pageID = "",
                    pageTitle = "";

                // for multi-page creation, we don't care as much about the URL
                // since they're auto-generated pages
                if (pageContents.length > 1) {
                    pageTitle = "Page " + (i+1);
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
                    "_title": pageTitle,
                    "_order": i,
                    "_ref": refID,
                    "_nonEditable": nonEditable,
                    "main": {
                        "_title": pageTitle,
                        "_order": 0,
                        "_ref": refID,
                        "_nonEditable": nonEditable
                    }
                };

                toCreate = {};
                toCreate[refID] = {
                    "page": pageContents[i]
                };
                batchRequests.push({
                    method: "POST",
                    parameters: {
                        ":operation": "import",
                        ":contentType": "json",
                        ":replace": true,
                        ":replaceProperties": true,
                        "_charset_": "utf-8",
                        ":content": $.toJSON(toCreate)
                    }
                });
            }

            for (var j in widgetContents){
                toCreate = {};
                toCreate[j] = widgetContents[j];
                batchRequests.push({
                    method: "POST",
                    parameters: {
                        ":operation": "import",
                        ":contentType": "json",
                        ":replace": true,
                        ":replaceProperties": true,
                        "_charset_": "utf-8",
                        ":content": $.toJSON(toCreate)
                    }
                });
            }

            parameters["structure0"] = $.toJSON(structure0);
            $.ajax({
                url: "/system/pool/createfile",
                type:"POST",
                data: parameters,
                dataType: "json",
                success: function(data){
                    var poolId = data._contentItem.poolId;
                    var struct = $.parseJSON(data._contentItem.item.structure0);
                    var itemURLName = "";
                    if (pageContents.length === 1) {
                        // looks strange, I know, but this is how we get the key of the
                        // first element in struct, which is our URL name for this
                        for (itemURLName in struct) {
                            if (struct.hasOwnProperty(itemURLName)) {
                                break;
                            }
                        }
                    } else {
                        itemURLName = sakai.api.Util.makeSafeURL(title);
                    }
                    for (var b = 0; b < batchRequests.length; b++){
                        batchRequests[b].url = "/p/" + poolId + ".resource";
                    }
                    sakai.api.Server.batch(batchRequests, function(success2, data2) {
                        if (success2) {
                            callback(poolId, itemURLName);
                        }
                    });
                }
            });
        };

        ////////////////
        // Validation //
        ////////////////

        var checkEmpty = function(){
            var val = $.trim($(this).val());
            if (val){
                $("#addarea_create_new_area").removeAttr("disabled");
            } else {
                $("#addarea_create_new_area").attr("disabled", true);
            }
        };

        var checkExistingReady = function(){
            var pageName = $("#addarea_sakaidoc_page_name").val();
            if (pageName && selectedSakaiDoc){
                $("#addarea_create_new_area").removeAttr("disabled");
            } else {
                $("#addarea_create_new_area").attr("disabled", true);
            }
        };

        $("#addarea_pages_page_name").live("keyup", checkEmpty);
        $("#addarea_participantlist_page_name").live("keyup", checkEmpty);
        $("#addarea_contentlibrary_page_name").live("keyup", checkEmpty);
        $("#addarea_sakaitwotool_page_name").live("keyup", checkEmpty);
        $("#addarea_widgetpage_page_name").live("keyup", checkEmpty);
        $("#addarea_sakaidoc_page_name").live("keyup", checkExistingReady);

        ////////////////////////////////////
        // Hiding and showing the overlay //
        ////////////////////////////////////

        var toggleOverlay = function(){
            $("#addarea_widget").toggle();
        };

        ////////////////////////////
        // External event binding //
        ////////////////////////////

        $(window).bind("addarea.initiate.sakai", function(){
            toggleOverlay();
        });

        //////////./////////////////
        // Internal event binding //
        ////////////////////////////

        $("#addarea_cancel_new_area").live("click", function(){
            toggleOverlay();
        });

        ////////////////////
        // Initialization //
        ////////////////////

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("addarea");
});
