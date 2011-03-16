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

        var addBinding = function(){
            $(".hassubnav").hover(function(){
                var $li = $(this);
                $li.addClass("hassubnav_tr");
                $li.children(".hassubnav_tl").show();
                var $subnav = $li.children(".navigation_link_dropdown");

                var pos = $li.position();
                $subnav.css("left", pos.left - 8);
                $subnav.css("margin-top", "7px");
                $subnav.show();
            }, function(){
                var $li = $(this);
                $li.children(".hassubnav_tl").hide();
                $li.removeClass("hassubnav_tr");
                $li.children(".navigation_link_dropdown").hide();
            })
        };

        var getNavItem = function(index, array){
            var temp = {};
            if (sakai.data.me.user.anon && array[index].anonUrl) {
                temp.url = array[index].anonUrl;
            }else {
                temp.url = array[index].url;
            }
            temp.label = sakai.api.i18n.General.getValueForKey(array[index].label);
            temp.id = array[index].id;
            return temp;
        };

        var renderMenu = function() {
            var obj = {};
            var menulinks = [];

            for (var i in sakai.config.Navigation) {
                if (sakai.config.Navigation.hasOwnProperty(i)) {
                    var temp = getNavItem(i, sakai.config.Navigation);

                    if(sakai.config.Navigation[i].subnav){
                        temp.subnav = [];
                        for(var ii in sakai.config.Navigation[i].subnav){
                            if(sakai.config.Navigation[i].subnav.hasOwnProperty(ii)){
                                temp.subnav.push(getNavItem(ii, sakai.config.Navigation[i].subnav));
                            }
                        }
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
            addBinding();
        }
        
        doInit();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("topnavigation");
});
