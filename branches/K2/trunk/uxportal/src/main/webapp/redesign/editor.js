var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();

	var cur = 0;
	var minHeight = 400;
	var curScroll = false;

	var showBar = function(id){
		$("#elm1_toolbar1").hide();
		$("#elm1_toolbar2").hide();
		$("#elm1_toolbar3").hide();
		$("#elm1_toolbar4").hide();
		$("#elm1_toolbar" + id).show();
	}

	var myCustomInitInstance = function(){
		document.getElementById("elm1_ifr").style.overflow = "hidden";
		document.getElementById("elm1_ifr").scrolling = "no";
		document.getElementById("elm1_ifr").frameborder = "0";
		//document.getElementById("elm1_tbl").style.overflow = "hidden";
		document.getElementById("elm1_ifr").style.height = "auto"; // helps resize (for some browsers) if new doc is shorter than previous
		var el = $(".mceExternalToolbar");
		//var el = $(".mceExternalToolbar",$("#maincontainer"));
		el.parent().appendTo(".mceToolbarExternal");
		el.show();
		el.css("position","static");
		el.css("border","0px solid black");
		$(".mceExternalClose").hide();
		showBar(1);
		setTimeout("setIframeHeight('elm1_ifr')",100);
		placeToolbar();
	}

	function myHandleEvent(e) {
		//console.debug(e.type);
		if (e.type == "click" || e.type == "keyup" || e.type == "mouseup" || !e || !e.type){
			//console.debug(e.type);
			curScroll = document.body.scrollTop;
 
			if (curScroll == 0)
			{
    			if (window.pageYOffset)
        			curScroll = window.pageYOffset;
    			else
     	  	 		curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
			}
			setIframeHeight("elm1_ifr");
		}
		return true; // Continue handling
	}

	//  addept iframe height to content height
function getDocHeight(doc) {
 //console.debug("getDocHeight called!");
  var docHt = 0, sh, oh;
  if (doc.height) docHt = doc.height;
  else if (doc.body) {
    if (doc.body.scrollHeight) docHt = sh = doc.body.scrollHeight;
    if (doc.body.offsetHeight) docHt = oh = doc.body.offsetHeight;
    if (sh && oh) docHt = Math.max(sh, oh);
  }
  return docHt;
}

function setIframeHeight(ifrm) {
  //console.debug("setIframeHeight called!");
  var iframeWin = window.frames[0];
  var iframeEl = document.getElementById ? document.getElementById(ifrm): document.all ? document.all[ifrm]: null;
	//console.debug(iframeEl + " - " + iframeWin);

  if ( iframeEl && iframeWin ) {
	if(BrowserDetect.browser != "Firefox"){
		iframeEl.style.height = "auto";
	}
    var docHt = getDocHeight(iframeWin.document);
	if (docHt < minHeight){
		docHt = minHeight;
	}
    if (docHt && cur != docHt) {
		//console.debug("resizing");
		iframeEl.style.height = docHt + 30 + "px"; // add to height to be sure it will all show
		cur = (docHt + 30);
		$("#placeholderforeditor").css("height", docHt + 60 + "px");
		window.scrollTo(0,curScroll);
		placeToolbar();
	}
  }
}

	var mySelectionEvent = function(){
		var ed = tinyMCE.get('elm1');
		$("#aidbar").remove();
		var selected = ed.selection.getNode();
				if (selected.nodeName.toLowerCase() == "img"){
					var pos = tinymce.DOM.getPos(selected);
					//alert(pos["x"]); alert(pos["y"]);
					var div = document.createElement("div");
					div.style.position = "absolute";
					div.id = "aidbar";
					div.style.width = "100px";
					div.style.height = "20px";
					div.style.backgroundColor = "green";
					div.innerHTML = "Test";
					div.style.top = pos["y"] + $("#elm1_ifr").position().top + "px";
					div.style.left = pos["x"] + $("#elm1_ifr").position().left + "px";
					document.body.appendChild(div); 
				}
	}

	tinyMCE.init({
		// General options
		mode : "textareas",
		theme : "advanced",
		plugins : "safari,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,spellchecker",

		// Theme options
		//theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect",
		//theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
		//theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
		//theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak",
		theme_advanced_buttons1 : "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,|,spellchecker,|,image,link",
		theme_advanced_toolbar_location : "external",
		theme_advanced_toolbar_align : "left",
		theme_advanced_statusbar_location : "none",
		theme_advanced_resizing : false,
		handle_event_callback : "myHandleEvent",
		onchange_callback : "myHandleEvent",
		handle_node_change_callback : "mySelectionEvent",
		//execcommand_callback : "myHandleEvent",
		//handle_node_change_callback : "myHandleEvent",
		//auto_resize : true,
		init_instance_callback : "myCustomInitInstance",

		//setup : function(ed) {
      		//ed.onLoad.add(function(ed, l) {
         	//	tinyMCE.get('elm1').hide();
      		//});
   		//},
		
		//setup : function(ed) {
		//	ed.onClick.add(function(ed) {
		//		
		//	});
		//},

		// Example content CSS (should be your site CSS)
		content_css : "style.css",

		// Drop lists for link/image/media/template dialogs
		template_external_list_url : "lists/template_list.js",
		external_link_list_url : "lists/link_list.js",
		external_image_list_url : "lists/image_list.js",
		media_external_list_url : "lists/media_list.js",

		// Replace values for the template plugin
		template_replace_values : {
			username : "Some User",
			staffid : "991234"
		}
	});

	var minTop = false;
	var last = 0;

	var placeToolbar = function(){
		if (! minTop){
  			minTop = $("#toolbarplaceholder").position().top;
		}
		curScroll = document.body.scrollTop;
		if (curScroll == 0){
    		if (window.pageYOffset)
        		curScroll = window.pageYOffset;
    		else
     	  		curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
		}
		var barTop = curScroll;
		$("#toolbarcontainer").css("width",$("#toolbarplaceholder").width() - 2 + "px");
		if (barTop <= minTop){
			$("#toolbarcontainer").css("position","absolute");
			$("#toolbarcontainer").css("margin-top","10px");
			$("#toolbarcontainer").css("top",minTop + "px");
		} else {
			if (BrowserDetect.browser == "Explorer" && BrowserDetect.version == 6){
				$("#toolbarcontainer").css("position","absolute");
				$("#toolbarcontainer").css("margin-top","0px");
				$("#toolbarcontainer").css("top",barTop + "px");
			} else {
				$("#toolbarcontainer").css("position","fixed");
				$("#toolbarcontainer").css("margin-top","0px");
				$("#toolbarcontainer").css("top","0px");
			}
		}
		last = new Date().getTime();
	}
	
	$(window).bind("resize", function(){
		$("#toolbarcontainer").css("width",$("#toolbarplaceholder").width() + "px");
	});

	window.onscroll = function (e) {
		var time = new Date().getTime();
		if (time < last + 500){
			return;
		}
		setTimeout(placeToolbar,100);
	}