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
        });

        var generateNav = function() {
            $(window).trigger('lhnav.init', [pubdata, {}, {}]);
        };

        var renderCreateGroup = function() {
            $(window).trigger('sakai.newcreategroup.init');
        };

        $(window).bind('lhnav.ready', generateNav);
        $(window).bind('newcreategroup.ready', renderCreateGroup);

        generateNav();
        
    };

    sakai.api.Widgets.Container.registerForLoad('createnew');

});
