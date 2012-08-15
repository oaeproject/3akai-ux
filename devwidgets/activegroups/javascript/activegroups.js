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

/*global $ */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.activegroups
     *
     * @class activegroups
     *
     * @description
     * Initialize the activegroups widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.activegroups = function(tuid, showSettings) {

        var $rootel = $('#'+tuid),
            $activegroups_main = $('#activegroups_main', $rootel),
            $activegroups_main_template = $('#activegroups_main_template', $rootel);

        var activegroupsMainLoadingProgress = '#activegroups_main_progress_loading';
        var activegroupsMainProgress = 'activegroups_main_progress';
        var groupData = {};
        var currentSearch = '';
        var activeGroupsEllipsisContainer = '.activegroups_ellipsis_container';

        var renderPopularGroups = function() {
            var output = sakai.api.Util.TemplateRenderer($activegroups_main_template, {
                data: groupData
            });
            $activegroups_main.html(output).show();
        };

        var handleHashChange = function(e, node) {
            var selected = node || $.bbq.getState('location');
            if (selected && selected !== currentSearch) {
                loadDataDirectory(selected, renderPopularGroups);
                currentSearch = selected;
            }
        };

        var loadDataDirectory = function(selected, callback) {
            $activegroups_main.html('');
            $(activegroupsMainLoadingProgress).addClass(activegroupsMainProgress);
            var params = {
                page: 0,
                items: 10,
                sortOrder: 'desc'
            };

            var url = sakai.config.URL.SEARCH_GROUPS;
            if (selected === '*' || selected === '**') {
                url = sakai.config.URL.SEARCH_GROUPS_ALL;
            } else {
                params['q'] = 'directory/' + selected;
            }
            $.ajax({
                url: url,
                data: params,
                success: function(data) {
                    $(activegroupsMainLoadingProgress).removeClass(activegroupsMainProgress);
                    groupData = {'results':[], 'items': data.items, 'total': data.total};
                    var groups = [];
                    for (var i = 0; i < data.results.length; i++) {
                        var group = {};
                        group['id'] = data.results[i]['sakai:group-id'];
                        group['name'] = sakai.api.Util.applyThreeDots(data.results[i]['sakai:group-title'], $('.activegroups_widget').width() - 80, {max_rows: 1,whole_word: false}, 's3d-bold');
                        groups.push(group);
                    }
                    groupData.results[0] = {'groups': groups};
                    groupData.moreLink = '/search#q=' + selected;
                    callback();
                }
            });
        };

        var loadData = function(callback) {
            $.ajax({
                url: '/var/search/public/mostactivegroups.json?page=0&items=5',
                cache: false,
                success: function(data) {
                    groupData = data;
                    groupData.moreLink = '/search';
                    callback();
                }
            });
        };

        $(window).on('hashchange nohash.browsedirectory.sakai', handleHashChange);

        var doInit = function() {
            if (! sakai.api.Widgets.isOnDashboard(tuid)) {
                $('.activegroups-widget-border').show();
                $('#activegroups_widget').addClass('fl-widget s3d-widget');
            }
            // If the widget is initialized on the directory page then listen to the event to catch specified tag results
            if (!(sakai_global.directory && sakai_global.directory.getIsDirectory())) {
                loadData(renderPopularGroups);
                $('#activegroups_title_popular').show();
            } else {
                handleHashChange();
                $('#activegroups_title_recent').show();
            }
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('activegroups');

});
