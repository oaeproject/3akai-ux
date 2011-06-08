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
 * /dev/lib/jquery/plugins/jquery.threedots.js (ThreeDots)
 */
/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {
    
    /**
     * @name sakai_global.mygroups
     *
     * @class mygroups
     *
     * @description
     * Initialize the mygroups widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     */
    sakai_global.mygroups = function(tuid){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var rootel = $("#" + tuid);

        // IDs
        var mygroupsList = "#mygroups_list";
        var mygroupsErrorNoSettings = "#mygroups_error_nosettings";
        var mygroupsCreateNewGroup = "#create_new_group_link";
        var ellipsisContainer = ".mygroups_ellipsis_container";
        var mygroupsItemsList = ".mygroup_items_list";

        var mygroups_error_class = "mygroups_error";


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Takes a set of json and renders the groups.
         * @param {Object} newjson group list object
         */
        var doRender = function(newjson){
            // Sort the groups by their name
            for (var group in newjson.entry) {
                if (newjson.entry.hasOwnProperty(group)) {
                    newjson.entry[group]["sakai:group-title"] = sakai.api.Util.applyThreeDots(sakai.api.Security.escapeHTML(newjson.entry[group]["sakai:group-title"]), $(".my_groups_widget .s3d-widget-content").width() - 50, {max_rows: 1,whole_word: false}, "s3d-bold");
                }
            }
            sakai.api.Util.TemplateRenderer("mygroups_list_template", newjson, $(mygroupsList, rootel));
        };

        /**
         * Will initiate a request to the my groups service.
         */
        var doInit = function(){
            //get groups list info from me object, filter and then render groups
            doRender(sakai.api.Groups.getMemberships(sakai.data.me.groups));
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        $(".mygroups_create_new_group", rootel).die("click");
        $(".mygroups_create_new_group", rootel).live("click", function(ev){
            $(window).trigger("sakai.overlays.createGroup"); 
        });

        // Start the request
        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("mygroups");
});
