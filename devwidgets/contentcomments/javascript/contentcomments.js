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
 * /dev/lib/jquery/plugins/jquery.pager.js (pager)
 */
/*global Config, $ */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {
    /**
     * @name sakai_global.contentcomments
     *
     * @class contentcomments
     *
     * @description
     * Initialize the contentcomments widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentcomments = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid);


        ///////////////////////
        // Utility functions //
        ///////////////////////

        var renderComments = function(commentData) {
            $('.contentcomments_widget .contentcomments_content_container', $rootel).append(sakai.api.Util.TemplateRenderer('#contentcomments_comment_template', {
                comments: commentData.results
            }));

            // Adjust paging button so it fetches next page on click
            var nextPage = commentData.results[commentData.results.length - 1].created;
            $('.contentcomments_read_more', $rootel).attr('data-page', nextPage);
        };


        ///////////////////////
        // Comment functions //
        ///////////////////////

        var getComments = function(page) {
            $.ajax({
                'url': 'devwidgets/contentcomments/dummy/' + page + '.json',
                'success': function(data) {
                    renderComments(data);
                },
                'error': function(err) {
                    $('.contentcomments_read_more', $rootel).hide();
                }
            })
        };


        //////////////////////////////
        // Initialization functions //
        //////////////////////////////

        var addBinding = function() {
            $('.contentcomments_read_more', $rootel).on('click', function() {
                var nextPage = $(this).attr('data-page');
                getComments(nextPage);
            });
        };

        var doInit = function() {
            addBinding();
            getComments('page1');
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('contentcomments');
});
