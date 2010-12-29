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
 * @name sakai.nextleveldown
 *
 * @class nextleveldown
 *
 * @description
 * Initialize the nextleveldown widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.nextleveldown = function(tuid,showSettings){

    // Containers
    var $nextleveldownContent = $(".nextleveldown_content");

    // Templates
    var nextleveldownContentTemplate = "nextleveldown_content_template";

    // Elements
    var nextleveldownChild= ".nextleveldown_child";

    /**
     * Render the first 2 children levels of the current location
     * @param {Object} data Data containing the JSTree
     */
    var renderChildren = function(data){
        $nextleveldownContent.html($.TemplateRenderer(nextleveldownContentTemplate, {
            "data": data
        }))
    }

    /**
     * Fire the JSTree event associated with this location
     * @param {Object} id ID of the clicked element
     */
    var clickedChild = function(id){
        $("li#" + id).children("a").click();
    }

    $(nextleveldownChild).live("click",function(){
        clickedChild(this.id);
    });

    $(window).bind("sakai-directory-selected", function(ev, selectedpath, selected){
        renderChildren(sakai.browsedirectory.getDirectoryNodeJson(selectedpath.split("/")[selectedpath.split("/").length -1]));
    });
};

sakai.api.Widgets.widgetLoader.informOnLoad("nextleveldown");
