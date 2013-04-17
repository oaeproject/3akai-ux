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

        //////////////////////
        ///// Properties /////
        //////////////////////

        var _settings = Modal.prototype.settings = {
            name: "modal",
            template: {
                'templateID':   "#modal-template",
                'templateURL':  "/mobile/templates/components/modal.html"
            }
        };

        var _type = "";
        var _message = "";

        //////////////////////
        //// Constructor /////
        //////////////////////

        function Modal() {
            console.log('[Modal] constructor');
        }

        ///////////////////////
        /// Public methods ////
        ///////////////////////

        /**
         * Initialize modal view
         * @param {Object} data                 The object containing the message
         * @param {String} data.type            The type
         * @param {String} data.message         The message
         */
        Modal.prototype.initialize = function(data) {
            //console.log('[Modal] initialize');
            _type = data.type;
            _message = data.message;
            renderTemplate();
        };

        // Destroy Menu
        Modal.prototype.destroy = function() {
            //console.log('[Modal] destroy');
            destroyBinding();
        };

        ///////////////////////
        // Getters & Setters //
        ///////////////////////

        ///////////////////////
        /// Private methods ///
        ///////////////////////

        // Renders the template + inserts navigation widget
        var renderTemplate = function() {
            //console.log('[Modal] renderTemplate');
            addBinding();
        };

        // Add binding
        var addBinding = function() {
            //console.log('[Modal] addBinding');
        };

        // Destroy binding
        var destroyBinding = function() {
            //console.log('[Modal] destroyBinding');
        };

        return Modal;
    }
);
