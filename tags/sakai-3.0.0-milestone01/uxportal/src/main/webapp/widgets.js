var Widgets = {
	connections : [
		{
			id : 1,
			dir1 : "is my classmate",
			dir2 : "is my classmate"
		},
		{
			id: 2,
			dir1 : "is my supervisor",
			dir2 : "is being supervised by me"
		},
		{
			id: 3,
			dir1 : "is being supervised by me",
			dir2 : "is my supervisor"
		},
		{
			id: 4,
			dir1 : "is my lecturer",
			dir2 : "is my student"
		},
		{
			id: 5,
			dir1 : "is my student",
			dir2 : "is my lecturer"
		},
		{
			id: 6,
			dir1 : "is my colleague",
			dir2 : "is my colleague"
		},
		{
			id: 7,
			dir1 : "is my college mate",
			dir2 : "is my college mate"
		},
		{
			id: 8,
			dir1 : "shares an interest with me",
			dir2 : "shares an interest with me"
		},
		{
			id: 9,
			dir1 : "is something else",
			dir2 : "is something else"
		}
	],
	groups:[
		"Administrators",
		"Lecturers & Supervisors",
		"Researchers",
		"Students"],
	layouts : {
		dev : 
		{
			name:"Dev Layout",
			widths:[25,50,25]
		},
		twocolumn :
		{
			name:"Two equal columns",
			widths:[50,50]
		},
		threecolumn :
		{
			name:"Three equal columns",
			widths:[33,33,33]
		},
		twocolumnspecial :
		{
			name:"One wide and one narrow column",
			widths:[66,33]
		},
		fourcolumn :
		{
			name:"Four equal columns",
			widths:[25,25,25,25]
		}
		//,
		//onecolumn :
		//{
		//	name:"One column",
		//	widths:[100]
		//}
	},
	widgets: {
	    tools :
		{
			description:"A list of tools that are available for personal use\r\n",
			iframe:0,
			url:"/devwidgets/tools/tools.html",
			name:"Personal Tools",
			id:"tools",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/tools.png"
		},
		sites :
		{
			description:"Listing of the sites I'm a member of\r\n",
			iframe:0,
			url:"/devwidgets/sites/sites.html",
			name:"Sites",
			id:"sites",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/sites.png"
		},
		myprofile :
		{
			description:"My Personal Profile\r\n",
			iframe:0,
			url:"/devwidgets/myprofile/myprofile.html",
			name:"My Profile",
			id:"myprofile",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/myprofile.png"
		},
		helloworld :
		{
			description:"Sakai Hackathon Example\r\n",
			iframe:0,
			url:"/devwidgets/helloworld/helloworld.html",
			name:"Hello World",
			id:"helloworld",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/myprofile.png"
		},
		sparkline :
		{
			description:"Sparkline\r\n",
			iframe:0,
			url:"/devwidgets/sparkline/sparkline.html",
			name:"Sparkline",
			id:"sparkline",
			personalportal:0,
			siteportal:1,
			img:"/dev/img/sparkline.png"
		},
		createsite :
		{
			description:"Create site\r\n",
			iframe:0,
			url:"/devwidgets/createsite/createsite.html",
			name:"Create Site",
			id:"createsite",
			personalportal:0,
			siteportal:0,
			img:"/dev/img/sites.png"
		},
		myfriends :
		{
			description:"A list of my connections\r\n",
			iframe:0,
			url:"/devwidgets/myfriends/myfriends.html",
			name:"My Connections",
			id:"myfriends",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/myprofile.png",
			multipleinstance: false
		},
		announcementupdates :
		{
			description:"A list of Announcements & Updates\r\n",
			iframe:0,
			url:"/devwidgets/announcementupdates/announcementupdates.html",
			name:"Announcements & Updates",
			id:"announcementupdates",
			personalportal:0,
			siteportal:1,
			img:"/dev/img/myprofile.png",
			multipleinstance: false
		},
		pagemanagement :
		{
			description:"pagemanagement",
			iframe:0,
			url:"/devwidgets/pagemanagement/pagemanagement.html",
			name:"pagemanagement",
			id:"pagemanagement",
			personalportal:0,
			siteportal:0
		},
		mypreferences :
		{
			description:"mypreferences",
			iframe:0,
			url:"/devwidgets/mypreferences/mypreferences.html",
			name:"mypreferences",
			id:"mypreferences",
			personalportal:0,
			siteportal:0
		},
		myinbox :
		{
			description:"myinbox",
			iframe:0,
			url:"/devwidgets/myinbox/myinbox.html",
			name:"myinbox",
			id:"myinbox",
			personalportal:0,
			siteportal:0
		},
		sitemembers :
		{
			description:"Shows a list of all of the members of this site",
			iframe:0,
			url:"/devwidgets/sitemembers/sitemembers.html",
			name:"Site Members",
			id:"sitemembers",
			personalportal:0,
			siteportal:1,
			img:"/devwidgets/sitemembers/images/icon.png"
		},
		chat :
		{
			description:"chat",
			iframe:0,
			url:"/devwidgets/chat/chat.html",
			name:"chat",
			id:"chat",
			personalportal:0,
			siteportal:0
		},
		youtubevideo :
		{
			description:"YouTube Video",
			iframe:0,
			url:"/devwidgets/youtubevideo/youtubevideo.html",
			name:"YouTube Video",
			id:"youtubevideo",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/youtubevideo/images/icon.png"
		},
		tangler :
		{
			description:"Tangler Forum",
			iframe:0,
			url:"/devwidgets/tangler/tangler.html",
			name:"Tangler Forum",
			id:"tangler",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/tangler/images/tangler.png"
		},
		singlefile :
		{
			description:"Single File Reference",
			iframe:0,
			url:"/devwidgets/singlefile/singlefile.html",
			name:"Single File Reference",
			id:"singlefile",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/singlefile/images/singlefile.png"
		},
		comments :
		{
			description:"Comments",
			iframe:0,
			url:"/devwidgets/comments/comments.html",
			name:"Comments",
			id:"comments",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/comments/images/icon.png"
		},
		poll :
		{
			description:"Poll",
			iframe:0,
			url:"/devwidgets/poll/poll.html",
			name:"Poll",
			id:"poll",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/poll/images/poll.png"
		},
		Resources :
		{
			description:"Resources tool",
			iframe:"0",
			url:"/devwidgets/Resources/Resources.html",
			name:"Resources",
			id:"resources",
			personalportal:0,
			siteportal:0,
			history : {"init":"Resources.initHistory","nav":"Resources.browser.printResources",tag:"Resources.tagging.showTagViewReal"}
		},
		polltracker :
		{
			description:"Track the results of all of the polls on the sites you are a member of",
			iframe:0,
			url:"/devwidgets/polltracker/polltracker.html",
			name:"Poll Tracker",
			id:"polltracker",
			personalportal:1,
			siteportal:0,
			multipleinstance: true,
			img:"/devwidgets/polltracker/images/poll_icon.gif"
		},
		/*
		contactinformation :
		{
			description:"contactinformation",
			iframe:0,
			url:"/devwidgets/contactinformation/contactinformation.html",
			name:"Contact Information",
			id:"contactinformation",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/contactinformation/images/icon.jpg"
		},*/
		navigation :
		{
			description:"navigation",
			iframe:0,
			url:"/devwidgets/navigation/navigation.html",
			name:"Navigation",
			id:"navigation",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/navigation/images/navigation.png"
		},
		form :
		{
			description:"form",
			iframe:0,
			url:"/devwidgets/form/form.html",
			name:"Form",
			id:"form",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/form/images/form.png"
		}/*
,
		timeplot :
		{
			description:"timeplot",
			iframe:0,
			url:"/devwidgets/timeplot/partIA/index.html",
			name:"timeplotr",
			id:"timeplot",
			ca: 1,
			personalportal:0,
			siteportal:0,
			multipleinstance: true,
			img:"/devwidgets/polltracker/images/poll_icon.gif"
		}
*/
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



