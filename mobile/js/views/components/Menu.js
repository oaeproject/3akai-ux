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
        'oae.core',
        '/mobile/js/constants/constants.js'
    ],
    function(oae, constants) {

        // Properties
        var mainController = null;

        var _settings = null;

        /////////////////////
        //// Constructor ////
        /////////////////////

        function Menu(_mainController) {
            mainController = _mainController;
            this.initialize();
        }

        ////////////////////
        // Public methods //
        ////////////////////

        Menu.prototype.initialize = function() {
            _settings = mainController.getSettings()['menu'];

            console.log('[Menu]');
            console.log(_settings);

            //renderTemplate();
        };

        Menu.prototype.destroy = function() {
            _settings = null;
            deleteBinding();
        };

        /////////////////////
        // Private methods //
        /////////////////////

        var renderTemplate = function() {
            console.log('[Menu] render template');
            //oae.api.util.template().render(_settings['templateId'], null, $('#viewport'));
            addBinding();
        };

        var addBinding = function() {
            console.log('[Menu] addBinding');
        };

        var deleteBinding = function() {
            console.log('[Menu] deleteBinding');
        };

        return Menu;
    }
);