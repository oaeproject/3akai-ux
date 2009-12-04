/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global sakai, Config, $, QueryString */

sakai.s23_site = sakai.s23_site || {};

sakai.s23_site = function(){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var qs = new Querystring(); // Get the current query string
	var completeJSON;

	// CSS selectors
	var s23Site = "#s23_site";
	var s23SiteTitle = $(s23Site + "_title");
	var s23SiteIframeContainer = $(s23Site + "_iframe_container");
	var s23SiteMenuContainer = $(s23Site + "_menu_container");
	var s23SiteMenuItemTag = "s23_site_menu_item_";
	var s23SiteMenuItems = s23Site + "_menu_container ul li a";
	
	// Templates
	var s23SiteIframeContainerTemplate = "s23_site_iframe_container_template";
	var s23SiteMenuContainerTemplate = "s23_site_menu_container_template";
	
	
	///////////////////////
	// General functions //
	///////////////////////
	
	/**
	 * Get all the information about a certain page
	 * @param {String} pageid The id of the page you want information for
	 * @return {Object} A page object containing the info about the page
	 */
	var getPageInfo = function(pageid){
		
		// Run over all the pages and return the page object that has the same
		// id as the pageid argument
		for (var i = 0, len = completeJSON.site.pages.length; i < len; i++) {
			if (completeJSON.site.pages[i].id === pageid) {
				return completeJSON.site.pages[i];
			}
		}

		// Log a message if the page with the given pageid was not found
		fluid.log("s23_site: the page with id'" + pageid + "' was not found in the json object");

	};
	
	/**
	 * Load the tools for a certain page
	 * @param {Object} pageid The id of the page you want the tools loaded for
	 */
	var loadPageTools = function(pageid){
		
		// Get the page info for a certain page and store it in a variable
		var page = getPageInfo(pageid);
		
		// Check if the page actually exists
		if(page){
			
			// Render the tools of the site
			s23SiteIframeContainer.html($.Template.render(s23SiteIframeContainerTemplate, page));
		}
		
	};
	
	/**
	 * Create an xid for every tool that exists
	 * We need this because the iframe looks at the parent frame with the xid
	 * An url could be 	0175d73d-741f-4fb3-94dc-9f8c1d4925a9
	 * An xid is		0175d73dx741fx4fb3x94dcx9f8c1d4925a9
	 */
	var createxids = function(){
		
		// Run over all the pages and then all the tools inside a page to modify the xid
		for (var i=0, len=completeJSON.site.pages.length; i<len; i++) {
			if (completeJSON.site.pages[i].tools && completeJSON.site.pages[i].tools.length>0) {
				for (var j = 0, toolslen = completeJSON.site.pages[i].tools.length; j < toolslen; j++) {
					completeJSON.site.pages[i].tools[j].xid = completeJSON.site.pages[i].tools[j].url.replace(/-/g, "x");
				}
			}
		}
	};
	
	/**
	 * Parse the site info that is in a JSON format
	 * to show it on the page
	 */
	var parseSakai2SiteInfo = function(){
	
		// Check if the title and the pages attribute exist
		if (completeJSON && completeJSON.site && completeJSON.site.title && completeJSON.site.pages) {
		
			// Set the title of the page
			s23SiteTitle.text(completeJSON.site.title);

			// Render the menu of the workspace
			s23SiteMenuContainer.html($.Template.render(s23SiteMenuContainerTemplate, completeJSON));
			
			// Create xid's
			createxids();
			
			/*
			 * Bind a click handler to every site menu item
			 */
			$(s23SiteMenuItems).click(function(ev){
				
				// Prevent going to the actual page
				ev.preventDefault();
				
				// Get the id of the tool you clicked on
				var id = this.id.replace(s23SiteMenuItemTag, "");
				
				// Load the tools for a specific page
				loadPageTools(id);
			});
			
			// Pretend like you clicked on the first page
			$(s23SiteMenuItems + ":first").trigger("click");
			
		}
		else {
			fluid.log("s23_site: An error occured when parsing the Sakai 2 site information");
		}
		
	};
	
	/**
	 * Get the information of a Sakai2 site
	 * @param {String} siteid The id of the Sakai2 site you want to
	 */
	var getSakai2SiteInfo = function(siteid){
		
		// Send an Ajax request to the sakai2 tools service
		$.ajax({
			url: Config.URL.SAKAI2_TOOLS_SERVICE.replace(/__SITEID__/, siteid),
			success: function(data){
			
				// Evaluate the data to JSON
				completeJSON = $.evalJSON(data);
				
				// Parse the Sakai2 info
				parseSakai2SiteInfo();
			},
			error: function(status){
				fluid.log("s23_site: It was not possible to get the information the Sakai 2 site with the id: " + siteid + " the error code is: " + status);
			}
		});
	};
	
	
	/////////////////////////////
	// Initialisation function //
	/////////////////////////////
	
	/**
	 * Function that get executed when the DOM is completely loaded
	 */
	var init = function(){
	
		// Check if the query string contains the parameter id
		if (qs.contains("id")) {
		
			// Get the value for the id parameter
			var siteid = qs.get("id");
			
			// Send an ajax request to the user
			getSakai2SiteInfo(siteid);
		}
		else {
		
			// Log an error message for the user
			fluid.log("s23site: This site needs to have an id parameter for a sakai2 site");
		}
	};
	init();
};
sdata.container.registerForLoad("sakai.s23_site");


////////////////////////////
// Sakai2: headscripts.js //
////////////////////////////

/**********************************************************************************
 * $URL: $
 * $Id: $
 ***********************************************************************************
 *
 * Copyright (c) 2003, 2004, 2005, 2006, 2007 The Sakai Foundation
 *
 * Licensed under the Educational Community License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 **********************************************************************************/

var courierRunning = false;

var focus_path;

var ignoreCourier = false;
var doubleDeep = false;

function openWindow(url, title, options)
{
	var win = top.window.open(url, title, options);
	win.focus();
	return win;
}

function sitehelp(whereto) 
{
	umcthelp=window.open(whereto,'umcthelpWindow','toolbar=yes,scrollbars=yes,resizable=yes,menubar=no,status=yes,directories=no,location=no,width=600,height=400')
}

function hideElement(hideMe)
{
	if (hideMe != 'none')
	{
		var menuItem = document.getElementById(hideMe);
		if(menuItem != null)
			menuItem.style.display = 'none';
	}
	return true;
}

/* %%% currently disabled, used for paitence display -ggolden
function showSubmitMessage()
{
	var submitDiv = document.getElementById('SubmitMessage');
	var normalDiv = document.getElementById('chefPortletContainer')
	if (submitDiv != null) 
	{
		submitDiv.style.display = '';
		if (normalDiv != null)
			normalDiv.style.display = 'none';
	}
	return true;
}
*/

// PLEASE SEE http://www.worldtimzone.com/res/encode/
// before modifying any of this UTF-8 encoding JavaScript!
/* ***************************
** Most of this code was kindly 
** provided to me by
** Andrew Clover (and at doxdesk dot com)
** http://and.doxdesk.com/ 
** in response to my plea in my blog at 
** http://worldtimzone.com/blog/date/2002/09/24
** It was unclear whether he created it.
*/ 
// Uses the JavaScript built-in function encodeURIComponent()
// which properly encodes UTF-8.  If the function isn't available,
// emulates the function (older browsers like IE 5.0)
function myEscape(value)
{
	if (value == "") return "";
	if (typeof encodeURIComponent == "function")
	{
		// Use JavaScript built-in function
		// IE 5.5+ and Netscape 6+ and Mozilla
		return encodeURIComponent(value);
	}
	else 
	{
		// Need to mimic the JavaScript version
		// Netscape 4 and IE 4 and IE 5.0
		return encodeURIComponentEmulated(value);
	}
}

function encodeURIComponentEmulated(s) {
  var s = utf8(s);
  var c;
  var enc = "";
  for (var i= 0; i<s.length; i++) {
    if (okURIchars.indexOf(s.charAt(i))==-1)
      enc += "%"+toHex(s.charCodeAt(i));
    else
      enc += s.charAt(i);
  }
  return enc;
}


function utf8(wide) {
  var c, s;
  var enc = "";
  var i = 0;
  while(i<wide.length) {
    c= wide.charCodeAt(i++);
    // handle UTF-16 surrogates
    if (c>=0xDC00 && c<0xE000) continue;
    if (c>=0xD800 && c<0xDC00) {
      if (i>=wide.length) continue;
      s= wide.charCodeAt(i++);
      if (s<0xDC00 || c>=0xDE00) continue;
      c= ((c-0xD800)<<10)+(s-0xDC00)+0x10000;
    }
    // output value
    if (c<0x80) enc += String.fromCharCode(c);
    else if (c<0x800) enc += String.fromCharCode(0xC0+(c>>6),0x80+(c&0x3F));
    else if (c<0x10000) enc += String.fromCharCode(0xE0+(c>>12),0x80+(c>>6&0x3F),0x80+(c&0x3F));
    else enc += String.fromCharCode(0xF0+(c>>18),0x80+(c>>12&0x3F),0x80+(c>>6&0x3F),0x80+(c&0x3F));
  }
  return enc;
}

var hexchars = "0123456789ABCDEF";

function toHex(n) {
  return hexchars.charAt(n>>4)+hexchars.charAt(n & 0xF);
}

var okURIchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

function buildQueryString(theFormName)
{
	theForm = document.forms[theFormName];
	var qs = '';
	for (var e=0; e<theForm.elements.length; e++)
	{
		var element = theForm.elements[e];
		if ((element.name) && (element.type) && (element.value))
		{
			var checkRadio = ((element.type == "checkbox") || (element.type == "radio"));
			if ((element.name != '') && (element.name.indexOf("eventSubmit_") == -1))
			{
				if ( !checkRadio || element.checked)
				{
					qs += '&' + myEscape(element.name) + '=' + myEscape(element.value);
				}
			}
		}
	}
	return qs;
}

// use if peer w/ courier, both frames in "top" parent
function updCourier(dd, ic)
{
	if (ic) return;

	if (dd)
	{
		parent.updCourier(false, false);
		return;
	}

	if ((!courierRunning) && (window.courier) && (window.courier.location.toString().length > 1))
	{
		courierRunning = true;
		window.courier.location.replace(window.courier.location);
	}

        // If we are using the httpCourier for event delivery, speed it up
	try {
		if ( httpCourier ) {
		        setTimeout('httpCourier()', 200);
		}
	} catch (error) {}
}

function formSubmitOnEnter(field, event)
{
	var keycode;
	if (window.event)
	{
		keycode = window.event.keyCode;
	}
	else
	{
		keycode = event.which ? event.which : event.keyCode
	}

	if (keycode == 13)
	{
		field.form.submit();
		return false;
	}
	
	return true;
}

// click an element id = element
function clickOnEnter(event, element)
{
	var keycode;
	if (window.event)
	{
		keycode = window.event.keyCode;
	}
	else
	{
		keycode = event.which ? event.which : event.keyCode
	}

	if (keycode == 13)
	{
		if (document.getElementById(element) && document.getElementById(element).click)
		{
			document.getElementById(element).click();
		}
		return false;
	}
	
	return true;
}

// set the parent iframe's height to hold our entire contents
function setMainFrameHeight(id)
{
	// some browsers need a moment to finish rendering so the height and scroll are correct
	setTimeout("setMainFrameHeightNow('"+id+"')",1);
}

function setMainFrameHeightNow(id)
{
	// run the script only if this window's name matches the id parameter
	// this tells us that the iframe in parent by the name of 'id' is the one who spawned us
	if (typeof window.name != "undefined" && id != window.name) return;

	var frame = parent.document.getElementById(id);
	if (frame)
	{
		// reset the scroll
		parent.window.scrollTo(0,0);

		var objToResize = (frame.style) ? frame.style : frame;
  
    // SAK-11014 revert           if ( false ) {

		var height; 		
		var offsetH = document.body.offsetHeight;
		var innerDocScrollH = null;

		if (typeof(frame.contentDocument) != 'undefined' || typeof(frame.contentWindow) != 'undefined')
		{
			// very special way to get the height from IE on Windows!
			// note that the above special way of testing for undefined variables is necessary for older browsers
			// (IE 5.5 Mac) to not choke on the undefined variables.
 			var innerDoc = (frame.contentDocument) ? frame.contentDocument : frame.contentWindow.document;
			innerDocScrollH = (innerDoc != null) ? innerDoc.body.scrollHeight : null;
		}
	
		if (document.all && innerDocScrollH != null)
		{
			// IE on Windows only
			height = innerDocScrollH;
		}
		else
		{
			// every other browser!
			height = offsetH;
		}
   // SAK-11014 revert		} 

   // SAK-11014 revert             var height = getFrameHeight(frame);

		// here we fudge to get a little bigger
		var newHeight = height + 40;

		// but not too big!
		if (newHeight > 32760) newHeight = 32760;

		// capture my current scroll position
		var scroll = findScroll();

		// resize parent frame (this resets the scroll as well)
		objToResize.height=newHeight + "px";

		// reset the scroll, unless it was y=0)
		if (scroll[1] > 0)
		{
			var position = findPosition(frame);
			parent.window.scrollTo(position[0]+scroll[0], position[1]+scroll[1]);
		}

// optional hook triggered after the head script fires.

		if (parent.postIframeResize){ 
			parent.postIframeResize(id);
		}
	}
}

/* get height of an iframe document */
function getFrameHeight (frame)
{
   var document = frame.contentWindow.document;
   var doc_height = document.height ? document.height : 0; // Safari uses document.height

if (document.documentElement && document.documentElement.scrollHeight) /* Strict mode */
      return Math.max (document.documentElement.scrollHeight, doc_height);
   else /* quirks mode */
      return Math.max (document.body.scrollHeight, doc_height);
}


// find the object position in its window
// inspired by http://www.quirksmode.org/js/findpos.html
function findPosition(obj)
{
	var x = 0;
	var y = 0;
	if (obj.offsetParent)
	{
		x = obj.offsetLeft;
		y = obj.offsetTop;
		while (obj = obj.offsetParent)
		{
			x += obj.offsetLeft;
			y += obj.offsetTop;
		}
	}
	return [x,y];
}

// find my scroll
// inspired by http://www.quirksmode.org/viewport/compatibility.html
function findScroll()
{
	var x = 0;
	var y = 0;
	if (self.pageYOffset)
	{
		x = self.pageXOffset;
		y = self.pageYOffset;
	}
	else if (document.documentElement && document.documentElement.scrollTop)
	{
		x = document.documentElement.scrollLeft;
		y = document.documentElement.scrollTop;
	}
	else if (document.body)
	{
		x = document.body.scrollLeft;
		y = document.body.scrollTop;
	}
	
	return [x,y];
}

// find the first form's first text field and place the cursor there
function firstFocus()
{
	if (document.forms.length > 0)
	{
		var f = document.forms[0];
		for (var i=0; i<f.length; i++)
		{
			var e = f.elements[i];
			if ((e.name) && (e.type) && ((e.type=='text') || (e.type=='textarea')) && (!e.disabled))
			{
				e.focus();
				break;
			}
		}
	}
}

// set focus on a particular element in a page.
// the path to that element is given by a series of element id's in an array (param "elements")
// which should be the id's of zero or more frames followed by the id of the element.
function setFocus(elements)
{
	if(typeof elements == "undefined")
	{
		return;
	}

	var focal_point = document;
	for(var i = 0; i < elements.length; i++)
	{
		if(focal_point.getElementById(elements[i]))
		{
			focal_point = focal_point.getElementById(elements[i]);
		}
		
		if(focal_point.contentDocument)
		{
			focal_point = focal_point.contentDocument;
		}
		else if(focal_point.contentWindow)
		{
			focal_point = focal_point.contentWindow;
			if(focal_point.document)
			{
				focal_point = focal_point.document;
			}
		}
		else
		{
			break;
		}
	}
	
	if(focal_point && focal_point.focus)
	{
		focal_point.focus();
	}
}

// return the url with auto=courier appended, sensitive to ? already in there or not
function addAuto(loc)
{
	var str = loc.toString();

	// not if already there
	if (str.indexOf("auto=courier") != -1) return str;
	
	if (str.indexOf("?") != -1)
	{
		// has a ?
		return str + '&auto=courier';
	}
	else
	{
		// has no ?
		return str + '?auto=courier';
	}
}

function showNotif(item, button,formName)
{
	if (button !="noBlock")
	{
		eval("document." + formName + "." + button + ".disabled=true")
	}
	if (item !="noNotif")
	{
		var browserType;
		if (document.all) {browserType = "ie"}
		if (window.navigator.userAgent.toLowerCase().match("gecko") || window.navigator.userAgent.toLowerCase().match("opera") ) {browserType= "gecko"}
		if (browserType == "gecko" )
			document.showItem = eval('document.getElementById(item)');
		else if (browserType == "ie")
			document.showItem = eval('document.all[item]');
		else
			document.showItem = eval('document.layers[item]');

			document.showItem.style.visibility = "visible";
	}
	
	for (var i=0;i<document.getElementsByTagName("input").length; i++) 
	{
		if (document.getElementsByTagName("input").item(i).className == "disableme")
		{
			document.getElementsByTagName("input").item(i).disabled = "disabled";
		}
	}		
}

// stuff to do auto-update using the XMLHttpRequest object
var updateReq;
var updateTime = 0;
var updateUrl = "";
var updateWaiting = 0;

function loadXMLDoc(url)
{
	// branch for native XMLHttpRequest object
	if (window.XMLHttpRequest)
	{
		updateReq = new XMLHttpRequest();
		updateReq.onreadystatechange = processReqChange;
		// adjust the url with a unique (time based for sequence, plus random for multi user) value to disable caching
		// and the auto parameter to indicate this is not user activity
		updateReq.open("GET", url + "?auto=true&unq=" + new Date().getTime() + "-" +  Math.random(), true);
		updateReq.send(null);
	}

	// branch for IE/Windows ActiveX version
	else if (window.ActiveXObject)
	{
		updateReq = new ActiveXObject("Microsoft.XMLHTTP");
		if (updateReq)
		{
			updateReq.onreadystatechange = processReqChange;
			// adjust the url with a unique (time based for sequence, plus random for multi user) value to disable caching
			// and the auto parameter to indicate this is not user activity
			updateReq.open("GET", url + "?auto=true&unq=" + new Date().getTime() + "-" +  Math.random(), true);
			updateReq.send();
		}
	}
}

function processReqChange()
{
	try
	{
		if (updateReq.readyState == 4)
		{
			evalString = updateReq.responseText;
			// alert(updateReq.readyState + " : " + updateReq.status + " : " + evalString);
			try
			{
				eval(evalString);
			}
			catch (err)
			{
				// alert(err);
			}
			swapUpdateIndicator();

			updateReq = null;
			scheduleUpdate();
		}
	}
	catch (error)
	{
		// alert(error);
	}
}

function swapUpdateIndicator()
{
	try
	{
		if (document.getElementById('update_a').style.display=='none')
		{
			document.getElementById('update_a').style.display='block';
			document.getElementById('update_b').style.display='none';
		}
		else
		{
			document.getElementById('update_a').style.display='none';
			document.getElementById('update_b').style.display='block';
		}
	}
	catch (error)
	{
//		alert(error);
	}
}

function checkForUpdate()
{
	updateWaiting = 0;
	if ((updateUrl != "") && (updateReq == null))
	{
		loadXMLDoc(updateUrl);
	}
}

function scheduleUpdate()
{
	if ((updateTime > 0) && (updateWaiting == 0))
	{
		updateWaiting = setTimeout('checkForUpdate()', updateTime);
	}
}

function updateNow()
{
	if (updateWaiting != 0)
	{
		clearTimeout(updateWaiting);
	}
	checkForUpdate();
}

function portalWindowRefresh(url)
{
	if (typeof(sakaiPortalWindow) != "undefined")
	{
		location.replace(url);
	}
	else if (parent && (typeof(parent.sakaiPortalWindow) != "undefined"))
	{
		parent.location.replace(url);
	}
	else if (parent && parent.parent && (typeof(parent.parent.sakaiPortalWindow) != "undefined"))
	{
		parent.parent.location.replace(url);
	}
	else if (parent && parent.parent && parent.parent.parent && (typeof(parent.parent.parent.sakaiPortalWindow) != "undefined"))
	{
		parent.parent.parent.location.replace(url);
	}
	else
	{
		location.replace(url);
	}
}

function privacy_show_popup(id){
	el = document.getElementById("privacy_tool_popup");
	if(el){el.style.display='block';}
	overlaydiv = document.createElement("div");
	overlaydiv.id = "privacy_overlay";
	document.body.appendChild(overlaydiv);
}

function privacy_hide_popup(){
   if(document.getElementById("privacy_overlay")){document.body.removeChild(document.getElementById("privacy_overlay"));}
   if(document.getElementById("privacy_tool_popup")){document.getElementById("privacy_tool_popup").style.display="none";}
}

function browserSafeDocHeight() {
	docHeight = Math.max(document.body.scrollHeight,document.body.offsetHeight) ;
	if (window.innerHeight) {  // all except Explorer
		winHeight = window.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		winHeight = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		winHeight =  document.body.clientHeight;
	}
	return Math.max(winHeight,docHeight); 
}