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


require(['jquery', 'underscore', 'oae.core', '/mobile/js/mobile.util.js'], function($, _, oae, mobileUtil) {

    require(['jquery-mobile'], function(){

        /**
         * Init the side menu
         */
        var initMenu = function() {

            $( document ).on( "swiperight", "#main-container", function( e ) {
                if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
                    if ( e.type === "swiperight" ) {

                        // Adding a class with css animations in stead of
                        // using the .panel('open') => not working with require-jquery

                        $("#left-panel").addClass('panel-open').removeClass('ui-panel-closed');
                        //$("#left-panel").panel('open');
                    }
                }
            });

        };

        /**
         * Initializes the mobile UI
         */
        var doInit = function() {
            // Initialize the side menu
            initMenu();
        };

        doInit();

    });

});
