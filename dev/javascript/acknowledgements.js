/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.acknowledgements = function() {
        
        var pubdata = {	
        	"structure0": {
                "featured": {
                    "_ref": "id1", 
                    "_title": "Featured",
                    "_order": 0,
                    "main": {
                        "_ref": "id2",
                        "_order": 0,
                        "_title": "Featured"
                    }
                },
                "ui": {
                    "_ref": "id2", 
                    "_title": "UI Technologies",
                    "_order": 1,
                    "main": {
                        "_ref": "id2",
                        "_order": 0,
                        "_title": "UI Technologies"
                    }
                },
                "nakamura": {
                    "_title": "Back-end Technologies", 
                    "_ref": "id3",
                    "_order": 2,
                    "main": {
                        "_ref": "id3",
                        "_order": 0,
                        "_title": "Back-end Technologies"
                    }
                }
            },
        	"id1": {
        		"page": $("#acknowledgements_featured").html()
        	},
        	"id2": {
        		"page": $("#acknowledgements_uitech").html()
        	},
        	"id3": {
        		"page": $("#acknowledgements_backendtech").html()
        	}
        }

        var generateNav = function(){
            $(window).trigger("lhnav.init", [pubdata, {}, {}]);
        }
        
        var renderEntity = function(){
            $(window).trigger("sakai.entity.init", ["acknowledgements"]);
        }

        $(window).bind("lhnav.ready", function(){
            generateNav();
        });
        
        $(window).bind("sakai.entity.ready", function(){
            renderEntity(); 
        });
        
        generateNav();
        renderEntity();
    
    };

    sakai.api.Widgets.Container.registerForLoad("acknowledgements");
});
