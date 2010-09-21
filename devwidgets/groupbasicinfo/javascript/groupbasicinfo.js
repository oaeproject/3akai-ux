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

    var groupBasicInfoDirectoryLvlOne = ".groupbasicinfo_generalinfo_group_directory_lvlone";
    var groupBasicInfoDirectoryLvlTwo = ".groupbasicinfo_generalinfo_group_directory_lvltwo";
    var groupBasicInfoDirectoryLvlThree = ".groupbasicinfo_generalinfo_group_directory_lvlthree";

    var groupBasicInfoThirdLevelTemplateContainer = "#groupbasicinfo_thirdlevel_template_container";
    var groupBasicInfoSecondLevelTemplateContainer = "#groupbasicinfo_secondlevel_template_container";

    var groupBasicInfoSecondLevelTemplate = "#groupbasicinfo_secondlevel_template";
    var groupBasicInfoThirdLevelTemplate = "#groupbasicinfo_thirdlevel_template";
    var groupBasicInfoAddAnotherLocation = "#groupbasicinfo_add_another_location";
    var groupBasicInfoAddAnotherLocationLink = groupBasicInfoAddAnotherLocation + "_link";
    var groupBasicInfoRemoveNewLocation = ".groupbasicinfo_remove_new_location";
    var groupBasicInfoRemoveLocation = ".groupbasicinfo_remove_location";

    var groupBasicInfoSavedInfo = ".groupbasicinfo_saveddirectory";
    var groupbasicinfoSelectDirectory = "#groupbasicinfo_select_directory";
    var groupbasicinfoSelectAtLeastOneDirectory = "#groupbasicinfo_select_at_least_one_directory";

    var groupId = sakai.currentgroup.id;
    var groupStoragePrefix = sakai.currentgroup.data.authprofile.path;
    var tagsPath = "/~" + groupId + "/public/tags/";
    var tagsPathForLinking = "/_group" + groupStoragePrefix + "/public/tags/";
    var groupProfileURL = "";

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
        var tags = [];
        $(sakai.currentgroup.data.authprofile["sakai:tags"]).each(function(i){
            var splitDir = sakai.currentgroup.data.authprofile["sakai:tags"][i].split("/");
            if (splitDir[0] === "directory") {
                var item = [];
                for (var i in splitDir) {
                    if (splitDir[i] !== "directory") {
                        item.push(splitDir[i]);
                    }
                }
                directory.push(item);
            } else {
                tags.push(sakai.currentgroup.data.authprofile["sakai:tags"][i]);
            }
        });
        // Get the group information out of the global group info object
        json = {
            "groupid" : sakai.currentgroup.id,
            "url" : document.location.protocol + "//" + document.location.host + "/~" + sakai.currentgroup.id,
            "data" : sakai.currentgroup.data.authprofile,
            "mode" : mode,
            "tags" : tags,
            "directory" : directoryJSON,
            "saveddirectory" : directory,
            /* the following perSectionPermissions switch is used to turn off
               the "Who can view or search this?" permissions dropdown for now.
               The dropdown will need to be enabled and fully implemented later
               on and the following switch can be removed. */
            "perSectionPermissions" : false
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
        // Get all the tags
        var tagValues = $.trim($(groupBasicInfoGroupTags).val());
        var trimmedTags = [];
        $(tagValues.split(",")).each(function(index){
            if($.trim($(tagValues.split(","))[index]).length){
                trimmedTags.push($.trim($(tagValues.split(","))[index]));
            }
        });
        tagArray = trimmedTags;

        // Create tags for the directory structure
        // For every groupbasicinfo_added_directory we create tags
        $(".groupbasicinfo_added_directory").each(function(){
            var directoryString = "directory/";
            tagArray.push($(this).find(groupBasicInfoDirectoryLvlOne).selected().val().replace(/,/g,""));
            directoryString += $(this).find(groupBasicInfoDirectoryLvlOne).selected().val().replace(/,/g,"");

            if ($(this).find(groupBasicInfoDirectoryLvlTwo).selected().val() !== "no_value") {
                tagArray.push($(this).find(groupBasicInfoDirectoryLvlTwo).selected().val().replace(/,/g,""));
                directoryString += "/" + $(this).find(groupBasicInfoDirectoryLvlTwo).selected().val().replace(/,/g,"");

                if ($(this).find(groupBasicInfoDirectoryLvlThree).selected().val() !== "no_value") {
                    tagArray.push($(this).find(groupBasicInfoDirectoryLvlThree).selected().val().replace(/,/g,""));
                    directoryString += "/" + $(this).find(groupBasicInfoDirectoryLvlThree).selected().val().replace(/,/g,"");
                }

            }

            // Add string for all levels to tag array
            tagArray.push(directoryString);
        });

        // Add the directory tags to the array that were already saved
        $(groupBasicInfoSavedInfo + " li").each(function(){
            tagArray.push("directory/" + this.className.split(",")[0] + "/" + this.className.split(",")[1] + "/" + this.className.split(",")[2]);
        });

        var groupDesc = $(groupBasicInfoGroupDesc, $rootel).val();

        // Update the group object
        sakai.currentgroup.data.authprofile["sakai:group-title"] = groupTitle;
        sakai.currentgroup.data.authprofile["sakai:group-kind"] = groupKind;
        sakai.currentgroup.data.authprofile["sakai:group-description"] = groupDesc;
        groupProfileURL = "/~" + sakai.currentgroup.id + "/public/authprofile"

        //batchCreateTags(tagArray);

        $.ajax({
            url: groupProfileURL,
            data: {
                "_charset_":"utf-8",
                "sakai:group-title" : groupTitle,
                "sakai:group-kind" : groupKind,
                "sakai:group-description" : groupDesc
            },
            type: "POST",
            success: function(data, textStatus){
                var currentTags = sakai.currentgroup.data.authprofile["sakai:tags"];
                sakai.api.Util.tagEntity(groupProfileURL, tagArray, currentTags, function() {
                    sakai.currentgroup.data.authprofile["sakai:tags"] = tagArray;
                    sakai.api.Widgets.Container.informFinish(tuid, "groupbasicinfo");
                    $(window).trigger("sakai.groupbasicinfo.updateFinished");
                });
                renderTemplateBasicInfo();
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
        $(groupBasicInfoAddAnotherLocationLink).text("Add another location");
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
        // Look for group profile path
        groupProfileURL = "/~" + sakai.currentgroup.id + "/public/authprofile"
        // Extract tags from clickedParent
        var tags = []
        tags = clickedParent[0].className.split(",");
        tags.push("directory/" + tags.toString().replace(/,/g,"/"));

        var tagsAfterDeletion = sakai.currentgroup.data.authprofile["sakai:tags"].slice(0);
        for (var tag = 0 in tags){
            if(jQuery.inArray(tags[tag],tagsAfterDeletion) > -1){
                tagsAfterDeletion.splice(jQuery.inArray(tags[tag],tagsAfterDeletion), 1);
            }
        }

        sakai.api.Util.tagEntity(groupProfileURL, tagsAfterDeletion, sakai.currentgroup.data.authprofile["sakai:tags"], function(){
            sakai.currentgroup.data.authprofile["sakai:tags"] = sakai.currentgroup.data.authprofile["sakai:tags"].splice(tags);
            sakai.api.Widgets.Container.informFinish(tuid, "groupbasicinfo");
            $(window).trigger("sakai.groupbasicinfo.updateFinished");
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
            // disable all basic info input elements while update is processed
            sakai.api.UI.groupbasicinfo.disableInputElements();
            $(window).trigger("sakai.groupbasicinfo.update");
        });

        $(groupBasicInfoDirectoryLvlOne).live("change", function(){
            $(this).parent().children(groupBasicInfoThirdLevelTemplateContainer).html("");
            $(this).children("option[value='no_value']").remove();
            updateDirectoryDisplay(groupBasicInfoDirectoryLvlTwo, $($(this).parent()).children(groupBasicInfoDirectoryLvlOne), $($(this).parent()).children(groupBasicInfoDirectoryLvlOne));
        });

        $(groupBasicInfoDirectoryLvlTwo).live("change", function(){
            $(this).children("option[value='no_value']").remove();
            updateDirectoryDisplay(groupBasicInfoDirectoryLvlThree, $($(this).parent()).children(groupBasicInfoDirectoryLvlTwo), $($(this).parent().parent()).children(groupBasicInfoDirectoryLvlOne));
        });

        $(groupBasicInfoDirectoryLvlThree).live("change", function(){
            $(this).children("option[value='no_value']").remove();
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
                    if($(this).hasClass("groupbasicinfo_generalinfo_group_directory_lvlone")){
                        valueSelected = false;
                    }
                }
            });
            // If all values are selected execute the update
            if (valueSelected) {
                updateGroup();
            } else {
                sakai.api.Util.notification.show($(groupbasicinfoSelectDirectory).html(), $(groupbasicinfoSelectAtLeastOneDirectory).html());
            }
    });


    //////////////////////
    // Public Functions //
    //////////////////////

    /**
     * Disable all Group Basic Info input elements (i.e. while processing an update)
     */
    sakai.api.UI.groupbasicinfo.disableInputElements = function () {
        // disable all input elements
        $("#groupbasicinfo_generalinfo input", $rootel).attr("disabled","disabled");
        // disable all textarea elements
        $("#groupbasicinfo_generalinfo textarea", $rootel).attr("disabled","disabled");
        // disable all select dropdowns
        $("#groupbasicinfo_generalinfo select", $rootel).attr("disabled","disabled");
        // disable all buttons
        $("#groupbasicinfo_generalinfo button", $rootel).attr("disabled","disabled");
    };

    /**
     * Enable all Group Basic Info input elements (i.e. after processing an update)
     */
    sakai.api.UI.groupbasicinfo.enableInputElements = function () {
        // enable all input elements
        $("#groupbasicinfo_generalinfo input", $rootel).removeAttr("disabled");
        // enable all textarea elements
        $("#groupbasicinfo_generalinfo textarea", $rootel).removeAttr("disabled");
        // enable all select dropdowns
        $("#groupbasicinfo_generalinfo select", $rootel).removeAttr("disabled");
        // enable all buttons
        $("#groupbasicinfo_generalinfo button", $rootel).removeAttr("disabled");
    };


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