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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */

/*global $ */

// Namespaces
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.pickeradvanced
     *
     * @class pickeradvanced
     *
     * @description
     * Advanced Picker widget<br />
     * This is a general widget which aims to display an arbitriary number of
     * items, loading dynamically if the list is very long and return the
     * selected users in an object.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.pickeradvanced = function(tuid, showSettings) {
        var $rootel = $('#' + tuid);

        var $pickeradvanced_container = $('#pickeradvanced_container', $rootel);
        var $pickeradvanced_content_list = $('#pickeradvanced_content_list', $rootel);
        var $pickeradvanced_search_query = $('#pickeradvanced_search_query', $rootel);
        var $pickeradvanced_search_button = $('#pickeradvanced_search_button', $rootel);
        var $pickeradvanced_close_button = $('#pickeradvanced_close_button', $rootel);
        var $pickeradvanced_select_all_button = $('#pickeradvanced_select_all_button', $rootel);
        var $pickeradvanced_content_search_form = $('#pickeradvanced_content_search_form', $rootel);
        var $pickeradvanced_add_button = $('#pickeradvanced_add_button', $rootel);
        var $pickeradvanced_sort_on = $('#pickeradvanced_sort_on', $rootel);
        var $pickeradvanced_close_dialog = $('.pickeradvanced_close_dialog', $rootel);
        var $pickeradvanced_search_filter = $('.pickeradvanced_search_filter');

        var $pickeradvanced_error_template = $('#pickeradvanced_error_template', $rootel);
        var $pickeradvanced_content_search_pagetemplate = $('#pickeradvanced_content_search_pagetemplate', $rootel);
        var $pickeradvanced_content_search_listtemplate = $('#pickeradvanced_content_search_listtemplate', $rootel);

        var $pickeradvanced_search_titles = $('.pickeradvanced_search_titles', $rootel);
        var $pickeradvanced_search_files = $('#pickeradvanced_search_files', $rootel);

        var pickeradvanced_page = '.pickeradvanced_page';
        var pickeradvanced_content_search = '#pickeradvanced_content_search';

        var pickerlist = false;
        var firstTime = true;

        var pickerData = {
          'selected': {},
          'searchIn': sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
          'currentElementCount': 0,
          'selectCount': 0,
          'mode': 'search',
          'type': 'people',
          'items': 50,
          'selectable': true,
          'sortOn': 'lastName',
          'sortOrder': 'asc'
        };

        /**
         * Reset
         * Resets the people picker to a default state
         * @returns void
         */
        var reset = function() {
            $(pickeradvanced_content_search).html('');
            $(pickeradvanced_content_search).off('scroll');
            pickerData.selected = {};
            pickerData.currentElementCount = 0;
            pickerData.selectCount = 0;
        };

        /**
         * Render
         * Renders the people picker
         * @param iConfig {String} Config element for the widget
         * @returns void
         */
        var render = function(iConfig) {
            // Merge user defined config with default
            for (var element in iConfig) {
                if (iConfig.hasOwnProperty(element) && pickerData.hasOwnProperty(element)) {
                    pickerData[element] = iConfig[element];
                }
            }

            // display the groups list, bind elements and submit a search
            $pickeradvanced_search_titles.hide();
            $('.pickeradvanced_selected_list').removeClass('pickeradvanced_selected_list'); // deselect anything that was selected
            $('#pickeradvanced_search_files_mylibrary').parent('li').addClass('pickeradvanced_selected_list');
            $pickeradvanced_sort_on.hide();
            $pickeradvanced_search_files.show();
            $('ul.pickeradvanced_search_' + pickerData['type']).show();
            $pickeradvanced_search_query.focus();
            $pickeradvanced_search_button.click(submitSearch);
            $pickeradvanced_content_search_form.submit(submitSearch);
            $pickeradvanced_add_button.off('click');
            $pickeradvanced_add_button.on('click', function() {
                addPeople();
            });
            submitSearch();
        };

        /**
         * RenderSearch
         * Renders the people picker with a specified set of data. The function uses
         * a search query initially, then does the paginating and subsequent requests
         * for data automatically
         * @param iSearchQuery {String} A Sakai search query
         * @returns void
         */
        var submitSearch = function() {
            reset();
            var parameters = {
                'q': sakai.api.Server.createSearchString($pickeradvanced_search_query.val()) || '*',
                'page': 0,
                'items': pickerData['items'],
                'userid': sakai.data.me.user.userid,
                'sortOn': pickerData['sortOn'],
                'sortOrder': pickerData['sortOrder']
            };
            var searchURL = pickerData['searchIn'];
            addPage(parameters, searchURL);
            return false;
        };

        /**
         * addPage
         * Adds another page of search result to the picker's result list
         * @pageNumber {Int} The page we want to load
         * @url {String}     An object containing the search query elements
         */
        var addPage = function(parameters, url) {
            // Create new container for the bit we load. This is then appended to the
            // main container
            var $pl_pageContainer = $('<ul id=\'pickeradvanced_page_' + parameters.page + '\' class=\'pickeradvanced_page pickeradvanced_page_list loadinganim\'></ul>');

            // Display empty new container with loading anim
            $(pickeradvanced_content_search).append($pl_pageContainer);

            // Make the request
            $.ajax({
                url: url,
                data: parameters,
                type: 'GET',
                dataType: 'json',
                success: function(rawData) {
                    if (!rawData.results) {
                        rawData.results = rawData;
                    }
                    rawData.total = rawData.results.length;
                    rawData.sakai = sakai;

                    // Render the results data template
                    var pageHTML = sakai.api.Util.TemplateRenderer($pickeradvanced_content_search_pagetemplate, rawData);

                    // Remove loading animation
                    $pl_pageContainer = $('.pickeradvanced_page.pickeradvanced_page_list.loadinganim');
                    $pl_pageContainer.removeClass('loadinganim');

                    // Inject results into DOM
                    $pl_pageContainer.html(pageHTML);
                    // Wire loading the next page when user scrolls to the bottom of the list
                    if ((rawData.total > parameters.items) || (rawData.total === -1)) {

                        $(pickeradvanced_content_search).on('scroll', function(e) {
                            if ((e.target.scrollHeight - e.target.scrollTop - $(e.target).height() ) === 0) {
                                $(pickeradvanced_content_search).off('scroll');
                                parameters.page++;
                                addPage(parameters, url);
                            }
                        });

                    }

                    // Wire item selection
                    if (pickerData.selectable) {
                        $pickeradvanced_select_all_button.off('click');
                        $pickeradvanced_select_all_button.click(function() {
                            pickerData.selectCount = 0;
                            $('#pickeradvanced_content_search ul li').each(function(i) {
                                $(this).addClass('pickeradvanced_selected_user');
                                $(this).children('input').attr('checked', true);
                                pickerData.selectCount += 1;
                                pickerData['selected'][$(this).attr('id')] = rawData.results[i];
                                if ($pickeradvanced_add_button.is(':disabled')) {
                                    $pickeradvanced_add_button.removeAttr('disabled');
                                }
                            });
                        });
                        $('#pickeradvanced_page_' + parameters.page + ' li').off('click');
                        $('#pickeradvanced_page_' + parameters.page + ' li').on('click', function(e) {
                            // Check if user click on top of a link
                            if (e.target.tagName.toLowerCase() !== 'a') {
                                // Remove from selected list
                                if ($(this).hasClass('pickeradvanced_selected_user')) {
                                    $(this).removeClass('pickeradvanced_selected_user');
                                    $(this).children('input').removeAttr('checked');
                                    delete pickerData['selected'][$(this).attr('id')];
                                    pickerData.selectCount -= 1;
                                    if (pickerData.selectCount < 1) {
                                        $pickeradvanced_add_button.attr('disabled', 'disabled');
                                    }
                                } else {
                                    // Add to selected list
                                    $(this).addClass('pickeradvanced_selected_user');
                                    $(this).children('input').attr('checked', true);
                                    for (var j = 0; j < rawData.results.length; j++) {
                                        if (rawData.results[j]['_path'] && rawData.results[j]['_path'] === $(this).attr('id')) {
                                            pickerData.selectCount += 1;
                                            pickerData['selected'][$(this).attr('id')] = rawData.results[j];
                                            pickerData['selected'][$(this).attr('id')].entityType = 'file';
                                        }
                                    }
                                    if ($pickeradvanced_add_button.is(':disabled')) {
                                        $pickeradvanced_add_button.removeAttr('disabled');
                                    }
                                }
                            }
                        });
                    }

                    // Wire sorting select dropdown
                    $pickeradvanced_sort_on.off('change');
                    $pickeradvanced_sort_on.on('change', function(e) {
                        // Reset everything
                        reset();

                        // Set config to new sort key
                        // Start from scratch
                        pickerData['sortOn'] = $(this).val().split('_')[0];
                        pickerData['sortOrder'] = $(this).val().split('_')[1];
                        submitSearch();

                    });
                },
                error: function(xhr, status, thrown) {

                    // If it's likely to be a genuine server error
                    if ($pl_pageContainer.length === 0) {
                        $pickeradvanced_content_search.html($pickeradvanced_error_template.html());
                    } else {
                        // Probably it's the last page of the result set
                        $pl_pageContainer.last().remove();
                    }
                }
            });
        };

        sakai.api.Util.Modal.setup($pickeradvanced_container, {
            modal: true,
            overlay: 20,
            zIndex: 5000,
            toTop: true
        });

        var addPeople = function() {
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            sakai.api.Util.Modal.close($pickeradvanced_container);
            $(window).trigger('finished.pickeradvanced.sakai', {'toAdd':pickerData['selected']});
        };


        ////////////
        // Events //
        ////////////

        $(window).off('init.pickeradvanced.sakai');
        $(window).on('init.pickeradvanced.sakai', function(e, config) {
            firstTime = true;
            render(config.config);
            sakai.api.Util.Modal.open($pickeradvanced_container);
            pickerlist = config.list;
        });

        $pickeradvanced_close_dialog.off('click');
        $pickeradvanced_close_dialog.on('click', function() {
            sakai.api.Util.Modal.close($pickeradvanced_container);
        });

        $pickeradvanced_close_button.off('click');
        $pickeradvanced_close_button.on('click', function() {
            sakai.api.Util.Modal.close($pickeradvanced_container);
        });

        $pickeradvanced_search_filter.off('click');
        $pickeradvanced_search_filter.on('click', function() {
           $('.pickeradvanced_selected_list').removeClass('pickeradvanced_selected_list');
           $(this).parent('li').addClass('pickeradvanced_selected_list');
           if ( $( this ).attr( 'data-search' ) === 'all' ) {
               pickerData.searchIn = sakai.config.URL.SEARCH_ALL_FILES;
           } else if ($( this ).attr( 'data-search' ) === 'my' ) {
               pickerData.searchIn = sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER;
           }
           $pickeradvanced_sort_on.hide();
           submitSearch();
        });

        // Reset to defaults
        reset();

        // Send out an event that says the widget is ready to
        // accept a search query to process and display. This event can be picked up
        // in a page JS code
        $(window).trigger('ready.pickeradvanced.sakai');

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('pickeradvanced');
});
