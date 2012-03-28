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
     * @name sakai.worldsettings
     *
     * @class worldsettings
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.worldsettings = function (tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid);

        // Data Items in the Form
        var worldsettingsTitle = '#worldsettings_title';
        var worldsettingsDescription = '#worldsettings_description';
        var worldsettingsTags =  '#worldsettings_tags';
        var $worldsettingsTags = false;
        var worldsettingsCanBeFoundIn = '#worldsettings_can_be_found_in';
        var worldsettingsMembership = '#worldsettings_membership';

        // Page Structure Elements
        var $worldsettingsContainer = $('#worldsettings_container', $rootel);
        var $worldsettingsDialog = $('.worldsettings_dialog', $rootel);
        var $worldsettingsForm = $('#worldsettings_form', $rootel);
        var $worldsettingsApplyButton = $('#worldsettings_apply_button');
        var $worldsettingsClosebButton = $('#worldsettings_close_button', $rootel);
        var $worldsettingsWarning = $('#worldsettings_warning_container', $rootel);

        //Themechanger
        var themePicker = '#worldsettings_change_theme_to';
        var themePickerTemplate = $('#themechanger_form_template', $rootel);

        var visibility = '';
        var worldId = '';

        /**
        * Gets array of skins out config.skinStore, compares the title with given theme and returns the css url of the theme if a match is found
        * @param {String} theme The name of the theme
        * @return {String} url Returns the url of the theme's cssfile
        */
        var getURL = function(theme) {
            var url = '';
            $.each(sakai.config.skinStore, function(key, value) {
                if (theme === value.title) { 
                   url = value.url;
                }
            });
            return url;
        };

        /**
        * Removes the current skin and adds the new one in head
        * @param {String} cssURL The url of the skin to which the user wants to change to
        */
        var changeCSS = function(cssURL) {
            $('link[href*="skin"]').remove();
            sakai.api.Util.include.css(cssURL);
        };

         /**
         * Gets the current theme from the head by checking the href and returns the name of the theme
         * @return {String} currentTheme The theme that is being used 
         */
        var getCurrentTheme = function() {
            var href = '';
            var currentTheme = '';
            $('link[href*="skin"]').each(function() {
                href = this.href;
            });
            $.each(sakai.config.skinStore, function (key, value) {
                if (href.indexOf(value.url) >= 0) {
                    currentTheme = value.title;
                }
             });
            return currentTheme;
        };

        /**
        * POST to JSON file with new customStyle url and calls changeCSS with the cssURL
        * @param {String} theme The name of the theme
        */
        var changeTheme = function(theme) {
            var isAlreadyUsed = '';
            var cssURL = getURL(theme);
            $('link[href*="' + cssURL + '"]').each(function() {
               isAlreadyUsed = theme;
            });
            if (!isAlreadyUsed) {
                $.ajax({
                    url: '/system/userManager/group/' + sakai_global.group.groupId + '.update.json',
                    data: {
                        'sakai:customStyle': cssURL
                    },
                    type: 'POST' 
                });
                changeCSS(cssURL);
            }
        };

        /* * 
         * Generates warning
         */
        var showWarning = function() {
            var newVisibility = $(worldsettingsCanBeFoundIn);
            var newVisibilityVal = $.trim(newVisibility.val());
            var oldVisibilityIndex = parseInt(newVisibility.find('option[value="' + sakai_global.group.groupData['sakai:group-visible'] + '"]').attr('index'), 10);
            
            if (sakai_global.group.groupData['sakai:group-visible'] === newVisibilityVal || parseInt(newVisibility.attr('selectedIndex'), 10) > oldVisibilityIndex || newVisibilityVal === 'members-only' || oldVisibilityVal === 'public') {

                $worldsettingsForm.submit();
            } else {
                $('#worldsettings_warning_container_text').html(sakai.api.Util.TemplateRenderer('worldsettings_warning_container_text_template', {
                    'visibility': newVisibilityVal,
                    'group': sakai_global.group.groupData['sakai:group-title']
                }));
                sakai.api.Util.bindDialogFocus($('#worldsettings_warning_container'));
                $('#worldsettings_warning_container').jqmShow();
                sakai.api.Util.Modal.open('#worldsettings_warning_container');
            }
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var handleSubmit = function(form) {
            $worldsettingsContainer.find('select, input').attr('disabled','disabled');
            var worldTitle = $.trim($(worldsettingsTitle).val());
            var worldDescription = $.trim($(worldsettingsDescription).val());
            var foundIn = $.trim($(worldsettingsCanBeFoundIn).val());
            var membership = $.trim($(worldsettingsMembership).val());

            var worldTags = sakai.api.Util.AutoSuggest.getTagsAndCategories( $worldsettingsTags, true );

            var worldData = {
                'sakai:group-title':  worldTitle,
                'sakai:group-description': worldDescription,
                'sakai:group-visible': foundIn,
                'sakai:group-joinable': membership
            };

            sakai.api.Groups.updateGroupProfile(worldId, worldData, worldTags, sakai_global.group.groupData, function( success ) {
                 $worldsettingsContainer.find('select, input').removeAttr('disabled');
                 $(window).trigger('sakai.entity.updateTitle', worldTitle);
                 sakai.api.Util.notification.show($('#worldsettings_success_title').html(), $('#worldsettings_success_body').html());
                 $worldsettingsDialog.jqmHide();
                 $('#worldsettings_warning_container').jqmHide();
                $worldsettingsContainer.find("select, input").removeAttr("disabled");

                $(window).trigger("sakai.entity.updateTitle", worldTitle);
                sakai.api.Util.notification.show($("#worldsettings_success_title").html(), $("#worldsettings_success_body").html());
                sakai.api.Util.Modal.close($worldsettingsDialog);
                sakai.api.Util.Modal.close('#worldsettings_warning_container');
            });
        };

        var bindEvents = function(worldId) {
            $worldsettingsApplyButton.off('click').on('click', function() {
                var selectedTheme = $.trim($(themePicker).val());
                if(checkEnableThemes == true){
                    changeTheme(selectedTheme);
                }
                showWarning();
            });
            $('#worldsettings_proceedandapply').off('click');
            $('#worldsettings_proceedandapply').on('click', function() {
                $worldsettingsForm.submit();
            });

            var validateOpts = {
                submitHandler: handleSubmit
            };
            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($worldsettingsForm, validateOpts, true);
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        var renderWorldSettings = function() {
            var profile = sakai_global.group.groupData;
            $('#worldsettings_form_container').html(sakai.api.Util.TemplateRenderer('worldsettings_form_template',{
                'title': profile['sakai:group-title'],
                'description': profile['sakai:group-description'],
                'foundin': profile['sakai:group-visible'],
                'membership': profile['sakai:group-joinable'],
                'themes': $.extend(sakai.config.skinStore, {}, true),
                'selectedTheme': getCurrentTheme(),
                'enableThemes': profile["sakai:enableThemes"]
            }));
            var initialTagsValue = profile['sakai:tags'] ? profile['sakai:tags'] : false;
            $worldsettingsTags = $( worldsettingsTags );
            sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest( $worldsettingsTags, null, $('.list_categories', $rootel), initialTagsValue );
        };

        /**
         * Initialization function DOCUMENTATION
         */
        var doInit = function (id) {
            worldId = id;
            renderWorldSettings();
            bindEvents();
            sakai.api.Util.Modal.setup($worldsettingsDialog, {
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 3000
            });
            $('#worldsettings_warning_container').jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 4000
            });
            sakai.api.Util.Modal.open($worldsettingsDialog);
        };

        // run the initialization function when the widget object loads
        $(window).bind('init.worldsettings.sakai', function(e, worldId) {
            doInit(worldId);
        });
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('worldsettings');
});
