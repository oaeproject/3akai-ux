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

/**
 * @name sakai.profilesection
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
sakai.profilesection = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var currentsection;

    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $rootel = $("#" + tuid);

    var $profilesection_default_template = $("#profilesection_default_template", $rootel);
    var $profilesection_add_section_template = $("#profilesection_add_section_template", $rootel);
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

        while (obj && nodename[1]){
            obj = obj[nodename.shift()];
        }

        return obj;
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
        json_config.config = sakai.profile.main.config[currentsection].elements[fieldName];

        if (multi) {
            json_config.path = currentsection + ".elements." + id + "." + fieldName;

            // set the data if it exists
            if (sakai.profile.main.data[currentsection] &&
                sakai.profile.main.data[currentsection].elements &&
                sakai.profile.main.data[currentsection].elements.length) {

                $(sakai.profile.main.data[currentsection].elements).each(function(i, elts) {
                    if (elts.id.value === id) {
                        json_config.data = elts[fieldName];
                        return;
                    }
                });
            }
        } else {
            if (sakai.profile.main.data[currentsection] &&
                sakai.profile.main.data[currentsection].elements &&
                sakai.profile.main.data[currentsection].elements[fieldName]) {

                sakai.profile.main.data[currentsection].elements[fieldName].value = unescape(sakai.profile.main.data[currentsection].elements[fieldName].value)
                json_config.data = sakai.profile.main.data[currentsection].elements[fieldName];
            }
            json_config.path = currentsection + ".elements." + fieldName;
        }
        return $.TemplateRenderer(fieldTemplate, json_config);

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
            if (sakai.profile.main.mode.value === "edit") {
                if (sakai.profile.main.data[currentsection] === undefined) {
                    sakai.profile.main.data[currentsection] = {};
                }
            }
            if (sakai.profile.main.data[currentsection] === undefined || sakai.profile.main.data[currentsection].elements === undefined || sakai.profile.main.data[currentsection].elements.length === 0) {
               if (sakai.profile.main.mode.value === "edit") {
                   sections = "<div class='profilesection_section' id='profilesection_section_0'>";
                   sakai.profile.main.data[currentsection].elements = [];
                   sections += $.TemplateRenderer($profilesection_add_section_template, {"config": sectionObject, "parentid": "0"});
                   sections += "</div>";
               }
            } else {
                $(sakai.profile.main.data[currentsection].elements).each(function(i, elts) {
                    // add an ID if there isn't one
                    if (elts.id === undefined) {
                        elts.id = {};
                        elts.id.display = false;
                        elts.id.value = "" + Math.round(Math.random() * 1000000000);
                    }
                    sections += "<div class='profilesection_section' id='profilesection_section_" + elts.id.value + "'>";
                    // merge config with the data
                    // NOTE: it must extend in this way (sectionObject.elements, elts and not elts, sectionObject.elements)
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
                    if (sakai.profile.main.mode.value === "edit") {
                        sections += $.TemplateRenderer($profilesection_remove_section_template, {"config": sectionObject, "parentid": elts.id.value});
                        if (i === sakai.profile.main.data[currentsection].elements.length-1) {
                            sections += $.TemplateRenderer($profilesection_add_section_template, {"config": sectionObject, "parentid": elts.id.value});
                        }
                    } else if (i !== sakai.profile.main.data[currentsection].elements.length-1) {
                        sections += $.TemplateRenderer($profilesection_section_divider_template, {});
                    }
                    sections += "</div>";

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
            "data" : sakai.profile.main.data[currentsection],
            "config" : sakai.profile.main.config[currentsection],
            "fields" : $.trim(sections),
            "currentsection": currentsection
        };

        return $.TemplateRenderer(sectionTemplate, json_config);

    };

    /**
     * Render function for the profile section widget
     * @param {String} profilesection
     *  The name of the profile section you want to render in this widget
     */
    var renderTemplateGeneralInfo = function(profilesection) {

        // Variable that contains the rendered output for a section
        var generalinfo = "";

        // Set the currentsection variable so this can be used in other methods as well
        currentsection = profilesection;
        setTags();
        // Set the section template, if there is no template defined, user the default one
        var sectionTemplate = sakai.profile.main.config[currentsection].template ? $("#" + sakai.profile.main.config[currentsection].template, $rootel) : $profilesection_default_template;

        // Render the template section
        generalinfo += renderTemplateSection(sectionTemplate, sakai.profile.main.config[currentsection]);

        // Render the General info
        $profilesection_generalinfo.html(sakai.api.Security.saneHTML(sakai.api.i18n.General.process(generalinfo, null, null)));

    };

    var renderAdditionalTemplateEditSection = function(profilesection, $parentSection, addLink) {
        // setup new sub-section
        var elt = {};
        elt.id = {};
        elt.id.display = false;
        elt.id.value = "" + Math.round(Math.random() * 1000000000);

        // grab the config and set up the sections to add
        var sectionObject = sakai.profile.main.config[currentsection];
        var sections = "<div class='profilesection_section' id='profilesection_section_" + elt.id.value + "'>";

        $(addLink).remove();

        // merge this element with the config elements
        $.extend(true, elt, sectionObject.elements);
        sakai.profile.main.data[currentsection].elements.push(elt);
        for(var j in elt){
            if(elt.hasOwnProperty(j) && elt[j].display){

                // Set the field template, if there is no template defined, use the default one
                var fieldTemplate = elt[j].template ? $("#" + elt[j].template, $rootel) : $profilesection_field_default_template;

                // Render the template field
                sections += renderTemplateField(fieldTemplate, j, true, elt.id.value);
            }
        }
        sections += $.TemplateRenderer($profilesection_remove_section_template, {"config": sectionObject, "parentid": elt.id.value});
        sections += "</div>";
        $parentSection.append(sakai.api.i18n.General.process(sections, sakai.data.i18n.localBundle, sakai.data.i18n.defaultBundle));
        $parentSection.append(sakai.api.i18n.General.process($.TemplateRenderer($profilesection_add_section_template, {"config": sectionObject, "parentid": elt.id.value}), sakai.data.i18n.localBundle, sakai.data.i18n.defaultBundle));
    };

    var removeSection = function($parentSection, sectionIDToRemove) {
      var newData = [];
      $(sakai.profile.main.data[currentsection].elements).each(function(i, elts) {
          if (elts.id.value !== sectionIDToRemove) {
              newData.push(elts);
          }
      });
      sakai.profile.main.data[currentsection].elements = newData;
      if (!newData.length) {
          $(".profilesection_add_section").remove();
          var sections = "<div class='profilesection_section' id='profilesection_section_0'>";
          if (sakai.profile.main.mode.value === "edit") {
              sakai.profile.main.data[currentsection].elements = [];
              sections += sakai.api.i18n.General.process($.TemplateRenderer($profilesection_add_section_template, {"config": sakai.profile.main.config[currentsection], "parentid": "0"}), sakai.data.i18n.localBundle, sakai.data.i18n.defaultBundle);
          }
          sections += "</div>";
          $parentSection.parent("div").append(sections);
      }
      $parentSection.remove();
    };

    $profilesection_add_section.live("click", function(e) {
        var parentSelector = "#profilesection_section_" + $(this).attr("id").split("profilesection_add_link_")[1];
        var $parentSection = $(parentSelector).parent("div");
        renderAdditionalTemplateEditSection(currentsection, $parentSection, this);
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
     * Save the values to the main sakai.profile object
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
            var title = $selected_element.attr("title");

            // Check whether the element has a correct attribute
            // TODO replace title by data-path as soon as the sanitizer allows it SAKIII-543

            if (title === "basic.elements.tags") { // tags are special, we save them differently than the rest of the data
                var currentTags = sakai.profile.main.data["sakai:tags"] || [];
                var tagsArray = $selected_element.val().split(",");
                var profileURL = "/~" + sakai.profile.main.data["rep:userId"] + "/public/authprofile";
                sakai.api.Util.tagEntity(profileURL, tagsArray, currentTags, function() {
                    fluid.log("user tags saved");
                });
            } else if (title) {

                // Get the property if it exists
                var prop = getProperty(sakai.profile.main.data, title);
                var parentProp = getParentProperty(sakai.profile.main.data, title);
                var propName = title.split(".")[title.split(".").length-1];
                var nodeName = title.split(".")[0];
                if ($selected_element.val()) {
                    // This is a multiple-assigned section if there are 3 .'s in the title
                    if (title.split(".").length == 4) {
                        $(sakai.profile.main.data[nodeName].elements).each(function(i, elts) {
                           if (elts.id.value === title.split(".")[2]) {
                               prop = elts[propName];
                               return;
                           }
                        });
                    // when trying to add data into a new section that doesn't currently have any data,
                    // we have to create the section's data object
                    } else if (!parentProp) {
                        sakai.profile.main.data[nodeName] = {};
                        sakai.profile.main.data[nodeName].elements = {};
                        sakai.profile.main.data[nodeName].elements["jcr:name"] = "elements";
                    }

                    // add the property in if it doesn't already exist
                    if (parentProp && parentProp["jcr:name"] == "elements" && prop === undefined) {
                        parentProp[propName] = {};
                        parentProp[propName].value = escape($selected_element.val());
                    } else if (prop) { // it exists, just change its value
                        if ($.isPlainObject(prop)) {
                            // Set the correct value
                            prop.value = sakai.api.Security.saneHTML(escape($selected_element.val()));
                        } else {
                            // This is an access attribute
                            sakai.profile.main.data[title.split(".")[0]].access = $selected_element.val();
                        }
                    } else {
                        sakai.profile.main.data[title.split(".")[0]].access = escape($selected_element.val());
                    }
                } else {
                    if (prop && $.isPlainObject(prop) && parentProp) {
                        delete parentProp[prop["jcr:name"]];
                    }
                }

            }
            else {
                fluid.log("sakai.profilesection - saveValues - the specificied element doesn't have the correct attribute: " + $selected_element.selector);
            }

        });

        // tell the profile that this section has finished saving its data
        $(window).trigger("sakai-profile-data-ready", currentsection);

    };

    // temporary tag fix, revisit this when we do directory tagging for users
    var setTags = function() {
        if (sakai.profile.main.data["sakai:tags"]) {
            if (!sakai.profile.main.data.basic.elements.tags) {
                sakai.profile.main.data.basic.elements.tags = {};
            }
            sakai.profile.main.data.basic.elements.tags.value = sakai.profile.main.data["sakai:tags"];
        }
    };

    ////////////////////
    // Initialization //
    ////////////////////

    /**
     * Initialization function
     */
    var init = function() {

        currentsection = $rootel.selector.replace("#", "").replace("profilesection-", "");

        // Trigger the profile section event, so we let the container know that the widget is loaded
        $(window).trigger("sakai-" + $rootel.selector.replace("#", ""), renderTemplateGeneralInfo);

        // Bind to the global save function
        $(window).bind("sakai-profile-save", function(){

            // Save the values to the global object
            saveValues();

        });

    };

    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("profilesection");