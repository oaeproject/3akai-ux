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

/*global $, Config, jQuery, sakai */

/**
 * @name sakai.mygroups
 *
 * @class mygroups
 *
 * @description
 * Initialize the mygroups widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 */
sakai.mygroups = function(tuid){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    // IDs
    var mygroupsList = "#mygroups_list";
    var mygroupsListTemplate = "#mygroups_list_template";
    var mygroupsErrorNoSites = "#mygroups_error_nosites";
    var mygroupsErrorNoSettings = "#mygroups_error_nosettings";
    var mygroupsCreateNewGroup = "#create_new_group_link";
    var createGroupContainer = "#creategroupcontainer";

    var mygroups_error_class = "mygroups_error";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Compare the names of 2 objects
     * @param {Object} a
     * @param {Object} b
     * @return 1, 0 or -1
     */
    var doSort = function(a,b){
        if (a.name > b.name) {
            return 1;
        } else if (a.name === b.name) {
            return 0;
        } else {
            return -1;
        }
    };
    
    /**
     * Filter all groups: everyone and ending with -managers 
     * @param {Object} a
     * @param {Object} b
     * @return 1, 0 or -1
     */
    var doFilter = function(group){
        if (group.groupid.match("-managers"+"$")){
            return false;
        }else if(group.groupid === "everyone") {
            return false;
        }else
            return true;
    };

    /**
     * Show the popup to create a new group.
     */
    var createNewGroup = function(){
        $(createGroupContainer, rootel).show();

        // Load the creategroup widget.
        sakai.creategroup.initialise();
    };

    /**
     * Takes a set of json and renders the groups.
     * @param {Object} newjson group list object
     */
    var doRender = function(newjson){

        // If the user is not registered for any sites, show the no sites error.
        if (newjson.entry.length === 0){
            $(mygroupsList, rootel).html(sakai.api.Security.saneHTML($(mygroupsErrorNoSites).html())).addClass(mygroups_error_class);
        }
        else {
            // Sort the groups by their name
            newjson.entry = newjson.entry.sort(doSort);
            for (var group in newjson.entry){
                if (newjson.entry.hasOwnProperty(group)) {
                    newjson.entry[group].name = sakai.api.Security.escapeHTML(newjson.entry[group].name);
                }
            }
            $(mygroupsList, rootel).html($.TemplateRenderer(mygroupsListTemplate.replace(/#/,''), newjson));
        }
    };

    /**
     * Takes the groups list info from the me object,
     * filtered out 
     *    - everyone
     *    - all groups ending with -managers
     * and put it in a useable format and execute the doRender method
     * @param {Object} groups    group list object
     */
    var loadGroupList = function(groups){
            var newjson = {
                entry : []
            };
            for (var i = 0, il = groups.length; i < il; i++) {
                if(doFilter(groups[i]))
                    newjson.entry.push(groups[i]);
            }
            // Render all the groups.
            doRender(newjson);
    };

    /**
     * Will initiate a request to the my groups service.
     */
    var doInit = function() {
        //get groups list info from me object, filter and then render groups
        loadGroupList(sakai.data.me.groups);
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    $(mygroupsCreateNewGroup, rootel).bind("click", function(ev){
        createNewGroup();
    });

    // Start the request
    doInit();
   
};
sakai.api.Widgets.widgetLoader.informOnLoad("mygroups");