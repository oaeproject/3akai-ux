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

    var $profilesection_field_default_template = $("#profilesection_field_default_template", $rootel);
    var $profilesection_generalinfo = $("#profilesection_generalinfo", $rootel);
    var $profilesection_generalinfo_template = $("#profilesection_generalinfo_template", $rootel);

    var $profilesection_default_template = $("#profilesection_default_template", $rootel);


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
            "data": sakai.profile.profile.data[currentsection].elements[fieldName],
            "config": sakai.profile.profile.config[currentsection].elements[fieldName]
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
            if(sectionObject.elements.hasOwnProperty(i)){

                // Set the field template, if there is no template defined, use the default one
                var fieldTemplate = sectionObject.elements[i].template ? $("#" + sectionObject.elements[i].template, $rootel) : $profilesection_field_default_template;

                // Render the template field
                sections += renderTemplateField(fieldTemplate, i);

            }
        }

        var json_config = {
            "data" : sakai.profile.profile.data[currentsection],
            "config" : sakai.profile.profile.config[currentsection],
            "fields" : $.trim(sections)
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
        var sectionTemplate = sakai.profile.profile.config[currentsection].template ? $("#" + sakai.profile.profile.config[currentsection].template, $rootel) : $profilesection_default_template;

        // Render the template section
        generalinfo += renderTemplateSection(sectionTemplate, sakai.profile.profile.config[currentsection]);

        // Render the General info
        $profilesection_generalinfo.html(sakai.api.Security.saneHTML(sakai.api.i18n.General.process(generalinfo, null, null)));

    };


    ////////////////////
    // Initialization //
    ////////////////////

    /**
     * Initialization function
     */
    var init = function(){

        currentselection = $rootel.selector.replace("#", "").replace("profilesection-", "");

        // Trigger the profile section event, so we let the container know that the widget is loaded
        $(window).trigger("sakai-" + $rootel.selector.replace("#", ""), renderTemplateGeneralInfo);

    };

    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("profilesection");