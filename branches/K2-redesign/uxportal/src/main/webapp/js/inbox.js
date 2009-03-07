var sakai = sakai || {};

sakai._inbox = {};

sakai.inbox = function(){
  
  	var page = 1;
	var totalpages = false;
	var list = false;
  	var tosearchfor = false;
	var empty = true;
	var isbusy = false;
	var message = false;
	
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
	
	var loadList = function(page){
		
		$("#list_rendered").html("<img scr='/devwidgets/Resources/images/ajax-loader.gif'/><br/>");
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/message?list=true&page=" + page + "&items=5&sid=" + Math.random(),
			onSuccess: function(data){
				list = eval('(' + data + ')');
				printList();
			},
			onFail: function(status){
				$("#list_rendered").html("<b>An error has occurred.</b> Please try again later");
			}
		});
	}

	sakai._inbox.startShowingList = function(){
		
		$("#messagedetail").hide();
		$("#new_message_main").hide();
		$("#listingcontent").show();
		loadList(page);
		
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
		
		if (totalpages == 0){
			$("#paging").hide();
		} else {
			$("#paging").show();
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
			loadList(page);
		}
	});
	
	$("#next").bind("click", function(ev){
		page++;
		
		var select = document.getElementById("pages");
		
		select.selectedIndex = page - 1;
		
		loadList(page);
	});
	
	$("#prev").bind("click", function(ev){
		page = page - 1;
		var select = document.getElementById("pages");
		
		select.selectedIndex = page - 1;
		loadList(page);
	});
	
	var doList = function(){
		
		for (var i = 0; i < list.items.length; i++){
			var el = list.items[i];
			if (!el.profileinfo){
				el.profileinfo = {};
				el.profileinfo.userid = el.sender;
			}
			if (el.profileinfo.picture){
				var pict = eval('(' + el.profileinfo.picture + ')');
				el.picture = "/sdata/f/public/" + el.sender + "/" + pict.name;
			} 
			if (el.profileinfo.firstName && el.profileinfo.lastName){
				el.name = el.profileinfo.firstName + " " + el.profileinfo.lastName;
			} else {
				el.name = el.profileinfo.userid;
			}
			if (el.title.length > 100){
				el.title = el.title.substring(0, 100) + " ...";
			}
			//el.message = el.message.split("\n")[0];
			if (el.message.length > 100){
				el.message = el.message.substring(0, 100) + " ...";
			}
		}
		
		$("#list_rendered").html(sdata.html.Template.render("list_rendered_template", list));
		
		$(".message_list").bind("click", function(ev){
			var id = ev.currentTarget.id.split("_")[ev.currentTarget.id.split.length];
			showMessage(id);
		});
		
		$(".message_remove").bind("click", function(ev){
			var id = ev.currentTarget.id.split("_");
			var data = {"delete" : true , "id" : id[id.length - 1]};
			sdata.Ajax.request({
				url: "/sdata/message/?sid=" + Math.random(),
				httpMethod: "POST",
				onSuccess: function(data){
					sakai._inbox.startShowingList();
				},
				onFail : function(data){
					//alert("An error has occured");
				},
				postData: data,
				contentType: "application/x-www-form-urlencoded"
			});
		});
	}
	
	var currentmessage = false;
	
	sakai._inbox.showMessage = function(id){
		currentmessage = id;
		sdata.Ajax.request({
				httpMethod: "GET",
				url: "/sdata/message?id=" + id + "&sid=" + Math.random(),
				onSuccess: function(data){
					var json = eval('(' + data + ')');
					message = json;
					json.item.message = json.item.message.replace(/\n/g,"<br/>");
					
					if (json.item.profileinfo.firstName && json.item.profileinfo.lastName){
						json.item.name = json.item.profileinfo.firstName + " " + json.item.profileinfo.lastName;
					} else {
						json.item.name = json.item.profileinfo.displayName;
					}
					
					$("#listingcontent").hide();
					$("#new_message_main").hide();
					$("#messagedetail").show();
					$("#messagedetail").html(sdata.html.Template.render("messagedetail_template", json));
					
					$("#back_to_inbox").bind("click", function(ev){
						History.addBEvent("list");
					});
					$("#message_accept_invitation").bind("click", function(ev){
						var inviter = message.item.sender;
						var data = {"accept" : true, "inviter" : inviter};
							
						sdata.Ajax.request({
							url: "/sdata/connection/?sid=" + Math.random(),
							httpMethod: "POST",
							onSuccess: function(data){
								sakai._inbox.showMessage(id);
							},
							onFail : function(data){
								//alert("An error has occured");
							},
							postData: data,
							contentType: "application/x-www-form-urlencoded"
						});
	
					});
					
					try {
						sakai.MyInbox.doInit();
					} catch (err){}
					
					$("#message_start_reply").bind("click", function(ev){
						History.addBEvent("reply|" + currentmessage);
					});
					
				},
				onFail: function(status){
					$("#listingcontent").hide();
					$("#messagedetail").show();
					$("#messagedetail").html("This message cannot be found");
				}
			});
	}
	
	$("#cancel_send_message").bind("click", function(ev){
		History.addBEvent("list");
	});
	
	$("#send_new_message").bind("click", function(ev){
		History.addBEvent("new");
	});
	
	sakai._inbox.startNewMessage = function(user){
		
		$("#new_title_txt").attr("value","");
		$("#new_message_txt").attr("value","");
		
		$("#new_to").css("color","#000000");
		$("#new_title").css("color","#000000");
		$("#new_message").css("color","#000000");
		
		$("#messagedetail").hide();
		$("#listingcontent").hide();
		$("#new_message_main").show();
		
		sdata.Ajax.request({
			url: "/rest/friend/status?p=0&n=100&friendStatus=ACCEPTED&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			httpMethod: "GET",
			onSuccess: function(data){
				var json = eval('(' + data + ')');
				
				var select = $("#message_to").get(0);
				
				// Remove all options
				
				select.options.length = 0;
				
				// Add new basic option
				
				var op = new Option("-- Select a connection --","");
				select.options[select.options.length] = op;
				
				// Add all your friends
				
				if (json.status.friends) {
					for (var i = 0; i < json.status.friends.length; i++) {
						var name = json.status.friends[i].friendUuid;
						if (json.status.friends[i].profile.firstName && json.status.friends[i].profile.lastName) {
							name =json.status.friends[i].profile.firstName + " " + json.status.friends[i].profile.lastName;
						}
						var op = new Option(name, json.status.friends[i].friendUuid);
						select.options[select.options.length] = op;
					}
				}
				
				if (user){
					for (var i = 0; i < select.options.length; i++){
						if (select.options[i].value == user){
							select.selectedIndex = i;
						}
					}
				}
				
			},
			onFail : function(data){
				//alert("An error has occured");
			}
		});
		
	}
	
	$("#do_new_message").bind("click", function(ev){
		var res = sdata.FormBinder.serialize($("#new_form"));
		
		$("#new_to").css("color","#000000");
		$("#new_title").css("color","#000000");
		$("#new_message").css("color","#000000");
		
		var fine = true;
		if (!res["message_to"][0]){
			$("#new_to").css("color","#FF0000");
			fine = false;
		}
		
		if (!res["new_title_txt"]){
			$("#new_title").css("color","#FF0000");
			fine = false;
		}
		
		if (!res["new_message_txt"]){
			$("#new_message").css("color","#FF0000");
			fine = false;
		}
		
		if (fine){
			
			data = { "isinvite" : false , "receiver" : res["message_to"][0] , "title" : res["new_title_txt"], "message" : res["new_message_txt"] };
					
			sdata.Ajax.request({
				url: "/sdata/message/?sid=" + Math.random(),
				httpMethod: "POST",
				onSuccess: function(data){
					History.addBEvent("list");
				},
				onFail : function(data){
					alert("An error has occured");
				},
				postData: data,
				contentType: "application/x-www-form-urlencoded"
			});
			
		}
		
	});
	
	var showMessage = function(id){
		History.addBEvent("message|" + id);
	}
	
	sakai._inbox.startReply = function(id){
		
		sakai._inbox.startNewMessage();
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/message?id=" + id + "&sid=" + Math.random(),
			onSuccess: function(data){
				var json = eval('(' + data + ')');
				$("#new_title_txt").attr("value","Re: " + json.item.title);
				$("#new_message_txt").attr("value", "\n\n> " + json.item.message.replace(/\n/g,"\n> "));
				
				var select = document.getElementById("message_to");
				for (var i = 0; i < select.options.length; i++){
					if (select.options[i].value == json.item.sender){
						select.selectedIndex = i;
					}
				}
				
			},
			onFail : function(status){
				//alert("An error has occured");
			}
		});
		
	};
	
	History.history_change();
   
};

sdata.registerForLoad("sakai.inbox");
