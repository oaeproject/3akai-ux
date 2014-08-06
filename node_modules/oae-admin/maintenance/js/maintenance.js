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

define(['jquery', 'oae.core', 'bootstrap.datepicker'], function($, oae) {

    //////////////////////////////////////////////
    // REPROCESSING PREVIEW MIME-TYPE CONSTANTS //
    //////////////////////////////////////////////

    var mimeTypeConstants = {
        'TYPES': {
            '__MSG__OTHER_MIMETYPES__': [
                'application/octet-stream'
            ],
            '__MSG__IMAGE_MIMETYPES__': ['application/dicom',
                        'application/tga',
                        'application/x-font-ttf',
                        'application/x-tga',
                        'application/x-targa',
                        'image/bmp',
                        'image/gif',
                        'image/jpeg',
                        'image/jpg',
                        'image/png',
                        'image/targa',
                        'image/tga',
                        'image/tiff',
                        'image/vnd.adobe.photoshop',
                        'image/x-cmu-raster',
                        'image/x-gnuplot',
                        'image/x-icon',
                        'image/x-targa',
                        'image/x-tga',
                        'image/x-xbitmap',
                        'image/x-xpixmap',
                        'image/x-xwindowdump',
                        'image/xcf'
                    ],
            '__MSG__OFFICE_MIMETYPES__': ['application/msword',
                        'application/rdf+xml',
                        'application/vnd.ms-excel',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.oasis.opendocument.presentation',
                        'application/vnd.oasis.opendocument.spreadsheet',
                        'application/vnd.oasis.opendocument.text',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/x-mspowerpoint',
                        'application/x-pdf',
                        'application/x-powerpoint',
                        'text/plain'
                    ],
            '__MSG__PDF_MIMETYPES__': [
                'application/pdf'
            ],
            '__MSG__VIDEO_MIMETYPES__': [
                'application/annodex',
                'application/gsm',
                'application/gxf',
                'application/mxf',
                'application/ogg',
                'application/x-gsm',
                'application/x-troff-msvideo',
                'application/x-winamp',
                'video/3gpp',
                'video/3gpp2',
                'video/annodex',
                'video/avi',
                'video/avs-video',
                'video/cdg',
                'video/lml',
                'video/mp1s',
                'video/mp2p',
                'video/mp2t',
                'video/mp4',
                'video/mpeg',
                'video/msvideo',
                'video/ogg',
                'video/quicktime',
                'video/vnd.rn-realvideo',
                'video/webm',
                'video/x-dv',
                'video/x-f4v',
                'video/x-fli',
                'video/x-flv',
                'video/x-m4v',
                'video/x-matroska',
                'video/x-ms-asf',
                'video/x-ms-wmv',
                'video/x-msvideo',
                'video/x-mve',
                'video/x-pva'
            ],
            '__MSG__AUDIO_MIMETYPES__': [
                'audio/3gpp',
                'audio/3gpp2',
                'audio/aac',
                'audio/aacp',
                'audio/ac3',
                'audio/aiff',
                'audio/amr',
                'audio/annodex',
                'audio/basic',
                'audio/flac',
                'audio/gsm',
                'audio/L16',
                'audio/L20',
                'audio/L24',
                'audio/L8',
                'audio/mid',
                'audio/mp3',
                'audio/mp4',
                'audio/MP4A-LATM',
                'audio/mpa',
                'audio/mpeg',
                'audio/mpeg4-generic',
                'audio/musepack',
                'audio/ogg',
                'audio/qcelp',
                'audio/vnd.rn-realaudio',
                'audio/vnd.wav',
                'audio/vorbis',
                'audio/wav',
                'audio/webm',
                'audio/x-aiff',
                'audio/x-ape',
                'audio/x-caf',
                'audio/x-gsm',
                'audio/x-matroska',
                'audio/x-ms-wma',
                'audio/x-musepack',
                'audio/x-pn-realaudio',
                'audio/x-pn-realaudio-plugin',
                'audio/x-twinvq',
                'audio/x-twinvq-plugin',
                'audio/x-wavpack'
            ]
        }
    };

    return function(uid) {

        // The maintenance widget container
        var $rootel = $('#' + uid);


        ///////////////////////////////////
        // REPROCESSING CONTENT PREVIEWS //
        ///////////////////////////////////

        /**
         * Handle the result of starting the preview reprocessing process by showing a success or failure notification
         *
         * @param  {Object}    err    Error object containing error code and error message
         */
        var reprocessHandler = function(err) {
            if (err) {
                oae.api.util.notification(
                    oae.api.i18n.translate('__MSG__REPROCESS_PREVIEWS_NOT_STARTED__', 'maintenance'),
                    oae.api.i18n.translate('__MSG__REPROCESS_PREVIEWS_FAILED__', 'maintenance'),
                    'error');
            } else {
                oae.api.util.notification(
                    oae.api.i18n.translate('__MSG__REPROCESS_PREVIEWS_STARTED__', 'maintenance'),
                    oae.api.i18n.translate('__MSG__REPROCESS_PREVIEWS_PROGRESS__', 'maintenance'));
            }
        };

        /**
         * Reprocess all content items with the selected mimetypes
         */
        var reprocessMimeTypes = function() {
            // Get all the selected mimetypes and construct the data object to send to the server
            var data = {'revision_mime': []};
            $(this).find('input[type="checkbox"][name]:checked').each(function(index, checkedMimeType) {
                data.revision_mime.push(checkedMimeType.name);
            });

            oae.api.admin.reprocessPreviews(data, reprocessHandler);

            return false;
        };

        /**
         * Reprocess all selected content types
         */
        var reprocessContentTypes = function() {
            // Get all the selected content types and construct the data object to send to the server
            var data = {'content_resourceSubType': []};
            $(this).find('input[type="checkbox"][name]:checked').each(function(index, checkedContentType) {
                data.content_resourceSubType.push(checkedContentType.name);
            });

            oae.api.admin.reprocessPreviews(data, reprocessHandler);

            return false;
        };

        /**
         * Reprocess all failed content previews
         */
        var reprocessFailed = function() {
            var data = {'revision_previewsStatus': ['ignored', 'error']};

            oae.api.admin.reprocessPreviews(data, reprocessHandler);
        };

        /**
         * Reprocess all content items in a date range
         */
        var reprocessDateRange = function() {
            var data = {
                'revision_createdAfter':$('#maintenance-reprocess-daterange-from', $rootel).datepicker('getDate').getTime(),
                'revision_createdBefore': $('#maintenance-reprocess-daterange-to', $rootel).datepicker('getDate').getTime()
            };

            oae.api.admin.reprocessPreviews(data, reprocessHandler);

            return false;
        };

        /**
         * Reprocess all content items for a specific user
         */
        var reprocessUser = function() {
            var data = {'revision_createdBy': []};
            $.each(oae.api.util.autoSuggest().getSelection($rootel), function(index, user) {
                data['revision_createdBy'].push(user.id);
            });

            oae.api.admin.reprocessPreviews(data, reprocessHandler);
        };

        /**
         * Select or deselect all mimetypes in a mimetype category
         */
        var selectAllMimetypes = function() {
            var selectAll = $(this).is(':checked');
            var chkContainer = $(this).parents('.checkbox').next();
            $.each($(chkContainer).find('input[type="checkbox"]'), function(i, chk) {
                $(chk).prop('checked', selectAll);
            });
        };

        ////////////////////
        // REINDEX SEARCH //
        ////////////////////

        /**
         * Reindex the search index
         */
        var reindexSearch = function() {
            oae.api.admin.reindexSearch(function(err) {
                if (err) {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__REINDEX_SEARCH_NOT_STARTED__', 'maintenance'),
                        oae.api.i18n.translate('__MSG__REINDEX_SEARCH_FAILED__', 'maintenance'),
                        'error');
                } else {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__REINDEX_SEARCH_STARTED__', 'maintenance'),
                        oae.api.i18n.translate('__MSG__REINDEX_SEARCH_PROGRESS__', 'maintenance'));
                }
            });
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Toggle a container
         */
        var toggleContainer = function() {
            $(this).next().toggle(400);
        };

        /**
         * Render the maintenance widget
         */
        var setUpMaintenance = function() {
            oae.api.util.template().render($('#maintenance-list-header-template', $rootel), null, $('#maintenance-list-header', $rootel));

            oae.api.util.template().render($('#maintenance-reprocess-mimetypes-template', $rootel), {
                'previewMimetypes': mimeTypeConstants
            }, $('#maintenance-reprocess-mimetypes-form', $rootel));
        };

        /**
         * Initialize the date range picker to reprocess previews within the selected time range
         */
        var setUpDateRangePicker = function() {
            // Initialize the 'from' field
            $('#maintenance-reprocess-daterange-from', $rootel).datepicker({
                todayBtn: 'linked',
                orientation: 'top left',
                autoclose: true,
                todayHighlight: true
            }).on('changeDate', function(ev) {
                // Disable all dates before or on the `from` date in the `to` date field
                var selectedDate = ev.date;
                $('#maintenance-reprocess-daterange-to', $rootel).datepicker('setStartDate', new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
            });
            $('#maintenance-reprocess-daterange-to', $rootel).datepicker({
                todayBtn: 'linked',
                orientation: 'top left',
                autoclose: true,
                todayHighlight: true
            }).on('changeDate', function(ev) {
                // Disable all dates after or on the `to` date in the `from` date field
                var selectedDate = ev.date;
                $('#maintenance-reprocess-daterange-from', $rootel).datepicker('setEndDate', new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
            });
        };

        /**
         * Initialize the autousuggest for user specific reprocessing of previews
         */
        var setUpUserAutosuggest = function() {
            oae.api.util.autoSuggest().setup($('#maintenance-reprocess-user-autosuggest', $rootel), {
                'url': '/api/search/general'
            }, ['user']);
        };

        /**
         * Set up form validation for the date range reprocessing form
         */
        var setUpValidation = function() {
            oae.api.util.validation().validate($('#maintenance-reprocess-daterange-form', $rootel), {
                'methods': {
                    'isolderdate': {
                        'method': function(value, element) {
                            var fromDate = $('#maintenance-reprocess-daterange-from', $rootel).datepicker('getDate');
                            var toDate = $('#maintenance-reprocess-daterange-to', $rootel).datepicker('getDate');
                            return fromDate < toDate;
                        },
                        'text': oae.api.i18n.translate('__MSG__SELECT_A_DATE_AFTER_FROM_DATE__', 'maintenance')
                    }
                },
                'submitHandler': reprocessDateRange
            });
        };

        /**
         * Add binding to various elements in the maintenance widget
         */
        var addBinding = function() {
            // Toggle a maintenance container
            $rootel.on('click', '.admin-table-striped-toggle', toggleContainer);

            // Reindex the search index
            $rootel.on('click', '#maintenance-reindexall', reindexSearch);

            // Reprocess previews
            $rootel.on('submit', '#maintenance-reprocess-mimetypes-form', reprocessMimeTypes);
            $rootel.on('submit', '#maintenance-reprocess-contenttypes-form', reprocessContentTypes);
            $rootel.on('click', '#maintenance-reprocess-all', reprocessFailed);
            $rootel.on('click', '#maintenance-reprocess-user', reprocessUser);
            $rootel.on('change', '.maintenance-reprocess-selectall', selectAllMimetypes);
        };

        addBinding();
        setUpMaintenance();
        setUpValidation();
        setUpDateRangePicker();
        setUpUserAutosuggest();
    };
});
