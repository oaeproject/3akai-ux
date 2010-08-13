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
/*global $ */

var sakai = sakai || {};

sakai.api.UI.groupbasicinfo = sakai.api.UI.groupbasicinfo || {};
sakai.api.UI.groupbasicinfo.render = sakai.api.UI.groupbasicinfo.render || {};

/**
 * @name sakai.groupbasicinfo
 *
 * @class groupbasicinfo
 *
 * @description
 * Initialize the groupbasicinfo widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.groupbasicinfo = function(tuid, showSettings){

    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $rootel = $("#" + tuid);
    var $groupbasicinfo_generalinfo = $("#groupbasicinfo_generalinfo", $rootel);
    var groupbasicinfo_buttons = "#groupbasicinfo_editing";
    var groupbasicinfo_dontupdate = "#groupbasicinfo_editing_button_dontupdate";
    var groupbasicinfo_update = "#groupbasicinfo_editing_button_update";

    // Fields that will contain the group data
    var groupBasicInfoGroup = "#groupbasicinfo_generalinfo_group";
    var groupBasicInfoGroupTitle = groupBasicInfoGroup + "_title";
    var groupBasicInfoGroupKind = groupBasicInfoGroup + "_kind";
    var groupBasicInfoGroupTags = groupBasicInfoGroup + "_tags";
    var groupBasicInfoGroupDesc = groupBasicInfoGroup + "_description";


    //////////////////////
    // Render functions //
    //////////////////////

    /**
     * Render the template for group basic info
     */
    var renderTemplateBasicInfo = function(){

        var mode = '';
        // Show in Edit mode
        if (showSettings) {
            mode = 'edit';
        }

        // Get the group information out of the global group info object
        var json_config = {
            "groupid" : sakai.currentgroup.id,
            "url" : document.location.protocol + "//" + document.location.host + "/~" + sakai.currentgroup.id,
            "data" : sakai.currentgroup.data.authprofile,
            "mode" : mode
        };

        $groupbasicinfo_generalinfo.html($.TemplateRenderer("#groupbasicinfo_default_template", json_config));

        // If this widget is not shown on the group profile (i.e. when rendered inside a page)
        // we show the widget's own update button
        if (!sakai.currentgroup.profileView){
            $(groupbasicinfo_buttons, $rootel).show();
        }

        addButtonBinding();

    };


    //////////////////////////////
    // Update Group Information //
    //////////////////////////////

    /**
     * Update group data
     */
    var updateGroup = function(){

        // need to validate data
        var groupTitle = $(groupBasicInfoGroupTitle, $rootel).val();
        var groupKind = $(groupBasicInfoGroupKind, $rootel).val();
        var groupTags = $(groupBasicInfoGroupTags, $rootel).val();
        var groupDesc = $(groupBasicInfoGroupDesc, $rootel).val();

        // Update the group object
        sakai.currentgroup.data.authprofile["sakai:group-title"] = groupTitle;
        sakai.currentgroup.data.authprofile["sakai:group-kind"] = groupKind;
        sakai.currentgroup.data.authprofile["sakai:group-tags"] = groupTags;
        sakai.currentgroup.data.authprofile["sakai:group-description"] = groupDesc;

        $.ajax({
            url: "/system/userManager/group/" + sakai.currentgroup.id + ".update.json",
            data: {
                "_charset_":"utf-8",
                "sakai:group-title" : groupTitle,
                "sakai:group-kind" : groupKind,
                "sakai:group-tags" : groupTags,
                "sakai:group-description" : groupDesc
            },
            type: "POST",
            success: function(data, textStatus){
                sakai.api.Widgets.Container.informFinish(tuid, "groupbasicinfo");
                $(window).trigger("sakai.groupbasicinfo.updateFinished");
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("An error has occurred: " + xhr.status + " " + xhr.statusText);
            }
        });

    }


    //////////////
    // Bindings //
    //////////////

    /**
     * Bind the widget's internal Cancel and Save Settings button
     */
    var addButtonBinding = function(){

        $(groupbasicinfo_dontupdate, $rootel).bind("click", function(){
            sakai.api.Widgets.Container.informCancel(tuid, "groupbasicinfo");
        });

        $(groupbasicinfo_update, $rootel).bind("click", function(){
            $(window).trigger("sakai.groupbasicinfo.update");
        });;

    }

    /**
     * This function will be called when the widget or the container
     * wants to save the new profile data
     */
    $(window).bind("sakai.groupbasicinfo.update", function(){
        updateGroup();
    });

    ////////////////////
    // Initialization //
    ////////////////////

    /**
     * Render function
     */
    sakai.api.UI.groupbasicinfo.render = function(){
        renderTemplateBasicInfo();
    };

    // Indicate that the widget has finished loading
    $(window).trigger("sakai.api.UI.groupbasicinfo.ready", {});

    renderTemplateBasicInfo();

};

sakai.api.Widgets.widgetLoader.informOnLoad("groupbasicinfo");