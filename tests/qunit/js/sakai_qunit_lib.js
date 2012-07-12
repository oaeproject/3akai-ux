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

require(
    [
        "jquery",
        "sakai/sakai.api.core",
        "qunitjs/qunit"
    ],
    function($, sakai) {

    sakai_global = sakai_global || {};
    sakai_global.qunit = sakai_global.qunit || {};
    sakai_global.qunit.ready = false;

    var doLocalBinding = function() {
        /**
         * Handle the sakai-qunit-done event
         * This is verbose, but its here for now in case we
         * need to use this event on an individual test page in the future
         */
        $(window).off('done.qunit.sakai').on('done.qunit.sakai', function(e, obj) {
            // trigger this event in the parent document
            if (parent && $(parent.document).length) {
                parent.$(parent.document).trigger("done.qunit.sakai", obj);
            }
        });

        /**
         * QUnit calls this function when it has completed all of its tests
         * We simply define the function and it gets called
         */
        QUnit.done = function(completed) {
            var location = window.location.href.split('/');
            location = "tests/" + location[location.length-1];
            $(window).trigger('done.qunit.sakai', {url: location, failures:completed.failed, total:completed.total});
        };
    };

    // Only bind when we're not swarming
    if (window.location.host.indexOf("testswarm") === -1) {
        $(window).bind("addlocalbinding.qunit.sakai", function(){
            doLocalBinding();
        });
    }

    /**
     * Define all the Javascript and HTML files to test
     * Anytime a new file is added, it should be added to this list
     *
     * TODO: generate this automatically via the ant build
     */

    var setupWidgets = function() {
        for (var i=0, j=sakai_global.qunit.widgets.length; i<j; i++) {
            var widget = sakai_global.qunit.widgets[i];
            sakai_global.qunit.allJSFiles.push(widget.js);
            sakai_global.qunit.allHtmlFiles.push(widget.html);
        }
        if (sakai.api && sakai.api.i18n && sakai.api.i18n.done) { // wait for i18n to finish, then let the tests start that need file access
            sakai_global.qunit.ready = true;
            $(window).trigger("ready.qunit.sakai");
        } else {
            $(window).bind("done.i18n.sakai", function() {
                sakai_global.qunit.ready = true;
                $(window).trigger("ready.qunit.sakai");
            });
        }
    };

    if (sakai_global.qunit.widgetsdone) {
        setupWidgets();
    } else {
        $(window).bind("widgetsdone.qunit.sakai", function() {
            setupWidgets();
        });
    }

    sakai_global.qunit.loginWithAdmin = function() {
        asyncTest("Log-in with a Sakai OAE admin user", function(){
            sakai.api.User.loadMeData(function(success, data){
                // if there is a user already logged in, lets log out and log back in
                if (data.user.anon !== true && data.user.userid !== "admin") {
                    sakai.api.User.logout(function(success) {
                        // Test whether the current URL of the iFrame is the login page
                        ok(success, "The user has successfully logged-out");

                        // Check whether the logout was successful through the Me object
                        sakai.api.User.loadMeData(function(success, data){
                            ok(data.user.anon === true, "The current active user is anonymous");
                            sakai.api.User.loadMeData(function(success, data){
                                if (data.user.anon === true && success) {
                                    sakai.api.User.login({
                                        "username": "admin",
                                        "password": "admin"
                                    }, function(success, data){
                                        sakai.api.User.loadMeData(function(success, data){
                                            ok(data.user.userid === "admin", "The admin user has successfully logged-in");
                                            start();
                                        });
                                    });
                                } else {
                                    ok(false, "The user did not log out properly");
                                    start();
                                }
                            });
                        });
                    });
                } else if (data.user.userid === "admin") {
                    ok(true, "admin user already logged in");
                    start();
                // no one is logged in, lets login as admin
                } else {
                    sakai.api.User.login({
                        "username": "admin",
                        "password": "admin"
                    }, function(success, data){
                        if (success) {
                            sakai.api.User.loadMeData(function(success, data){
                                ok(data.user.userid === "admin", "The admin user has successfully logged-in");
                                start();
                            });
                        } else {
                            ok(success, "Could not log user in");
                            start();
                        }
                    });
                }
            });
        });
    };

    sakai_global.qunit.logout = function(callback) {
        asyncTest("Logging out current user", function() {
            sakai.api.User.logout(function(success) {
                // Test whether the current URL of the iFrame is the login page
                ok(success, "The user has successfully logged-out");

                // Check whether the logout was successful through the Me object
                sakai.api.User.loadMeData(function(success, data){
                    ok(data.user.anon === true, "The current active user is anonymous");
                    start();
                    if ($.isFunction(callback)){
                        callback();
                    }
                });
            });
        });
    };
});
