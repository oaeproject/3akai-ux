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
		url: "/sdata/me?sid=" + Math.random(),
		onSuccess: function(data){
			var me = eval('(' + data + ')');
			$("#user_id").text(me.items.firstname + " " + me.items.lastname);
		},
		onFail: function(status){
				
		}
	});	
	
	var startMyInvitations = function(){
		$("#list_rendered_my").html("<img scr='/devwidgets/Resources/images/ajax-loader.gif'/><br/>");
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/connection?show=waiting&count=all&sid=" + Math.random(),
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
			url: "/sdata/connection?show=pending&count=all&sid=" + Math.random(),
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
			url: "/sdata/connection?show=accepted&page=" + page + "&count=5&sid=" + Math.random(),
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
	
	var doList = function(){
		var finaljson = {};
		finaljson.items = [];
		for (var i = 0; i < 10; i++){
			try {
				var person = list.items[i];
				if (person) {
					var index = finaljson.items.length;
					finaljson.items[index] = {};
					finaljson.items[index].userid = person.userid;
					var person = list.items[i];
					if (person.picture) {
						var picture = eval('(' + person.picture + ')');
						finaljson.items[index].picture = "/sdata/f/public/" + person.userid + "/" + picture.name;
					}
					if (person.firstName || person.lastName) {
						var str = person.firstName;
						if (person.basic) {
							var basic = eval('(' + person.basic + ')');
							if (basic.middlename) {
								str + " " + basic.middlename;
							}
						}
						str += " " + person.lastName;
						finaljson.items[index].name = str;
					}
					else {
						finaljson.items[index].name = person.userid;
					}
					if (person.contactinfo){
						var contactinfo = eval('(' + person.contactinfo + ')');
						if (contactinfo.unidepartment){
							finaljson.items[index].department = contactinfo.unidepartment;
						}
						if (contactinfo.unicollege){
							finaljson.items[index].college = contactinfo.unicollege;
						}
					}
				}
			} catch (err){
				alert(err);
			};
		}
		
		$("#list_rendered").html(sdata.html.Template.render("list_rendered_template", finaljson));
		
	}
	
	var doMyList = function(){
		var finaljson = {};
		finaljson.items = [];
		for (var i = 0; i < mylist.items.length; i++){
			try {
				var person = mylist.items[i];
				if (person) {
					var index = finaljson.items.length;
					finaljson.items[index] = {};
					finaljson.items[index].userid = person.userid;
					if (person.picture) {
						var picture = eval('(' + person.picture + ')');
						finaljson.items[index].picture = "/sdata/f/public/" + person.userid + "/" + picture.name;
					}
					if (person.firstName || person.lastName) {
						var str = person.firstName;
						if (person.basic) {
							var basic = eval('(' + person.basic + ')');
							if (basic.middlename) {
								str + " " + basic.middlename;
							}
						}
						str += " " + person.lastName;
						finaljson.items[index].name = str;
					}
					else {
						finaljson.items[index].name = person.userid;
					}
					if (person.contactinfo){
						var contactinfo = eval('(' + person.contactinfo + ')');
						if (contactinfo.unidepartment){
							finaljson.items[index].department = contactinfo.unidepartment;
						}
						if (contactinfo.unicollege){
							finaljson.items[index].college = contactinfo.unicollege;
						}
					}
				}
			} catch (err){
				alert(err);
			};
		}
		
		$("#list_rendered_my").html(sdata.html.Template.render("my_list_rendered_template", finaljson));
		
		$(".accept_invitation").bind("click", function(ev){
			var user = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			
			var inviter = user;
			var data = {"accept" : true, "inviter" : inviter};
			
			sdata.Ajax.request({
				url: "/sdata/connection/?sid=" + Math.random(),
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
		var finaljson = {};
		finaljson.items = [];
		for (var i = 0; i < pendinglist.items.length; i++){
			try {
				var person = pendinglist.items[i];
				if (person) {
					var index = finaljson.items.length;
					finaljson.items[index] = {};
					finaljson.items[index].userid = person.userid;
					if (person.picture) {
						var picture = eval('(' + person.picture + ')');
						finaljson.items[index].picture = "/sdata/f/public/" + person.userid + "/" + picture.name;
					}
					if (person.firstName || person.lastName) {
						var str = person.firstName;
						if (person.basic) {
							var basic = eval('(' + person.basic + ')');
							if (basic.middlename) {
								str + " " + basic.middlename;
							}
						}
						str += " " + person.lastName;
						finaljson.items[index].name = str;
					}
					else {
						finaljson.items[index].name = person.userid;
					}
					if (person.contactinfo){
						var contactinfo = eval('(' + person.contactinfo + ')');
						if (contactinfo.unidepartment){
							finaljson.items[index].department = contactinfo.unidepartment;
						}
						if (contactinfo.unicollege){
							finaljson.items[index].college = contactinfo.unicollege;
						}
					}
				}
			} catch (err){
				alert(err);
			};
		}
		
		$("#list_rendered_pending").html(sdata.html.Template.render("pending_list_rendered_template", finaljson));
		
	}
	
	startSearch();
	startMyInvitations();
    startPendingInvitations();
   
};

sdata.registerForLoad("sakai.people");
