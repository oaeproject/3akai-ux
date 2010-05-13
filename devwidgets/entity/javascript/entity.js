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

/*global $, sdata, Config */

var sakai = sakai || {};

/**
 * Initialize the entity widget - this widget provides person / space and content information
 * http://jira.sakaiproject.org/browse/SAKIII-371
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.entity = function(tuid, showSettings){


    /////////////////////////////
    // CONFIGURATION VARIABLES //
    /////////////////////////////

    var entitymodes = ["profile","space","content"];
    var entitymode = entitymodes[0]; // Set the default entity mode


    ///////////////////
    // CSS SELECTORS //
    ///////////////////

    var $rootel = $("#" + tuid);

    var $entity_container = $("#entity_container", $rootel);
    var $entity_container_template = $("#entity_container_template", $rootel);


    ////////////////////
    // UTIL FUNCTIONS //
    ////////////////////

    /**
     * Change the mode for the entity widget
     * @param {String} mode The mode of how you would like to load the entity widget (entitymodes)
     */
    var changeMode = function(mode){

        // Check if the mode value exists and whether it is a valid option
        if(mode && $.inArray(mode, entitymodes)){
            entitymode = mode;
        } else {
            fluid.log("Entity widget - changeMode - The mode couldn't be changed: '" + mode + "'.");
        }

    };

    /**
     * Render the main entity template
     */
    var renderTemplate = function(){
        $.TemplateRenderer($entity_container_template, {}, $entity_container);
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Init function for the entity widget
     */
    var init = function(){

        // Change the mode for the entity widget
        changeMode(sakai.data.entity.mode);

        // Render the main template
        renderTemplate();

        // Show the entity container when everything is loaded
        $entity_container.show();

    };

    init();

};
sdata.widgets.WidgetLoader.informOnLoad("entity");