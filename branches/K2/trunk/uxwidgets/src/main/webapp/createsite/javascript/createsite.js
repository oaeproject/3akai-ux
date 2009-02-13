var sakai = sakai || {};
sakai.createsite = {};

(function(){

	var newsitejson = false;
	var newpageid = false;
	var newsitetitle = false;
	
	$("#createsite_newsiteid_url").text(document.location.protocol + "//" + document.location.host + "/site/");
	$("#createsite_portfolio_newsiteid_url").text(document.location.protocol + "//" + document.location.host + "/site/");
	
	sakai.createsite.initialise = function(){
		$("#create-site-course").hide();
		$("#create-site-noncourse").show();
		$("#create-site-course-requested").hide();
		$("#create-site-communal-1").show();
		$("#create-site-communal-2").show();
		$("#createsite_step2").show();
		$("#createsite_overlay-lightbox").show();
	}
	
	$("#createsite_newsitename").bind("change", function(ev){
		var entered = $("#createsite_newsitename").val().toLowerCase().replace(/ /g,"-");
		entered = entered.replace(/[:]/g,"_");
		entered = entered.replace(/[?]/g,"_");
		entered = entered.replace(/[=]/g,"_");
		$("#createsite_newsiteid").val(entered);
	});

	sakai.createsite.navigate = function(source,destination){
		$("#" + source).hide();
		$("#" + destination).show();


	}

	sakai.createsite.doStep2 = function(){
		$("#createsite_step1").hide();
		$("#createsite_step2").show();
	}	
	sakai.createsite.closeWindow = function(){	
		$("#createsite_step1").hide();
		$("#createsite_overlay-lightbox").hide();
	}		

	// add onclick to close window
    $('a.sakai-create-site-close-window').click(function(){
		$(".overlay-lightbox2").hide();
		$("#createsite_overlay-lightbox").hide();
    }); 
    
	$("#createsite_course_option").bind("click", function(ev){
		$("#create-site-noncourse").hide();
		$("#create-site-course").show();
	});
	$("#createsite_noncourse_option").bind("click", function(ev){
		$("#create-site-course").hide();
		$("#create-site-noncourse").show();
	});
	sakai.createsite.requestSite = function(){
		$("#create-site-course").hide();
		$("#create-site-communal-1").hide();
		$("#create-site-communal-2").hide();
		$("#create-site-course-requested").show();
	};
	
	sakai.createsite.createSite = function(){
		
		var sitetitle = $("#createsite_newsitename").val();
		var sitedescription = $("#createsite_newsitedescription").val() || "";
		var siteid = $("#createsite_newsiteid").val();
		
		siteid = siteid.replace(/[:]/g,"_");
		siteid = siteid.replace(/[?]/g,"_");
		siteid = siteid.replace(/[=]/g,"_");
		
		var url = "/rest/site";
		
		if (!siteid)
		{
			alert("Please specify a site URL. ");
			return;
		}
		
		//id, name, description, type
		var parameters = {"name" : sitetitle, "description" : sitedescription, "id" : siteid, "type" : "project" };

		sdata.Ajax.request({
			url :"/rest/site/" + "checkId?id=" + siteid + "&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				alert("A site with this URL already exists");
			},
			onFail : function(status) {
				if (status != 403) {
					sdata.Ajax.request({
						url: "/rest/site/create",
						httpMethod: "POST",
						onSuccess: function(data){
							document.location = "/dev/site.html?siteid=" + siteid;
						},
						onFail: function(status){
							if (status == 409 || status == "409") {
								alert("A site with this URL already exists");
							}
							else {
								alert("An error has occured whilst creating the site");
							}
						},
						postData: parameters,
						contentType: "application/x-www-form-urlencoded"
					});
				} else {
					alert("A site with this URL already exists");
				}
			}
		});
	}
	
	sakai.createsite.createPortfolio = function(){
		// title is a required field
		var sitetitle = $("#createsite_portfolio_newsitename").attr("value");
		if (!sitetitle)
		{
			alert("Please specify site title. ");
			return;
		}
		
		var siteid = $("#createsite_portfolio_newsiteid").attr("value");
		if (!siteid)
		{
			alert("Please specify a site URL. ");
			return;
		}
		
		var sitedescription = null;
		if (!sitedescription)
		{
			sitedescription ="";
		}
		
		var skin = null;
		var skinselector = document.getElementById("createsite_portfolio_skin");
		skin = skinselector.options[skinselector.selectedIndex].value;
		
		if (sitetitle && siteid)
		{
			
			sdata.Ajax.request({
				url :"/direct/site/" + siteid + "/exists",
				httpMethod : "GET",
				onSuccess : function(data) {
					alert("This site url already exists");
				},
				onFail : function(status) {
					newsitetitle = sitetitle;
			
					var url = "/sdata/newsite";
					var parameters = {"sitename" : sitetitle, "sitedescription" : sitedescription, "siteid" : siteid, "template" : "template001", "skin": skin, "type" : "portfolio" };
			
					sdata.Ajax.request({
						url :url,
						httpMethod : "POST",
						onSuccess : function(data) {
							document.location = "/site/" + siteid;
						},
						onFail : function(status) {
							alert("An error occured");
						},
						postData : parameters,
						contentType : "application/x-www-form-urlencoded"
					});
				}
			});
			
		}
	}
	
	randomString = function(string_length) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	}

	createPage1 = function(response, exists){
		if (exists){
			newsitejson = eval('(' + response + ')');
			if (newsitejson.status == "success") {
				newpageid = randomString(8);
				newpageid = newpageid.replace(/\//g, "_");
				newpageid = newpageid.replace(/"/g, "_");
				newpageid = newpageid.replace(/'/g, "_");
				sdata.widgets.WidgetPreference.save("/sdata/f/" + newsitejson.id + "/pages/" + newpageid, "metadata", '{"type":"webpage"}', createPage2);	
			} else {
				alert("An error has occured");
			}
		} else {
			alert("An error has occured");
		}
	} 
	
	createPage2 = function(success){
		if (success){
			sdata.Ajax.request({
				url :"/sdata/f/" + newsitejson.id + "/pageconfiguration?sid=" + Math.random(),
				httpMethod : "GET",
				onSuccess : function(data) {
					createPage3(data,true);
				},
				onFail : function(status) {
					createPage3(status,false);
				}
			});
		} else {
			alert("An error has occured");
		}
	}
	
	createPage3 = function(response, exists){
		var pagetitle = "Welcome";
		var json = {};
		json.items = [];
		if (exists){
			json = eval('(' + response + ')');
		}
		var index = json.items.length;
		json.items[index] = {};
		json.items[index].id = newpageid;
		json.items[index].title = "Welcome";
		json.items[index].type = "webpage";
		json.items[index].top = true;
		var tostring = sdata.JSON.stringify(json);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + newsitejson.id + "", "pageconfiguration", tostring, createPage4);
	}
	
	createPage4 = function(success){
		sdata.widgets.WidgetPreference.save("/sdata/f/" + newsitejson.id + "/pages/" + newpageid, "content", "Welcome to " + newsitetitle + " !", doRedirect);
	}

	doRedirect = function(success){
		if (success){
			document.location = "/dev/site_home_page.html?siteid=" + newsitejson.id;
		} else {
			alert("An error occured");
		}
	}

		
})();