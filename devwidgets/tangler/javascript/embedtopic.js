var scripts = document.getElementsByTagName('script');
var index = 0;
for (var i = 0; i < scripts.length; i++){
	var script = scripts[i];
	if (script.src.indexOf("embedtopic.js") != -1){
		index = i;
	}
}
var myScript = scripts[index];

var queryString = myScript.src.replace(/^[^\?]+\??/,'');

var params = parseQuery( queryString );
initialiseEmbedTopic();

function parseQuery ( query )
{
   var Params = new Object ();
   if ( ! query ) return Params; // return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ )
   {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) continue;
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}

function checkParam(id, errorString)
{
	if( id == null || id == undefined )
	{
		alert(errorString);
		return false;
	}
	return true;
}

function initialiseEmbedTopic()
{
	// quit if this function has already been called
	if (arguments.callee.done) return;

	// flag this function so we don't do the same thing twice
	arguments.callee.done = true;
	
	// topic identifier
	var id = params['id'];
	if( !checkParam(id, "Tangler: Embed Topic ID not set.") )return;
	
	// forum identifier
	var gId = params['gId'];
	if( !checkParam(gId, "Tangler: Embed Forum ID not set.")) return;
	
	var eleId = "tangler-embed-topic-" + id;
	var embedElement = document.getElementById(eleId);
	if( !checkParam(embedElement, "Tangler: Embed topic element not set.")) return;
	
	var contextUrl = params['cUrl'];
	
	var width = "410px";
	var height = "480px";
	
	if( embedElement.style )
	{
		width = embedElement.style.width?embedElement.style.width:'410px';
		height = embedElement.style.height?embedElement.style.height:'480px';
	}
	var iframeSrc = 'http://www.tangler.com/embed/topic/' + id;
	if( contextUrl )
		iframeSrc = contextUrl + "/embed/topic/" + id;
		
	var iframe = document.createElement("iframe");
	iframe.src = iframeSrc;
	iframe.width = width;
	iframe.height = height;
	iframe.scolling = 'no';
	iframe.marginwidth = '0';
	iframe.marginheight = '0';
	iframe.frameBorder = '0';
	iframe.style.border = 0;
	var isIE = window.ActiveXObject?true:false;
	if( !isIE ) 
	{
		var a = document.createElement("a");
		a.href = 'http://localhost:8080/forum/id-' + gId + '/topic/' + id;
		a.target = "_blank";
		a.appendChild(document.createTextNode("Join this disucssion"));
		iframe.appendChild(a);
	}
	
	
	embedElement.appendChild(iframe);
}

/**
 * Script provided by Dean Edwards
 * http://dean.edwards.name/weblog/2005/09/busted/
 */
/* for Mozilla */
if (document.addEventListener) {
   document.addEventListener("DOMContentLoaded", initialiseEmbedTopic, false);
}

/*@cc_on @*/
/*@if (@_win32)
document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
var script = document.getElementById("__ie_onload");
script.onreadystatechange = function() {
  if (this.readyState == "complete") {
    initialiseEmbedTopic(); // call the onload handler
  }
};
/*@end @*/

/* for other browsers */
window.onload = initialiseEmbedTopic;