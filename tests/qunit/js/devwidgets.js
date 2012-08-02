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

    sakai_global = sakai_global || {};
    sakai.widgets = sakai.widgets || {};
    sakai.widgets = {};
    sakai_global.qunit = sakai_global.qunit || {};
    sakai_global.qunit.widgets = sakai_global.qunit.widgets || [];
    sakai_global.qunit.widgetsdone = false;

    /**
     * An array of all of the widgets in the system
     * NOTE: This has to be manually updated, so whenever you add a widget
     *       you must add it to this list
     */
    var widgetList = [
        'accountpreferences',
        'activegroups',
        'addarea',
        'addpeople',
        'addtocontacts',
        'allcategories',
        'areapermissions',
        'assignlocation',
        'basiclti',
        'captcha',
        'carousel',
        'categories',
        'changepic',
        'collectionviewer',
        'comments',
        'contacts',
        'contentauthoring',
        'contentcomments',
        'contentmetadata',
        'contentpermissions',
        'contentpreview',
        'dashboard',
        'dashboardactivity',
        'deletecontent',
        'discussion',
        'displayprofilesection',
        'documentviewer',
        'embedcontent',
        'entity',
        'faceted',
        'featuredcontent',
        'featuredpeople',
        'featuredworlds',
        'footer',
        'ggadget',
        'googlemaps',
        'helloworld',
        'htmlblock',
        'inbox',
        'inserter',
        'inserterbar',
        'institutionalskinning',
        'joingroup',
        'joinrequestbuttons',
        'joinrequests',
        'lhnavigation',
        'mycontacts',
        'mycontent',
        'mygroups',
        'mylibrary',
        'mymemberships',
        'mysakai2',
        'newaddcontent',
        'newcreategroup',
        'newsharecontent',
        'pagetitle',
        'pageviewer',
        'participants',
        'personinfo',
        'pickeradvanced',
        'popularcontent',
        'recentactivity',
        'recentchangedcontent',
        'recentcontactsnew',
        'recentmemberships',
        'recentmessages',
        'relatedcontent',
        'remotecontent',
        'rss',
        'sakai2favourites',
        'sakai2tools',
        'savecontent',
        'searchall',
        'searchcontent',
        'searchgroups',
        'searchpeople',
        'searchsakai2',
        'selecttemplate',
        'sendmessage',
        'tags',
        'text',
        'tooltip',
        'topnavigation',
        'uploadnewversion',
        'versions',
        'welcome',
        'worldsettings'
    ];


    /**
     * Grab all the widget config files
     *
     * This does the same thing as /var/widgets.json does, but
     * since we have to be able to do this without a sever, we recreate
     * the effect here
     */

    var loadWidgets = function() {
        sakai_global.qunit.allJSFiles = $.merge([], sakai_global.qunit.devJsFiles);
        sakai_global.qunit.allHtmlFiles = $.merge([], sakai_global.qunit.devHtmlFiles);
        for (var i=0, j=widgetList.length; i<j; i++) {
            var widget = widgetList[i];

            (function(widgetName) {
                var widgetJS = '/devwidgets/' + widgetName + '/javascript/' + widgetName + '.js',
                    widgetHTML = false;
                $.ajax({
                    url: '/devwidgets/' + widgetName + '/config.json',
                    dataType: 'json',
                    success: function(data) {
                        sakai.widgets[widgetName] = data;
                        widgetHTML = sakai.widgets[widgetName].url;
                        sakai_global.qunit.widgets.push({name:widgetName, html: widgetHTML, js: widgetJS});
                        if (widgetList.length === sakai_global.qunit.widgets.length) {
                            sakai_global.qunit.widgetsdone = true;
                            $(window).trigger('widgetsdone.qunit.sakai');
                        }
                    }
                });
            })(widget);
        }
    };

    if (sakai_global.qunit.devfilesdone) {
        loadWidgets();
    } else {
        $(window).on('devfilesdone.qunit.sakai', function() {
            loadWidgets();
        });
    }


});
