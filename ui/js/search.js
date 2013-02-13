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

require(['jquery','oae.core'], function($, oae) {

    // Set the browser title
    oae.api.util.setBrowserTitle(oae.api.i18n.translate('__MSG__SEARCH__'));

    // TODO: Replace this with more effective page configuration
    var pubdata = {
        'structure0': {
            'all': {
                '_order': 0,
                '_ref': 'id9574379429432',
                '_title': oae.api.i18n.translate('__MSG__ALL_TYPES__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id9574379429432',
                    '_title': oae.api.i18n.translate('__MSG__ALL_TYPES__')
                }
            },
            'content': {
                '_order': 1,
                '_ref': 'id6573920372',
                '_title': oae.api.i18n.translate('__MSG__CONTENT__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id6573920372',
                    '_title': oae.api.i18n.translate('__MSG__CONTENT__')
                }
            },
            'people': {
                '_order': 2,
                '_ref': 'id49294509202',
                '_title': oae.api.i18n.translate('__MSG__PEOPLE__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id49294509202',
                    '_title': oae.api.i18n.translate('__MSG__PEOPLE__')
                }
            },
            'groups': {
                '_order': 3,
                '_ref': 'id7645524364',
                '_title': oae.api.i18n.translate('__MSG__GROUPS__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id7645524364',
                    '_title': oae.api.i18n.translate('__MSG__GROUPS__')
                }
            }
        },
        'id9574379429432': {
            'rows': [
                {
                    'id': 'id4382631',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id8403845',
                                    'type': 'searchall'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        'id6573920372': {
            'rows': [
                {
                    'id': 'id1813095',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id9436392',
                                    'type': 'searchcontent'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        'id49294509202': {
            'rows': [
                {
                    'id': 'id152530',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id1187051',
                                    'type': 'searchpeople'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        'id7645524364': {
            'rows': [
                {
                    'id': 'id65342243',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id0129412',
                                    'type': 'searchgroups'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    /**
     * Set up the search form. Every time the search form is submitted,
     * the querystring will be adjusted and picked up by the search widgets
     */
    var setUpSearch = function() {
        $('#search_form').submit(function() {;
            $.bbq.pushState({'q': $('#search_query').val()}, 0);
            return false;
        });

        $(window).on('hashchange', function(ev) {
            $('#search_query').val($.bbq.getState('q'))
        });
    };

    /**
     * Set up the left hand navigation with the provided structure
     */
    var setUpNavigation = function() {
        $(window).on('lhnav.ready', function() {
            $(window).trigger('lhnav.init', [pubdata, {}, {}]);
        });  
    };

    /**
     * Take the search string from the query string and add it to the search box,
     * in case the page was loaded with a query already in the URL
     */
    var setUpSearchQuery = function() {
        if ($.bbq.getState('q')) {
            $('#search_query').val($.bbq.getState('q'));
        }
    };

    var switchViewMode = function(el) {
        $('.oae-search-listview-options > div:visible').removeClass('selected');
        $(el).addClass('selected');
    };

    var setUpViewMode = function() {
        $(document).on('click', '.search_view_grid', function() {
            switchViewMode(this);
            $('.oae-search-results .oae-list:visible').addClass('grid');
            $('.oae-search-results .oae-list:visible').removeClass('expandedlist');
        });

        $(document).on('click', '.search_view_expandedlist', function() {
            switchViewMode(this);
            $('.oae-search-results .oae-list:visible').removeClass('grid');
            $('.oae-search-results .oae-list:visible').addClass('expandedlist');
        });

        $(document).on('click', '.search_view_list', function() {
            switchViewMode(this);
            $('.oae-search-results .oae-list:visible').removeClass('expandedlist');
            $('.oae-search-results .oae-list:visible').removeClass('grid');
        });

        $(document).on('click', '.oae-list-item-right', function() {
            $(this).parent().toggleClass('active');
        });
    };

    setUpSearch();
    setUpNavigation();
    setUpSearchQuery();
    setUpViewMode();

});
