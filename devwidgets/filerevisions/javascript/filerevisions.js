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

/*global */

var sakai = sakai || {};

sakai.filerevisions = function(tuid, showSettings){


    ///////////////
    // Variables //
    ///////////////

    var $fileRevisionsDialog = $("#filerevisions_dialog");
    var baseFileData = {};
    var revisions = [];

    // Templates
    var filerevisionsTemplate = "#filerevisions_template";

    // Containers
    var filerevisionsTemplateContainer = "#filerevisions_template_container";

    /**
     * Render the template that displays all revision information
     */
    var renderRevisionData = function(){
        // And render the basic information
        var renderedTemplate = $.TemplateRenderer(filerevisionsTemplate, revisions);
        $(filerevisionsTemplateContainer).html(renderedTemplate)
    };

    /**
     * Get the revision information on the specified file
     */
    var getRevisionInformation = function(){
        $.ajax({
            url: baseFileData.path + ".versions.json",
            type : "GET",
            success: function(data){
                baseFileData.revisions = data.versions
                renderRevisionData();
            },
            error: function(){
                sakai.api.Util.notification.show("Revision information not retrieved", "The revision information for the file could not be retrieved");
            },
        });
    };

    /**
     * Load the file revisions widget with the appropriate data
     * This function can be called from anywhere within Sakai
     * @param {Object} data Contains data needed to call all revisions for the file
     */
    sakai.filerevisions.initialise = function(data){
        baseFileData = data;
        getRevisionInformation();
        $fileRevisionsDialog.jqmShow();
    };

    var doInit = function(){
        // This will make the widget popup as a layover.
        $fileRevisionsDialog.jqm({
            modal: true,
            toTop: true
        });
    };

    doInit();

};
sakai.api.Widgets.widgetLoader.informOnLoad("filerevisions");