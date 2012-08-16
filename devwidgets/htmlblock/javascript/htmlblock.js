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
     * @name sakai.htmlblock
     *
     * @class htmlblock
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.htmlblock = function(tuid, showSettings, widgetData) {

        // Element cache
        var $rootel = $('#' + tuid);
        var $editor = false;
        var $toolbar = false;

        // Configuration variables
        var AUTOSAVE_INTERVAL = 5000;
        var EVENTS_TO_RESPOND_TO = ['click', 'keyup', 'mouseup', 'paste'];

        // Help variables
        var editorId = false;
        var autoSavePoll = false;
        var lastData = (widgetData && widgetData.htmlblock) ? widgetData.htmlblock.content : '';

        ///////////////////////////
        // tinyMCE Functionality //
        ///////////////////////////

        /**
         * When focus is set on the editor (by clicking inside of it), we hide the draghandle/remove
         * button bar, so all the text is visible
         */
        var editorFocus = function() {
            $('.mceExternalToolbar').hide();
            $('#inserterbar_widget #inserterbar_tinymce_container').show();
            $('.contentauthoring_cell_element_actions').hide();
            $toolbar.show();
        };

        /**
         * Make sure we remove all the insecure content
         * @param {Object} editor The editor
         * @param {Object} object Object containing all the information for the editor
         */
        var removeInsecureContent = function(editor, object) {
           // Run all the content through the HTML sanitizer
           object.content = sakai.api.Security.saneHTML(object.content);
           // Update the height - we need a setTimeout for this to work
           setTimeout(updateHeight, 100);
        };

        var editorSetup = function(ed) {
            ed.onClick.add(editorFocus);
            ed.onBeforeSetContent.add(removeInsecureContent);
        };

        /**
         * Convert the textarea in this widget into a tinyMCE editor
         */
        var loadTinyMCE = function() {
            if (window['tinyMCE']) {
                tinyMCE.init({
                    language: sakai.api.i18n.getEditorLanguage(),
                    mode: 'textareas',
                    theme: 'advanced',
                    skin: 'sakai',
                    formats: {
                          'caption': {
                              'inline': 'span',
                              'classes': 'caption'
                          }
                    },
                    // CSS Files to load in the editor
                    content_css: '/dev/css/sakai/main.css,/dev/css/sakai/sakai.editor.css,/devwidgets/htmlblock/css/htmlblock.css',
                    // Plugins and toolbar buttons to show
                    plugins: 'table,advlink,contextmenu,paste,directionality',
                    theme_advanced_blockformats: 'h1,h2,h3,h4,h5,h6,p,blockquote,caption',
                    theme_advanced_buttons1: 'bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,formatselect,fontsizeselect,|,bullist,numlist,|,forecolor,|,link,table,code',
                    theme_advanced_buttons2: '',
                    theme_advanced_buttons3: '',
                    // Styles to be shown for tables
                    table_styles: 'Default=default',
                    table_cell_styles: 'Default=default',
                    table_row_styles: 'Default=default',
                    // Specify a toolbar that is not attached to the editor
                    theme_advanced_toolbar_location: 'external',
                    theme_advanced_toolbar_align: 'left',
                    theme_advanced_statusbar_location: 'none',
                    theme_advanced_resizing: false,
                    // Constrain the editor loading to the current widget
                    editor_selector: tuid,
                    // Resize the editor when a significant change is made
                    handle_event_callback: tinyMCEEvent,
                    onchange_callback: tinyMCEEvent,
                    init_instance_callback: initTinyMCE,
                    remove_instance_callback: stopAutoSave,
                    // Additional event handlers
                    setup : editorSetup
                });
                // Hide the widget controls
                var $containingCell = $('.htmlblock_widget', $rootel).parents('.contentauthoring_cell_element');
                $('.contentauthoring_cell_element_actions', $containingCell).addClass('s3d-force-hidden');
            }
        };

        /**
         * Set focus on the editor
         * @param {Object} ed Editor object
         */
        var focusEditor = function(ed) {
            if (!$('.s3d-dialog:visible').length) {
                ed.focus();
            }
        };

        /**
         * We need to open the TinyMCE dropdown menus onload
         * so we can avoid a jump to the top
         * SAKIII-5482
         */
        var openMenus = function() {
            var ed = tinyMCE.get(editorId);
            var controls = ed.controlManager.controls;

            $.each(controls, function(index, control) {
                if (control.showMenu && control.rendered === false) {
                    control.showMenu();
                    control.hideMenu();
                }
            });

            focusEditor(ed);
        };

        /**
         * This is executed when the tinyMCE editor has been initialized
         */
        var initTinyMCE = function(ui) {
            editorId = ui.id;
            // Set focus if there is no 'An unsaved version has been found' overlay
            // showing
            var ed = tinyMCE.get(editorId);
            focusEditor(ed);
            // Cache the editor elements
            $editor = $('#' + editorId + '_ifr');
            $toolbar = $('#' + editorId + '_external').hide();
            // Move the toolbar to the inserterbar widget
            $('#inserterbar_widget #inserterbar_tinymce_container').append($toolbar);
            // Show the toolbar if we are in edit mode
            if ($('.contentauthoring_edit_mode').length) {
                $('.mceExternalToolbar').hide();
                $('#inserterbar_widget #inserterbar_tinymce_container').show();
                $toolbar.show();
            }
            // Set timeOut as tinyMCE seems to need a little bit of additional time before we see all
            // of the content in the editor
            setTimeout(function() {
                openMenus();
                var $containingCell = $('.htmlblock_widget', $rootel).parents('.contentauthoring_cell_element');
                $containingCell.removeClass('contentauthoring_init');
                updateHeight();
                $('.contentauthoring_cell_element_actions', $containingCell).removeClass('s3d-force-hidden').hide();
            }, 1000);
            startAutoSave();
        };

        /**
         * Function executed every time an event is fired in the tinyMCE editor. We only respond to a limited
         * amount of events (i.e., the ones that can cause the height of the editor to change)
         */
        var tinyMCEEvent = function(ev, ui) {
            if ($editor && (!ev || !ev.type || $.inArray(ev.type, EVENTS_TO_RESPOND_TO) !== -1)) {
                updateHeight();
            }
        };

        /////////////////////
        // Editor resizing //
        /////////////////////

        /**
         * Update the height of the editor iframe so it's the same as its internal
         * content. In other words, the editor should be the same height as the text,
         * avoiding a scrollbar to be shown
         */
        var updateHeight = function() {
            if ($editor.length) {
                try {
                    var docHt = 0;
                    var frame = $editor[0];
                    $editor.contents().scrollTop(0);
                    var innerDoc = frame.contentDocument ? frame.contentDocument : frame.contentWindow.document;
                    $editor.css('height', '25px');
                    docHt = innerDoc.body.scrollHeight;
                    // Set a minimum internal height of 25px
                    if (docHt < 25) {
                        docHt = 25;
                    }
                    // Only update the editor height if it has changed
                    if ($editor.height() !== docHt) {
                        $editor.css('height', docHt + 'px');
                        $(window).trigger('updateheight.contentauthoring.sakai');
                    }
                } catch (err) {
                    return false;
                }
            }
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
                if (editorId && tinyMCE.get(editorId)) {
                    // Render the page in view mode
                    var currentText = tinyMCE.get(editorId).getContent();
                    currentText = sakai.api.Security.saneHTML(currentText);
                    $('#htmlblock_view_container', $rootel).html(currentText);
                    sakai.api.Util.renderMath($rootel);
                }
            }
        };

        /**
         * Automatically save the widget's content from time to time, but only
         * do this when the widget content has changed
         */
        var autoSave = function() {
            // Only save when the widget is on the current page
            if ($editor.is(':visible')) {
                var currentText = tinyMCE.get(editorId).getContent();
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
            // Kill the current autosave interval
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

        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Load the HTMLBlock widget
         */
        var doInit = function() {
            // Set the name attribute of the textarea to the widget id, so we can restrict
            // tinyMCE loading to this widget
            var $textarea = $('textarea', $rootel).attr('name', tuid).addClass(tuid);
            // Fill up the textarea
            if (widgetData && widgetData.htmlblock) {
                var processedContent = sakai.api.i18n.General.process(widgetData.htmlblock.content);
                processedContent = sakai.api.Security.saneHTML(processedContent);
                $('#htmlblock_view_container', $rootel).html(processedContent);
                sakai.api.Util.renderMath($rootel);
                $textarea.val(processedContent);
            }
            // Set the height of the textarea to be the same as the height of the view mode,
            // so tinyMCE picks up on this initial height
            $textarea.css('height', $('#htmlblock_view_container', $rootel).height());
            loadTinyMCE();
        };

        // run the initialization function when the widget object loads
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('htmlblock');
});
