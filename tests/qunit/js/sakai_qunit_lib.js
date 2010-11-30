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

var sakai = sakai || {};
sakai.qunit = sakai.qunit || {};
sakai.qunit.ready = false;

$(function() {

/**
 * Handle the sakai-qunit-done event
 * This is verbose, but its here for now in case we
 * need to use this event on an individual test page in the future
 */
$(window).bind('sakai-qunit-done', function(e, obj) {
    console.warn("sakai-qunit-done", obj.url);
    // trigger this event in the parent document
    if (parent && $(parent.document).length) {
        parent.$(parent.document).trigger("sakai-qunit-done", obj);
    }
});

/**
 * QUnit calls this function when it has completed all of its tests
 * We simply define the function and it gets called
 */
QUnit.done = function(failures, total) {
    var location = window.location.href.split('/');
    location = "tests/" + location[location.length-1];
    $(window).trigger('sakai-qunit-done', {url: location, failures:failures, total:total});
};

/**
 * Define all the Javascript and HTML files to test
 * Anytime a new file is added, it should be added to this list
 *
 * TODO: generate this automatically via the ant build
 */

var setupWidgets = function() {
    for (var i=0, j=sakai.qunit.widgets.length; i<j; i++) {
        var widget = sakai.qunit.widgets[i];
        sakai.qunit.allJSFiles.push(widget.js);
        sakai.qunit.allHtmlFiles.push(widget.html);
    }
    if (sakai.api && sakai.api.i18n && sakai.api.i18n.done) { // wait for i18n to finish, then let the tests start that need file access
        sakai.qunit.ready = true;
        $(window).trigger("sakai-qunit-ready");
    } else {
        $(window).bind("sakai-i18n-done", function() {
            sakai.qunit.ready = true;
            $(window).trigger("sakai-qunit-ready");
        });
    }
};

if (sakai.qunit.widgetsdone) {
    setupWidgets();
} else {
    $(window).bind("sakai-qunit-widgetsdone", function() {
        setupWidgets();
    });
}

sakai.qunit.loginWithAdmin = function() {
    asyncTest("Log-in with a Sakai3 admin user", function(){
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

sakai.qunit.logout = function() {
    asyncTest("Logging out current user", function() {
        sakai.api.User.logout(function(success) {
            // Test whether the current URL of the iFrame is the login page
            ok(success, "The user has successfully logged-out");

            // Check whether the logout was successful through the Me object
            sakai.api.User.loadMeData(function(success, data){
                ok(data.user.anon === true, "The current active user is anonymous");
                start();
            });
        });
    });
};

});
