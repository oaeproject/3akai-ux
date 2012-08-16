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

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.embedcontent
     *
     * @class embedcontent
     *
     * @description
     * Initialize the embedcontent widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.embedcontent = function(tuid, showSettings, widgetData) {

        var $rootel = $('#' + tuid);

        var $embedcontent_main_container = $('#embedcontent_main_container', $rootel);
        var $embedcontent_page_name = $('#embedcontent_page_name', $rootel);


        // Settings Mode
        var $embedcontent_settings = $('#embedcontent_settings', $rootel);
        var $embedcontent_dont_add = $('.embedcontent_dont_add', $rootel);

        // Choose Content tab selectors
        var $embedcontent_tabs = $('#embedcontent_settings_container .s3d-tabs', $rootel);
        var $embedcontent_search_for_content = $('#embedcontent_search_for_content', $rootel);
        var $embedcontent_just_add = $('#embedcontent_just_add', $rootel);
        var $embedcontent_button_goto_display_settings = $('#embedcontent_button_goto_display_settings', $rootel);
        var $embedcontent_content_input = $('#embedcontent_content_input', $rootel);
        var $fileuploadContainer = $('#fileupload_container', $rootel);
        var $uploadContentLink = $('#upload_content', $rootel);

        // Display Settings tab selectors
        var $embedcontent_alternative_display_name_value = $('#embedcontent_alternative_display_name_value', $rootel);
        var $embedcontent_description_value = $('#embedcontent_description_value', $rootel);
        var $embedcontent_page_name_template = $('#embedcontent_page_name_template', $rootel);
        var $embedcontent_button_add_selected_content = $('#embedcontent_button_add_selected_content', $rootel);
        var $embedcontent_display_previews = $('#embedcontent_display_style div.s3d-highlight_area_background', $rootel);
        var $embedcontent_include_inputs = $('#embedcontent_include input', $rootel);
        var $embedcontent_layout_options = $('#embedcontent_choose_layout div', $rootel);
        var $embedcontent_add_title_description_button = $('#embedcontent_add_title_description_button', $rootel);
        var $embedcontent_add_title_description_fields = $('#embedcontent_add_title_description_fields', $rootel);
        var $embedcontent_display_form = $('#embedcontent_display_form', $rootel);
        var $embedcontent_choose_layout_container = $('#embedcontent_choose_layout_container', $rootel);
        var $embedcontent_title = $('#embedcontent_title', $rootel);
        var $embedcontent_description = $('#embedcontent_description', $rootel);

        // Display mode
        var $embedcontent_content = $('#embedcontent_content', $rootel);
        var $embedcontent_content_html_template = $('#embedcontent_content_html_template', $rootel);
        var $embedcontent_primary_display = $('.embedcontent_primary_display', $rootel);
        var $embedcontent_alt_display = $('.embedcontent_alt_display', $rootel);
        var $embedcontent_item_unavailable_text = $('#embedcontent_item_unavailable_text', $rootel);


        var selectedItems = [];
        var firstTime = true;
        var firstLoad = true;
        var wData = false;
        var isPreviewExist = true;
        var active_content_class = 'tab_content_active';
        var tab_id_prefix = 'embedcontent_tab_';
        var active_tab_class = 's3d-tabs-active';
        var defaultsSet = false;

        var embedConfig = {
            'name': 'Page',
            'limit': false,
            'filter': false,
            'type': 'choose'
        };

        /**
         * Render the embed screen
         */
        var renderSettings = function() {
            selectedItems = [];
            sakai.api.Util.TemplateRenderer($embedcontent_page_name_template, {'name': embedConfig.name}, $embedcontent_page_name);

            // Callback function after autosuggest has loaded
            var postAutoSuggest = function() {
                if (wData && wData.items && wData.items.length) {
                    setCurrentFiles();
                }
            };

            if (firstTime) {
                setupAutoSuggest(postAutoSuggest);
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid, false);
                firstTime = false;
            } else {
                doReset(postAutoSuggest);
            }
            if (firstLoad) {
                $embedcontent_primary_display.show();
                $embedcontent_alt_display.hide();
            } else {
                $embedcontent_primary_display.hide();
                $embedcontent_alt_display.show();
            }
        };

        var renderWidget = function() {
            wData.sakai = sakai;
            wData.showDefaultContent = false;
            var docData = {};
            $.each(wData.items, function(index, value) {
                if (value.description) {
                    value.description = sakai.api.Util.applyThreeDots(value.description, 680, {max_rows: 3});
                }

                if (value.fullresult) {
                    var placement = 'ecDocViewer' + tuid + value['_path'] + sakai.api.Util.generateWidgetId();
                    wData.items[index].placement = placement;
                    docData[placement] = {
                        data: value.fullresult,
                        url: window.location.protocol + '//' + window.location.host + '/p/' + (value.fullresult['jrc:name'] || value.fullresult._path)
                    };
                }
            });
            // Sort the items alphabetically for now
            wData.items.sort(function( a, b ) {
                return sakai.api.Util.Sorting.naturalSort( a.name, b.name );
            });
            // boolean are return as string from ajax call so change back to boolean value
            wData.download = wData.download === 'true' || wData.download === true;
            wData.name = wData.name === 'true' || wData.name === true;
            wData.details = wData.details === 'true' || wData.details === true;
            sakai.api.Util.TemplateRenderer($embedcontent_content_html_template, wData, $embedcontent_content);
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid, false, false, docData);
        };

        /**
         * Do a reset of the embed screen
         * @param {Function} callback function
         */
        var doReset = function(callback) {
            sakai.api.Util.AutoSuggest.reset( $embedcontent_content_input );

            if ($.isFunction(callback)) {
                callback();
            }
        };

        var toggleButtons = function(doDisable) {
            var elts = [
                $embedcontent_just_add,
                $embedcontent_button_goto_display_settings,
                $embedcontent_button_add_selected_content
            ];
            $.each(elts, function(i,$elt) {
                if (doDisable) {
                    $elt.attr('disabled', 'disabled');
                } else {
                    $elt.removeAttr('disabled');
                }
            });
        };

        /**
         * Creates an object out of results provided
         * This object contains valuable information about the file like path, name, type,...
         * @param {Object} result results provided (eg through a search)
         * @param {Object} name optional name provided
         */
        var createDataObject = function(result, name) {
            var mimetype = sakai.api.Content.getMimeType(result);
            var dataObj = {
                'value': name || result['_path'],
                'name': sakai.api.Security.safeOutput(result['sakai:pooled-content-file-name']),
                'type': 'file',
                'filetype': mimetype.split('/')[0],
                '_mimeType': mimetype,
                'description': result['sakai:description'] || '',
                'path': '/p/' + (name || result['_path']),
                'fileSize': sakai.api.Util.convertToHumanReadableFileSize(result['_length']),
                '_path': result['_path'],
                '_mimeType/page1-small': result['_mimeType/page1-small'],
                'fullresult' : result
            };
            var link = sakai.api.Util.safeURL(name || result['_path']) + '/' + sakai.api.Util.safeURL(result['sakai:pooled-content-file-name']);
            if (dataObj._mimeType === 'x-sakai/link') {
                dataObj.downloadLink = result['sakai:pooled-content-url'];
                dataObj.contentProfileLink = '/content#p=' + link;
            } else {
                dataObj.downloadLink = '/p/' + link;
                dataObj.contentProfileLink = '/content#p=' + link;
            }

            // if the type is application need to auto check the display name so set ispreviewexist false
            if (dataObj.filetype === 'application') {
                isPreviewExist = false;
            }

            return dataObj;
        };

        var autosuggestSelectionAdded = function(item) {
            selectedItems.push(item);
            toggleButtons();
            if (selectedItems.length > 1) {
                $embedcontent_choose_layout_container.show();
            }
        };

        var autosuggestSelectionRemoved = function(elem) {
            var path = elem.attr('id').split('as-selection-')[1];
            removeItemFromSelected(path); // get path
            elem.remove();
            if (selectedItems.length === 0) {
                toggleButtons(true);
            } else if (selectedItems.length === 1) {
                $embedcontent_choose_layout_container.hide();
            }
        };

        /**
         * When typing in the suggest box this function is executed to provide the user with a list of possible autocompletions
         * @param {Function} callback function
         */
        var setupAutoSuggest = function(callback) {
            var dataFn = function( query, add ) {
                var q = sakai.api.Server.createSearchString(query);
                var options = {'page': 0, 'items': 15, 'q': q, 'userid': sakai.data.me.user.userid};
                searchUrl = sakai.config.URL.SEARCH_ALL_FILES.replace('.json', '.infinity.json');
                sakai.api.Server.loadJSON(searchUrl, function(success, data) {
                    if (success) {
                        var suggestions = [];
                        $.each(data.results, function(i) {
                            var dataObj = createDataObject(data.results[i]);
                            var doAdd = true;
                            if (embedConfig.filter) {
                                if (dataObj.filetype !== embedConfig.filter) {
                                    doAdd = false;
                                }
                            }
                            if (doAdd) {
                                suggestions.push(dataObj);
                            }
                        });
                        add( suggestions, query );
                    }
                }, options);
            };
            sakai.api.Util.AutoSuggest.setup($embedcontent_content_input, {
                asHtmlID: tuid,
                retrieveLimit: 10,
                selectionLimit: embedConfig.limit,
                resultClick: function(data) {
                    autosuggestSelectionAdded(data.attributes);
                },
                selectionRemoved: function(elem) {
                    autosuggestSelectionRemoved(elem);
                }
            }, callback, dataFn);
        };

        /**
         * Removes a previously selected item from the list of selected items
         * @param {Object} path path of the selected item to be removed from the list
         */
        var removeItemFromSelected = function(path) {
            var newItems = [];
            $(selectedItems).each(function(i, val) {
                if (val.value !== path) {
                    newItems.push(val);
                }
            });
            selectedItems = newItems;
        };

        var setCurrentFiles = function() {
            $.each(wData.items, function(i,val) {
                autosuggestSelectionAdded(val);
                if (val.value) {
                    $embedcontent_content_input.autoSuggest( 'add_selected_item', val, val.value);
                } else {
                    $embedcontent_content_input.autoSuggest( 'add_selected_item', {name:$embedcontent_item_unavailable_text.text(), value:'notfound'+Math.ceil(Math.random() * 9999)}, 'notfound');
                }
            });
            $('.as-original input.as-input').val('').focus();
            if (wData.title || wData.description) {
                toggleAddTitleAndDescription(true);
                $embedcontent_title.val(wData.title);
                $embedcontent_description.val(wData.description);
            }
            if (wData.layout !== 'single') {
                $embedcontent_display_form.find('img.selected').removeClass('selected');
                $embedcontent_display_form
                    .find('input[name="layout"][value="' + wData.layout + '"]')
                    .siblings('img')
                    .addClass('selected');
                $embedcontent_display_form
                    .find('input[name="layout"][value="' + wData.layout + '"]')
                    .attr('checked', true);
            }
            $embedcontent_display_form
                .find('input[name="style"][value="' + wData.embedmethod + '"]')
                .parent('div')
                .siblings('div')
                .children('img')
                .addClass('selected');
            $embedcontent_display_form.find('input[name="style"][value="' + wData.embedmethod + '"]').attr('checked', true);
            var checkboxes = ['name', 'download', 'details'];
            $.each(checkboxes, function(i,val) {
                if (wData[val] === 'true' || wData[val] === true) {
                    $embedcontent_display_form.find('input[name="' + val + '"]').attr('checked', 'checked');
                    $('.embedcontent_include_' + val, $rootel).show();
                }
            });
        };

        /**
         * Sets the default options in the display settings
         * @param {Object} options The object containing the default options to set
         *                          embedmethod {String} original or thumbnail
         *                          layout {String} vertical or horizontal
         *                          showName {Boolean} true to show name by default
         *                          showDetails {Boolean} true to show details by default
         *                          showDownload {Boolean} true to show download link by default
         */
        var setDefaultOptions = function(options) {
            if (options.embedmethod === 'thumbnail') {
                $('.embedcontent_option #thumbnail', $rootel).click();
            } else if (options.embedmethod === 'original') {
                $('.embedcontent_option #original_size', $rootel).click();
            }
            if (options.layout === 'vertical') {
                $('#embedcontent_layout_vertical', $rootel).click();
            } else if (options.layout === 'horizontal') {
                $('#embedcontent_layout_horizontal', $rootel).click();
            }
            if (options.showName) {
                $('#embedcontent_name_checkbox', $rootel).click();
            }
            if (options.showDetails) {
                $('#embedcontent_details_checkbox', $rootel).click();
            }
            if (options.showDownload) {
                $('#embedcontent_download_checkbox', $rootel).click();
            }
        };

        /**
         * Called when file(s) are selected in the picker advanced widget and need to be added to the list of files that will be embedded.
         * @param {Object} files Array of files selected in the picker advanced widget
         */
        var addChoicesFromPickeradvanced = function(files) {
            var filesPicked = 0;
            $.each(files, function(i,val) {
                filesPicked++;
            });
            // revisit this next conditional -- right now it'll clear out all selections, not just add up to the limit
            if (embedConfig.limit && filesPicked && ($('.as-selection-item', '#embedcontent_settings').length + filesPicked) > embedConfig.limit) {
                doReset();
            }
            $.each(files, function(i,val) {
                var newObj = createDataObject(val, val['_path']);
                autosuggestSelectionAdded(newObj);
                $embedcontent_content_input.autoSuggest( 'add_selected_item', newObj, newObj.value);
            });
            $('input[id="' + tuid + '"]').val('').focus();
        };

        /**
         * Called when newly uploaded files need to be added to the list of files that will be embedded
         * @param {Object} files Array containing a list of files
         */
        var addChoicesFromFileUpload = function(files) {
          $.each(files, function(i,val) {
              $.ajax({
                 url: val.url + '.infinity.json',
                 success: function(data) {
                     var newObj = createDataObject(data, val.url.split('/p/')[1]);
                     autosuggestSelectionAdded(newObj);
                     $embedcontent_content_input.autoSuggest( 'add_selected_item', newObj, newObj.value);
                 }
              });
          });
          $('input[id="' + tuid + '"]').val('').focus();
          toggleButtons();
        };

        /**
         * Once the content has been placed on the page it has to be associated with the group
         * The group is set as a viewer of the content
         * @param {Object} embeddedItems Array of object containing information about the selected items. Only the path variable is used.
         */
        var associatedEmbeddedItemsWithGroup = function(embeddedItems) {
            var data = [];
            for (var embeddedItem in embeddedItems) {
                if (embeddedItems.hasOwnProperty(embeddedItem) && !sakai.api.Content.isContentInLibrary(embeddedItems[embeddedItem].fullresult, sakai_global.group.groupId)) {
                    data.push(embeddedItems[embeddedItem].value);
                }
            }
            if (data.length > 0) {
                sakai.api.Content.addToLibrary(data, sakai_global.group.groupId);
            }
        };

        /**
         * Embed the selected content on the page,
         * Call the function that associates the content with this group
         */
        var doEmbed = function() {
            var embedContentHTML = '';
            var formVals = $embedcontent_display_form.serializeObject();
            var itemsToSave = [];
            $.each(selectedItems, function(i,item) {
                if (item.path) {
                    itemsToSave.push(item.path);
                }
            });
            var objectData = {
                'layout': selectedItems.length > 1 ? formVals.layout : 'single',
                'embedmethod': formVals.style,
                'title': formVals.title || '',
                'description': formVals.description || '',
                'items': itemsToSave,
                'details': formVals.details ? true : false,
                'download': formVals.download ? true : false,
                'name': formVals.name ? true : false
            };

            if (sakai_global.group && sakai_global.group.groupId) {
                // Associate embedded items with the group
                associatedEmbeddedItemsWithGroup(selectedItems);
            }

            saveWidgetData(objectData);
        };

        var saveWidgetData = function(data) {
            sakai.api.Widgets.saveWidgetData(tuid, data, function() {
                sakai.api.Widgets.Container.informFinish(tuid, 'embedcontent');
            }, true);
        };

        var newItems = [];
        var processWidget = function(data, callback) {
            var ret = false;
            var batchRequests = [];
            for (var i = 0, j = data.items.length; i < j; i++) {
                batchRequests.push({
                    url: data.items[i] + '.2.json',
                    method: 'GET'
                });
            }

            if (batchRequests.length > 0) {
                sakai.api.Server.batch(batchRequests, function(success, response) {
                    if (success || batchRequests.length === 1) {
                        $.each(response.results, function(index, item) {
                            if (item.success && item.body) {
                                var newItem = createDataObject($.parseJSON(item.body));
                                newItems.push(newItem);
                            } else {
                                newItems.push({
                                    type: 'notfound',
                                    name: $embedcontent_item_unavailable_text.text(),
                                    value: 'notfound2' + index,
                                    path: item.url.replace('.2.json', '')
                                });
                            }
                        });
                        wData.items = newItems;
                        ret = true;
                    }
                    if ($.isFunction(callback)) {
                        callback(ret);
                    }
                });
            } else if ($.isFunction(callback)) {
                callback(ret);
            }
        };

        var getWidgetData = function(callback) {
            if (widgetData && widgetData.embedcontent) {
                processWidgetData(true, widgetData.embedcontent, callback);
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                    processWidgetData(success, data, callback);
                });
            }
        };

        var processWidgetData = function(success, data, callback) {
            if (success) {
                wData = data;
                firstLoad = false;
                newItems = [];
                // get the item profile data
                processWidget(data, callback);
            } else {
                if ($.isFunction(callback)) {
                    callback(false);
                }
            }
        };

        // Bind Events
        $embedcontent_button_add_selected_content.on('click', function() {
            doEmbed();
            return false;
        });

        $embedcontent_just_add.on('click', function() {
            doEmbed();
        });

        $embedcontent_dont_add.on('click', function() {
            sakai.api.Widgets.Container.informCancel(tuid, 'embedcontent');
            return false;
        });

        $uploadContentLink.on('click', function() {
            $(window).trigger('init.newaddcontent.sakai');
            return false;
        });

        var toggleTabs = function(target) {
            if (!isPreviewExist) {
                $('#embedcontent_name_checkbox').selected(true);
            }
            $('.' + active_tab_class).removeClass(active_tab_class);
            $(target).addClass(active_tab_class);
            $('.' + active_content_class).hide();
            $('#' + $(target).attr('id') + '_content').addClass(active_content_class).show();
        };

        $embedcontent_tabs.find('button').on('click', function(e) {
            var tab = $(e.target).attr('id').split(tab_id_prefix)[1];
            if ($(e.target).parent('li').hasClass(active_tab_class)) {
                return false;
            } else {
                toggleTabs(e.target);
            }
            if (tab === 'display' && !defaultsSet && !wData && sakai.widgets.embedcontent.defaultConfiguration) {
                setDefaultOptions(sakai.widgets.embedcontent.defaultConfiguration);
                defaultsSet = true;
            }
            return false;
        });

        /**
         * Bind to a click on the display preview blocks
         * This should place an outline on the img and check the checkbox
         */
        $embedcontent_display_previews.on('click', function(e) {
            if ($(this).find('input').attr('checked') === 'checked') {
                return true;
            } else {
               $('#embedcontent_display_style img.selected', $rootel).removeClass('selected');
               $(this).find('input').attr('checked', 'checked');
               $(this).find('img').addClass('selected');
               return true;
            }
        });

        $embedcontent_display_previews.find('a').on('click', function(e) {
            // trigger the above event handler
            $(e.target).parent('span').parent('div').parent('div').trigger('click');
            return false;
        });

        $embedcontent_button_goto_display_settings.on('click', function(e) {
            toggleTabs($('#embedcontent_tab_display'));
            return false;
        });

        /**
         * Bind to a change in the include checkboxes
         * This toggles the preview elements
         */
        $embedcontent_include_inputs.on('change', function(e) {
            var which = $(this).attr('id').split('_')[1];
            if ($(this).attr('checked')) {
                $('.embedcontent_include_' + which).show();
            } else {
                $('.embedcontent_include_' + which).hide();
            }
        });

        $embedcontent_layout_options.on('click', function(e) {
            if ($(this).find('input').attr('checked') === 'checked') {
                return true;
            } else {
               $('#embedcontent_choose_layout img.selected', $rootel).removeClass('selected');
               $(this).find('input').attr('checked', 'checked');
               $(this).find('img').addClass('selected');
               return true;
            }
        });

        var toggleAddTitleAndDescription = function() {
            $embedcontent_add_title_description_fields.toggle();
        };

        $embedcontent_add_title_description_button.on('click', function(e) {
            toggleAddTitleAndDescription();
            return false;
        });

        $(window).off('finished.pickeradvanced.sakai');
        $(window).on('finished.pickeradvanced.sakai', function(e, data) {
            addChoicesFromPickeradvanced(data.toAdd);
        });

        $(document).off('done.newaddcontent.sakai').on('done.newaddcontent.sakai', function(e, data, library) {
            if ($('#embedcontent_settings', $rootel).is(':visible') &&
                (!sakai_global.group || (sakai_global.group && sakai_global.group.groupId))) {
                var obj = {};
                for (var i = 0; i < data.length; i++) {
                    obj[data[i]._path] = data[i];
                }
                addChoicesFromPickeradvanced(obj);
            }
        });

        $(window).off('ready.pickeradvanced.sakai');
        $(window).on('ready.pickeradvanced.sakai', function(e) {
            $embedcontent_search_for_content.on('click', function() {
                var pickerConfig = {
                    'type': 'content'
                };
                if (embedConfig.limit) {
                    pickerConfig.limit = embedConfig.limit;
                }
                $(window).trigger('init.pickeradvanced.sakai', {'config': pickerConfig});
                return false;
            });
        });

        var renderDefaultContent = function() {
            sakai.api.Util.TemplateRenderer('embedcontent_content_html_template', {
                'showDefaultContent': true
            }, $('#embedcontent_content', $rootel));
        };

        var doInit = function() {
            getWidgetData(function(success) {
                if (showSettings) {
                    var title = false;
                    if (sakai_global.lhnavigation &&
                        sakai_global.lhnavigation.getCurrentPage &&
                        sakai_global.lhnavigation.getCurrentPage().title) {

                        title = sakai_global.lhnavigation.getCurrentPage().title;
                    }
                    if (title) {
                        embedConfig.name = title;
                    } else {
                        embedConfig.name = '';
                    }

                    renderSettings();
                    $embedcontent_settings.show();
                    $('.as-selections input:visible', $rootel).focus();
                } else if (!success) {
                    renderDefaultContent();
                    $embedcontent_main_container.show();
                } else {
                    $embedcontent_main_container.show();
                    renderWidget();
                }
            });
        };

        doInit();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad('embedcontent');
});
