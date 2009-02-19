var sakai = sakai || {};
sakai.people = function(){
  
  	var page = false;
	var totalpages = false;
	var list = false;
	var mylist = false;
	var pendinglist = false;
  	var tosearchfor = false;
	var empty = true;
	var isbusy = false;
	
	sdata.Ajax.request({
		httpMethod: "GET",
		url: "/rest/me?sid=" + Math.random(),
		onSuccess: function(data){
			var me = eval('(' + data + ')');
			if (!me.preferences.uuid){
				var redirect = document.location;
				document.location = "/dev/?url=" + sdata.util.URL.encode(redirect.pathname + redirect.search + redirect.hash);
			}
			$("#user_id").text(me.profile.firstName + " " + me.profile.lastName);
		},
		onFail: function(status){
				
		}
	});	
	
	var startMyInvitations = function(){
		$("#list_rendered_my").html("<img scr='/devwidgets/Resources/images/ajax-loader.gif'/><br/>");
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/friend/status?p=0&n=5&friendStatus=INVITED&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			onSuccess: function(data){
				mylist = eval('(' + data + ')');
				printMyList();
			},
			onFail: function(status){
				$("#list_rendered_my").html("<b>An error has occurred.</b> Please try again later");
			}
		});
	}
	
	var startPendingInvitations = function(){
		$("#list_rendered_pending").html("<img scr='/devwidgets/Resources/images/ajax-loader.gif'/><br/>");
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/friend/status?p=0&n=5&friendStatus=PENDING&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			onSuccess: function(data){
				pendinglist = eval('(' + data + ')');
				printPendingList();
			},
			onFail: function(status){
				$("#list_rendered_pending").html("<b>An error has occurred.</b> Please try again later");
			}
		});
	}
	
	var startSearch = function(){
		page = 1;
		doSearch(page);
	}
	
	var doSearch = function(page){
		
		$("#list_rendered").html("<img scr='/devwidgets/Resources/images/ajax-loader.gif'/><br/>");
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/friend/status?p=" + (page - 1) + "&n=5&friendStatus=ACCEPTED&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			onSuccess: function(data){
				list = eval('(' + data + ')');
				printList();
			},
			onFail: function(status){
				$("#list_rendered").html("<b>An error has occurred.</b> Please try again later");
			}
		});
	}
	
	var printMyList = function(){
		doMyList();
	}
	
	var printPendingList = function(){
		doPendingList();
	}
	
	var printList = function(){
		$("#paging").show();
		if (page == 1) {
			doPaging();
		}
		if (totalpages == 1){
			$("#un_prev").show();
			$("#prev").hide();
			$("#un_next").show();
			$("#next").hide();
		} else if (page == 1){
			$("#un_prev").show();
			$("#prev").hide();
			$("#un_next").hide();
			$("#next").show();
		} else if (page == totalpages){
			$("#un_prev").hide();
			$("#prev").show();
			$("#un_next").show();
			$("#next").hide();
		} else {
			$("#un_prev").hide();
			$("#prev").show();
			$("#un_next").hide();
			$("#next").show();
		}
		doList();
	}
	
	var doPaging = function(){
		
		isbusy = true;
		
		$("#numberofresults").text(list.total);
		
		totalpages = Math.ceil(list.total / 5);
		
		var select = document.getElementById("pages");
		select.options.length = 0;
		
		for (var i = 0; i < totalpages; i++) {
			var ii = new Option("Page " + (i + 1) + " of " + totalpages, (i + 1));
			select.options[select.options.length] = ii;
		}
		
		isbusy = false;
				
	}
	
	$("#pages").bind("change", function(ev){
		if (!isbusy) {
			var select = document.getElementById("pages");
			var index = select.selectedIndex;
			var val = select.options[index].value;
			var npage = parseInt(val);
			page = npage;
			doSearch(page);
		}
	});
	
	$("#next").bind("click", function(ev){
		page++;
		
		var select = document.getElementById("pages");
		
		select.selectedIndex = page - 1;
		
		doSearch(page);
	});
	
	$("#prev").bind("click", function(ev){
		page = page - 1;
		var select = document.getElementById("pages");
		
		select.selectedIndex = page - 1;
		doSearch(page);
	});
	
	var processList = function(list_var){
		var finaljson = {};
		finaljson.items = [];
		if (list_var.status.friends) {
			for (var i = 0; i < list_var.status.friends.length; i++) {
				var person = list_var.status.friends[i];
				if (person) {
					var index = finaljson.items.length;
					finaljson.items[index] = {};
					finaljson.items[index].userid = person.friendUuid;
					if (person.profile.picture) {
						var picture = eval('(' + person.profile.picture + ')');
						finaljson.items[index].picture = "/sdata/f/_private/" + person.properties.userStoragePrefix + picture.name;
					}
					if (person.profile.firstName || person.profile.lastName) {
						var str = person.profile.firstName;
						if (person.profile.basic) {
							var basic = eval('(' + person.profile.basic + ')');
							if (basic.middlename) {
								str + " " + basic.middlename;
							}
						}
						str += " " + person.profile.lastName;
						finaljson.items[index].name = str;
					}
					else {
						finaljson.items[index].name = person.friendUuid;
					}
					if (person.profile.contactinfo) {
						var contactinfo = eval('(' + person.profile.contactinfo + ')');
						if (contactinfo.unidepartment) {
							finaljson.items[index].department = contactinfo.unidepartment;
						}
						if (contactinfo.unicollege) {
							finaljson.items[index].college = contactinfo.unicollege;
						}
					}
				}
			}
		}
		
		return finaljson;
	}
	
	var doList = function(){
		var finaljson = processList(list);	
		$("#list_rendered").html(sdata.html.Template.render("list_rendered_template", finaljson));
	}
	
	var doMyList = function(){
		var finaljson = processList(mylist);	
		$("#list_rendered_my").html(sdata.html.Template.render("my_list_rendered_template", finaljson));
		
		$(".accept_invitation").bind("click", function(ev){
			var user = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			
			var inviter = user;
			var data = {"friendUuid" : inviter};
	
			sdata.Ajax.request({
				url: "/rest/friend/connect/accept",
				httpMethod: "POST",
				onSuccess: function(data){
					startSearch();
					startMyInvitations();
				},
				onFail : function(data){
					alert("An error has occured");
				},
				postData: data,
				contentType: "application/x-www-form-urlencoded"
			});
			
		});
		
		
	}
	
	var doPendingList = function(){
		var finaljson = processList(pendinglist);	
		$("#list_rendered_pending").html(sdata.html.Template.render("pending_list_rendered_template", finaljson));
	}
	
	startSearch();
	startMyInvitations();
    startPendingInvitations();
   
};

sdata.registerForLoad("sakai.people");
