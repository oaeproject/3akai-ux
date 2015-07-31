/*!
 * Copyright 2015 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery','oae.core'], function($, oae) {
    
    /*-- ANONYMOUS USERS --*/

    /**
     * Set up the left hand navigation with the content space page structure.
     * The content left hand navigation item will not be shown to the user and
     * is only used to load the correct content preview widget
     */
    var setUpAnonNavigation = function() {
        var lhNavPages = [{
            'id': 'content',
            'title': '__MSG__WELCOME__',
            'closeNav': true,
            'class': 'hide',
            'layout': [
                {
                    'width': 'col-md-12',
                    'widgets': [
                        {
                            'name': 'tenantlandingpage'
                        }
                    ]
                }
            ]
        }];

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], '/']);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], '/']);
        });
    };
    
    /*-- LOGGED IN USERS --*/

    /*-- GENERAL PAGE SETUP --*/
    
    // The basic index page varies based on whether the user
    // has logged in (in which case the page shows that user's
    // activity stream) or not (in which case the page reverts
    // to the generic tenant landing page

    if (oae.data.me.anon) {
        
        // Add a class to the page to trigger appropriate styles
        $('body').addClass('oae-index-anon');
        
        // For anonmous users, the page is static, so all
        // we do is set up the navigation. That will load
        // the page content
        setUpAnonNavigation();

    } else {
        
    }

    // We can now unhide the page
    oae.api.util.showPage();

});
