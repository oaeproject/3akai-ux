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

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.contacts
     *
     * @class contacts
     *
     * @description
     * Initialize the contacts widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contacts = function(tuid, showSettings) {

        var bindEvents = function() {
            $(".contacts_accepted_items").click(function(e){
                if($(this).hasClass("contacts_expand")){
                    $(this).removeClass("contacts_expand");
                    $(this).children(".contacts_table_div").hide();
                    $(this).children().find(".contacts_icon").hide();
                }else{
                    $(this).addClass("contacts_expand");
                    $(this).children(".contacts_table_div").show();
                    $(this).children().find(".contacts_icon").show();    
                }
            });
            
            $(".contacts_accepted_items").hover(
                function(){
                    $(".contacts_message").show();
                    $(this).addClass("contacts_highlight");                
                },
                function(){
                    $(".contacts_message").hide();
                    $(this).removeClass("contacts_highlight");
                }
            );
        }

        var doInit = function(){
            bindEvents();
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("contacts");
});
