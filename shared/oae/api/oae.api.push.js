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

define(['exports', 'jquery', 'underscore', 'oae.api.util', 'sockjs'], function(exports, $, _, utilAPI) {

    // Constant that defines the rules that should be followed for aggregating incoming activities.
    // Push notifications can be requested to be provided as activities following the activitystrea.ms
    // specification (@see http://activitystrea.ms). As all push notifications will come in as individual
    // activities, there is a need to do some basic aggregation (e.g. otherwise uploading multiple files
    // at the same time would generate individual activities in recent activity). Each aggregation rule is
    // defined for a certain activity type. The aggregation rules define the fields of the activity that
    // should match with those fields on a different activity before both activities can be aggregated into
    // one activity
    var AGGREGATION_RULES = {
        'content-comment': ['target'],
        'content-create': ['actor'],
        'content-revision': ['object'],
        'content-share': ['actor'],
        'discussion-message': ['target'],
        'folder-add-to-folder': ['target']
    };

    // Time in milliseconds during which aggregatable activities should be aggregated before calling
    // the registered message callback functions. Whenever a new aggregatable activity comes in, the
    // existing timeout will be reset and a new one will start for the configured timeout delay
    var AGGREGATION_TIMEOUT = 1000;

    // Variable that keeps track of whether or not the websocket has been
    // initialized, connected and authenticated successfully
    var websocketEstablished = false;

    // Variable that keeps track of all messages that need to be sent over the
    // websocket, but came in whilst the websocket connection wasn't established yet.
    // Once the connection is established, all of these message will be sent over
    var deferredMessages = [];

    // Variable that keeps track of the acknowledgement callback functions for each of the
    // messages that have been sent over the websocket. As websockets are asynchronous, we
    // have to keep track of this until a response has been received for a message as we can't
    // rely on the order of the responses coming in. Once an acknowledgement for a message has
    // come in, its acknowledgement callback function will be executed and removed from this map
    var acknowledgementCallbacks = {};

    // Variable that keeps track of the message listeners that have registered for messages on a
    // specific channel with a specific stream type for a specific format (`activitystreams` or
    // `internal`), indicating whether or not the messages should be aggregated. When a message
    // comes in, all of the provided callback functions need to be called.
    // The listeners for the subscriptions will be stored in the following way:
    //
    //   {
    //      '<channel>': {
    //          '<streamType>': {
    //              '<format>': [
    //                  {
    //                      'performAggregation': <true/false>,
    //                      'messageCallback': <messageCallback>
    //                  },
    //                  ...
    //              ]
    //          },
    //          ...
    //      },
    //      ...
    //   }
    var subscriptions = {};

    // Variable that keeps track of the aggregated activities per activity stream.
    //
    //   {
    //      '<resourceId>': {
    //          '<streamType>': [<Activity 1>, <Activity 2>, ..]
    //          ...
    //      },
    //      ...
    //   }
    var activities = {};

    // Variable that keeps track of the timeouts per resource and stream type
    var timers = {};

    /**
     * Initialize all push notification functionality by establishing the websocket connection
     * and authenticating. SockJS is used to provide a cross-browser and cross-domain communication
     * channel between the browser and the server (@see https://github.com/sockjs)
     *
     * @param  {Function}   callback      Standard callback function
     * @param  {Object}     callback.err  Error object containing error code and message
     * @api private
     */
    var init = exports.init = function(callback) {
        // Push notifications are only enabled for authenticated users
        if (require('oae.core').data.me.anon) {
            return callback();
        }

        // Set up the websocket that will be used for the push notifications
        sockjs = new SockJS('/api/push', {
            'protocols_whitelist': ['websocket']
        });

        // Bind the event handlers that will be called when the websocket
        // connection has been established and when new incoming messages arrive
        sockjs.onopen = authenticateSocket;
        sockjs.onmessage = incomingMessage;

        callback();
    };

    /**
     * Function that is called when the websocket connection has been established successfully.
     * The websocket is authenticated and any messages that were received before the connection
     * was established are submitted over the websocket.
     *
     * @throws {Error}                     Error thrown when the websocket could not be authenticated
     * @api private
     */
    var authenticateSocket = function() {
        // Get the me object for the current user
        var me = require('oae.core').data.me;

        // Authenticate the websocket
        sendMessage('authentication', {'userId': me.id, 'tenantAlias': me.tenant.alias, 'signature': me.signature }, function(err) {
            if (err) {
                throw new Error('Could not authenticate the websocket');
            }

            // Indicate that the connection and authentication was successful
            websocketEstablished = true;

            // Send all messages that were received before the websocket connection was established
            _.each(deferredMessages, function(message) {
                sendMessage(message.name, message.payload, message.callback);
            });
        });
    };

    /**
     * Function that is called when a new incoming message arrives over the established websocket.
     * These can either be acknowledgement messages following a message sent by the client, or actual
     * push notifications from the server.
     *
     * @param  {Object}         ev        Received SockJS event
     * @throws {Error}                    Error thrown when the incoming message could not be parsed
     * @api private
     */
    var incomingMessage = function(ev) {
        // Parse the incoming message
        var message = null;
        try {
            message = JSON.parse(ev.data);
        } catch (err) {
            throw new Error('Could not parse incoming websocket message');
        }

        // The message is a proper push notification. In this case, we notify all places
        // that have subscribed to the resource channel the event was sent over and the
        // associated stream type
        if (message.resourceId && message.streamType) {
            notifySubscribers(message);
        // The message is an acknowledgement message. In this case, the original message's
        // acknowledgement callback function is executed
        } else if (acknowledgementCallbacks[message.replyTo]) {
            acknowledgementCallbacks[message.replyTo](message);
        }
    };

    /**
     * Subscribe to all messages on a specific channel for a specific stream type and the specified format
     *
     * @param  {String}         resourceId                      Id of the resource on which channel to subscribe (e.g. user id, group id, content id, discussion id)
     * @param  {String}         streamType                      Name of the stream type to subscribe to (e.g. `activity`, `message`)
     * @param  {String}         token                           Token used to authorize the subscription. This token will be available on the entity that represents the channel that's being subscribed to
     * @param  {String}         [transformer]                   The format in which the activity entities should be received. When `internal` is provided, the entities will be formatted as standard OAE entities. When `activitystreams` is provided, the entities will be formatted as defined by the activitystrea.ms specification. Defaults to `internal`
     * @param  {Boolean}        [performInlineAggregation]      Whether or not activities within the same message should be aggregated. Defaults to `false`
     * @param  {Boolean}        [performFullAggregation]        Whether or not activities from new messages should be aggregated with activities from older messages. If `true` a small delay will be introduced to allow for new messages to come in that could potentially be aggregated with. Defaults to `false`
     * @param  {Function}       messageCallback                 Function executed when a message on the provided channel and of the provided stream type arrives
     * @param  {Activity[]}     messageCallback.activities      The activities that arrived over the websocket. For streams that push out activities on routing there will only be 1 activity
     * @param  {Object}         messageCallback.message         The message that came in over the websocket. The `activities` key will have been modified to contain the aggregated activities
     * @param  {Function}       [callback]                      Standard callback function
     * @param  {Object}         [callback.err]                  Error object containing error code and message
     */
    var subscribe = exports.subscribe = function(resourceId, streamType, token, transformer, performInlineAggregation, performFullAggregation, messageCallback, callback) {
        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        // Default the transformer to `internal`
        transformer = transformer || 'internal';

        // Check if there is already a subscription for the provided channel and stream type.
        // If there is, we add an additional listener
        if (subscriptions[resourceId] && subscriptions[resourceId][streamType] && subscriptions[resourceId][streamType][transformer]) {
            subscriptions[resourceId][streamType][transformer].push({
                'performInlineAggregation': performInlineAggregation,
                'performFullAggregation': performFullAggregation,
                'messageCallback': messageCallback
            });
            return callback();
        }

        // Register the listener
        subscriptions[resourceId] = subscriptions[resourceId] || {};
        subscriptions[resourceId][streamType] = subscriptions[resourceId][streamType] || {};
        subscriptions[resourceId][streamType][transformer] = [{
            'performInlineAggregation': performInlineAggregation,
            'performFullAggregation': performFullAggregation,
            'messageCallback': messageCallback
        }];

        // Construct the subscription request
        var name = 'subscribe';
        var payload = {
            'format': transformer,
            'stream': {
                'resourceId': resourceId,
                'streamType': streamType
            },
            'token': token
        };

        // If the websocket has not been established yet, the subscription is queued until
        // it has been established
        if (!websocketEstablished) {
            deferredMessages.push({'name': name, 'payload': payload, 'callback': callback});
        // Subscribe straight away when the websocket has already been successfully established
        } else {
            sendMessage(name, payload, callback);
        }
    };

    /**
     * Reset aggregation for an activity stream
     *
     * @param  {String}     resourceId      The id of the resource
     * @param  {String}     streamType      The stream for wich to reset the aggregation process. For example, `activity` or `notification`
     */
    var resetAggregation = exports.resetAggregation = function(resourceId, streamType) {
        if (activities[resourceId] && activities[resourceId][streamType]) {
            delete activities[resourceId][streamType];
        }
    };

    /**
     * Notify all subscribers that have subscribed to push notifications on the message's resource
     * channel and the message's stream type. Aggregation is done only for the listeners that have requested
     * aggregation. For those that haven't requested aggregation, the messages will be sent as received
     *
     * @param  {Object}     message                 Push notification message for which the containing activity will be delivered to its subscribers
     * @api private
     */
    var notifySubscribers = function(message) {
        var listenersNeedingAggregations = [];

        // Run through all subscription for the provided resource, stream type and format
        if (subscriptions[message.resourceId] && subscriptions[message.resourceId][message.streamType] && subscriptions[message.resourceId][message.streamType][message.format]) {
            _.each(subscriptions[message.resourceId][message.streamType][message.format], function(listener) {
                // Check if the activity that is associated to the push notification requires
                // aggregation. If it doesn't, it can be distributed to its subscribers straight away
                if (listener.performFullAggregation) {
                    listenersNeedingAggregations.push(listener);
                } else {
                    // A copy of the activities is returned to the listener to avoid
                    // modifications by their post-processing messing up later deliveries
                    var copiedMessage = copyMessage(message, activities);
                    var activities = copiedMessage.activities;

                    // Aggregate the activities within this message if required
                    if (listener.performInlineAggregation) {
                        activities = aggregateActivities(activities);
                    }

                    // Pass the activities and the message on to the listener
                    listener.messageCallback(activities, copiedMessage);
                }
            });
        }

        if (listenersNeedingAggregations.length > 0) {
            // Perform the aggregation once
            aggregateMessages(message, function(activities) {
                // Distribute it to each listener
                _.each(listenersNeedingAggregations, function(listener) {
                    // A copy of the activities is returned to the listener to avoid
                    // modifications in the activities hash by their post-processing
                    var copiedMessage = copyMessage(message, activities);
                    listener.messageCallback(copiedMessage.activities, copiedMessage);
                });
            });
        }
    };

    /**
     * Create a copy of a push message and overlay an array of activities
     *
     * @param  {Object}         message         The message to copy
     * @param  {Activity[]}     activities      The set of activities that should be overlayed on `message.activities`
     * @return {Object}                         A deep copy of the message
     * @api private
     */
    var copyMessage = function(message, activities) {
        return $.extend(true, {}, message, {'activities': activities});
    };

    /**
     * Aggregate the activity on a message with other activities of the same activity type and
     * equal activity fields (`actor`, `object`, `target`) as defined in the aggregation rules.
     * Aggregation is only done within the same channel and stream type. The subscribers to these
     * activities will only receive the aggregated activity after a configured amount of time, to
     * make sure that aggregatable activities that arrive within that period of time are aggregated
     * instead of delivered individually.
     *
     * UI activity aggregation is a simple two-step process:
     *  1.  Inline aggregation
     *      The activities within 1 messages are aggregated. For example,
     *      say Alice uploads 2 files and shares them with Bob. Bob will
     *      receive a notification containing 2 activities. In this phase,
     *      the activities will be aggregated into 1 activity with a collection
     *      of 2 content objects
     *
     *  2.  Full aggregation
     *      The activities from the inline aggregation phase are aggregated
     *      with activities that were seen in previous messages for this stream. 
     *
     * @param  {Object}     message                         Push notification message for which the activities need to be aggregated
     * @param  {Function}   callback                        Standard callback function
     * @param  {Object}     callback.aggregatedMessage      The aggregated message
     * @api private
     */
    var aggregateMessages = function(message, callback) {
        // Only aggregate activities within the same channel and stream type
        var resourceId = message.resourceId;
        var streamType = message.streamType;

        timers[resourceId] = timers[resourceId] || {};
        timers[resourceId][streamType] = timers[resourceId][streamType] || {};
        activities[resourceId] = activities[resourceId] || {};
        activities[resourceId][streamType] = activities[resourceId][streamType] || [];

        // Cancel the existing aggregate timeout
        clearTimeout(timers[resourceId][streamType]);

        // Aggregate all the activities within the message
        var inlineAggregatedActivities = aggregateActivities(message.activities);

        // The set of activities we'll pass back to the caller depends on whether
        // we've already seen activities or not
        var aggregatedActivities = null;

        // If we've seen activities previously, we need to to aggregate the new activities
        // with those previously seen activities
        if (!_.isEmpty(activities[resourceId][streamType])) {
            // Get the activities we've already seen who can aggregate with activities
            // from our message.
            var oldActivitiesOfSameType = _.filter(activities[resourceId][streamType], function(oldActivity) {
                var messageContainsActivityOfSameType = _.find(inlineAggregatedActivities, function(messageActivity) {
                    return canAggregate(oldActivity, messageActivity);
                });
                return _.isObject(messageContainsActivityOfSameType);
            });

            // Aggregate the two sets of activities. The `aggreateActivities` function
            // will inline any activities into the `oldActivitiesOfSameType` set. Because
            // these activities are passed by reference, the global `activities` object
            // that contains the activities per activity stream will be updated as well
            aggregatedActivities = aggregateActivities(oldActivitiesOfSameType.concat(inlineAggregatedActivities));

            // We now roll in our aggregated activities with *all* the activities of our
            // activity stream. Rather than unpicking which new activities aggregated with
            // which old activities or which activities are "new" in this stream, we just
            // concatenate both sets of activities and aggregate them. This shouldn't result
            // in duplicate entities as the aggregator only retains unique values
            var allActivities = activities[resourceId][streamType].concat(aggregatedActivities.slice());
            activities[resourceId][streamType] = aggregateActivities(allActivities);
        } else {
            // As we haven't seen any activities for this stream yet, we just pass back
            // the inline aggregated activities
            aggregatedActivities = inlineAggregatedActivities;

            // We retain the inline aggregated activities for later aggregation
            activities[resourceId][streamType] = inlineAggregatedActivities;
        }

        // We wait a little bit before returing to the caller so we can aggregate with
        // activities from messages that will arrive later
        timers[resourceId][streamType] = setTimeout(function() {
            return callback(aggregatedActivities);
        }, AGGREGATION_TIMEOUT);
    };

    /**
     * Aggregate activities within a set of activities
     *
     * @param  {Activity[]}     activities      The array of activities that should be aggreated. This operation is destructive to that array
     * @return {Activity[]}                     A new array with aggregated activities
     * @api private
     */
    var aggregateActivities = exports.aggregateActivities = function(activities) {
        // Will contain the aggregated array
        var aggregatedActivities = [];

        // Iterate over the given array and try to aggregate them in our `aggregatedActivities` array
        while (activities.length > 0) {
            var activity = activities.shift();

            // If we don't have any defined aggregation rules for this activity type,
            // we can skip it and add it as-is
            if (!AGGREGATION_RULES[activity['oae:activityType']]) {
                aggregatedActivities.push(activity);
                continue;
            }

            // Check if it can be aggregated with an activity we've previously dealt with
            var aggregatedWithActivity = false;
            for (var i = 0; i < aggregatedActivities.length; i++) {
                if (canAggregate(activity, aggregatedActivities[i])) {
                    aggregatedWithActivity = true;
                    addEntities(aggregatedActivities[i], activity, 'actor');
                    addEntities(aggregatedActivities[i], activity, 'object');
                    addEntities(aggregatedActivities[i], activity, 'target');
                    aggregatedActivities[i].published = activity.published;

                    // The activity has been aggregated, we can break out of this for-loop
                    break;
                }
            }

            // If the activity didn't aggregate with one in the array, we just push it in
            if (!aggregatedWithActivity) {
                aggregatedActivities.push(activity);
            }
        }

        return aggregatedActivities;
    };

    /**
     * Checks if two activities can be aggregated based on their activity
     * type and existing aggregation rules
     *
     * @param  {Activity}   activityA   An activity to compare to `activityB`
     * @param  {Activity}   activityB   An activity to compare to `activityA`
     * @return {Boolean}                Whether or not `activityA` can be aggregated with `activityB`
     * @api private
     */
    var canAggregate = function(activityA, activityB) {
        // The two activities need to have the same to type
        if (activityA['oae:activityType'] !== activityB['oae:activityType']) {
            return false;

        // If we don't have any aggregation rules defined for the activity types,
        // we cannot aggregate them
        } else if (!AGGREGATION_RULES[activityA['oae:activityType']]) {
            return false;
        }

        // Activities of the same type which has an aggregation rule can only aggregate
        // if their aggregate key is the same. The aggregate key will be the same if both
        // activities contain the same entities that fullfill the aggregate rule
        var key1 = getAggregateKey(activityA);
        var key2 = getAggregateKey(activityB);
        return (key1 === key2);
    };

    /**
     * Given an activity, get its aggregate key. This string will hold the identifiers
     * of the entities from the activity for which it can aggregate. If 2 activities have
     * the same aggregate key, they can aggregate
     *
     * @param  {Activity}   activity    The activity for which to generate an aggregate key
     * @return {String}                 The aggregate key for the given activity
     * @api private
     */
    var getAggregateKey = function(activity) {
        var aggregateKey = [];
        _.each(AGGREGATION_RULES[activity['oae:activityType']], function(activityField) {
            aggregateKey.push(activity[activityField]['oae:id']);
        });
        return aggregateKey.join('#');
    };

    /**
     * Add the entity collection from a given activity to the entity collection of another. If any
     * of the entities in are already contained in the `to` activity's entities they will not be added
     *
     * @param {Activity}    to      The activity to add the entities to
     * @param {Activity}    from    The activity to pick the entities from
     * @param {String}      entity  The name of the entity. One of `actor`, `object` or `target`
     * @api private
     */
    var addEntities = function(to, from, entity) {
        // If the new activity has no entity, there's no need to do anything
        if (!from[entity]) {
            return;

        // If the activity we're adding an entity (collection) to does not have
        // any entity (collection) of its own, we can simply copy the entity collection
        // from the new activity
        } else if (!to[entity]) {
            to[entity] = from[entity];
        }

        // Create arrays for both activities entity collections. This makes
        // it slightly easier to remove duplicate entities later
        var fromCollection = (from[entity]['oae:collection']) ? from[entity]['oae:collection'] : [from[entity]];
        var toCollection = (to[entity]['oae:collection']) ? to[entity]['oae:collection'] : [to[entity]];

        // Combine the two collections making sure there are no
        // duplicates in the new collections
        newCollection = toCollection.concat(fromCollection);
        newCollection = _.uniq(newCollection, false, 'oae:id');

        // If the new collection only contains one item, that means the `to` activity already contains it
        if (newCollection.length > 1) {
            to[entity] = {
                'oae:collection': newCollection,
                'objectType': 'collection'
            };
        }
    };

    /**
     * Send a new message over the established websocket
     *
     * @param  {String}     name                Name of the message identifying the type of message
     * @param  {Object}     payload             Additional data that needs to be sent along with the message
     * @param  {Function}   callback            Standard callback function
     * @param  {Object}     callback.err        Error object containing error code and message
     * @param  {Object}     callback.payload    The payload of the received response
     * @api private
     */
    var sendMessage = function(name, payload, callback) {
        // Construct the message object
        var message = {
            'id': utilAPI.generateId(),
            'name': name,
            'payload': payload
        };

        // Store a reference to the function that will be called when the response
        // to the message has been received
        acknowledgementCallbacks[message.id] = function(responseMessage) {
            callback(responseMessage.error, responseMessage.payload);
            // Remove the reference now that the callback has been called
            delete acknowledgementCallbacks[message.id];
        };

        // Send the message over the websocket
        sockjs.send(JSON.stringify(message));
    };

});
