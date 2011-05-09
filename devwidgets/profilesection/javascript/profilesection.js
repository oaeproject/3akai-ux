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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/profile_edit.js"], function($, sakai) {

    /**
     * @name sakai_global.profilesection
     *
     * @class profilesection
     *
     * @description
     * Initialize the profilesection widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.profilesection = function(tuid, showSettings){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var currentsection;
        var assignlocationLoaded = false;

        ///////////////////
        // CSS Selectors //
        ///////////////////

        var $rootel = $("#" + tuid);

        var $profilesection_default_template = $("#profilesection_default_template", $rootel);
        var $profilesection_add_section_template = $("#profilesection_add_section_template", $rootel);
        var $profilesection_add_locations_template = $("#profilesection_add_locations_template", $rootel);
        var $profilesection_field_location_template = $("#profilesection_field_location_template", $rootel);
        var profilesection_add_location_section = ".profilesection_add_location_section";
        var $profilesection_remove_section_template = $("#profilesection_remove_section_template", $rootel);
        var $profilesection_section_divider_template = $("#profilesection_section_divider_template", $rootel);
        var $profilesection_field_default_template = $("#profilesection_field_default_template", $rootel);
        var $profilesection_generalinfo = $("#profilesection_generalinfo", $rootel);
        var $profilesection_generalinfo_access_items = $(".profilesection_generalinfo_access", $rootel);
        var $profilesection_generalinfo_content_items = $(".profilesection_generalinfo_content", $rootel);
        var $profilesection_generalinfo_template = $("#profilesection_generalinfo_template", $rootel);

        var $profilesection_save_items = $($profilesection_generalinfo_access_items.selector + ", " + $profilesection_generalinfo_content_items.selector);

        var $profilesection_add_section = $(".profilesection_add_section", $rootel);
        var $profilesection_remove_section = $(".profilesection_remove_section", $rootel);

        ////////////////////
        // Util functions //
        ////////////////////

        /**
         * Get the property for a deep selection in a JavaScript object
         * Since we can't do something like obj["test.test"]
         * @param {Object} obj The object you want to get the property from
         * @param {String} nodename The nodename you want to select
         * @return {String|Object|Boolean} The value of the property
         */
        var getProperty = function(obj, nodename) {

            nodename = nodename.split('.');
            while (obj && nodename[0]){
                obj = obj[nodename.shift()];
            }

            return obj;

        };

        var getParentProperty = function (obj, nodename) {

            nodename = nodename.split('.');

            var objCopy = $.extend(true, {}, obj);
            var middleName = "";
            if (nodename[1]) {
                middleName = nodename[1];
            }
            while (obj && nodename[1]){
                obj = obj[nodename.shift()];
            }
            if (middleName !== "") {
                objCopy["jcr:name"] = middleName;
            }

            return [obj, objCopy];
        };

        //////////////////////
        // Render functions //
        //////////////////////

        /**
         * Render the template for a field
         * @param {Object} fieldTemplate JSON selector object containing the field template
         * @param {String} fieldName The name of a field
         * @param {Boolean} multi If this section is a section that can have multiple instances of itself
         * @param {String} id If multi is true, id needs to be passed to assign the element to its appropriate place in the data structure
         */
        var renderTemplateField = function(fieldTemplate, fieldName, multi, id) {
            var json_config = {};
            json_config.data = {};
            json_config.config = sakai_global.profile.main.config[currentsection].elements[fieldName];

            if (multi) {
                json_config.path = currentsection + ".elements." + id + "." + fieldName;
                // set the data if it exists
                if (sakai_global.profile.main.data[currentsection] &&
                    sakai_global.profile.main.data[currentsection].elements &&
                    sakai_global.profile.main.data[currentsection].elements.length) {
                    $(sakai_global.profile.main.data[currentsection].elements).each(function(i, elts) {
                        if (elts.id.value === id) {
                            json_config.data = elts[fieldName];
                            return;
                        }
                    });
                }
            } else {
                if (sakai_global.profile.main.data[currentsection] &&
                    sakai_global.profile.main.data[currentsection].elements &&
                    sakai_global.profile.main.data[currentsection].elements[fieldName]) {
                    var value = unescape(sakai_global.profile.main.data[currentsection].elements[fieldName].value);

                    // if it is tag filter the directory
                    if (fieldName === "tags") {
                        var splitDir = value.split(",");
                        var tagList = [];
                        $.each(splitDir, function(i, tag){
                            if($.trim(tag.split("/")[0]) !== "directory"){
                                tagList.push(tag);
                            }
                        });
                        value = tagList.toString();
                    }
                    sakai_global.profile.main.data[currentsection].elements[fieldName].value = value;
                    json_config.data = sakai_global.profile.main.data[currentsection].elements[fieldName];
                }
                json_config.path = currentsection + ".elements." + fieldName;
            }
            json_config.sakai = sakai;
            var ret = sakai.api.Util.TemplateRenderer(fieldTemplate, json_config);
            var localDateString = sakai.api.l10n.getDateFormatString();
            ret = ret.replace("MM/DD/YYYY", localDateString);
            return ret;

        };

        /**
         * Render the template for the section
         * @param {Object} sectionTemplate jQuery object that contains the template you want to render for the section
         * @param {Object} sectionObject The object you need to pass into the template
         */
        var renderTemplateSection = function(sectionTemplate, sectionObject) {
            var sections = "";
            var lastID = "";
            if (sectionObject.multiple) {
                // first time through, hasn't been made an array yet
                if (sakai_global.profile.main.mode.value === "edit") {
                    if (sakai_global.profile.main.data[currentsection] === undefined) {
                        sakai_global.profile.main.data[currentsection] = {};
                    }
                }
                if (sectionObject.directory) {
                    sakai_global.profile.main.directory = sakai.api.User.parseDirectory(sakai_global.profile);
                    sakai_global.profile.main.data["locations"] = sakai_global.profile.main.directory;
                    if (sakai_global.profile.main.mode.value === "edit" || (sakai_global.profile.main.data["locations"].elements && sakai_global.profile.main.data["locations"].elements.length)){
                        sections += sakai.api.Util.TemplateRenderer($profilesection_field_location_template, {
                            "config": sectionObject,
                            "data": sakai_global.profile.main.directory,
                            "parentid": "0",
                            sakai: sakai
                        });
                    }
                } else if (sakai_global.profile.main.data[currentsection] === undefined || sakai_global.profile.main.data[currentsection].elements === undefined || sakai_global.profile.main.data[currentsection].elements.length === 0) {
                   if (sakai_global.profile.main.mode.value === "edit") {
                       sections = "<div class='profilesection_section' id='profilesection_section_0'>";
                       sakai_global.profile.main.data[currentsection].elements = [];
                       if (currentsection !== "locations") {
                           sections += sakai.api.Util.TemplateRenderer($profilesection_add_section_template, {
                               "config": sectionObject,
                               "parentid": "0",
                               sakai: sakai
                           });
                       } else {
                           sections += sakai.api.Util.TemplateRenderer($profilesection_add_locations_template, {
                               "config": sectionObject,
                               "parentid": "0",
                               sakai: sakai
                           });
                       }
                       sections += "</div>";
                   }
                } else {
                    $(sakai_global.profile.main.data[currentsection].elements).each(function(i, elts) {
                        // add an ID if there isn't one
                        if (elts.id === undefined) {
                            elts.id = {};
                            elts.id.display = false;
                            elts.id.value = "" + Math.round(Math.random() * 1000000000);
                        }
                        sections += "<div class='profilesection_section' id='profilesection_section_" + elts.id.value + "'>";
                        // merge config with the data
                        // NOTE: it must extend in this way (sectionObject.elements, elts) and not (elts, sectionObject.elements)
                        //       or else the order will be unreliable
                        $.extend(true, sectionObject.elements, elts);
                        for(var j in sectionObject.elements){
                            if(sectionObject.elements.hasOwnProperty(j) && sectionObject.elements[j].display){

                                // Set the field template, if there is no template defined, use the default one
                                var fieldTemplate = sectionObject.elements[j].template ? $("#" + sectionObject.elements[j].template, $rootel) : $profilesection_field_default_template;

                                // Render the template field
                                sections += unescape(renderTemplateField(fieldTemplate, j, true, sectionObject.elements.id.value));
                            }
                        }

                        // only need to do the following on edit
                        // in the case of location we do not need divider like publications
                        if (sakai_global.profile.main.mode.value === "edit" && currentsection !== "locations") {
                            sections += sakai.api.Util.TemplateRenderer($profilesection_remove_section_template, {"config": sectionObject, "parentid": elts.id.value, sakai: sakai});
                            sections += "</div>";
                            if (i === sakai_global.profile.main.data[currentsection].elements.length-1) {
                                sections += sakai.api.Util.TemplateRenderer($profilesection_add_section_template, {"config": sectionObject, "parentid": elts.id.value, sakai: sakai});
                            }
                        } else if (i !== sakai_global.profile.main.data[currentsection].elements.length-1) {
                            sections += "</div>";
                            sections += sakai.api.Util.TemplateRenderer($profilesection_section_divider_template, {});
                        }

                    });
                }
            } else {
                for(var i in sectionObject.elements){
                    if(sectionObject.elements.hasOwnProperty(i) && sectionObject.elements[i].display){

                        // Set the field template, if there is no template defined, use the default one
                        var fieldTemplate = sectionObject.elements[i].template ? $("#" + sectionObject.elements[i].template, $rootel) : $profilesection_field_default_template;

                        // Render the template field
                        sections += renderTemplateField(fieldTemplate, i, false);
                    }
                }
            }

            var json_config = {
                "data" : sakai_global.profile.main.data[currentsection],
                "config" : sakai_global.profile.main.config[currentsection],
                "fields" : $.trim(sections),
                "currentsection": currentsection,
                sakai: sakai
            };

            return sakai.api.Util.TemplateRenderer(sectionTemplate, json_config);

        };

        /**
         * Render function for the profile section widget
         * @param {String} profilesection
         * @param {Boolean} isLocation boolean value for location or not
         *  The name of the profile section you want to render in this widget
         */
        var renderTemplateGeneralInfo = function(profilesection, isLocation) {
            isLocation = profilesection === "locations";
            // Variable that contains the rendered output for a section
            var generalinfo = "";

            // Set the currentsection variable so this can be used in other methods as well
            currentsection = profilesection;
            setTags();

            // Set the section template, if there is no template defined, user the default one
            var sectionTemplate = sakai_global.profile.main.config[currentsection].template ? $("#" + sakai_global.profile.main.config[currentsection].template, $rootel) : $profilesection_default_template;

            // Copy the config so we don't write into it ever
            var sectionConfig = $.extend(true, {}, sakai_global.profile.main.config[currentsection]);

            // Render the template section
            generalinfo += renderTemplateSection(sectionTemplate, sectionConfig);

            if (!isLocation) {
                // Render the General info
                $profilesection_generalinfo.html(sakai.api.Security.saneHTML(sakai.api.i18n.General.process(generalinfo, sakai.data.me)));
            } else {
                $("#profilesection-locations").children().children(":first").append(sakai.api.Security.saneHTML(sakai.api.i18n.General.process(generalinfo, sakai.data.me)));
                $profilesection_generalinfo.html(sakai.api.Security.saneHTML(sakai.api.i18n.General.process(generalinfo, sakai.data.me)));
                $(".profile-section-save-button", $rootel).hide();
            }
            $(window).trigger("ready.profilesection.sakai", $rootel.attr("id"));
        };

        var renderAdditionalTemplateEditSection = function(profilesection, $parentSection, addLink, value) {
            // setup new sub-section
            var elt = {};
            elt.id = {};
            elt.id.display = false;
            elt.id.value = "" + Math.round(Math.random() * 1000000000);

            // grab the config and set up the sections to add
            var sectionObject = sakai_global.profile.main.config[currentsection];
            var sections = "<div class='profilesection_section' id='profilesection_section_" + elt.id.value + "'>";

            $(addLink).remove();

            // merge this element with the config elements
            $.extend(true, elt, sectionObject.elements);

            sakai_global.profile.main.data[currentsection].elements.push(elt);
            for(var j in elt){
                if(elt.hasOwnProperty(j) && elt[j].display){

                    // Set the field template, if there is no template defined, use the default one
                    var fieldTemplate = elt[j].template ? $("#" + elt[j].template, $rootel) : $profilesection_field_default_template;

                    // Render the template field
                    sections += renderTemplateField(fieldTemplate, j, true, elt.id.value);
                }
            }
            if (currentsection !== "locations") {
                sections += sakai.api.Util.TemplateRenderer($profilesection_remove_section_template, {
                    "config": sectionObject,
                    "parentid": elt.id.value,
                    sakai: sakai
                });
            }
            sections += "</div>";
            $parentSection.append(sakai.api.i18n.General.process(sections, sakai.data.me));
            var dataForTemplate = {
                "config": sectionObject,
                "parentid": elt.id.value,
                sakai: sakai
            };
            $parentSection.append(sakai.api.i18n.General.process(sakai.api.Util.TemplateRenderer($profilesection_add_section_template, dataForTemplate), sakai.data.me));
        };

        var removeSection = function($parentSection, sectionIDToRemove) {
          var newData = [];
          $(sakai_global.profile.main.data[currentsection].elements).each(function(i, elts) {
              if (elts.id.value !== sectionIDToRemove) {
                  newData.push(elts);
              }
          });
          sakai_global.profile.main.data[currentsection].elements = newData;
          if (!newData.length) {
              $parentSection.parent().find(".profilesection_add_section").remove();
              var sections = "<div class='profilesection_section' id='profilesection_section_0'>";
              if (sakai_global.profile.main.mode.value === "edit") {
                  sakai_global.profile.main.data[currentsection].elements = [];
                  var dataForTemplate = {
                      "config": sakai_global.profile.main.config[currentsection],
                      "parentid": "0",
                      sakai: sakai
                  };
                  sections += sakai.api.i18n.General.process(sakai.api.Util.TemplateRenderer($profilesection_add_section_template, dataForTemplate), sakai.data.me);
              }
              sections += "</div>";
              $parentSection.parent("div").append(sections);
          }
          $parentSection.remove();
        };

        $profilesection_add_section.live("click", function(e) {
            var parentSelector = "#profilesection_section_" + $(this).attr("id").split("profilesection_add_link_")[1];
            // Check to see if a previous element has been created
            var $parentSection = $(this).parent();
            renderAdditionalTemplateEditSection(currentsection, $parentSection, this);
        });

        $(profilesection_add_location_section).live("click", function(){
            $("#assignlocation_container").jqmShow();
        });

        $profilesection_remove_section.live("click", function(e) {
            var $parentSection = $(this).parent("div");
            var sectionID = $(this).attr("id").split("profilesection_remove_link_")[1];
            removeSection($parentSection, sectionID);
        });


        ////////////////////////
        // Save functionality //
        ////////////////////////

        /**
         * Save the values to the main sakai_global.profile object
         */
        var saveValues = function() {

                // Reinitialize the jQuery selector
                $profilesection_generalinfo_content_items = $($profilesection_generalinfo_content_items.selector);
                $profilesection_generalinfo_access_items = $($profilesection_generalinfo_access_items.selector);
                $profilesection_save_items = $($profilesection_save_items.selector);

                // Run over all the items where we need to set the values for
                $profilesection_save_items.each(function(index, element){

                    // Cache the element so we don't select it multiple times
                    var $selected_element = $(element);

                    // Get the attribute that contains the path
                    var title = $selected_element.attr("id").split("profilesection_generalinfo_")[1].replace(/\_/g, ".");
                    // Check whether the element has a correct attribute
                    // TODO replace title by data-path as soon as the sanitizer allows it SAKIII-543

                    if (title === "basic.elements.tags") { // tags are special, we save them differently than the rest of the data
                        var currentTags = sakai_global.profile.main.data["sakai:tags"] || [];
                        var tagsArray = [];
                        $($selected_element.val().split(",")).each(function(i, tag){
                            tagsArray.push($.trim(tag.replace(/\\/g, "").replace(/\s+/g, " ")));
                        });
                        if (sakai_global.profile.main.directory) {
                            for (var i = 0; i < sakai_global.profile.main.directory.elements.length; i++){
                                tagsArray.push(sakai_global.profile.main.directory.elements[i].locationtitle.value);
                            }
                        }
                        var profileURL = "/~" + sakai_global.profile.main.data["rep:userId"] + "/public/authprofile";
                        sakai.api.Util.tagEntity(profileURL, tagsArray, currentTags, function(success, newtags) {
                            sakai_global.profile.main.data["sakai:tags"] = sakai_global.profile.main.data.basic.elements.tags = newtags;
                            $selected_element.val($selected_element.val().toString().replace(/\s+/g, " "));
                        });
                    } else if (title) {
                            // Get the property if it exists
                            var prop = getProperty(sakai_global.profile.main.data, title);
                            var parentProp = getParentProperty(sakai_global.profile.main.data, title);
                            var propName = title.split(".")[title.split(".").length - 1];
                            var nodeName = title.split(".")[0];
                            if ($selected_element.val()) {
                                // This is a multiple-assigned section if there are 3 .'s in the title
                                if (title.split(".").length == 4) {
                                    $(sakai_global.profile.main.data[nodeName].elements).each(function(i, elts){
                                        if (elts.id.value === title.split(".")[2]) {
                                            prop = elts[propName];
                                            return;
                                        }
                                    });
                                // when trying to add data into a new section that doesn't currently have any data,
                                // we have to create the section's data object
                                } else if (!parentProp[0]) {
                                    sakai_global.profile.main.data[nodeName] = {};
                                    sakai_global.profile.main.data[nodeName].elements = {};
                                }

                                // add the property in if it doesn't already exist
                                if (parentProp[0] && parentProp[1]["jcr:name"] == "elements" && prop === undefined) {
                                    parentProp[0][propName] = {};
                                    parentProp[0][propName].value = $selected_element.val();
                                } else if (prop) { // it exists, just change its value
                                    var val = $selected_element.val();
                                    if ($(element).hasClass("date") || $(element).hasClass("oldDate")) { // localize dates
                                        // convert the date into a Date object for storage
                                        val = Globalization.parseDate(val);
                                    }
                                    if ($.isPlainObject(prop)) {
                                        // Set the correct value
                                        prop.value = sakai.api.Security.saneHTML(val);
                                    } else {
                                        // This is an access attribute
                                        sakai_global.profile.main.data[title.split(".")[0]].access = val;
                                    }
                                } else if ($selected_element.hasClass("profilesection_generalinfo_access")){
                                    sakai_global.profile.main.data[title.split(".")[0]].access = $selected_element.val();
                                }
                            } else {
                                if (prop && $.isPlainObject(prop) && parentProp[0]) {
                                    delete parentProp[0][prop["jcr:name"]];
                                }
                            }

                        } else {
                            debug.warn("sakai_global.profilesection - saveValues - the specificied element doesn't have the correct attribute: " + $selected_element.selector);
                        }

                });
            // tell the profile that this section has finished saving its data
            $(".profile-section-save-button").attr("disabled", "disabled");
            $(window).trigger("ready.data.profile.sakai", currentsection);

        };

        // temporary tag fix, revisit this when we do directory tagging for users
        var setTags = function() {
            if (sakai_global.profile.main.data["sakai:tags"]) {
                if (!sakai_global.profile.main.data.basic.elements.tags) {
                    sakai_global.profile.main.data.basic.elements.tags = {};
                }
                sakai_global.profile.main.data.basic.elements.tags.value = sakai_global.profile.main.data["sakai:tags"].toString().replace(/,/g, ", ");
            }
        };

        var renderLocation = function(data){
            sakai_global.profile.main.data["sakai:tags"] = data.tags;
            sakai_global.profile.main.directory = sakai.api.User.parseDirectory(sakai_global.profile);
            sakai.data.me.profile.saveddirectory = data.saveddirectory;
            renderTemplateGeneralInfo("locations");
        };

        ////////////////////
        // Initialization //
        ////////////////////

        var handleShown = function(e, showing) {
            if (showing) {
                $(window).bind("save.profile.sakai", saveValues);

                // Bind to the global update location
                $(window).bind("renderlocations.contentmetadata.sakai", function(ev, data){
                    ev.stopImmediatePropagation();
                    // render location in profile Section
                    renderLocation(data);
                });
            } else {
                $(window).unbind("save.profile.sakai");
                $(window).unbind("renderlocations.contentmetadata.sakai");
            }
        };

        /**
         * Initialization function
         */
        var init = function() {
            currentsection = $rootel.selector.replace("#", "").replace("profilesection-", "");
            // Trigger the profile section event, so we let the container know that the widget is loaded
            if (sakai_global.profile && sakai_global.profile.main && sakai_global.profile.main.ready) {
                $(window).trigger($rootel.selector.replace("#", "") + ".sakai", renderTemplateGeneralInfo);
            } else {
                $(window).unbind("ready.profileedit.sakai").bind("ready.profileedit.sakai", function() {
                    $(window).trigger($rootel.selector.replace("#", "") + ".sakai", renderTemplateGeneralInfo);
                });
            }
        };
        $(window).bind(tuid + ".shown.sakai", handleShown);
        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("profilesection");
});
