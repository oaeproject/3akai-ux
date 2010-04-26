/*
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
 */

/* global sakai, $ */

var sakai = sakai || {};

sakai.createconnections = function(){

    var password = "test";

    var connections = [
        {"from": "user1", "to" : "user2", "postdata" : {"fromRelationships" : "Classmate", "toRelationships" : "Classmate" ,"targetUserId" : "user2"}}
    ];

    var log = function(message, status){
        var cssclass = "";
        if(status){
            cssclass= "population_success";
        }else{
            cssclass = "population_error";

            // Send a logout request
            $.ajax({
                url: sakai.config.URL.LOGOUT_SERVICE,
                type: "POST",
                data: {"sakaiauth:logout":"1"}
            });
        }
        $("#log").append('<span class="' + cssclass+  '">' + message + "</span><br/>");
    };

    // TO DO: This will need modifying according to 0.4 kernel specs for contacts

    /**
     * A recursive function that creates connections between users
     * @param {Integer} count The current number of the user in the connections array
     */
    var createConnections = function(count){

        if(count !== connections.length){

            var currentConnection = connections[count];

            // Login
            $.ajax({
                url: "/system/sling/formlogin",
                type: "POST",
                data: {
                    "sakaiauth:login" : 1,
                    "sakaiauth:pw": password,
                    "sakaiauth:un": currentConnection.from,
                    "_charset_": "utf-8"
                },
                success : function(){

                    sakai.api.User.loadMeData(function(success, data){

                        // Send the invite
                        $.ajax({
                            url: "/_user/" + sakai.data.me.user.userStoragePrefix + "contacts.invite.html",
                            type: "POST",
                            data: currentConnection.postdata,
                            success: function(){
                                log("Send the connection invite from " + currentConnection.from + " and " + currentConnection.to, true);

                                // Logout
                                $.ajax({
                                    url: sakai.config.URL.LOGOUT_SERVICE,
                                    type: "POST",
                                    data: {
                                        "sakaiauth:logout": "1"
                                    },
                                    complete: function(data){

                                        // Login
                                        $.ajax({
                                            url: "/system/sling/formlogin",
                                            type: "POST",
                                            data: {
                                                "sakaiauth:login": 1,
                                                "sakaiauth:pw": password,
                                                "sakaiauth:un": currentConnection.to
                                            },
                                            success: function(){

                                                sakai.api.User.loadMeData(function(success, data){

                                                    // Accept the invite
                                                    $.ajax({
                                                        url: "/_user/" + sakai.data.me.user.userStoragePrefix + "contacts.accept.html",
                                                        data: {
                                                            "targetUserId": currentConnection.from
                                                        },
                                                        type: "POST",
                                                        success: function(data){
                                                            log("Created the connection between " + currentConnection.from + " and " + currentConnection.to, true);
    
                                                            // Logout
                                                            $.ajax({
                                                                url: sakai.config.URL.LOGOUT_SERVICE,
                                                                type: "POST",
                                                                data: {
                                                                    "sakaiauth:logout": "1"
                                                                },
                                                                complete: function(data){
                                                                    count++;
                                                                    createConnections(count);
                                                                }
                                                            });
                                                        },
                                                        error: function(data){
                                                            log("Could not create the connection between " + currentConnection.from + " and " + currentConnection.to, false);
                                                        }
                                                    });
                                                });

                                            },
                                            error: function(data){
                                                log("Failed to login " + currentConnection.to, false);
                                            }
                                        });
                                    }
                                });

                            },
                            error: function(data){
                                log("Failed to send the connection invite from " + currentConnection.from + " to " + currentConnection.to, false);
                            }
                        });

                    });

                },
                error: function(data){
                    log("Failed to login " + currentConnection.from, false);
                }
            });
        }
    };

    /**
     * Add binding to the create connections button
     * @param {Object} ev
     */
    $("#create_connections").bind("click", function(ev){
        $("#log").empty();

        createConnections(0);
    });

};

sdata.container.registerForLoad("sakai.createconnections");