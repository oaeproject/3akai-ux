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

/*global, window, $ */

require(['jquery', 'sakai/sakai.api.core', 'jquery-plugins/jquery.fileupload'], function($, sakai) {

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
        var $uploadnewversionContainer = $('#uploadnewversion_container');
        var $uploadnewversionFormContainer = $('#uploadnewversion_form_container');

        // Templates
        var uploadnewversionFormTemplate = 'uploadnewversion_form_template';

        // Elements
        var uploadnewversionDoUpload = '.uploadnewversion_doupload';
        var $uploadnewversionUploading = $('#uploadnewversion_uploading');

        var filesList = [];

        ////////////
        // UPLOAD //
        ////////////

        var doUploadVersion = function(){
            sakai.api.Util.Modal.open($uploadnewversionUploading);
            var jqXHR = $('#uploadnewversion_fileupload').fileupload('send', {
                url: '/system/pool/createfile.' + sakai_global.content_profile.content_data.data['_path'],
                files: filesList,
                success: function(data) {
                    $.ajax({
                       url: sakai_global.content_profile.content_data['content_path'] + '.json',
                       type: 'POST',
                       data: {
                           'sakai:needsprocessing': true,
                           'sakai:pagecount': 0,
                           'sakai:hasPreview': false
                       },
                       success: function(data){
                           $.ajax({
                               url: sakai_global.content_profile.content_data['content_path'] + '.save.json',
                               type: 'POST',
                               success: function(data){
                                   sakai.api.Util.Modal.close($uploadnewversionUploading);
                                   sakai.api.Util.Modal.close($uploadnewversionContainer);
                                   sakai_global.content_profile.content_data.data = data;
                                   $(window).trigger('updated.version.content.sakai');
                                   $(window).trigger('update.versions.sakai', {
                                       pageSavePath: sakai_global.content_profile.content_data.content_path,
                                       saveRef: '',
                                       showByDefault: true
                                   });
                               },
                               error: function(err){
                                   sakai.api.Util.Modal.close($uploadnewversionUploading);
                                   debug.error(err);
                               }
                           });
                       },
                       error: function(err){
                           sakai.api.Util.Modal.close($uploadnewversionUploading);
                           debug.error(err);
                       }
                    });
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    debug.error(jqXHR, textStatus, errorThrown);
                    sakai.api.Util.Modal.close($uploadnewversionUploading);
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
            sakai.api.Util.Modal.setup($uploadnewversionContainer, {
                modal: true,
                overlay: 20,
                toTop: true
            });

            sakai.api.Util.Modal.open($uploadnewversionContainer);

            sakai.api.Util.Modal.setup($uploadnewversionUploading, {
                modal: true,
                overlay: 20,
                toTop: true
            });
            $uploadnewversionUploading.css('z-index', '4002');
        };

        var initializeFileUpload = function(){
            $('#uploadnewversion_fileupload').fileupload({
                replaceFileInput: false,
                add: function(e, data) {
                    filesList = data.files;
                }
            });
        };

        var addBinding = function(){
            $(uploadnewversionDoUpload).unbind('click', doUploadVersion);
            $(uploadnewversionDoUpload).bind('click', doUploadVersion);
        };

        var doInit = function(){
            initializeJQM();
            initializeFileUpload();
            addBinding();
        };

        $(document).on('init.uploadnewversion.sakai', doInit);

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('uploadnewversion');
});
