var sakai = sakai || {};

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
    "defaults": {
      "personalportal":{
        "layout": "dev",
        "columns": [["sites", "myfriends"], ["myprofile"]]
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

/**
 * Store the overall widget configuration object in memory
 * @param {Object} widgets
 * JSON Object that is an aggregation of all widget config.json files
 */
sakai.storeWidgets = function(widgets){
    Widgets.widgets = widgets;
};