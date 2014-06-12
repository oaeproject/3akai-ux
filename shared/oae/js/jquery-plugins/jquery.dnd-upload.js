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

        /**
         * Extracts files from a dropped item (currently only supported in Chrome)
         *
         * @param  {Object}   entry     Entry provided as event data for drop event
         * @param  {String}   [path]    File system path for entry
         * @return {Array}              Array of files
         */
        var getFilesFromEntry = function(entry, path) {

            // Set default path if none provided
            path = path || '';

            // Prepare for asynchronous folder traversal
            var deferred = $.Deferred();

            // Handle file I/O errors
            var handleErrors = function() {
                // Instead of propagating an error, return
                // an empty array so other sibling entries
                // don't immediately error out. (Those other
                // entries may succeed.)
                deferred.resolve([]);
            };

            // Handle single files directly
            if (entry.isFile) {
                // Workaround Chome bug #149735
                if (entry._itemAsFile) {
                    entry._itemAsFile.relativePath = path;
                    files.push(entry._itemAsFile);
                    deferred.resolve(files);
                } else {
                    entry.file(function(file) {
                        var files = [];
                        file.relativePath = path;
                        files.push(file);
                        deferred.resolve(files);
                    },
                    handleErrors);
                }

            // Handle folders recursively
            } else if (entry.isDirectory) {

                var folder = entry.createReader();
                folder.readEntries(function(entries) {
                    $.when.apply(
                        $,
                        $.map(entries, function(entry) {
                            return getFilesFromEntry(entry, path + entry.name + '/');
                        })
                    ).pipe(function() {
                        // Combine the results for each entry by concatenating results
                        return Array.prototype.concat.apply([], arguments);
                    }).done(function(files){
                       deferred.resolve(files);
                    }).fail(handleErrors);
                });

            // If not a file/folder, result is empty array
            } else {
                deferred.resolve([]);
            }

            return deferred.promise();
        };

        $(document).on('drop', '.oae-dnd-upload', function(ev) {
            if (ev.originalEvent.dataTransfer && ev.originalEvent.dataTransfer.files.length) {
                ev.preventDefault();
                ev.stopPropagation();

                // Prepare to handle asynchronous folder traversal
                var deferred;

                // Get data about dropped items
                var dataTransfer = ev.originalEvent.dataTransfer;

                // Chrome uses `dataTransfer.items` to provide more information
                // that the standard `dataTransfer.files`. Use it if it's
                // available since we need it to traverse folders.
                if (dataTransfer.items &&
                    dataTransfer.items.length &&
                    (dataTransfer.items[0].webkitGetAsEntry || dataTransfer.items[0].getAsEntry)) {

                    // Finish asynchronous processing **when** all individual
                    // items are processed
                    deferred = $.when.apply(
                        $,
                        // Create a separate asynchronous handler for each item
                        $.map(dataTransfer.items, function(item) {
                            var entry = item.getAsEntry ? item.getAsEntry() : item.webkitGetAsEntry();
                            /**
                             * Workaround for Chrome bug #149735
                             * @see https://code.google.com/p/chromium/issues/detail?id=149735
                             */
                            entry._itemAsFile = item.getAsFile();
                            return getFilesFromEntry(entry);
                        })
                    ).pipe(function() {
                        // Combine the results for each item by concatenating
                        // their results
                        return Array.prototype.concat.apply([], arguments);
                    });

                // Enhanced `dataTransfer.items` property isn't available,
                // so stick with the standard `dataTransfer.files`
                } else {
                    deferred = $.Deferred().resolve(
                        $.grep(dataTransfer.files, function(file) {
                            // Filter out folders and files without a name
                            return file.size > 0 && file.name;
                        })
                    );
                }

                // Wait for possible asynchronous folder processing before continuing
                deferred.done(function(files) {
                    // Trigger an event that sends the dropped data
                    // for the upload widget to pick up
                    $(document).trigger('oae.trigger.upload', {
                        'data': {files: files}
                    });
                });
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
