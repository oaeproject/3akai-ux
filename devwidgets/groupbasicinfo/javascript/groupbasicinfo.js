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
/*global $, document, addBinding, window, fluid */

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

    var directoryJSON = [];
    var json = {};

    var groupBasicInfoDirectoryLvlOne = "#groupbasicinfo_generalinfo_group_directory_lvlone";
    var groupBasicInfoDirectoryLvlTwo = "#groupbasicinfo_generalinfo_group_directory_lvltwo";
    var groupBasicInfoDirectoryLvlThree = "#groupbasicinfo_generalinfo_group_directory_lvlthree";

    var groupBasicInfoThirdLevelTemplateContainer = "#groupbasicinfo_thirdlevel_template_container";
    var groupBasicInfoSecondLevelTemplateContainer = "#groupbasicinfo_secondlevel_template_container";

    var groupBasicInfoSecondLevelTemplate = "#groupbasicinfo_secondlevel_template";
    var groupBasicInfoThirdLevelTemplate = "#groupbasicinfo_thirdlevel_template";
    var groupBasicInfoAddAnotherLocation = "#groupbasicinfo_add_another_location";
    var groupBasicInfoRemoveNewLocation = ".groupbasicinfo_remove_new_location";
    var groupBasicInfoRemoveLocation = ".groupbasicinfo_remove_location";

    /**
     * Get a list of nodes representing the directory structure to be rendered
     */
    var getDirectoryStructure = function(){
        // Get directory structure from config file
        for(var i in sakai.config.Directory){
            if (sakai.config.Directory.hasOwnProperty(i)) {
                // Create first level of content
                var temp = {};
                temp.name = i;

                // Create second level of content
                temp.secondlevels = [];
                for (var j in sakai.config.Directory[i]) {
                    if (sakai.config.Directory[i].hasOwnProperty(j)) {
                        var secondlevel = {};
                        secondlevel.name = j;

                        // Create third level of content
                        secondlevel.thirdlevels = [];
                        for (var k in sakai.config.Directory[i][j]) {
                            if (sakai.config.Directory[i][j].hasOwnProperty(k)) {
                                var thirdlevel = {};
                                thirdlevel.name = sakai.config.Directory[i][j][k];
                                secondlevel.thirdlevels.push(thirdlevel);
                            }
                        }

                        temp.secondlevels.push(secondlevel);
                    }
                }
                directoryJSON.push(temp);
            }
        }
    };


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
        // Extract tags that start with "directory:"
        var directory = [];
        $(sakai.currentgroup.data.authprofile["sakai:group-tags"].split(",")).each(function(i){
            if (sakai.currentgroup.data.authprofile["sakai:group-tags"].split(",")[i].split(":")[0] === "directory") {
                var item = [sakai.currentgroup.data.authprofile["sakai:group-tags"].split(",")[i].split(":")[1], sakai.currentgroup.data.authprofile["sakai:group-tags"].split(",")[i].split(":")[2], sakai.currentgroup.data.authprofile["sakai:group-tags"].split(",")[i].split(":")[3]]
                directory.push(item);
            }
        });
        // Get the group information out of the global group info object
        json = {
            "groupid" : sakai.currentgroup.id,
            "url" : document.location.protocol + "//" + document.location.host + "/~" + sakai.currentgroup.id,
            "data" : sakai.currentgroup.data.authprofile,
            "mode" : mode,
            "directory" : directoryJSON,
            "saveddirectory" : directory
        };

        $groupbasicinfo_generalinfo.html($.TemplateRenderer("#groupbasicinfo_default_template", json));

        // If this widget is not shown on the group profile (i.e. when rendered inside a page)
        // we show the widget's own update button
        if (!sakai.currentgroup.profileView){
            $(groupbasicinfo_buttons, $rootel).show();
        }

        addBinding();

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

        var tagArray = [];
        tagArray= $(groupBasicInfoGroupTags, $rootel).val().split(",");
        // Create tags for the directory structure
        // For every groupbasicinfo_added_directory we create tags
        $(".groupbasicinfo_added_directory").each(function(){
            var directoryString = "directory:";
            tagArray.push($(this).find(groupBasicInfoDirectoryLvlOne).selected().val());
            directoryString += $(this).find(groupBasicInfoDirectoryLvlOne).selected().val();

            tagArray.push($(this).find(groupBasicInfoDirectoryLvlTwo).selected().val());
            directoryString += ":" + $(this).find(groupBasicInfoDirectoryLvlTwo).selected().val();

            tagArray.push($(this).find(groupBasicInfoDirectoryLvlThree).selected().val());
            directoryString += ":" + $(this).find(groupBasicInfoDirectoryLvlThree).selected().val();

            // Add string for all levels to tag array
            tagArray.push(directoryString);
        });

        var groupDesc = $(groupBasicInfoGroupDesc, $rootel).val();

        // Update the group object
        sakai.currentgroup.data.authprofile["sakai:group-title"] = groupTitle;
        sakai.currentgroup.data.authprofile["sakai:group-kind"] = groupKind;
        sakai.currentgroup.data.authprofile["sakai:group-tags"] = tagArray.toString();
        sakai.currentgroup.data.authprofile["sakai:group-description"] = groupDesc;

        $.ajax({
//            url: "/system/userManager/group/" + sakai.currentgroup.id + ".update.json",  // previously used
            url: "/~" + sakai.currentgroup.id + "/public/authprofile",
            data: {
                "_charset_":"utf-8",
                "sakai:group-title" : groupTitle,
                "sakai:group-kind" : groupKind,
                "sakai:group-tags" : tagArray.toString(),
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
    };

    var addAnotherLocation = function(){
        var renderedTemplate = $.TemplateRenderer("groupbasicinfo_firstlevel_template", json);
        var renderedDiv = $(document.createElement("div"));
        renderedDiv.html(renderedTemplate);
        $("#groupbasicinfo_add_another_container").append(renderedDiv);
        // Apply style to the rendered div
        $(renderedDiv).addClass("groupbasicinfo_added_directory");
    }

    /**
     * Update the select boxes on the stage
     * @param {String} select Containing ID to check which box value has been changed
     * @param {String} changedboxvalue Containing selected value
     * @param {String} firstlevelvalue Containing value of first select box
     */
    var updateDirectoryDisplay = function(select, changedboxvalue, firstlevelvalue){
        var obj = {
            "firstlevelvalue":firstlevelvalue.selected().val(),
            "changedboxvalue" : changedboxvalue.selected().val(),
            "directory": directoryJSON
        };
        if(select === groupBasicInfoDirectoryLvlTwo){
            $(firstlevelvalue.parent().children("#groupbasicinfo_secondlevel_template_container")).html($.TemplateRenderer(groupBasicInfoSecondLevelTemplate, obj));
        }else{
            $(firstlevelvalue.parent().children("#groupbasicinfo_thirdlevel_template_container")).html($.TemplateRenderer(groupBasicInfoThirdLevelTemplate, obj));
        }
    };

    var removeDirectoryLocation = function(clickedParent){
        // Send the Ajax request
        $.ajax({
            url: "URL",
            data: "DATA",
            traditional: true,
            type: "POST",
            success: function(){
                clickedParent.remove();
            },
            error: function(xhr, textStatus, thrownError){
                sakai.api.Util.notification.show("Location not removed", "The location in the directory could not be removed.");
            }
        });
    }


    //////////////
    // Bindings //
    //////////////

    /**
     * Bind the widget's internal Cancel and Save Settings button
     */
    var addBinding = function(){

        $(groupbasicinfo_dontupdate, $rootel).bind("click", function(){
            sakai.api.Widgets.Container.informCancel(tuid, "groupbasicinfo");
        });

        $(groupbasicinfo_update, $rootel).bind("click", function(){
            $(window).trigger("sakai.groupbasicinfo.update");
        });

        $(groupBasicInfoDirectoryLvlOne).live("change", function(){
            $(this).parent().children(groupBasicInfoThirdLevelTemplateContainer).html("");
            $(this).parent().children(groupBasicInfoDirectoryLvlOne + " option[value='no_value']").remove();
            updateDirectoryDisplay(groupBasicInfoDirectoryLvlTwo, $($(this).parent()).children(groupBasicInfoDirectoryLvlOne), $($(this).parent()).children(groupBasicInfoDirectoryLvlOne));
        });

        $(groupBasicInfoDirectoryLvlTwo).live("change", function(){
            $(this).parent().children(groupBasicInfoDirectoryLvlTwo + " option[value='no_value']").remove();
            updateDirectoryDisplay(groupBasicInfoDirectoryLvlThree, $($(this).parent()).children(groupBasicInfoDirectoryLvlTwo), $($(this).parent().parent()).children(groupBasicInfoDirectoryLvlOne));
        });

        $(groupBasicInfoDirectoryLvlThree).live("change", function(){
            $(groupBasicInfoDirectoryLvlThree + " option[value='no_value']").remove();
        });

        $(groupBasicInfoAddAnotherLocation).live("click", function(){
            addAnotherLocation();
        });

        $(groupBasicInfoRemoveLocation).live("click", function(){
            removeDirectoryLocation($(this).parent());
        });

        $(groupBasicInfoRemoveNewLocation).live("click", function(){
            $(this).parent().remove();
        });

    };

    /**
     * This function will be called when the widget or the container
     * wants to save the new profile data
     */
    $(window).bind("sakai.groupbasicinfo.update", function(){
        // Check if there are any faulty values in directory selection
            var valueSelected = true;
            $(".groupbasicinfo_added_directory select").each(function(){
                if($(this).selected().val() === "no_value"){
                    valueSelected = false;
                }
            });
            // If all values are selected execute the update
            if (valueSelected) {
                updateGroup();
            } else {
                sakai.api.Util.notification.show("Select directory location", "Select the location in the directory. If you do not want to add a location at this time remove the input fields.");
            }
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

    getDirectoryStructure();

    renderTemplateBasicInfo();

};

sakai.api.Widgets.widgetLoader.informOnLoad("groupbasicinfo");