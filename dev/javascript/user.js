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
        
        var privdata = {
            "structure0": {
                "dashboard": {
                    "_ref": "267187828",
                    "_title": "My Dashboard", 
                    "main": {
                        "_ref":"267187828",
                        "_title":"Dashboard"
                    }
                },
                "messages": {
                    "_title": "My Messages",
                    "_ref": "1165301022",
                    "inbox": {
                        "_ref": "1165301022",
                        "_title": "Inbox"
                    },
                    "invitations": {
                        "_ref": "9867733100",
                        "_title": "Invitations"
                    },
                    "sent": {
                        "_ref": "4253485084",
                        "_title": "Sent"
                    },
                    "trash": {
                        "_ref": "3915412565",
                        "_title": "Trash"
                    }
                }
            },
        	"267187828": {
        		"page": "My Dashboard HTML fragment"
        	},
        	"1165301022": {
        		"page": "Inbox HTML fragment"
        	},
        	"9867733100": {
        		"page": "Invitations HTML fragment"
        	},
        	"4253485084": {
        		"page": "Sent HTML fragment"
        	},
        	"3915412565": {
        		"page": "Trash HTML fragment"
        	}
        }

        var pubdata = {	
        	"structure0": {
                "profile": {
                    "_ref": "533118849", 
                    "_title": "My Profile",
                    "_altTitle": "${user}'s Profile",
                    "basicinfo": {
                        "_ref": "533118849",
                        "_title": "Basic Information"
                    },
                    "aboutme": {
                        "_ref": "657672090",
                        "_title": "About Me"
                    },
                    "locations": {
                        "_ref": "2967778497",
                        "_title": "Locations"
                    },
                    "publications": {
                        "_ref": "86312659",
                        "_title": "Publications"
                    }
                },
                "content": {
                    "_ref": "9834611274", 
                    "_title": "My Content",
                    "_altTitle": "${user}'s Content",
                    "main": {
                        "_ref": "9834611274",
                        "_title": "Content"
                    }
                },
                "memberships": {
                    "_title": "My Memberships", 
                    "_ref": "213623673", 
                    "_altTitle": "${user}'s Memberships",
                    "main": {
                        "_ref": "213623673",
                        "_title": "Memberships"
                    }
                },
                "contacts": {
                    "_title": "My Contacts",
                    "_ref": "1193715035", 
                    "_altTitle": "${user}'s Contacts",
                    "main": {
                        "_ref": "1193715035",
                        "_title": "Contacts"
                    }
                }
            },
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
        		"page": "<div id='widget_mygroups' class='widget_inline'/>"
        	},
        	"1193715035": {
        		"page": "My Contacts HTML fragment"
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
