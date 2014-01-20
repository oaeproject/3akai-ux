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
        'content-share': ['actor'],
        'discussion-message': ['target']
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

    // Variable that keeps track of the aggregated messages. Aggregation is only done within the same
    // channel and stream type. For each activity type that requires aggregation, an aggregation key
    // is generated based on the fields of the activity on which aggregation needs to be performed.
    // Each aggregation key contains a timeout function, executed when the aggregation timeout finishes,
    // and the actual push message containing the aggregated activities.
    // The message aggregates will be stored in the following way:
    //
    //   {
    //      '<channel>': {
    //          '<streamType>': {
    //              '<activityType>': {
    //                  '<aggregateKey>': {
    //                      'timeout': <aggregateCallback>,
    //                      'message': <aggregatedMessage>
    //                  },
    //                  ...
    //              },
    //              ...
    //          },
    //          ...
    //      },
    //      ...
    //   }
    var aggregates = {};

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
                throw new Error('Could not authenticate the websocket')
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
     * @param  {String}     resourceId              Id of the resource on which channel to subscribe (e.g. user id, group id, content id, discussion id)
     * @param  {String}     streamType              Name of the stream type to subscribe to (e.g. `activity`, `message`)
     * @param  {String}     token                   Token used to authorize the subscription. This token will be available on the entity that represents the channel that's being subscribed to
     * @param  {String}     [transformer]           The format in which the activity entities should be received. When `internal` is provided, the entities will be formatted as standard OAE entities. When `activitystreams` is provided, the entities will be formatted as defined by the activitystrea.ms specification. Defaults to `internal`
     * @param  {Boolean}    [performAggregation]    Whether or not messages should be aggregated before sending them to the callback. If no aggregation is required, each incoming message will be passed to the message callback as-is. Defaults to `false`
     * @param  {Function}   messageCallback         Function executed when a message on the provided channel and of the provided stream type arrives
     * @param  {Function}   [callback]              Standard callback function
     * @param  {Object}     [callback.err]          Error object containing error code and message
     */
    var subscribe = exports.subscribe = function(resourceId, streamType, token, transformer, performAggregation, messageCallback, callback) {
        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        // Default the transformer to `internal`
        transformer = transformer || 'internal';
        // Default aggregation to `false`
        performAggregation = performAggregation || false;

        // Check if there is already a subscription for the provided channel and stream type.
        // If there is, we add an additional listener
        if (subscriptions[resourceId] && subscriptions[resourceId][streamType] && subscriptions[resourceId][streamType][transformer]) {
            subscriptions[resourceId][streamType][transformer].push({
                'performAggregation': performAggregation,
                'messageCallback': messageCallback
            });
            return callback();
        }

        // Register the listener
        subscriptions[resourceId] = subscriptions[resourceId] || {};
        subscriptions[resourceId][streamType] = subscriptions[resourceId][streamType] || {};
        subscriptions[resourceId][streamType][transformer] = [{
            'performAggregation': performAggregation,
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
     * Notify all subscribers that have subscribed to push notifications on the message's resource
     * channel and the message's stream type. Aggregation is done only for the listeners that have requested
     * aggregation. For those that haven't requested aggregation, the messages will be sent as received
     *
     * @param  {Object}     message                 Push notification message for which the containing activity will be delivered to its subscribers
     * @api private
     */
    var notifySubscribers = function(message) {
        var listenersNeedingAggregations = [];

        // Run through all subscription for the provided resource channel, stream type and format
        if (subscriptions[message.resourceId] && subscriptions[message.resourceId][message.streamType] && subscriptions[message.resourceId][message.streamType][message.format]) {
            _.each(subscriptions[message.resourceId][message.streamType][message.format], function(listener) {
                // Check if the activity that is associated to the push notification requires
                // aggregation. If it doesn't, it can be distributed to its subscribers straight away
                if (listener.performAggregation) {
                    listenersNeedingAggregations.push(listener);
                } else {
                    // The activity object on the message is delivered, rather than the entire activity
                    listener.messageCallback(message.activity);
                }
            });
        }

        if (listenersNeedingAggregations.length > 0) {
            // Perform the aggregation once
            aggregateMessages(message, function(newMessage) {
                // Distribute it to each listener
                _.each(listenersNeedingAggregations, function(listener) {
                    // The activity object on the message is delivered, rather than the entire activity
                    listener.messageCallback(newMessage.activity);
                });
            });
        }
    };

    /**
     * Aggregate the activity on a message with other activities of the same activity type and
     * equal activity fields (`actor`, `object`, `target`) as defined in the aggregation rules.
     * Aggregation is only done within the same channel and stream type. The subscribers to these
     * activities will only receive the aggregated activity after a configured amount of time, to
     * make sure that aggregatable activities that arrive within that period of time are aggregated
     * instead of delivered individually.
     *
     * @param  {Object}     newMessage                      Push notification message for which the activity needs to be aggregated
     * @param  {Function}   callback                        Standard callback function
     * @param  {Object}     callback.aggregatedMessage      The aggregated message
     * @api private
     */
    var aggregateMessages = function(newMessage, callback) {
        // Only aggregate activities within the same channel and stream type
        var resourceId = newMessage.resourceId;
        var streamType = newMessage.streamType;
        aggregates[resourceId] = aggregates[resourceId] || {};
        aggregates[resourceId][streamType] = aggregates[resourceId][streamType] || {};

        // Only aggregate activities of the same activity type (e.g. `content-create`)
        var activityType = newMessage.activity['oae:activityType'];
        aggregates[resourceId][streamType][activityType] = aggregates[resourceId][streamType][activityType] || {};

        // Generate the aggregation key used to determine which activities should be aggregated
        // together. This aggregation key consists of the values of all of the fields in the
        // aggregation rule for the provided activity type, separated by a `#`
        var aggregateKey = [];
        _.each(AGGREGATION_RULES[activityType], function(activityField) {
            aggregateKey.push(newMessage.activity[activityField]['oae:id']);
        });
        aggregateKey = aggregateKey.join('#');

        var aggregate = aggregates[resourceId][streamType][activityType][aggregateKey];

        // The aggregation is only necessary when an activity with the same aggregation key for
        // the same activity type already exists. Otherwise, the provided activity is the first of
        // its type and aggregation key, in which it can be used as is as the initial aggregate
        if (aggregate && aggregate.message.activity['oae:activityId'] !== newMessage.activity['oae:activityId']) {

            // Cancel the existing aggregate timeout
            clearTimeout(aggregate.timeout);

            // Take the message on the existing aggregate, containing the
            // already aggregated activities for the current activity type
            // and corresponding aggregation rules
            var aggregateMessage = aggregate.message;

            // Check if any aggregation is required for each of the standard activity fields.
            // Aggregation is only done for those fields that are not part of the aggregation
            // rule. If the entity to aggregate into the existing aggregate is already a part
            // of the existing aggregate, no aggregation will be attempted either
            _.each(['actor', 'object', 'target'], function(activityField) {

                var newMessageField = newMessage.activity[activityField];
                var aggregateField = aggregateMessage.activity[activityField];

                // Don't attempt aggregation if the current activity field is part of the aggregation
                // rule or when the current message doesn't contain the activity field
                if (_.contains(AGGREGATION_RULES[activityType], activityField) || !newMessageField) {
                    return;
                }

                // Check if the activity field on the current message requires aggregation. If the entity
                // on the field is already part of the aggregated activity field value, there's no need for
                // aggregation
                var needsAggregating = true;
                var existingEntities = aggregateField['oae:collection'] ? aggregateField['oae:collection'] : [aggregateField];
                _.each(existingEntities, function(entity) {
                    if (entity['oae:id'] === newMessageField['oae:id']) {
                        needsAggregating = false;
                    }
                });

                if (needsAggregating) {
                    // If the activity field on the aggregate is already a collection, we can just
                    // add the value of the activity field on the current message to that collection
                    if (aggregateField['oae:collection']) {
                        aggregateField['oae:collection'].push(newMessageField);
                    // If the activity field on the aggregate is not a collection yet, we create one
                    // that contains the value on the aggregate and the value on the current message
                    } else {
                        aggregateMessage.activity[activityField] = {
                            'oae:collection': [aggregateField, newMessageField],
                            'objectType': 'collection'
                        };
                    }
                }
            });

            // Change the timestamp on the aggregate to be the one on the current message. This ensures
            // that the timestamp is always the one from the latest activity that happened
            aggregateMessage.activity.published = newMessage.activity.published;
            newMessage = aggregateMessage;
        }

        // Store the aggregate for future aggregation
        aggregates[resourceId][streamType][activityType][aggregateKey] = {
            'message': newMessage,
            'timeout': setTimeout(function() {
                callback(newMessage);
            }, AGGREGATION_TIMEOUT)
        };
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
