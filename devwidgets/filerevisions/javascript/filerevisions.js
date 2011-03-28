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
            sakai.api.Util.TemplateRenderer(filerevisionsTemplate, data, $(filerevisionsTemplateContainer));

            sakai.api.Util.TemplateRenderer("#filerevision_header_text_template", data, $("#filerevision_header_text"));
        };

        /**
         * Get userprofiles for everyone that has edited the file
         * @param {Object} userid
         */
        var getUserProfile = function(userid){
            reqs = [];
            // Make sure userid is amongst the editors
            baseFileData.revEditors[userid] = "";
            $.each(baseFileData.revEditors, function(i,v) {
                    reqs.push({url: "/~" + i + "/public/authprofile.infinity.json", "method":"GET", "cache":false});
            });

            sakai.api.Server.batch($.toJSON(reqs), function(success, data) {
                if (success){
                    $.each(data.results, function(i, val) {
                        var profile = $.parseJSON(val.body);
                        var userId = profile.homePath.split("/~")[1];
                        baseFileData.revEditors[userId] = sakai.api.User.getDisplayName(profile);
                    });
                    baseFileData["sakai:savedByFull"] = baseFileData.revEditors[userid];
                    renderRevisionData();
                } else {
                    sakai.api.Util.notification.show("Failed loading profile", "Failed to load file profile information");
                }
            });
        };

        /**
         * Get detailed information on the files in the revision history
         * This data contains path, mimetype, description,...
         */
        var getRevisionInformationDetails = function(){
            $.ajax({
                url: "/p/" + baseFileData.data["jcr:name"] + ".versions.json",

                type : "GET",
                cache: false,
                success: function(data){
                    baseFileData.revisionFileDetails = data;
                    baseFileData.revEditors = {};
                    $.each(data.versions, function(i, v) {
                        baseFileData.revEditors[v["_bodyLastModifiedBy"]]="";
                    });
                    if (baseFileData.data["_lastModifiedBy"]) {
                        getUserProfile(baseFileData.data["_lastModifiedBy"]);
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
