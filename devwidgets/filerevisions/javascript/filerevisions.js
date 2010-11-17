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

sakai.filerevisions = function(tuid, showSettings){


    ///////////////
    // Variables //
    ///////////////

    var $fileRevisionsDialog = $("#filerevisions_dialog");
    var baseFileData = {};

    // Templates
    var filerevisionsTemplate = "#filerevisions_template";

    // Containers
    var filerevisionsTemplateContainer = "#filerevisions_template_container";

    // Buttons
    var filerevisionsCloseButton = "#filerevisions_close";

    /**
     * Render the template that displays all revision information
     */
    var renderRevisionData = function(){
        var data = [];
        baseFileData.created = sakai.api.l10n.transformDate(new Date(baseFileData.data["jcr:created"]));
        data.data = baseFileData;
        data.linkrevision = $("#content_profile_details_view_revisions").hasClass("link_revision");

        var renderedTemplate = $.TemplateRenderer(filerevisionsTemplate, data);
        $(filerevisionsTemplateContainer).html(renderedTemplate);

        renderedTemplate = $.TemplateRenderer("#filerevision_header_text_template", data);
        $("#filerevision_header_text").html(renderedTemplate);
    };

    /**
     * Get userprofile with the userid provided
     * @param {Object} userid
     */
    var getUserProfile = function(userid){
        $.ajax({
            url: "/~" + userid + "/public/authprofile.infinity.json",
            success: function(profile){
                baseFileData["sakai:savedByFull"] = sakai.api.User.getDisplayName(profile);
                renderRevisionData();
            },
            error: function(xhr, textStatus, thrownError){
                sakai.api.Util.notification.show("Failed loading profile", "Failed to load file profile information");
            }
        });
    };

    /**
     * Get detailed information on the files in the revision history
     * This data contains path, mimetype, description,...
     */
    var getRevisionInformationDetails = function(){
        var revisionInformationDetails = [];
        for (var i in baseFileData.revisions) {
            if (baseFileData.revisions.hasOwnProperty(i)) {
                var item = {
                    "url": baseFileData.path + ".version.," + baseFileData.revisions[i]["jcr:name"] + ",.json",
                    "method": "GET"
                };
                revisionInformationDetails[revisionInformationDetails.length] = item;
            }
        }
        baseFileData.numberOfRevisions = revisionInformationDetails.length;
        // Do the Batch request
        $.ajax({
            url: sakai.config.URL.BATCH,

            type : "POST",
            dataType: 'json',
            cache: false,
            data: {
                requests: $.toJSON(revisionInformationDetails)
            },
            success: function(data){
                // Get file information out of results
                var revisionFileDetails = [];
                for (var i in data.results){
                    if (data.results.hasOwnProperty(i)) {
                        revisionFileDetails.push($.parseJSON(data.results[i].body));
                    }
                }
                baseFileData.revisionFileDetails = revisionFileDetails;
                if (baseFileData.data["sakai:savedBy"]) {
                    getUserProfile(baseFileData.data["sakai:savedBy"]);
                } else {
                    getUserProfile(baseFileData.data["sakai:pool-content-created-for"]);
                }
            },
            error: function(xhr, textStatus, thrownError){

            }
        });
    };

    /**
     * Get the revision information on the specified file
     */
    var getRevisionInformation = function(){
        $.ajax({
            url: baseFileData.path + ".versions.json",
            type : "GET",
            success: function(data){
                var versions = [];
                for (var i in data.versions){
                    if (data.versions.hasOwnProperty(i)) {
                        var splitDate = data.versions[i]["jcr:created"].split("T")[0].split("-");
                        data.versions[i]["jcr:created"] = sakai.api.l10n.transformDate(new Date(splitDate[0],splitDate[1]-1,splitDate[2]));
                        versions.push(data.versions[i]);
                    }
                }

                baseFileData.revisions = versions.reverse();
                getRevisionInformationDetails();
            },
            error: function(){
                sakai.api.Util.notification.show("Revision information not retrieved", "The revision information for the file could not be retrieved");
            }
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

    $fileRevisionsDialog.jqm({
        modal: true,
        overlay: 20,
        toTop: true
    });

    $(filerevisionsCloseButton).live("click", function(){
        $(filerevisionsTemplateContainer).html("");
        $fileRevisionsDialog.jqmHide();
    });

};
sakai.api.Widgets.widgetLoader.informOnLoad("filerevisions");