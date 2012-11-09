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

require(['jquery','sakai/sakai.api.core'], function($, sakai) {

    sakai_global.createnew = function() {

        var pubdata = {
            'structure0': {}
        };

        /**
         * Generate the left hand navigation
         * @param {Boolean} success Whether the ajax call was successful
         * @param {Object} pubdata The public data, necessary to construct the left hand navigation
         */
        var generateNav = function(success, pubdata) {
            if (success) {
                $(window).trigger('lhnav.init', [pubdata, {}, {}]);
            } else {
                debug.error('createnew.js - Can\'t generate the left hand navigation');
            }
        };

        /**
         * Fetch the templates
         * @param {Function} callback Callback function
         */
        var fetchTemplates = function(callback) {
            sakai.api.Util.getTemplates(function(success, templates) {
                if (success) {
                    for (var i = 0; i < templates.length; i++) {
                        var category = templates[i];
                        var rnd = sakai.api.Util.generateWidgetId();
                        pubdata.structure0[category.id] = {
                            '_order': i,
                            '_title': sakai.api.i18n.getValueForKey(category.title),
                            '_ref': rnd
                        };
                        pubdata[rnd] = {
                            'rows': [{
                                'id': sakai.api.Util.generateWidgetId(),
                                'columns': [{
                                    'width': 1,
                                    'elements': [
                                        {
                                            'id': category.id,
                                            'type': 'selecttemplate'
                                        }
                                    ]
                                }]
                            }]
                        };
                    }
                } else {
                    debug.error('Could not get the group templates');
                }
                if ($.isFunction(callback)) {
                    callback(success, pubdata);
                }
            });
        };

        var renderCreateGroup = function() {
            $(window).trigger('sakai.newcreategroup.init');
        };

        $(window).on('lhnav.ready', function() {
            fetchTemplates(generateNav);
        });
        $(window).on('newcreategroup.ready', renderCreateGroup);

    };

    sakai.api.Widgets.Container.registerForLoad('createnew');

});
