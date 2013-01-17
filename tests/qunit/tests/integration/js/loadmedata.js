/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
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

require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai) {

        module('Load me data');

        var loadMeDataTest = function() {
            sakai_global.qunit.loginWithAdmin();
            loadMeData();
        };

        var loadMeData = function() {
            asyncTest('Test if the correct data is retrieved and stored in the sakai.data.me object', function() {
                sakai.api.User.loadMeData(function(success, data) {
                    //test if the profile node is included
                    ok(data.profile, 'check if there\'s profile information');

                    //test if the user node is included
                    ok(data.user, 'check if there\'s user information');

                    //test if the username is admin
                    same(data.user.userid,'admin','Check the username');

                    //start the next test
                    start();
                });
            });
        }

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            loadMeDataTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                loadMeDataTest();
            });
        }

    }
);
