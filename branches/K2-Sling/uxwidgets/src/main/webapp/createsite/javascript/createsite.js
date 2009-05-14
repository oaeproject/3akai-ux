var sakai = sakai || {};

/*global $ */

sakai.createsite = function(tuid,placement,showSettings){

	$("#createsite_step2").jqm({
		modal: true,
		trigger: $('.createsite_step2_trigger'),
		overlay: 20,
		toTop: true
	});

	var newsitejson = false;
	var newpageid = false;
	var newsitetitle = false;
	
	$("#createsite_newsiteid_url").text(document.location.protocol + "//" + document.location.host + "/site/");
	$("#createsite_portfolio_newsiteid_url").text(document.location.protocol + "//" + document.location.host + "/site/");
	
	sakai.createsite.initialise = function(){
		$("#createsite_step2").jqmShow();
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
	
	var sitetitle = false;
	var sitedescription = false;
	var siteid = false;
	
	sakai.createsite.createSite = function(){
		
		sitetitle = $("#createsite_newsitename").val();
		sitedescription = $("#createsite_newsitedescription").val() || "";
		siteid = $("#createsite_newsiteid").val();
		
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
		var parameters = {"name" : sitetitle, "description" : sitedescription, "type" : "project" };
		
		var tosave = $.toJSON(parameters);

		//remove button
		$("#create-site-save-button").hide();
		$("#create_site_cancel").hide();
		$("#create-site-processing-button").show();

		$.ajax({
			url :"/sites/" + siteid + ".json",
			cache : false,
			success : function(data) {
				
					alert("A site with this URL already exists");
					
					//remove button
		$("#create-site-processing-button").hide();
		$("#create-site-save-button").show();
		$("#create_site_cancel").show();
		
				
			},
			error : function(status) {
				//if (status != 403) {
					sdata.widgets.WidgetPreference.save("/sites/" + siteid, "meta", tosave, createSiteNavigation);
				/*} else {
					alert("A site with this URL already exists");
				} */
			}
		});
	}
	
	var createSiteNavigation = function(){
		
		// Create the site navigation file
		
		var content = "<h3>Navigation Menu</h3>";
		content += '<p><img id="widget_navigation_id759008084__sites/' + siteid + '/_pages/home" class="widget_inline" style="display:block; padding: 10px; margin: 4px" src="../devwidgets/youtubevideo/images/icon.png" border="1" alt="" /></p>';
		content += '<h3>Recent Activity</h3>';
		content += '<p><img id="widget_siterecentactivity_id669827676__sites/' + siteid + '/_pages/home" class="widget_inline" style="display:block; padding: 10px; margin: 4px" src="../devwidgets/youtubevideo/images/icon.png" border="1" alt="" /></p>';
		
		sdata.widgets.WidgetPreference.save("/sites/" + siteid + "/_navigation", "content", content, createHomePage);
		
		/*
var data = {"items": {
			"data": content,
			"fileName": "content",
			"contentType": "text/plain"
			}
		};
		
		sdata.Ajax.request({
			url: "/sdata/f/" + siteid + "/_navigation",
			httpMethod: "POST",
			onSuccess: function(data){
				createHomePage();
			},
			onFail: function(status){
			},
			postData: data,
			contentType: "multipart/form-data"
		});
*/
		
	}
	
	var createHomePage = function(){
		
		// Create dummy site homepage file
		
		var content = $("#home_page_example").html();
		
		sdata.widgets.WidgetPreference.save("/sites/" + siteid + "/_pages/welcome", "content", content, createConfigurationFile);
		
		/*
var data = {"items": {
			"data": content,
			"fileName": "content",
			"contentType": "text/plain"
			}
		};
		
		sdata.Ajax.request({
			url: "/sdata/f/" + siteid + "/_pages/welcome",
			httpMethod: "POST",
			onSuccess: function(data){
				sdata.Ajax.request({
					url: "/sdata/f/" + siteid + "/_pages/welcome/content?f=ci",
					httpMethod: "POST",
					onSuccess: function(data){
						createConfigurationFile();
					},
					onFail: function(status){
					}
				});
			},
			onFail: function(status){
			},
			postData: data,
			contentType: "multipart/form-data"
		});
*/
		
	}
	
	var createConfigurationFile = function(){
		
		// Create page configuration file
		
		var content = '{"items":[{"id":"welcome","title":"Welcome","type":"webpage"}]}';
		
		sdata.widgets.WidgetPreference.save("/sites/" + siteid, "pageconfiguration", content, createPlaceHolderFile);
		
		/*
var data = {"items": {
			"data": content,
			"fileName": "pageconfiguration",
			"contentType": "text/plain"
			}
		};
		
		sdata.Ajax.request({
			url: "/sdata/f/" + siteid + "/.site/",
			httpMethod: "POST",
			onSuccess: function(data){
				createPlaceHolderFile();
			},
			onFail: function(status){
			},
			postData: data,
			contentType: "multipart/form-data"
		});
*/
		
	}
	
	var createPlaceHolderFile = function(){
		var content = 'Test';
		
		$.ajax({
			url: "/sdata/p/mysites.json",
			cache: false,
			success: function(data){
			
				try {
					if (typeof eval('(' +  data + ')') === "string"){
						throw "Invalid Format";
					}
					updateMySites(eval('(' +  data + ')'));
				} catch (err){
					updateMySites({});
				}
				
				
			},
			error: function(status){
				
				updateMySites({});
				
			}
		});
	}
	
	var updateMySites = function(mysites){
		mysites[siteid] = sitetitle;
		sdata.widgets.WidgetPreference.save("/sdata/p", "mysites.json", $.toJSON(mysites), setWidgetsPermissions);
		
	}
		
		/*
var data = {"items": {
			"data": content,
			"fileName": ".test",
			"contentType": "text/plain"
			}
		};
		
		sdata.Ajax.request({
			url: "/sdata/f/" + siteid + "/_widgets/",
			httpMethod: "POST",
			onSuccess: function(data){
				setWidgetsPermissions();
			},
			onFail: function(status){
			},
			postData: data,
			contentType: "multipart/form-data"
		});
*/
	
	
	var setWidgetsPermissions = function(){
		
		document.location = "/dev/site.html?siteid=" + siteid;
		
		/*
var data = {
			action : "replace",
			acl : "k:*,s:AN,g:1,p:1",
			f : "pe"
		}
		
		sdata.Ajax.request({
			url: "/sdata/f/" + siteid + "/_widgets?f=pe",
			httpMethod: "POST",
			onSuccess: function(data){
				document.location = "/dev/site.html?siteid=" + siteid;
			},
			onFail: function(status){
				alert("Failed: " + status);
			},
			postData: data,
			contentType: "application/x-www-form-urlencoded"
		});
*/
		
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

		
};

sdata.widgets.WidgetLoader.informOnLoad("createsite");