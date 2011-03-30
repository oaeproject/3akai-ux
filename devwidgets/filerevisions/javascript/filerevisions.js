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
 * /dev/lib/jquery/plugins/jquery.json.js (toJSON)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.filerevisions
     *
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.filerevisions = function(tuid, showSettings){


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
            baseFileData.created = sakai.api.l10n.transformDate(new Date(baseFileData.data["_created"]));
            data.data = baseFileData;
            data.linkrevision = $("#content_profile_details_view_revisions").hasClass("link_revision");
            data.sakai = sakai;
            var renderedTemplate = sakai.api.Util.TemplateRenderer(filerevisionsTemplate, data);
            $(filerevisionsTemplateContainer).html(renderedTemplate);

            renderedTemplate = sakai.api.Util.TemplateRenderer("#filerevision_header_text_template", data);
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
            for (var i in baseFileData.versions.versions) {
                if (baseFileData.versions.versions.hasOwnProperty(i)) {
                    var item = {
                        "url": "/p/" + baseFileData.data["jcr:name"] + ".version.," + baseFileData.versions.versions[i]["jcr:name"] + ",.json",
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
                dataType: "JSON",
                cache: false,
                data: {
                    requests: $.toJSON(revisionInformationDetails)
                },
                success: function(data){
                    // Get file information out of results
                    var revisionFileDetails = [];
                    data = $.parseJSON(data);
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
         * Load the file revisions widget with the appropriate data
         * This function can be called from anywhere within Sakai
         * @param {Object} data Contains data needed to call all revisions for the file
         */
        var initialize = function(data){
            // position dialog box at users scroll position
            var htmlScrollPos = $("html").scrollTop();
            var docScrollPos = $(document).scrollTop();

            if (htmlScrollPos > 0) {
                $fileRevisionsDialog.css({
                    "top": htmlScrollPos + 100 + "px"
                });
            }
            else if (docScrollPos > 0) {
                $fileRevisionsDialog.css({
                    "top": docScrollPos + 100 + "px"
                });
            }
     
            baseFileData = data;
            getRevisionInformationDetails();
            $fileRevisionsDialog.jqmShow();
        };

        $(window).bind("initialize.filerevisions.sakai", function(e, data) {
            initialize(data);
        });

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
});
