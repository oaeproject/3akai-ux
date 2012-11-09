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

require(['jquery', 'sakai/sakai.api.core', 'underscore', 'jquery-tagcloud'], function($, sakai, _) {

    /**
     * @name sakai_global.tags
     *
     * @class tags
     *
     * @description
     * Initialize the tags widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.tags = function(tuid, showSettings) {

        var $rootel = $('#'+tuid),
            $tags_main = $('#tags_main', $rootel),
            $tags_main_template = $('#tags_main_template', $rootel);

        var tagData = {};

        var generateTagCloud = function() {
            var newtags = [];
            if ( tagData.facet_fields && tagData.facet_fields.length && tagData.facet_fields[ 0 ].tagname ) {
                $.each(tagData.facet_fields[0].tagname, function( i, tagobj ) {
                    var tag = sakai.api.Util.formatTags( _.keys( tagobj )[ 0 ] )[ 0 ];
                    tag.count = _.values( tagobj )[ 0 ];
                    newtags.push( tag );
                });
                // Only show the first 20 tags
                newtags = _.first( newtags, 20 );
            }
            sakai.api.Util.TemplateRenderer( $tags_main_template, { tags: newtags }, $tags_main );

            $tags_main.show().find('a').tagcloud({
              size: {start: 10, end: 16, unit: 'px'}
            });
        };

        var loadData = function(directory, callback) {
            if (!directory) {
                $.ajax({
                    url: '/var/search/public/tagcloud.json',
                    cache: false,
                    success: function(data) {
                        tagData = data;
                        callback();
                    }
                });
            }
        };

        var doInit = function() {
            if (!sakai.api.Widgets.isOnDashboard(tuid)) {
                $('.tags-widget-border').show();
                $('#tags_widget').addClass('fl-widget s3d-widget');
            }

            // If the widget is initialized on the directory page then listen to the event to catch specified tag results
            if (sakai_global.directory && sakai_global.directory.getIsDirectory()) {
                loadData(true, generateTagCloud);
            }
            else {
                loadData(false, generateTagCloud);
            }
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('tags');
});
