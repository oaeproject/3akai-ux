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
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai.pagetitle
     *
     * @class pagetitle
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.pagetitle = function(tuid, showSettings, widgetData) {

        // Element cache
        var $rootel = $('#' + tuid);
        var $textarea = $('textarea', $rootel).attr('name', tuid);

        // Configuration variables
        var AUTOSAVE_INTERVAL = 5000;

        // Help variables
        var autoSavePoll = false;
        var lastData = (widgetData && widgetData.pagetitle) ? widgetData.pagetitle.content : '';

        ////////////////////////
        // Textarea functions //
        ////////////////////////

        /**
         * When the textarea is focussed, we should hide the drag handle and remove
         * buttons so all text can be seen. We also hide the tinyMCE formatbar that
         * might be open
         */
        var focusTextArea = function() {
            $('.contentauthoring_cell_element_actions').hide();
        };

        ///////////////////////
        // Textarea resizing //
        ///////////////////////

        /**
         * Update the height of the textarea so it's the same as it show the entire
         * title, growing with the title as the title is changed
         */
        var updateHeight = function() {
            $textarea.height('28px');
            $textarea.height($textarea[0].scrollHeight);
        };

        /////////////////////////
        // Autosave and saving //
        /////////////////////////

        /**
         * When the page is being saved, we have to save the widget's content
         * and also render the current text in view mode
         */
        var fullSave = function() {
            // Only save when the widget is on the current page
            if ($rootel.is(':visible')) {
                autoSave();
                lastData = $textarea.val();
                $('#pagetitle_view_container', $rootel).html(sakai.api.Util.Security.saneHTML(lastData.replace(/\n/g, '<br/>')));
            }
        };

        /**
         * Automatically save the widget's content from time to time, but only
         * do this when the widget content has changed
         */
        var autoSave = function() {
            if ($rootel.is(':visible')) {
                var currentText = $textarea.val();
                if (currentText !== lastData) {
                    lastData = currentText;
                    sakai.api.Widgets.saveWidgetData(tuid, {'content': currentText});
                }
            }
        };

        /**
         * Start auto saving the widget data
         */
        var startAutoSave = function() {
            stopAutoSave();
            // Start the autosave
            autoSavePoll = setInterval(autoSave, AUTOSAVE_INTERVAL);
        };

        /**
         * Stop the auto save interval for the current widget
         */
        var stopAutoSave = function() {
            if (autoSavePoll) {
                clearInterval(autoSavePoll);
                autoSavePoll = false;
            }
        };

        ///////////////////
        // Event binding //
        ///////////////////

        /**
         * Every time the contentauthoring widget thinks a resize might be
         * necessary, this event will be thrown
         */
        $(window).on('resize.contentauthoring.sakai', updateHeight);

        /**
         * This event will be sent out by the contentauthoring widget when
         * the user is trying to save the page. At this point, the htmlblock
         * widget needs to store its changes as well
         */
        $(window).on('save.contentauthoring.sakai', fullSave);

        /**
         * Function to execute every time the textarea is given focus
         */
        $textarea.on('focus', focusTextArea);

        /**
         * Check whether the textarea should be resized after adding some
         * text
         */
        $textarea.on('keyup', updateHeight);

        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Load the PageTitle widget
         */
        var doInit = function() {
            // Fill up the textarea
            if (widgetData && widgetData.pagetitle) {
                var processedContent = sakai.api.i18n.General.process(widgetData.pagetitle.content);
                $('#pagetitle_view_container', $rootel).html(sakai.api.Util.Security.saneHTML(processedContent.replace(/\n/g, '<br/>')));
                $textarea.val(widgetData.pagetitle.content);
            }
            // Set the height of the textarea to be the same as the height of the view mode,
            // so tinyMCE picks up on this initial height
            $textarea.css('height', $('#pagetitle_view_container', $rootel).height());
            // Set focus inside of the textarea if it is visible. This means that the current
            // pagetitle is a new one and focus can be set
            if ($textarea.is(':visible')) {
                $textarea.focus();
            }
            startAutoSave();
        };

        // run the initialization function when the widget object loads
        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('pagetitle');
});
