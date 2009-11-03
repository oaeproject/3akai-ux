var sdata = sdata || null;
var gwtCaller = {
		resize : function(rootel){
				var $ = $ || parent.$;
				var id ="widget_gwt";
				var height = 0;
				var e = parent.document.getElementById(rootel).getElementsByTagName('iframe').item(0); 
				if(e.contentDocument){
					height = e.contentDocument.body.offsetHeight + 50;
				} else {
					height = e.contentWindow.document.body.scrollHeight + 20;
				}
				$("#" + id,"#" + rootel).attr("height", height);
		}, 
		onload : function(tuid){
			    var linkrels = window.top.document.getElementsByTagName('link');
			    var small_head = document.getElementsByTagName('head')[0];
				

			    for (var i = 0, max = linkrels.length; i < max; i++) {
			      if (linkrels[i].rel && linkrels[i].rel == 'stylesheet') {
			        var thestyle = document.createElement('link');
			        var attrib = linkrels[i].attributes;
			        for (var j = 0, attribmax = attrib.length; j < attribmax; j++) {
			        	if(attrib[j].nodeName === "href"){
			        		thestyle.setAttribute(attrib[j].nodeName, parent.Config.Style.Path + attrib[j].nodeValue);	
			        	}
			        	else{
			        		thestyle.setAttribute(attrib[j].nodeName, attrib[j].nodeValue);
			        	}
			          
			        }
					var link = '<link rel="stylesheet" type="text/css" href="' + linkrels[i].href + '" />';
			        small_head.appendChild(thestyle);
			      }
			    }
		}
		
	
};