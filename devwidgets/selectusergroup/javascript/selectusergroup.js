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
require(['jquery', 'sakai/sakai.api.core', 'jquery-highlight'], function($, sakai) {

    /**
     * @name sakai_global.selectusergroup
     *
     * @class selectusergroup
     *
     * @description
     * Select Users/Groups widget<br />
     * This widget is used to select users or groups
     * for another widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.selectusergroup = function(tuid, showSettings) {

        var $selectusergroup_container = $('#selectusergroup_container');
        var $selectusergroup_close_dialog = $('.selectusergroup_close_dialog');
        var $selectusergroup_close_button = $('#selectusergroup_close_button');
        var $selectusergroup_results_container = $('#selectusergroup_results_container');

        // selector to use for the roles selection popover
        var autoCompletePopover = '#selectusergroup_roles_popover_selected';
        var searchDialogPopover = '#selectusergroup_roles_popover';
        var popoverContainer = '';

        // setup unique selectors for autocomplete
        var elId = Math.round(Math.random() * 10000000);
        var selectedList = 'autocomplete_selected_' + elId;
        var resultsList = 'autocomplete_results_' + elId;

        var infinityScroll = false;
        var dataCache = {};
        var widgetData = {
          'sortOn': 'score',
          'sortOrder': 'desc'
        };

        // set config defaults
        var config = {
            keyDelay: 300,
            minLength: 2,
            retrieveLimit: 10
        };

        /**
         * Reset
         */
        var reset = function() {
            $(selectusergroup_content_search).html('');
            $(selectusergroup_content_search).off('scroll');
            dataCache = {};
        };

        /**
         * Closes the search dialog
         */
        var closeSearchDialog = function() {
            sakai.api.Util.Modal.close($selectusergroup_container);
        };

        /**
         * Reset
         * Resets the people picker to a default state
         */
        var renderTabs = function(callback) {
            sakai.api.Util.getTemplates(function(success, worlds) {
                $('#selectusergroup_tabs_container').html(sakai.api.Util.TemplateRenderer('#selectusergroup_tabs_template', {
                    'worlds': worlds,
                    'sakai': sakai
                }));
                if ($.isFunction(callback)) {
                    callback();
                }
            });
        };

        /**
         * Update the selected roles for the specific world
         */
        var updateWorldRolesSelected = function($worldListEl, everyone, selectedRoles) {
            var worldId = $worldListEl.attr('data-entity-id');
            var $pseudoGrpups = $worldListEl.find('ul.autocomplete_selected_roles');
            var prevGroupIds = [worldId];

            $.each($pseudoGrpups.children('li'), function(i, el) {
                prevGroupIds.push($(el).attr('data-entity-id'));
            });

            var item = {
                value: worldId
            };

            // Update the worlds selected roles in the selection list
            $pseudoGrpups.html(sakai.api.Util.TemplateRenderer('#selectusergroup_autocomplete_selected_template', {
                'item': item,
                'rolesOnly': true,
                'selectedRoles': selectedRoles,
                'sakai': sakai
            }));

            updateSelectedInputVal();
        };

        /**
         * 
         */
        var getSelectedInputVal = function() {
            var $selectedValuesInput = $('#' + selectedList + ' #autocomplete_placeholder').children('input#autocomplete_selected_values');
            return $selectedValuesInput.val().split(',');
        };

        /**
         * Updates the input field value based on the selected items
         */
        var updateSelectedInputVal = function() {
            var $selectedValuesInput = $('#' + selectedList + ' #autocomplete_placeholder').children('input#autocomplete_selected_values');
            var $selectedEntities = $('#' + selectedList + ' li.autocomplete_selected_item');
            var selected = [];

            $.each($selectedEntities, function(e, entity) {
                var entityType = $(entity).attr('data-entity-type');
                var entityId = $(entity).attr('data-entity-id');

                if (entityType === 'user') {
                    // add user to selection
                    selected.push(entityId);
                } else if (entityType === 'world') {
                    // add each psuedo group to selection
                    var $selectedRoles = $(entity).find('ul.autocomplete_selected_roles li')
                    if ($selectedRoles.length) {
                        $.each($selectedRoles, function(r, role) {
                            var roleId = $(role).attr('data-role-id');
                            var pseudoGroup = entityId + '-' + roleId;
                            // add psuedo group to selection
                            selected.push(pseudoGroup);
                        })
                    } else {
                        // add group to selection
                        selected.push(entityId);
                    }
                }
            });

            $selectedValuesInput.attr('value', selected.toString());
        };

        /**
         * Close roles selection dropdown
         */
        var closeRolesDropdown = function() {
            $(popoverContainer).hide();
            $(popoverContainer + '_container').html('');
        };

        /**
         * Open roles selection dropdown
         */
        var openRolesDropdown = function($el, worldId, type) {
            var worldData = dataCache[worldId];
            popoverContainer = searchDialogPopover;
            if (type === 'selecteditem') {
                popoverContainer = autoCompletePopover;
            }
            $(popoverContainer).show();
            $('.selectusergroup_roles_popover_loading').show();

            var popoverTop = $el.position().top + 25;
            var popoverLeft = $el.position().left - ($(popoverContainer).width() - $el.width());
            $(popoverContainer).css({
                top: popoverTop,
                left: popoverLeft
            });

            sakai.api.Groups.getGroupInformation({'groupId': worldId}, function(success, data) {
                if (success) {
                    var roles = sakai.api.Groups.getRoles(data.authprofile);

                    if (type === 'selecteditem') {
                        worldData = {
                            selectedRoles: {}
                        };

                        var everyone = true;

                        // we need to determine which roles are already selected
                        $.each($el.siblings('.autocomplete_selected_roles').children('li'), function(i, el) {
                            var roleId = $(el).attr('data-role-id');
                            $.each(roles, function(r, role) {
                                if (role.id === roleId) {
                                    worldData.selectedRoles[roleId] = role;
                                }
                                everyone = false;
                            })
                        });
                    }

                    var json = {
                        type: type,
                        roles: roles,
                        worldData: worldData,
                        everyone: everyone,
                        sakai: sakai
                    };

                    var templateContainer = popoverContainer + '_container';

                    $('.selectusergroup_roles_popover_loading').hide();
                    $(templateContainer).html(
                        sakai.api.Util.TemplateRenderer('#selectusergroup_roles_popover_template', json)
                    );

                    // update popover position
                    $(popoverContainer).css({
                        left: $el.position().left - ($(popoverContainer).width() - $el.width())
                    });

                    // bind apply button
                    $('.selectusergroup_roles_popover_save').off('click').on('click', function() {
                        var selectedRoles = {};
                        var everyone = false;
                        $.each($(templateContainer).find(':checked'), function(i, el) {
                            var roleId = $(el).val();
                            if (roleId === 'selectusergroup_everyone') {
                                // everyone has been selected
                                everyone = true;
                            } else {
                                // find the roles that have been selected
                                $.each(roles, function(r, role) {
                                    if (role.id === roleId) {
                                        selectedRoles[roleId] = role;
                                    }
                                });
                            }
                        })
                        if (type === 'selecteditem') {
                            updateWorldRolesSelected($el.closest('li'), everyone, selectedRoles);
                        } else {
                            dataCache[worldId] = dataCache[worldId] || {};
                            dataCache[worldId].selectedRoles = selectedRoles;
                        }
                        closeRolesDropdown(popoverContainer, templateContainer);
                    });

                    // setup hide on clickout
                    sakai.api.Util.hideOnClickOut($(templateContainer), $el, function() {
                        closeRolesDropdown(popoverContainer, templateContainer);
                    });
                }
            });
        };

        /**
         * Take a list of search results retrieved by the server and process them so they are
         * ready to be run through the template
         * @param {Object} results     List of results coming back from the infinite scroll plugin
         * @param {Object} callback    Callback function from the infinite scroll plugin to call
         */
        var renderResults = function(results, callback) {
            // If we have results we add them to the object.
            if (results && results.length) {
                var $selectedButton = $('#selectusergroup_tabs_container button.selected');
                var searchType = $selectedButton.attr('data-type');
                if (searchType === 'world') {
                    results = sakai.api.Groups.prepareGroupsForRender(results, sakai.data.me);
                } else if (searchType === 'user') {
                    results = sakai.api.User.preparePeopleForRender(results, sakai.data.me);
                }
            }

            var filteredResults = results;

            // apply filter
            if (config.searchFilter && config.searchFilter.length) {
                filteredResults = [];
                $.each(results.reverse(), function(i, item) {
                    if ($.inArray(item.id, config.searchFilter) === -1) {
                        filteredResults.push(item);
                        dataCache[item.id] = item;
                    }
                });
            }

            // Call the infinite scroll plugin callback
            callback(filteredResults);
        };

        var submitSearch = function() {
            var query = $('#selectusergroup_search_query').val();

            var parameters = {
                'q': sakai.api.Server.createSearchString(query),
                'sortOn': widgetData['sortOn'],
                'sortOrder': widgetData['sortOrder']
            };

            var $selectedButton = $('#selectusergroup_tabs_container button.selected');
            var searchUrl = sakai.config.URL.SEARCH_USERS;
            var searchType = $selectedButton.attr('data-type');
            var categoryId = $selectedButton.attr('data-category-id');
            var worldId = false;

            if (parameters.q === '*' || parameters.q === '**') {
                searchUrl = sakai.config.URL.SEARCH_USERS_ALL;
            }

            if (searchType === 'world') {
                searchUrl = sakai.config.URL.SEARCH_GROUPS;
                parameters.category = categoryId;
                if (parameters.q === '*' || parameters.q === '**') {
                    searchUrl = sakai.config.URL.SEARCH_GROUPS_ALL;
                }
            }

            // Disable the previous infinite scroll
            if (infinityScroll) {
                infinityScroll.kill();
            }

            // Set up the infinite scroll for the results
            infinityScroll = $('#selectusergroup_results_container').infinitescroll(searchUrl, parameters, function(items, total) {
                return sakai.api.Util.TemplateRenderer('#selectusergroup_results_template', {
                    'type': searchType,
                    'items': items,
                    'sakai': sakai
                });
            }, false, sakai.config.URL.INFINITE_LOADING_ICON, renderResults, function() {
                // highlight the search term in results
                $('#selectusergroup_results_container .selectusergroup_result_name').highlight(query);
            });
            //}, false, false, false, false, 400);
        };

        sakai.api.Util.Modal.setup($selectusergroup_container, {
            modal: true,
            overlay: 20,
            zIndex: 5000,
            toTop: true
        });

        /**
         * Add Binding
         */
        var addBinding = function() {
            // bind tabs
            $('#selectusergroup_tabs_container button').off('click').on('click', function() {
                var $clicked = $(this)
                if (!$clicked.hasClass('selected')) {
                    $('#selectusergroup_tabs_container button.selected').removeClass('selected');
                    $clicked.addClass('selected');
                    submitSearch();
                }
            });

            // bind search form
            $('#selectusergroup_search_form').off('submit').on('submit', function() {
                submitSearch();
                return false;
            })

            // bind results list
            $selectusergroup_results_container.off('click', 'button, li').on('click', 'button, li', function(ev) {
                var $clicked = $(this);
                var type = '';
                var id = '';

                if (!$clicked.is('li')) {
                    type = $clicked.closest('li').attr('data-entity-type');
                    id = $clicked.closest('li').attr('data-entity-id');
                } else {
                    type = $clicked.attr('data-entity-type');
                    id = $clicked.attr('data-entity-id');
                }

                if ($clicked.hasClass('selectusergroup_result_rolesdd')) {
                    // open/close the roles drop down selection
                    if ($('#selectusergroup_roles_popover').is(':visible')) {
                        closeRolesDropdown();
                    } else {
                        openRolesDropdown($clicked, id, 'searchresult');
                    }
                } else {
                    // close the widget with the selected data
                    var returnData = {
                        'autocompleteId': config.autocompleteId,
                        'type': type,
                        'selected': dataCache[id]
                    };
                    $(document).trigger('selected.selectusergroup.sakai', returnData);
                    closeSearchDialog();
                }
                ev.stopPropagation();
            });

            // bind close button
            $selectusergroup_close_dialog.off('click').on('click', function() {
                closeSearchDialog();
            });
        };


        /*
         * Setup the AutoCorrect plugin and associated events
         */
        setupAutocorrect = function() {
            $element = config.el;

            if ($element.hasClass('autocomplete_input')) {
                return;
            }

            $element.attr('placeholder', config.startText);

            var searchTerm = '';
            var $container = $element.parent();

            // insert the roles popover container for selected groups
            $container.append('<div id="selectusergroup_roles_popover_selected" class="selectusergroup_roles_popover s3d-popover-container clearfix" style="display:none;">'
                + '<div class="selectusergroup_roles_popover_loading"></div>'
                + '<div id="selectusergroup_roles_popover_selected_container"></div>'
                +'</div>');

            // insert a list to store selected entities
            $container.append('<ul class="autocomplete_container as-selections" id="' + selectedList
                + '"><li id="autocomplete_placeholder"></li class="as-original"></ul>');

            // setup input fields and lists
            var $selectedList = $('#' + selectedList);
            $element.appendTo('#' + selectedList + ' #autocomplete_placeholder');
            $('#' + selectedList + ' #autocomplete_placeholder').append('<input id="autocomplete_selected_values" type="hidden" value="">')
            $element.addClass("s3d-input-full-width s3d-error-autosuggest as-input autocomplete_input")
            $element.parent().append('<div class="autocomplete_list" id="' + resultsList + '"><button class="selectusergroup_trigger">__MSG__SEE_MORE_RESULTS_FOR__ "<span></span>"</button></div>');

            var $selectedValuesInput = $('#' + selectedList + ' #autocomplete_placeholder').children('input#autocomplete_selected_values');
            var $seeMoreButton = $element.parent().find('#' + resultsList + ' button');

            var hideAutocomplete = function() {
                $('#' + resultsList).hide();
                $element.val('');
            };
            hideAutocomplete();

            $seeMoreButton.off('click').on('click', function(ev) {
                // filter out already selected users/worlds, and the passed in filter if present,
                // from appearing in the search dialog
                var alreadySelectedFilter = getSelectedInputVal();
                if (config.filter && config.filter.length) {
                    config.searchFilter = alreadySelectedFilter.concat(config.filter);
                }

                $('#selectusergroup_search_query').val($seeMoreButton.attr('data-search-query'));

                // open the search popover
                renderTabs(function() {
                    addBinding();
                    submitSearch();
                    sakai.api.Util.Modal.open($selectusergroup_container);
                });

                $(document).off('selected.selectusergroup.sakai').on('selected.selectusergroup.sakai', function(e, data) {
                    if (data.selected) {
                        if (data.type === 'user') {
                            addSelected({
                                'value': data.selected.id,
                                'name': sakai.api.User.getDisplayName(data.selected),
                                'desc': '',
                                'picture': data.selected.picture,
                                'type': 'user'
                            });
                        } else {
                            addSelected({
                                'value': data.selected.id,
                                'name': data.selected['sakai:group-title-shorter'],
                                'desc': '',
                                'picture': data.selected.picPath,
                                'type': 'world'
                            }, data.selected.selectedRoles);
                        }
                    }
                });

                hideAutocomplete();
                return false;
            });
            $seeMoreButton.off('blur').on('blur', function(ev){
                hideAutocomplete();
            });

            $selectedList.off('click').on('click', function() {
                $('#' + selectedList + ' #autocomplete_placeholder').find('input').focus();
            });
            $selectedList.off('click', '.autocomplete_remove').on('click', '.autocomplete_remove', function() {
                var $clicked = $(this);
                $clicked.closest('li').remove();
                updateSelectedInputVal();
                return false;
            });
            $selectedList.off('click', '.autocomplete_role_dropdown').on('click', '.autocomplete_role_dropdown', function() {
                var $clicked = $(this);
                if ($('#selectusergroup_roles_popover_selected').is(':visible')) {
                    closeRolesDropdown();
                } else {
                    var id = $clicked.closest('li').attr('data-entity-id');
                    openRolesDropdown($clicked, id, 'selecteditem');
                }
                return false;
            });

            var addSelected = function(item, selectedRoles) {
                var lineItem = sakai.api.Util.TemplateRenderer('#selectusergroup_autocomplete_selected_template', {
                    'item': item,
                    'rolesOnly': false,
                    'selectedRoles': selectedRoles,
                    'sakai': sakai
                });

                $(lineItem).insertBefore('#' + selectedList + ' #autocomplete_placeholder');

                updateSelectedInputVal();
            };

            // prefill items if passed in
            if (config.preFill) {
                $.each(config.preFill, function(i, item) {
                    addSelected(item);
                })
            }

            var dataFn = function(request, response) {
                searchTerm = request.term;
                var q = sakai.api.Server.createSearchString(request.term);
                var searchoptions = {
                    'page': 0,
                    'items': config.retrieveLimit
                };
                var searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS;
                if (q === '*' || q === '**') {
                    searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS_ALL;
                } else {
                    searchoptions['q'] = q;
                }
                sakai.api.Server.loadJSON(searchUrl.replace('.json', ''), function(success, data) {
                    if (success) {
                        var selected = getSelectedInputVal();
                        var filter = config.filter.concat(selected);
                        var suggestions = [];
                        $.each(data.results, function(i) {
                            if (data.results[i]['rep:userId']) {
                                if (!filter.length || $.inArray(data.results[i]['rep:userId'], filter) === -1) {
                                    suggestions.push({
                                        'value': data.results[i]['rep:userId'],
                                        'name': sakai.api.User.getDisplayName(data.results[i]),
                                        'desc': '',
                                        'picture': sakai.api.Util.constructProfilePicture(data.results[i], 'user'),
                                        'type': 'user'
                                    });
                                }
                            } else if (data.results[i]['sakai:group-id']) {
                                if (!filter.length || $.inArray(data.results[i]['sakai:group-id'], filter) === -1) {
                                    suggestions.push({
                                        'value': data.results[i]['sakai:group-id'],
                                        'name': sakai.api.Util.Security.safeOutput(data.results[i]['sakai:group-title']),
                                        'desc': '',
                                        'picture': sakai.api.Util.constructProfilePicture(data.results[i], 'group'),
                                        'type': 'world'
                                    });
                                }
                            }
                        });
                        $seeMoreButton.children('span').text(searchTerm);
                        $seeMoreButton.attr('data-search-query', q);
                        if (!suggestions.length) {
                            suggestions.push({
                                value: 'autocomplete_no_results',
                                type: 'autocomplete_no_results'
                            });
                        }
                        response(suggestions, request);
                    }
                }, searchoptions);
            };

            // Setup the Autocomplete plugin
            $element.autocomplete({
                search: function(){
                    $(this).addClass('autocomplete_loading');
                },
                open: function(event, ui) {
                    // Show the div dropdown
                    $('#' + resultsList).show();
                    // Append the autocomplete list to the div dropdown
                    $('ul.ui-autocomplete').removeAttr('style').hide().prependTo('#' + resultsList).show();
                    // Hide the loading indicator from the input field
                    $(this).removeClass('autocomplete_loading');
                    // need to slightly adjust the dropdown position for multiple lines
                    $('#' + resultsList).css({
                        top: $(this).position().top + 25
                    });
                    // Highlight the search term in the dropdown list
                    $('#' + resultsList + ' li a').highlight(searchTerm);
                },
                close: function(event, ui) {
                    $('#' + resultsList).hide();
                },
                source: dataFn,
                select: function(event, ui) {
                    ui.item.id = ui.item.value;
                    $element.val('');
                    addSelected(ui.item);
                    return false;
                },
                focus: function(event, ui) {
                    $(".autocomplete_list ul li").removeClass("autocomplete_list_selected");
                    $("#ui-active-menuitem")
                        .closest("li")
                        .addClass("autocomplete_list_selected");
                },
                delay: config.keyDelay,
                minLength: config.minLength
            })
            .off('blur.autocomplete').on('blur.autocomplete', function(event) {
                // hide the autocomplete div if focus is lost, except for the "search more" button
                setTimeout(function() {
                    if (!$('.autocomplete_list button').is(':focus') && !$('.autocomplete_list a').is(':focus')) {
                        hideAutocomplete();
                    }
                }, 50);
            })
            .data('autocomplete')._renderItem = function(ul, item) {
                // formats each line to be presented in autocomplete list
                // add the correct image, wrap name in a class
                var imgSrc = false;
                switch (item.type) {
                    case 'user':
                        imgSrc = item.picture;
                        if (item.picture === sakai.config.URL.USER_DEFAULT_ICON_URL) {
                            imgSrc = sakai.config.URL.USER_DEFAULT_ICON_URL_SMALL;
                        }
                        break;
                    case 'group':
                        imgSrc = item.picture;
                        if (item.picture === sakai.config.URL.GROUP_DEFAULT_ICON_URL) {
                            imgSrc = sakai.config.URL.GROUP_DEFAULT_ICON_URL_SMALL;
                        }
                        break;
                    case 'autocomplete_no_results':
                        return $( '<li></li>' )
                            .data('item.autocomplete', item)
                            .append('No Results')
                            .appendTo(ul);
                        break;
                    default:
                        imgSrc = item.picture;
                        break;
                }

                var lineItem = '<a class="autocomplete_name">' + item.name + '</a>' +
                    '<span class="autocomplete_desc">' + item.desc + '</span>';
                if (imgSrc) {
                    lineItem = '<img class="autocomplete_img" src="' + imgSrc + '" />' + lineItem;
                }
                return $('<li></li>')
                    .data('item.autocomplete', item)
                    .append(lineItem)
                    .appendTo(ul);
            };
        };


        //////////
        // Init //
        //////////

        $(document).off('init.selectusergroup.sakai').on('init.selectusergroup.sakai', function(e, _config) {
            $.extend(config, _config);
            if (!config.el) {
                return;
            }

            setupAutocorrect();
        });

        // Send out an event that says the widget is ready to
        // accept a search query to process and display. This event can be picked up
        // in a page JS code
        $(document).trigger('ready.selectusergroup.sakai');
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('selectusergroup');
});
