/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
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

define(['exports', 'jquery', 'underscore'], function(exports, $, _) {

    /**
     * Get a full content profile.
     *
     * @param  {String}       contentId           Content id of the content item we're trying to retrieve
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
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
                callback(null, JSON.parse(data));
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
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

        $($fileUploadField).fileupload('send', {
            'files': [file],
            'success': function(data) {
                // The response will return as text/plain to avoid IE9 trying to download
                // the response when using the iFrame fallback upload solution
                callback(null, JSON.parse(data));
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Update a content item's metadata.
     *
     * @param  {String}       contentId           Content id of the content item we're trying to update
     * @param  {Object}       params              JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var updateContent = exports.updateContent = function(contentId, params, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        } else if (!params || _.keys(params).length === 0) {
            throw new Error('At least one update parameter should be provided');
        }

        $.ajax({
            'url': '/api/content/' + contentId,
            'type': 'POST',
            'data': params,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Delete a content item through the REST API.
     *
     * @param  {String}        contentId           Content id of the content item we're trying to delete
     * @param  {Function}      callback            Standard callback method
     * @param  {Object}        callback.err        Error object containing error code and error message
     */
    var deleteContent = exports.deleteContent = function(contentId, callback) {};

    /**
     * Get the viewers and managers of a content item.
     *
     * @param  {String}          contentId           Content id of the content item we're trying to retrieve the members for
     * @param  {String}          [start]             The principal id to start from (this will not be included in the response)
     * @param  {Number}          [limit]             The number of members to retrieve.
     * @param  {Function}        callback            Standard callback method
     * @param  {Object}          callback.err        Error object containing error code and error message
     * @param  {User[]|Group[]}  callback.members    Array that contains an object for each member. Each object has a role property that contains the role of the member and a profile property that contains the principal profile of the member
     * @throws {Error}                               Error thrown when no content ID has been provided
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Change the members and managers of a content item.
     *
     * @param  {String}       contentId           Content id of the content item we're trying to update the members for
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

        $.ajax({
            'url': '/api/content/'+ contentId + '/members',
            'type': 'POST',
            'data': updatedMembers,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Share a content item.
     *
     * @param  {String}       contentId           Content id of the content item we're trying to share
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Get the content library for a given principal.
     *
     * @param  {String}         principalId         User or group id for who we want to retrieve the content library
     * @param  {String}         [nextToken]         The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the nextToken will be included in the feed from the previous page
     * @param  {Number}         [limit]             The number of content items to retrieve
     * @param  {Function}       callback            Standard callback method
     * @param  {Object}         callback.err        Error object containing error code and error message
     * @param  {Content[]}      callback.results    Array of content items representing the content items present in the library
     * @param  {String}         callback.nextToken  Token that should be used to retrieved the next set of content items in the library
     * @throws {Error}                              Error thrown when no principal ID has been provided
     */
    var getLibrary = exports.getLibrary = function(principalId, start, limit, callback) {
        if (!principalId) {
            throw new Error('A user or group ID should be provided');
        }

        var data = {
            'start': nextToken,
            'limit': limit
        };

        $.ajax({
            'url': '/api/content/library/' + principalId,
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Set the thumbnail URL of a piece of content. For links and Sakai Docs, this will just be a thumbnail representing their type.
     * For uploaded files, we will first check if a thumbnail URL is already set on the back-end side (which will use the generated
     * previews). If this is not present, we add a icon URL based on the file's mimeType
     *
     * @param  {Content}        contentObj          Content object for which to set the thumbnail. This object will be modified to include the thumbnail URL.
     * @api private
     */
    var setThumbnail = function(contentObj) {};

    /**
     * Sets the mime type information on a piece of content, based on the mimetype mapping above.
     * The mime type information will contain the following items:
     *
     * - cssClass: CSS Class that can be used to show a small 16x16 icon
     * - description: Describes the type of content this is
     *
     * Unrecognized content types or mimetypes will default to the 'Other' type.
     *
     * @param  {Content}        contentObj          Content object for which to set the mimetype information. This object will be modified to include the mimetype info.
     * @api private
     */
    var setMimeTypeInfo = function(contentObj) {};

    /**
     * Sets the filesize of a file to be a human readable string. This will only be done for uploaded files, other content items will remain unchanged.
     *
     * @param  {Content}        contentObj          Content object for which to set the readable filesize information. This object will be modified to include the mimetype info.
     * @api private
     */
    var setFileSize = function(contentObj) {};

});
