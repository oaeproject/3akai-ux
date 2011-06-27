/**
 *
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */

/**
* @class Server
*
* @description
* Server communication and batch processing. This should only hold functions
* which are used across multiple pages, and does not constitute functionality
* related to a single area/page
*
* @namespace
* Server related convenience functions and communication
*/
define(
    [
        "jquery",
        "../../configuration/config.js"
    ],
    function($, sakai_conf) {

    var sakaiServerAPI = {
        /**
         * Perform a batch request to the server
         *
         * @param {Array} requests The JSON object of requests
         * @param {Function} callback Callback function, passes ({Boolean} success, {Object} data)
         * @param {Boolean} cache If we should cache this request or not
         * @param {Boolean} forcePOST if we need to force a POST
         * @param {Boolean} async If we should do an async request or not
         */
        batch : function(_requests, _callback, _cache, _forcePOST, _async) {
            var method = _forcePOST === true ? "POST" : "GET",
                cache = _cache === false ? false : true,
                async = _async === false ? false : true;
                url = sakai_conf.URL.BATCH;

            // Append a charset to each request
            $.each(_requests, function(i,req) {
                if (!req["_charset_"]) {
                    req["_charset_"] = "utf-8";
                }
                if (req["parameters"] && !req["parameters"].hasOwnProperty("_charset_")) {
                    req["parameters"]["_charset_"] = "utf-8";
                }
            });
            // Don't issue a batch request for a single, cacheable request
            if (_requests.length === 1) {
                $.ajax({
                    url: _requests[0].url,
                    type: _requests[0].method || "GET",
                    dataType: "text",
                    data: _requests[0].parameters || "",
                    success: function(data) {
                        var retObj = {
                            "results": [
                                {
                                    "url": _requests[0].url,
                                    "success": true,
                                    "body": data
                                }
                            ]
                        };
                        if ($.isFunction(_callback)) {
                            _callback(true, retObj);
                        }
                    }
                });
            } else {
                // ie7 and lower don't support GETs over 2032 chars,
                // so lets check for that and POST if we need to
                var hasIELongUrlBug = false;
                // Long requests are overflowing the Jetty header cache
                // so lets use POST for long requests on all browsers until that's fixed
                //if($.browser.msie && $.browser.version.substr(0,1)<="7"){
                    hasIELongUrlBug = true;
                //}

                var urlLength = (document.location.protocol + "://" + document.location.host + sakai_conf.URL.BATCH + "?requests=" + $.toJSON(_requests).replace(/[^A-Za-z0-9._]/g, "%XX")).length;
                if (!_forcePOST && hasIELongUrlBug && urlLength > 2000) {
                    method = "POST";
                } else if(hasIELongUrlBug && $.browser.msie && urlLength > 300){
                    cache = false;
                }
                // if any request contains a POST, we should be POSTing so the request isn't cached
                // maybe just GET with no cache? not sure
                for (var i=0; i<_requests.length; i++) {
                    if (_requests[i].method === "POST") {
                        method = "POST";
                        break;
                    }
                }
                $.ajax({
                    url: sakai_conf.URL.BATCH,
                    type: method,
                    cache: cache,
                    async: async,
                    data: {
                        "_charset_":"utf-8",
                        requests: $.toJSON(_requests)
                    },
                    success: function(data) {
                        if ($.isFunction(_callback)) {
                            _callback(true, data);
                        }
                    },
                    error: function(xhr) {
                        if ($.isFunction(_callback)) {
                            _callback(false);
                        }
                    }
                });
            }
        },

        /**
         * Performs a batch request for a number of specified requests.
         *
         * @param {String} groupId Identifier for the group of requests so we can keep the requests grouped separatly
         * @param {Integer} numRequests The number of requests for the group, so we know when to fire off the request
         * @param {String} requestId Identifier for the request so we can map it
         * @param {Object} request Request object for the batch request. If this is false the request is not added to the queue.
         */
        bundleRequests : function(groupId, numRequests, requestId, request){
            if (!sakaiServerAPI.initialRequests) {
                sakaiServerAPI.initialRequests = sakaiServerAPI.initialRequests || {};
            }
            if (!sakaiServerAPI.initialRequests[groupId]){
                sakaiServerAPI.initialRequests[groupId] = {};
                sakaiServerAPI.initialRequests[groupId].count = 0;
                sakaiServerAPI.initialRequests[groupId].requests = [];
                sakaiServerAPI.initialRequests[groupId].requestId = [];
            }
            if (request) {
                sakaiServerAPI.initialRequests[groupId].requests.push(request);
                sakaiServerAPI.initialRequests[groupId].requestId.push(requestId);
            }
            sakaiServerAPI.initialRequests[groupId].count++;
            if (numRequests === sakaiServerAPI.initialRequests[groupId].count) {
                sakaiServerAPI.batch(sakaiServerAPI.initialRequests[groupId].requests, function(success, data) {
                    if (success) {
                        var jsonData = {
                            "groupId": groupId,
                            "responseId": sakaiServerAPI.initialRequests[groupId].requestId,
                            "responseData": data.results
                        };
                        $(window).trigger("complete.bundleRequest.Server.api.sakai", jsonData);
                    }
                    delete sakaiServerAPI.initialRequests[groupId];
                });
            }
        },

        /**
         * Saves a specified JSON object to a specified URL in JCR. The structure of JSON data will be re-created in JCR as a node hierarchy.
         *
         * @param {String} i_url The path to the preference where it needs to be
         * saved
         * @param {Object} i_data A JSON object which we would like to save
         * (max 200 child object of each object)
         * @param {Function} callback A callback function which is executed at the
         * end of the operation
         * @param {Boolean} removeTree If we should replace the entire tree of saved data or just update it
         * @param {Array} indexFields Fields to index in the data (used for widgets, and is optional)
         *
         * @returns {Void}
         */
        saveJSON : function(i_url, i_data, callback, removeTree, indexFields) {

            // Argument check
            if (!i_url || !i_data) {

                // Log the error message
                debug.warn("sakai.api.Server.saveJSON: Not enough or empty arguments!");

                // Still invoke the callback function
                if ($.isFunction(callback)) {
                    callback(false, "The supplied arguments were incorrect.");
                }

                // Make sure none of the other code in this function is executed
                return;
            }

            /**
             * @param {Array} path The path to the data object, split out
             * @param {Object} obj The data object to add the field to
             */
            var addIndexedFields = function(path, obj) {
                if (path.length > 1) {
                    obj = obj[path.shift()];
                    addIndexedFields(path, obj);
                } else {
                    if (obj["sakai:indexed-fields"]) {
                        obj["sakai:indexed-fields"] = obj["sakai:indexed-fields"].split(",");
                        obj["sakai:indexed-fields"].push(path[0]);
                        obj["sakai:indexed-fields"] = obj["sakai:indexed-fields"].join(",");
                    } else {
                        obj["sakai:indexed-fields"] = path[0];
                    }
                    if (!obj["sling:resourceType"]) {
                        obj["sling:resourceType"] = "sakai/widget-data";
                    }
                }
            };

            /**
             * <p>Convert all the arrays in an object to an object with a unique key.<br />
             * Mixed arrays (arrays with multiple types) are not supported.
             * </p>
             * <code>
             * {
             *     "boolean": true,
             *     "array_object": [{ "key1": "value1", "key2": "value2"}, { "key1": "value1", "key2": "value2"}]
             * }
             * </code>
             * to
             * <code>
             * {
             *     "boolean": true,
             *     "array_object": {
             *         "__array__0__": { "key1": "value1", "key2": "value2"},
             *         "__array__1__": { "key1": "value1", "key2": "value2"}
             *     }
             * }
             * </code>
             * @param {Object} obj The Object that you want to use to convert all the arrays to objects
             * @return {Object} An object where all the arrays are converted into objects
             */
            var convertArrayToObject = function(obj) {

                var i,j,jl;
                // Since the native createTree method doesn't support an array of objects natively,
                // we need to write extra functionality for this.
                for(i in obj){

                    // Check if the element is an array, whether it is empty and if it contains any elements
                    if (obj.hasOwnProperty(i) && $.isArray(obj[i]) && obj[i].length > 0) {

                        // Deep copy the array
                        var arrayCopy = $.extend(true, [], obj[i]);

                        // Set the original array to an empty object
                        obj[i] = {};

                        // Add all the elements that were in the original array to the object with a unique id
                        for (j = 0, jl = arrayCopy.length; j < jl; j++) {

                            // Copy each object from the array and add it to the object
                            obj[i]["__array__" + j + "__"] = arrayCopy[j];

                            // Run recursively
                            convertArrayToObject(arrayCopy[j]);
                        }
                    // If there are array elements inside
                    } else if ($.isPlainObject(obj[i])) {
                        convertArrayToObject(obj[i]);
                    }

                }

                return obj;
            };

            // Convert the array of objects to only objects
            // We also need to deep copy the object so we don't modify the input parameter
            i_data = convertArrayToObject($.extend(true, {}, i_data));
            var postData = {
                ":operation": "import",
                ":contentType": "json",
                ":replace": true,
                ":replaceProperties": true,
                "_charset_":"utf-8"
            };
            if (removeTree) {
                postData[":removeTree"] = removeTree;
            }
            if (indexFields) {
                $.each(indexFields, function(i,val) {
                    addIndexedFields(val.split("/"), i_data);
                });
            }
            sakaiServerAPI.removeServerCreatedObjects(i_data, ["_"]);
            postData[":content"] = $.toJSON(i_data);
            // Send request
            $.ajax({
                url: i_url,
                type: "POST",
                data: postData,
                dataType: "text",

                success: function(data){

                    // If a callback function is specified in argument, call it
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },

                error: function(xhr, status, e){

                    // Log error
                    debug.error("sakai.api.Server.saveJSON: There was an error saving JSON data to: " + this.url);

                    // If a callback function is specified in argument, call it
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });

        },

        /**
         * Removes any objects with a given namespace
         *
         * @param {Object} the object to clean
         * @param {Array}  an array containing a string for each namespace to move
         */
        removeServerCreatedObjects : function(obj, namespace, notToRemove) {
            var newobj = $.extend(true, {}, obj);
            notToRemove = notToRemove || [];
            $.each(newobj, function(key,val) {
                for (var ns = 0; ns < namespace.length; ns++) {
                    if (key && key.indexOf && key.indexOf(namespace[ns]) === 0) {
                        var canRemove = true;
                        for (var i = 0; i < notToRemove.length; i++) {
                            if (notToRemove[i] === key) {
                                canRemove = false;
                                break;
                            }
                        }
                        if (canRemove) {
                            delete newobj[key];
                        }
                    } else if ($.isPlainObject(newobj[key])) {
                        newobj[key] = sakaiServerAPI.removeServerCreatedObjects(newobj[key], namespace, notToRemove);
                    } /* else if ($.isArray(newobj[key])) {
                        //newobj[key] = sakaiServerAPI.removeServerCreatedObjects(newobj[key], namespace, notToRemove);
                    } */
                }
            });
            return newobj;
        },


        cleanUpSakaiDocObject: function(pagestructure){
            // Convert the special objects to arrays
            data = sakaiServerAPI.convertObjectToArray(pagestructure, null, null);
            var id = pagestructure["_path"];
            var toFilter = ["_", "jcr:", "sakai:", "sling:"];
            var toExclude = ["_ref", "_title", "_altTitle", "_order", "_pid", "_count", "_view", "_edit", "_canView", "_canEdit", "_canSubedit", "_nonEditable", "_lastModified", "_lastModifiedBy"];
            pagestructure = sakaiServerAPI.removeServerCreatedObjects(pagestructure, toFilter, toExclude);
            if (pagestructure["structure0"] && typeof pagestructure["structure0"] === "string"){
                pagestructure["structure0"] = $.parseJSON(pagestructure["structure0"]);
            }
            var removeServerFormating = function(structure, id){
                for (var i in structure){
                    if (i.indexOf(id + "/") === 0){
                        var newid = i.substring(i.lastIndexOf("/") + 1);
                        structure[newid] = structure[i];
                        delete structure[i];
                        structure[newid] = removeServerFormating(structure[newid], id);
                    }
                }
                return structure;
            };
            if (id){
                pagestructure = removeServerFormating(pagestructure, id);
            }
            return pagestructure;
        },

        /**
         * Loads structured preference data from a specified URL (and it's node subtree)
         *
         * @param {String} i_url The path to the preference which needs to be loaded
         * @param {Function} callback A callback function which is executed at the end
         * of the operation
         * @param {Object} data The data to pass to the url
         *
         * @returns {Void}
         */
        loadJSON : function(i_url, callback, data) {
            // Argument check
            if (!i_url) {

                // Log the error message
                debug.info("sakai.api.Server.loadJSON: Not enough or empty arguments!");

                // Still invoke the callback function
                if ($.isFunction(callback)) {
                    callback(false, "The supplied arguments were incorrect.");
                }

                // Make sure none of the other code in this function is executed
                return;
            }

            // Remove the trailing slash if available
            if (i_url.substring(i_url.length - 1, i_url.length) === "/"){
                i_url = i_url.substring(0, i_url.length - 1);
            }
            // append .infinity.json if .json isn't present in the url
            if (i_url.indexOf(".json") === -1) {
                i_url += ".infinity.json";
            }

            $.ajax({
                url: i_url,
                cache: false,
                dataType: "json",
                data: data,
                success: function(data) {

                    // Convert the special objects to arrays
                    data = sakaiServerAPI.convertObjectToArray(data, null, null);

                    // Call callback function if present
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, status, e) {

                    // Log error
                    debug.warn("sakai.api.Server.loadJSON: There was an error loading JSON data from: " + this.url);

                    // Call callback function if present
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },
        /**
         * <p>Convert all the objects with format __array__?__ in an object to an array</p>
         * <code>
         * {
         *     "boolean": true,
         *     "array_object": {
         *         "__array__0__": {
         *             "key1": "value1",
         *             "key2": "value2"
         *         }
         *     }
         * }
         * </code>
         * to
         * <code>
         * {
         *     "boolean": true,
         *     "array_object": [
         *         {
         *             "key1": "value1",
         *             "key2": "value2"
         *        }
         *     ]
         * }
         * </code>
         * @param {Object} specficObj The Object that you want to use to convert all the objects with the special format to arrays
         * @param {Object} [globalObj] The parent object, we need this to run over the elements recursively
         * @param {Object} [objIndex] The index of the parent object
         * @return {Object} An object where all the objects with the special format are converted into arrays
         */
        convertObjectToArray : function(specficObj, globalObj, objIndex){

            var i,j,k,kl;
            // Run over all the items in the object
            for (i in specficObj) {

                // If exists and it's an object recurse
                if (specficObj.hasOwnProperty(i)) {

                    // If it's a non-empty array-object it will have a first element with the key "__array__0__"
                    if (i === "__array__0__") {

                        // We need to get the number of items in the object
                        var arr = [];
                        var count = 0;
                        for (j in specficObj) {
                            if (specficObj.hasOwnProperty(j) && j.indexOf("__array__") > -1) {
                                count++;
                            }
                        }

                        // Construct array of objects
                        for(k = 0, kl = count; k < kl; k ++){
                            arr.push(specficObj["__array__"+k+"__"]);
                        }

                        globalObj[objIndex] = arr;
                    }

                    if ($.isPlainObject(specficObj[i])) {
                        this.convertObjectToArray(specficObj[i], specficObj, i);
                    }
                }

            }
            return specficObj;
        },

        /**
         * Remove the JSON for a specific node in JCR
         *
         * @param {String} i_url The path of the node you want to remove
         * @param {Function} callback Callback function which is executed at the
         * end of the operation
         *
         * @returns {Void}
         */
        removeJSON : function(i_url, callback){

            // Argument check
            if (!i_url) {

                // Log the error message
                debug.info("sakai.api.Server.removeJSON: Not enough or empty arguments!");

                // Still invoke the callback function
                if ($.isFunction(callback)) {
                    callback(false, "The supplied arguments were incorrect.");
                }

                // Make sure none of the other code in this function is executed
                return;
            }

            // Send request
            $.ajax({
                url: i_url,
                // Note that the type DELETE doesn't work with sling if you do /test.json
                // You can only perform a DELETE on /test (without extension)
                // http://sling.apache.org/site/manipulating-content-the-slingpostservlet-servletspost.html
                type: "POST",
                data: {
                    ":operation" : "delete"
                },
                success: function(data){

                    // If a callback function is specified in argument, call it
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },

                error: function(xhr, status, e){

                    // Log error
                    debug.error("sakai.api.Server.removeJSON: There was an error removing the JSON on: " + this.url);

                    // If a callback function is specified in argument, call it
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        JCRPropertiesToDelete : ["rep:policy", "_path"],

        filterJCRProperties : function(data) {
            $(this.JCRPropertiesToDelete).each(function(i,val) {
                if (data[val]) {
                    delete data[val];
                }
            });

            var i;
            // Also run over the other objects within this object
            for (i in data) {
                if (data.hasOwnProperty(i) && $.isPlainObject(data[i])) {
                    this.filterJCRProperties(data[i]);
                }
            }
        },

        /**
         * Create a search string for the server
         * This method exists to transform a user's search string which
         * they type in into the string we should pass to the server
         *
         * Strings with AND, OR, '"', '-', '_' are treated as advanced search queries
         * and left alone. Those without are transformed into term* AND term2*
         *
         * @param {String} searchString The user's search
         * @return {String} The string to send to the server
         */
        createSearchString : function(searchString) {
            var ret = "";
            var advancedSearchRegex = new RegExp("(AND|OR|\"|-|_)", "g");

            if (advancedSearchRegex.test(searchString)) {
                ret = searchString;
            } else {
                ret = $.trim(searchString).split(" ").join(" AND ");
            }

            return ret;
        }
    };

    return sakaiServerAPI;
});
