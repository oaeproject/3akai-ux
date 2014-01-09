/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery'], function (jQuery) {
    (function() {
        $(document).on('drop', '.oae-dnd-upload', function(ev, data) {
            if (ev.originalEvent.dataTransfer && ev.originalEvent.dataTransfer.files.length) {
                ev.preventDefault();
                ev.stopPropagation();

                // Parse the data into a format the upload widget understands
                var selectedFiles = {
                    'files': []
                };

                // Filter out folders and files without a name
                $.each(ev.originalEvent.dataTransfer.files, function(index, file) {
                    if (file.size > 0 && file.name) {
                        selectedFiles.files.push(file);
                    }
                });

                // Trigger an event that sends the dropped data along if
                // valid files have been dropped for the upload widget to pick them up
                if (selectedFiles.files.length) {
                    $(document).trigger('oae.trigger.upload', {
                        'data': selectedFiles
                    });
                }
            }
        });

        $(document).on('dragover', '.oae-dnd-upload', function(ev) {
            // Add the copy icon to the mouse when dragging over the drop area
            ev.originalEvent.dataTransfer.dropEffect = 'copy';
            ev.preventDefault();
            ev.stopPropagation();
        });
    })();
});
