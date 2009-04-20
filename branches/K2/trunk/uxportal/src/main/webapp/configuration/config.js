var Config = {
	logoutUrl : "/dev/redesign/index.html",
	Profile : {
		// Fields that cannot be edited and so controlled by LDAP, ...
   		uneditable : ["txt_firstname","txt_lastname"]
	},
	Connections : {
		Invitation : {
			title : "${user} has invited you to become a connection",
			body : "Hi, \n\n ${user} has invited you to become a connection. \nHe/She has also left the following message: \n\n ${comment} \n\nTo accept this invitation, please click on the accept button. \n\nKind regards,\n\nThe Sakai Team"
		}
	},	
	Site : {
		Roles : ["Collaborator", "Viewer"]
	}
};