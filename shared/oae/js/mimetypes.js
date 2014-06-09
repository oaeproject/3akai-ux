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

/**
 * This module will export logic to get a human readable description given
 * a resource sub type and a mime type.
 *
 * We need to mimick AMD's define so we can use this code in both the backend and frontend.
 *
 * @param  {Object}     exports   Properties that are added on this object are exported
 * @param  {Object}     _         The underscorejs utility
 * @api private
 */
var _expose = function(exports, _) {

    /*!
     * Constant that holds regular expressions for the different mimeTypes that might be returned by the
     * back-end, allowing for these mimeTypes to be transformed into a human readable mime type description.
     */
    var MIMETYPES = {
        'archive': {
            'description': '__MSG__ARCHIVE__',
            'regex': [
                'application/zip',
                'application/x-zip*',
                'application/x-tar'
            ]
        },
        'audio': {
            'description': '__MSG__AUDIO__',
            'regex': [
                'audio/*',
                'kaltura/audio'
            ]
        },
        'collabdoc': {
            // The collabdoc type will be used for collaborative documents
            'description': '__MSG__DOCUMENT__'
        },
        'css': {
            'description': '__MSG__CSS_FILE__',
            'regex': 'text/css'
        },
        'image': {
            'description': '__MSG__IMAGE__',
            'regex': 'image/*'
        },
        'flash': {
            'description': '__MSG__FLASH_FILE__',
            'regex': 'application/x-shockwave-flash'
        },
        'html': {
            'description': '__MSG__HTML_DOCUMENT__',
            'regex': 'text/html'
        },
        'link': {
            // The link type will be used for added links
            'description': '__MSG__LINK__'
        },
        'markdown': {
            'description': '__MSG__MARKDOWN__',
            'regex': 'text/x-markdown'
        },
        'other': {
            // The other type will be used for all unrecognized mimeTypes
            'description': '__MSG__OTHER_DOCUMENT__'
        },
        'pdf': {
            'description': '__MSG__PDF_DOCUMENT__',
            'regex': [
                'application/pdf',
                'application/x-download',
                'application/x-pdf'
            ]
        },
        'presentation': {
            'description': '__MSG__PRESENTATION__',
            'regex': [
                'application/vnd.ms-powerpoint',
                'application/vnd.oasis.opendocument.presentation',
                'application/vnd.openxmlformats-officedocument.presentation*'
            ]
        },
        'spreadsheet': {
            'description': '__MSG__SPREADSHEET__',
            'regex': [
                'application/vnd.oasis.opendocument.spreadsheet',
                'application/vnd.openxmlformats-officedocument.spreadsheet*',
                'application/vnd.ms-excel'
            ]
        },
        'text': {
            'description': '__MSG__TEXT_DOCUMENT__',
            'regex': [
                'text/plain',
                'text/rtf'
            ]
        },
        'xml': {
            'description': '__MSG__XML_DOCUMENT__',
            'regex': 'text/xml'
        },
        'video': {
            'description': '__MSG__VIDEO__',
            'regex': [
                'video/*',
                'kaltura/video'
            ]
        },
        'word': {
            'description': '__MSG__WORD_DOCUMENT__',
            'regex': [
                'application/doc',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.word*',
                'application/vnd.oasis.opendocument.text'
            ]
        }
    };

    /**
     * Get a human readable mimeType description for a content item. Unrecognized mimeTypes
     * will default to the `other` type. The returned string still needs translation.
     *
     * @param  {String}     resourceSubType     The resource sub type for which to generate an appropriate description
     * @param  {String}     [mimeType]          In case the `resourceSubType` is a `file`, a more detailed description can be returned by providing a mime type
     * @return {String}                         Human readable mimetype description for the provided resource subtype and mime type
     */
    var getDescription = exports.getDescription = function(resourceSubType, mimeType) {
        var mimeTypeObject = null;

        // Only files will have an actual mimeType. For all of these, we will run through the available
        // mimeType mappings and check if the content mimeType matches any of the regular expressions for
        // the mimeType mapping
        if (resourceSubType === 'file') {
            if (mimeType) {
                _.each(MIMETYPES, function(mimeTypeMapping, mimeTypeMappingId) {
                    // Some mimeType mappings might not have any regular expressions. No need to check for those
                    if (mimeTypeMapping.regex) {
                        // When only a single regex is available for a mimeType mapping, a string can be provided
                        // instead of an array. We ensure that the mimeType mapping regex is an array
                        var regex = mimeTypeMapping.regex;
                        regex = _.isArray(regex) ? regex : [regex];
                        // Parse the provided regular expressions into a single regular expression and match
                        // on the content's mimeType
                        var joinedRegex = new RegExp(regex.join('|'), 'i');
                        if (mimeType.match(joinedRegex)) {
                            mimeTypeObject = mimeTypeMapping;
                            return false;
                        }
                    }
                });
            }
        // Links and collaborative documents
        } else {
            mimeTypeObject = MIMETYPES[resourceSubType];
        }

        // If no mimeType mapping has matched the content's mimeType, we can default back
        // to the `other` mimeType
        if (!mimeTypeObject) {
            mimeTypeObject = MIMETYPES.other;
        }

        return mimeTypeObject.description;
    };
};

(function() {
    if (typeof define !== 'function') {
        // This gets executed in the backend
        var _ = require('underscore');
        _expose(module.exports, _);
    } else {
        // This gets executed in the browser
        define(['exports', 'underscore'], _expose);
    }
})();
