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

    sakai_global.user = function() {

        var pubdata = {	
        	"structure0":"{\"profile\": {\"_title\": \"My Profile\",\"_altTitle\": \"${user}'s Profile\",\"basicinfo\": {\"_ref\": \"533118849\",\"_title\": \"Basic Information\"},\"aboutme\": {\"_ref\": \"657672090\",\"_title\": \"About Me\"},\"locations\": {\"_ref\": \"2967778497\",\"_title\": \"Locations\"},\"publications\": {\"_ref\": \"86312659\",\"_title\": \"Publications\"}},\"content\": {\"_title\": \"My Content\",\"_altTitle\": \"${user}'s Content\",\"main\": {\"_ref\": \"9834611274\",\"_title\": \"Content\"}},\"memberships\": {\"_title\": \"My Memberships\",\"_altTitle\": \"${user}'s Memberships\",\"main\": {\"_ref\": \"213623673\",\"_title\": \"Memberships\"}},\"contacts\": {\"_title\": \"My Contacts\",\"_altTitle\": \"${user}'s Contacts\",\"main\": {\"_ref\": \"1193715035\",\"_title\": \"Contacts\"}}}",
        	"533118849": {
        		"page": "Basic Information HTML fragment"
        	},
        	"657672090": {
        		"page": "About Me HTML fragment"
        	},
        	"2967778497": {
        		"page": "Locations HTML fragment"
        	},
        	"86312659": {
        		"page": "Publications HTML fragment"
        	},
        	"9834611274": {
        		"page": "My Content HTML fragment"
        	},
        	"213623673": {
        		"page": "My Memberships HTML fragment"
        	},
        	"1193715035": {
        		"page": "My Contacts HTML fragment"
        	}
        }
        
        var privdata = {
            "structure0":"{\"dashboard\": {\"_title\": \"My Dashboard\", \"_main\":{\"_ref\":\"\",\"_title\":\"Dashboard\"}},\"inbox\": {\"_title\": \"Inbox\",\"messages\": {\"_ref\": \"\",\"_title\": \"Messages\"},\"invitations\": {\"_ref\": \"\",\"_title\": \"Invitations\"},\"sent\": {\"_ref\": \"\",\"_title\": \"Sent\"},\"trash\": {\"_ref\": \"\",\"_title\": \"Trash\"}}}",
        	"533118849": {
        		"page": "Basic Information HTML fragment"
        	},
        	"657672090": {
        		"page": "About Me HTML fragment"
        	},
        	"2967778497": {
        		"page": "Locations HTML fragment"
        	},
        	"86312659": {
        		"page": "Publications HTML fragment"
        	},
        	"9834611274": {
        		"page": "My Content HTML fragment"
        	},
        	"213623673": {
        		"page": "My Memberships HTML fragment"
        	}
        }

        var generateNav = function(){
            $(window).trigger("lhnav.init", [pubdata, privdata]);
        }
        
        $(window).bind("lhnav.ready", function(){
            generateNav();
        });
        
        generateNav();
    
    };

    sakai.api.Widgets.Container.registerForLoad("user");
});
