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

define(
    [
        'jquery','underscore','oae.core',
        '/mobile/js/constants/constants.js'
    ],
    function($, _, oae, constants) {

        // Properties
        var mainController = null;

        /////////////////////
        //// Constructor ////
        /////////////////////

        function Modal(_mainController) {
            mainController = _mainController;
        }

        ////////////////////
        // Public methods //
        ////////////////////

        // Initialize Menu
        Modal.prototype.initialize = function() {
            renderTemplate();
        };

        // Destroy Menu
        Modal.prototype.destroy = function() {
            destroyBinding();
        };

        /////////////////////
        // Private methods //
        /////////////////////

        // Renders the template + inserts navigation widget
        var renderTemplate = function() {
            addBinding();
        };

        // Add binding
        var addBinding = function() {

        };

        // Destroy binding
        var destroyBinding = function() {

        };

        return Modal;
    }
);