var Widgets = {
    relationships : [
        {name : "Classmate", definition : "is my classmate"},
        {name : "Supervisor", inverse : "Supervised", definition : "is my supervisor"},
        {name : "Supervised", inverse : "Supervisor", definition : "is being supervised by me"},
        {name : "Lecturer", inverse : "Student", definition : "is my lecturer"},
        {name : "Student", inverse : "Lecturer", definition : "is my student"},
        {name : "Colleague", definition : "is my colleague"},
        {name : "College Mate", definition : "is my college mate"},
        {name : "Shares Interests", definition : "shares an interest with me"}
    ],
    groups:[
        "Administrators",
        "Lecturers & Supervisors",
        "Researchers",
        "Students"],
    layouts : {
        onecolumn : {
            name:"One column",
            widths:[100],
            siteportal: true
        },
        dev : {
            name:"Dev Layout",
            widths:[50,50],
            siteportal: true
        },
        threecolumn : {
            name:"Three equal columns",
            widths:[33,33,33],
            siteportal: false
        },
        fourcolumn : {
            name:"Four equal columns",
            widths:[25,25,25,25],
            siteportal: false
        },
        fivecolumn : {
            name:"Five equal columns",
            widths:[20,20,20,20,20],
            siteportal: false
        }
    },
    widgets: {
        addtocontacts: {
            description:"Add a contact",
            id:"addtocontacts",
            i18n: {
                "default": "/devwidgets/addtocontacts/bundles/default.json",
                "en_US": "/devwidgets/addtocontacts/bundles/en_US.json",
                "zh_CN": "/devwidgets/addtocontacts/bundles/zh_CN.json"
            },
            name:"Add a contact",
            url:"/devwidgets/addtocontacts/addtocontacts.html"
        },
        camtoolscourses: {
            description:"Your courses &amp; sites for Camtools 2008",
            id:"camtoolscourses",
            name:"Camtools 2008 Courses &amp; Projects",
            url:"/devwidgets/camtoolscourses/camtoolscourses.html"
        },
        changepic: {
            i18n: {
                "default": "/devwidgets/changepic/bundles/default.json",
                "zh_CN": "/devwidgets/changepic/bundles/zh_CN.json"
            },
            id:"changepic",
            name:"changepic",
            url:"/devwidgets/changepic/changepic.html"
        },
        comments: {
            description:"Comments",
            ca:true,
            hasSettings:true,
            id:"comments",
            img:"/devwidgets/comments/images/comments.png",
            name:"Comments",
            showinsakaigoodies:true,
            siteportal:true,
            url:"/devwidgets/comments/comments.html"
        },
        createsite: {
            description:"Create site",
            name:"Create Site",
            id:"createsite",
            i18n: {
                "default": "/devwidgets/createsite/bundles/default.json",
                "zh_CN": "/devwidgets/createsite/bundles/zh_CN.json"
            },
            url:"/devwidgets/createsite/createsite.html"
        },
        discussion: {
            ca:true,
            description:"Discussion widget",
            id:"discussion",
            img:"/devwidgets/discussion/images/discussion.png",
            i18n: {
                "default": "/devwidgets/discussion/bundles/default.json",
                "en_US": "/devwidgets/discussion/bundles/en_US.json",
                "zh_CN": "/devwidgets/discussion/bundles/zh_CN.json"
            },
            name:"Discussion",
            showinsakaigoodies:true,
            url:"/devwidgets/discussion/discussion.html"
        },
        footer: {
            description:"Dynamic Footer with Debug Info",
            i18n: {
                "default": "/devwidgets/footer/bundles/default.json",
                "en_US": "/devwidgets/footer/bundles/en_US.json",
                "zh_CN": "/devwidgets/footer/bundles/zh_CN.json"
            },
            id:"footer",
            name:"Dynamic Footer",
            url:"/devwidgets/footer/footer.html"
        },
        filemanager: {
            description:"filemanager",
            name:"filemanager",
            id:"filemanager",
            url:"/devwidgets/filemanager/filemanager.html"
        },
        filepicker: {
            description:"Pick a file.",
            name:"File",
            id:"filepicker",
            img:"/devwidgets/discussion/images/discussion.png",
            hasSettings: true,
            showinsakaigoodies:true,
            url:"/devwidgets/pickers/filepicker.html"
        },
        folderpicker: {
            description:"Pick a folder.",
            hasSettings:false,
            id:"folderpicker",
            img:"/devwidgets/discussion/images/discussion.png",
            name:"Folder",
            showinsakaigoodies:true,
            url:"/devwidgets/pickers/folderpicker.html"
        },
        googlemaps: {
            ca:true,
            description:"Google maps",
            i18n: {
                "default": "/devwidgets/googlemaps/bundles/default.json",
                "en_US": "/devwidgets/googlemaps/bundles/en_US.json",
                "zh_CN": "/devwidgets/googlemaps/bundles/zh_CN.json"
            },
            id:"googlemaps",
            img:"/devwidgets/googlemaps/images/googlemaps.png",
            name:"Googlemaps",
            showinsakaigoodies:true,
            url:"/devwidgets/googlemaps/googlemaps.html"
        },
        helloworld: {
            description:"Sakai Hackathon Example",
            hasSettings:true,
            id:"helloworld",
            img:"/dev/img/myprofile.png",
            name:"Hello World",
            url:"/devwidgets/helloworld/helloworld.html"
        },
        helloworldwow: {
            description:"GWT Widget Example",
            gwt:true,
            hasSettings:true,
            id:"helloworldwow",
            img:"/dev/img/myprofile.png",
            name:"Hello World GWT",
            url:"/devwidgets/helloworldwow/war/Helloworldwow.html"
        },
        myfriends: {
            description:"A list of my connections",
            i18n: {
                "default": "/devwidgets/myfriends/bundles/default.json",
                "zh_CN": "/devwidgets/myfriends/bundles/zh_CN.json"
            },
            id:"myfriends",
            img:"/dev/img/myprofile.png",
            multipleinstance: false,
            name:"My Contacts",
            personalportal:true,
            url:"/devwidgets/myfriends/myfriends.html"
        },
        myprofile: {
            description:"My Personal Profile",
            name:"My Profile",
            id:"myprofile",
            personalportal:true,
            img:"/dev/img/myprofile.png",
            i18n: {
                "default": "/devwidgets/myprofile/bundles/default.json",
                "en_US": "/devwidgets/myprofile/bundles/en_US.json",
                "zh_CN": "/devwidgets/myprofile/bundles/zh_CN.json"
            },
            url:"/devwidgets/myprofile/myprofile.html"
        },
        navigation: {
            ca:true,
            description:"Navigation Widgets",
            hasSettings: false,
            id:"navigation",
            img:"/devwidgets/navigation/images/icon.png",
            name:"Navigation",
            showinsidebar:true,
            url:"/devwidgets/navigation/navigation.html"
        },
        navigationchat: {
            description:"navigationchat",
            i18n: {
                "default": "/devwidgets/navigationchat/bundles/default.json",
                "en_US": "/devwidgets/navigationchat/bundles/en_US.json",
                "zh_CN": "/devwidgets/navigationchat/bundles/zh_CN.json"
            },
            id:"navigationchat",
            name:"navigationchat",
            url:"/devwidgets/navigationchat/navigationchat.html"
        },
        poll: {
            ca:true,
            description:"Poll widget",
            id:"poll",
            img:"/devwidgets/poll/images/poll.png",
            name:"Poll",
            showinsakaigoodies:true,
            url:"/devwidgets/poll/poll.html"
        },
        quiz: {
            ca:true,
            description:"Quiz widget",
            id:"quiz",
            img:"/devwidgets/quiz/images/quiz.png",
            name:"Quiz",
            showinsakaigoodies:true,
            url:"/devwidgets/quiz/quiz.html"
        },
        remotecontent: {
            ca:true,
            description:"Remote Content",
            id:"remotecontent",
            img:"/devwidgets/remotecontent/images/remotecontent.png",
            name:"Remote Content",
            showinsakaigoodies:true,
            url:"/devwidgets/remotecontent/remotecontent.html"
        },
        Resources: {
            description:"Resources tool",
            history: {"init":"Resources.initHistory","nav":"Resources.browser.printResources",tag:"Resources.tagging.showTagViewReal"},
            id:"resources",
            name:"Resources",
            url:"/devwidgets/Resources/Resources.html"
        },
        rss: {
            ca:true,
            description:"RSS Feed Reader",
            hasSettings:true,
            id:"rss",
            img:"/devwidgets/rss/images/rss.png",
            name:"RSS Feed",
            showinsakaigoodies:true,
            url:"/devwidgets/rss/rss.html"
        },
        s23courses: {
            description:"Your courses &amp; sites for Sakai2",
            id:"s23courses",
            name:"Sakai 2 Courses &amp; Projects",
            personalportal:true,
            url:"/devwidgets/s23/s23courses/s23courses.html"
        },
        sendmessage: {
            description:"Send a message",
            i18n: {
                "default": "/devwidgets/sites/bundles/default.json",
                "zh_CN": "/devwidgets/sites/bundles/zh_CN.json"
            },
            id:"sendmessage",
            name:"Send a message",
            url:"/devwidgets/sendmessage/sendmessage.html"
        },
        sitemembers: {
            ca:true,
            description:"List of site members",
            hasSettings:true,
            id:"sitemembers",
            img:"/devwidgets/sitemembers/images/sitemembers.png",
            showinsakaigoodies:true,
            siteportal:true,
            name:"Site members",
            url:"/devwidgets/sitemembers/sitemembers.html"
        },
        siterecentactivity: {
            ca:true,
            description:"Site Recent Activity",
            hasSettings: false,
            id:"siterecentactivity",
            img:"/devwidgets/siterecentactivity/images/icon.png",
            name:"Recent Activity",
            showinsidebar:true,
            url:"/devwidgets/siterecentactivity/siterecentactivity.html"
        },
        sites: {
            description:"Listing of the sites I'm a member of",
            i18n: {
                "default": "/devwidgets/sites/bundles/default.json",
                "en_US": "/devwidgets/sites/bundles/en_US.json",
                "zh_CN": "/devwidgets/sites/bundles/zh_CN.json"
            },
            id:"sites",
            name:"My Courses & Sites",
            personalportal:true,
            url:"/devwidgets/sites/sites.html"
        },
        tangler: {
            ca:true,
            description:"Tangler Forum",
            id:"tangler",
            img:"/devwidgets/tangler/images/tangler.png",
            name:"Tangler Forum",
            showinsakaigoodies:true,
            url:"/devwidgets/tangler/tangler.html"
        },
        tagpicker: {
            description:"Pick a tag.",
            id:"tagpicker",
            img:"/devwidgets/discussion/images/discussion.png",
            name:"Tag",
            url:"/devwidgets/pickers/tagpicker.html"
        },
        tlrp: {
            description:"TLRP BERA Widget",
            id:"tlrp",
            img:"/devwidgets/tlrp/images/tlrp.png",
            name:"TLRP BERA",
            url:"/devwidgets/tlrp/tlrp.html"
        },
        twitter: {
            description:"Twitter Widget",
            hasSettings:true,
            i18n: {
                "default": "/devwidgets/twitter/bundles/default.json",
                "en_US": "/devwidgets/twitter/bundles/en_US.json",
                "zh_CN": "/devwidgets/twitter/bundles/zh_CN.json"
            },
            id:"twitter",
            img:"/dev/img/myprofile.png",
            name:"Twitter",
            personalportal:true,
            url:"/devwidgets/twitter/twitter.html"
        },
        video: {
            ca:true,
            description:"Video",
            hasSettings:true,
            id:"video",
            img:"/devwidgets/video/images/video.png",
            name:"Video",
            showinmedia:true,
            url:"/devwidgets/video/video.html"
        },
        wookiechat: {
            ca:true,
            description:"wookiechat",
            name:"Chat",
            id:"wookiechat",
            img:"/devwidgets/wookiechat/images/wookiechat.png",
            url:"/devwidgets/wookiechat/wookiechat.html"
        },
        wookieforum: {
            ca:true,
            description:"wookieforum",
            id:"wookieforum",
            img:"/devwidgets/wookieforum/images/wookieforum.png",
            name:"Wookie Forum",
            url:"/devwidgets/wookieforum/wookieforum.html"
        },
        youtubevideo: {
            ca:true,
            description:"YouTube Video",
            id:"youtubevideo",
            img:"/devwidgets/youtubevideo/images/video.png",
            name:"YouTube Video",
            url:"/devwidgets/youtubevideo/youtubevideo.html"
        }
    },
    orders:[
        {
            grouptype:"General",
            widgets: ["mycoursesandprojects","messageoftheday","recentactivity"],
            id:1,
            layout: "twocolumnspecial"
        },
        {
            grouptype:"Administrators",
            widgets: ["mycoursesandprojects","messageoftheday","quickannouncement"],
            id:1,
            layout: "twocolumn"
        },
        {
            grouptype:"Lecturers & Supervisors",
            widgets:["mycoursesandprojects","recentactivity"],
            id:2,
            layout: "twocolumnspecial"
        },
        {
            grouptype:"Researchers",
            widgets:["recentactivity","mycoursesandprojects","messageoftheday"],
            id:3,
            layout: "threecolumn"
        },
        {
            grouptype:"Students",
            widgets:["recentactivity","mycoursesandprojects","quickannouncement","messageoftheday","myrssfeed"],
            id:4,
            layout: "fourcolumn"
        }
    ]
};