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

define(['jquery', 'oae.api.content', 'jquery.fileupload'], function (jQuery) {
    (function() {
        $('html').contentChange(function(){
            // Initialize drag and drop from desktop
            $('.oae-dnd-upload').fileupload({
                url: '/api/content/create',
                dropZone: $('.oae-dnd-upload'),
                submit: function (ev, data) {
                    var $this = $(this);
                    data.formData = {
                        'contentType': 'file',
                        'displayName': data.files[0].name,
                        'file': data.files[0]
                    }
                    $this.fileupload('send', data);
                    return false;
                } 
            });
        });

        $(document).on('dragover', '.oae-dnd-upload', function(ev) {
            $('.oae-dnd-upload').addClass('dragover');
        });

        $(document).on('dragleave drop', '.oae-dnd-upload', function(ev) {
            $('.oae-dnd-upload').removeClass('dragover');
        });
    })();
});
