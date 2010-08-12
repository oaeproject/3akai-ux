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


    //////////////////////
    // Render functions //
    //////////////////////

    /**
     * Render the template for group basic info
     */
    var renderTemplateBasicInfo = function(){
        var mode = '';
        if (showSettings) {
            //mode = 'edit';
            sakai.groupedit.mode = 'edit';
        }

        var json_config = {
            "groupid" : sakai.groupedit.id,
            "url" : document.location.protocol + "//" + document.location.host + "/~" + sakai.groupedit.id,
            "data" : sakai.groupedit.data.authprofile,
            "mode" : sakai.groupedit.mode
            //"mode" : mode
        };
        $groupbasicinfo_generalinfo.html($.TemplateRenderer("#groupbasicinfo_default_template", json_config));
    };


    //////////////
    // Bindings //
    //////////////

    $(window).bind("basicgroupinfo_refresh", function(e){
        renderTemplateBasicInfo();
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

    $(window).trigger("sakai.api.UI.groupbasicinfo.ready", {});

};

sakai.api.Widgets.widgetLoader.informOnLoad("groupbasicinfo");