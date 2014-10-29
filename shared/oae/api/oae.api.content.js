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

define(['exports', 'jquery', 'underscore', 'oae.api.i18n', 'mimetypes'], function(exports, $, _, i18nAPI, MimeTypes) {

    /**
     * Get a full content profile
     *
     * @param  {String}       contentId           Id of the content item we're trying to retrieve
     * @param  {Function}     callback            Standard callback function
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
     * @param  {Function}     callback            Standard callback function
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
     * Create a new link
     *
     * @param  {String}         displayName         Display title for the created link
     * @param  {String}         [description]       The link's description
     * @param  {String}         [visibility]        The link's visibility. This can be public, loggedin or private
     * @param  {String}         link                The URL that should be stored against this link
     * @param  {String[]}       [managers]          Array of user/group ids that should be added as managers to the link
     * @param  {String[]}       [viewers]           Array of user/group ids that should be added as viewers to the link
     * @param  {String[]}       [folders]           Array of folder ids to which the link should be added
     * @param  {Function}       [callback]          Standard callback function
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @param  {Content}        [callback.content]  Content object representing the created link
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var createLink = exports.createLink = function(displayName, description, visibility, link, managers, viewers, folders, callback) {
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
            'viewers': viewers,
            'folders': folders
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
     * Create a new file
     *
     * @param  {String}             displayName         Display title for the created file
     * @param  {String}             [description]       The file's description
     * @param  {String}             [visibility]        The file's visibility. This can be public, loggedin or private
     * @param  {Element|String}     $fileUploadField    jQuery element or selector for that jQuery element representing the file upload form field that has been used to initialise jQuery.fileupload
     * @param  {Object}             file                jQuery.fileUpload object that was returned when selecting the file that needed to be uploaded
     * @param  {String[]}           [managers]          Array of user/group ids that should be added as managers to the file
     * @param  {String[]}           [viewers]           Array of user/group ids that should be added as viewers to the file
     * @param  {String[]}           [folders]           Array of folder ids to which the file should be added
     * @param  {Function}           [callback]          Standard callback function
     * @param  {Object}             [callback.err]      Error object containing error code and error message
     * @param  {Content}            [callback.content]  Content object representing the created file
     * @throws {Error}                                  Error thrown when not all of the required parameters have been provided
     */
    var createFile = exports.createFile = function(displayName, description, visibility, $fileUploadField, file, managers, viewers, folders, callback) {
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

        // Add the folders as an array
        folders = folders || [];
        $.each(folders, function(index, folder) {
            data.push({'name': 'folders', 'value': folder});
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
     * Upload a new version of a file
     *
     * @param  {Element|String}     $fileUploadField    jQuery element or selector for that jQuery element representing the file upload form field that has been used to initialise jQuery.fileupload
     * @param  {Object}             file                jQuery.fileUpload object that was returned when selecting the file that needed to be uploaded
     * @param  {Function}           [callback]          Standard callback function
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
     * Create a new collaborative document
     *
     * @param  {String}       displayName         Display title for the created collaborative document
     * @param  {String}       [description]       The collaborative document's description
     * @param  {String}       [visibility]        The collaborative document's visibility. This can be public, loggedin or private
     * @param  {String[]}     [managers]          Array of user/group ids that should be added as managers to the collaborative document
     * @param  {String[]}     [viewers]           Array of user/group ids that should be added as viewers to the collaborative document
     * @param  {String[]}     [folders]           Array of folder ids to which the collaborative document should be added
     * @param  {Function}     [callback]          Standard callback function
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @param  {Content}      [callback.content]  Content object representing the created collaborative document
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var createCollabDoc = exports.createCollabDoc = function(displayName, description, visibility, managers, viewers, folders, callback) {
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
            'viewers': viewers,
            'folders': folders
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
     * @param  {Function}     [callback]            Standard callback function
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
     * @param  {Function}     [callback]          Standard callback function
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
     * @param  {Function}      [callback]            Standard callback function
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
     * Get the viewers and managers of a content item
     *
     * @param  {String}          contentId                      Id of the content item we're trying to retrieve the members for
     * @param  {String}          [start]                        The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}          [limit]                        The number of members to retrieve
     * @param  {Function}        callback                       Standard callback function
     * @param  {Object}          callback.err                   Error object containing error code and error message
     * @param  {Object}          callback.members               Response object containing the content members and nextToken
     * @param  {User[]|Group[]}  callback.members.results       Array that contains an object for each member. Each object has a role property that contains the role of the member and a profile property that contains the principal profile of the member
     * @param  {String}          callback.members.nextToken     The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no content id has been provided
     */
    var getMembers = exports.getMembers = function(contentId, start, limit, callback) {
        if (!contentId) {
            throw new Error('A content id should be provided');
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
     * Change the members and managers of a content item
     *
     * @param  {String}       contentId           Id of the content item we're trying to update the members for
     * @param  {Object}       updatedMembers      JSON Object where the keys are the user/group ids we want to update membership for, and the values are the roles these members should get (manager or viewer). If false is passed in as a role, the principal will be removed as a member
     * @param  {Function}     [callback]          Standard callback function
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var updateMembers = exports.updateMembers = function(contentId, updatedMembers, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        } else if (!updatedMembers || _.keys(updatedMembers).length === 0) {
            throw new Error('The updatedMembers hash should contain at least 1 update');
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
     * Share a content item
     *
     * @param  {String}       contentId           Id of the content item we're trying to share
     * @param  {String[]}     principals          Array of principal ids with who the content should be shared
     * @param  {Function}     [callback]          Standard callback function
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when no content id or Array of principal ids has been provided
     */
    var shareContent = exports.shareContent = function(contentId, principals, callback) {
        if (!contentId) {
            throw new Error('A content id should be provided');
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
     * Get the content library for a given principal
     *
     * @param  {String}         principalId                     User or group id for who we want to retrieve the content library
     * @param  {String}         [start]                         The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}         [limit]                         The number of content items to retrieve
     * @param  {Function}       callback                        Standard callback function
     * @param  {Object}         callback.err                    Error object containing error code and error message
     * @param  {Object}         callback.content                Response object containing the content items in the requested library and nextToken
     * @param  {Content[]}      callback.content.results        Array of content items representing the content items present in the library
     * @param  {String}         callback.content.nextToken      The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no principal id has been provided
     */
    var getLibrary = exports.getLibrary = function(principalId, start, limit, callback) {
        if (!principalId) {
            throw new Error('A user or group id should be provided');
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
     * Delete a piece of content from a content library
     *
     * @param  {String}         principalId       User or group id for for the library from which we want to delete the content
     * @param  {String}         contentId         Id of the content item we're trying to delete from the library
     * @param  {Function}       [callback]        Standard callback function
     * @param  {Object}         [callback.err]    Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var deleteContentFromLibrary = exports.deleteContentFromLibrary = function(principalId, contentId, callback) {
        if (!principalId) {
            throw new Error('A valid user or group id should be provided');
        } else if (!contentId) {
            throw new Error('A valid content id should be provided');
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

    /**
     * Get a human readable mimeType description for a content item.
     * Unrecognized mimeTypes will default to the `other` type
     *
     * @param  {Content}       contentObj       Content object for which to get the mimetype description
     * @return {String}                         Human readable mimeType description for the provided content item
     */
    var getMimeTypeDescription = exports.getMimeTypeDescription = function(contentObj) {
        // Return the mime type description, translated into the user's language
        var description = MimeTypes.getDescription(contentObj.resourceSubType, contentObj.mime);
        return i18nAPI.translate(description);
    };
});
