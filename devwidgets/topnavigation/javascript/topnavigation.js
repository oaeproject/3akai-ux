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
/*global Config, $, jQuery, get_cookie, delete_cookie, set_cookie, window, alert */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {


    /**
     * @name sakai_global.topnavigation
     *
     * @class topnavigation
     *
     * @description
     * Initialize the topnavigation widget
     *
     * @version 0.0.2
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.topnavigation = function(tuid, showSettings){
        var renderMenu = function() {
            var obj = {};
            var menulinks = [];

            for (var i in sakai.config.Navigation) {
                if (sakai.config.Navigation.hasOwnProperty(i)) {
                    var temp = {};
                    if (sakai.data.me.user.anon && sakai.config.Navigation[i].anonUrl) {
                      temp.url = sakai.config.Navigation[i].anonUrl;
                    } else {
                      temp.url = sakai.config.Navigation[i].url;
                    }
                    temp.label = sakai.api.i18n.General.getValueForKey(sakai.config.Navigation[i].label);
                    temp.id = sakai.config.Navigation[i].id;
                    temp.cleanurl = temp.url || "";
                    if (temp.cleanurl) {
                        if (temp.cleanurl.indexOf('?') && temp.cleanurl.indexOf('?') > 0) {
                            temp.cleanurl = temp.cleanurl.substring(0, temp.cleanurl.indexOf('?'));
                        }
                        if (temp.cleanurl.indexOf('#') && temp.cleanurl.indexOf('#') > 0) {
                            temp.cleanurl = temp.cleanurl.substring(0, temp.cleanurl.indexOf('#'));
                        }
                    }
                    if (i === "0") {
                        temp.firstlink = true;
                    }
                    else {
                        temp.firstlink = false;
                    }
                    menulinks.push(temp);
                }
            }
            obj.links = menulinks;
            // Get navigation and render menu template
            $(".topnavigation_explore").html(sakai.api.Util.TemplateRenderer("navigation_template", obj));
        };
        
        var doInit = function(){
            renderMenu();
        }
        
        doInit();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("topnavigation");
});
