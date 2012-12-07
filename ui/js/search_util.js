/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/*
 * This file will contain all the functionality that the 4 search files have in common.
 * ex: fetching my sites
 */

require(['jquery','sakai/sakai.api.core'], function($, sakai) {

    sakai_global.data = sakai_global.data || {};
    sakai_global.data.search = sakai_global.data.search || {};

    var view = 'list';
    var refineTags = [];
    var activeTags = [];
    var maxTagsDisplayed = 10;

    $(window).on('sakai.search.util.init', function(ev, config) {

        /////////////////////
        // Get my contacts //
        /////////////////////

        sakai_global.data.search.getMyContacts = function(callback) {
            $.ajax({
                url: sakai.config.URL.CONTACTS_FIND_ALL + '?&page=0&n=100',
                cache: false,
                success: function(data) {
                    sakai_global.data.search.contacts = $.extend(data, {}, true);
                    if (callback) {
                        callback();
                    }
                }
            });
        };

        /////////////////////
        // Set search view //
        /////////////////////

        if (config && config.tuid && view === 'grid' &&
                $('.oae-search-results-container').length) {
            $('.oae-search-results-container').addClass('oae-search-results-grid');
        }
        $('.search_view_' + view).addClass('selected');
        $('.search_view_' + view).children('div').addClass('selected');

        ////////////////////////////////
        // Finish util initialisation //
        ////////////////////////////////

        var finishUtilInit = function() {
            $(window).trigger('sakai.search.util.finish', [config]);
        };

        ///////////////////////////
        // Prepare for rendering //
        ///////////////////////////

        sakai_global.data.search.prepareCMforRender = function(results, callback) {
            sakai.api.Content.prepareContentForRender(results, sakai.data.me, callback);
        };

        sakai_global.data.search.prepareGroupsForRender = function(results) {
            return sakai.api.Groups.prepareGroupsForRender(results, sakai.data.me);
        };

        sakai_global.data.search.preparePeopleForRender = function(results) {
            return sakai.api.User.preparePeopleForRender(results, sakai.data.me);
        };

        /**
         * Renders the tag lists
         */
        renderRefineTags = function() {
            sakai.api.Util.TemplateRenderer($('#search_tags_active_template'), {'tags': activeTags, 'sakai': sakai}, $('#search_tags_active_container'));
            sakai.api.Util.TemplateRenderer($('#search_tags_refine_template'), {'tags': refineTags, 'sakai': sakai}, $('.search_tags_refine_container'));
        };

        /**
         * Generates the tag list to refine the search by
         * @param {Object} data Search result containing the tags available
         * @param {Object} params Parameters used in the search
         */
        sakai_global.data.search.generateTagsRefineBy = function(data, params) {
            $('#search_tags_active_container').empty();
            activeTags = [];
            refineTags = [];
            var tagArray = [],
                tagCountObject = {};

            // get any tags already in location hash
            if (params && params.refine) {
                activeTags = sakai.api.Util.formatTags(params.refine.split(','));
            }

            // filter tags
            if (data.facet_fields && data.facet_fields[0] && data.facet_fields[0].tagname && data.facet_fields[0].tagname.length > 0) {
                var tempTagArray = data.facet_fields[0].tagname;
                // put the tags from the tag cloud service into an array
                $.each(tempTagArray, function(key, tagOjb) {
                    $.each(tagOjb, function(tag, count) {
                        if (count > 0) {
                            tagArray.push(tag);
                            tagCountObject[tag] = count;
                        }
                    });
                });
                tagArray = sakai.api.Util.formatTags(tagArray);
                // store tags in either already active tags, or tags available to refine the search by
                $.each(tagArray, function(key, tag) {
                    var inArray = false;
                    $.each( activeTags, function( i, activeTag ) {
                        if ( tag.original === activeTag.original ) {
                            inArray = true;
                        }
                    });
                    if (!inArray) {
                        refineTags.push(tag);
                    }
                });
                activeTags.sort(function( a, b ) {
                    return sakai.api.Util.Sorting.naturalSort( a.value, b.value );
                });
                refineTags.sort( function( a, b ) {
                    return tagCountObject[b.original] - tagCountObject[a.original];
                });
                // limit the number of tags to display in refine list
                refineTags = refineTags.slice(0, maxTagsDisplayed).sort();
            }

            renderRefineTags();
        };

        /**
         * Adjusts the height of the search results grid elements of 4 elements per row
         * @param {Object} $searchGridElements jQuery object containing the search result grid elements
         */
        var adjustGridElementHeights = function($searchGridElements) {
            var elementsToAdjust = [];
            $.each($searchGridElements, function(i, el) {
                if (i && i % 4 === 0) {
                    $(elementsToAdjust).equalHeightColumns();
                    elementsToAdjust = [];
                }
                elementsToAdjust.push(el);
            });
            if (elementsToAdjust.length) {
                $(elementsToAdjust).equalHeightColumns();
            }
        };

        /**
         * Determine if height for search results needs to be adjusted
         * @param {Object} $rootel jQuery object for the widget container
         */
        sakai_global.data.search.determineAdjustGridElementHeights = function($rootel) {
            var $searchContainer = $(".oae-search-results-container", $rootel);
            if ($searchContainer.hasClass("oae-search-results-grid")) {
                var $searchGridElements = $searchContainer.children();
                adjustGridElementHeights($searchGridElements);
            }
        };

        //////////////////////
        // Query parameters //
        //////////////////////

        sakai_global.data.search.getQueryParams = function($rootel) {
            var params = {
                'page': parseInt($.bbq.getState('page'), 10) || 1,
                'q': $.bbq.getState('q') || '*',
                'facet': $.bbq.getState('facet'),
                'sortby': $.bbq.getState('sortby'),
                'sorton': $.bbq.getState('sorton'),
                'refine': $.bbq.getState('refine')
            };
            // get the sort by and sort on
            if (!params['sortby'] || !params['sorton']) {
                params['sortby'] = $('.oae-search-sort option:selected', $rootel).attr('data-sort-order');
                params['sorton'] = $('.oae-search-sort option:selected', $rootel).attr('data-sort-on');
            }
            return params;
        };

        sakai_global.data.search.processSearchString = function(params) {
            return sakai.api.Server.createSearchString(params.q);
        };

        sakai_global.data.search.processRefineString = function(params) {
            if (params.refine) {
                return sakai.api.Server.createSearchString(params.refine.replace(/,/g, ', '), true, false, true);
            } else {
                return '';
            }
        };

        var setActiveTags = function() {
            var searchString = '';
            $.each( activeTags, function(i, tag) {
                searchString += tag.original + ',';
            });
            searchString = searchString.substr(0,searchString.length-1);
            return searchString;
        };

        ////////////
        // Events //
        ////////////

        $('.search_tags_refine_container').off('click', '.search_tag_refine_item').on('click', '.search_tag_refine_item', function(ev) {
            var tag = $(this).attr('data-sakai-entityid');
            activeTags.push(sakai.api.Util.formatTags([tag])[0]);
            $.bbq.pushState({
                'refine': setActiveTags(activeTags)
            }, 0);
        });

        $('#search_tags_active_container').off('click', '.search_tag_active_item').on('click', '.search_tag_active_item', function(ev) {
            var tag = $(this).attr('data-sakai-entityid');
            activeTags = $.grep(activeTags, function(value) {
                return value.original !== tag;
            });
            $.bbq.pushState({
                'refine': setActiveTags(activeTags)
            }, 0);
        });

        $(document).off('click', '.link_accept_invitation').on('click', '.link_accept_invitation', function(ev) {
            var userid = $(this).attr('sakai-entityid');
            $.ajax({
                url: '/~' + sakai.api.Util.safeURL(sakai.data.me.user.userid) + '/contacts.accept.html',
                type: 'POST',
                data : {'targetUserId': userid},
                success: function(data) {
                    sakai_global.data.search.getMyContacts();
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('AN_ERROR_HAS_OCCURRED'),'',sakai.api.Util.notification.type.ERROR);
                }
            });
            $('.link_accept_invitation').each(function(index) {
                if ($(this).attr('sakai-entityid') === userid) {
                    $(this).hide();
                    $('#search_result_contact_' + userid).show();
                }
            });
        });

        // bind sortby select box
        $('#' + config.tuid).on('change', '.oae-search-header .oae-search-sort select', function(ev) {
            var sortby = $(this).find(':selected').attr('data-sort-order');
            var sorton = $(this).find(':selected').attr('data-sort-on');
            $.bbq.pushState({
                'page': 1,
                'sortby': sortby,
                'sorton': sorton
            }, 0);
        });

        // bind search view change
        $(document).off('click', '.search_view_list, .search_view_grid').on('click', '.search_view_list, .search_view_grid', function(ev) {
            if (!$(this).hasClass('selected')) {
                if ($('.oae-search-results-container').hasClass('oae-search-results-grid')) {
                    view = 'list';
                    $('.oae-search-results-container').removeClass('oae-search-results-grid');
                    $('.oae-search-result').height('auto');
                } else {
                    view = 'grid';
                    $('.oae-search-results-container').addClass('oae-search-results-grid');

                    var $searchGridElements = $('.oae-search-result:visible');
                    adjustGridElementHeights($searchGridElements);
                }
                $('.oae-search-listview-options').find('div').removeClass('selected');
                $('.search_view_' + view).addClass('selected');
                $('.search_view_' + view).children('div').addClass('selected');
            }
        });

        $(document).off('click', '.searchgroups_result_plus').on('click', '.searchgroups_result_plus', function(ev) {
            var joinable = $(this).data('group-joinable');
            var groupid = $(this).attr('data-groupid');
            var itemdiv = $(this);
            sakai.api.Groups.addJoinRequest(groupid, function(success) {
                if (success) {
                    var notimsg = '';
                    if (joinable === 'withauth') {
                        // Don't add green tick yet because they need to be approved.
                        notimsg = sakai.api.i18n.getValueForKey('YOUR_REQUEST_HAS_BEEN_SENT');
                    } else  { // Everything else should be regular success
                        $('.searchgroups_memberimage_'+groupid).show();
                        notimsg = sakai.api.i18n.getValueForKey('SUCCESSFULLY_ADDED_TO_GROUP');
                    }
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('GROUP_MEMBERSHIP'),
                        notimsg, sakai.api.Util.notification.type.INFORMATION);
                    itemdiv.removeClass('oae-action-icon oae-actions-addtolibrary searchgroups_result_plus');
                } else {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('GROUP_MEMBERSHIP'),
                        sakai.api.i18n.getValueForKey('PROBLEM_ADDING_TO_GROUP'),
                        sakai.api.Util.notification.type.ERROR);
                }
            });
        });

        $(window).on('sakai.entity.updateOwnCounts', function(e, context) {
            sakai.api.Server.loadJSON('/p/'+context.contentId+'.infinity.json',function(success,data) {
                sakai.api.Content.prepareContentForRender([data],sakai.data.me,function(results) {
                    if (results[0]) {
                        sakai.api.Util.TemplateRenderer($('#search_content_item_template'),{item:results[0],sakai:sakai},$('#'+context.contentId));
                    }
                });
            });
        });

        /////////////////////////
        // Util initialisation //
        /////////////////////////

        finishUtilInit();

    });

});
