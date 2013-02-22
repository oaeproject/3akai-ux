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

/*!
 * Initalize requireJS by setting paths and specifying load priorities
 */
requirejs.config({
    baseUrl:'/shared/',
    paths: {
        'jquery': 'vendor/js/jquery',
        'jquery-plugins': 'vendor/js/jquery-plugins',
        'jquery-ui': 'vendor/js/jquery-ui.custom',
        'underscore': 'vendor/js/underscore'
    },
    priority: ['jquery', 'underscore']
});

/*!
 * Load all of the dependencies and core OAE APIs
 */
require(['oae/api/oae.core']);
