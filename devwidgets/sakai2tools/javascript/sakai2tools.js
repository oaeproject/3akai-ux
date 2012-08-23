
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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.sakai2tools
     *
     * @class sakai2tools
     *
     * @description
     * Basiclti widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.sakai2tools = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var rootel = $('#' + tuid);
        var json = false;
        var isAdvancedSettingsVisible = false;
        var toolList = false;

        // Default values
        var defaultWidth = 100;
        var defaultWidthUnit = '%';
        var defaultHeight = 200;

        // Links and labels
        var sakai2tools = '#sakai2tools';
        var sakai2toolsSettings = sakai2tools + '_settings';
        var sakai2toolsSettingsAdvanced = sakai2toolsSettings + '_advanced';
        var sakai2toolsSettingsAdvancedDown = sakai2toolsSettingsAdvanced + '_down';
        var sakai2toolsSettingsAdvancedToggleSettings = sakai2toolsSettingsAdvanced + '_toggle_settings';
        var sakai2toolsSettingsAdvancedUp = sakai2toolsSettingsAdvanced + '_up';
        var sakai2toolsSettingsBorders = sakai2toolsSettings + '_borders';
        var sakai2toolsSettingsCancel = sakai2toolsSettings + '_cancel';
        var sakai2toolsSettingsColorContainer = sakai2toolsSettings + '_color_container';
        var sakai2toolsSettingsHeight = sakai2toolsSettings + '_frame_height';
        var sakai2toolsSettingsInsert = sakai2toolsSettings + '_insert';
        var sakai2toolsSettingsPreview = sakai2toolsSettings + '_preview';
        var sakai2toolsSettingsPreviewId = tuid + '_frame';
        var sakai2toolsSettingsPreviewFrame = '#' + sakai2toolsSettingsPreviewId;
        var sakai2toolsSettingsLtiUrl = sakai2toolsSettings + '_ltiurl';
        var sakai2toolsSettingsLtiKey = sakai2toolsSettings + '_ltikey';
        var sakai2toolsSettingsLtiSecret = sakai2toolsSettings + '_ltisecret';
        var sakai2toolsSettingsWidth = sakai2toolsSettings + '_width';
        var sakai2toolsSettingsReleaseName = sakai2toolsSettings + '_release_names';
        var $sakai2toolsNotificationTemplate = $('.sakai2tools_notification_template', rootel);

        // Containers
        var sakai2toolsMainContainer = sakai2tools + '_main_container';

        // Classes
        var sakai2toolsSettingsWidthUnitClass = '.sakai2tools_settings_width_unit';
        var sakai2toolsSettingsWidthUnitSelectedClass = 'sakai2tools_settings_width_unit_selected';

        // Templates
        var $sakai2toolsSettingsColorContainerTemplate = $('#sakai2tools_settings_color_container_template', rootel);
        var $sakai2toolsSettingsTemplate = $('#sakai2tools_settings_template', rootel);
        var $sakai2toolsSettingsPreviewTemplate = $('#sakai2tools_settings_preview_template', rootel);

        // see: http://www.ietf.org/rfc/rfc2396.txt Appendix B
        var urlRegExp = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?');

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Check if the value is a decimal or not
         * @param {Object} value Value that needs to be checked
         * @return {Boolean}
         *     true: is a decimal
         *     false: is not a decimal
         */
        var isDecimal = function(value) {
            return (/^\d+$/).test(value);
        };

        /**
         * Check if the input url is in fact an url or not
         * @param {String} url Url that needs to be tested
         * @return {Boolean}
         *     true: is an url
         *     false: is not an url
         */
        var isUrl = function(url) {
            var matches = urlRegExp.exec(url);
            // e.g. if ('http:' && 'localhost')
            if (matches[1] && matches[4]) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Check to see if both URLs are in the same origin. See: http://en.wikipedia.org/wiki/Same_origin_policy.
         * @param {String} url1
         * @param {String} url2
         * @return {Boolean}
         *     true: in the same origin policy
         *     false: NOT in the same origin policy
         */
        var isSameOriginPolicy = function(url1, url2) {
            if (url1 === url2) {
                return true;
            }
            // i.e. protocol, domain (and optional port numbers) must match
            if ((urlRegExp.exec(url1)[2] === urlRegExp.exec(url2)[2]) &&
               (urlRegExp.exec(url1)[4] === urlRegExp.exec(url2)[4])) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Called when the data has been saved to the JCR.
         */
        var savedDataToJCR = function(success, data) {
            displayRemoteContent(data);
            sakai.api.Widgets.Container.informFinish(tuid, 'sakai2tools');
        };

        var isSakai2Tool = function() {
            return true;
        };

        //////////////////////
        // Render functions //
        //////////////////////

        /**
         * Render the iframe for the widget in settings mode
         * @param {Boolean} complete Render the preview completely or only adjust values
         */
        var renderIframeSettings = function(complete) {
            if (complete) {
                json.launchDataUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + '/_widgets').replace(/__TUID__/, tuid).replace(/__NAME__/, 'sakai2tools') + '.launch.html';
                $(sakai2toolsSettingsPreview, rootel).html(sakai.api.Util.TemplateRenderer($sakai2toolsSettingsPreviewTemplate, json));
            }
            else {
                $(sakai2toolsSettingsPreviewFrame, rootel).attr('style', 'border: ' + json.border_size + 'px #' + json.border_color + ' solid');
            }
        };

        /**
         * Render the iframe for the widget
         */
        var renderIframe = function() {
            if (json) {
                json.tuidFrame = sakai2toolsSettingsPreviewId;
                $(sakai2toolsMainContainer, rootel).html(sakai.api.Util.TemplateRenderer($sakai2toolsSettingsPreviewTemplate, json));
                json.launchDataUrl = sakai.api.Widgets.getWidgetDataStorageURL(tuid) + '.launch.html';
                if (sakai_global.group) {
                    json.launchDataUrl += '?groupid=' + sakai_global.group.groupData['sakai:group-id'];
                }
                $('#' + json.tuidFrame, rootel).attr('src', json.launchDataUrl);

                // resize the iframe to match inner body height if in the same origin (i.e. same protocol/domain/port)
                if (isSameOriginPolicy(window.location.href, json.ltiurl)) {
                    $(sakai2toolsSettingsPreviewFrame, rootel).load(function() {
                        $(this).height($(this).contents().find('body').height() + 15); // add 10px for IE and 5px more for Gradebook weirdness
                    });
                }

                // SAKIII-314 We need to show the container, otherwise the second item won't be shown.
                $(sakai2toolsMainContainer, rootel).show();
            }
        };

        /**
         * Render the html of the sakai2toolssettings
         */
        var renderRemoteContentSettings = function() {
            if (json) {
                // temporarily add the toolList to the json for rendering, but
                // remove it afterwards because we don't want to store it in the node
                json.toolList = toolList;
                $(sakai2toolsSettings, rootel).html(sakai.api.Util.TemplateRenderer($sakai2toolsSettingsTemplate, json));
                delete json.toolList;
                // Necessary until we parameterize the tool list on the server and client side.
                if (isSakai2Tool && json.lti_virtual_tool_id) {
                    $('#sakai2tools_settings_lti_virtual_tool_id',rootel).val(json.lti_virtual_tool_id);
                }
            }
        };

        /**
         * Render the color container
         */
        var renderColorContainer = function() {
            if (json) {
                $(sakai2toolsSettingsColorContainer, rootel).html(sakai.api.Util.TemplateRenderer($sakai2toolsSettingsColorContainerTemplate, json));
            }
        };

        /**
         * Render the notification message to let people know they have to edit the settings of the widgets
         */
        var renderNotifictionMessage = function() {
            $(basicltiMainContainer, rootel).html(sakai.api.Util.TemplateRenderer($sakai2toolsNotificationTemplate, {}));
        };


        //////////////////////
        // Global functions //
        //////////////////////

        /**
         * Display the iframe in normal mode
         * @param {Object} parameters JSON object that contains the necessary information for the iframe
         */
        var displayRemoteContent = function(parameters) {

            // When we show the widget and no parameters are supplied, render a notification message
            if (!parameters) {
                renderNotifictionMessage();
            }

            // default to some reasonable vaules if the settings node does not have them (maybe a legacy node)
            if (parameters.border_size === null) {
                parameters.border_size = 0;
            }
            if (parameters.border_color === null) {
                parameters.border_color = 'cccccc';
            }
            if (parameters.width === null) {
                parameters.width = defaultWidth;
            }
            if (parameters.width_unit === null) {
                parameters.width_unit = defaultWidthUnit;
            }
            if (parameters.frame_height === null) {
                parameters.frame_height = defaultHeight;
            }
            json = parameters;
            renderIframe();
        };

        /**
         * Save the sakai2tools to the jcr
         */
        var saveRemoteContent = function() {
            var  saveContentAjax = function(json_data) {
                var url = sakai.api.Widgets.getWidgetDataStorageURL(tuid);
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: json,
                    success: function(data) {
                        savedDataToJCR(true, data);
                    }
                });
                // Because we need to use a particular servlet (LiteBasicLTI), and it
                // requires some different options, we make our own ajax call above
                // instead of using saveWidgetData for now.
                //
                //sakai.api.Widgets.saveWidgetData(tuid, json, savedDataToJCR);
            };

            if (isSakai2Tool()) {
                json['lti_virtual_tool_id'] = $('#sakai2tools_settings_lti_virtual_tool_id',rootel).val();
                json[':operation'] = 'basiclti';
                json['sling:resourceType'] = 'sakai/basiclti';
                json.ltikey = $(sakai2toolsSettingsLtiKey,rootel).val() || '';
                json.ltisecret = $(sakai2toolsSettingsLtiSecret,rootel).val() || '';
                json['debug@TypeHint'] = 'Boolean';
                json.debug = $('#sakai2tools_settings_debug:checked',rootel).val() !== null;
                json['release_names@TypeHint'] = 'Boolean';
                json.release_names = $('#sakai2tools_settings_release_names:checked',rootel).val() !== null;
                json['release_principal_name@TypeHint'] = 'Boolean';
                json.release_principal_name = $('#sakai2tools_settings_release_principal_name:checked',rootel).val() !== null;
                json['release_email@TypeHint'] = 'Boolean';
                json.release_email = $('#sakai2tools_settings_release_email:checked',rootel).val() !== null;
                json.launchDataUrl = ''; // does not need to be persisted
                json.tuidFrame = ''; // does not need to be persisted
                json.defined = ''; // what the heck is this? Where does it come from?
                json._MODIFIERS = null; // trimpath garbage - probably need a more selective way of saving data

                saveContentAjax(json);
            } else if (json.ltiurl !== '') {
                json.ltiurl = $(sakai2toolsSettingsLtiUrl,rootel).val() || '';
                json[':operation'] = 'basiclti';
                json['sling:resourceType'] = 'sakai/basiclti';
                json.ltikey = $(sakai2toolsSettingsLtiKey,rootel).val() || '';
                json.ltisecret = $(sakai2toolsSettingsLtiSecret,rootel).val() || '';
                json['debug@TypeHint'] = 'Boolean';
                json.debug = $('#sakai2tools_settings_debug:checked',rootel).val() !== null;
                json['release_names@TypeHint'] = 'Boolean';
                json.release_names = $('#sakai2tools_settings_release_names:checked',rootel).val() !== null;
                json['release_principal_name@TypeHint'] = 'Boolean';
                json.release_principal_name = $('#sakai2tools_settings_release_principal_name:checked',rootel).val() !== null;
                json['release_email@TypeHint'] = 'Boolean';
                json.release_email = $('#sakai2tools_settings_release_email:checked',rootel).val() !== null;
                json.launchDataUrl = ''; // does not need to be persisted
                json.tuidFrame = ''; // does not need to be persisted
                json.defined = ''; // what the heck is this? Where does it come from?
                json._MODIFIERS = null; // trimpath garbage - probably need a more selective way of saving data

                saveContentAjax(json);
            } else {
                sakai.api.Util.notification.show('', sakai.api.i18n.getValueForKey('PLEASE_SPECIFY_A_URL'),
                                                 sakai.api.Util.notification.type.ERROR);
            }
        };

        /**
         * Change the direction (up/down) of the arrow for the advanced settings
         */
        var changeAdvancedSettingsArrow = function() {
            if (isAdvancedSettingsVisible) {
                $(sakai2toolsSettingsAdvancedDown, rootel).hide();
                $(sakai2toolsSettingsAdvancedUp, rootel).show();
            }
            else {
                $(sakai2toolsSettingsAdvancedUp, rootel).hide();
                $(sakai2toolsSettingsAdvancedDown, rootel).show();
            }
        };


        //////////////
        // Bindings //
        //////////////

        /*
         * Add binding to the color boxes
         */
        var addColorBinding = function() {
            $('.sakai2tools_settings_color',rootel).click(function() {
                json.border_color = $(this).attr('id').split('_')[$(this).attr('id').split('_').length - 1];
                renderIframeSettings(false);
                renderColorContainer();
                addColorBinding();
            });
        };

        /*
         * Add binding to all the elements
         */
        var addBinding = function() {

            // Change the url for the iFrame
            $(sakai2toolsSettingsLtiUrl, rootel).change(function() {
                var urlValue = $(this).val();
                if (urlValue !== '') {
                    // Check if someone already wrote http inside the url
                    if (!isUrl(urlValue)) {
                        urlValue = 'http://' + urlValue;
                    }
                    json.ltiurl = urlValue;
                }
            });

            // Change the iframe width
            $(sakai2toolsSettingsWidth, rootel).change(function() {
                var widthValue = $(sakai2toolsSettingsWidth, rootel).val();

                if (isDecimal(widthValue)) {
                    json.width = widthValue;
                }
                renderIframeSettings(false);
            });

            // Change the iframe height
            $(sakai2toolsSettingsHeight, rootel).change(function() {
                var heightValue = $(sakai2toolsSettingsHeight, rootel).val();

                if (isDecimal(heightValue)) {
                    json.frame_height = heightValue;
                }
                renderIframeSettings(false);
            });

            // Change the border width
            $(sakai2toolsSettingsBorders, rootel).change(function() {
                var borderValue = $(sakai2toolsSettingsBorders, rootel).val();
                if (isDecimal(borderValue)) {
                    json.border_size = borderValue;
                    renderIframeSettings(false);
                }
            });

            // Toggle the advanced view
            $(sakai2toolsSettingsAdvancedToggleSettings,rootel).click(function() {
                $('#sakai2tools_settings_advanced', rootel).toggle();
                isAdvancedSettingsVisible = !isAdvancedSettingsVisible;
                changeAdvancedSettingsArrow();
            });

            // When you click on one of the width units (px or percentage)
            $(sakai2toolsSettingsWidthUnitClass,rootel).click(function() {
                var widthUnitValue = $(this).attr('id').split('_')[$(this).attr('id').split('_').length - 1];
                if (widthUnitValue === 'px') {
                    json.width_unit = widthUnitValue;
                }
                else {
                    json.width_unit = '%';
                }
                $(sakai2toolsSettingsWidthUnitClass,rootel).removeClass(sakai2toolsSettingsWidthUnitSelectedClass);
                $(this).addClass(sakai2toolsSettingsWidthUnitSelectedClass);
                renderIframeSettings(false);
            });

            // When you push the save button..
            $(sakai2toolsSettingsInsert, rootel).click(function() {
                saveRemoteContent();
            });

            // Cancel it
            $(sakai2toolsSettingsCancel,rootel).click(function() {
                sakai.api.Widgets.Container.informCancel(tuid, 'sakai2tools');
            });

            addColorBinding();
        };


        ///////////////////////
        // Initial functions //
        ///////////////////////

        /**
         * Function that fills in the input fields in the settings tab.
         * @param {Object} parameters A JSON object that contains the necessary information.
         * @param {Boolean} exists Does there exist a previous sakai2tools
         */
        var displaySettings = function(parameters, exists) {
            if (exists && parameters.ltiurl) {
                json = parameters;
            }
            else { // use default values
                json = {
                    ltiurl: '',
                    ltikey: '',
                    ltisecret: '',
                    release_names: true,
                    release_principal_name: true,
                    release_email: true,
                    border_size: 0,
                    border_color: 'cccccc',
                    frame_height: defaultHeight,
                    width: defaultWidth,
                    width_unit: defaultWidthUnit
                };
            }
            json.isSakai2Tool = isSakai2Tool();
            renderRemoteContentSettings();
            //renderIframeSettings(true); // LDS disabled preview
            renderColorContainer();
            addBinding(); // Add binding to the various elements
            changeAdvancedSettingsArrow();
            $(sakai2toolsSettings,rootel).show(); // Show the sakai2tools settings
        };

        /*
         * Is the widget in settings mode or not
         */
        if (showSettings) {
            $(sakai2toolsMainContainer,rootel).hide();
            $(sakai2toolsSettings,rootel).show();
        }
        else {
            $(sakai2toolsSettings,rootel).hide();
            $(sakai2toolsMainContainer,rootel).show();
        }

        /**
         * Will fetch the URL and other parameters from the JCR and according to which
         * view we are in, fill in the settings or display an iframe.
         */
        var getRemoteContent = function() {
            // The list of available Sakai 2 Tools is configurable at runtime on nakamura
            sakai.api.Server.loadJSON('/var/basiclti/cletools.json' , function(success,data) {
                toolList = [];
                for (var i = 0; i < data.toolList.length; i++) {
                    // Our i18n keys for the tools are formatted as: sakai.announcements -> CLE_SAKAI_ANNOUNCEMENTS
                    var key = 'CLE_' + data.toolList[i].replace(/\./g,'_').toUpperCase();
                    var toolname = '';
                    if (sakai.config.sakai2ToolNames && sakai.config.sakai2ToolNames[data.toolList[i]]) {
                        toolname = sakai.config.sakai2ToolNames[data.toolList[i]];
                    }
                    else {
                        toolname = sakai.api.i18n.getValueForKey(key, 'sakai2tools');
                        if (toolname === false) {
                            toolname = data.toolList[i];
                        }
                    }
                    toolList.push({toolid: data.toolList[i], toolname: toolname});
                }
                toolList.sort(function(a,b) {
                    return sakai.api.Util.Sorting.naturalSort(a.toolname, b.toolname);
                });
            });
            sakai.api.Widgets.loadWidgetData(tuid, function(success,data) {
                if (success) {
                    if (showSettings) {
                        displaySettings(data,true);
                    }
                    else {
                        displayRemoteContent(data);
                    }
                }
                else {
                    if (showSettings) {
                        displaySettings(null, false);
                    }
                    else {
                        displayRemoteContent(false);
                    }
                }
            }, false);
        };

        getRemoteContent();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('sakai2tools');
});
