var sakai = sakai || {};
sakai.sitemembers = function(tuid, placement, showSettings){

	var rootel = $(document.body);
	if (tuid){
		rootel = $("#" + tuid);
		$("#sitemembers_container").css("background-color","#FFFFFF");
		$("#sitemembers_container").css("padding-top","15px");
		$("#sitemembers_container").css("border","5px solid #EEEEEE");
		$("#sitemembers_container").css("border-top","none");
		
		$("#sitemembers_settings").css("background-color","#FFFFFF");
		$("#sitemembers_settings").css("padding","10px");
		$("#sitemembers_settings").css("border","5px solid #EEEEEE");
		$("#sitemembers_settings").css("border-top","none");
	}
	
	var qs = new Querystring();
	var siteid = "";
	siteid = qs.get("site", false);
	if (!siteid){
		try {
			var path = document.location.pathname;
			siteid = path.split("/")[2];
		} catch (err){}
	}
	
	var memberdata = false;
	var all = false;
	
	var lookupMembers = function(all){
		var url = "/sdata/profile?sitemembers=true&siteid=" + siteid + "&sid=" + Math.random();
		if (!all){
			url += "&limit=true";
		}
		if (siteid) {
			sdata.Ajax.request({
				httpMethod: "GET",
				url: url,
				onSuccess: function(data){
					memberdata = eval('(' + data + ')');
					printMembers();
				},
				onFail: function(data){
				
				}
			});
		}
	}
	
	if (showSettings) {
		$("#sitemembers_container").hide();
		$("#sitemembers_settings").show();
	} else {
		lookupMembers(all);
	}
	
	var printMembers = function(){
		var members = {};
		members.items = [];
		
		members.total = memberdata.total;
		members.all = all;
		
		for (var i = 0; i < memberdata.items.length; i++){
			members.items[i] = {};
			var member = memberdata.items[i];
			if (member.firstName && member.lastName){
				members.items[i].name = member.firstName + " " + member.lastName;
			} else if (member.email) {
				members.items[i].name = member.email;
			} else {
				members.items[i].name = member.userid;
			}
			members.items[i].id = member.userid;
			if (member.picture){
				var picture = eval('(' + member.picture + ')');
				members.items[i].picture = "/sdata/f/public/" + member.userid + "/" + picture.name;
			} else {
				members.items[i].picture = "/dev/img/my-profile-img.jpg";
			}
		}
		
		$("#sitemembers_container",rootel).html(sdata.html.Template.render("sitemembers_template",members));
		
		$(".sitemembers_showall").bind("click", function(ev){
			all = true;
			lookupMembers(all);
			return false;
		});
		$(".sitemembers_hideall").bind("click", function(ev){
			all = false;
			lookupMembers(all);
			return false;
		});
		
		refreshScreen();
		
	}
	
	var refreshScreen = function(){
		if ($(".refreshScreen").css("display") == "none"){
			$(".refreshScreen").show();
			setTimeout(refreshScreen,1);
		} else {
			$(".refreshScreen").hide();
		}
	}

}

sdata.widgets.WidgetLoader.informOnLoad("sitemembers");