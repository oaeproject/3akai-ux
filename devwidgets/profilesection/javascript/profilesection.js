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
    var $profilesection_field_default_template = $("#profilesection_field_default_template", $rootel);
    var $profilesection_generalinfo = $("#profilesection_generalinfo", $rootel);
    var $profilesection_generalinfo_access_items = $(".profilesection_generalinfo_access", $rootel);
    var $profilesection_generalinfo_content_items = $(".profilesection_generalinfo_content", $rootel);
    var $profilesection_generalinfo_template = $("#profilesection_generalinfo_template", $rootel);

    var $profilesection_save_items = $($profilesection_generalinfo_access_items.selector + ", " + $profilesection_generalinfo_content_items.selector);


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
    var getProperty = function(obj, nodename){

        nodename= nodename.split('.');

        while (obj && nodename[0]){
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
     */
    var renderTemplateField = function(fieldTemplate, fieldName){

        var json_config = {
            "data": sakai.profile.main.data[currentsection].elements[fieldName] || {},
            "config": sakai.profile.main.config[currentsection].elements[fieldName],
            "path": currentsection + ".elements." + fieldName
        };

        return $.TemplateRenderer(fieldTemplate, json_config);

    };

    /**
     * Render the template for the sectino
     * @param {Object} sectionTemplate jQuery object that contains the template you want to render for the section
     * @param {Object} sectionObject The object you need to pass into the template
     */
    var renderTemplateSection = function(sectionTemplate, sectionObject){

        var sections = "";

        for(var i in sectionObject.elements){
            if(sectionObject.elements.hasOwnProperty(i) && sectionObject.elements[i].display){

                // Set the field template, if there is no template defined, use the default one
                var fieldTemplate = sectionObject.elements[i].template ? $("#" + sectionObject.elements[i].template, $rootel) : $profilesection_field_default_template;

                // Render the template field
                sections += renderTemplateField(fieldTemplate, i);

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
    var renderTemplateGeneralInfo = function(profilesection){

        // Variable that contains the rendered output for a section
        var generalinfo = "";

        // Set the currentsection variable so this can be used in other methods as well
        currentsection = profilesection;

        // Set the section template, if there is no template defined, user the default one
        var sectionTemplate = sakai.profile.main.config[currentsection].template ? $("#" + sakai.profile.main.config[currentsection].template, $rootel) : $profilesection_default_template;

        // Render the template section
        generalinfo += renderTemplateSection(sectionTemplate, sakai.profile.main.config[currentsection]);

        // Render the General info
        $profilesection_generalinfo.html(sakai.api.Security.saneHTML(sakai.api.i18n.General.process(generalinfo, null, null)));

    };


    ////////////////////////
    // Save functionality //
    ////////////////////////

    /**
     * Save the values to the main sakai.profile object
     */
    var saveValues = function(){

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
            if (title) {

                // Get the property if it exists
                var prop = getProperty(sakai.profile.main.data, title);

                if(prop){

                    if($.isPlainObject(prop) && prop.value !== undefined){
                        // Set the correct value
                        prop.value = $selected_element.val();
                    }else{
                        // This is an access attribute
                        sakai.profile.main.data[title.split(".")[0]].access = $selected_element.val();
                    }
                }

            }
            else {
                fluid.log("sakai.profilesection - saveValues - the specificied element doesn't have the correct attribute: " + $selected_element.selector);
            }

        });

    };

    ////////////////////
    // Initialization //
    ////////////////////

    /**
     * Initialization function
     */
    var init = function(){

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