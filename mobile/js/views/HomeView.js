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

define([
    'exports',
    'jquery',
    'oae.core',
    '/mobile/js/mobile.util.js',
    './userController',
    './viewController'
    ],
    function(exports, $, oae, mobileUtil, userController, viewController) {

        return new Class({

            Extends: Moobile.ViewController,

            // Properties
            menuButton: null,
            detailButton: null,

            // Methods
            loadView: function() {
                this.view = Moobile.View.at('/mobile/templates/views/home-view.html');
            },

            viewDidLoad: function() {


                console.log('[HomeView] viewDidLoad');
                console.log(oae.data);
                console.log(oae.api.content);


                this.parent();

                this.initComponents();
            },

            initComponents: function() {

                this.menuButton = this.view.getChildComponent('top-bar').getChildComponent('bar-item').getChildComponent('menu-button');
                this.menuButton.addEvent('tap', this.bound('onMenuButtonTap'));

                this.detailButton = this.view.getChildComponent('detail-button');
                this.detailButton.addEvent('tap', this.bound('onDetailButtonTap'));

                this.view.getChildComponent('top-bar').getChildComponent('bar-item').setTitle(oae.data.me.tenant);
            },

            destroy: function() {
                this.menuButton.removeEvent('tap', this.bound('onMenuButtonTap'));
                this.menuButton = this.view.getChildComponent('top-bar').getChildComponent('bar-item').getChildComponent('menu-button');
                this.detailButton.removeEvent('tap', this.bound('onDetailButtonTap'));
                this.detailButton = this.view.getChildComponent('detail-button');
                this.parent();
            },

            onMenuButtonTap: function(e, sender) {
                userController.logout();
            },

            onDetailButtonTap: function(e, sender) {
                viewController.changeView({'target': 'detail', 'transition': new Moobile.ViewTransition.Slide});
            }
        });
    }
);