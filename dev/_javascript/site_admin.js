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

/*global $, Config, History, Querystring, sdata, sakai, tinyMCE, tinymce  */

sakai.site.site_admin = function(){


    /////////////////////////////
    // CONFIG and HELP VARS
    /////////////////////////////

    sakai.site.toolbarSetupReady = false;
    sakai.site.autosavecontent = false;
    sakai.site.isShowingDropdown = false;
    sakai.site.isShowingContext = false;
    sakai.site.newwidget_id = false;
    sakai.site.newwidget_uid = false;
    sakai.site.isEditingNewPage = false;
    sakai.site.oldSelectedPage = false;
    sakai.site.mytemplates = false;
    sakai.site.showingInsertMore = false;

    // Cache all the jQuery selectors we can
    var $main_content_div = $("#main-content-div");
    var $elm1_ifr = $("#elm1_ifr");
    var $elm1_toolbar1 = $("#elm1_toolbar1");
    var $elm1_toolbar2 = $("#elm1_toolbar2");
    var $elm1_toolbar3 = $("#elm1_toolbar3");
    var $elm1_toolbar4 = $("#elm1_toolbar4");
    var $elm1_external = $("#elm1_external");
    var $toolbarplaceholder = $("#toolbarplaceholder");
    var $toolbarcontainer = $("#toolbarcontainer");
    var $insert_more_menu = $("#insert_more_menu");
    var $placeholderforeditor = $("#placeholderforeditor");
    var $context_menu = $("#context_menu");
    var $context_settings = $("#context_settings");
    var $more_menu = $("#more_menu");
    var $title_input_container = $("#title-input-container");
    var $fl_tab_content_editor = $("#fl-tab-content-editor");

    // TinyMCE selectors, please note that it is not possible to cache these
    // since they get created at runtime
    var elm1_menu_formatselect = "#menu_elm1_elm1_formatselect_menu";
    var elm1_menu_fontselect = "#menu_elm1_elm1_fontselect_menu";
    var elm1_menu_fontsizeselect = "#menu_elm1_elm1_fontsizeselect_menu";


    /////////////////////////////
    // tinyMCE FUNCTIONS
    /////////////////////////////

    /**
     * Initialise tinyMCE and run sakai.site.startEditPage() when init is complete
     * @return void
     */
    function init_tinyMCE() {

        // Init tinyMCE
        tinyMCE.init({

            // General options
            mode : "exact",
            elements : "elm1",
            theme: "advanced",
            // For a built-in list of plugins with doc: http://wiki.moxiecode.com/index.php/TinyMCE:Plugins
            plugins: "safari,advhr,advimage,advlink,inlinepopups,preview,noneditable,nonbreaking,xhtmlxtras,template",

            //Context Menu
            theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,|,spellchecker,|,image,link",
            theme_advanced_toolbar_location: "external",
            theme_advanced_toolbar_align: "left",
            theme_advanced_statusbar_location: "none",
            theme_advanced_resizing: false,
            handle_event_callback: "sakai.site.myHandleEvent",
            onchange_callback: "sakai.site.myHandleEvent",
            handle_node_change_callback: "sakai.site.mySelectionEvent",
            init_instance_callback: "sakai.site.startEditPage",

            // Example content CSS (should be your site CSS)
            content_css: Config.URL.TINY_MCE_CONTENT_CSS,

            // Drop lists for link/image/media/template dialogs
            template_external_list_url: "lists/template_list.js",
            external_link_list_url: "lists/link_list.js",
            external_image_list_url: "lists/image_list.js",
            media_external_list_url: "lists/media_list.js",

            // Use the native selects
            use_native_selects : true,

            // Replace tabs by spaces.
            nonbreaking_force_tab : true


        });
    }


    /**
     * Sets up the tinyMCE toolbar
     * @return void
     */
    var setupToolbar = function(){
        try {

            var $external_toolbar = $(".mceExternalToolbar");

            // Adjust iFrame
            $elm1_ifr.css({'overflow':'hidden', 'height':'auto'});
            $elm1_ifr.attr({'scrolling':'no','frameborder':'0'});

            if (!sakai.site.toolbarSetupReady) {
                $(".mceToolbarEnd").before($.Template.render("editor_extra_buttons", {}));
                $(".insert_more_dropdown_activator").bind("click", function(ev){ toggleInsertMore(); });
            }

            $external_toolbar.parent().appendTo(".mceToolbarExternal");
            $external_toolbar.show().css({"position":"static", 'border':'0px solid black'});
            $(".mceExternalClose").hide();

            // Toolbar visibility setup
            $elm1_toolbar1.hide();
            $elm1_toolbar2.hide();
            $elm1_toolbar3.hide();
            $elm1_toolbar4.hide();
            $(".mceToolbarRow2").hide();
            $(".mceToolbarRow3").hide();
            $elm1_toolbar1.show();
            $elm1_external.show();
            $external_toolbar.show();

            // Set the iFrame height, but make sure it is there
            setTimeout(sakai.site.setIframeHeight, 100, ['elm1_ifr']);

            // Position toolbar
            placeToolbar();
        }
        catch (err) {
            // Firefox throws strange error, doesn't affect anything
            // Ignore
        }
    };



    /**
     * Position tinyMCE toolbar
     * @return void
     */
    var placeToolbar = function(){

        sakai.site.minTop = $("#toolbarplaceholder").position().top;
        sakai.site.curScroll = document.body.scrollTop;

        if (sakai.site.curScroll === 0) {
            if (window.pageYOffset) {
                sakai.site.curScroll = window.pageYOffset;
            } else {
                sakai.site.curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
            }
        }
        var barTop = sakai.site.curScroll;
        $toolbarcontainer.css("width", ($("#toolbarplaceholder").width()) + "px");

        // Variable that contains the css for the tinyMCE menus
        var tinyMCEmenuCSS = {};

        // Check if the current scroll position is smaller then the top position of the toolbar
        if (barTop <= sakai.site.minTop) {

            // Set the position of the toolbar
            $toolbarcontainer.css({"position":"absolute", "top": sakai.site.minTop + "px"});

            // Set the position of the Insert more menu
            $insert_more_menu.css({"position": "absolute", "top":(sakai.site.minTop + 28) + "px"});

            // Set the positions of the native tinyMCE menus
            tinyMCEmenuCSS = {"position":"absolute", "top":(sakai.site.minTop + 30) + "px"};
            $(elm1_menu_formatselect).css(tinyMCEmenuCSS);
            $(elm1_menu_fontselect).css(tinyMCEmenuCSS);
            $(elm1_menu_fontsizeselect).css(tinyMCEmenuCSS);
        }
        else {

            // Set the position: fixed when you scroll down a site page
            tinyMCEmenuCSS = {"position":"fixed", "top":"30px"};
            $(elm1_menu_formatselect).css(tinyMCEmenuCSS);
            $(elm1_menu_fontselect).css(tinyMCEmenuCSS);
            $(elm1_menu_fontsizeselect).css(tinyMCEmenuCSS);

            $toolbarcontainer.css({"position":"fixed", "top":"0px"});
            $insert_more_menu.css({"position": "fixed", "top":"28px"});
        }

        $insert_more_menu.css("left",$("#insert_more_dropdown_main").position().left + $("#toolbarcontainer").position().left + 10 + "px");

        sakai.site.last = new Date().getTime();
    };


    /**
     * Set the correct iFrame height
     * @param {String} ifrm
     * @return void
     */
    sakai.site.setIframeHeight = function(ifrm){
        var iframeWin = window.frames[0];
        var iframeEl = document.getElementById ? document.getElementById(ifrm) : document.all ? document.all[ifrm] : null;
        if (iframeEl && iframeWin) {
            if (BrowserDetect.browser != "Firefox") {
                iframeEl.style.height = "auto";
            }
            var docHt = sakai.site.getDocHeight(iframeWin.document);
            if (docHt < sakai.site.minHeight) {
                docHt = sakai.site.minHeight;
            }
            if (docHt && sakai.site.cur != docHt) {
                iframeEl.style.height = docHt + 30 + "px"; // add to height to be sure it will all show
                sakai.site.cur = (docHt + 30);
                $("#placeholderforeditor").css("height", docHt + 60 + "px");
                window.scrollTo(0, sakai.site.curScroll);
                placeToolbar();
            }
        }
    };


    /**
     * tinyMCE event handler - This adjusts the editor iframe height according to content, whenever content changes
     * @param {Object} e
     * @return {Boolean} true to continue event
     */
    sakai.site.myHandleEvent = function(e){
        if (e.type == "click" || e.type == "keyup" || e.type == "mouseup" || !e || !e.type) {
            sakai.site.curScroll = document.body.scrollTop;

            if (sakai.site.curScroll === 0) {
                if (window.pageYOffset) {
                    sakai.site.curScroll = window.pageYOffset;
                } else {
                    sakai.site.curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
                }
            }
            sakai.site.setIframeHeight("elm1_ifr");
        }
        return true; // Continue handling
    };


    /**
     * tinyMCE selection event handler
     * @retun void
     */
    sakai.site.mySelectionEvent = function(){
        var ed = tinyMCE.get('elm1');
        $context_menu.hide();
        var selected = ed.selection.getNode();
        if (selected && selected.nodeName.toLowerCase() == "img") {
            if (selected.getAttribute("class") == "widget_inline"){
                $context_settings.show();
            } else {
                $context_settings.hide();
            }
            var pos = tinymce.DOM.getPos(selected);
            $context_menu.css({"top": pos.y + $("#elm1_ifr").position().top + 15 + "px", "left": pos.x + $("#elm1_ifr").position().left + 15 + "px"}).show();
        }
    };


    /**
     * Toggle Insert more dropdown
     * @return void
     */
    var toggleInsertMore = function(){
        if (sakai.site.showingInsertMore){
            $insert_more_menu.hide();
            sakai.site.showingInsertMore = false;
        } else {
            $insert_more_menu.show();
            sakai.site.showingInsertMore = true;
        }
    };



    //--------------------------------------------------------------------------------------------------------------
    //
    // EDIT PAGE
    //
    //--------------------------------------------------------------------------------------------------------------


    /////////////////////////////
    // EDIT PAGE: FUNCTIONALITY
    /////////////////////////////

    /**
     * Edit a page defined by its URL safe title
     * @param {String} pageid
     * @return void
     */
    var editPage = function(pageUrlName){

        // Init
        var hasopened = false;
        var pagetitle = "";
        sakai.site.inEditView = true;

        // Edit page title
        document.title = document.title.replace("Site View", "Page Edit");

        // UI init
        $more_menu.hide();
        $("#" + pageUrlName).html("");
        $main_content_div.children().css("display","none");

        // See if we are editing Navigation, if yes hide title bar
        if (pageUrlName === "_navigation"){
            $title_input_container.hide();
            sakai.site.isEditingNavigation = true;
        } else {
            $title_input_container.show();
            sakai.site.isEditingNavigation = false;
        }

        // Refresh site_info object
        sakai.site.refreshSiteInfo();

        // Get title
        pagetitle = sakai.site.site_info._pages[sakai.site.selectedpage]["pageTitle"];


        // Prefill page title
        $(".title-input").val(pagetitle);

        // Generate the page location
        showPageLocation();

        // Put content in editor
        var content = sakai.site.pagecontents[pageUrlName]["sakai:pagecontent"];
        tinyMCE.get("elm1").setContent(content);

        $("#messageInformation").hide();

        // Setup tinyMCE Toolbar
        setupToolbar();
        sakai.site.toolbarSetupReady = true;

        // Switch to edit view
        $("#show_view_container").hide();
        $("#edit_view_container").show();

        if (sakai.site.isEditingNavigation){
            $("#insert_more_media").hide();
            $("#insert_more_goodies").hide();
            $("#insert_more_sidebar").show();
        } else if (!sakai.site.isEditingNavigation){
            $("#insert_more_media").show();
            $("#insert_more_goodies").show();
            $("#insert_more_sidebar").hide();
        }

        // Show the autosave dialog if a previous autosave version is available
        $.ajax({
            url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "/pageContentAutoSave.json",
            cache: false,
            success: function(data){

                var autosave_node = $.evalJSON(data);

                if ((autosave_node["sakai:pagecontent"] !== "") && (sakai.site.pagecontents[pageUrlName] !== autosave_node["sakai:pagecontent"])){
                    sakai.site.autosavecontent = autosave_node["sakai:pagecontent"];
                    $('#autosave_dialog').jqmShow();
                } else {
                    sakai.site.timeoutid = setInterval(sakai.site.doAutosave, sakai.site.autosaveinterval);
                }
                setTimeout('sakai.site.setIframeHeight("elm1_ifr")',0);

            },
            error: function(xhr, textStatus, thrownError) {
                sakai.site.timeoutid = setInterval(sakai.site.doAutosave, sakai.site.autosaveinterval);
            }
        });
    }


    /////////////////////////////
    // EDIT PAGE: CANCEL
    /////////////////////////////

    var cancelEdit = function() {

        clearInterval(sakai.site.timeoutid);

        $insert_more_menu.hide();
        $context_menu.hide();
        sakai.site.showingInsertMore = false;
        sakai.site.inEditView = false;

        // Edit page title
        document.title = document.title.replace("Page Edit", "Site View");

        // Remove autosvae file
        //removeAutoSaveFile();

        if (sakai.site.isEditingNewPage) {

            // Delete page from site_info if exists
            if (sakai.site.site_info._pages[sakai.site.selectedpage]) {
                delete sakai.site.site_info._pages[sakai.site.selectedpage];
            }

            // Delete page from pagecontents if exists
            if (sakai.site.pagecontents[sakai.site.selectedpage]) {
                delete sakai.site.pagecontents[sakai.site.selectedpage];
            }

            // Display previous page content
            $("#" + sakai.site.selectedpage).show();

            // Delete the folder that has been created for the new page
            $.ajax({
                url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"],
                type: 'DELETE'
            });

            // Adjust selected page back to the old page
            sakai.site.selectedpage = sakai.site.oldSelectedPage;

            // Switch back view
            $("#edit_view_container").hide();
            $("#show_view_container").show();

        } else {

            // Switch to text editor
            switchToTextEditor();

            // Put back original content
            $("#" + sakai.site.selectedpage).html(sakai.site.pagecontents[sakai.site.selectedpage]["sakai:pagecontent"]);

            if (sakai.site.site_info._pages[sakai.site.selectedpage]["pageType"] === "webpage") {
                $("#webpage_edit").show();
            }

            $("#" + sakai.site.selectedpage).show();
            sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage,null,sakai.site.currentsite.id + "/_widgets");

            // Switch back to view mode
            $("#edit_view_container").hide();
            $("#show_view_container").show();

        }
    };




    /////////////////////////////
    // EDIT PAGE: SAVE
    /////////////////////////////

    /**
     * Determine the highest position number of a page
     * @returns {Int} The highest page position number in the cached site info object
     */
    var determineHighestPosition = function(){
        var highest = 0;
        for (var i in sakai.site.site_info._pages){
            if (sakai.site.site_info._pages[i]["pagePosition"] && parseInt(sakai.site.site_info._pages[i]["pagePosition"], 10) > highest){
                highest = parseInt(sakai.site.site_info._pages[i]["pagePosition"], 10);
            }
        }
        return highest;
    };

    /**
     * Check if the content is empty or not
     * @param {String} content The content of the WYSIWYG editor
     */
    var checkContent = function(content){
        if(!content.replace(/ /g,"%20")) {
            alert("Please enter some content");
            return false;
        }else{
            return true;
        }
    };

    /**
     * Save page
     * General function which saves content and metadata of a page
     * @param url {String} URL of the page which needs to be saved
     * @param type {String} type of page ( "webpage", "dashboard" )
     * @param title {String} title of the page
     * @param content {String} content of the page
     * @param position {Int} Position value of the page
     * @param acl {String} Access Control ("parent" to inherit parent node's ACLs)
     * @param callback {Function} Callback function which is executed at the end of the operation (data/xhr,true/false)
     * @returns void
     */
    sakai.site.savePage = function(url, type, title, content, position, acl, callback) {

        // acl argument is not used now but will be later probably

        var site_data_string = $.toJSON({
            "sling:resourceType": "sakai/page",
            "pageTitle": title,
            "pageType": type,
            "pagePosition": position,
            "_charset_":"utf-8",
            "pageContent": {
                "sling:resourceType": "sakai/pagecontent",
                "_charset_":"utf-8",
                "sakai:pagecontent": content
            }
        });

        $.ajax({
            url: url,
            type: "POST",
            data: {
                ":operation": "createTree",
                "tree": site_data_string
            },
            success: function(data) {
                callback(true, data);
            },
            error: function(xhr, textStatus, thrownError) {
                callback(false, xhr);
            }
        });
    };

    /**
     * Updates the content node of a page
     * @param url {String} URL of the page node we are updating
     * @param content {String} The new content
     * @param callback {Function} Callback function which is called at the end of the operation
     * @returns void
     */
    sakai.site.updatePageContent = function(url, content, callback) {

        var jsonString = $.toJSON({"pageContent": { "sling:resourceType": "sakai/pagecontent", "_charset_":"utf-8", "sakai:pagecontent": content }});

        $.ajax({
            url: url,
            type: "POST",
            data: {
                ":operation": "createTree",
                "tree": jsonString
            },
            success: function(data) {
                callback(true, data);
            },
            error: function(xhr, textStatus, thrownError) {
                callback(false, xhr);
            }
        });
    }


    /**
     * Get the content inside the TinyMCE editor
     */
    var getContent = function(){
        return tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
    };

    var saveEdit = function() {

        // Clear timeout
        clearInterval(sakai.site.timeoutid);
        $("#context_menu").hide();

        // Remove autosave
        removeAutoSaveFile();

        // Edit page title
        document.title = document.title.replace("Page Edit", "Site View");

        $insert_more_menu.hide();
        sakai.site.showingInsertMore = false;

        switchToTextEditor();

        if (sakai.site.isEditingNavigation){

            // Save Navigation Edit
            saveEdit_Navigation();

        } else {

            // Other page

            // Check whether there is a pagetitle
            var newpagetitle = $("#title-input").val();
            if (!newpagetitle.replace(/ /g,"%20")){
                alert('Please specify a page title');
                return;
            }

            // Check whether the pagetitle has changed
            var oldpagetitle = sakai.site.site_info._pages[sakai.site.selectedpage]["pageTitle"];

            // Get the content from tinyMCE
            var content = getContent();

            // Check if the content is empty or not
            if(!checkContent(content)){
                return;
            }

            // If there is a title change
            if (oldpagetitle !== newpagetitle) {

                // Take care of title change
                saveEdit_RegisterTitleChange(newpagetitle, content);

            } else {

                // See if we are editing a completely new page
                if (sakai.site.isEditingNewPage) {

                    // Save page and content
                    var newurl = sakai.site.selectedpage.split("/").join("/_pages/");
                    sakai.site.savePage("/sites/" + sakai.site.currentsite.id + "/_pages/" + newurl, "webpage", newpagetitle, content, ("" + (determineHighestPosition() + 100000)), "parent", function(success, return_data){

                        if (success) {

                            // Remove old div + potential new one
                            $("#" + sakai.site.selectedpage).remove();

                            // Remove old + new from sakai.site.pagecontents array
                            sakai.site.pagecontents[sakai.site.selectedpage] = {};

                            // Switch back to view mode
                            $("#edit_view_container").hide();
                            $("#show_view_container").show();

                            // Save the recent activity
                            var activityItem = {
                                "user_id": sdata.me.user.userid,
                                "type": "page_create",
                                "page_id": sakai.site.selectedpage,
                                "site_id": sakai.site.currentsite.id
                            };
                            sakai.siterecentactivity.addRecentActivity(activityItem);

                            // Check in new page content to revision history
                            $.ajax({
                                url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "/pageContent.save.html",
                                type: "POST"
                            });

                        } else {

                            // Page node save wasn't successful
                            fluid.log("site_admin.js: Failed to save page node while saving a new page!");
                        }

                    });

                }
                else {

                    // We are editing an existing page
                    if (sakai.site.site_info._pages[sakai.site.selectedpage]["pageType"] === "webpage") {
                        $("#webpage_edit").show();
                    }

                    // Store page contents
                    sakai.site.pagecontents[sakai.site.selectedpage]["sakai:pagecontent"] = getContent();

                    // Put page contents into html
                    $("#" + sakai.site.selectedpage).html(sakai.site.pagecontents[sakai.site.selectedpage]["sakai:pagecontent"]);

                    // Switch back to view mode
                    $("#edit_view_container").hide();
                    $("#show_view_container").show();

                    $("#" + sakai.site.selectedpage).show();
                    sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage,null,sakai.site.currentsite.id + "/_widgets");

                    // Save page node
                    sakai.site.updatePageContent(sakai.site.site_info._pages[sakai.site.selectedpage]["path"], sakai.site.pagecontents[sakai.site.selectedpage]["sakai:pagecontent"], function(success, data){

                        if (success) {
                            // Save the recent activity
                            var activityItem = {
                                "user_id": sdata.me.user.userid,
                                "type": "page_edit",
                                "page_id": sakai.site.selectedpage,
                                "site_id": sakai.site.currentsite.id
                            };
                            sakai.siterecentactivity.addRecentActivity(activityItem);

                            // Check in new page content to revision history
                            $.ajax({
                                url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "/pageContent.save.html",
                                type: "POST"
                            });

                        } else {
                            // Page node save wasn't successful
                            fluid.log("site_admin.js/saveEdit(): Failed to update page content while saving existing page: " + sakai.site.currentsite.id);
                        }
                    });
                }
            }
        }

        // Re-render Site Navigation to reflect changes
        if (sakai.site.navigation) {
            sakai.site.navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);
        }

        sakai.site.inEditView = false;
    };


    var saveEdit_Navigation = function() {

        // Navigation
        sakai.site.pagecontents._navigation = getContent();
        $("#page_nav_content").html(sakai.site.pagecontents._navigation);

        var escaped = sakai.site.escapePageId(sakai.site.selectedpage);
        document.getElementById(escaped).style.display = "block";

        $("#edit_view_container").hide();
        $("#show_view_container").show();

        sdata.widgets.WidgetLoader.insertWidgets("page_nav_content",null,sakai.site.currentsite.id + "/_widgets");
        sdata.widgets.WidgetPreference.save(sakai.site.urls.SITE_NAVIGATION(), "content", sakai.site.pagecontents._navigation, function(){});

        document.getElementById(escaped).style.display = "block";
        sdata.widgets.WidgetLoader.insertWidgets(escaped,null,sakai.site.currentsite.id + "/_widgets");

    };


    var saveEdit_RegisterTitleChange = function(newpagetitle, content) {

        // Generate new page id
        var newid = "";
        var counter = 0;
        var baseid = sakai.site.createURLSafeTitle(newpagetitle);
        var basefolder = "";

        if (sakai.site.inEditView !== false && sakai.site.inEditView !== true){
            var abasefolder = sakai.site.inEditView.split("/");
            for (i = 0; i < abasefolder.length - 1; i++){
                basefolder += abasefolder[i] + "/";
            }
        } else {
            var abasefolder2 = sakai.site.selectedpage.split("/");
            for (i = 0; i < abasefolder2.length - 1; i++){
                basefolder += abasefolder2[i] + "/";
            }
        }

        baseid = basefolder + baseid;

        while (!newid){
            var testurl = "/sites/" + sakai.site.currentsite.id + "/_pages/" + newid.split("/").join("/_pages/");
            var testid = testurl.replace(/[\/-]/g,"");
            if (counter > 0){
                testid += "-" + counter;
            }
            counter++;
            var exists = false;
            if (sakai.site.site_info._pages[testid]) {
                exists = true;
            }
            if (!exists){
                newid = testid;
            }
        }


        // Create new node URL
        var newfolderpath = "/sites/" + sakai.site.currentsite.id + "/_pages/" + newid.split("/").join("/_pages/");

        // Move page
        sakai.site.movePage(sakai.site.site_info._pages[sakai.site.selectedpage]["path"], newfolderpath, content, "webpage", newpagetitle, function() {

            // Switch to view mode
            $("#edit_view_container").hide();
            $("#show_view_container").show();

        });
    };


    /**
     * Moves a page within a Sakai site
     * @param src_url {String} The URL of the the page we want to move
     * @param tgt_url {String} The URL of the new page location
     * @param i_content {String} The content of the new page - otional - default: current page content
     * @param i_page_type {String} The type of the page - optional - "webpage" or "dashboard" - default: "webpage"
     * @param i_page_title {String} The title of the new page - optional - default: current page title
     * @param callback {Function} Callback function which is called when the operation is successful
     */
    sakai.site.movePage = function(src_url, tgt_url, i_content, i_page_type, i_page_title, callback) {

        var page_content = i_content || sakai.site.pagecontents[sakai.site.selectedpage];
        var page_type = i_page_type || "webpage";
        var page_title = i_page_title || sakai.site.site_info._pages[sakai.site.selectedpage]["pageTitle"];
        var src_urlsafetitle = src_url.replace(/[\/-]/g,"");
        var tgt_urlsafetitle = tgt_url.replace(/[\/-]/g,"");


        // Delete current page node
        $.ajax({
            url: src_url,
            type: "DELETE",
            success: function(data) {

                // Remove content html tags
                $("#" + sakai.site.selectedpage).remove();
                $("#" + src_urlsafetitle).remove();

                // Remove old + new from sakai.site.pagecontents array
                delete sakai.site.pagecontents[sakai.site.selectedpage];
                delete sakai.site.pagecontents[src_urlsafetitle];

                // Save the recent activity
                var activityItem = {
                    "user_id": sdata.me.user.userid,
                    "type": "page_create",
                    "page_id": src_urlsafetitle,
                    "site_id": sakai.site.currentsite.id
                };
                sakai.siterecentactivity.addRecentActivity(activityItem);
            }
        });

        sakai.site.savePage(tgt_url, page_type, page_title, page_content, ("" + (determineHighestPosition() + 100000)), "parent", function(success, return_data){

            if (success) {
                // Refresh site info
                sakai.site.refreshSiteInfo(tgt_urlsafetitle);

                // Check in new page content to revision history
                $.ajax({
                    url: tgt_url + "/pageContent.save.html",
                    type: "POST"
                });

                callback();

            } else {
                fluid.log("site_admin.js/movePage(): Failed to create new page node for moved page!");
            }

        });
    }


    /////////////////////////////
    // EDIT PAGE: GENERAL
    /////////////////////////////

    // Bind Edit page link click event
    $("#edit_page").bind("click", function(ev){
        sakai.site.isEditingNewPage = false;
        sakai.site.inEditView = true;

        //Check if tinyMCE has been loaded before - probably a more robust check will be needed
        if (tinyMCE.activeEditor === null) {
            init_tinyMCE();
        } else {
            editPage(sakai.site.selectedpage);
        }

        return false;
    });


    // Bind cancel button click
    $(".cancel-button").bind("click", function(ev){
        cancelEdit();
    });

    // Bind Save button click
    $(".save_button").bind("click", function(ev){
        saveEdit();
    });


    /**
     * Callback function to trigger editPage() when tinyMCE is initialised
     * @return void
     */
    sakai.site.startEditPage = function() {

        // Check wether we will edit navigation bar or normal page
        if (sakai.site.isEditingNavigation)
            {
                editPage("_navigation");
            } else {
                editPage(sakai.site.selectedpage);
            }

    };




    //--------------------------------------------------------------------------------------------------------------
    //
    // PAGE LOCATION
    //
    //--------------------------------------------------------------------------------------------------------------

    /**
     * Displays current page's location within a site, also adds a 'Move...' button
     * @return void
     */
    var showPageLocation = function(){

        $("#new_page_path").html("<div><span>Page location:</span>" + sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "</div>"); //&nbsp;<div class="buttonBar"><div class="lightgreybutton"><a id="move_inside_edit" href="javascript:;" name="somename" class="button">Move...</a></div></div>');

        // Bind Move... button's click event to its functionality
        $("#move_inside_edit").bind("click", function(ev){
            window.scrollTo(0,0);
            $('#move_dialog').jqmShow();
        });

    };











    //--------------------------------------------------------------------------------------------------------------
    //
    // AUTOSAVE
    //
    //--------------------------------------------------------------------------------------------------------------

    /**
     * Autosave functionality
     * @return void
     */
    sakai.site.doAutosave = function(){

        var tosave = "";

        //Get content to save according to which view (tab) is the editor in
        if (!sakai.site.currentEditView){
            tosave = tinyMCE.get("elm1").getContent();
        } else if (sakai.site.currentEditView === "html"){
            tosave = $("#html-editor-content").val();
        }

        // Save the data
        var jsonString = $.toJSON({"pageContentAutoSave": { "_charset_": "utf-8", "sakai:pagecontent": tosave }});
        $.ajax({
            url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"],
            type: "POST",
            data: {
                ":operation": "createTree",
                "tree": jsonString
            },
            success: function(data) {
                sakai.site.autosavecontent = tosave;
            }
        });

        // Update autosave indicator
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        $("#realtime").text(("00" + hours).slice(-2) + ":" + ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2));
        $("#messageInformation").show();

    };


    /**
     * Hide Autosave
     * @param {Object} hash
     * @return void
     */
    var hideAutosave = function(hash){

        hash.w.hide();
        hash.o.remove();
        sakai.site.timeoutid = setInterval(sakai.site.doAutosave, sakai.site.autosaveinterval);
        removeAutoSaveFile();

    };


    /**
     * Remove autosave file from JCR
     * @return void
     */
    var removeAutoSaveFile = function(){

        // Remove autosave file
        if (sakai.site.autosavecontent) {
            $.ajax({
                url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "/pageContentAutoSave",
                type: 'DELETE'
            });
        }

    };


    // Bind autosave click
    $("#autosave_revert").bind("click", function(ev){
        tinyMCE.get("elm1").setContent(sakai.site.autosavecontent);
        $('#autosave_dialog').jqmHide();
    });


    // Init autosave dialogue modal
    $('#autosave_dialog').jqm({
        modal: true,
        trigger: $('.autosave_dialog'),
        overlay: 20,
        toTop: true,
        onHide: hideAutosave
    });







    //--------------------------------------------------------------------------------------------------------------
    //
    // WIDGET CONTEXT MENU
    //
    //--------------------------------------------------------------------------------------------------------------


    //////////////////////////////////////
    // WIDGET CONTEXT MENU: SETTINGS
    //////////////////////////////////////


    // Bind Widget Context Settings click event
    $("#context_settings").bind("click", function(ev){
        var ed = tinyMCE.get('elm1');
        var selected = ed.selection.getNode();
        $("#dialog_content").hide();
        if (selected && selected.nodeName.toLowerCase() == "img" && selected.getAttribute("class") == "widget_inline") {
            $("#context_settings").show();
            var id = selected.getAttribute("id");
            var split = id.split("_");
            var type = split[1];
            var uid = split[2];
            var length = split[0].length + 1 + split[1].length + 1 + split[2].length + 1;
            var placement = id.substring(length);

            sakai.site.newwidget_id = type;

            $("#dialog_content").hide();

            if (Widgets.widgets[type]) {
                $('#insert_dialog').jqmShow();
                var nuid = "widget_" + type + "_" + uid;
                if (placement){
                    nuid += "_" + placement;
                }
                sakai.site.newwidget_uid = nuid;
                $("#dialog_content").html('<img src="' + Widgets.widgets[type].img + '" id="' + nuid + '" class="widget_inline" border="1"/>');
                $("#dialog_title").text(Widgets.widgets[type].name);
                sdata.widgets.WidgetLoader.insertWidgets("dialog_content", true,sakai.site.currentsite.id + "/_widgets");
                $("#dialog_content").show();
                $insert_more_menu.hide();
                sakai.site.showingInsertMore = false;
            }
        }

        $("#context_menu").hide();

    });

    // Bind Context menu settings hover event
    $("#context_settings").hover(
        function(over){
            $("#context_settings").addClass("selected_option");
        },
        function(out){
            $("#context_settings").removeClass("selected_option");
        }
    );



    //////////////////////////////////////
    // WIDGET CONTEXT MENU: REMOVE
    //////////////////////////////////////

    // Bind Widget Context Remove click event
    $("#context_remove").bind("click", function(ev){
        tinyMCE.get("elm1").execCommand('mceInsertContent', false, '');
    });


    // Bind Context menu remove hover event
    $("#context_remove").hover(
        function(over){
            $("#context_remove").addClass("selected_option");
        },
        function(out){
            $("#context_remove").removeClass("selected_option");
        }
    );



    //////////////////////////////////////
    // WIDGET CONTEXT MENU: WRAPPING
    //////////////////////////////////////

    /**
     * Show wrapping dialog
     * @param {Object} hash
     * @return void
     */
    var showWrappingDialog = function(hash){
        $("#context_menu").hide();
        window.scrollTo(0,0);
        hash.w.show();
    };

    /**
     * Create a new style
     * @param {Object} toaddin
     * @return void
     */
    var createNewStyle = function(toaddin){
        var ed = tinyMCE.get('elm1');
        var selected = ed.selection.getNode();
        if (selected && selected.nodeName.toLowerCase() == "img") {
            var style = selected.getAttribute("style").replace(/ /g, "");
            var splitted = style.split(';');
            var newstyle = '';
            for (var i = 0, j = splitted.length; i < j; i++) {
                var newsplit = splitted[i].split(":");
                if (newsplit[0] && newsplit[0] != "display" && newsplit[0] != "float") {
                    newstyle += splitted[i] + ";";
                }
            }
            newstyle += toaddin;
            newstyle.replace(/[;][;]/g,";");

            var toinsert = '<';
            toinsert += selected.nodeName.toLowerCase();
            for (i = 0, j = selected.attributes.length; i<j; i++){
                if (selected.attributes[i].nodeName.toLowerCase() == "style") {
                    toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + newstyle + '"';
                } else if (selected.attributes[i].nodeName.toLowerCase() == "mce_style") {
                    toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + newstyle + '"';
                } else {
                    toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + selected.attributes[i].nodeValue + '"';
                }
            }
            toinsert += '/>';

            //alert(ed.selection.getContent() + "\n" + selected.getAttribute("style"));

            tinyMCE.get("elm1").execCommand('mceInsertContent', true, toinsert);
        }
    };

    // Bind wrapping_no click event
    $("#wrapping_no").bind("click",function(ev){
        createNewStyle("display:block;");
        $('#wrapping_dialog').jqmHide();
    });

    // Bind wrapping left click event
    $("#wrapping_left").bind("click",function(ev){
        createNewStyle("display:block;float:left;");
        $('#wrapping_dialog').jqmHide();
    });

    // Bind wrapping right click event
    $("#wrapping_right").bind("click",function(ev){
        createNewStyle("display:block;float:right;");
        $('#wrapping_dialog').jqmHide();
    });

    // Init wrapping modal
    $('#wrapping_dialog').jqm({
            modal: true,
            trigger: $('#context_appearance_trigger'),
            overlay: 20,
            toTop: true,
            onShow: showWrappingDialog
        });


    //////////////////////////////////////
    // WIDGET CONTEXT MENU: GENERAL
    //////////////////////////////////////


    // Bind Context menu appereance hover event
    $("#context_appearance").hover(
        function(over){
            $("#context_appearance").addClass("selected_option");
        },
        function(out){
            $("#context_appearance").removeClass("selected_option");
        }
    );











    //--------------------------------------------------------------------------------------------------------------
    //
    // TABS
    //
    //--------------------------------------------------------------------------------------------------------------

    /////////////////////////////
    // TABS: TEXT EDITOR
    /////////////////////////////

    /**
     * Switch to Text Editor tab
     * @return void
     */
    var switchToTextEditor = function(){
        $fl_tab_content_editor.show();
        $toolbarplaceholder.show();
        $toolbarcontainer.show();
        $("#title-input").show();
        if (sakai.site.currentEditView == "preview"){
            $("#page_preview_content").hide().html("");
            $("#tab-nav-panel").show();
            $("#new_page_path").show();
            switchtab("preview","Preview","text_editor","Text Editor");
        } else if (sakai.site.currentEditView == "html"){
            var value = $("#html-editor-content").val();
            tinyMCE.get("elm1").setContent(value);
            $("#html-editor").hide();
            switchtab("html","HTML","text_editor","Text Editor");
        }
        sakai.site.currentEditView = false;
    };

    // Bind Text Editor tab click event
    $("#tab_text_editor").bind("click", function(ev){
        switchToTextEditor();
    });


    /////////////////////////////
    // TABS: HTML
    /////////////////////////////

    // Bind HTML tab click event
    $("#tab_html").bind("click", function(ev){
        $("#context_menu").hide();
        $("#fl-tab-content-editor").hide();
        $("#toolbarplaceholder").hide();
        $("#toolbarcontainer").hide();
        if (!sakai.site.currentEditView){
            switchtab("text_editor","Text Editor","html","HTML");
        } else if (sakai.site.currentEditView == "preview"){
            $("#page_preview_content").hide().html("");
            $("#tab-nav-panel").show();
            $("#new_page_path").show();
            switchtab("preview","Preview","html","HTML");
        }
        var value = tinyMCE.get("elm1").getContent();
        $("#html-editor-content").val(value);
        $("#html-editor").show();
        $("#title-input").show();
        sakai.site.currentEditView = "html";
    });



    /////////////////////////////
    // TABS: PREVIEW
    /////////////////////////////

    // Bind Preview tab click event
    $("#tab_preview").bind("click", function(ev){
        $("#context_menu").hide();
        $("#tab-nav-panel").hide();
        $("#new_page_path").hide();
        $("#html-editor").hide();
        $("#title-input").hide();
        $("#toolbarcontainer").hide();
        $("#fl-tab-content-editor").hide();
        $("#page_preview_content").html("").show();
        $("#toolbarplaceholder").hide();
        if (!sakai.site.currentEditView) {
            switchtab("text_editor","Text Editor","preview","Preview");
        } else if (sakai.site.currentEditView == "html"){
            var value = $("#html-editor-content").val();
            tinyMCE.get("elm1").setContent(value);
            switchtab("html","HTML","preview","Preview");
        }
        $("#page_preview_content").html("<h1 style='padding-bottom:10px'>" + $("#title-input").val() + "</h1>" + getContent());
        sdata.widgets.WidgetLoader.insertWidgets("page_preview_content",null,sakai.site.currentsite.id + "/_widgets");
        sakai.site.currentEditView = "preview";
    });



    /////////////////////////////
    // TABS: GENERAL
    /////////////////////////////

    /**
     * Switch between tabs
     * @param {String} inactiveid
     * @param {String} inactivetext
     * @param {String} activeid
     * @param {String} activetext
     * @return void
     */
    var switchtab = function(inactiveid, inactivetext, activeid, activetext){
        $("#tab_" + inactiveid).removeClass("fl-tabs-active").html('<a href="javascript:;">' + inactivetext + '</a>');
        $("#tab_" + activeid).addClass("fl-tabs-active").html('<a href="javascript:;">' + activetext + '</a>');
    };








    //--------------------------------------------------------------------------------------------------------------
    //
    // INSERT MORE
    //
    //--------------------------------------------------------------------------------------------------------------


    /////////////////////////////
    // INSERT MORE: INSERT LINK
    /////////////////////////////

    /**
     * Insert Link functionality - inserts a link into a page
     * @return void
     */
    var insertLink = function() {
        var chosen = false;
        try {
            chosen = simpleTreeCollection.get(0).getSelected().attr("id");
        } catch (err){
            alert("Insert Link: No chosen link.");
        }
        if (!chosen){
            return false;
        }

        var editor = tinyMCE.get("elm1");
        var selection = editor.selection.getContent();
        if (selection) {
            editor.execCommand('mceInsertContent', false, '<a href="#' + chosen + '"  class="contauthlink">' + selection + '</a>');
        }
        else {
            /*var pagetitle = chosen;
            for (var i = 0, j = sakai.site.pages.items.length; i<j; i++) {
                if (sakai.site.pages.items[i].id == chosen) {
                    pagetitle = sakai.site.pages.items[i].title;
                }
            }*/
            var pagetitle = sakai.site.site_info._pages[chosen].title;
            editor.execCommand('mceInsertContent', false, '<a href="#' + chosen + '" class="contauthlink">' + pagetitle + '</a>');
        }

        $('#link_dialog').jqmHide();

        return true;
    };

    // Bind Insert link confirmation click event
    $("#insert_link_confirm").bind("click", function(ev){
        insertLink();
    });


    // Init Insert link modal
    $('#link_dialog').jqm({
        modal: true,
        trigger: $('#link_dialog_trigger'),
        overlay: 20,
        toTop: true
    });


    // Bind Insert Link click event
    $("#more_link").bind("click", function(ev){
        var el = $("#more_menu");
        if (el.css("display").toLowerCase() != "none") {
            el.hide();
        } else {
            var x = $("#more_link").position().left;
            var y = $("#more_link").position().top;
            el.css({"top": y + 22+ "px", "left": x - el.width() + $("#more_link").width() + 56 + "px"}).show();
        }
    });





    /////////////////////////////
    // INSERT MORE: ADD HORIZONTAL LINE
    /////////////////////////////

    // Bind Insert horizontal line click event
    $("#horizontal_line_insert").bind("click", function(ev){
        tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<hr/>');
        toggleInsertMore();
    });





    /////////////////////////////
    // INSERT MORE: ADD SELECTED WIDGET
    /////////////////////////////


    /**
     * Render selected widget
     * @param {Object} hash
     * @return void
     */
    var renderSelectedWidget = function(hash){

        var $dialog_content = $("#dialog_content");
        toggleInsertMore();

        var widgetid = false;
        if (hash.t){
            widgetid = hash.t.id.split("_")[3];
        }
        $dialog_content.hide();

        if (Widgets.widgets[widgetid]){
            hash.w.show();

            sakai.site.newwidget_id = widgetid;
            var id = "widget_" + widgetid + "_id" + Math.round(Math.random() * 1000000000);
            sakai.site.newwidget_uid = id;
            $dialog_content.html('<img src="' + Widgets.widgets[widgetid].img + '" id="' + id + '" class="widget_inline" border="1"/>');
            $("#dialog_title").text(Widgets.widgets[widgetid].name);
            sdata.widgets.WidgetLoader.insertWidgets("dialog_content",true,sakai.site.currentsite.id + "/_widgets");
            $dialog_content.show();
            window.scrollTo(0,0);
        } else if (!widgetid){
            hash.w.show();
            window.scrollTo(0,0);
        }

    };


    /**
     * Hide selected widget
     * @param {Object} hash
     * @return void
     */
    var hideSelectedWidget = function(hash){
        hash.w.hide();
        hash.o.remove();
        sakai.site.newwidget_id = false;
        sakai.site.newwidget_uid = false;
        $("#dialog_content").html("").hide();
    };

    /**
     * Insert widget modal Cancel button - hide modal
     * @param {Object} tuid
     * @retuen void
     */
    sakai.site.widgetCancel = function(tuid){
        $('#insert_dialog').jqmHide();
    };


    /**
     * Widget finish - add widget to editor, hide modal
     * @param {Object} tuid
     * @return void
     */
    sakai.site.widgetFinish = function(tuid){
        // Add widget to the editor
        $("#insert_screen2_preview").html("");
        tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<img src="' + Widgets.widgets[sakai.site.newwidget_id].img + '" id="' + sakai.site.newwidget_uid + '" class="widget_inline" style="display:block; padding: 10px; margin: 4px" border="1"/>');
        $('#insert_dialog').jqmHide();
    };



    /**
     * Fill insert more dropdown
     * @return void
     */
    var fillInsertMoreDropdown = function(){

        // Vars for media and goodies
        var media = {};
        media.items = [];
        var goodies = {};
        goodies.items = [];
        var sidebar = {};
        sidebar.items = [];

        // Fill in media and goodies
        for (var i in Widgets.widgets){
            if (i) {
                var widget = Widgets.widgets[i];
                if (widget.ca && widget.showinmedia) {
                    media.items[media.items.length] = widget;
                }
                if (widget.ca && widget.showinsakaigoodies) {
                    goodies.items[goodies.items.length] = widget;
                }
                if (widget.ca && widget.showinsidebar){
                    sidebar.items[sidebar.items.length] = widget;
                }
            }
        }

        // Render insert more media template
        $("#insert_more_media").html($.Template.render("insert_more_media_template",media));

        // Render insertmore goodies template
        $("#insert_more_goodies").html($.Template.render("insert_more_goodies_template",goodies));

        // Render insertmore sidebar template
        $("#insert_more_sidebar").html($.Template.render("insert_more_sidebar_template",sidebar));

        // Event handler
        $('#insert_dialog').jqm({
            modal: true,
            trigger: $('.insert_more_widget'),
            overlay: 20,
            toTop: true,
            onShow: renderSelectedWidget,
            onHide: hideSelectedWidget
        });
    };







    //--------------------------------------------------------------------------------------------------------------
    //
    // ADD NEW...
    //
    //--------------------------------------------------------------------------------------------------------------



    /////////////////////////////
    // ADD NEW: BLANK PAGE
    /////////////////////////////


    /**
     * Create a new page
     * @param {Object} content
     * @return void
     */
    var createNewPage = function(content){

        // UI Setup
        $("#add_new_menu").hide();
        sakai.site.isShowingDropdown = false;

        // Set new page flag
        sakai.site.isEditingNewPage = true;

        // Determine where to create the page
        var path = "";
        if (sakai.site.selectedpage){
            if (sakai.site.createChildPageByDefault){
                path = sakai.site.selectedpage + "/";
            }
        }

        // Determine new page id (untitled-x)
        var newid = false;
        var counter = 0;
        while (!newid){
            var totest = path + "untitled";
            if (counter !== 0){
                totest += "-" + counter;
            }
            counter++;
            var exists = false;
            if (sakai.site.site_info._pages[totest]) {
                exists = true;
            }

            if (!exists){
                newid = totest;
            }
        }

        // Assign the empty content to the sakai.site.pagecontents array
        if (sakai.site.pagecontents[newid]) {
            sakai.site.pagecontents[newid]["sakai:pagecontent"] = content;
        } else {
            sakai.site.pagecontents[newid] = {};
            sakai.site.pagecontents[newid]["sakai:pagecontent"] = content;
        }

        sakai.site.savePage("/sites/" + sakai.site.currentsite.id + "/_pages/" + newid, "webpage", "Untitled", content, (determineHighestPosition() + 100000), "parent", function(success, data){

            if (success) {

                // Store page selected and old IDs
                sakai.site.oldSelectedPage = sakai.site.selectedpage;
                sakai.site.selectedpage = newid;

                // Init tinyMCE if needed
                if (tinyMCE.activeEditor === null) { // Probably a more robust checking will be necessary
                    init_tinyMCE();
                } else {
                    editPage(newid);
                }

            } else {
                fluid.log("site_admin.js/createNewPage(): Could not create page node for page!");
            }

        });
    };


    // Bind Add a blank page click event
    $("#option_blank_page").bind("click", function(ev){
        if (sakai.site.versionHistoryNeedsReset) {
            sakai.site.resetVersionHistory();
            sakai.site.versionHistoryNeedsReset = false;
        }
        createNewPage("");
    });

    // Bind Add a new blank page hover event
    $("#option_blank_page").hover(
        function(over){
            $("#option_blank_page").addClass("selected_option");
        },
        function(out){
            $("#option_blank_page").removeClass("selected_option");
        }
    );


    /////////////////////////////
    // ADD NEW: DASHBOARD
    /////////////////////////////

    /**
    * Adds a dashboard page to the site.
    * @param {Object} title
    */
    var addDashboardPage = function(title){

        // Create a URL safe title string
        var pageURLTitle = sakai.site.createURLSafeTitle(title);
        var pageURLName = sakai.site.createURLName("/sites/" + sakai.site.currentsite.id + "/_pages/" + pageURLTitle); // Make sure we save base path for each selected page in JS so that sub-pages can save properly

        // Default dasboard content
        var defaultDashboardContent = '{"columns":{"column1":[{"name":"sitemembers","visible":"block","uid":"id4548168513125"}],"column2":[]},"layout":"dev"}';

        // Create page node for dashboard page
        sakai.site.savePage("/sites/" + sakai.site.currentsite.id + "/_pages/" + pageURLTitle, "dashboard", title, defaultDashboardContent, (determineHighestPosition() + 200000), "parent", function(success, data){

            // If page save was successful
            if (success) {

                // Close this popup and show the new page.
                sakai.site.selectedpage = pageURLName;

                $("#dashboard_addpage_dialog").jqmHide();
                $("#dashboard_addpage_title").val("");

                // Refresh site_info object and open page
                sakai.site.refreshSiteInfo(pageURLName);

                // Check in new page content to revision history
                $.ajax({
                    url: "/sites/" + sakai.site.currentsite.id + "/_pages/" + pageUrlTitle + "/pageContent.save.html",
                    type: "POST"
                });

            } else {
                fluid.log("site_admin.js/addDashboardPage(): Could not create page node for dashboard page!");
            }

        });
    };

    /**
     * We add the submit event on the form, so the function is also
     */
    $("#dashboard_addpage_dialog form").bind('submit', function(){
        var title = $("#dashboard_addpage_title").val();
        if (title !== "") {
            addDashboardPage(title);
        } else{
            alert("Please enter a valid title for your dashboard page.");
        }

        // Do not reload the page (don't send an HTTP POST request)
        return false;
    });

    var renderAddDashboardPage = function(hash){
        $("#add_new_menu").hide();
        hash.w.show();
    };

    $("#dashboard_addpage_dialog").jqm({
        modal: true,
        trigger: $("#option_page_dashboard"),
        overlay: 20,
        toTop: true,
        onShow: renderAddDashboardPage
    });

    // Bind Add a new page dashboard hover event
    $("#option_page_dashboard").hover(function(over){
        $("#option_page_dashboard").addClass("selected_option");
    }, function(out){
        $("#option_page_dashboard").removeClass("selected_option");
    });




    /////////////////////////////
    // ADD NEW: GENERAL
    /////////////////////////////

    // Bind Add a new... click event
    $("#add_a_new").bind("click", function(ev){
        if (sakai.site.isShowingDropdown){
            $("#add_new_menu").hide();
            sakai.site.isShowingDropdown = false;
        } else {
            $("#add_new_menu").show();
            sakai.site.isShowingDropdown = true;
            var dropdown_pos = $("#add_a_new").offset();
            $("#add_new_menu").css({"left": (dropdown_pos.left + 7)+"px", "top": (dropdown_pos.top + 22) + "px"});
        }
    });







    //--------------------------------------------------------------------------------------------------------------
    //
    // MORE MENU
    //
    //--------------------------------------------------------------------------------------------------------------

    ////////////////////////////////////////
    // MORE: PERMISSIONS
    ////////////////////////////////////////
    $("#more_permissions").bind("click", function(e) {
        $("#more_menu").hide();
        sakai.lib.notifications.showNotification("Page permissions", "This feature is not implemented yet!", "error", false, "/dev/_images/page_18.png", 500, 5000, 500);
    });



    ////////////////////////////////////////
    // MORE: REVISION HISTORY
    ////////////////////////////////////////

    // Bind Revision history click event
    $("#more_revision_history").bind("click", function(ev){
        // UI Setup
        $("#content_page_options").hide();
        $("#revision_history_container").show();
        $("#more_menu").hide();

        $.ajax({
            url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "/pageContent.versions.json",
            cache: false,
            success : function(data) {
                var history = $.evalJSON(data);

                // Populate the select box
                var select = $("#revision_history_list").get(0);
                $(select).unbind("change",changeVersionPreview);

                select.options.length = 0;
                for (i in history.versions){

                    if (i !== "jcr:rootVersion") {

                        var name = "Version " + (i);

                        // Transform date
                        var date = history.versions[i]["jcr:created"];
                        var datestring = sakai.site.transformDate(parseInt(date.substring(8,10),10), parseInt(date.substring(5,7),10), parseInt(date.substring(0,4),10), parseInt(date.substring(11,13),10), parseInt(date.substring(14,16),10));

                        name += " - " + datestring;

                        if (history.versions[i]["sakai:savedBy"]) {
                            name += " - " + history.versions[i]["sakai:savedBy"].firstName + " " + history.versions[i]["sakai:savedBy"].lastName;
                        }
                        var id = i;
                        var option = new Option(name, id);
                        select.options[select.options.length] = option;

                        $(select).bind("change", changeVersionPreview);

                        // Signal that a page reload will be needed when we go back
                        sakai.site.versionHistoryNeedsReset = true;

                    }

                }

            },
            error: function(xhr, textStatus, thrownError) {
                fluid.log("site_admin.js:Revision History: An error has occured while fetching the revision history");
                sakai.site.versionHistoryNeedsReset = true;
            }
        });
    });


    // Bind Revision history cancel click event
    $("#revision_history_cancel").bind("click", function(ev){
        sakai.site.resetVersionHistory();
    });

    // Bind Revision History - Revert click event
    $("#revision_history_revert").bind("click", function(ev){

        var select = $("#revision_history_list").get(0);
        var version = select.options[select.selectedIndex].value;

        $.ajax({
            url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "/pageContent.version.," + version + ",.json",
            success : function(data) {

                var content_node = $.evalJSON(data);

                var type = sakai.site.site_info._pages[sakai.site.selectedpage]["pageType"];
                if (type === "webpage") {
                    $("#" + sakai.site.selectedpage).html(content_node["sakai:pagecontent"]);
                    sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage, null, sakai.site.currentsite.id + "/_widgets");
                    sakai.site.pagecontents[sakai.site.selectedpage]["sakai:pagecontent"] = content_node["sakai:pagecontent"];
                }
                else if (type === "dashboard") {
                    // Remove previous dashboard
                    $("#" + sakai.site.selectedpage).remove();
                    // Render new one
                    sakai.site._displayDashboard (content_node["sakai:pagecontent"], true);
                }

                // Save new version of this page
                sakai.site.updatePageContent(sakai.site.site_info._pages[sakai.site.selectedpage]["path"], content_node["sakai:pagecontent"], function(success, data) {

                    if (success) {

                        // Check in the page for revision control
                        $.ajax({
                            url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "/pageContent.save.html",
                            type: "POST"
                        });

                        // Reset versiopn history
                        sakai.site.resetVersionHistory();

                    } else {
                        fluid.log("site_admin.js: Failed to save new version of page content while applying new revision of content!");
                    }

                });
            },
            error: function(xhr, textStatus, thrownError) {
                fluid.log("site_admin.js: Failed to fetch new version of page content while applying new revision of content!");
            }
        });
    });


    /**
     * Change Version Preview
     * @return void
     */
    var changeVersionPreview = function(){
        var select = $("#revision_history_list").get(0);
        var version = select.options[select.selectedIndex].value;

        $.ajax({
            url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"] + "/pageContent.version.," + version + ",.json",
            success : function(data) {
                var content_node = $.evalJSON(data);
                var type = sakai.site.site_info._pages[sakai.site.selectedpage]["pageType"];
                if (type === "webpage") {
                    $("#" + sakai.site.selectedpage).html(content_node["sakai:pagecontent"]);
                    sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage, null, sakai.site.currentsite.id + "/_widgets");
                } else if (type === "dashboard") {
                    $("#" + sakai.site.selectedpage).remove();
                    sakai.site._displayDashboard(content_node["sakai:pagecontent"], true);
                }
            },
            error: function(xhr, textStatus, thrownError) {
                fluid.log("site_admin.js: An error has occured while trying to cahnge version preview");
            }
        });
    };



    /////////////////////////////
    // MORE: MOVE
    /////////////////////////////

    $("#more_move").bind("click", function() {

        $("#more_menu").hide();
        sakai.lib.notifications.showNotification("Page move", "To move a page just drag&drop in the page navigation widget!", "normal", false, "/dev/_images/page_18.png", 500, 5000, 500);

    });




    //////////////////////////////////
    // ADD NEW: PAGE FROM TEMPLATE
    //////////////////////////////////

    // Bind Add a new page from template hover event
    $("#option_page_from_template").hover(
        function(over){
            $("#option_page_from_template").addClass("selected_option");
        },
        function(out){
            $("#option_page_from_template").removeClass("selected_option");
        }
    );



    /////////////////////////////////
    // MORE: SAVE PAGE AS TEMPLATE //
    /////////////////////////////////

    /**
     * Start Save As Template
     * @param {Object} hash
     * @return void
     */
    var startSaveAsTemplate = function(hash){
        $("#more_menu").hide();
        $("#add_new_menu").hide();
        sakai.site.isShowingDropdown = false;
        hash.w.show();
    };

    // Init Save as Template modal
    $("#save_as_template_container").jqm({
        modal: true,
        trigger: $('#more_save_as_template'),
        overlay: 20,
        toTop: true,
        onShow: startSaveAsTemplate
    });

    // Bind Save as Template click event
    $("#save_as_page_template_button").bind("click", function(ev){
        var name = $("#template_name").val();
        var description = $("#template_description").val() || "";
        if (name){

            var newid = Math.round(Math.random() * 100000000);

            var obj = {};
            obj.name = name;
            obj.description = description;

            // Load template configuration file
            sdata.preference.load(Config.URL.TEMPLATES, function(success, pref_data){
                if (success) {
                    updateTemplates(obj, newid, pref_data);
                } else {
                    var empty_templates = {};
                    updateTemplates(obj, newid, empty_templates);
                }
            });
        }
    });

    /**
     * Update templates in JCR
     * @param {Object} obj
     * @param {Object} newid
     * @param {Object} templates
     * @return void
     */
    var updateTemplates = function(obj, newid, templates){

        templates[newid] = obj;
        templates[newid]["_charset_"] = "utf-8";
        templates[newid]["sling:resourceType"] = "sakai/pagetemplate";
        templates[newid]["pageContent"] = {};
        templates[newid]["pageContent"]["_charset_"] = "utf-8";
        templates[newid]["pageContent"]["sling:resourceType"] = "sakai/pagetemplatecontent";
        templates[newid]["pageContent"]["sakai:pagecontent"] = sakai.site.pagecontents[sakai.site.selectedpage]["sakai:pagecontent"];

        sdata.preference.save(Config.URL.TEMPLATES, templates, function(success, response) {

            if (success) {

                sakai.site.mytemplates = templates;

                $("#save_as_template_container").jqmHide();
                $("#template_name").val("");
                $("#template_description").val("");
            } else {
                fluid.log("site_admin.js/updateTemplates(): Could not save page template!");
            }

        });

    };

    /**
     * Load Templates
     * @param {Object} hash
     * @return void
     */
    var loadTemplates = function(hash){
        if (sakai.site.versionHistoryNeedsReset) {
            sakai.site.resetVersionHistory();
            sakai.site.versionHistoryNeedsReset = false;
        }

        $("#add_new_menu").hide();
        sakai.site.isShowingDropdown = false;

        // Load template configuration file
        sdata.preference.load(Config.URL.TEMPLATES, function(success, pref_data){
            if (success) {
                renderTemplates(pref_data);
            } else {
                var empty_templates = {};
                renderTemplates(empty_templates);
            }
        });

        hash.w.show();
    };

    /**
     * Render Templates
     * @param {Object} templates
     * @return void
     */
    var renderTemplates = function(templates){

        sakai.site.mytemplates = templates;

        var finaljson = {};
        finaljson.items = [];

        // Filter valid templates data
        for (var i in templates){

            if ((templates[i].name) && (templates[i]["pageContent"])) {
                var obj = {};
                obj.id = i;
                obj.name = templates[i].name;
                obj.description = templates[i].description;
                obj.content = templates[i]["pageContent"]["sakai:pagecontent"];
                finaljson.items[finaljson.items.length] = obj;
            }
        }

        finaljson.size = finaljson.items.length;

        $("#list_container").hide().html($.Template.render("list_container_template",finaljson));

        if ($("#list_container").height() > 250){
            $("#list_container").css("height","250px");
        }

        $("#list_container").show();


        // Wire delete button
        $(".template_delete").bind("click", function(ev){
            var todelete = this.id.split("_")[2];

            var newobj = {};
            for (var i in sakai.site.mytemplates){
                if (i !== todelete){
                    newobj[i] = sakai.site.mytemplates[i];
                }
            }

            // Save updated template preferences
            sdata.preference.save(Config.URL.TEMPLATES, newobj, function(success, response) {
                if (success) {

                } else {
                    fluid.log("site_admin.js: Failed to delete template!");
                }
            });

            renderTemplates(newobj);
        });

        // Wire selection button
        $(".page_template_selection").bind("click", function(ev){
            var toload = this.id.split("_")[3];
            $("#select_template_for_page").jqmHide();
            createNewPage(sakai.site.mytemplates[toload]["pageContent"]["sakai:pagecontent"]);
        });
    };

    // Init Template selection modal
    $("#select_template_for_page").jqm({
        modal: true,
        trigger: $('#option_page_from_template'),
        overlay: 20,
        toTop: true,
        onShow: loadTemplates
    });


    ///////////////////////
    // MORE: DELETE PAGE //
    ///////////////////////

    /**
     * //s a page
     * @return void
     */
    var deletePage = function() {

        // Delete autosave
        $.ajax({
            url: sakai.site.site_info._pages[sakai.site.selectedpage]["path"],
            type: 'DELETE',
            success: function(data){

                delete sakai.site.site_info._pages[sakai.site.selectedpage];
                delete sakai.site.pagecontents[sakai.site.selectedpage];
                sakai.site.autosavecontent = false;
                document.location = "/sites/" + sakai.site.currentsite.id;

            },
            error: function(xhr, textStatus, thrownError) {

                fluid.log("site_admin.js/deletePage(): Could not delete page node at " + sakai.site.site_info._pages[sakai.site.selectedpage]["path"]);
            }
        });
    };

    // Init delete dialog
    $('#delete_dialog').jqm({
        modal: true,
        trigger: $('.delete_dialog'),
        overlay: 20,
        toTop: true
    });

    // Bind delete page click event
    $("#more_delete").bind("click", function(){
        $('#delete_dialog').jqmShow();
    });

    // Bind delete page confirmation click event
    $("#delete_confirm").bind("click", function(){
        deletePage();
    });


    ///////////////////
    // MORE: GENERAL //
    ///////////////////

    // Bind Insert more hover event
    $(".more_option").hover(
        function(over){
            $(this).addClass("selected_option");
        },
        function(out){
            $(this).removeClass("selected_option");
        }
    );


    //--------------------------------------------------------------------------------------------------------------
    //
    // PAGE PERMISSIONS
    //
    //--------------------------------------------------------------------------------------------------------------





    //--------------------------------------------------------------------------------------------------------------
    //
    // GLOBAL EVENT LISTENERS
    //
    //--------------------------------------------------------------------------------------------------------------

    // Bind title input change event
    $("#title-input").bind("change", function(){
        $("#new_page_path_current").text($("#title-input").val());
    });

    // Bind resize event
    $(window).bind("resize", function(){
        $("#toolbarcontainer").css("width", $("#toolbarplaceholder").width() + "px");
    });

    // Bind scroll event
    $(window).bind("scroll", function(e){
        try {
            placeToolbar();
        } catch (err){
            // Ignore
        }
    });


    //////////////////
    // EDIT SIDEBAR //
    //////////////////

    // Bind edit sidebar click
    $("#edit_sidebar").bind("click", function(ev){
        // Init tinyMCE if needed
        if (tinyMCE.activeEditor === null) { // Probably a more robust checking will be necessary
            sakai.site.isEditingNavigation = true;
            init_tinyMCE();
          } else {
            editPage("_navigation");
        }

        return false;
    });



    //--------------------------------------------------------------------------------------------------------------
    //
    // INIT
    //
    //--------------------------------------------------------------------------------------------------------------

    /**
     * Initialise Admin part
     * @return void
     */
    var admin_init = function() {
        sdata.container.registerFinishFunction(sakai.site.widgetFinish);
        sdata.container.registerCancelFunction(sakai.site.widgetCancel);
        fillInsertMoreDropdown();
    };

    admin_init();

};

sakai.site.onAdminLoaded();
