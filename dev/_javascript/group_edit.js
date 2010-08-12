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

    var groupBasicInfoGroup = "#groupbasicinfo_generalinfo_group";
    var groupBasicInfoGroupTitle = groupBasicInfoGroup + "_title";
    var groupBasicInfoGroupKind = groupBasicInfoGroup + "_kind";
    var groupBasicInfoGroupTags = groupBasicInfoGroup + "_tags";
    var groupBasicInfoGroupDesc = groupBasicInfoGroup + "_description";


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
    var readyToRenderBasic = false;
    var hasRenderedBasic = false;

    $(window).bind("sakai.api.UI.entity.ready", function(e){
        readyToRender = true;
        if (sakai.groupedit.data) {
            sakai.api.UI.entity.render("group", sakai.groupedit.data);
            hasRendered = true;
        }
    });

    $(window).bind("sakai.api.UI.groupbasicinfo.ready", function(e){
        readyToRenderBasic = true;
        if (sakai.groupedit.data) {
            sakai.api.UI.groupbasicinfo.render();
            hasRenderedBasic = true;
        }
    });

    /**
     * Fetch group data
     * @param {String} groupid Identifier for the group we're interested in
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
                if (readyToRenderBasic && !hasRenderedBasic) {
                    sakai.api.UI.groupbasicinfo.render();
                }
            }
        });
    };


    /**
     * Update group data
     */
    var updateGroup = function(){
        // need to validate data
        var groupTitle = $(groupBasicInfoGroupTitle).val();
        var groupKind = $(groupBasicInfoGroupKind).val();
        var groupTags = $(groupBasicInfoGroupTags).val();
        var groupDesc = $(groupBasicInfoGroupDesc).val();

        $.ajax({
            url: "/system/userManager/group/" + sakai.groupedit.id + ".update.json",
            data: {
                "_charset_":"utf-8",
                "sakai:group-title" : groupTitle,
                "sakai:group-kind" : groupKind,
                "sakai:group-tags" : groupTags,
                "sakai:group-description" : groupDesc
            },
            type: "POST",
            success: function(data, textStatus){
                sakai.api.Util.notification.show("Group management", "Your group was updated successfully");
                getGroupData(sakai.groupedit.id);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("An error has occurred: " + xhr.status + " " + xhr.statusText);
            }
        });
    }

    /**
     * Trigger edit buttons
     * @param {Boolean} show Flag to either show or hide update or edit buttons
     */
    var triggerEditable = function(show){
        /*if (show) {
            $("#group_editable").show();
            $("#group_editing").hide();
        } else {
            $("#group_editable").hide();
            $("#group_editing").show();
        }*/
        sakai.groupedit.mode = 'edit';
        $("#group_editing").show();
    };


    ///////////////////////
    // BINDING FUNCTIONS //
    ///////////////////////

    /**
     * Add binding to all the elements on the page
     */
    var addBinding = function(){

        // Bind the edit button
        $("#group_editable_button_edit").bind("click", function(){
            //triggerEditable(false);
            //sakai.groupedit.mode = 'edit';
            //$(window).trigger("basicgroupinfo_refresh");
            sakai.api.UI.groupbasicinfo.render();
        });

        // Bind the don't update button
        $("#group_editing_button_dontupdate").bind("click", function(){
            //triggerEditable(true);
            //sakai.groupedit.mode = '';
            //$(window).trigger("basicgroupinfo_refresh");
            sakai.api.UI.groupbasicinfo.render();
        });

        // Bind the update button
        $("#group_editing_button_update").bind("click", function(){
            //sakai.groupedit.mode = '';
            hasRendered = false;
            hasRenderedBasic = false;
            updateGroup();
        });
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * doInit function
     */
    var doInit = function(){

        querystring = new Querystring();

        // Get the group ID and retrieve data
        var groupid = getGroupId();
        if (groupid) {
            getGroupData(groupid);
        }

        addBinding();
    };

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.groupedit");