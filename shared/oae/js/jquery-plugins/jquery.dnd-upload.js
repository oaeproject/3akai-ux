/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.api.content', 'jquery.fileupload', 'jquery.contentchange'], function (jQuery) {
    (function() {
        $('html').contentChange(function(){
            var $dropZone = $('.oae-dnd-upload');
            if (!$dropZone.hasClass('initialized')) {
                $('.oae-dnd-upload').on('drop', function(ev, data) {
                    if(ev.originalEvent.dataTransfer){
                        if(ev.originalEvent.dataTransfer.files.length) {
                            ev.preventDefault();
                            ev.stopPropagation();

                            // Parse the data into a format the upload widget understands
                            var selectedFiles = {
                                'files': []
                            };
                            $.each(ev.originalEvent.dataTransfer.files, function(index, file) {
                                if (file.name) {
                                    selectedFiles.files.push(file);
                                }
                            });

                            // Trigger an event that sends the dropped data along
                            $(document).trigger('oae-trigger-dnd', {
                                'data': selectedFiles
                            });
                        }
                    }
                });

                $dropZone.on('dragover', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });

                $dropZone.on('dragenter', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });

                $dropZone.addClass('initialized');
            }
        });
    })();
});
