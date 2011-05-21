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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.form.js (ajaxForm)
 */

/*global, fluid, window, $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.uploadnewversion
     *
     * @class uploadnewversion
     *
     * @description
     * Widget that uploads new versions of content
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.uploadnewversion = function(tuid, showSettings){


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $uploadnewversionContainer = $("#uploadnewversion_container");

        // Elements
        var uploadnewversionUploadContentForm = "#uploadnewversion_upload_content_form";
        var uploadnewversionDoUpload = ".uploadnewversion_doupload";


        ////////////
        // UPLOAD //
        ////////////

        var doUploadVersion = function(){
            $.ajax({
                url: sakai_global.content_profile.content_data["content_path"] + ".save.json",
                type: "POST",
                dataType: "json",
                success: function(){
                    $(uploadnewversionUploadContentForm).attr("action", "/system/pool/createfile." + sakai_global.content_profile.content_data.data["jcr:name"]);
                    $(uploadnewversionUploadContentForm).ajaxForm({
                        success: function(data){
                            $uploadnewversionContainer.jqmHide();
                            $(window).trigger("updated.version.content.sakai");
                        },
                        error: function(err){
                            debug.log(err);
                        }
                    });
                    $(uploadnewversionUploadContentForm).submit();
                }
            });
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Initialize the modal dialog
         */
        var initializeJQM = function(){
            $uploadnewversionContainer.jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });

            // position dialog box at users scroll position
            var htmlScrollPos = $("html").scrollTop();
            var docScrollPos = $(document).scrollTop();
            if (htmlScrollPos > 0) {
                $uploadnewversionContainer.css({
                    "top": htmlScrollPos + 100 + "px"
                });
            } else if (docScrollPos > 0) {
                $uploadnewversionContainer.css({
                    "top": docScrollPos + 100 + "px"
                });
            }
            $uploadnewversionContainer.jqmShow();
        };

        var initializeMultiFile = function(){
            $(uploadnewversionUploadContentForm + " input").MultiFile();
        };

        var addBinding = function(){
            $(uploadnewversionDoUpload).bind("click", doUploadVersion);
        };

        var doInit = function(){
            initializeJQM();
            initializeMultiFile();
            addBinding();
        };

        $(window).bind("init.uploadnewversion.sakai", doInit);

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("uploadnewversion");
});
