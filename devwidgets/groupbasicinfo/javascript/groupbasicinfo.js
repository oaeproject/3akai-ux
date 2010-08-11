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


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var currentsection;


    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $rootel = $("#" + tuid);

    var $groupbasicinfo_field_default_template = $("#groupbasicinfo_field_default_template", $rootel);
    var $groupbasicinfo_generalinfo = $("#groupbasicinfo_generalinfo", $rootel);
    var $groupbasicinfo_generalinfo_template = $("#groupbasicinfo_generalinfo_template", $rootel);

    var $groupbasicinfo_default_template = $("#groupbasicinfo_default_template", $rootel);


    //////////////////////
    // Render functions //
    //////////////////////

    /**
     * Render the template for a field
     * @param {Object} fieldTemplate JSON selector object containing the field template
     * @param {String} fieldName The name of a field
     */
    var renderTemplateField = function(fieldTemplate, fieldName){
        return $.TemplateRenderer(fieldTemplate, sakai.group.data);
    };

    /**
     * Render the template 
     * @param {Object} sectionTemplate jQuery object that contains the template you want to render for the section
     * @param {Object} sectionObject The object you need to pass into the template
     */
    var renderTemplateSection = function(sectionTemplate, sectionObject){

        var sections = "";

        for(var i in sectionObject.elements){
            if(sectionObject.elements.hasOwnProperty(i)){

                // Set the field template, if there is no template defined, use the default one
                var fieldTemplate = sectionObject.elements[i].template ? $("#" + sectionObject.elements[i].template, $rootel) : $groupbasicinfo_field_default_template;

                // Render the template field
                sections += renderTemplateField(fieldTemplate, i);

            }
        }

        var json_config = {
            "data" : sakai.profilewow.profile.data[currentsection],
            "config" : sakai.profilewow.profile.config[currentsection],
            "fields" : $.trim(sections)
        };

        return $.TemplateRenderer(sectionTemplate, json_config);

    };


    var renderTemplateBasicInfo = function(fieldTemplate, fieldName){
        var json_config = {
            "groupid" : sakai.group.id,
            "url" : document.location.protocol + "//" + document.location.host + "/~" + sakai.group.id,
            "data" : sakai.group.data.authprofile,
            "mode" : sakai.group.mode
        };
        $groupbasicinfo_generalinfo.html($.TemplateRenderer("#groupbasicinfo_default_template", json_config));
    };


    //////////////
    // Bindings //
    //////////////

    $(window).bind("basicgroupinfo_refresh", function(e){
        renderTemplateBasicInfo();
    });

    // Sometimes the trigger event is fired before it is actually bound
    // so we keep trying to execute the ready event
    /*var triggerReady = function(){
        if ($(window).data("events") && $(window).data("events").sakai) {

        console.log('trigger ready');
            // Send out an event that says the widget is ready.
            // This event can be picked up in a page JS code
            $(window).trigger("sakai.api.UI.groupbasicinfo.ready");
        }
        else {
        console.log('trigger set timeout');
            setTimeout(triggerReady, 100);
        }
    };
    triggerReady();*/

    ////////////////////
    // Initialization //
    ////////////////////

    /**
     * Initialization function
     */
    var init = function(){
        renderTemplateBasicInfo();
    };

    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("groupbasicinfo");