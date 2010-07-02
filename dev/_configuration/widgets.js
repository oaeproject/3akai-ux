var Widgets = {
    "relationships": [
        {"name": "Classmate", "definition": "My Classmate"},
        {"name": "Supervisor", "inverse": "Supervised", "definition": "is my supervisor"},
        {"name": "Supervised", "inverse": "Supervisor", "definition": "is being supervised by me"},
        {"name": "Lecturer", "inverse": "Student", "definition": "is my lecturer"},
        {"name": "Student", "inverse": "Lecturer", "definition": "is my student"},
        {"name": "Colleague", "definition": "is my colleague"},
        {"name": "College Mate", "definition": "is my college mate"},
        {"name": "Shares Interests", "definition": "shares an interest with me"}
    ],
    "groups":[
        "Administrators",
        "Lecturers & Supervisors",
        "Researchers",
        "Students"
    ],
    "layouts": {
        "onecolumn": {
            "name":"One column",
            "widths":[100],
            "siteportal": true
        },
        "dev": {
            "name":"Dev Layout",
            "widths":[50,50],
            "siteportal": true
        },
        "threecolumn": {
            "name":"Three equal columns",
            "widths":[33,33,33],
            "siteportal": false
        },
        "fourcolumn": {
            "name":"Four equal columns",
            "widths":[25,25,25,25],
            "siteportal": false
        },
        "fivecolumn": {
            "name":"Five equal columns",
            "widths":[20,20,20,20,20],
            "siteportal": false
        }
    },
    "widgets": {
        "addcontent": {
            "ca":true,
            "description":"Add Resource to a Site",
            "name":"Add Resource",
            "id":"addcontent",
            "img":"/devwidgets/addcontent/images/addcontent.png",
            "showinsakaigoodies":true,
            "url":"/devwidgets/addcontent/addcontent.html"
        },
        "activitystream": {
            "description":"Activity Stream Widget",
            "hasSettings":true,
            "img": "/devwidgets/activitystream/images/activitystream_icon.png",
            "id":"activitystream",
            "i18n": {
                "default": "/devwidgets/activitystream/bundles/default.json",
                "en_US": "/devwidgets/activitystream/bundles/en_US.json"
            },
            "name":"Activity Stream",
            "personalportal":true,
            "url":"/devwidgets/activitystream/activitystream.html"
        },
        "addtocontacts": {
            "description":"Add a contact",
            "name":"Add a contact",
            "i18n": {
                "default": "/devwidgets/addtocontacts/bundles/default.json",
                "en_US": "/devwidgets/addtocontacts/bundles/en_US.json",
                "zh_CN": "/devwidgets/addtocontacts/bundles/zh_CN.json"
            },
            "id":"addtocontacts",
            "url":"/devwidgets/addtocontacts/addtocontacts.html"
        },
        "basiclti": {
            "ca":true,
            "description":"Basic LTI Widget",
            "id":"basiclti",
            "img":"/devwidgets/basiclti/images/basiclti.png",
            "name":"Basic LTI",
            "showinsakaigoodies":true,
            "url":"/devwidgets/basiclti/basiclti.html"
        },
        "bookmarkandshare": {
            "ca": true,
            "description": "Bookmark and share widget",
            "i18n": {
                "default": "/devwidgets/bookmarkandshare/bundles/default.json",
                "en_US": "/devwidgets/bookmarkandshare/bundles/en_US.json",
                "nl_NL": "/devwidgets/bookmarkandshare/bundles/nl_NL.json"
            },
            "img": "/devwidgets/bookmarkandshare/images/addthis.png",
            "id": "bookmarkandshare",
            "name": "Bookmark and share",
            "showinsakaigoodies": true,
            "url":"/devwidgets/bookmarkandshare/bookmarkandshare.html"
        },
        "changepic": {
            "i18n": {
                "default": "/devwidgets/changepic/bundles/default.json",
                "en_US": "/devwidgets/changepic/bundles/en_US.json",
                "zh_CN": "/devwidgets/changepic/bundles/zh_CN.json"
            },
            "id":"changepic",
            "name":"changepic",
            "url":"/devwidgets/changepic/changepic.html"
        },
        "comments": {
            "description":"Comments",
            "ca":true,
            "hasSettings":true,
            "id":"comments",
            "img":"/devwidgets/comments/images/comments.png",
            "name":"Comments",
            "showinsakaigoodies":true,
            "siteportal":true,
            "url":"/devwidgets/comments/comments.html"
        },
        "formdatastring": {
            "description":"Create a Form: String Input",
            "ca":true,
            "hasSettings":true,
            "i18n": {
                "default": "/devwidgets/formdatastring/bundles/default.json",
                "en_US": "/devwidgets/formdatastring/bundles/en_US.json"
            },
            "id":"formdatastring",
            "img":"/devwidgets/formdatastring/images/formdatastring.png",
            "name":"Create a Form: String Input",
            "showinsakaigoodies":true,
            "siteportal":true,
            "url":"/devwidgets/formdatastring/formdatastring.html"
        },
        "createsite": {
            "description":"Create site",
            "name":"Create Site",
            "id":"createsite",
            "i18n": {
                "default": "/devwidgets/createsite/bundles/default.json",
                "en_US": "/devwidgets/createsite/bundles/en_US.json",
                "zh_CN": "/devwidgets/createsite/bundles/zh_CN.json"
            },
            "url":"/devwidgets/createsite/createsite.html"
        },
        "delicious": {
            "description":"Delicious widget",
            "hasSettings":true,
            "id":"delicious",
            "i18n": {
                "default": "/devwidgets/delicious/bundles/default.json",
                "en_US": "/devwidgets/delicious/bundles/en_US.json",
                "nl_NL": "/devwidgets/delicious/bundles/nl_NL.json"
            },
            "name":"Delicious",
            "personalportal":true,
            "url":"/devwidgets/delicious/delicious.html"
        },
        "deletecontent": {
            "description":"Delete content widget",
            "id":"deletecontent",
            "i18n": {
                "default": "/devwidgets/deletecontent/bundles/default.json"
            },
            "name":"Delete Content",
            "url":"/devwidgets/deletecontent/deletecontent.html"
        },
        "discussion": {
            "ca":true,
            "description":"Discussion widget",
            "id":"discussion",
            "img":"/devwidgets/discussion/images/discussion.png",
            "i18n": {
                "default": "/devwidgets/discussion/bundles/default.json",
                "en_US": "/devwidgets/discussion/bundles/en_US.json",
                "zh_CN": "/devwidgets/discussion/bundles/zh_CN.json"
            },
            "name":"Discussion",
            "showinsakaigoodies":true,
            "url":"/devwidgets/discussion/discussion.html"
        },
        "entity": {
            "id":"entity",
            "url":"/devwidgets/entity/entity.html"
        },
        "footer": {
            "description":"Dynamic Footer with Debug Info",
            "i18n": {
                "default": "/devwidgets/footer/bundles/default.json",
                "en_US": "/devwidgets/footer/bundles/en_US.json",
                "zh_CN": "/devwidgets/footer/bundles/zh_CN.json"
            },
            "id":"footer",
            "name":"Dynamic Footer",
            "url":"/devwidgets/footer/footer.html"
        },
        "flickr": {
            "ca": true,
            "description": "flickr widget",
            "i18n": {
                "default": "/devwidgets/flickr/bundles/default.json",
                "en_US": "/devwidgets/flickr/bundles/en_US.json",
                "nl_NL": "/devwidgets/flickr/bundles/nl_NL.json"
            },
            "id": "flickr",
            "img": "/devwidgets/flickr/images/flickr.png",
            "name": "flickr",
            "showinsakaigoodies": true,
            "url":"/devwidgets/flickr/flickr.html"
        },
        "ggadget": {
            "ca":true,
            "description":"Embed Google Gadgets in your page or dashboard",
            "id":"ggadget",
            "img":"/devwidgets/ggadget/images/ggadget.png",
            "name":"Google Gadget",
            "showinsakaigoodies":true,
            "url":"/devwidgets/ggadget/ggadget.html"
        },
        "googledocs": {
            "description": "Google docs - Show your recent google documents",
            "id":"googledocs",
            "iframe":true,
            "name":"Google docs",
            "personalportal":true,
            "scrolling": false,
            "url":"http://docs.google.com/API/IGoogle?up_numDocuments=5&browserok=true"
        },
        "googlemaps": {
            "ca":true,
            "description":"Google maps",
            "i18n": {
                "default": "/devwidgets/googlemaps/bundles/default.json",
                "en_US": "/devwidgets/googlemaps/bundles/en_US.json",
                "zh_CN": "/devwidgets/googlemaps/bundles/zh_CN.json"
            },
            "id":"googlemaps",
            "img":"/devwidgets/googlemaps/images/googlemaps.png",
            "name":"Google maps",
            "showinsakaigoodies":true,
            "url":"/devwidgets/googlemaps/googlemaps.html"
        },
        "helloworld": {
            "description":"Sakai Hackathon Example",
            "hasSettings":true,
            "id":"helloworld",
            "name":"Hello World",
            "url":"/devwidgets/helloworld/helloworld.html"
        },
        "helloworldwow": {
            "description":"GWT Widget Example",
            "gwt":true,
            "hasSettings":true,
            "id":"helloworldwow",
            "name":"Hello World GWT",
            "url":"/devwidgets/helloworldwow/war/Helloworldwow.html"
        },
        "listgeneral": {
            "description":"General space, site and content lister widget",
            "hasSettings": false,
            "id": "listgeneral",
            "i18n": {
                "default": "/devwidgets/listgeneral/bundles/default.json"
            },
            "name": "General Lister",
            "url": "/devwidgets/listgeneral/listgeneral.html"
        },
        "listpeople": {
            "description":"General people lister widget",
            "hasSettings": false,
            "id": "listpeople",
            "i18n": {
                "default": "/devwidgets/listpeople/bundles/default.json"
            },
            "name": "People Lister",
            "url": "/devwidgets/listpeople/listpeople.html"
        },
        "myfriends": {
            "description":"A list of my connections",
            "id":"myfriends",
            "multipleinstance": false,
            "i18n": {
                "default": "/devwidgets/myfriends/bundles/default.json",
                "en_US": "/devwidgets/myfriends/bundles/en_US.json",
                "zh_CN": "/devwidgets/myfriends/bundles/zh_CN.json"
            },
            "name":"My Contacts",
            "personalportal":true,
            "url":"/devwidgets/myfriends/myfriends.html"
        },
        "myprofile": {
            "description":"My Personal Profile",
            "name":"My Profile",
            "id":"myprofile",
            "personalportal":true,
            "i18n": {
                "default": "/devwidgets/myprofile/bundles/default.json",
                "en_US": "/devwidgets/myprofile/bundles/en_US.json",
                "zh_CN": "/devwidgets/myprofile/bundles/zh_CN.json"
            },
            "url":"/devwidgets/myprofile/myprofile.html"
        },
        "navigation": {
            "ca":true,
            "description":"Navigation Widgets",
            "hasSettings": false,
            "id":"navigation",
            "img":"/devwidgets/navigation/images/icon.png",
            "name":"Navigation",
            "showinsidebar":true,
            "url":"/devwidgets/navigation/navigation.html"
        },
        "navigationchat": {
            "description":"navigationchat",
            "i18n": {
                "default": "/devwidgets/navigationchat/bundles/default.json",
                "en_US": "/devwidgets/navigationchat/bundles/en_US.json",
                "nl_NL": "/devwidgets/navigationchat/bundles/nl_NL.json",
                "zh_CN": "/devwidgets/navigationchat/bundles/zh_CN.json"
            },
            "id":"navigationchat",
            "name":"navigationchat",
            "url":"/devwidgets/navigationchat/navigationchat.html"
        },
        "pickeruser": {
            "description":"General people picker widget",
            "hasSettings": false,
            "id": "pickeruser",
            "i18n": {
                "default": "/devwidgets/pickeruser/bundles/default.json"
            },
            "name": "People Picker",
            "url": "/devwidgets/pickeruser/pickeruser.html"
        },
        "poll": {
            "ca":true,
            "description":"Poll widget",
            "id":"poll",
            "img":"/devwidgets/poll/images/poll.png",
            "name":"Poll",
            "showinsakaigoodies":true,
            "url":"/devwidgets/poll/poll.html"
        },
        "quiz": {
            "ca":true,
            "description":"Quiz widget",
            "id":"quiz",
            "img":"/devwidgets/quiz/images/quiz.png",
            "name":"Quiz",
            "showinsakaigoodies":true,
            "url":"/devwidgets/quiz/quiz.html"
        },
        "recentmessages": {
            "description":"Your recent messages",
            "i18n": {
                "default": "/devwidgets/recentmessages/bundles/default.json",
                "en_US": "/devwidgets/recentmessages/bundles/en_US.json"
            },
            "id":"recentmessages",
            "name":"Recent Messages",
            "personalportal":true,
            "url":"/devwidgets/recentmessages/recentmessages.html"
        },
        "remotecontent": {
            "ca":true,
            "description":"Remote Content",
            "id":"remotecontent",
            "img":"/devwidgets/remotecontent/images/remotecontent.png",
            "name":"Remote Content",
            "showinsakaigoodies":true,
            "url":"/devwidgets/remotecontent/remotecontent.html"
        },
        "rss": {
            "ca":true,
            "description":"RSS Feed Reader",
            "hasSettings":true,
            "id":"rss",
            "img":"/devwidgets/rss/images/rss.png",
            "name":"RSS Feed",
            "showinsakaigoodies":true,
            "url":"/devwidgets/rss/rss.html"
        },
        "s23courses": {
            "description":"Your courses &amp; sites for Sakai2",
            "id":"s23courses",
            "name":"Sakai 2 Courses &amp; Projects",
            "personalportal":true,
            "url":"/devwidgets/s23/s23courses/s23courses.html"
        },
        "sendmessage": {
            "description":"Send a message",
            "i18n": {
                "default": "/devwidgets/sites/bundles/default.json",
                "zh_CN": "/devwidgets/sites/bundles/zh_CN.json"
            },
            "id":"sendmessage",
            "name":"Send a message",
            "url":"/devwidgets/sendmessage/sendmessage.html"
        },
        "sitemembers": {
            "ca":true,
            "description":"List of site members",
            "hasSettings":true,
            "id":"sitemembers",
            "img":"/devwidgets/sitemembers/images/sitemembers.png",
            "showinsakaigoodies":true,
            "siteportal":true,
            "name":"Site members",
            "url":"/devwidgets/sitemembers/sitemembers.html"
        },
        "siterecentactivity": {
            "ca":true,
            "description":"Site Recent Activity",
            "hasSettings": false,
            "id":"siterecentactivity",
            "img":"/devwidgets/siterecentactivity/images/icon.png",
            "name":"Recent Activity",
            "showinsidebar":true,
            "url":"/devwidgets/siterecentactivity/siterecentactivity.html"
        },
        "sites": {
            "description":"Listing of the sites I'm a member of",
            "i18n": {
                "default": "/devwidgets/sites/bundles/default.json",
                "en_US": "/devwidgets/sites/bundles/en_US.json",
                "zh_CN": "/devwidgets/sites/bundles/zh_CN.json"
            },
            "id":"sites",
            "name":"My Courses & Sites",
            "personalportal":true,
            "url":"/devwidgets/sites/sites.html"
        },
        "tangler": {
            "ca":true,
            "description":"Tangler Forum",
            "id":"tangler",
            "img":"/devwidgets/tangler/images/tangler.png",
            "name":"Tangler Forum",
            "showinsakaigoodies":true,
            "url":"/devwidgets/tangler/tangler.html"
        },
        "twitter": {
            "description":"Twitter Widget",
            "hasSettings":true,
            "i18n": {
                "default": "/devwidgets/twitter/bundles/default.json",
                "en_US": "/devwidgets/twitter/bundles/en_US.json",
                "nl_NL": "/devwidgets/twitter/bundles/nl_NL.json",
                "zh_CN": "/devwidgets/twitter/bundles/zh_CN.json"
            },
            "id":"twitter",
            "name":"Twitter",
            "personalportal":true,
            "url":"/devwidgets/twitter/twitter.html"
        },
        "uploadcontent": {
            "description": "Upload content to Sakai3",
            "i18n": {
                "default": "/devwidgets/uploadcontent/bundles/default.json"
            },
            "id": "uploadcontent",
            "name": "Upload Content",
            "url": "/devwidgets/uploadcontent/uploadcontent.html"
        },
        "video": {
            "ca":true,
            "description":"Video",
            "hasSettings":true,
            "id":"video",
            "img":"/devwidgets/video/images/video.png",
            "name":"Video",
            "showinmedia":true,
            "url":"/devwidgets/video/video.html"
        },
        "wookiechat": {
            "ca":true,
            "description":"wookiechat",
            "name":"Chat",
            "id":"wookiechat",
            "img":"/devwidgets/wookiechat/images/wookiechat.png",
            "url":"/devwidgets/wookiechat/wookiechat.html"
        },
        "wookieforum": {
            "ca":true,
            "description":"wookieforum",
            "id":"wookieforum",
            "img":"/devwidgets/wookieforum/images/icon.png",
            "name":"Wookie Forum",
            "url":"/devwidgets/wookieforum/wookieforum.html"
        },
        "youtubevideo": {
            "ca":true,
            "description":"YouTube Video",
            "id":"youtubevideo",
            "img":"/devwidgets/youtubevideo/images/video.png",
            "name":"YouTube Video",
            "url":"/devwidgets/youtubevideo/youtubevideo.html"
        }
    },
    "orders":[
        {
            "grouptype":"General",
            "widgets": ["mycoursesandprojects","messageoftheday","recentactivity"],
            "id":1,
            "layout": "twocolumnspecial"
        },
        {
            "grouptype":"Administrators",
            "widgets": ["mycoursesandprojects","messageoftheday","quickannouncement"],
            "id":1,
            "layout": "twocolumn"
        },
        {
            "grouptype":"Lecturers & Supervisors",
            "widgets":["mycoursesandprojects","recentactivity"],
            "id":2,
            "layout": "twocolumnspecial"
        },
        {
            "grouptype":"Researchers",
            "widgets":["recentactivity","mycoursesandprojects","messageoftheday"],
            "id":3,
            "layout": "threecolumn"
        },
        {
            "grouptype":"Students",
            "widgets":["recentactivity","mycoursesandprojects","quickannouncement","messageoftheday","myrssfeed"],
            "id":4,
            "layout": "fourcolumn"
        }
    ]
};
