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

define(['exports', 'jquery', 'underscore', 'oae.api.i18n'], function(exports, $, _, i18nAPI) {

    /**
     * Get a full content profile
     *
     * @param  {String}       contentId           Id of the content item we're trying to retrieve
     * @param  {Function}     callback            Standard callback method
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Content}      callback.content    Content object representing the retrieved content
     * @throws {Error}                            Error thrown when no content id has been provided
     */
    var getContent = exports.getContent = function(contentId, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        }

        $.ajax({
            'url': '/api/content/' + contentId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get a specific revision
     *
     * @param  {String}       contentId           Id of the content item we're trying to retrieve
     * @param  {String}       revisionId          Id of the revision we're trying to retrieve
     * @param  {Function}     callback            Standard callback method
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Content}      callback.content    Content object representing the retrieved content
     * @throws {Error}                            Error thrown when no content id has been provided
     */
    var getRevision = exports.getRevision = function(contentId, revisionId, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        }
        if (!revisionId) {
            throw new Error('A valid revision id should be provided');
        }

        $.ajax({
            'url': '/api/content/' + contentId + '/revisions/' + revisionId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a new link.
     *
     * @param  {String}         displayName         Display title for the created content item
     * @param  {String}         [description]       The content item's description
     * @param  {String}         [visibility]        The content item's visibility. This can be public, loggedin or private
     * @param  {String}         link                The URL that should be stored against this content item
     * @param  {String[]}       [managers]          Array of user/group ids that should be added as managers to the content item
     * @param  {String[]}       [viewers]           Array of user/group ids that should be added as viewers to the content item
     * @param  {Function}       [callback]          Standard callback method
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @param  {Content}        [callback.content]  Content object representing the created content
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var createLink = exports.createLink = function(displayName, description, visibility, link, managers, viewers, callback) {
        if (!displayName) {
            throw new Error('A valid link name should be provided');
        } else if (!link) {
            throw new Error('A valid link should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'resourceSubType': 'link',
            'displayName': displayName,
            'description': description,
            'visibility': visibility,
            'link': link,
            'managers': managers,
            'viewers': viewers
        };

        $.ajax({
            'url': '/api/content/create',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a new file.
     *
     * @param  {String}             displayName         Display title for the created content item
     * @param  {String}             [description]       The content item's description
     * @param  {String}             [visibility]        The content item's visibility. This can be public, loggedin or private
     * @param  {Element|String}     $fileUploadField    jQuery element or selector for that jQuery element representing the file upload form field that has been used to initialise jQuery.fileupload
     * @param  {Object}             file                jQuery.fileUpload object that was returned when selecting the file that needed to be uploaded
     * @param  {String[]}           [managers]          Array of user/group ids that should be added as managers to the content item
     * @param  {String[]}           [viewers]           Array of user/group ids that should be added as viewers to the content item
     * @param  {Function}           [callback]          Standard callback method
     * @param  {Object}             [callback.err]      Error object containing error code and error message
     * @param  {Content}            [callback.content]  Content object representing the created content
     * @throws {Error}                                  Error thrown when not all of the required parameters have been provided
     */
    var createFile = exports.createFile = function(displayName, description, visibility, $fileUploadField, file, managers, viewers, callback) {
        if (!displayName) {
            throw new Error('A valid file name should be provided');
        } else if (!$fileUploadField) {
            throw new Error('A valid jquery.fileUpload container should be provided');
        } else if (!file) {
            throw new Error('A valid jquery.fileUpload file object should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        // jQuery.fileupload requires sending the other form data as a .serializeArray object
        // http://api.jquery.com/serializeArray/
        var data = [
            {'name': 'resourceSubType', 'value': 'file'},
            {'name': 'displayName', 'value': displayName},
            {'name': 'description', 'value': description},
            {'name': 'visibility', 'value': visibility}
        ];

        // Add the managers and viewers as an array
        managers = managers || [];
        $.each(managers, function(index, manager) {
            data.push({'name': 'managers', 'value': manager});
        });
        viewers = viewers || [];
        $.each(viewers, function(index, viewer) {
            data.push({'name': 'viewers', 'value': viewer});
        });

        $($fileUploadField).fileupload('send', {
            'files': [file],
            'formData': data,
            'success': function(data) {
                // The response will return as text/plain to avoid IE9 trying to download
                // the response when using the iFrame fallback upload solution

                // In IE9 the response is a jQuery object. In this case we have
                // to extract the data found in the inner pre tag.
                if (data instanceof $) {
                    data = data.find('pre').text();
                }
                callback(null, JSON.parse(data));
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Upload a new version of a file.
     *
     * @param  {Element|String}     $fileUploadField    jQuery element or selector for that jQuery element representing the file upload form field that has been used to initialise jQuery.fileupload
     * @param  {Object}             file                jQuery.fileUpload object that was returned when selecting the file that needed to be uploaded
     * @param  {Function}           [callback]          Standard callback method
     * @param  {Object}             [callback.err]      Error object containing error code and error message
     * @param  {Content}            [callback.content]  Content object representing the updated content
     * @throws {Error}                                  Error thrown when not all of the required parameters have been provided
     */
    var uploadNewVersion = exports.uploadNewVersion = function($fileUploadField, file, callback) {
        if (!$fileUploadField) {
            throw new Error('A valid jquery.fileUpload container should be provided');
        } else if (!file) {
            throw new Error('A valid jquery.fileUpload file object should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $($fileUploadField).fileupload('send', {
            'files': [file],
            'success': function(data) {
                // The response will return as text/plain to avoid IE9 trying to download
                // the response when using the iFrame fallback upload solution

                // In IE9 the response is a jQuery object. In this case we have
                // to extract the data found in the inner pre tag.
                if (data instanceof $) {
                    data = data.find('pre').text();
                }
                callback(null, JSON.parse(data));
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a new collaborative document.
     *
     * @param  {String}       displayName         Display title for the created content item
     * @param  {String}       [description]       The content item's description
     * @param  {String}       [visibility]        The content item's visibility. This can be public, loggedin or private
     * @param  {String[]}     [managers]          Array of user/group ids that should be added as managers to the content item
     * @param  {String[]}     [viewers]           Array of user/group ids that should be added as viewers to the content item
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @param  {Content}      [callback.content]  Content object representing the created content
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var createCollabDoc = exports.createCollabDoc = function(displayName, description, visibility, managers, viewers, callback) {
        if (!displayName) {
            throw new Error('A valid document name should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'resourceSubType': 'collabdoc',
            'displayName': displayName,
            'description': description,
            'visibility': visibility,
            'managers': managers,
            'viewers': viewers
        };

        $.ajax({
            'url': '/api/content/create',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Restore a revision. The restored revision will become the content item's current revision, and will have the same content as that revision.
     * Revisions can only be restored for documents and files.
     *
     * @param  {String}       contentId             Id of the content item we're restoring a revision of
     * @param  {String}       revisionId            Id of the revision that's being restored
     * @param  {Function}     [callback]            Standard callback method
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @param  {Revision}     [callback.revision]   Revision object representing the restored revision
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var restoreRevision = exports.restoreRevision = function(contentId, revisionId, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        } else if (!revisionId) {
            throw new Error('A valid revision id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/content/' + contentId + '/revisions/' + revisionId + '/restore',
            'type': 'POST',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update a content item's metadata
     *
     * @param  {String}       contentId           Id of the content item we're trying to update
     * @param  {Object}       params              JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @param  {Content}      [callback.data]     Content object representing the updated content
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var updateContent = exports.updateContent = function(contentId, params, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        } else if (!params || _.keys(params).length === 0) {
            throw new Error('At least one update parameter should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/content/' + contentId,
            'type': 'POST',
            'data': params,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Permanently delete a piece of content from the system
     *
     * @param  {String}        contentId             Id of the content item we're trying to delete
     * @param  {Function}      [callback]            Standard callback method
     * @param  {Object}        [callback.err]        Error object containing error code and error message
     * @throws {Error}                               Error thrown when no valid content id has been provided
     */
    var deleteContent = exports.deleteContent = function(contentId, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/content/' + contentId,
            'type': 'DELETE',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the viewers and managers of a content item.
     *
     * @param  {String}          contentId                      Id of the content item we're trying to retrieve the members for
     * @param  {String}          [start]                        The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}          [limit]                        The number of members to retrieve
     * @param  {Function}        callback                       Standard callback method
     * @param  {Object}          callback.err                   Error object containing error code and error message
     * @param  {Object}          callback.members               Response object containing the content members and nextToken
     * @param  {User[]|Group[]}  callback.members.results       Array that contains an object for each member. Each object has a role property that contains the role of the member and a profile property that contains the principal profile of the member
     * @param  {String}          callback.members.nextToken     The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no content ID has been provided
     */
    var getMembers = exports.getMembers = function(contentId, start, limit, callback) {
        if (!contentId) {
            throw new Error('A content ID should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/content/'+ contentId + '/members',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Change the members and managers of a content item.
     *
     * @param  {String}       contentId           Id of the content item we're trying to update the members for
     * @param  {Object}       updatedMembers      JSON Object where the keys are the user/group ids we want to update membership for, and the values are the roles these members should get (manager or viewer). If false is passed in as a role, the principal will be removed as a member
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var updateMembers = exports.updateMembers = function(contentId, updatedMembers, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        } else if (!updatedMembers || _.keys(updatedMembers).length === 0) {
            throw new Error('The updatedMembers hash should contain at least 1 update.');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/content/'+ contentId + '/members',
            'type': 'POST',
            'data': updatedMembers,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Share a content item.
     *
     * @param  {String}       contentId           Id of the content item we're trying to share
     * @param  {String[]}     principals          Array of principal ids with who the content should be shared
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when no content ID or Array of principal IDs has been provided
     */
    var shareContent = exports.shareContent = function(contentId, principals, callback) {
        if (!contentId) {
            throw new Error('A content ID should be provided');
        } else if (!principals.length) {
            throw new Error('A user or group to share with should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'viewers': principals
        };

        $.ajax({
            'url': '/api/content/' + contentId + '/share',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the content library for a given principal.
     *
     * @param  {String}         principalId                     User or group id for who we want to retrieve the content library
     * @param  {String}         [start]                         The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}         [limit]                         The number of content items to retrieve
     * @param  {Function}       callback                        Standard callback method
     * @param  {Object}         callback.err                    Error object containing error code and error message
     * @param  {Object}         callback.content                Response object containing the content items in the requested library and nextToken
     * @param  {Content[]}      callback.content.results        Array of content items representing the content items present in the library
     * @param  {String}         callback.content.nextToken      The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no principal ID has been provided
     */
    var getLibrary = exports.getLibrary = function(principalId, start, limit, callback) {
        if (!principalId) {
            throw new Error('A user or group ID should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/content/library/' + principalId,
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Delete a piece of content from a content library.
     *
     * @param  {String}         principalId       User or group id for for the library from which we want to delete the content
     * @param  {String}         contentId         Id of the content item we're trying to delete from the library
     * @param  {Function}       [callback]        Standard callback method
     * @param  {Object}         [callback.err]    Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var deleteContentFromLibrary = exports.deleteContentFromLibrary = function(principalId, contentId, callback) {
        if (!principalId) {
            throw new Error('A valid user or group ID should be provided');
        } else if (!contentId) {
            throw new Error('A valid content ID should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/content/library/' + principalId + '/' + contentId,
            'type': 'DELETE',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    ///////////////////////
    // CONTENT UTILITIES //
    ///////////////////////

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
     * Get a human readable mimeType description for a content item.
     * Unrecognized mimeTypes will default to the `other` type.
     *
     * @param  {Content}       contentObj       Content object for which to get the mimetype description
     * @return {String}                         Human readable mimeType description for the provided content item
     */
    var getMimeTypeDescription = exports.getMimeTypeDescription = function(contentObj) {
        // The `oae:resourceSubType` property is used by the activity feed
        var resourceSubType = contentObj.resourceSubType || contentObj['oae:resourceSubType'];
        var mimeTypeObject = null;

        // Only files will have an actual mimeType. For all of these, we will run through the available
        // mimeType mappings and check if the content mimeType matches any of the regular expressions for
        // the mimeType mapping.
        if (resourceSubType === 'file') {
            // The `oae:mimeType` property is used by the activity feed
            var mimeType = contentObj.mime || contentObj['oae:mimeType'];
            if (mimeType) {
                $.each(MIMETYPES, function(mimeTypeMappingId, mimeTypeMapping) {
                    // Some mimeType mappings might not have any regular expressions. No need to check for those.
                    if (mimeTypeMapping.regex) {
                        // When only a single regex is available for a mimeType mapping, a string can be provided
                        // instead of an array. We ensure that the mimeType mapping regex is an array.
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
        // to the `other` mimeType.
        if (!mimeTypeObject) {
            mimeTypeObject = MIMETYPES.other;
        }

        // Return the mime type description, translated into the user's language
        return i18nAPI.translate(mimeTypeObject.description);
    };
});
