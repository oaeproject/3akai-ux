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
/*global $, QueryString */

var sakai = sakai || {};

sakai.groupedit = function(){

sakai.groupedit.id = sakai.groupedit.id || {};
sakai.groupedit.data = sakai.groupedit.data || {};
sakai.groupedit.mode = sakai.groupedit.mode || {};

    /////////////////////////////
    // CONFIGURATION VARIABLES //
    /////////////////////////////

    var querystring; // Variable that will contain the querystring object of the page


    ///////////////////
    // CSS SELECTORS //
    ///////////////////

    var group_class = ".group";
    var $group_actions = $("#group_actions", group_class);
    var $group_actions_template = $("#group_actions_template", group_class);
    var $group_field_default_template = $("#group_field_default_template", group_class);
    var $group_footer = $("#group_footer", group_class);
    var $group_footer_button_dontupdate = $("#group_footer_button_dontupdate", group_class);
    var $group_footer_button_edit = $("#group_footer_button_edit", group_class);
    var $group_footer_template = $("#group_footer_template", group_class);
    var $group_heading = $("#group_heading", group_class);
    var $group_heading_template = $("#group_heading_template", group_class);


    ////////////////////
    // UTIL FUNCTIONS //
    ////////////////////

    /**
     * Get the group id from the querystring
     */
    var getGroupId = function(){
        if (querystring.contains("id")) {
            return querystring.get("id");
        }
        return false;
    };
    
    var readyToRender = false;
    var hasRendered = false;
    
    $(window).bind("sakai.api.UI.entity.ready", function(e){
        readyToRender = true;
        if (sakai.groupedit.data) {
            sakai.api.UI.entity.render("group", sakai.groupedit.data);
            hasRendered = true;
        }
    });

    /**
     * Fetch group data
     */
    var getGroupData = function(groupid){

        $.ajax({
            url: "/~" + groupid + "/public.infinity.json",
            success: function(data){
                sakai.groupedit.id = groupid;
                sakai.groupedit.data = data;
                sakai.groupedit.data["sakai:group-id"] = groupid;
                if (data.authprofile['rep:policy']) {
                    triggerEditable(true);
                }
                if (readyToRender && !hasRendered) {
                    sakai.api.UI.entity.render("group", sakai.groupedit.data);
                }
                $(window).trigger("basicgroupinfo_refresh");
            }
        });
    };


    /**
     * Update group data
     */
    var updateGroup = function(){
        // need to validate data
        var groupTitle = $("#groupbasicinfo_generalinfo_group_title").val();
        var groupTags = $("#profilesection_generalinfo_group_tags").val();
        var groupDesc = $("#profilesection_generalinfo_group_description").val();

        $.ajax({
            url: "/system/userManager/group/" + sakai.groupedit.id + ".update.json",
            data: {
                "_charset_":"utf-8",
                "sakai:group-title" : groupTitle,
                "sakai:group-tags" : groupTags,
                "sakai:group-description" : groupDesc
            },
            type: "POST",
            success: function(data, textStatus){
                getGroupData(sakai.groupedit.id);
                $(window).trigger("basicgroupinfo_refresh");
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("An error has occurred: " + xhr.status + " " + xhr.statusText);
            }
        });
    }

    var triggerEditable = function(show){
        if (show) {
            $("#group_editable").show();
            $("#group_editing").hide();
        } else {
            $("#group_editable").hide();
            $("#group_editing").show();
        }
    };


    ///////////////////////
    // BINDING FUNCTIONS //
    ///////////////////////

    /**
     * Add binding to all the elements on the page
     */
    var addBinding = function(){

        $("#group_editable_button_edit").bind("click", function(){
            triggerEditable(false);
            sakai.groupedit.mode = 'edit';
            $(window).trigger("basicgroupinfo_refresh");
        });

        // Bind the don't update
        $("#group_editing_button_dontupdate").bind("click", function(){
            triggerEditable(true);
            sakai.groupedit.mode = '';
            $(window).trigger("basicgroupinfo_refresh");
        });

        // Bind the update
        $("#group_editing_button_update").bind("click", function(){
            sakai.groupedit.mode = '';
            updateGroup();
            $(window).trigger("basicgroupinfo_refresh");
        });
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    var doInit = function(){

        querystring = new Querystring();

        // Get and set the profile mode
        var groupid = getGroupId();
        if (groupid) {
            getGroupData(groupid);
        }

        /*$(window).bind("sakai.api.UI.groupbasicinfo.ready", function(e){
            getGroupData(groupid);
        });*/

        addBinding();
    };

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.groupedit");