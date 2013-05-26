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

    module('Server Object Removal');

    var serverObject = {
        'name':'dummy',
        'version':'dummy version',
        'jcr:primaryType':'dummy primary type',
        '_created':'dummy created',
        '_createdBy':'dummy createdby',
        'jcr:mixinTypes':'dummy mixin type',
        'objects': {
            'jcr:object1': 'object1',
            'object2': [
                'jcr:arrayVal1',
                'arrayVal2'
            ],
            'object3': 'zzzz'
        },
        'arrayOfObjects': [
            {
                'jcr:nestedObj1': 'nestedObj1'
            },
            {
                'jcr:nestedObj2': 'nestedObj2'
            },
            {
                'nestedObj3': 'nestedObj3'
            }
        ]
    };

    var cleanedObj = {
        'name':'dummy',
        'version':'dummy version',
        'objects': {
            'object2': [
                'jcr:arrayVal1',
                'arrayVal2'
            ],
            'object3': 'zzzz'
        },
        'arrayOfObjects': [
            {},
            {},
            {
                'nestedObj3': 'nestedObj3'
            }
        ]
    };

    /**
     * Test if the JCR objects are removed correctly from the object
     */
    var testJCRRemoval = function() {
        asyncTest('Test the removal of jcr objects in a JSON object', function() {
            // remove all the jcr: and _-prefixed objects from the dummyobject
            var thisCleanedObj = sakai.api.Server.removeServerCreatedObjects(serverObject, ['_', 'jcr:']);
            same(thisCleanedObj, cleanedObj,'Checking if removal went well by checking amount of left properties');
            start();
        });
    };

    var startTest = function() {
        $(window).trigger('addlocalbinding.qunit.sakai');
        testJCRRemoval();
    };

    if (sakai_global.qunit && sakai_global.qunit.ready) {
        startTest();
    } else {
        $(window).on('ready.qunit.sakai', function() {
            startTest();
        });
    }

});
