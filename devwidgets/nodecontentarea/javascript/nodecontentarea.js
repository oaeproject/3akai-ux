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

/*
 * Dependencies
 *
 * /dev/lib/tinymce/tiny_mce.js (tinyMCE)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.nodecontentarea
     *
     * @class nodecontentarea
     *
     * @description
     * Initialize the nodecontentarea widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.nodecontentarea = function(tuid,showSettings){

        //////////////////////////
        // CONFIG and HELP VARS //
        //////////////////////////

        var mainContentDivPreview = "#main-content-div-preview";
        var mainContentDiv = "#main-content-div";

        // Buttons and Links
        var editPage = "#edit_page";
        var saveButton = ".save_button";
        var cancelButton = ".cancel_button";

        var handleHashChange = function(e, node) {
            var id = node || $.bbq.getState("location");
            if (id) {
                // get directory json object called method from browsedirectory widget
                var nodeId = id.split("/").reverse().shift();
                if (sakai_global.browsedirectory) {
                    var directoryJson = sakai_global.browsedirectory.getDirectoryNodeJson(nodeId);
                    // show description
                    $(mainContentDivPreview).html(directoryJson[0].attr["data-description"]);
                }
            }
        };

        /**
         * Bind events
         */
        var bindEvents = function(){
            // Bind Edit page link click event
            $(editPage).bind("click", function(ev){
                // if there is no active editor initialize editor
                if (tinyMCE.activeEditor === null) {
                    init_tinyMCE();
                }
                // otherwise remove existing active editor and initialize new one
                else {
                    if (tinyMCE.activeEditor.id !== "elm1" && didInit === false) {
                        tinyMCE.remove(tinyMCE.activeEditor.id);
                        init_tinyMCE();
                        didInit = true;
                    }
                }
                // show editor
                switchToEditorMode(true);
            });

            // Bind Save button click
            $(saveButton).live("click", function(ev){
                saveEdit();
            });

            // Bind cancel button click
            $(cancelButton).live("click", function(ev){
                cancelEdit();
            });

            // bind selected.directory.sakai event.
            // that event is triggered when directory in browsedirectory widget is selected.
            $(window).bind("hashchange nohash.browsedirectory.sakai", handleHashChange);
        };

        /**
         * Show and Hide the div and links based on parameter passed
         * if parameter is true show the editor, hide edit link and content link(editor mode)
         * if parameter is false hide the editor, show edit link and content link(preview mode)
         *
         * @param {Boolean} mode boolean value to switch mode true(editor mode), false(preview  mode)
         */
        var switchToEditorMode = function(mode){
            if (mode) {
                $(mainContentDivPreview).hide();
                $(editPage).hide();
                $(mainContentDiv).show();
            } else {
                $(mainContentDivPreview).show();
                $(editPage).show();
                $(mainContentDiv).hide();
            }
        };

        /**
         * Simply hide editor and show content and edit link
         */
        var cancelEdit = function() {
            // hide editor
            switchToEditorMode(false);
        };

        /**
         * Save the description, hide editor and show content and edit link
         */
        var saveEdit = function(){
            var newcontent = getContent();
            //TODO call save description function
            $(mainContentDivPreview).html(newcontent);
            // hide editor
            switchToEditorMode(false);
        };

        /**
         * Get description from the preiew and show in editor
         */
        var setDescription = function (){
            var content = $(mainContentDivPreview).html();
            setContent(content);
        };

        /////////////////////////////
        // tinyMCE FUNCTIONS
        /////////////////////////////
        /**
         * Get the content inside the TinyMCE editor
         */
        var getContent = function(){
            return tinyMCE.get("elm1").getContent({format : 'raw'}).replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
        };

        /**
         * Set the content inside the TinyMCE editor
         */
        var setContent = function(content){
            tinyMCE.get("elm1").setContent(content, {format : 'raw'});
        };

        /**
         * Initialise tinyMCE and run sakai.sitespages.startEditPage() when init is complete
         * @return void
         */

        function init_tinyMCE() {
            // Init tinyMCE
            tinyMCE.init({
                // General options
                mode : "textareas",
                elements : "elm1",
                theme: "advanced",

                // Context Menu
                theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,|,forecolor,backcolor",
                theme_advanced_buttons2: "bold,italic,underline,|,numlist,bullist,|,outdent,indent,|,justifyleft,justifycenter,justifyright,justifyfull,|,link,|,image,|",
                theme_advanced_buttons3:"",

                // set this to external|top|bottom
                theme_advanced_toolbar_location: "top",
                theme_advanced_toolbar_align: "left",
                theme_advanced_statusbar_location: "none",
                oninit : setDescription
            });
        }

        //////////////////////////
        // INITIALIZATION METHOD
        //////////////////////////
        var doInit = function() {
            bindEvents();
            handleHashChange();
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("nodecontentarea");
});
