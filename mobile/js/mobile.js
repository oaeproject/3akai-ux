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

require.config({
    paths: {
        viewController:         '/mobile/js/controllers/ViewController',
        userController:         '/mobile/js/controllers/UserController'
    }
});

require(
    [
        'jquery','underscore','oae.core',
        '/mobile/js/mobile.util.js',
        'viewController',
        'userController'
    ],
    function($, _, oae, mobileUtil, viewController, userController) {

        // Properties

        // Check if user is logged in
        if (oae.data.me.anon) {
            console.log('[mobile] user is not logged in');
            oae.api.util.redirect().login();
        }

        /**
         * Initializes the mobile UI
         */
        var doInit = function() {





            oae.api.init;
            console.log(oae.data.me);
            console.log('[Mobile] doInit');
        };

        //doInit();









        // Store the views
        var views = {
            "view1" : $("#view1"),
            "view2" : $("#view2"),
            "view3" : $("#view3"),
            "view4" : $("#view4")
        };

        // The viewport width (static but could be dynamic, i.e. window width)
        var viewportWidth = window.width;

        // We need the transition time, as defined in CSS, to time our delays
        var transitionTime = 300;

        // Store the current view
        var currentViewId = "view1";

        // Remove all but the current view to start
        // Comment this out to see what's happening
        $("#views li").not(views[currentViewId]).remove();

        // Transition between views
        function gotoView( id ) {

            // Things will go wrong if we try to transition to the same item!
            if(id === currentViewId) { return; }

            // Find the numerical indices of the current and requested view
            var currentIndex = getViewIndex( currentViewId );
            var nextIndex = getViewIndex( id );

            // Get the DOM elements at current id and requested id
            var viewA = views[ currentViewId ];
            var viewB = views[ id ];

            if( currentIndex < nextIndex ) {

                // The requested view is to the right of the current view
                // Place the requested view after the current view
                viewA.after( viewB );

                // Add the transition class for animation
                viewA.addClass("transitionAll");

                // Offset it by width of the viewport, thus dragging the next item left with it
                viewA.css("margin-left", -viewportWidth);

                // When the transition is done, reset the view
                setTimeout(function(){

                    viewA.removeClass("transitionAll");
                    viewA.css("margin", 0);
                    viewA.remove();

                }, transitionTime);

            } else {

                // The requested view is to the left of the current view
                // Place the requested view before the current view
                viewA.before( viewB );

                // Placing it before will push it right, so give it a negative margin
                viewB.css("margin-left", -viewportWidth);

                // Now we want it to animate, so add the animation class
                viewB.addClass("transitionAll");

                // We can't reset the margin instantly, so schedule a small delay
                setTimeout(function(){
                    viewB.css("margin-left", 0);
                },1);

                // And remember to clean the view after use
                // This time we remove the preview item
                setTimeout(function(){

                    viewB.removeClass("transitionAll");
                    viewB.css("margin", 0);
                    viewA.remove();

                }, transitionTime);
            }

            currentViewId = id;
        }

        // Returns the integer index of a view
        function getViewIndex( id ) {
            return parseInt( id.match(/\d$/)[0], 10 );
        }

        // When a menu item is clicked...
        $("#menu a").click( function(){
            // The links rel attribute refers to a view id
            //var viewId = $(this).attr("rel");
            //gotoView( viewId );
        } );

    }
);