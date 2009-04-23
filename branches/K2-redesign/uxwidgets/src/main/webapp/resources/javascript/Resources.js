var Resources = [];

var qs = new Querystring();
window.Resources_siteId = qs.get("siteid",false);

//alert(document.getElementById("widget_Resources").innerHTML);

Resources.initHistory = function(){
	if (Resources.browser.siteid && Resources.browser.baseid){
			
		var args = [];
		args[0] = "";
		if (args[0] != Resources.browser.currentpath){
			Resources.browser.printResources(args);
		}

	} else {
		setTimeout("Resources.initHistory()",100);
	}
}

Resources.browser = {

	selected : "",
	jsonfeed : [],
	sitejson : [],
	siteid : "",
	paging : [],
	currentpath : -1,
	baseid : "",
	splitsize : 3,
	canshowwarning : true,
	
	refreshWarning : function(){
		Resources.browser.canshowwarning = true;	
	},
	
	showWarning : function(){
		if (Resources.browser.canshowwarning){
			window.alert("You have exceeded your site quota. Please contact the CamTools Helpdesk for more information.");
			setTimeout("Resources.browser.refreshWarning()",60000);
		}
	},

	doInit : function(){
		if (window.Resources_siteId){
			Resources.browser.siteid = Resources_siteId;
		} else {
			//var str = document.location.pathname;
			//var spl = str.split("/");
			//var currentsite = spl[2];
			var qs = new Querystring();
			var currentsite = qs.get("siteid",false);
			Resources.browser.siteid = currentsite;
			window.Resources_siteId = currentsite;
		}
		Resources.browser.loadSiteInfo(Resources.browser.siteid);
		if (Resources.browser.siteid.substring(0,1) == "!" || Resources.browser.siteid == "~admin"){
			Resources.browser.baseid = "/";
			Resources.browser.splitsize = 1;
		} else if (Resources.browser.siteid.substring(0,1) == "~") {
			Resources.browser.baseid = "/user/" + Resources.browser.siteid.substring(1);
		} else {
			Resources.browser.baseid = "/group/" + Resources.browser.siteid;
		}
		if (window.Resources_siteId){
			Resources.browser.loadCurrentSiteResources();
		}
	},

	removeBaseId : function(id){
		id = id.substring(Resources.browser.baseid.length);
		return id.replace(/\"/g,"%22").replace(/\'/g,"%27");
	},

	getLength : function(obj){
		for (var i in obj){
			return 1;
		}
		return 0;
	},

	loadCurrentSiteResources : function(){

		 $("#newfoldername").keypress(function (e) {
      		if (e.which == 13) {
				Resources.admin.createFolder("newfoldername");
			}
    	});

		$($(window)).bind("resize", function(e){
			if (Resources.admin.current == "newresources"){
				jQuery.blockUI({ 
					css: { 
    	    			border: 'none', 
    	    			padding: '15px', 
						'padding-right': '15px',
    	    			backgroundColor: '#eeeeee', 
    	   			 	'-webkit-border-radius': '10px', 
    	   		 		'-moz-border-radius': '10px', 
    	  			  	opacity: '1', 
    	  			  	color: '#000000',
						width: '400px',
						top:  (jQuery(window).height() - 300) /2 + 'px', 
        		    	left: (jQuery(window).width() - 400) /2 + 'px',
						border: '3px solid #ffffff' 
    				},
					message : $("#uploadfiles") 
				});
			} else if (Resources.admin.current == "permissions"){
				jQuery.blockUI({ 
					css: { 
    	    			border: 'none', 
    	    			padding: '15px', 
						'padding-top': '15px',
    	    			backgroundColor: '#eeeeee', 
    	   			 	'-webkit-border-radius': '10px', 
    	    			'-moz-border-radius': '10px', 
    	    			opacity: '1', 
    	    			color: '#000000',
						width: '500px',
						top:  (jQuery(window).height() - 100) /2 + 'px', 
            			left: (jQuery(window).width() - 500) /2 + 'px',
						border: '3px solid #ffffff' 
    				},
					message : $("#permisionsscreen") 
				});
			}
		});

		$($(document)).bind("keydown", function(e){
      		Resources.selector.keydowned(e);
    	});
		$($(document)).bind("keyup", function(e){
      		Resources.selector.keyupped(e);
    	});

		Resources.uploader.startUploader();
		Resources.uploader.filestoupload = [];
		Resources.uploader.filestoupload.items = [];
		if (Resources.browser.siteid){
			
			var args = [];
			var str = "" + document.location;
			var hashIndex = str.indexOf("#");	
			var hash = str.substring(hashIndex + 1);
			var hashIndex2 = hash.indexOf("&");

			if (hashIndex != -1 && hashIndex2 != -1){
				try {
					var hashString = str.substring(hashIndex + 5);
					var toolhistory = hashString.substring(hashString.indexOf("&") + 1);
					var splitted = toolhistory.split("|");
					args[0] = splitted[1];
				} catch (err){
					args[0] = "/group/" + Resources.browser.siteid;
				}
			} else {
				args[0] = "/group/" + Resources.browser.siteid;
			}
			
			if (window.Resources_siteId) {
				args[0] = "";
				Resources.browser.printResources(args);
			}

			//Resources.browser.printResources(args);
			//Resources.initHistory();

		}
	},

	loadSiteInfo : function(id){
		sdata.Ajax.request( {
			httpMethod : "GET",
			url : "/sdata/site?siteid=" + id,
			onSuccess : function(data) {
				Resources.browser.renderTitle(data,true);
			},
			onFail : function(status) {
				if (status == 402){
					Resources.browser.showWarning();
				}
				Resources.browser.renderTitle(status,false);
			}
		});
	},

	renderTitle : function(response, success){
		if (success){
			Resources.browser.sitejson = eval('(' + response + ')');
			Resources.browser.loadCurrentSiteResources();
		}
	},
	
	loadResources : function(id){
		id = sdata.util.URL.encode(id);
		if (window.Resources_siteId) {
			Resources.browser.reprintResources(id);
		} else {
			if (Resources.browser.currentpath != id){
				try {
					History.addToolEvent("nav|" + id);
				} catch (err){};
			}
		}
		
	},

	printResources : function(args){
		
		Resources.tagging.showNormalView();
		
		if (!args[2]){
			Resources.admin.hidepopup();
		}
		var id = args[0];
		var fullrefresh = true;
		if (args[1]){
			fullrefresh = false;
		}
		id = Resources.browser.baseid + id;
		if (Resources.browser.currentpath != id && Resources.browser.sitejson.title){
			if (fullrefresh){
				document.getElementById("showresources").innerHTML = "";
			}
			Resources.selector.disableSelectionButtons();	
			Resources.browser.currentpath = id;
			var splitted = id.split("/");
				var link = '';
				Resources.browser.paging.items = [];
				Resources.browser.paging.items[0] = [];
				Resources.browser.paging.items[0].title = sdata.util.URL.decode(Resources.browser.sitejson.title);
				Resources.browser.paging.items[0].link = "javascript:Resources.browser.loadResources('" + link + "')";
				Resources.browser.paging.items[0].id = Resources.browser.baseid + link;
				
				var splittedbis = args[0].split("/");
				
				if (args[0] != "" && args[0] != "/" && splittedbis.length >= 1){
					Resources.browser.paging.items[0].classed = "paging";
				} 
				
				Resources.browser.paging.size = 1;
				for (var i = Resources.browser.splitsize; i < splitted.length; i++){
					if (splitted[i] != ""){
						var length = Resources.browser.paging.items.length;
						Resources.browser.paging.items[length] = [];
						Resources.browser.paging.items[length].title = sdata.util.URL.decode(splitted[i].replace(/%20/g," "));
						link += "/" + splitted[i];
						Resources.browser.paging.items[length].link = "javascript:Resources.browser.loadResources('" + sdata.util.URL.decode(link) + "')";
						Resources.browser.paging.items[length].id = Resources.browser.baseid + link;
       					if (i < splitted.length - 1){
							Resources.browser.paging.items[length].classed = "paging";
						}
						Resources.browser.paging.size ++;
					}
				}
				document.getElementById('showpaging').innerHTML = sdata.html.Template.render('pagingtemplate',Resources.browser.paging);

				sdata.Ajax.request( {
					httpMethod : "GET",
					url : "/sdata/c" + id + "?d=1&sid=" + Math.random(),
					onSuccess : function(data) {
						Resources.browser.renderResources(data,true);
					},
					onFail : function(status) {
						if (status == 402){
							Resources.browser.showWarning();
						}
						Resources.browser.renderResources(status,false);
					}
				});

		} else if (Resources.browser.currentpath != id) {
			setTimeout("Resources.browser.reprintResources('" + Resources.browser.removeBaseId(id) + "')",100);
		}
			
	},

	reprintResources : function(id){
		var args = [];
		args[0] = id;
		Resources.browser.printResources(args);
	},

	formatDate : function(string){
		try {
			var year = string.substring(0,4);
			var month = string.substring(4,6);
			var day = string.substring(6,8);
			return "" + day + "/" + month + "/" + year;
		} catch (err) {
			return "Unknown";
		}
	},

	doSort : function(a,b){
		try {
			if (a.contentpriority && b.contentpriority){
				if (parseInt(a.contentpriority) < parseInt(b.contentpriority)){
					return -1;
				} else {
					return 1;
				}
			} else if (a.contentpriority){
				return -1;
			} else if (b.contentpriority){
				return 1;
			} else {
				if (a.displayname.toLowerCase() < b.displayname.toLowerCase()){
					return -1;
				} else {
					return 1;
				}
			}
		} catch (err){
			return 0;
		}
	},

	renderResources : function(response, success){
		if (success){
			Resources.browser.jsonfeed = eval('(' + response + ')');

			if (Resources.browser.jsonfeed.permissions.read == "false"){

				document.getElementById("resourcestool").innerHTML = "Permission denied";

			} else {
				
				//Resources.browser.jsonfeed.permissions.write = "false";
				//Resources.browser.jsonfeed.permissions.remove = "false";
				//Resources.browser.jsonfeed.permissions.admin = "false";
	
				for (var i in Resources.browser.jsonfeed.items){
					for (var p in Resources.browser.jsonfeed.items[i].properties){
						if (p == 'DAV:getlastmodified'){
							Resources.browser.jsonfeed.items[i].lastmodified = Resources.browser.formatDate(Resources.browser.jsonfeed.items[i].properties[p]);
						} else if (p == "CHEF:description"){
							Resources.browser.jsonfeed.items[i].description = Resources.browser.jsonfeed.items[i].properties[p];
						} else if (p == "DAV:displayname"){
							Resources.browser.jsonfeed.items[i].displayname = Resources.browser.jsonfeed.items[i].properties[p];
						} else if (p == "SAKAI:content_priority"){
							Resources.browser.jsonfeed.items[i].contentpriority = Resources.browser.jsonfeed.items[i].properties[p];
						}
					}
					if (Resources.browser.jsonfeed.items[i].available == false){
						Resources.browser.jsonfeed.items[i].unavailable = true;
					} else {
						Resources.browser.jsonfeed.items[i].unavailable = false;
					}
					Resources.browser.jsonfeed.items[i].icontype = Resources.browser.getIconType(Resources.browser.jsonfeed.items[i].path);
					Resources.browser.jsonfeed.items[i].type = Resources.browser.getType(Resources.browser.jsonfeed.items[i].path);
				}

				if (Resources.browser.jsonfeed.permissions.write == "true"){
	
					document.getElementById("resourcemanagement").style.display = "inline";

					if (Resources.browser.jsonfeed.permissions.admin == "true"){
						document.getElementById("permissionsbutton").style.display = "inline";
					} else {
						document.getElementById("permissionsbutton").style.display = "none";
					}

					for (var i in Resources.browser.jsonfeed.permissions){
						if (i == "remove"){
							if (Resources.browser.jsonfeed.permissions[i] == "true"){
								document.getElementById("remove_button").style.display = "inline";
							} else {
								document.getElementById("remove_button").style.display = "none";
							}
						}
					}

				} else {

					document.getElementById("resourcemanagement").style.display = "none";

				}
	
				Resources.browser.displayResources();
			}

		} else {
			document.getElementById("showresources").innerHTML = "&nbsp;&nbsp;&nbsp;The requested folder does not exist";
		}
	},

	fixcolors : function(){
		var items = $(".resourcerow");
		var firstcolour = "#f0f2f7";
		var secondcolour = "#ffffff";
		for (var i = 0; i < items.length; i++){
			var item = items[i];
			if (i % 2 == 0){
				item.style.backgroundColor = firstcolour;
			} else {
				item.style.backgroundColor = secondcolour;
			}
		}
		
		items = $(".resourcerow_checkbox");
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			item.checked = false;
		}
	},

	displayResources : function(){
	
		Resources.selector.selected = [];
		var items = [];
		items.items = [];
		for (var i in Resources.browser.jsonfeed.items){
			items.items[items.items.length] = Resources.browser.jsonfeed.items[i];
		}
		
		items.read = Resources.browser.jsonfeed.permissions.read;
		items.write = Resources.browser.jsonfeed.permissions.write;
		items.remove = Resources.browser.jsonfeed.permissions.remove;
		items.admin = Resources.browser.jsonfeed.permissions.admin;
	
		items.items.sort(Resources.browser.doSort);
		document.getElementById('showresources').innerHTML = sdata.html.Template.render('resourcestemplate',items);

		var isIE = ((navigator.appVersion.indexOf("MSIE")!= -1)&&!window.opera)? true : false;
		if (Resources.browser.jsonfeed.permissions.write == "true"){
			if (isIE){
				$(".resourcerowtable").bind("mouseenter", Resources.selector.addOverStyle);
				$(".resourcerowtable").bind("mouseleave", Resources.selector.delOverStyle);
			} else {
				$(".resourcerowtable").bind("mouseover", Resources.selector.addOverStyle);
				$(".resourcerowtable").bind("mouseout", Resources.selector.delOverStyle);
			}	
		}
		//$(".resourcerow").bind("click", Resources.selector.flipSelect);

	    $("#resources_list").sortable({
			handle: '.portlet_move',
			start : function(e, ui){
				Resources.browser.dragaction = "sorting";
				var isIE = ((navigator.appVersion.indexOf("MSIE")!= -1)&&!window.opera)? true : false;
				if (isIE){
					$(".resourcerowtable").unbind("mouseenter", Resources.selector.addOverStyle);
					$(".resourcerowtable").unbind("mouseleave", Resources.selector.delOverStyle);
				} else {
					$(".resourcerowtable").unbind("mouseover", Resources.selector.addOverStyle);
					$(".resourcerowtable").unbind("mouseout", Resources.selector.delOverStyle);
				}
				//$(".resourcerow").unbind("click", Resources.selector.flipSelect);
			},
			stop : function(e, ui){
				Resources.browser.dragaction = "";
				var isIE = ((navigator.appVersion.indexOf("MSIE")!= -1)&&!window.opera)? true : false;
				if (isIE){
					$(".resourcerowtable").bind("mouseenter", Resources.selector.addOverStyle);
					$(".resourcerowtable").bind("mouseleave", Resources.selector.delOverStyle);
				} else {
					$(".resourcerowtable").bind("mouseover", Resources.selector.addOverStyle);
					$(".resourcerowtable").bind("mouseout", Resources.selector.delOverStyle);
				}
				//$(".resourcerow").bind("click", Resources.selector.flipSelect);
				
				Resources.browser.fixcolors();
				var items = $(".resourcerow");

				var post = [];
				post.item = [];
				post.name = [];
				post.value = [];
				post.action = [];

				for (var i = 0; i < items.length - 1; i++){
					var item = items[i];
					
					var size = post.item.length;

					post.item[size] = item.id.substring(item.id.indexOf("/") + 1).split("/")[item.id.substring(item.id.indexOf("/") + 1).split("/").length - 1];
					post.name[size] = "SAKAI:content_priority";
					post.value[size] = "" + (i + 1);
					post.action[size] = "r";

				}
				
				var url = "/sdata/c" + sdata.util.URL.encode(Resources.browser.currentpath.replace("%20"," ")) + "?f=pr&sid=" + Math.random();
				var data = {"item":post.item,"name":post.name,"value":post.value,"action":post.action};
				sdata.Ajax.request({
					url :url,
					httpMethod : "POST",
					onSuccess : function(data) {
						//window.alert(true);
					},
					onFail : function(status) {
						if (status == 402){
							Resources.browser.showWarning();
						}
					},
					postData : data,
					contentType : "application/x-www-form-urlencoded"
				});

			}
		});
		$("#resources_list li .portlet_topper").draggable({
			start : function(e, ui){
				Resources.browser.dragaction = "moving"
				var isIE = ((navigator.appVersion.indexOf("MSIE")!= -1)&&!window.opera)? true : false;
				if (isIE){
					$(".resourcerowtable").unbind("mouseenter", Resources.selector.addOverStyle);
					$(".resourcerowtable").unbind("mouseleave", Resources.selector.delOverStyle);
				} else {
					$(".resourcerowtable").unbind("mouseover", Resources.selector.addOverStyle);
					$(".resourcerowtable").unbind("mouseout", Resources.selector.delOverStyle);
				}
				//$(".resourcerow").unbind("click", Resources.selector.flipSelect);
			},
			stop : function(e, ui){
				Resources.browser.dragaction = "";
				var isIE = ((navigator.appVersion.indexOf("MSIE")!= -1)&&!window.opera)? true : false;
				if (isIE){
					$(".resourcerowtable").bind("mouseenter", Resources.selector.addOverStyle);
					$(".resourcerowtable").bind("mouseleave", Resources.selector.delOverStyle);
				} else {
					$(".resourcerowtable").bind("mouseover", Resources.selector.addOverStyle);
					$(".resourcerowtable").bind("mouseout", Resources.selector.delOverStyle);
				}
				//$(".resourcerow").bind("click", Resources.selector.flipSelect);
			},
			helper : function() {
				var id = this.id.substring(this.id.indexOf("/") + 1).substring(0, this.id.substring(this.id.indexOf("/") + 1).length - 5);
				var namearr = id.split("/");
				var name = namearr[namearr.length - 1];

				var inselection = false;
				for (var i = 0; i < Resources.selector.selected.length; i++){
					if (Resources.selector.selected[i] == id){
						inselection = true;
					}
				}

				var div = document.createElement("div");
				div.style.padding = "5px";
				div.style.border = "1px dashed #000000";
				div.style.backgroundColor = "#FFFFFF";
				div.id = "Resources_dragtarget";
				div.style.width = "200px";
				div.innerHTML = "";
				var innerHTMLString = "";

				if (inselection){
					for (var i = 0; i < Resources.selector.selected.length; i++){
						innerHTMLString += "<span id='" + Resources.selector.selected[i] + "'>";
						var dispname = "";
						for (var ii in Resources.browser.jsonfeed.items){
							if (Resources.browser.jsonfeed.items[ii].path == Resources.selector.selected[i]){
								if (Resources.browser.jsonfeed.items[ii].primaryNodeType == "nt:folder"){
									innerHTMLString += "<img src='/devwidgets/Resources/images/icons/folder.png'/>&nbsp;&nbsp;";
								} else {
									innerHTMLString += "<img src='/devwidgets/Resources/images/icons/" + Resources.browser.getIconType(Resources.browser.jsonfeed.items[ii].path) + ".png'/>&nbsp;&nbsp;";
								}
								dispname = Resources.browser.jsonfeed.items[ii].properties["DAV:displayname"];
							}
						}
						innerHTMLString += dispname + "</span><br/>";
					}
				} else {
					Resources.selector.selected = [];
					Resources.browser.fixcolors();
					var dispname = "";
					for (var ii in Resources.browser.jsonfeed.items) {
						if (Resources.browser.jsonfeed.items[ii].path == id) {
							if (Resources.browser.jsonfeed.items[ii].primaryNodeType == "nt:folder") {
								innerHTMLString += "<img src='/devwidgets/Resources/images/icons/folder.png'/>&nbsp;&nbsp;";
							}
							else {
								innerHTMLString += "<img src='/devwidgets/Resources/images/icons/" + Resources.browser.getIconType(id) + ".png'/>&nbsp;&nbsp;";
							}
							dispname = Resources.browser.jsonfeed.items[ii].properties["DAV:displayname"];
						}
					}
					innerHTMLString += "<span id='" + id + "'>" + dispname + "</span><br/>";
				}
				
				div.innerHTML = innerHTMLString;

				return div;
			},
			opacity: 0.7
		});

		$(".paging").droppable({
			accept: "#resources_list li",
			tolerance: "pointer",
			drop: function(ev, ui) {
				if (Resources.browser.dragaction == "moving"){
					var droptarget = this;
					var resourceid = this.id.substring(this.id.indexOf("/") + 1).substring(0, this.id.substring(this.id.indexOf("/") + 1).length - 3);
					var id = this.id.substring(0, this.id.length - 3);
					var isallowed = true;
	
					var dragsource = ui.draggable[0].id;
					dragsource = dragsource.substring(dragsource.indexOf("/") + 1).substring(0, dragsource.substring(dragsource.indexOf("/") + 1).length - 5)
	
					if (isallowed){
						var list = $("#Resources_dragtarget span");
						Resources.admin.numbertomove = list.length;
						Resources.admin.numbermoved = 0;
						
						var tourl = ui.element[0].id.substring(0, ui.element[0].id.length - 7);

						for (var i = 0; i < list.length; i++){
							
							var url = "/sdata/c" + sdata.util.URL.encode(list[i].id.replace("%20"," ")) + "?f=mv&sid=" + Math.random();
							var data = {"to":tourl};
							sdata.Ajax.request({
								url :url,
								httpMethod : "POST",
								onSuccess : function(data) {
									Resources.admin.numbermoved++;
									if (Resources.admin.numbermoved == Resources.admin.numbertomove){
										var args = [];
										args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
										args[1] = true;
										Resources.browser.currentpath = -1;
										Resources.browser.printResources(args);
									}
								},
								onFail : function(status) {
									if (status == 402){
										Resources.browser.showWarning();
									}
									Resources.admin.numbermoved++;
									if (Resources.admin.numbermoved == Resources.admin.numbertomove){
										var args = [];
										args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
										args[1] = true;
										Resources.browser.currentpath = -1;
										Resources.browser.printResources(args);
									}
								},
								postData : data,
								contentType : "application/x-www-form-urlencoded"
							});	

						}			
					}
				}
			}, 
			over : function(ev, ui){
				if (Resources.browser.dragaction == "moving"){
					var droptarget = this;
					var resourceid = this.id.substring(0, this.id.length - 7);
					var id = this.id;
	
					var drop = document.getElementById(id);
					drop.style.backgroundColor = "#CCFF99";				
				}
			}, 
			out : function(ev, ui){
				if (Resources.browser.dragaction == "moving"){
					var id = this.id;
					var drop = document.getElementById(id);
					drop.style.backgroundColor = "#ffffff";
				}

			}
		});

		$("#resources_list li").droppable({
			accept: "#resources_list li",
			tolerance: "pointer",
			drop: function(ev, ui) {
				if (Resources.browser.dragaction == "moving"){
					var droptarget = this;
					var resourceid = this.id.substring(this.id.indexOf("/") + 1).substring(0, this.id.substring(this.id.indexOf("/") + 1).length - 3);
					var id = this.id.substring(0, this.id.length - 3);
					var isallowed = true;
	
					var dragsource = ui.draggable[0].id;
					dragsource = dragsource.substring(dragsource.indexOf("/") + 1).substring(0, dragsource.substring(dragsource.indexOf("/") + 1).length - 5)
					
					var inselection = false;
					for (var i = 0; i < Resources.selector.selected.length; i++){
						if (Resources.selector.selected[i] == dragsource){
							inselection = true;
						}
					}
	
					for (var i in Resources.browser.jsonfeed.items){
						if (Resources.browser.jsonfeed.items[i].path == resourceid){
							if (Resources.browser.jsonfeed.items[i].primaryNodeType != "nt:folder"){
								isallowed = false;
							}
	
							if (!inselection){
								if (resourceid == dragsource){
									isallowed = false;
								}
							} else {
								for (var i = 0; i < Resources.selector.selected.length; i++){
									if (Resources.selector.selected[i] == resourceid){
										isallowed = false;
									}
								}
							}
		
						}
					}
	
					if (isallowed){
						var list = $("#Resources_dragtarget span");
						Resources.admin.numbertomove = list.length;
						Resources.admin.numbermoved = 0;
						
						var tourl = ui.element[0].id.substring(ui.element[0].id.indexOf("/") + 1).substring(0, ui.element[0].id.substring(ui.element[0].id.indexOf("/") + 1).length - 3);

						for (var i = 0; i < list.length; i++){
							
							var url = "/sdata/c" + sdata.util.URL.encode(list[i].id.replace("%20"," ")) + "?f=mv&sid=" + Math.random();
							var data = {"to":tourl};
							sdata.Ajax.request({
								url :url,
								httpMethod : "POST",
								onSuccess : function(data) {
									Resources.admin.numbermoved++;
									if (Resources.admin.numbermoved == Resources.admin.numbertomove){
										var args = [];
										args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
										args[1] = true;
										Resources.browser.currentpath = -1;
										Resources.browser.printResources(args);
									}
								},
								onFail : function(status) {
									if (status == 402){
										Resources.browser.showWarning();
									}
									Resources.admin.numbermoved++;
									if (Resources.admin.numbermoved == Resources.admin.numbertomove){
										var args = [];
										args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
										args[1] = true;
										Resources.browser.currentpath = -1;
										Resources.browser.printResources(args);
									}
								},
								postData : data,
								contentType : "application/x-www-form-urlencoded"
							});	

						}			
					}
				}
			}, 
			over : function(ev, ui){
				if (Resources.browser.dragaction == "moving"){
					var droptarget = this;
					var resourceid = this.id.substring(this.id.indexOf("/") + 1).substring(0, this.id.substring(this.id.indexOf("/") + 1).length - 3);
					var id = this.id.substring(0, this.id.length - 3);
					var isallowed = true;
	
					var dragsource = ui.draggable[0].id;
					dragsource = dragsource.substring(dragsource.indexOf("/") + 1).substring(0, dragsource.substring(dragsource.indexOf("/") + 1).length - 5)
					
					var inselection = false;
					for (var i = 0; i < Resources.selector.selected.length; i++){
						if (Resources.selector.selected[i] == dragsource){
							inselection = true;
						}
					}
	
					for (var i in Resources.browser.jsonfeed.items){
						if (Resources.browser.jsonfeed.items[i].path == resourceid){
							if (Resources.browser.jsonfeed.items[i].primaryNodeType != "nt:folder"){
								isallowed = false;
							}
	
							if (!inselection){
								if (resourceid == dragsource){
									isallowed = false;
								}
							} else {
								for (var i = 0; i < Resources.selector.selected.length; i++){
									if (Resources.selector.selected[i] == resourceid){
										isallowed = false;
									}
								}
							}
		
						}
					}
	
					if (isallowed){
						var drop = document.getElementById(id);
						drop.style.backgroundColor = "#CCFF99";				
					}
				}
			}, 
			out : function(ev, ui){
				if (Resources.browser.dragaction == "moving"){
					var droptarget = this;
					var id = this.id.substring(0, this.id.length - 3);
					var drop = document.getElementById(id);

					var dragsource = ui.draggable[0].id;
					dragsource = dragsource.substring(dragsource.indexOf("/") + 1).substring(0, dragsource.substring(dragsource.indexOf("/") + 1).length - 5)
					
					var inselection = false;
					for (var i = 0; i < Resources.selector.selected.length; i++){
						if (Resources.selector.selected[i] == id.substring(id.indexOf("/") + 1)){
							inselection = true;
						}
					}
	
					if (!inselection){
		
						var els = $(".resourcerow");
		
						var firstcolour = "#f0f2f7";
						var secondcolour = "#ffffff";
						for (var i = 0; i < els.length; i++){
							if (els[i].id == id){
								if (i % 2 == 0){
									drop.style.backgroundColor = firstcolour;
								} else {
									drop.style.backgroundColor = secondcolour;
								}
							}
						}
					}

				}

			}		
		});
		
		if (window.Resources_ResizeIFrame){
			Resources_ResizeIFrame();
		}

	},

	getIconType : function(string){
		try {
			var array = string.split(".");
			var extention = array[array.length - 1].toLowerCase();
			if (extention == "php" || extention == "html" || extention == "xml" || extention == "css" || extention == "js"){
				return "code";
			} else if (extention == "doc" || extention == "docx" || extention == "rtf"){
				return "doc";
			} else if (extention == "exe"){
				return "exe";
			} else if (extention == "mov" || extention == "avi" || extention == "mp4"){
				return "film";
			} else if (extention == "fla" || extention == "as" || extention == "flv"){
				return "flash";
			} else if (extention == "mp3" || extention == "wav" || extention == "midi" || extention == "asf"){
				return "music";
			} else if (extention == "pdf"){
				return "pdf";
			} else if (extention == "png" || extention == "gif" || extention == "jpeg" || extention == "jpg" || extention == "tiff" || extention == "bmp"){
				return "picture";
			} else if (extention == "ppt" || extention == "pptx" || extention == "pps" || extention == "ppsx"){
				return "ppt";
			} else if (extention == "txt"){
				return "txt";
			} else if (extention == "xls" || extention == "xlsx"){
				return "xls";
			} else if (extention == "zip" || extention == "rar"){
				return "zip";
			} else {
				return "other";
			}
		} catch (err){
			return "other";
		}
	},

	getType : function(string){
		try {
			var array = string.split(".");
			var extention = array[array.length - 1].toLowerCase();
			if (extention == "php" || extention == "html" || extention == "xml" || extention == "css" || extention == "js"){
				return "Web document";
			} else if (extention == "doc" || extention == "docx" || extention == "rtf"){
				return "Word file";
			} else if (extention == "exe"){
				return "Program";
			} else if (extention == "mov" || extention == "avi" || extention == "mp4"){
				return "Movie";
			} else if (extention == "fla" || extention == "as" || extention == "flv"){
				return "Flash";
			} else if (extention == "mp3" || extention == "wav" || extention == "midi" || extention == "asf"){
				return "Audio";
			} else if (extention == "pdf"){
				return "PDF file";
			} else if (extention == "png" || extention == "gif" || extention == "jpeg" || extention == "jpg" || extention == "tiff" || extention == "bmp"){
				return "Picture";
			} else if (extention == "ppt" || extention == "pptx" || extention == "pps" || extention == "ppsx"){
				return "Powerpoint";
			} else if (extention == "txt"){
				return "Text file";
			} else if (extention == "xls" || extention == "xlsx"){
				return "Excel";
			} else if (extention == "zip" || extention == "rar"){
				return "Archive";
			} else {
				return "Other";
			}
		} catch (err){
			return "Other";
		}
	}

}

Resources.admin = {

	current : false,
	todelete : -1,
	currentbatch : 0,
	todo : 0,
	togothrough : 0,
	finallist : [],
	chain : [],

	adminRoleCheck : function(id1, id2){
		var el = document.getElementById(id1);
		var checked = el.checked;
		if (checked){
			document.getElementById(id2).disabled = false;
		} else {
			document.getElementById(id2).checked = false;
			document.getElementById(id2).disabled = true;
		}
	},

	showNewFolder : function(){
		Resources.admin.current = "newfolder";
    	jQuery.blockUI({ 
			css: { 
    	    	border: 'none', 
    	    	padding: '15px', 
				'padding-top': '15px',
    	    	backgroundColor: '#eeeeee', 
    	   	 	'-webkit-border-radius': '10px', 
    	    	'-moz-border-radius': '10px', 
    	    	opacity: '1', 
    	    	color: '#000000',
				width: '300px',
				border: '3px solid #ffffff' 
    		},
			message : $("#newfoldertemplate") 
		}); 
	},

	showSearch : function(){
		Resources.admin.current = "search";
    	jQuery.blockUI({ 
			css: { 
    	    	border: 'none', 
    	    	padding: '15px', 
				'padding-top': '15px',
    	    	backgroundColor: '#eeeeee', 
    	   	 	'-webkit-border-radius': '10px', 
    	    	'-moz-border-radius': '10px', 
    	    	opacity: '1', 
    	    	color: '#000000',
				width: '300px',
				border: '3px solid #ffffff' 
    		},
			message : $("#searchtemplate") 
		}); 
	},

	hidepopup : function(){
		if (Resources.admin.isinedit){
			Resources.admin.isinedit = false;
			Resources.admin.canceledit();
		} else {
			$.unblockUI();
		}
		Resources.admin.current = false;
	},

	showNewFiles : function(){
		Resources.admin.current = "newresources";
		var locationstring = "/ " + sdata.util.URL.decode(Resources.browser.sitejson.title);
		var path = sdata.util.URL.decode(Resources.browser.removeBaseId(Resources.browser.currentpath));
		var arr = path.split("/");
		for (var i = 0; i < arr.length; i++){
			if (arr[i] != ""){
				locationstring += " / " + arr[i];
			}
		}
		document.getElementById("uploadlocation").innerHTML = locationstring;
    	$.blockUI({ 
			css: { 
    	    	border: 'none', 
    	    	padding: '15px', 
				'padding-top': '15px',
    	    	backgroundColor: '#eeeeee', 
    	   	 	'-webkit-border-radius': '10px', 
    	    	'-moz-border-radius': '10px', 
    	    	opacity: '1', 
    	    	color: '#000000',
				width: '400px',
				top:  ($(window).height() - 300) /2 + 'px', 
            	left: ($(window).width() - 400) /2 + 'px',
				border: '3px solid #ffffff' 
    		},
			message : $("#uploadfiles") 
		}); 
	},

	savepermissions : function(){

		var finalroles = [];
		var finalset = [];
		var finalperms = [];

		var roles = $(".rolerow");
		var arrRoles = [];
		for (var i = 0; i < roles.length; i++){
			arrRoles[arrRoles.length] = roles[i].id.substring(0, roles[i].id.length - 5);
		}

		var reads = $(".readrow");
		var arrReads = [];
		var arrReadsSets = [];
		for (var i = 0; i < reads.length; i++){
			arrReads[arrReads.length] = reads[i].id.substring(0, reads[i].id.length - 5);
			if (reads[i].checked){
				arrReadsSets[arrReadsSets.length] = 1;
			} else {
				arrReadsSets[arrReadsSets.length] = 0;
			}
		}

		var deletes = $(".deleterow");
		var arrDeletes = [];
		var arrDeletesSets = [];
		for (var i = 0; i < deletes.length; i++){
			arrDeletes[arrDeletes.length] = deletes[i].id.substring(0, deletes[i].id.length - 7);
			if (deletes[i].checked){
				arrDeletesSets[arrDeletesSets.length] = 1;
			} else {
				arrDeletesSets[arrDeletesSets.length] = 0;
			}
		}

		var writes = $(".writerow");
		var arrWrite = [];
		var arrWriteSets = [];
		for (var i = 0; i < writes.length; i++){
			arrWrite[arrWrite.length] = writes[i].id.substring(0, writes[i].id.length - 6);
			if (writes[i].checked){
				arrWriteSets[arrWriteSets.length] = 1;
			} else {
				arrWriteSets[arrWriteSets.length] = 0;
			}
		}

		var admins = $(".adminrow");
		var arrAdmins = [];
		var arrAdminsSets = [];
		for (var i = 0; i < admins.length; i++){
			arrAdmins[arrAdmins.length] = admins[i].id.substring(0, admins[i].id.length - 6);
			if (admins[i].checked){
				arrAdminsSets[arrAdminsSets.length] = 1;
			} else {
				arrAdminsSets[arrAdminsSets.length] = 0;
			}
		}

		for (var i = 0; i < arrRoles.length; i++){

			finalroles[finalroles.length] = arrRoles[i];
			finalperms[finalperms.length] = "read";
			finalset[finalset.length] = arrReadsSets[i];

			finalroles[finalroles.length] = arrRoles[i];
			finalperms[finalperms.length] = "remove";
			finalset[finalset.length] = arrDeletesSets[i];

			finalroles[finalroles.length] = arrRoles[i];
			finalperms[finalperms.length] = "write";
			finalset[finalset.length] = arrWriteSets[i];

			finalroles[finalroles.length] = arrRoles[i];
			finalperms[finalperms.length] = "admin";
			finalset[finalset.length] = arrAdminsSets[i];

		}

		var url = "/sdata/c" + sdata.util.URL.encode(sdata.util.URL.decode(Resources.browser.currentpath)) + "?f=pm&sid=" + Math.random();
		var data = {"role": finalroles,"perm": finalperms,"set": finalset};
		sdata.Ajax.request({
			url :url,
			httpMethod : "POST",
			onSuccess : function(data) {
				Resources.admin.hidepopup();
			},
			onFail : function(status) {
				if (status == 402){
					Resources.browser.showWarning();
				}
				Resources.admin.hidepopup();
			},
			postData : data,
			contentType : "application/x-www-form-urlencoded"
		});

	},

	showPermissions : function(args){
		sdata.Ajax.request( {
			httpMethod : "GET",
			url : "/sdata/c" + sdata.util.URL.encode(sdata.util.URL.decode(Resources.browser.currentpath)) + "?f=pm&sid=" + Math.random(),
			onSuccess : function(data) {
				Resources.admin.printPermissions(data,true);
			},
			onFail : function(status) {
				if (status == 402){
					Resources.browser.showWarning();
				}
				Resources.admin.printPermissions(status,false);
			}
		});
	},

	printPermissions : function(response, exists){

		if (exists){
		
			var feed = eval('(' + response + ')');
			
			var locationstring = "/ " + Resources.browser.sitejson.title;
			var path = Resources.browser.removeBaseId(Resources.browser.currentpath);
			var arr = path.split("/");
			for (var i = 0; i < arr.length; i++){
				if (arr[i] != ""){
					locationstring += " / " + sdata.util.URL.decode(arr[i]);
				}
			}

			feed.locationstring = locationstring;
			
			document.getElementById('permissionsoutput').innerHTML = sdata.html.Template.render("permissionstemplate", feed);
			Resources.admin.current = "permissions";
    		$.blockUI({ 
				css: { 
    		    	border: 'none', 
    		    	padding: '15px', 
					'padding-top': '15px',
    		    	backgroundColor: '#eeeeee', 
    		   	 	'-webkit-border-radius': '10px', 
    		    	'-moz-border-radius': '10px', 
    		    	opacity: '1', 
    		    	color: '#000000',
					width: '500px',
					top:  ($(window).height() - 100) /2 + 'px', 
        	    	left: ($(window).width() - 500) /2 + 'px',
					border: '3px solid #ffffff' 
    			},
				message: $("#permisionsscreen") 
			}); 

		}
		//try {
		//	History.addToolEvent("Resources.admin.showPermissions");
		//} catch (err){};
	},

	createFolder : function(id){
		var value = sdata.util.URL.encode(document.getElementById(id).value);
		value = Resources.util.trim(value," ");
		if (value){
			value = value.replace(/\"/g,"%22").replace(/\'/g,"%27");
			var url = "/sdata/c" + Resources.browser.currentpath + "/" + value + "?f=cf&sid=" + Math.random();
			sdata.Ajax.request({
				httpMethod: "POST",
    			url: url,
    			onSuccess : function(data){
					var args = [];
					args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
					args[1] = true;
					Resources.browser.currentpath = -1;
					Resources.browser.printResources(args);
					Resources.admin.hidepopup();
    			},
				onFail : function(status) {
					if (status == 402){
						Resources.browser.showWarning();
					}
					var args = [];
					args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
					args[1] = true;
					Resources.browser.currentpath = -1;
					Resources.browser.printResources(args);
					Resources.admin.hidepopup();
				}
			})
			document.getElementById(id).value = "";
		} else {
			window.alert("Please specify a folder name");
		}
	},
	
	getListFromFeed : function(feed, object){
		for (var ii in feed.items){
			if (feed.items[ii].primaryNodeType == "nt:file"){
				var index = object.length;
				object[index] = [];
				object[index].name = feed.items[ii].properties["DAV:displayname"];
				object[index].icontype = Resources.browser.getIconType(feed.items[ii].path);
				object[index].path = feed.items[ii].path;
			} else {
				var index = object.length;
				object[index] = [];
				object[index].name = feed.items[ii].properties["DAV:displayname"];
				object[index].icontype = "folder";
				object[index].path = feed.items[ii].path;
				object = Resources.admin.getListFromFeed(feed.items[ii], object);
			}
		}
		return object;
	},
	
	printRemoveList : function(){
		var arr = [];
		arr.items = Resources.admin.finallist;
		document.getElementById('removelist').innerHTML = sdata.html.Template.render("removelist_template", arr);
		$("#removeloader").hide();
		$("#removelist").show();
		$("#removebuttons").show();
		$("#removebusy").hide();
	},

	removeFiles : function(){
		
		$("#removebuttons").hide();
		$("#removelist").hide();
		$("#removeloader").show();
		$("#removebusy").hide();
		
		var toget = [];
		Resources.admin.togothrough = 0;
		Resources.admin.finallist = [];
		Resources.admin.chain = [];
		Resources.admin.failedInDelete = [];
		Resources.admin.errorInDelete = false;		
		var folders = 0;
		
		for (var i = 0; i < Resources.selector.selected.length; i++){
			for (var ii in Resources.browser.jsonfeed.items){
				if (Resources.browser.jsonfeed.items[ii].path == Resources.selector.selected[i]){
					
					var index = Resources.admin.finallist.length;
					Resources.admin.finallist[index] = [];
					Resources.admin.finallist[index].name = Resources.browser.jsonfeed.items[ii].properties["DAV:displayname"];
					Resources.admin.finallist[index].icontype = Resources.browser.getIconType(Resources.browser.jsonfeed.items[ii].path);
					Resources.admin.finallist[index].path = Resources.browser.jsonfeed.items[ii].path;
					
					if (Resources.browser.jsonfeed.items[ii].primaryNodeType == "nt:folder"){
						toget[toget.length] = Resources.browser.jsonfeed.items[ii].path;
						Resources.admin.togothrough++;
						Resources.admin.finallist[index].icontype = "folder";
						folders++;
					} else {
						var depth = Resources.browser.jsonfeed.items[ii].path.split("/").length - 1;
						if (!Resources.admin.chain[depth]){
							Resources.admin.chain[depth] = [];
						}
						Resources.admin.chain[depth][Resources.admin.chain[depth].length] = Resources.admin.finallist[i].path;
					}
				}
			}	
		}
		
		if (Resources.admin.finallist.length == 0 || folders == 0){
			Resources.admin.printRemoveList();
		}
		
		for (var i = 0; i < toget.length; i++){
			sdata.Ajax.request( {
				httpMethod : "GET",
				url : "/sdata/c" + sdata.util.URL.encode(toget[i].replace("%20"," ")) + "?d=10&sid=" + Math.random(),
				onSuccess : function(data) {
					var items = eval('(' + data + ')');
					var finalobject = [];
					Resources.admin.finallist = Resources.admin.getListFromFeed(items, Resources.admin.finallist);
					Resources.admin.togothrough = Resources.admin.togothrough - 1;
					if (Resources.admin.togothrough == 0){
						Resources.admin.printRemoveList();
					}
				},
				onFail : function(status) {
					if (status == 402){
						Resources.admin.showWarning();
					}
					Resources.admin.togothrough = Resources.admin.togothrough - 1;
					if (Resources.admin.togothrough == 0){
						Resources.browser.printRemoveList();
					}
				}
			});
		}
		
		Resources.admin.current = "removewarning";
		$.blockUI({ 
			css: { 
    	    	border: 'none', 
    	    	padding: '15px', 
				'padding-top': '15px',
    	    	backgroundColor: '#eeeeee', 
    	   	 	'-webkit-border-radius': '10px', 
    	    	'-moz-border-radius': '10px', 
    	    	opacity: '1', 
    	    	color: '#000000',
				width: '400px',
				top:  ($(window).height() - 200) /2 + 'px', 
            	left: ($(window).width() - 400) /2 + 'px',
				border: '3px solid #ffffff' 
    		},
			message : $("#removewarning") 
		});
		
	},
	
	confirmRemoveFiles : function(){
		
		$("#removebuttons").hide();
		$("#removelist").show();
		$("#removebusy").show();
		
		for (var i = 0; i < Resources.admin.finallist.length; i++){
			if (Resources.admin.finallist[i].icontype == "folder"){
				var depth = Resources.admin.finallist[i].path.split("/").length - 1;
				if (!Resources.admin.chain[depth]){
					Resources.admin.chain[depth] = [];
				}
				Resources.admin.chain[depth][Resources.admin.chain[depth].length] = Resources.admin.finallist[i].path;
			}
		}
		
		Resources.admin.runThroughChain();
	
	},
	
	currentDepth : 0,
	todoInChain : 0,
	failedInDelete : [],
	positionInChain : 0,
	errorInDelete : false,
	
	runThroughChain : function(){
		
		Resources.admin.positionInChain = 0;
		Resources.admin.currentDepth = Resources.admin.chain.length - 1;
		try {
			Resources.admin.todoInChain = Resources.admin.chain[Resources.admin.currentDepth].length;
		} catch (err){
			Resources.admin.finishRemoveFiles();
		}
		if (Resources.admin.currentDepth == 0 || !Resources.admin.chain[Resources.admin.currentDepth] || Resources.admin.chain[Resources.admin.currentDepth] == undefined) {
			Resources.admin.finishRemoveFiles();
		}
		else {
			for (var i = 0; i < Resources.admin.chain[Resources.admin.currentDepth].length; i++){
				var url = "/sdata/c" + sdata.util.URL.encode(Resources.admin.chain[Resources.admin.currentDepth][i].replace("%20"," ")) + "?sid=" + Math.random();
				sdata.Ajax.request({
					url: url,
					httpMethod: "DELETE",
					onSuccess : function(data){
						Resources.admin.positionInChain ++;
						if (Resources.admin.todoInChain == Resources.admin.positionInChain){ 
							Resources.admin.chain.splice(Resources.admin.currentDepth,1);
						}
						if (Resources.admin.currentDepth != 0 && Resources.admin.todoInChain == Resources.admin.positionInChain){
							Resources.admin.runThroughChain();
						} else if (Resources.admin.currentDepth == 0) {
							Resources.admin.finishRemoveFiles();
						}
					},
					onFail : function(status) {
						if (status == 402){
							Resources.browser.showWarning();
						}
						Resources.admin.positionInChain ++;
						if (Resources.admin.todoInChain == Resources.admin.positionInChain){
							Resources.admin.chain.splice(Resources.admin.currentDepth,1);
						}
						if (Resources.admin.currentDepth != 0 && Resources.admin.todoInChain == Resources.admin.positionInChain){
							Resources.admin.runThroughChain();
						} else if (Resources.admin.currentDepth == 0) {
							Resources.admin.finishRemoveFiles();
						}
					}
				})
			}
		}
		
	},
	
	finishRemoveFiles : function(){
		
		Resources.admin.finallist = [];
		Resources.admin.todo = [];
		Resources.admin.togothrough = 0;
			
		Resources.admin.hidepopup();	
			
		$("#remove_button").removeClass("disablebutton");
		$("#remove_button").addClass("enablebutton");
		$("#remove_link").removeClass("disablebutton");
		$("#remove_link").addClass("enablebutton");
		$("#edit_button").removeClass("disablebutton");
		$("#edit_button").addClass("enablebutton");
		$("#edit_link").removeClass("disablebutton");
		$("#edit_link").addClass("enablebutton");

		$("#removelink").unbind("click", Resources.admin.removeFiles);
		$("#removelink").bind("click", Resources.admin.removeFiles);
		$("#remove_img").unbind("click", Resources.admin.removeFiles);
		$("#remove_img").bind("click", Resources.admin.removeFiles);
		$("#remove_div").unbind("click", Resources.admin.removeFiles);
		$("#remove_div").bind("click", Resources.admin.removeFiles);
		$("#editlink").unbind("click", Resources.admin.editFiles);
		$("#editlink").bind("click", Resources.admin.editFiles);
		$("#edit_img").unbind("click", Resources.admin.editFiles);
		$("#edit_img").bind("click", Resources.admin.editFiles);
		$("#edit_div").unbind("click", Resources.admin.editFiles);
		$("#edit_div").bind("click", Resources.admin.editFiles);

		Resources.admin.removeComplete();	

	},

	removeComplete : function(){

		var args = [];
		args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
		args[1] = true;
		Resources.browser.currentpath = -1;
		Resources.browser.printResources(args);
		Resources.admin.todelete = -1;
		Resources.selector.selected = [];
		document.getElementById("remove_img").src = "/devwidgets/Resources/images/user-trash.png";
		Resources.selector.disableSelectionButtons();		

	},

	editFiles : function(){
		
		Resources.admin.isinedit = true;

		Resources.admin.current = "editfiles";
    	$.blockUI({ 
			css: { 
    	    	border: 'none', 
    	    	padding: '15px', 
				'padding-top': '15px',
    	    	backgroundColor: '#eeeeee', 
    	   	 	'-webkit-border-radius': '10px', 
    	    	'-moz-border-radius': '10px', 
    	    	opacity: '1', 
    	    	color: '#000000',
				width: '500px',
				top:  ($(window).height() - 300) /2 + 'px', 
            	left: ($(window).width() - 500) /2 + 'px',
				border: '3px solid #ffffff' 
    		},
			message : $("#editfiles") 
		}); 

		$("#specificfileactions").show();
		$("#tagsrow").show();
		$("#generaldetails_title_row").show();
		$("#fileaction_newversion").show();
		$("#generalsuccess").hide();
		$("#copyright_ownexpl").hide();
		$("#visibility_missing").hide();
		$("#title_missing").hide();
		$("#visibilitysuccess").hide();
		$("#newversionsuccess").hide();
		$("#copyright_alert").attr("checked",false);
		$("#timerelease_from").attr("checked",false);
		$("#timerelease_until").attr("checked",false);
		
		try {
			Resources.newversion.uploader.destroy();
		} catch (e) {}
		Resources.newversion.startUploader();
		Resources.newversion.currenti = 0;
		Resources.newversion.obj = [];
		Resources.newversion.obj.items = [];
		Resources.newversion.obj.done = [];
		document.getElementById('nv_output2').innerHTML = sdata.html.Template.render("nv_template2", Resources.newversion.obj);

		var numberoffiles = Resources.selector.selected.length;
		Resources.admin.currenttagstring = "";

		document.getElementById("details_description").value = "";
		document.getElementById("details_tags").value = "";
		document.getElementById("details_title").value = "";
		document.getElementById("untildatestring").value = "";
		document.getElementById("untilhour").value = "00";
		document.getElementById("untilminutes").value = "00";
		document.getElementById("fromdatestring").value = "";
		document.getElementById("fromhour").value = "00";
		document.getElementById("fromminutes").value = "00";

		if (numberoffiles == 1){
			for (var i in Resources.browser.jsonfeed.items){
				if (Resources.selector.selected[0] == Resources.browser.jsonfeed.items[i].path){
					document.getElementById("details_title").value = Resources.browser.jsonfeed.items[i].properties["DAV:displayname"];
					if (Resources.browser.jsonfeed.items[i].properties["CHEF:description"]){
						document.getElementById("details_description").value = Resources.browser.jsonfeed.items[i].properties["CHEF:description"];
					}	
					if (Resources.browser.jsonfeed.items[i].primaryNodeType == "nt:folder"){
						$("#specificfileactions").hide();	
						$("#tagsrow").hide();
					}
					if (Resources.browser.jsonfeed.items[i].properties["tag"]){
						var tagstring = "";
						if (typeof(Resources.browser.jsonfeed.items[i].properties["tag"]) == "object")
							for (var ii = 0; ii < Resources.browser.jsonfeed.items[i].properties["tag"].length; ii++){
								tagstring += Resources.browser.jsonfeed.items[i].properties["tag"][ii] + "\n";
							}
							
						else {
							tagstring += Resources.browser.jsonfeed.items[i].properties["tag"];
						}
						Resources.admin.currenttagstring = tagstring;
						Resources.admin.currenttagstring = Resources.admin.currenttagstring.replace(/\r\n/g,"<br/>");	
						Resources.admin.currenttagstring = Resources.admin.currenttagstring.replace(/\n\r/g,"<br/>");
						Resources.admin.currenttagstring = Resources.admin.currenttagstring.replace(/\n/g,"<br/>");
						Resources.admin.currenttagstring = Resources.admin.currenttagstring.replace(/\r/g,"<br/>");
						document.getElementById("details_tags").value = tagstring;
					}
					if (Resources.browser.jsonfeed.items[i].hidden){
						$("#visgroup_hidden").attr("checked","true");
					} else if (Resources.browser.jsonfeed.items[i].retractDate || Resources.browser.jsonfeed.items[i].releaseDate){
						if (Resources.browser.jsonfeed.items[i].retractDate){
							$("#timerelease_until").attr("checked","true");
							var ms = Resources.browser.jsonfeed.items[i].retractDate;
							var date = new Date(ms);
							var datestring = Resources.util.expandToTwo("" + date.getDate()) + "/" + Resources.util.expandToTwo("" + (date.getMonth() + 1)) + "/" + (date.getFullYear());
							document.getElementById("untildatestring").value = datestring;
							document.getElementById("untilhour").value = Resources.util.expandToTwo("" + date.getHours());
							document.getElementById("untilminutes").value = Resources.util.expandToTwo("" + date.getMinutes());
						} 
						if (Resources.browser.jsonfeed.items[i].releaseDate){
							$("#timerelease_from").attr("checked","true");
							var ms = Resources.browser.jsonfeed.items[i].releaseDate;
							var date = new Date(ms);
							var datestring = Resources.util.expandToTwo("" + date.getDate()) + "/" + Resources.util.expandToTwo("" + (date.getMonth() + 1)) + "/" + (date.getFullYear());
							document.getElementById("fromdatestring").value = datestring;
							document.getElementById("fromhour").value = Resources.util.expandToTwo("" + date.getHours());
							document.getElementById("fromminutes").value = Resources.util.expandToTwo("" + date.getMinutes());
						}
						$("#visgroup_timerelease").attr("checked","true");
					} else {
						$("#visgroup_show").attr("checked","true");
					}

					if (Resources.browser.jsonfeed.items[i].properties["CHEF:copyrightchoice"]){
						var copyright = Resources.browser.jsonfeed.items[i].properties["CHEF:copyrightchoice"];
						if (copyright == "I hold copyright." || copyright == "Copyright is held by the University of Cambridge." || copyright == "Material is in public domain." || copyright == "Material is subject to fair use exception." || copyright == "Copyright status is not yet determined."){
							document.getElementById("copyrightchoice").value = copyright;
						} else {
							document.getElementById("copyrightchoice").value = "Use copyright below."
							$("#copyright_ownexpl").show();
							document.getElementById("copyright_description").value = Resources.browser.jsonfeed.items[i].properties["CHEF:copyright"];
						}

						if (Resources.browser.jsonfeed.items[i].properties["CHEF:copyrightalert"]){
							$("#copyright_alert").attr("checked","true");
						}

					} else {
						document.getElementById("copyrightchoice").value = "Copyright status is not yet determined.";
					}

				}
			}
		} else {
			var containsfolders = false;
			for (var ii = 0; ii < Resources.selector.selected.length; ii++){
				for (var i in Resources.browser.jsonfeed.items) {
					if (Resources.selector.selected[ii] == Resources.browser.jsonfeed.items[i].path) {
						if (Resources.browser.jsonfeed.items[i].primaryNodeType == "nt:folder"){
							containsfolders = true;
							break;
						}
					}
				}
			}
			$("#generaldetails_title_row").hide();
			$("#fileaction_newversion").hide();
			if (containsfolders){
				$("#tagsrow").hide();
				$("#specificfileactions").hide();
			}
		}

		Resources.admin.showPane("editgeneral");

		$(function()
		{
			$('.date-pick').datePicker();
		});

	},

	canceledit : function(){
		var args = [];
		args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
		args[1] = true;
		Resources.browser.currentpath = -1;
		Resources.browser.printResources(args);
	},
	
	showsuccess_batch : function(){
		$("#copyrightsuccess").show();
		$("#visibilitysuccess").show();
		$("#generalsuccess").show();
		$("#generalbuttons").show();
		$("#generalbusy").hide();
		$("#copyrightbuttons").show();
		$("#copyrightbusy").hide();
		$("#visibilitybuttons").show();
		$("#visibilitybusy").hide();
	},
	
	updateVisibility_batch : function(){
										
		var showchecked = $("#visgroup_show").attr("checked");
		var trchecked = $("#visgroup_timerelease").attr("checked");
		var hidechecked = $("#visgroup_hidden").attr("checked");
		var valid = true;
		var releaseDate = "";
		var retractDate = "";
		$("#until_wrong").hide();
		$("#from_wrong").hide();

		if (! showchecked && ! trchecked && ! hidechecked){
			$("#visibility_missing").show();
			Resources.admin.currentbatch++;
			if (Resources.admin.currentbatch == Resources.admin.todo) {
				Resources.admin.todo = 0;
				Resources.admin.currentbatch = 0;
				Resources.admin.showsuccess_batch();
			}
			else {
				Resources.admin.updateGeneralDetails_batch();
			}
		} else {

			var data = false;
			if (showchecked){
				data = {hidden:false,releaseDate:"",retractDate:""};
			} else if (trchecked){
	
				var fromchecked = $("#timerelease_from").attr("checked");
				var untilchecked = $("#timerelease_until").attr("checked");

				if (!fromchecked && !untilchecked){
					$("#fromuntil_missing").show();
					valid = false;
					Resources.admin.currentbatch++;
					if (Resources.admin.currentbatch == Resources.admin.todo) {
						Resources.admin.todo = 0;
						Resources.admin.currentbatch = 0;
						Resources.admin.showsuccess_batch();
					}
					else {
						Resources.admin.updateGeneralDetails_batch();
					}
				} else {
						
					if (fromchecked){
						try {
							var entered = document.getElementById("fromdatestring").value;
							var date = new Date();
							date.setYear(parseInt(entered.split("/")[2]));
							date.setMonth(parseInt(entered.split("/")[1]) - 1);
							date.setDate(parseInt(entered.split("/")[0]));
							date.setHours(parseInt(document.getElementById("fromhour").value));
							date.setMinutes(parseInt(document.getElementById("fromminutes").value));
							date.setSeconds(0);
							releaseDate = date.getTime();
							if (isNaN(date.getTime())) {
								$("#from_wrong").show();
								valid = false;
							}
							else {
								$("#from_wrong").hide();
							}
						} catch (err){
							$("#from_wrong").show();
							valid = false;
						}
					}
					if (untilchecked){
						try {
							var entered = document.getElementById("untildatestring").value;
							var date = new Date();
							date.setYear(parseInt(entered.split("/")[2]));
							date.setMonth(parseInt(entered.split("/")[1]) - 1);
							date.setDate(parseInt(entered.split("/")[0]));
							date.setHours = parseInt(document.getElementById("untilhour").value);
							date.setMinutes = parseInt(document.getElementById("untilminutes").value);
							date.setSeconds(0);
							retractDate = date.getTime();
							if (isNaN(date.getTime())) {
								$("#until_wrong").show();
								valid = false;
							}
							else {
								$("#until_wrong").hide();
							}
						} catch (err){
							$("#until_wrong").show();
							valid = false;
						}
					}
				}

				data = {"hidden":false,"releaseDate":releaseDate,"retractDate":retractDate};
	
			} else if (hidechecked){
				data = {"hidden":true,"releaseDate":"","retractDate":""};
			}
		
			if (valid){
				var url = "/sdata/c" + sdata.util.URL.encode(Resources.selector.selected[Resources.admin.currentbatch].replace("%20"," ")) + "?f=hr&sid=" + Math.random	();
				sdata.Ajax.request({
					url :url,
					httpMethod : "POST",
					onSuccess : function(data) {
						Resources.admin.currentbatch++;
						if (Resources.admin.currentbatch == Resources.admin.todo) {
							Resources.admin.todo = 0;
							Resources.admin.currentbatch = 0;
							Resources.admin.showsuccess_batch();
						}
						else {
							Resources.admin.updateGeneralDetails_batch();
						}
					},
					onFail : function(status) {
						if (status == 402){
							Resources.browser.showWarning();
						}
						Resources.admin.currentbatch++;
						if (Resources.admin.currentbatch == Resources.admin.todo) {
							Resources.admin.todo = 0;
							Resources.admin.currentbatch = 0;
							Resources.admin.showsuccess_batch();
						}
						else {
							Resources.admin.updateGeneralDetails_batch();
						}
					},
					postData : data,
					contentType : "application/x-www-form-urlencoded"
				});
			} else {
				Resources.admin.currentbatch++;
				if (Resources.admin.currentbatch == Resources.admin.todo) {
					Resources.admin.todo = 0;
					Resources.admin.currentbatch = 0;
					Resources.admin.showsuccess_batch();
				}
				else {
					Resources.admin.updateGeneralDetails_batch();
				}
			}
		}
				
	},

	updateVisibility : function(){
		if (Resources.selector.selected.length == 1){
			
			$("#visibilitybuttons").hide();
			$("#visibilitybusy").show();
							
			var showchecked = $("#visgroup_show").attr("checked");
			var trchecked = $("#visgroup_timerelease").attr("checked");
			var hidechecked = $("#visgroup_hidden").attr("checked");
			var valid = true;
			var releaseDate = "";
			var retractDate = "";
			$("#until_wrong").hide();
			$("#from_wrong").hide();
			$("#fromuntil_missing").hide();
			$("#visibilitysuccess").hide();

			if (! showchecked && ! trchecked && ! hidechecked){
				$("#visibility_missing").show();
				$("#visibilitybuttons").show();
				$("#visibilitybusy").hide();
				Resources.admin.updateCopyright();
			} else {

				var data = false;
				if (showchecked){
					data = {hidden:false,releaseDate:"",retractDate:""};
				} else if (trchecked){
	
					var fromchecked = $("#timerelease_from").attr("checked");;
					var untilchecked = $("#timerelease_until").attr("checked");

					if (!fromchecked && !untilchecked){
						$("#fromuntil_missing").show();
						valid = false;
					} else {
						
						if (fromchecked){
							try {
								var entered = document.getElementById("fromdatestring").value;
								var date = new Date();
								date.setYear(parseInt(entered.split("/")[2]));
								date.setMonth(parseInt(entered.split("/")[1]) - 1);
								date.setDate(parseInt(entered.split("/")[0]));
								date.setHours(parseInt(document.getElementById("fromhour").options[document.getElementById("fromhour").selectedIndex].value));
								date.setMinutes(parseInt(document.getElementById("fromminutes").options[document.getElementById("fromminutes").selectedIndex].value));
								date.setSeconds(0);
								releaseDate = date.getTime();
								if (isNaN(date.getTime())) {
									$("#from_wrong").show();
									valid = false;
								}
								else {
									$("#from_wrong").hide();
								}
								if (entered == ""){
									$("#from_wrong").show();
									valid = false;
								}
							} catch (err){
								$("#from_wrong").show();
								valid = false;
								window.alert(err);
							}
						}
						if (untilchecked){
							try {
								var entered = document.getElementById("untildatestring").value;
								var date = new Date();
								date.setYear(parseInt(entered.split("/")[2]));
								date.setMonth(parseInt(entered.split("/")[1]) - 1);
								date.setDate(parseInt(entered.split("/")[0]));
								date.setHours(parseInt(document.getElementById("untilhour").options[document.getElementById("untilhour").selectedIndex].value));
								date.setMinutes(parseInt(document.getElementById("untilminutes").options[document.getElementById("untilminutes").selectedIndex].value));
								date.setSeconds(0);
								retractDate = date.getTime();
								if (isNaN(date.getTime())) {
									$("#until_wrong").show();
									valid = false;
								}
								else {
									$("#until_wrong").hide();
								}
								if (entered == ""){
									$("#until_wrong").show();
									valid = false;
								}
							} catch (err){
								$("#until_wrong").show();
								valid = false;
								window.alert(err);
							}
						}
					}

					data = {"hidden":false,"releaseDate":releaseDate,"retractDate":retractDate};
	
				} else if (hidechecked){
					data = {"hidden":true,"releaseDate":"","retractDate":""};
				}
		
				if (valid){
					var url = "/sdata/c" + sdata.util.URL.encode(Resources.selector.selected[0].replace("%20"," ")) + "?f=hr&sid=" + Math.random();
					sdata.Ajax.request({
						url :url,
						httpMethod : "POST",
						onSuccess : function(data) {
							$("#visibilitybuttons").show();
							$("#visibilitybusy").hide();
							$("#visibilitysuccess").show();
							Resources.admin.updateCopyright();
						},
						onFail : function(status) {
							if (status == 402){
								Resources.browser.showWarning();
							}
							$("#visibilitybuttons").show();
							$("#visibilitybusy").hide();
							Resources.admin.updateCopyright();
						},
						postData : data,
						contentType : "application/x-www-form-urlencoded"
					});
				} else {
					$("#visibilitybuttons").show();
					$("#visibilitybusy").hide();
					Resources.admin.updateCopyright();
				}
			}	
		}

	},
	
	updateCopyright : function(){
		
		if (Resources.selector.selected.length == 1) {
			
			$("#copyrightbuttons").hide();
			$("#copyrightbusy").show();
			
			var selectedvalue = document.getElementById("copyrightchoice").value;
			
			var name = [];
			var value = [];
			var action = [];
			var selectedfile = Resources.selector.selected[0].split("/")[Resources.selector.selected[0].split("/").length - 1];
			var alert = $("#copyright_alert").attr("checked");
			var copyright = document.getElementById("copyright_description").value;
			
			name[name.length] = "CHEF:copyright";
			value[value.length] = "";
			action[action.length] = "d";
			
			name[name.length] = "CHEF:copyrightchoice";
			value[value.length] = "";
			action[action.length] = "d";

			name[name.length] = "CHEF:copyrightalert";
			value[value.length] = "";
			action[action.length] = "d";
			
			name[name.length] = "CHEF:copyrightchoice";
			value[value.length] = selectedvalue;
			action[action.length] = "a";
			
			if (selectedvalue == "Use copyright below.") {
				name[name.length] = "CHEF:copyright";
				value[value.length] = copyright;
				action[action.length] = "a";
			}
			
			if (alert){
				name[name.length] = "CHEF:copyrightalert";
				value[value.length] = true;
				action[action.length] = "a";
			}
			
			var url = "/sdata/c" + sdata.util.URL.encode(Resources.selector.selected[0].replace("%20"," ")) + "?f=pr&sid=" + Math.random();
			var data = {"name":name,"value":value,"action":action};
			sdata.Ajax.request({
				url :url,
				httpMethod : "POST",
				onSuccess : function(data) {
					$("#copyrightbuttons").show();
					$("#copyrightbusy").hide();
					$("#copyrightsuccess").show();
				},
				onFail : function(status) {
					if (status == 402){
						Resources.browser.showWarning();
					}
					$("#copyrightbuttons").show();
					$("#copyrightbusy").hide();
				},
				postData : data,
				contentType : "application/x-www-form-urlencoded"
			});
			
		}
	},
	
	checkExtraRow : function(){
		if (document.getElementById("copyrightchoice").value == "Use copyright below."){
			$("#copyright_ownexpl").show();
		} else {
			$("#copyright_ownexpl").hide();
		}
	},

	performUpdate : function(){
		if (Resources.selector.selected.length == 1){
			$("#generalbuttons").hide();
			$("#generalbusy").show();
			$("#copyrightbuttons").hide();
			$("#copyrightbusy").show();
			$("#visibilitybuttons").hide();
			$("#visibilitybusy").show();
			
			Resources.admin.updateGeneralDetails();
		} else {
			
			$("#generalbuttons").hide();
			$("#generalbusy").show();
			$("#copyrightbuttons").hide();
			$("#copyrightbusy").show();
			$("#visibilitybuttons").hide();
			$("#visibilitybusy").show();
			
			Resources.admin.todo = Resources.selector.selected.length;
			Resources.admin.currentbatch = 0;
			Resources.admin.updateGeneralDetails_batch();
			
		}
	},

	updateGeneralDetails : function(){
		var finalname = [];
		var finalvalue = [];
		var finalaction = [];
		
		$("#generalbuttons").hide();
		$("#generalbusy").show();

		var title = "";
		var description = "";
		var tags = [];

		var stags = Resources.util.trim(document.getElementById("details_tags").value);
		stags = stags.replace(/\r\n/g,"<br/>");	
		stags = stags.replace(/\n\r/g,"<br/>");
		stags = stags.replace(/\n/g,"<br/>");
		stags = stags.replace(/\r/g,"<br/>");
		tags = stags.split("<br/>");

		if (Resources.selector.selected.length == 1){
			title = Resources.util.trim(document.getElementById("details_title").value);
			description = Resources.util.trim(document.getElementById("details_description").value);
			var valid = true;
			if (title == ""){
				valid = false;
				$("#title_missing").show();
			} else {
				$("#title_missing").hide();
			}
			if (valid){
				
				$("#generalbuttons").hide();
				$("#generalbusy").show();

				finalname[finalname.length] = "DAV:displayname";
				finalvalue[finalvalue.length] = title;
				finalaction[finalaction.length] = "r";

				finalname[finalname.length] = "CHEF:description";
				finalvalue[finalvalue.length] = description;
				finalaction[finalaction.length] = "r";

				var oldtags = Resources.admin.currenttagstring.split("<br/>");
				//for (var i = 0; i < oldtags.length; i++){
				//	if (oldtags[i]){
						finalname[finalname.length] = "tag";
						finalvalue[finalvalue.length] = "removeoldtags";
						finalaction[finalaction.length] = "d";
				//	}
				//}

				Resources.admin.currenttagstring = stags;

				for (var i = 0; i < tags.length; i++){
					if (tags[i]) {
						finalname[finalname.length] = "tag";
						finalvalue[finalvalue.length] = tags[i];
						finalaction[finalaction.length] = "a";
					}
				}
				
				Resources.tagging.hasloaded = false;

				var url = "/sdata/c" + sdata.util.URL.encode(Resources.selector.selected[0].replace("%20"," ")) + "?f=pr&sid=" + Math.random();
				var data = {"name": finalname,"value": finalvalue,"action": finalaction};
				sdata.Ajax.request({
					url :url,
					httpMethod : "POST",
					onSuccess : function(data) {
						$("#generalbuttons").show();
						$("#generalbusy").hide();
						$("#generalsuccess").show();
						Resources.admin.updateVisibility();
					},
					onFail : function(status) {
						if (status == 402){
							Resources.browser.showWarning();
						}
						$("#generalbuttons").show();
						$("#generalbusy").hide();
						Resources.admin.updateVisibility();
					},
					postData : data,
					contentType : "application/x-www-form-urlencoded"
				});

			} else {
				$("#generalbuttons").show();
				$("#generalbusy").hide();
				Resources.admin.updateVisibility();
			}
		} 
	},
	
	updateGeneralDetails_batch : function(index){
		
		var finalname = [];
		var finalvalue = [];
		var finalaction = [];

		var description = "";
		var tags = [];

		var stags = Resources.util.trim(document.getElementById("details_tags").value);
		stags = stags.replace(/\r\n/g,"<br/>");	
		stags = stags.replace(/\n\r/g,"<br/>");
		stags = stags.replace(/\n/g,"<br/>");
		stags = stags.replace(/\r/g,"<br/>");
		tags = stags.split("<br/>");


		description = Resources.util.trim(document.getElementById("details_description").value);

		finalname[finalname.length] = "CHEF:description";
		finalvalue[finalvalue.length] = description;
		finalaction[finalaction.length] = "r";

		Resources.admin.currenttagstring = stags;

		for (var i = 0; i < tags.length; i++){
			if (tags[i]) {
				finalname[finalname.length] = "tag";
				finalvalue[finalvalue.length] = tags[i];
				finalaction[finalaction.length] = "a";
			}
		}
		
		var containsfolder = false;
		for (var i in Resources.browser.jsonfeed.items) {
			for (var ii in Resources.selector.selected) {
				if (ii = Resources.browser.jsonfeed.items[i].path) {
					if (Resources.browser.jsonfeed.items[i].primaryNodeType == "nt:folder") {
						containsfolder = true;
					}
				}
			}
		}
		if (!containsfolder){
			
			var selectedvalue = document.getElementById("copyrightchoice").value;
			var alert = $("#copyright_alert").attr("checked");
			var copyright = document.getElementById("copyright_description").value;
				
			finalname[finalname.length] = "CHEF:copyright";
			finalvalue[finalvalue.length] = "";
			finalaction[finalaction.length] = "d";
				
			finalname[finalname.length] = "CHEF:copyrightchoice";
			finalvalue[finalvalue.length] = "";
			finalaction[finalaction.length] = "d";
				
			finalname[finalname.length] = "CHEF:copyrightalert";
			finalvalue[finalvalue.length] = "";
			finalaction[finalaction.length] = "d";
				
			finalname[finalname.length] = "CHEF:copyrightchoice";
			finalvalue[finalvalue.length] = selectedvalue;
			finalaction[finalaction.length] = "a";
				
			if (selectedvalue == "Use copyright below.") {
				finalname[finalname.length] = "CHEF:copyright";
				finalvalue[finalvalue.length] = copyright;
				finalaction[finalaction.length] = "a";
			}
				
			if (alert){
				finalname[finalname.length] = "CHEF:copyrightalert";
				finalvalue[finalvalue.length] = true;
				finalaction[finalaction.length] = "a";
			}
			
		}
				
		Resources.tagging.hasloaded = false;

		var url = "/sdata/c" + sdata.util.URL.encode(Resources.selector.selected[Resources.admin.currentbatch].replace("%20"," ")) + "?f=pr&sid=" + Math.random();
		var data = {"name": finalname,"value": finalvalue,"action": finalaction};
		sdata.Ajax.request({
			url :url,
			httpMethod : "POST",
			onSuccess : function(data) {
				Resources.admin.updateVisibility_batch();
			},
			onFail : function(status) {
				if (status == 402){
					Resources.browser.showWarning();
				}
				Resources.admin.updateVisibility_batch();
			},
			postData : data,
			contentType : "application/x-www-form-urlencoded"
		});
		
 
	},

	showPane : function(id){
		$("#copyrightsuccess").hide();
		$("#visibilitysuccess").hide();
		$("#generalsuccess").hide();
		$("#newversionsuccess").hide();
		document.getElementById("editgeneral").style.display = "none";
		document.getElementById("editvisibility").style.display = "none";
		document.getElementById("editcopyright").style.display = "none";
		document.getElementById("newversion").style.display = "none";
		
		document.getElementById("editgeneral_link").style.textDecoration = "underline";
		document.getElementById("editvisibility_link").style.textDecoration = "underline";
		document.getElementById("editcopyright_link").style.textDecoration = "underline";
		document.getElementById("newversion_link").style.textDecoration = "underline";
		
		document.getElementById(id + "_link").style.textDecoration = "none";
		document.getElementById(id).style.display = "inline";
	}

}

Resources.newversion = {
	
	uploader: null,
	currenti : 0,
	obj : [],
	
	startUploader: function(){
		
    	Resources.newversion.uploader = new SWFUpload({
        	upload_url: Resources.uploader.getServerUrl("/sdata/c/group/"),
        	post_params: {"PHPSESSID": "test"},
        	file_size_limit: "504800",
        	file_types_description: "All Files",
        	file_upload_limit: "0",

			swfupload_element_id : "flashResources",
					
			file_queue_error_handler : Resources.newversion.fileQueueError,
			file_dialog_complete_handler : Resources.newversion.fileDialogComplete,
			upload_progress_handler : Resources.newversion.uploadProgress,
			upload_error_handler : Resources.newversion.uploadError,
			upload_success_handler : Resources.newversion.uploadSuccess,
			upload_complete_handler : Resources.newversion.uploadComplete,
			
			flash_url: "/devwidgets/Resources/lib/swfupload/Flash9/swfupload_f9.swf",
		
			debug: false
   
	    })
	
	},
	
	selectFile : function(){
		if (FlashDetect.installed){
			$("#newversionsuccess").hide();
			Resources.newversion.uploader.selectFile();
		} else {
			window.alert("You should install the Flash Player in order to use this feature.\n Please visit http://www.adobe.com/products/flashplayer to do so.");	
		}
	},
	
	removefromqueue : function(id){
		try {
			Resources.newversion.uploader.destroy();
		} catch (e) {}
		Resources.newversion.startUploader();
		Resources.newversion.currenti = 0;
		Resources.newversion.obj = [];
		Resources.newversion.obj.items = [];
		Resources.newversion.obj.done = [];
		document.getElementById('nv_output2').innerHTML = sdata.html.Template.render("nv_template2", Resources.newversion.obj);
	},
	
	startUpload : function(){
		
			if (Resources.newversion.currenti == 0){
				
			} else {
			
				$("#newversionbuttons").hide();
				$("#newversionbusy").show();
				document.getElementById("newversionbrowse").disabled = true;
				
				Resources.newversion.obj.items[Resources.newversion.currenti - 1].inprogress = true;
				
				Resources.newversion.uploader.setUploadURL(Resources.uploader.getServerUrl("/sdata/c" + Resources.browser.currentpath.replace(/ /g,"%20") + "/"));
				Resources.newversion.uploader.startUpload(Resources.newversion.uploader.getFile(Resources.newversion.currenti - 1).id);
		
				document.getElementById('nv_output2').innerHTML = sdata.html.Template.render("nv_template2", Resources.newversion.obj);
		
			}
		
	},

	fileDialogComplete : function(num_files_queued) {
			
		try {
				
			if (num_files_queued == 1){
				
				var i = Resources.newversion.currenti;	
				var file = Resources.newversion.uploader.getFile(i);
				
				Resources.newversion.currenti++;
				
				var file = Resources.newversion.uploader.getFile(i);

				Resources.newversion.obj = [];
				Resources.newversion.obj.items = [];
				Resources.newversion.obj.items[0] = [];
				Resources.newversion.obj.items[0].name = file.name;
				Resources.newversion.obj.items[0].id = file.id;
				Resources.newversion.obj.items[0].size = file.size;
				
				Resources.newversion.uploader.addPostParam("realname", Resources.selector.selected[0].split("/")[Resources.selector.selected[0].split("/").length - 1]);
				Resources.newversion.uploader.addFileParam(Resources.newversion.uploader.getFile(Resources.newversion.currenti - 1).id, "realname", Resources.selector.selected[0].split("/")[Resources.selector.selected[0].split("/").length - 1]);
				
				file.name = Resources.selector.selected[0].split("/")[Resources.selector.selected[0].split("/").length - 1];
								
				document.getElementById('nv_output2').innerHTML = sdata.html.Template.render("nv_template2", Resources.newversion.obj);
							
			}	
		
		} catch (ex) {console.debug(ex)}
	},

	uploadSuccess : function(fileObj, server_data) {
		//alert("Upload Success");
	},
	
	uploadComplete : function(fileObj) {

			Resources.newversion.obj.items[Resources.newversion.currenti - 1].done = true;
			document.getElementById('nv_output2').innerHTML = sdata.html.Template.render("nv_template2", Resources.newversion.obj);
			
			$("#newversionbuttons").show();
			$("#newversionbusy").hide();
			$("#newversionsuccess").show();
			document.getElementById("newversionbrowse").disabled = false;

			Resources.newversion.uploader.destroy();
			Resources.newversion.startUploader();
			Resources.newversion.currenti = 0;
			Resources.newversion.obj = [];
			Resources.newversion.obj.items = [];
	
	},

	uploadProgress : function(fileObj, bytesLoaded) {
		document.getElementById("nv_filetoupload_loader_" + fileObj.id).style.width = "" + Math.ceil((bytesLoaded / fileObj.size) * 100) + "%";
	},

	fileQueueError : function (fileObj, error_code, message) {
		console.debug("QUEUE ERROR " + error_code + " : " + message);
	},

	uploadError : function(fileObj, error_code, message) {
	  
		Resources.newversion.obj.items[Resources.newversion.currenti - 1].failed = true;
	}
	
}

Resources.util = {
	
	trim : function(str, chars) {
   		return Resources.util.ltrim(Resources.util.rtrim(str, chars), chars);
	},

	ltrim : function(str, chars) {
    	chars = chars || "\\s";
    	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
	},

	rtrim : function(str, chars) {
    	chars = chars || "\\s";
    	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
	},

	fileSize : function(size){
		if (size < 1000){
			return size + " bytes";
		} else if (size < 1000000){
			return Math.round(size/1000) + " Kb";
		} else {
			return Math.round(size/1000000) + " Mb";
		}
	},

	expandToTwo : function(id){
		if (id.length == 2){
			return id;
		} else if (id.length == 1){
			return "0" + id;
		} else {
			return "00";
		}
	}

}

Resources.uploader = {

	uploader: null,
	filestoupload : [],
	toskip : [],
	i : -1,

	startUploader: function(){
		
    	Resources.uploader.uploader = new SWFUpload({
        	upload_url: Resources.uploader.getServerUrl("/sdata/c/group/"),
        	post_params: {"PHPSESSID": "test"},
        	file_size_limit: "504800",
        	file_types_description: "All Files",
        	file_upload_limit: "0",

			swfupload_element_id : "flashResources",
					
			file_queue_error_handler : Resources.uploader.fileQueueError,
			file_dialog_complete_handler : Resources.uploader.fileDialogComplete,
			upload_progress_handler : Resources.uploader.uploadProgress,
			upload_error_handler : Resources.uploader.uploadError,
			upload_success_handler : Resources.uploader.uploadSuccess,
			upload_complete_handler : Resources.uploader.uploadComplete,
			
			flash_url: "/devwidgets/Resources/lib/swfupload/Flash9/swfupload_f9.swf",
		
			debug: false
   
	    })
	
	},

	selectFiles : function(){
		if (FlashDetect.installed){
			Resources.uploader.uploader.selectFiles();
		} else {
			window.alert("You should install the Flash Player in order to use this feature.\n Please visit http://www.adobe.com/products/flashplayer to do so.");	
		}
	},

	startUpload : function(){
		var numberoffiles = Resources.uploader.filestoupload.items.length;
		if (numberoffiles == 0) {
			window.alert("Please select minimum 1 file to upload");
		} else {
		   	document.getElementById("qfu_upload").style.display = "none";
			document.getElementById("qfu_cancel").style.display = "none";
			document.getElementById("qfu_loader").style.display = "inline";
			document.getElementById("qfu_browse").disabled = true;
			Resources.uploader.i++;
			Resources.uploader.uploader.setUploadURL(Resources.uploader.getServerUrl("/sdata/c" + Resources.browser.currentpath.replace(/ /g,"%20") + "/"));

			if (Resources.uploader.uploader.getFile(Resources.uploader.i) && !Resources.uploader.istoskip(Resources.uploader.uploader.getFile(Resources.i).id)){
				for (var i = 0; i < Resources.uploader.filestoupload.items.length; i++){
					Resources.uploader.filestoupload.items[i].inprogress = true;
				}
				
				document.getElementById('qfu_output2').innerHTML = sdata.html.Template.render("qfu_template2", Resources.uploader.filestoupload);
				Resources.uploader.uploader.startUpload(Resources.uploader.uploader.getFile(Resources.uploader.i).id);
			
			} else {
				if (Resources.uploader.uploader.getFile(Resources.uploader.i)){
					Resources.uploader.startUpload();
				} else {
					for (var i = 0; i < Resources.uploader.filestoupload.items.length; i++){
						Resources.uploader.filestoupload.items[i].inprogress = true;
					}
					document.getElementById('qfu_output2').innerHTML = sdata.html.Template.render("qfu_template2", Resources.uploader.filestoupload);
					Resources.uploader.uploadComplete(null);
					Resources.uploader.i = Resources.uploader.i - 1;
				}
			}	
		}
		
	},

	istoskip : function(stringvar){
		var isin = false;
		for (var i = 0; i < Resources.uploader.toskip.length; i++){	
			if (Resources.uploader.toskip[i] == stringvar){
				isin = true;
			}
		}
		return isin;
	},

	removefromqueue : function(id){
		for (var i = 0; i < Resources.uploader.filestoupload.items.length; i++){
			if (Resources.uploader.filestoupload.items[i].id == id){
				Resources.uploader.filestoupload.items[i].id = null;
				Resources.uploader.toskip[Resources.uploader.toskip.length] = id;
			}
		}	
		document.getElementById('qfu_output2').innerHTML = sdata.html.Template.render("qfu_template2", Resources.uploader.filestoupload);
	},

	fileDialogComplete : function(num_files_queued) {
			
		try {
				
			if (num_files_queued > 0) {
				var index = Resources.uploader.filestoupload.items.length;

				for (var i = 0; i < num_files_queued; i++){
					var file = Resources.uploader.uploader.getFile(i + index);

					var obj = [];
					obj.name = file.name;
					obj.id = file.id;
					obj.size = file.size;
					//Resources.uploader.filestoupload.items.unshift(obj);
					//Resources.uploader.filestoupload.toshow++;
					Resources.uploader.filestoupload.items[Resources.uploader.filestoupload.items.length] = obj;

				}
                Resources.uploader.popupNextStep(3);
                document.getElementById('qfu_output2').innerHTML = sdata.html.Template.render("qfu_template2", Resources.uploader.filestoupload);
			}

		} catch (ex) {console.debug(ex)}
	},
	
	//function to go thruh the different steps
	popupNextStep : function(stepnr){
	
		document.getElementById('qfu_step' + stepnr).style.display = "block";
	
	},

	uploadSuccess : function(fileObj, server_data) {
		//alert("Upload Success");
	},
	
	uploadComplete : function(fileObj) {

		if (fileObj){
			if (!Resources.uploader.istoskip(fileObj.id)){
				for (var i = 0; i < Resources.uploader.filestoupload.items.length; i++){
					if (Resources.uploader.filestoupload.items[i].id == fileObj.id && !Resources.uploader.filestoupload.items[i].failed){
						Resources.uploader.filestoupload.items[i].done = true;
					}	
				}
			}
		}
		
		if (Resources.uploader.filestoupload.items.length - 1 <= Resources.uploader.i){
			document.getElementById("qfu_upload").style.display = "inline";
			document.getElementById("qfu_cancel").style.display = "inline";
			document.getElementById("qfu_loader").style.display = "none";
			document.getElementById("qfu_browse").disabled = false;
			var args = [];
			args[0] = Resources.browser.removeBaseId(Resources.browser.currentpath);
			args[1] = true;
			Resources.browser.currentpath = -1;

			Resources.uploader.uploader.destroy();
			Resources.uploader.startUploader();
			Resources.uploader.filestoupload = [];
			Resources.uploader.filestoupload.items = [];
			Resources.uploader.i = -1;

			document.getElementById('qfu_output2').innerHTML = sdata.html.Template.render("qfu_template2", Resources.uploader.filestoupload);

			Resources.browser.printResources(args);
			//Resources.uploader.filestoupload.toshow = 0;

		} else {
			document.getElementById('qfu_output2').innerHTML = sdata.html.Template.render("qfu_template2", Resources.uploader.filestoupload);
			Resources.uploader.i++;
			if (Resources.uploader.istoskip(Resources.uploader.uploader.getFile(Resources.uploader.i).id)){
				Resources.uploader.uploadComplete(Resources.uploader.uploader.getFile(Resources.uploader.i));
			} else {
				Resources.uploader.uploader.startUpload(Resources.uploader.uploader.getFile(Resources.uploader.i).id);
			}
		}
		

	
	},

	uploadProgress : function(fileObj, bytesLoaded) {
		if (!Resources.uploader.istoskip(fileObj.id)){
			document.getElementById("qfu_filetoupload_loader_" + fileObj.id).style.width = "" + Math.ceil((bytesLoaded / fileObj.size) * 100) + "%";
		}
	},

	fileQueueError : function (fileObj, error_code, message) {
		//alert("QUEUE ERROR " + error_code + " : " + message);
		console.debug("QUEUE ERROR " + error_code + " : " + message);
	},

	uploadError : function(fileObj, error_code, message) {
	  
		if (fileObj){
			if (!Resources.uploader.istoskip(fileObj.id)){
				for (var i = 0; i < Resources.uploader.filestoupload.items.length; i++){
					if (Resources.uploader.filestoupload.items[i].id == fileObj.id){
						Resources.uploader.filestoupload.items[i].failed = true;
					}	
				}
			}
		}
	},

	getServerUrl : function(url) {

		url = Resources.util.trim(url);
		
		// work round port bug 
		if ( url.indexOf("https://") == 0) {
			var nextslash = url.indexOf("/",8);
			var nextcolon = url.indexOf(":",8);
			if ( nextcolon < 0 || nextcolon > nextslash ) {
				url = url.substring(0,nextslash)+":433"+url.substring(nextslash);
			}
		}
		
		// work round cookie bug
		var nameEQ = "JSESSIONID=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) {
				var sessionID = c.substring(nameEQ.length,c.length);
                                var qm = url.indexOf("?");
				if ( qm > 0 ) {
					return url.substring(0,qm-1) + ";jsessionid=" + 
                                                   encodeURIComponent(sessionID) + 
                                                   url.substring(qm,url.length) +  
                                                   "&sakai.session=" + encodeURIComponent(sessionID);
				} else {
					return url +";jsessionid=" + 
                                                   encodeURIComponent(sessionID) + 
                                                   "?sakai.session=" + encodeURIComponent(sessionID);
				}
			}
		}
		return url;
	}

}

Resources.selector = {
	
	selected : [],
	shift : false, //Keycode 16
	ctrl : false,  //Keycode 17

	keydowned : function(e){
		if (e.keyCode == 16){
			Resources.selector.shift = true;
		} else if (e.keyCode == 17 || e.keyCode == 224 || e.keyCode == 91){
			Resources.selector.ctrl = true;
		}
	},

	keyupped : function(e){
		if (e.keyCode == 16){
			Resources.selector.shift = false;
		} else if (e.keyCode == 17 || e.keyCode == 224 || e.keyCode == 91){
			Resources.selector.ctrl = false;
		}
	},

	flipSelect : function(id){
		
		var el = document.getElementById(id);
		var el2 = document.getElementById(id + "_tablerow");
		
		var index = id.indexOf("/");
		var selected = id.substring(index + 1);
		var isactive = false;
		var activeindex = -1;
		for (var i = 0; i < Resources.selector.selected.length; i++){
			if (Resources.selector.selected[i] == selected){
				isactive = true;
				activeindex = i;
			}
		}
		var liarray = $("#resources_list li table tr");
		var safarishift = true;
		var safarialt = true;
		if (window.event){
			if (window.event.shiftKey){
				safarishift = true;
			}
			if (window.event.altKey){
				safarialt = true;
			}
		}
		if (!Resources.selector.ctrl && !Resources.selector.shift && !safarishift && !safarialt){
			for (var i = 0; i < liarray.length; i++){
				var tr = liarray[i];
				if (i % 2 == 0){
					tr.style.backgroundColor = "#f0f2f7";
				} else {
					tr.style.backgroundColor = "#ffffff";
				}
			}
			Resources.selector.selected = [];
		} else {

		}

		if (isactive){
			Resources.selector.selected.splice(activeindex, 1);
		}
		if (!isactive) {
			Resources.selector.selected[Resources.selector.selected.length] = selected;
			el.style.backgroundColor = "#ffff99";
		}

		if (Resources.selector.selected.length == 0) {
			Resources.selector.disableSelectionButtons();
		}
		else {
			Resources.selector.enableSelectionButtons();
		}
		Resources.selector.addOverStyle2(el2);

	},

	disableSelectionButtons : function(){
		$("#remove_button").removeClass("enablebutton");
		$("#remove_button").addClass("disablebutton");
		$("#remove_link").removeClass("enablebutton");
		$("#remove_link").addClass("disablebutton");
		$("#edit_button").removeClass("enablebutton");
		$("#edit_button").addClass("disablebutton");
		$("#edit_link").removeClass("enablebutton");
		$("#edit_link").addClass("disablebutton");
		
		$("#removelink").unbind("click", Resources.admin.removeFiles);
		$("#editlink").unbind("click", Resources.admin.editFiles);
		$("#remove_img").unbind("click", Resources.admin.removeFiles);
		$("#edit_img").unbind("click", Resources.admin.editFiles);
		$("#remove_div").unbind("click", Resources.admin.removeFiles);
		$("#edit_div").unbind("click", Resources.admin.editFiles);
	},

	enableSelectionButtons : function(){
		$("#remove_button").removeClass("disablebutton");
		$("#remove_button").addClass("enablebutton");
		$("#remove_link").removeClass("disablebutton");
		$("#remove_link").addClass("enablebutton");
		$("#edit_button").removeClass("disablebutton");
		$("#edit_button").addClass("enablebutton");
		$("#edit_link").removeClass("disablebutton");
		$("#edit_link").addClass("enablebutton");

		$("#removelink").unbind("click", Resources.admin.removeFiles);
		$("#removelink").bind("click", Resources.admin.removeFiles);
		$("#remove_img").unbind("click", Resources.admin.removeFiles);
		$("#remove_img").bind("click", Resources.admin.removeFiles);
		$("#remove_div").unbind("click", Resources.admin.removeFiles);
		$("#remove_div").bind("click", Resources.admin.removeFiles);
		$("#editlink").unbind("click", Resources.admin.editFiles);
		$("#editlink").bind("click", Resources.admin.editFiles);
		$("#edit_img").unbind("click", Resources.admin.editFiles);
		$("#edit_img").bind("click", Resources.admin.editFiles);
		$("#edit_div").unbind("click", Resources.admin.editFiles);
		$("#edit_div").bind("click", Resources.admin.editFiles);
	},

	addOverStyle : function(){
		var el = this;
		var index = el.id.indexOf("/");
		var selected = el.id.substring(index + 1);
		var aidid = el.id.substring(0, el.id.length - 9);
		selected = selected.substring(0, selected.length - 9);
		var isactive = false;
		for (var i = 0; i < Resources.selector.selected.length; i++){
			if (Resources.selector.selected[i] == selected){
				isactive = true;
			}
		}
		if (!isactive){
			document.getElementById(aidid).style.backgroundColor = "#e2e7f0";
		}
		document.getElementById(aidid + "_actions").style.display = "block";
		
	},

	addOverStyle2 : function(el){
		var index = el.id.indexOf("/");
		var selected = el.id.substring(index + 1);
		selected = selected.substring(0, selected.length - 9);
		var aidid = el.id.substring(0, el.id.length - 9);
		var isactive = false;
		for (var i = 0; i < Resources.selector.selected.length; i++){
			if (Resources.selector.selected[i] == selected){
				isactive = true;
			}
		}
		if (!isactive){
			document.getElementById(aidid).style.backgroundColor = "#e2e7f0";
		}
		document.getElementById(aidid + "_actions").style.display = "block";
		
	},

	delOverStyle : function(){
		var el = this;
		var index = el.id.indexOf("/");
		var selected = el.id.substring(index + 1);
		selected = selected.substring(0, selected.length - 9);
		var aidid = el.id.substring(0, el.id.length - 9);
		var isactive = false;
		for (var i = 0; i < Resources.selector.selected.length; i++){
			if (Resources.selector.selected[i] == selected){
				isactive = true;
			}
		}
		if (!isactive){
			var even = false;
			
			var items = $(".resourcerow");
			var firstcolour = "#f0f2f7";
			var secondcolour = "#ffffff";
			for (var i = 0; i < items.length; i++){
				var item = items[i];
				item.style.width = "100%";
				if (item.id == aidid){
					if (i % 2 == 0){
						even = true;
					} 
				}
			}
	
			if (even){
				document.getElementById(aidid).style.backgroundColor = "#f0f2f7";
			} else {
				document.getElementById(aidid).style.backgroundColor = "#ffffff";
			}
		}
		document.getElementById(aidid + "_actions").style.display = "none";
		
	}

}

Resources.tagging = {

	hasloaded : false,
	taglist : false,
	selectedtag : false,

	showTagView : function(){
		if (window.Resources_siteId) {
			Resources.tagging.showTagViewReal();
		}
		else {
			try {
				History.addToolEvent("tag|");
			} 
			catch (err) {
			};
		}
	},

	showTagViewReal : function(){
		$("#resourcesnormal").hide();
		$("#resourcestags").show();
		if (!Resources.tagging.hasloaded){
			Resources.tagging.hasloaded = true;
			$("#tags_loading").show();
			$("#tags_list").hide();
			$("#tag_alphabet").hide();
			$("#tags_paging").hide();
			document.getElementById("tags_renderedresources").innerHTML = "Please click on a tag to see the files with this tag.";
			sdata.Ajax.request( {
				httpMethod : "GET",
				url : "/sdata/c" + Resources.browser.baseid + "?f=t&a=a&n=tag&sid=" + Math.random(),
				onSuccess : function(data) {
					Resources.tagging.loadTagList(data,true);
				},
				onFail : function(status) {
					if (status == 402){
						Resources.browser.showWarning();
					}
					Resources.tagging.loadTagList(status,false);
				}
			});
		} else {
			$("#tag_alphabet").show();
		}
	},
	
	doAlphabeticalSort : function(a, b){
		if (a.tag.toLowerCase() < b.tag.toLowerCase()){
			return -1;
		} else {
			return 1;
		}
	},
	
	doNumericalSort : function(a, b){
		if (a.amount < b.amount){
			return 1;
		} else if (a.amount == b.amount){
			if (a.tag.toLowerCase() < b.tag.toLowerCase()){
				return -1;
			} else {
				return 1;
			}
		} else {
			return -1;
		}
	},

	loadTagList : function(response, exists){	
		if (!exists){
			$("#tags_loading").hide();
			$("#tags_list").show();
			$("#tag_alphabet").hide();
			document.getElementById("tags_renderedresources").innerHTML = "No tags have been found";
		} else {
			Resources.tagging.taglist = eval('(' + response + ')');
			if (!Resources.tagging.taglist.distribution){
				document.getElementById("tags_renderedresources").innerHTML = "No tags have been found";
			} else {
	
				var exist = false;
				for (var i in Resources.tagging.taglist.distribution){
					exist = true;
				}
				
				if (!exist){
					document.getElementById("tags_renderedresources").innerHTML = "No tags have been found";
				}
	
				var usedletters = [];
				var alltags = [];
				
				for (var i in Resources.tagging.taglist.distribution){
					if (i != "null"){
						var length = alltags.length;
						alltags[length] = [];
						alltags[length].tag = i;
						alltags[length].amount = Resources.tagging.taglist.distribution[i];
					}
				}
				
				var finaltags = [];
				finaltags.items = [];
				finaltags.currentview = "Top 10 tags";
				alltags.sort(Resources.tagging.doNumericalSort);
				for (var i = 0 ; i < 10; i++){
					if (alltags[i]){
						finaltags.items[finaltags.items.length] = alltags[i];
					}
				}
				
				var alphabet = [];
				alphabet.items = [];
				
				alphabet.items[0] = []; alphabet.items[0].value = "A"; alphabet.items[0].hasHits = false;
				alphabet.items[1] = []; alphabet.items[1].value = "B"; alphabet.items[1].hasHits = false;
				alphabet.items[2] = []; alphabet.items[2].value = "C"; alphabet.items[2].hasHits = false;
				alphabet.items[3] = []; alphabet.items[3].value = "D"; alphabet.items[3].hasHits = false;
				alphabet.items[4] = []; alphabet.items[4].value = "E"; alphabet.items[4].hasHits = false;
				alphabet.items[5] = []; alphabet.items[5].value = "F"; alphabet.items[5].hasHits = false;
				alphabet.items[6] = []; alphabet.items[6].value = "G"; alphabet.items[6].hasHits = false;
				alphabet.items[7] = []; alphabet.items[7].value = "H"; alphabet.items[7].hasHits = false;
				alphabet.items[8] = []; alphabet.items[8].value = "I"; alphabet.items[8].hasHits = false;
				alphabet.items[9] = []; alphabet.items[9].value = "J"; alphabet.items[9].hasHits = false;
				alphabet.items[10] = []; alphabet.items[10].value = "K"; alphabet.items[10].hasHits = false;
				alphabet.items[11] = []; alphabet.items[11].value = "L"; alphabet.items[11].hasHits = false;
				alphabet.items[12] = []; alphabet.items[12].value = "M"; alphabet.items[12].hasHits = false;
				alphabet.items[13] = []; alphabet.items[13].value = "N"; alphabet.items[13].hasHits = false;
				alphabet.items[14] = []; alphabet.items[14].value = "O"; alphabet.items[14].hasHits = false;
				alphabet.items[15] = []; alphabet.items[15].value = "P"; alphabet.items[15].hasHits = false;
				alphabet.items[16] = []; alphabet.items[16].value = "Q"; alphabet.items[16].hasHits = false;
				alphabet.items[17] = []; alphabet.items[17].value = "R"; alphabet.items[17].hasHits = false;
				alphabet.items[18] = []; alphabet.items[18].value = "S"; alphabet.items[18].hasHits = false;
				alphabet.items[19] = []; alphabet.items[19].value = "T"; alphabet.items[19].hasHits = false;
				alphabet.items[20] = []; alphabet.items[20].value = "U"; alphabet.items[20].hasHits = false;
				alphabet.items[21] = []; alphabet.items[21].value = "V"; alphabet.items[21].hasHits = false;
				alphabet.items[22] = []; alphabet.items[22].value = "W"; alphabet.items[22].hasHits = false;
				alphabet.items[23] = []; alphabet.items[23].value = "X"; alphabet.items[23].hasHits = false;
				alphabet.items[24] = []; alphabet.items[24].value = "Y"; alphabet.items[24].hasHits = false;
				alphabet.items[25] = []; alphabet.items[25].value = "Z"; alphabet.items[25].hasHits = false;
				
				for (var i in Resources.tagging.taglist.distribution) {
					try {
						if (i != "null") {
							var tag = i;
							var begin = tag.substring(0,1);
							for (var ii = 0 ; ii < alphabet.items.length; ii++){
								if (begin.toUpperCase() == alphabet.items[ii].value){
									alphabet.items[ii].hasHits = true;
								}
							}
						}	
					} catch (err){}
				}
				
				document.getElementById('tag_alphabet').innerHTML = sdata.html.Template.render("tag_alphabet_template", alphabet);
				document.getElementById('tag_list').innerHTML = sdata.html.Template.render("tag_list_template", finaltags);
				$("#tags_loading").hide();
				$("#tag_list").show();
				$("#tag_alphabet").show();
				if (window.Resources_ResizeIFrame){
					ReAbsencesources_ResizeIFrame();
				}
				
			}
		}
	},
	
	loadSortedTagList : function(id){
		if (id == "All"){
			var alltags = []
			for (var i in Resources.tagging.taglist.distribution){
				if (i != "null"){
					var length = alltags.length;
					alltags[length] = [];
					alltags[length].tag = i;
					alltags[length].amount = Resources.tagging.taglist.distribution[i];
				}
			}
			
			var finaltags = [];
			finaltags.items = [];
			finaltags.currentview = "All tags";
			alltags.sort(Resources.tagging.doAlphabeticalSort);
			for (var i = 0 ; i < alltags.length; i++){
				if (alltags[i]){
					finaltags.items[finaltags.items.length] = alltags[i];
				}
			}
			document.getElementById('tag_list').innerHTML = sdata.html.Template.render("tag_list_template", finaltags);
			if (window.Resources_ResizeIFrame){
				Resources_ResizeIFrame();
			}
		} else if (id == "Top"){
			var alltags = [];
			for (var i in Resources.tagging.taglist.distribution){
				if (i != "null"){
					var length = alltags.length;
					alltags[length] = [];
					alltags[length].tag = i;
					alltags[length].amount = Resources.tagging.taglist.distribution[i];
				}
			}
			
			var finaltags = [];
			finaltags.items = [];
			finaltags.currentview = "Top 10 tags";
			alltags.sort(Resources.tagging.doNumericalSort);
			for (var i = 0 ; i < 10; i++){
				if (alltags[i]){
					finaltags.items[finaltags.items.length] = alltags[i];
				}
			}
			document.getElementById('tag_list').innerHTML = sdata.html.Template.render("tag_list_template", finaltags);
			if (window.Resources_ResizeIFrame){
				Resources_ResizeIFrame();
			}
		} else {
			var alltags = []
			for (var i in Resources.tagging.taglist.distribution){
				try {
					if (i != "null" && i.substring(0,1).toUpperCase() == id){
						var length = alltags.length;
						alltags[length] = [];
						alltags[length].tag = i;
						alltags[length].amount = Resources.tagging.taglist.distribution[i];
					}
				} catch (err){}
			}
			
			var finaltags = [];
			finaltags.items = [];
			finaltags.currentview = "All tags";
			alltags.sort(Resources.tagging.doAlphabeticalSort);
			for (var i = 0 ; i < alltags.length; i++){
				if (alltags[i]){
					finaltags.items[finaltags.items.length] = alltags[i];
				}
			}
			document.getElementById('tag_list').innerHTML = sdata.html.Template.render("tag_list_template", finaltags);
			if (window.Resources_ResizeIFrame){
				Resources_ResizeIFrame();
			}
		}
	},
	
	printResourcesWithTag : function(tag,page){
		
		Resources.tagging.selectedtag = sdata.util.URL.encode(tag);
		document.getElementById("tags_renderedresources").innerHTML = "<img src='/devwidgets/Resources/images/ajax-loader.gif'/>&nbsp;";
		
		sdata.Ajax.request( {
			httpMethod : "GET",
			url : "/sdata/c" + Resources.browser.baseid + "?f=t&a=l&n=tag&q=" + Resources.tagging.selectedtag + "&s=" + (page * 10) + "&=c=10&sid=" + Math.random(),
			onSuccess : function(data) {
				Resources.tagging.displayResourcesWithTag(data,true,page);
			},
			onFail : function(status) {
				if (status == 402){
					Resources.browser.showWarning();
				}
				Resources.tagging.displayResourcesWithTag(data,false,page);
			}
		});
	},
	
	displayResourcesWithTag : function(response, exists, page){
		if (exists){
			var jsonfeed = eval('(' + response + ')');
			for (var i in jsonfeed.hits){
				for (var p in jsonfeed.hits[i].properties){
					if (p == 'DAV:getlastmodified'){
						jsonfeed.hits[i].lastmodified = Resources.browser.formatDate(jsonfeed.hits[i].properties[p]);
					} else if (p == "CHEF:description"){
						jsonfeed.hits[i].description = jsonfeed.hits[i].properties[p];
					} else if (p == "DAV:displayname"){
						jsonfeed.hits[i].displayname = jsonfeed.hits[i].properties[p];
					} else if (p == "SAKAI:content_priority"){
						jsonfeed.hits[i].contentpriority = jsonfeed.hits[i].properties[p];
					}
				}
				if (jsonfeed.hits[i].available == false){
					jsonfeed.hits[i].unavailable = true;
				} else {
					jsonfeed.hits[i].unavailable = false;
				}
				jsonfeed.hits[i].icontype = Resources.browser.getIconType(jsonfeed.hits[i].path);
				jsonfeed.hits[i].type = Resources.browser.getType(jsonfeed.hits[i].path);
			}
			
			var numberoftagoccurances = 0;
			var pagingstring = "";
			for (var i in Resources.tagging.taglist.distribution){
				if (i != "null" && i == Resources.tagging.selectedtag){
					numberoftagoccurances = Resources.tagging.taglist.distribution[i];
				}
			}
			var pages = Math.ceil(numberoftagoccurances/10);
			
			if (numberoftagoccurances < 10){
				$("#tags_paging").hide();
			} else {
				if (!(pages <= 5 || page == 0)) {
					pagingstring += "<a onclick=\"Resources.tagging.printResourcesWithTag('" + Resources.tagging.selectedtag + "', 0)\" style='text-decoration:underline; cursor:pointer; cursor:hand'>|&lt;</a>";
					pagingstring = Resources.tagging.addSpacer(pagingstring);
				}
				if (page != 0){
					pagingstring += "<a onclick=\"Resources.tagging.printResourcesWithTag('" + Resources.tagging.selectedtag + "', " + (page - 1) + ")\" style='text-decoration:underline; cursor:pointer; cursor:hand'>&lt;</a>";
					pagingstring = Resources.tagging.addSpacer(pagingstring);
				}
				if (page >= 5){
					pagingstring += "..";
					pagingstring = Resources.tagging.addSpacer(pagingstring);
				}
				for (var i = 0; i < pages; i++) {
					if (page == i) {
						pagingstring += "<b>" + (i + 1) + "</b>";
						pagingstring = Resources.tagging.addSpacer(pagingstring);
					}
					else {
						if ((i > (page - 5) && i < (page)) || (i < (page + 5) && i > (page))) {
							pagingstring += "<a onclick=\"Resources.tagging.printResourcesWithTag('" + Resources.tagging.selectedtag + "', " + (i) + ")\" style='text-decoration:underline; cursor:pointer; cursor:hand'>" + (i + 1) + "</a>";
							pagingstring = Resources.tagging.addSpacer(pagingstring);
						}
					}
				}
				if (page <= pages - 6){
					pagingstring += "..";
					pagingstring = Resources.tagging.addSpacer(pagingstring);
				}
				if (page != pages - 1){
					pagingstring += "<a onclick=\"Resources.tagging.printResourcesWithTag('" + Resources.tagging.selectedtag + "', " + (page + 1) + ")\" style='text-decoration:underline; cursor:pointer; cursor:hand'>&gt;</a>";
					pagingstring = Resources.tagging.addSpacer(pagingstring);
				}
				if (!(pages <= 5 || page == pages - 1)){
					pagingstring += "<a onclick=\"Resources.tagging.printResourcesWithTag('" + Resources.tagging.selectedtag + "', " + (pages - 1) + ")\" style='text-decoration:underline; cursor:pointer; cursor:hand'>&gt;|</a>";
					pagingstring = Resources.tagging.addSpacer(pagingstring);
				}
			}
			
			var items = [];
			items.items = [];
			for (var i in jsonfeed.hits){
				items.items[items.items.length] = jsonfeed.hits[i];
			}
			for (var i in items.items){
				if (items.items[i].properties && items.items[i].properties.tag){
					if (typeof(items.items[i].properties.tag) == "string"){
						items.items[i].properties.tagcount = 1;
					}	
				}
			}
			items.items.sort(Resources.browser.doSort);
			items.tag = Resources.tagging.selectedtag;
			items.paging = pagingstring;
			document.getElementById('tags_renderedresources').innerHTML = sdata.html.Template.render('resourcestemplatetagging',items);
				
		} else {
			document.getElementById("tags_renderedresources").innerHTML = "No files have been found";
		}
		
		if (window.Resources_ResizeIFrame){
			Resources_ResizeIFrame();
		}
	},
	
	addSpacer : function(string){
		return string + "&nbsp;&nbsp;&nbsp;";
	},

	showNormalView : function(){
		$("#resourcesnormal").show();
		$("#resourcestags").hide();
	},
	
	showNormalView2 : function(){
		var path = "";
		try {
			 path = Resources.browser.removeBaseId(sdata.util.URL.decode(Resources.browser.currentpath));
		} catch (err){
			
		}
		if (!path){
			path = "";
		}
		Resources.browser.currentpath = -1;
		Resources.browser.loadResources(path);
	}

}

Resources.other = {
	
	me : false,
	
	showWebDav : function(){
		if (!Resources.other.me){
			sdata.Ajax.request( {
				httpMethod : "GET",
				url : "/sdata/me?sid=" + Math.random(),
				onSuccess : function(data) {
					Resources.other.me = eval('(' + data + ')');
					Resources.other.loaPassKey();
				
				},
				onFail : function(status) {
					if (status == 402){
						Resources.browser.showWarning();
					}
				}
			});
		} else {
			Resources.other.loaPassKey();
		}
		
	},
	
	loaPassKey : function(response, exists){
		sdata.Ajax.request( {
			httpMethod : "GET",
			url : "/direct/raven-webdav/" + Resources.other.me.items.userEid + ".json?sid=" + Math.random(),
			onSuccess : function(data) {
				Resources.other.inserPassKey(data,true);
			},
			onFail : function(status) {
				if (status == 402){
					Resources.browser.showWarning();
				}
				Resources.other.renderWebDav();
			}
		});
	},
	
	inserPassKey : function(response, exists){
		var res = eval('(' + response + ')');
		for (var i in res){
			if (i == "raven-webdav"){
				var passkey = res[i].passKey;
				//document.getElementById("webdavpass_key").innerHTML = passkey;
				$("#webdavpass").show();
			}
		}
		Resources.other.renderWebDav();
	},
	
	renderWebDav : function(){
		Resources.admin.current = "webdav";
		var locationstring = document.location.protocol + "//" + document.location.host + "/dav/" + Resources.browser.sitejson.id;
		document.getElementById("webdavlocation").innerHTML = locationstring;
    	$.blockUI({ 
			css: { 
    	    	border: 'none', 
    	    	padding: '15px', 
				'padding-top': '15px',
    	    	backgroundColor: '#eeeeee', 
    	   	 	'-webkit-border-radius': '10px', 
    	    	'-moz-border-radius': '10px', 
    	    	opacity: '1', 
    	    	color: '#000000',
				width: '600px',
				top:  ($(window).height() - 200) /2 + 'px', 
            	left: ($(window).width() - 600) /2 + 'px',
				border: '3px solid #ffffff' 
    		},
			message : $("#webdav") 
		}); 
	}
	
}

var FlashDetect = new function(){
	var self = this;
	self.installed = false;
	self.raw = "";
	self.major = -1;
	self.minor = -1;
	self.revision = -1;
	self.revisionStr = "";
	var activeXDetectRules = [
		{
			"name":"ShockwaveFlash.ShockwaveFlash.7",
			"version":function(obj){
				return getActiveXVersion(obj);
			}
		},
		{
			"name":"ShockwaveFlash.ShockwaveFlash.6",
			"version":function(obj){
				var version = "6,0,21";
				try{
					obj.AllowScriptAccess = "always";
					version = getActiveXVersion(obj);
				}catch(err){}
				return version;
			}
		},
		{
			"name":"ShockwaveFlash.ShockwaveFlash",
			"version":function(obj){
				return getActiveXVersion(obj);
			}
		}
	];
	var getActiveXVersion = function(activeXObj){
		var version = -1;
		try{
			version = activeXObj.GetVariable("$version");
		}catch(err){}
		return version;
	};
	var getActiveXObject = function(name){
		var obj = -1;
		try{
			obj = new ActiveXObject(name);
		}catch(err){}
		return obj;
	};
	var parseActiveXVersion = function(str){
		var versionArray = str.split(",");//replace with regex
		return {
			"raw":str,
			"major":parseInt(versionArray[0].split(" ")[1], 10),
			"minor":parseInt(versionArray[1], 10),
			"revision":parseInt(versionArray[2], 10),
			"revisionStr":versionArray[2]
		};
	};
	var parseStandardVersion = function(str){
		var descParts = str.split(/ +/);
		var majorMinor = descParts[2].split(/\./);
		var revisionStr = descParts[3];
		return {
			"raw":str,
			"major":parseInt(majorMinor[0], 10),
			"minor":parseInt(majorMinor[1], 10), 
			"revisionStr":revisionStr,
			"revision":parseRevisionStrToInt(revisionStr)
		};
	};
	var parseRevisionStrToInt = function(str){
		return parseInt(str.replace(/[a-zA-Z]/g, ""), 10) || self.revision;
	};
	self.majorAtLeast = function(version){
		return self.major >= version;
	};
	self.FlashDetect = function(){
		if(navigator.plugins && navigator.plugins.length>0){
			var type = 'application/x-shockwave-flash';
			var mimeTypes = navigator.mimeTypes;
			if(mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description){
				var version = mimeTypes[type].enabledPlugin.description;
				var versionObj = parseStandardVersion(version);
				self.raw = versionObj.raw;
				self.major = versionObj.major;
				self.minor = versionObj.minor; 
				self.revisionStr = versionObj.revisionStr;
				self.revision = versionObj.revision;
				self.installed = true;
			}
		}else if(navigator.appVersion.indexOf("Mac")==-1 && window.execScript){
			var version = -1;
			for(var i=0; i<activeXDetectRules.length && version==-1; i++){
				var obj = getActiveXObject(activeXDetectRules[i].name);
				if(typeof obj == "object"){
					self.installed = true;
					version = activeXDetectRules[i].version(obj);
					if(version!=-1){
						var versionObj = parseActiveXVersion(version);
						self.raw = versionObj.raw;
						self.major = versionObj.major;
						self.minor = versionObj.minor; 
						self.revision = versionObj.revision;
						self.revisionStr = versionObj.revisionStr;
					}
				}
			}
		}
	}();
};

Resources.browser.doInit()
