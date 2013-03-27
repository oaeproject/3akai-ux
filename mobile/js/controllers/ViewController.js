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
        '/mobile/js/mobile.util.js'
    ],
    function(oae, mobileUtil){

        // Properties
        var instance = null;

        // Constructor
        function ViewController(){
            if(instance !== null) throw new Error("Cannot instantiate more than one ViewController.");
            instance = this;
        }

        // Methods
        ViewController = new Class({
            Extends: Moobile.EventFirer,

            changeView: function(event){
                this.fireEvent('VIEWCHANGED', {'target': event.target, 'transition': event.transition});
            },

            popView: function(){
                this.fireEvent('VIEWPOPPED');
            }
        });

        // Singleton
        if(!instance) instance = new ViewController();
        return instance;
    }
);