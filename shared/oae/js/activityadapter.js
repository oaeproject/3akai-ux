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
 * This module exposes logic that adapts a set of activities in the activitystrea.ms format
 * into a friendlier view modal that can be used to render activity streams in the UI, emails, etc..
 *
 * We need to mimick AMD's define so we can use this code in both the backend and frontend.
 *
 * @param  {Object}     exports     Properties that are added on this object are exported
 * @api private
 */
var _expose = function(exports) {

    // Variable that keeps track of the different activity types that are used for comment activities
    var COMMENT_ACTIVITY_TYPES = ['content-comment', 'folder-comment', 'discussion-message'];

    // Variable that keeps track of the different activity types that are used for sharing activities
    var SHARE_ACTIVITY_TYPES = ['content-share', 'discussion-share', 'folder-share'];

    /**
     * Adapt a set of activities in activitystrea.ms format to a simpler view model
     *
     * @param  {String}                 context                                 The ID of the user or group that owns this activity stream
     * @param  {User}                   me                                      The currently loggedin user
     * @param  {Activity[]}             activities                              The set of activities to adapt
     * @param  {Object}                 sanitization                            An object that exposes basic HTML encoding functionality
     * @param  {Function}               sanitization.encodeForHTML              Encode a value such that it is safe to be embedded into an HTML tag
     * @param  {Function}               sanitization.encodeForHTMLAttribute     Encode a value such that it is safe to be embedded into an HTML attribute
     * @param  {Function}               sanitization.encodeForURL               Encode a value such that it is safe to be used as a URL fragment
     * @param  {Object}                 [opts]                                  Optional arguments
     * @param  {String}                 [opts.resourceHrefOverride]             When specified, any `<a href="...">` tag in the generated HTML content will have its `href` attribute rewritten to this value. This can be used to control outbound links in different contexts (e.g., email invitation)
     * @return {ActivityViewModel[]}                                            The adapted activities
     */
    var adapt = exports.adapt = function(context, me, activities, sanitization, opts) {
        return activities.map(function(activity) {
            return _adaptActivity(context, me, activity, sanitization, opts);
        });
    };

    /**
     * Adapt a single activity in activitystrea.ms format to a simpler view model
     *
     * @param  {String}                 context                                 The ID of the user or group that owns this activity stream
     * @param  {User}                   me                                      The currently loggedin user
     * @param  {Activity}               activity                                The activity to adapt
     * @param  {Object}                 sanitization                            An object that exposes basic HTML encoding functionality
     * @param  {Function}               sanitization.encodeForHTML              Encode a value such that it is safe to be embedded into an HTML tag
     * @param  {Function}               sanitization.encodeForHTMLAttribute     Encode a value such that it is safe to be embedded into an HTML attribute
     * @param  {Function}               sanitization.encodeForURL               Encode a value such that it is safe to be used as a URL fragment
     * @param  {Object}                 [opts]                                  Optional arguments
     * @param  {String}                 [opts.resourceHrefOverride]             When specified, this value will replace any URL specified for an entity. This can be used to control outbound links in different contexts (e.g., email invitation)
     * @return {ActivityViewModel}                                              The adapted activity
     * @api private
     */
    var _adaptActivity = function(context, me, activity, sanitization, opts) {
        // Move the relevant items (comments, previews, ..) to the top
        _prepareActivity(me, activity);

        // Generate an i18nable summary for this activity
        var summary = _generateSummary(me, activity, sanitization, opts);

        // Generate the primary actor view
        var primaryActor = _generatePrimaryActor(me, activity);

        // Generate the activity preview items
        var activityItems = _generateActivityPreviewItems(context, activity);

        // Construct the adapted activity
        return new ActivityViewModel(activity, summary, primaryActor, activityItems);
    };


    ////////////
    // Models //
    ////////////

    /**
     * A model that represents an activitystrea.ms activity into an easily consumable format
     *
     * @param {Activity}                activity        The original activity in activitystrea.ms format
     * @param {ActivityViewSummary}     summary         The summary object for this activity
     * @param {ActivityViewItem}        primaryActor    The object that identifies the primary actor
     * @param {ActivityViewItem[]}      activityItems   The activity view items that are included in this activity
     */
    var ActivityViewModel = function(activity, summary, primaryActor, activityItems) {
        var that = {
            'activityItems': activityItems,
            'id': activity['oae:activityId'],
            'originalActivity': activity,
            'published': activity.published,
            'primaryActor': primaryActor,
            'summary': summary
        };
        if (COMMENT_ACTIVITY_TYPES.indexOf(activity['oae:activityType']) !== -1) {
            that.allComments = activity.object['oae:collection'];
            that.latestComments = activity.object.latestComments;
        }

        return that;
    };

    /**
     * A model that holds the necessary data to generate a plain-text summary of an activity
     *
     * @param  {String}     i18nKey         The i18n key that should be used to generate the plain-text summary
     * @param  {Object}     properties      Any properties that can be used in the i18n value
     */
    var ActivityViewSummary = function(i18nKey, properties) {
        var that = {
            'i18nArguments': properties,
            'i18nKey': i18nKey
        };
        return that;
    };

    /**
     * A model that holds the necessary data to generate a beautiful tile
     *
     * @param  {User}               [me]        The currently loggedin user
     * @param  {ActivityEntity}     entity      The entity that should be used to generate the view
     */
    var ActivityViewItem = function(me, entity) {
        var that = {
            'oae:id': entity['oae:id'],
            'id': entity.id,
            'displayName': entity.displayName,
            'profilePath': entity['oae:profilePath'],
            'resourceSubType': entity['oae:resourceSubType'],
            'resourceType': entity.objectType,
            'tenant': entity['oae:tenant'],
            'visibility': entity['oae:visibility']
        };

        // Use the most up-to-date profile picture when available
        if (me && me.id === entity['oae:id'] && me.picture) {
            that.thumbnailUrl = me.picture.medium || me.picture.small;
        } else {
            if (entity.image && entity.image.url) {
                that.thumbnailUrl = entity.image.url;
            }
            if (entity['oae:wideImage'] && entity['oae:wideImage'].url) {
                that.wideImageUrl = entity['oae:wideImage'].url;
            }
            if (entity['oae:mimeType']) {
                that.mime = entity['oae:mimeType'];
            }
        }

        return that;
    };


    //////////////////////////
    // Activity preparation //
    //////////////////////////

    /**
     * Prepare an activity (in-place) in such a way that:
     *  - actors with an image are ordered first
     *  - objects with an image are ordered first
     *  - targets with an image are ordered first
     *  - comments are processed into an ordered set
     *  - each comment is assigned the level in the comment tree
     *
     * @param  {User}       me          The currently loggedin user
     * @param  {Activity}   activity    The activity to prepare
     * @api private
     */
    var _prepareActivity = function(me, activity) {
        // Sort the entity collections based on whether or not they have a thumbnail
        if (activity.actor['oae:collection']) {
            // Reverse the items so the item that was changed last is shown first
            activity.actor['oae:collection'].reverse().sort(_sortEntityCollection);
        }

        if (activity.object && activity.object['oae:collection']) {
            // Reverse the items so the item that was changed last is shown first
            activity.object['oae:collection'].reverse().sort(_sortEntityCollection);
        }

        if (activity.target && activity.target['oae:collection']) {
            // Reverse the items so the item that was changed last is shown first
            activity.target['oae:collection'].reverse().sort(_sortEntityCollection);
        }

        // We process the comments into an ordered set
        if (COMMENT_ACTIVITY_TYPES.indexOf(activity['oae:activityType']) !== -1) {
            var comments = activity.object['oae:collection'];
            if (!comments) {
                comments = [activity.object];
            }
            // Keep track of the full list of comments on the activity. This will be used to check
            // whether or not all comments on the activity have made it into the final ordered list
            var originalComments = comments.slice();

            // Sort the comments based on the created timestamp
            comments.sort(_sortComments);

            // Construct a tree of the last 2 comments and their parents
            var latestComments = _constructLatestCommentTree(comments);

            // Convert these comments into an ordered tree that also includes the comments they were
            // replies to, if any
            var allComments = _constructCommentTree(comments);

            activity.object.objectType = 'comments';
            activity.object['oae:collection'] = allComments;
            activity.object.latestComments = latestComments;
        }
    };

    /**
     * Sort entities based on whether or not they have a thumbnail. Entities with
     * thumbnails will be listed in front of those with no thumbnails, as we give
     * preference to these for UI rendering purposes.
     *
     * @see Array#sort
     * @api private
     */
    var _sortEntityCollection = function(a, b) {
        if (a.image && !b.image) {
            return -1;
        } else if (!a.image && b.image) {
            return 1;
        }
        return 0;
    };

    /**
     * Sort comments based on when they have been created. The comments list will be
     * ordered from new to old.
     *
     * @see Array#sort
     * @api private
     */
    var _sortComments = function(a, b) {
        // Threadkeys will have the following format, primarily to allow for proper thread ordering:
        //  - Top level comments: <createdTimeStamp>|
        //  - Reply: <parentCreatedTimeStamp>#<createdTimeStamp>|
        if (a['oae:threadKey'].split('#').pop() < b['oae:threadKey'].split('#').pop()) {
            return 1;
        } else {
            return -1;
        }
    };

    /**
     * Construct a tree of the last two comments that were made. If these comments
     * were replies, the parent comments will be included in the resulting tree.
     *
     * @param  {Comment[]}  comments    A sorted set of comments where the latest comment can be found at the beginning of the set
     * @return {Comment[]}              A tree of comments for the last two comments (and potentially their parents)
     * @api private
     */
    var _constructLatestCommentTree = function(comments) {
        // This set will hold the last 2 comments (and their parents)
        var latestComments = [];

        // Add the latest comment
        latestComments.push(comments[0]);

        // If the latest comment has a parent, include it
        if (comments[0].inReplyTo) {
            latestComments.push(_findComment(comments, comments[0].inReplyTo));
        }

        // Check the next comment (if any)
        if (comments[1]) {
            // If the next comment is not in the tree yet, we add it. This happens
            // when it's not the parent of the first comment
            if (!_find(latestComments, comments[1]['oae:id'])) {
                latestComments.push(comments[1]);

                // If this comment has a parent that's not in the latestComments
                // set yet, we include it
                if (comments[1].inReplyTo && !_find(latestComments, comments[1].inReplyTo['oae:id'])) {
                    latestComments.push(_findComment(comments, comments[1].inReplyTo));
                }

            // If the next comment was in the tree already, it means that it is
            // the parent of the first comment. It might still have a parent that
            // could be relevant to display in the activity stream though. If that
            // is the case, we will end up with a tree that is 3 levels deep
            } else if (comments[1].inReplyTo && !_find(latestComments, comments[1].inReplyTo['oae:id'])) {
                latestComments.push(_findComment(comments, comments[1].inReplyTo));
            }
        }

        // Construct a comment tree and return it
        return _constructCommentTree(latestComments);
    };

    /**
     * Process a list of comments into an ordered tree that contains the comments they were replies to, if any,
     * as well as the level at which all of these comments need to be rendered.
     *
     * @param  {Comment[]}   comments   The array of comments to turn into an ordered tree
     * @return {Comment[]}              The ordered tree of comments with an `oae:level` property for each comment, representing the level at which they should be rendered
     * @api private
     */
    var _constructCommentTree = function(comments) {
        // Because this method gets called multiple times and there's no good way to deep clone
        // an array of objects in native JS, we ensure that any in-place edits to comment objects
        // in a previous run don't have an impact now
        comments.forEach(function(comment) {
            comment.replies = [];
        });

        // Construct a proper graph wherein each object in the top level array is a comment
        // If a comment has replies they will be made available on the `replies` property
        var commentTree = [];
        comments.forEach(function(comment) {
            // If this comment was a reply to another comment, we try to find that parent comment
            // and add the current comment as a reply to the parent. If the parent could not be found,
            // we add the comment as a top level comment. This can happen when we're rendering a tree
            // of the latest 4 comments for example
            if (comment.inReplyTo) {
                var parent = _find(comments, comment.inReplyTo['oae:id']);
                if (parent) {
                    parent.replies.push(comment);
                } else {
                    commentTree.push(comment);
                }

            // If this comment was not a reply, it's considered a top-level comment
            } else {
                commentTree.push(comment);
            }
        });

        // Now flatten the graph so it can easily be rendered in a TrimPath template
        var flatCommentTree = [];
        _flattenCommentTree(flatCommentTree, commentTree);
        return flatCommentTree;
    };

    /**
     * Walks through the comments graph in `commentTree` in a recursive depth-first manner.
     * Each comment that is encountered is added to the `flatCommentTree` including the level
     * that it should be displayed at.
     *
     * @param  {Object[]}   flatCommentTree             The flattened comment tree
     * @param  {Number}     flatCommentTree[i].level    The level the comment was made at
     * @param  {Comment}    flatCommentTree[i].comment  The comment that was made
     * @param  {Comment[]}  commentTree                 The (nested) graph to walk through
     * @api private
     */
    var _flattenCommentTree = function(flatCommentTree, commentTree, _level) {
        _level = _level || 0;

        // Sort the comments on this level so newest comments are at the top
        commentTree.sort(_sortComments);

        // Visit each comment
        commentTree.forEach(function(comment) {

            // Ensure that the `published` timestamp is a number
            comment.published = parseInt(comment.published, 10);

            // Add the comment to the array
            flatCommentTree.push({
                'level': _level,
                'comment': comment
            });

            // If this comment has any replies, we add those as well
            if (comment.replies) {
                _flattenCommentTree(flatCommentTree, comment.replies, _level + 1);
            }
        });
    };

    /**
     * Check if a set of comments contains a specific comment that is identified by its id
     *
     * @param  {Comment[]}  comments    The set of comments to check
     * @param  {String}     id          The id of the comment to search for
     * @return {Comment}                The comment if it was found, `undefined` otherwise
     * @api private
     */
    var _find = function(comments, id) {
        for (var i = 0; i < comments.length; i++) {
            if (comments[i]['oae:id'] === id) {
                return comments[i];
            }
        }

        return undefined;
    };

    /**
     * Find the full "original" comment object for a comment in a set of comments. If the
     * "original" comment could not be found we return the comment as is. This function
     * is most-useful as an `inReplyTo` object on a comment object does NOT contain its
     * own parent comment. By using this function you will be able to find the "original"
     * node that does include that parent reply.
     *
     * For example, suppose we have the following comment structure:
     *
     * ```
     * - Comment A
     *    - Comment B
     *       - Comment C
     * ```
     *
     * The data returned by the activity stream API would look like this:
     * ```
     * [
     *    {'id': 'A'},
     *    {'id': 'B', 'inReplyTo': {'id': 'A'}}
     *    {'id': 'C', 'inReplyTo': {'id': 'B'}}
     * ]
     * ```
     *
     * If we are to construct a tree by starting with comment C and pushing its
     * `inReplyTo` object into our temporary set, we would lose the information
     * that A is the parent of B. This function will return the full ("original")
     * B object rather than just the C.inReplyTo object.
     *
     * @param  {Comment[]}  comments    The set of comments to find the "original" comment in
     * @param  {Comment}    comment     The comment for which to find the "original" comment
     * @return {Comment}                The "original" comment
     * @api private
     */
    var _findComment = function(comments, comment) {
        // Find the "original" parent comment object
        var originalComment = _find(comments, comment['oae:id']);

        // Return the "original" comment object if there was one
        if (originalComment) {
            return originalComment;

        // It's possible that we can't find the "original" comment object because
        // it expired out of the aggregation cache. In that case we return the comment as is
        } else {
            return comment;
        }
    };


    ////////////////////
    // Activity views //
    ////////////////////

    /**
     * Get the primary view for an activity. This is usually the actor
     * or in case of an aggregated activity, the first in the collection of actors
     *
     * @param  {User}               me          The currently loggedin user
     * @param  {Activity}           activity    The activity for which to return the primary actor
     * @return {ActivityViewItem}               The object that identifies the primary actor
     * @api private
     */
    var _generatePrimaryActor = function(me, activity) {
        var actor = activity.actor;
        if (actor['oae:collection']) {
            actor = actor['oae:collection'][0];
        }

        return new ActivityViewItem(me, actor);
    };

    /**
     * Check whether the current context is involved in a provided actor,
     * object or target
     *
     * @param  {String}                 context             The ID of the user or group that owns this activity stream
     * @param  {Actor|Object|Target}    activityEntity      Activity actor, object or target for which to check if the context is involved
     * @return {Boolean}                                    Whether or not the context is involved in the provided activity entity
     * @api private
     */
    var _isContextInActivityEntities = function(context, activityEntity) {
        var entities = activityEntity['oae:collection'] || [activityEntity];
        for (var entityIndex = 0; entityIndex < entities.length; entityIndex++) {
            if (entities[entityIndex]['oae:id'] === context) {
                return true;
            }
        }

        // The context is not involved in the activity entity
        return false;
    };

    /**
     * Generate the activity preview items for an activity
     *
     * @param  {String}                 context     The ID of the user or group that owns this activity stream
     * @param  {Activity}               activity    The activity for which to generate the views
     * @return {ActivityViewItem[]}                 The activity preview items
     * @api private
     */
    var _generateActivityPreviewItems = function(context, activity) {
        var activityType = activity['oae:activityType'];

        // Comment activities should always show the target as the activity preview
        var previewObj = null;
        if (COMMENT_ACTIVITY_TYPES.indexOf(activityType) !== -1) {
            previewObj = activity.target;
        // Share activities are considered to be a special social activity, where the
        // users and groups the item is shared with are preferred as a preview over
        // the object that is being shared
        } else if (SHARE_ACTIVITY_TYPES.indexOf(activityType) !== -1) {
            previewObj = activity.target;
            // When the current context is part of the target entities, we prefer
            // to use the activity's object as the activity preview instead. This
            // will avoid showing a picture and link for an item in its own context
            if (_isContextInActivityEntities(context, previewObj)) {
                previewObj = activity.object;
            }
        // When a user is accepting an invitation to join target(s), we show the targets, unless the
        // target is the context, in which case we show the user who is accepting the invitation
        } else if (activityType === 'invitation-accept') {
            previewObj = activity.target;

            if (_isContextInActivityEntities(context, previewObj)) {
                previewObj = activity.actor;
            }
        // Otherwise, we always want to show the activity object as the activity preview
        } else if (activity.object) {
            previewObj = activity.object;
            // When the current context is part of the object entities, we prefer
            // to use the activity's target or actor as the activity preview instead.
            // This will avoid showing a picture and link for an item in its own context
            if (_isContextInActivityEntities(context, previewObj)) {
                previewObj = activity.target || activity.actor;
            }
        } else {
            previewObj = activity.actor;
        }

        var previewItems = previewObj['oae:collection'] || [previewObj];
        previewItems = previewItems.map(function(previewItem) {
            return new ActivityViewItem(null, previewItem);
        });

        return previewItems;
    };


    ///////////////
    // Summaries //
    ///////////////

    /**
     * Given a current set of properties, property key and an entity, attach the values for the
     * entity that can be used to render them in the activity template
     *
     * @param  {Object}     properties                              The arbitrary activity summary properties
     * @param  {String}     propertyKey                             The base key for the property (e.g., actor1, actor2, object1, etc...)
     * @param  {Object}     entity                                  The entity for which to create the summary properties
     * @param  {Function}   sanitization.encodeForHTML              Encode a value such that it is safe to be embedded into an HTML tag
     * @param  {Function}   sanitization.encodeForHTMLAttribute     Encode a value such that it is safe to be embedded into an HTML attribute
     * @param  {Function}   sanitization.encodeForURL               Encode a value such that it is safe to be used as a URL fragment
     * @param  {Object}     [opts]                                  Optional arguments
     * @param  {String}     [opts.resourceHrefOverride]             When specified, this value will replace any URL specified for an entity. This can be used to control outbound links in different contexts (e.g., email invitation)
     * @api private
     */
    var _setSummaryPropertiesForEntity = function(properties, propertyKey, entity, sanitization, opts) {
        opts = opts || {};

        var displayNameKey = propertyKey;
        var profilePathKey = propertyKey + 'URL';
        var displayLinkKey = propertyKey + 'Link';
        var tenantDisplayNameKey = propertyKey + 'Tenant';

        // This holds the "display name" of the entity
        properties[displayNameKey] = sanitization.encodeForHTML(entity.displayName);
        properties[profilePathKey] = opts.resourceHrefOverride || entity['oae:profilePath'];

        // If the profile path was set, it indicates that we have access to view the user, therefore
        // we should display a link. If not specified, we should show plain-text
        if (properties[profilePathKey]) {
            properties[displayLinkKey] = '<a href="' + properties[profilePathKey] + '">' + properties[displayNameKey] + '</a>';
        } else {
            properties[displayLinkKey] = '<span>' + properties[displayNameKey] + '</span>';
        }

        if (entity['oae:tenant']) {
            properties[tenantDisplayNameKey] = sanitization.encodeForHTML(entity['oae:tenant'].displayName);
        }
    };

    /**
     * Given an activity, generate an approriate summary
     *
     * @param  {User}                   me                                      The currently loggedin user
     * @param  {Activity}               activity                                The activity for which to generate a summary
     * @param  {Object}                 sanitization                            An object that exposes basic HTML encoding functionality
     * @param  {Function}               sanitization.encodeForHTML              Encode a value such that it is safe to be embedded into an HTML tag
     * @param  {Function}               sanitization.encodeForHTMLAttribute     Encode a value such that it is safe to be embedded into an HTML attribute
     * @param  {Function}               sanitization.encodeForURL               Encode a value such that it is safe to be used as a URL fragment
     * @param  {Object}                 [opts]                                  Optional arguments
     * @param  {String}                 [opts.resourceHrefOverride]             When specified, this value will replace any URL specified for an entity. This can be used to control outbound links in different contexts (e.g., email invitation)
     * @return {ActivityViewSummary}                                            The summary for the given activity
     * @api private
     */
    var _generateSummary = function(me, activity, sanitization, opts) {
        // The dictionary that can be used to translate the dynamic values in the i18n keys
        var properties = {};

        // Prepare the actor-related variables that will be present in the i18n keys
        var actor1Obj = null;
        properties.actorCount = 1;
        if (activity.actor['oae:collection']) {
            actor1Obj = activity.actor['oae:collection'][0];
            if (activity.actor['oae:collection'].length > 1) {
                // Apply the actor count information to the summary properties
                properties.actorCount = activity.actor['oae:collection'].length;
                properties.actorCountMinusOne = properties.actorCount - 1;

                // Apply additional actor information
                _setSummaryPropertiesForEntity(properties, 'actor2', activity.actor['oae:collection'][1], sanitization, opts);
            }
        } else {
            actor1Obj = activity.actor;
        }

        // Apply the actor1 information to the summary properties
        _setSummaryPropertiesForEntity(properties, 'actor1', actor1Obj, sanitization, opts);

        // Prepare the object-related variables that will be present in the i18n keys
        var object1Obj = null;
        properties.objectCount = 1;
        if (activity.object['oae:collection']) {
            object1Obj = activity.object['oae:collection'][0];
            if (activity.object['oae:collection'].length > 1) {
                // Apply the object count information to the summary properties
                properties.objectCount = activity.object['oae:collection'].length;
                properties.objectCountMinusOne = properties.objectCount - 1;

                // Apply additional object information
                _setSummaryPropertiesForEntity(properties, 'object2', activity.object['oae:collection'][1], sanitization, opts);
            }
        } else {
            object1Obj = activity.object;
        }

        // Apply the object1 information to the summary properties
        _setSummaryPropertiesForEntity(properties, 'object1', object1Obj, sanitization, opts);

        // Prepare the target-related variables that will be present in the i18n keys
        var target1Obj = null;
        if (activity.target) {
            properties.targetCount = 1;
            if (activity.target['oae:collection']) {
                target1Obj = activity.target['oae:collection'][0];
                if (activity.target['oae:collection'].length > 1) {
                    // Apply the target count information to the summary properties
                    properties.targetCount = activity.target['oae:collection'].length;
                    properties.targetCountMinusOne = properties.targetCount - 1;

                    // Apply additional target information
                    _setSummaryPropertiesForEntity(properties, 'target2', activity.target['oae:collection'][1], sanitization, opts);
                }
            } else {
                target1Obj = activity.target;
            }

            // Apply the target1 information to the summary properties
            _setSummaryPropertiesForEntity(properties, 'target1', target1Obj, sanitization, opts);
        }

        // Depending on the activity type, we render a different template that is specific to that activity,
        // to make sure that the summary is as accurate and descriptive as possible
        var activityType = activity['oae:activityType'];
        if (activityType === 'content-add-to-library') {
            return _generateContentAddToLibrarySummary(me, activity, properties);
        } else if (activityType === 'content-comment') {
            return _generateContentCommentSummary(me, activity, properties);
        } else if (activityType === 'content-create') {
            return _generateContentCreateSummary(me, activity, properties);
        } else if (activityType === 'content-restored-revision') {
            return _generateContentRestoredRevision(activity, properties);
        } else if (activityType === 'content-revision') {
            return _generateContentRevisionSummary(me, activity, properties);
        } else if (activityType === 'content-share') {
            return _generateContentShareSummary(me, activity, properties);
        } else if (activityType === 'content-update') {
            return _generateContentUpdateSummary(me, activity, properties);
        } else if (activityType === 'content-update-member-role') {
            return _generateContentUpdateMemberRoleSummary(me, activity, properties);
        } else if (activityType === 'content-update-visibility') {
            return _generateContentUpdateVisibilitySummary(me, activity, properties);
        } else if (activityType === 'discussion-add-to-library') {
            return _generateDiscussionAddToLibrarySummary(me, activity, properties);
        } else if (activityType === 'discussion-create') {
            return _generateDiscussionCreateSummary(me, activity, properties);
        } else if (activityType === 'discussion-message') {
            return _generateDiscussionMessageSummary(me, activity, properties);
        } else if (activityType === 'discussion-share') {
            return _generateDiscussionShareSummary(me, activity, properties);
        } else if (activityType === 'discussion-update') {
            return _generateDiscussionUpdateSummary(me, activity, properties);
        } else if (activityType === 'discussion-update-member-role') {
            return _generateDiscussionUpdateMemberRoleSummary(me, activity, properties);
        } else if (activityType === 'discussion-update-visibility') {
            return _generateDiscussionUpdateVisibilitySummary(me, activity, properties);
        } else if (activityType === 'folder-add-to-folder') {
            return _generateFolderAddToFolderSummary(me, activity, properties);
        } else if (activityType === 'folder-add-to-library') {
            return _generateFolderAddToLibrarySummary(me, activity, properties);
        } else if (activityType === 'folder-comment') {
            return _generateFolderCommentSummary(me, activity, properties);
        } else if (activityType === 'folder-create') {
            return _generateFolderCreateSummary(me, activity, properties);
        } else if (activityType === 'folder-share') {
            return _generateFolderShareSummary(me, activity, properties);
        } else if (activityType === 'folder-update') {
            return _generateFolderUpdateSummary(me, activity, properties);
        } else if (activityType === 'folder-update-member-role') {
            return _generateFolderUpdateMemberRoleSummary(me, activity, properties);
        } else if (activityType === 'folder-update-visibility') {
            return _generateFolderUpdateVisibilitySummary(me, activity, properties);
        } else if (activityType === 'following-follow') {
            return _generateFollowingSummary(me, activity, properties);
        } else if (activityType === 'group-add-member') {
            return _generateGroupAddMemberSummary(me, activity, properties);
        } else if (activityType === 'group-create') {
            return _generateGroupCreateSummary(me, activity, properties);
        } else if (activityType === 'group-join') {
            return _generateGroupJoinSummary(me, activity, properties);
        } else if (activityType === 'group-update') {
            return _generateGroupUpdateSummary(me, activity, properties);
        } else if (activityType === 'group-update-member-role') {
            return _generateGroupUpdateMemberRoleSummary(me, activity, properties);
        } else if (activityType === 'group-update-visibility') {
            return _generateGroupUpdateVisibilitySummary(me, activity, properties);
        } else if (activityType === 'invite' || activityType === 'invitation-accept') {
            return _generateInvitationSummary(me, activity, properties);
        } else if (activityType === 'meetup-join') {
            return _generateMeetupJoinSummary(me, activity, properties);
        // Fall back on the default activity summary if no specific template is found for the activity type
        } else {
            return _generateDefaultSummary(me, activity, properties);
        }
    };

    /**
     * Render the end-user friendly, internationalized summary of an activity for which no specific handling is available. This will
     * use the activity verb to construct the summary.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the unrecognized activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateDefaultSummary = function(me, activity, properties) {
        var i18nKey = null;
        properties.verb = activity.verb;
        if (properties.actorCount === 1) {
            i18nKey = '__MSG__ACTIVITY_DEFAULT_1__';
        } else if (properties.actorCount === 2) {
            i18nKey = '__MSG__ACTIVITY_DEFAULT_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_DEFAULT_2+__';
        }

        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of an add to content library activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to content library activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentAddToLibrarySummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (activity.object['oae:resourceSubType'] === 'collabdoc') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_COLLABDOC__';
            } else if (activity.object['oae:resourceSubType'] === 'file') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_FILE__';
            } else if (activity.object['oae:resourceSubType'] === 'link') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_LINK__';
            }
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a content comment activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content comment activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentCommentSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (activity.target['oae:resourceSubType'] === 'collabdoc') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_2+__';
            }
        } else if (activity.target['oae:resourceSubType'] === 'file') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_2+__';
            }
        } else if (activity.target['oae:resourceSubType'] === 'link') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_2+__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a content creation activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content creation activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentCreateSummary = function(me, activity, properties) {
        var i18nKey = null;
        // Add the target to the activity summary when a target is present on the
        // activity and the target is not a user different from the current user
        if (properties.targetCount === 1 && !(activity.target.objectType === 'user' && activity.target['oae:id'] !== me.id)) {
            if (activity.target['oae:id'] === me.id) {
                if (properties.objectCount === 1) {
                    if (activity.object['oae:resourceSubType'] === 'collabdoc') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_YOU__';
                    } else if (activity.object['oae:resourceSubType'] === 'file') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_YOU__';
                    } else if (activity.object['oae:resourceSubType'] === 'link') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_YOU__';
                    }
                } else if (properties.objectCount === 2) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_YOU__';
                }
            } else if (activity.target.objectType === 'folder') {
                if (properties.objectCount === 1) {
                    if (activity.object['oae:resourceSubType'] === 'collabdoc') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_FOLDER__';
                    } else if (activity.object['oae:resourceSubType'] === 'file') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_FOLDER__';
                    } else if (activity.object['oae:resourceSubType'] === 'link') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_FOLDER__';
                    }
                } else if (properties.objectCount === 2) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_FOLDER__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_FOLDER__';
                }
            } else if (activity.target.objectType === 'group') {
                if (properties.objectCount === 1) {
                    if (activity.object['oae:resourceSubType'] === 'collabdoc') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_GROUP__';
                    } else if (activity.object['oae:resourceSubType'] === 'file') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_GROUP__';
                    } else if (activity.object['oae:resourceSubType'] === 'link') {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_GROUP__';
                    }
                } else if (properties.objectCount === 2) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_GROUP__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_GROUP__';
                }
            }
        } else {
            if (properties.objectCount === 1) {
                if (activity.object['oae:resourceSubType'] === 'collabdoc') {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC__';
                } else if (activity.object['oae:resourceSubType'] === 'file') {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE__';
                } else if (activity.object['oae:resourceSubType'] === 'link') {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK__';
                }
            } else if (properties.objectCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a restored content revision activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the restore content revision activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentRestoredRevision = function(activity, properties) {
        var i18nKey = null;
        if (activity.object['oae:resourceSubType'] === 'collabdoc') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_2+__';
            }
        } else if (activity.object['oae:resourceSubType'] === 'file') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_2+__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a new content version activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content revision creation activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentRevisionSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (activity.object['oae:resourceSubType'] === 'collabdoc') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_2+__';
            }
        } else if (activity.object['oae:resourceSubType'] === 'file') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_2+__';
            }
        } else if (activity.object['oae:resourceSubType'] === 'link') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_2+__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a content share activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content share activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentShareSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (activity.object['oae:resourceSubType'] === 'collabdoc') {
                if (properties.targetCount === 1) {
                    if (activity.target['oae:id'] === me.id) {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_YOU__';
                    } else {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_1__';
                    }
                } else if (properties.targetCount === 2) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_2__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_2+__';
                }
            } else if (activity.object['oae:resourceSubType'] === 'file') {
                if (properties.targetCount === 1) {
                   if (activity.target['oae:id'] === me.id) {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_YOU__';
                    } else {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_1__';
                    }
                } else if (properties.targetCount === 2) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_2__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_2+__';
                }
            } else if (activity.object['oae:resourceSubType'] === 'link') {
                if (properties.targetCount === 1) {
                    if (activity.target['oae:id'] === me.id) {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_YOU__';
                    } else {
                        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_1__';
                    }
                } else if (properties.targetCount === 2) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_2__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_2+__';
                }
            }
        } else {
            if (properties.objectCount === 2) {
                if (activity.target['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_YOU_2__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_2__';
                }
            } else {
                if (activity.target['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_YOU_2+__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_2+__';
                }
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a content member role update activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content members update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentUpdateMemberRoleSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (activity.target['oae:resourceSubType'] === 'collabdoc') {
            if (properties.objectCount === 1) {
                if (activity.object['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_1__';
                }
            } else if (properties.objectCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_2+__';
            }
        } else if (activity.target['oae:resourceSubType'] === 'file') {
            if (properties.objectCount === 1) {
               if (activity.object['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_1__';
                }
            } else if (properties.objectCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_2+__';
            }
        } else if (activity.target['oae:resourceSubType'] === 'link') {
            if (properties.objectCount === 1) {
                if (activity.object['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_1__';
                }
            } else if (properties.objectCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_2+__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a content update activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentUpdateSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (activity.object['oae:resourceSubType'] === 'collabdoc') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_2+__';
            }
        } else if (activity.object['oae:resourceSubType'] === 'file') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_2+__';
            }
        } else if (activity.object['oae:resourceSubType'] === 'link') {
            if (properties.actorCount === 1) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_1__';
            } else if (properties.actorCount === 2) {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_2+__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a visibility update activity for content.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content visibility update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateContentUpdateVisibilitySummary = function(me, activity, properties) {
        var i18nKey = null;
        if (activity.object['oae:resourceSubType'] === 'collabdoc') {
            if (activity.object['oae:visibility'] === 'public') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_PUBLIC__';
            } else if (activity.object['oae:visibility'] === 'loggedin') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_LOGGEDIN__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_PRIVATE__';
            }
        } else if (activity.object['oae:resourceSubType'] === 'file') {
            if (activity.object['oae:visibility'] === 'public') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_PUBLIC__';
            } else if (activity.object['oae:visibility'] === 'loggedin') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_LOGGEDIN__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_PRIVATE__';
            }
        } else if (activity.object['oae:resourceSubType'] === 'link') {
            if (activity.object['oae:visibility'] === 'public') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_PUBLIC__';
            } else if (activity.object['oae:visibility'] === 'loggedin') {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_LOGGEDIN__';
            } else {
                i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_PRIVATE__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of an add to library activity for a discussion.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to discussion library activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateDiscussionAddToLibrarySummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY__';
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a discussion creation activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion creation activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateDiscussionCreateSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_1__';
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a discussion post activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion message activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateDiscussionMessageSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.actorCount === 1) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_1__';
        } else if (properties.actorCount === 2) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a discussion share activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion share activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateDiscussionShareSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (properties.targetCount === 1) {
                if (activity.target['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_1__';
                }
            } else if (properties.targetCount === 2) {
                i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_2+__';
            }
        } else {
            if (properties.objectCount === 2) {
                if (activity.target['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2__';
                }
            } else {
                if (activity.target['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2+_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2+__';
                }
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a discussion member role update activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion member update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateDiscussionUpdateMemberRoleSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (activity.object['oae:id'] === me.id) {
                i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_YOU__';
            } else {
                i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_1__';
            }
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a discussion update activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateDiscussionUpdateSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.actorCount === 1) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_1__';
        } else if (properties.actorCount === 2) {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a visibility update activity for a discussion.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion visibility update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateDiscussionUpdateVisibilitySummary = function(me, activity, properties) {
        var i18nKey = null;
        if (activity.object['oae:visibility'] === 'public') {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_PUBLIC__';
        } else if (activity.object['oae:visibility'] === 'loggedin') {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_LOGGEDIN__';
        } else {
            i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_PRIVATE__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of an add to folder activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to folder activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFolderAddToFolderSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (activity.object['oae:resourceSubType'] === 'collabdoc') {
                i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_COLLABDOC__';
            } else if (activity.object['oae:resourceSubType'] === 'file') {
                i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_FILE__';
            } else if (activity.object['oae:resourceSubType'] === 'link') {
                i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_LINK__';
            }
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of an add to library activity for a folder.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to folder library activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFolderAddToLibrarySummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY__';
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a folder comment activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder comment activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFolderCommentSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.actorCount === 1) {
            i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_1__';
        } else if (properties.actorCount === 2) {
            i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a folder creation activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder creation activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFolderCreateSummary = function(me, activity, properties) {
        var i18nKey = null;
        // Add the target to the activity summary when a target is present on the
        // activity and the target is not a user different from the current user
        if (properties.targetCount === 1 && !(activity.target.objectType === 'user' && activity.target['oae:id'] !== me.id)) {
            if (activity.target['oae:id'] === me.id) {
                if (properties.objectCount === 1) {
                    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1_YOU__';
                } else if (properties.objectCount === 2) {
                    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+_YOU__';
                }
            } else if (activity.target.objectType === 'group') {
                if (properties.objectCount === 1) {
                    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1_GROUP__';
                } else if (properties.objectCount === 2) {
                    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2_GROUP__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+_GROUP__';
                }
            }
        } else {
            if (properties.objectCount === 1) {
                i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1__';
            } else if (properties.objectCount === 2) {
                i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a folder share activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder share activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFolderShareSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (properties.targetCount === 1) {
                if (activity.target['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_1__';
                }
            } else if (properties.targetCount === 2) {
                i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_2+__';
            }
        } else {
            if (properties.objectCount === 2) {
                if (activity.target['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2__';
                }
            } else {
                if (activity.target['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2+_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2+__';
                }
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a folder update activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFolderUpdateSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.actorCount === 1) {
            i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_1__';
        } else if (properties.actorCount === 2) {
            i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a folder member role update activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder member update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFolderUpdateMemberRoleSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (activity.object['oae:id'] === me.id) {
                i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_YOU__';
            } else {
                i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_1__';
            }
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a visibility update activity for a folder.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder visibility update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFolderUpdateVisibilitySummary = function(me, activity, properties) {
        var i18nKey = null;
        if (activity.object['oae:visibility'] === 'public') {
            i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_PUBLIC__';
        } else if (activity.object['oae:visibility'] === 'loggedin') {
            i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_LOGGEDIN__';
        } else {
            i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_PRIVATE__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of an update for a user following another user
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the following activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateFollowingSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.actorCount > 1) {
            if (properties.actorCount === 2) {
                if (activity.object['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_FOLLOWING_2_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_FOLLOWING_2_1__';
                }
            } else {
                if (activity.object['oae:id'] === me.id) {
                    i18nKey = '__MSG__ACTIVITY_FOLLOWING_2+_YOU__';
                } else {
                    i18nKey = '__MSG__ACTIVITY_FOLLOWING_2+_1__';
                }
            }
        } else if (properties.objectCount > 1) {
            if (properties.objectCount === 2) {
                i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_2__';
            } else {
                i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_2+__';
            }
        } else {
            if (activity.object['oae:id'] === me.id) {
                i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_YOU__';
            } else {
                i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_1__';
            }
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a group member add activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add group member activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateGroupAddMemberSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (activity.object['oae:id'] === me.id) {
                i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_YOU__';
            } else {
                i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_1__';
            }
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a group member role update activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group member update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateGroupUpdateMemberRoleSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            if (activity.object['oae:id'] === me.id) {
                i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_YOU__';
            } else {
                i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_1__';
            }
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a group creation activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group creation activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateGroupCreateSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.objectCount === 1) {
            i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_1__';
        } else if (properties.objectCount === 2) {
            i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a group join activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group join activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateGroupJoinSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.actorCount === 1) {
            i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_1__';
        } else if (properties.actorCount === 2) {
            i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a group update activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateGroupUpdateSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.actorCount === 1) {
            i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_1__';
        } else if (properties.actorCount === 2) {
            i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a visibility update activity for a group.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group visibility update activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateGroupUpdateVisibilitySummary = function(me, activity, properties) {
        var i18nKey = null;
        if (activity.object['oae:visibility'] === 'public') {
            i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_PUBLIC__';
        } else if (activity.object['oae:visibility'] === 'loggedin') {
            i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_LOGGEDIN__';
        } else {
            i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_PRIVATE__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary related to invitation activities. The
     * blueprint for the invitation activity should be of the form:
     *
     *  * Only one actor
     *  * Only one object, it must be a user (either who is invited, or who is accepting)
     *  * Multiple targets of the same resource type (either the resources to which a user is being
     *    invited, or is accepting an invitation)
     *
     * The resulting summary will have the standard actor/object/target properties, as well as a
     * summary i18n key of the form:
     *
     *  `ACTIVITY_${activityLabel}_${whoLabel}_${resourceType}_${numTargets}`
     *
     * Which renders all the following i18n key possibilities:
     *
     *  * ACTIVITY_INVITE_COLLABDOC_1
     *  * ACTIVITY_INVITE_FILE_1
     *  * ACTIVITY_INVITE_LINK_1
     *  * ACTIVITY_INVITE_CONTENT_2
     *  * ACTIVITY_INVITE_CONTENT_2+
     *  * ACTIVITY_INVITE_DISCUSSION_1
     *  * ACTIVITY_INVITE_DISCUSSION_2
     *  * ACTIVITY_INVITE_DISCUSSION_2+
     *  * ACTIVITY_INVITE_FOLDER_1
     *  * ACTIVITY_INVITE_FOLDER_2
     *  * ACTIVITY_INVITE_FOLDER_2+
     *  * ACTIVITY_INVITE_GROUP_1
     *  * ACTIVITY_INVITE_GROUP_2
     *  * ACTIVITY_INVITE_GROUP_2+
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_COLLABDOC_1
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FILE_1
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_LINK_1
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_CONTENT_2
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_CONTENT_2+
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_1
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_2
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_2+
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_1
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_2
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_2+
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_1
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_2
     *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_2+
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_COLLABDOC_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FILE_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_LINK_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_CONTENT_2
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_CONTENT_2+
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_2
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_2+
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_2
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_2+
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_2
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_2+
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_COLLABDOC_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FILE_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_LINK_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_CONTENT_2
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_CONTENT_2+
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_2
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_2+
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_2
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_2+
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_1
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_2
     *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_2+
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the invite activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateInvitationSummary = function(me, activity, properties) {
        var labels = ['ACTIVITY'];
        var activityType = activity['oae:activityType'];
        var actorId = activity.actor['oae:id'];
        var objectId = activity.object['oae:id'];

        if (activityType === 'invite') {
            labels.push('INVITE');
        } else if (activityType === 'invitation-accept') {
            labels.push('INVITATION_ACCEPT');

            // Find the "who" label, which indicates if the current user in context is either the
            // inviter or the invited user. When that is the case, we alter the language to be in
            // the form "You"/"Your" as opposed to the display name of the user. This is only
            // applicable for the invitation accept activity because the invite is only seen by the
            // user who was invited
            if (me.id === actorId) {
                labels.push('YOU_OTHER');
            } else if (me.id === objectId) {
                labels.push('OTHER_YOU');
            } else {
                labels.push('OTHER_OTHER');
            }
        } else {
            throw new Error('Invalid activity type provided for invitation activity: ' + activityType);
        }

        // Find the count label
        var countLabel = properties.targetCount;
        if (countLabel > 2) {
            countLabel = '2+';
        }

        // Find any target object so we can inspect its `objectType` or `resourceSubType`
        var target = null;
        if (countLabel === 1) {
            target = activity.target;
        } else {
            target = activity.target['oae:collection'][0];
        }

        // Find the type label (e.g., LINK, DISCUSSION, GROUP, etc...)
        var typeLabel = target.objectType.toUpperCase();
        if (typeLabel === 'CONTENT' && countLabel === 1) {
            typeLabel = target['oae:resourceSubType'].toUpperCase();
        }

        // Gather the rest of the labels together to form the i18n key
        labels.push(typeLabel);
        labels.push(countLabel);

        // Generate the activity i18n key according to the labels we determined
        var i18nKey = '__MSG__' + labels.join('_') + '__';

        return new ActivityViewSummary(i18nKey, properties);
    };

    /**
     * Render the end-user friendly, internationalized summary of a meetup join activity.
     *
     * @param  {User}                   me              The currently loggedin user
     * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meetup join activity, for which to generate the activity summary
     * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
     * @return {ActivityViewSummary}                    A summary object
     * @api private
     */
    var _generateMeetupJoinSummary = function(me, activity, properties) {
        var i18nKey = null;
        if (properties.actorCount === 1) {
            i18nKey = '__MSG__ACTIVITY_MEETUP_JOIN_1__';
        } else if (properties.actorCount === 2) {
            i18nKey = '__MSG__ACTIVITY_MEETUP_JOIN_2__';
        } else {
            i18nKey = '__MSG__ACTIVITY_MEETUP_JOIN_2+__';
        }
        return new ActivityViewSummary(i18nKey, properties);
    };
};

(function() {
    if (typeof define !== 'function') {
        // This gets executed in the backend
        _expose(module.exports);
    } else {
        // This gets executed in the browser
        define(['exports'], _expose);
    }
})();
