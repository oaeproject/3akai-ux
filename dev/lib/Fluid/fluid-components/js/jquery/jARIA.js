/***
 Copyright 2007 Chris Hoffman
 
 This software is dual licensed under the MIT (MIT-LICENSE.txt)
 and GPL (GPL-LICENSE.txt) licenses.

 You may obtain a copy of the GPL License at 
 https://source.fluidproject.org/svn/fluid/components/trunk/src/webapp/fluid-components/js/jquery/GPL-LICENSE.txt

 You may obtain a copy of the MIT License at 
 https://source.fluidproject.org/svn/fluid/components/trunk/src/webapp/fluid-components/js/jquery/MIT-LICENSE.txt
***/

/******************************
  Commonly used variable names

  args - an array of function arguments
  attr - an attribute name
  el   - a DOM element
  i    - an array index
  jq   - a jQuery object
  val  - a value
 ******************************/

(function($){

var ariaStatesNS = "http://www.w3.org/2005/07/aaa";

var xhtmlRoles = [
	"main",
	"secondary",
	"navigation",
	"banner",
	"contentinfo",
	"statements",
	"note",
	"seealso",
	"search"
];

var xhtmlRolesRegex = new RegExp("^" + xhtmlRoles.join("|") + "$");

var isFF2 = $.browser.mozilla && (parseFloat($.browser.version) < 1.9);

var ariaStateAttr = (function() {
	if (isFF2) {
		// Firefox < v3, so use States & Properties namespace.
		return function(jq, attr, val) {
			if (typeof val != "undefined") {
				jq.each(function(i, el) {
					el.setAttributeNS(ariaStatesNS, "aaa:" + attr, val);
				});
  			} else {
 				return jq.get(0).getAttributeNS(ariaStatesNS, attr);
			}
		};
	} else {
		// Use the aria- attribute form.
		return function(jq, attr, val) {
			if (typeof val != "undefined") {
				jq.each(function(i, el) {
					$(el).attr("aria-" + attr, val);
				});
			} else {
				return jq.attr("aria-" + attr);
			}
		};
	}
})();
  
$.fn.extend({  
	ariaRole : function(role){
		var jq = this;
		if (role) {

			// Add the role: prefix, unless it's one of the XHTML Role Module roles

			role = (xhtmlRolesRegex.test(role) || !isFF2) ? role : "wairole:" + role;

			jq.each(function(i, el) {
				$(el).attr("role", role);
			});
			return jq;
		} else {
			var role = jq.eq(0).attr("role");
			if (role) {
				role = role.replace(/^wairole:/, "");
			}
			return role;
		}
	},

	ariaState : function() {
		var args = arguments;
		var jq = this;
		if (args.length == 2) {

			// State and value were given as separate arguments.

			jq.each(function(i, el) {
				ariaStateAttr($(el), args[0], args[1]);
			});
			return jq;
		} else {
			if (typeof args[0] == "string") {

				// Just a state was supplied, so return a value.

				return ariaStateAttr(jq.eq(0), args[0]);
			} else {

				// An object was supplied. Set states and values based on the keys/values.

				jq.each(function(i, el){
					$.each(args[0], function(state, val) {
						$(el).ariaState(state, val);
					});
				});
				return jq;
			}
 		}
  	}
});

// Add :ariaRole(role) and :ariaState(state[=value]) filters.

$.extend($.expr[':'], {
	// a is the element being tested, m[3] is the argument to the selector.

	ariaRole : "jQuery(a).ariaRole()==m[3]",
	ariaState : "jQuery(a).ariaState(m[3].split(/=/)[0])==(/=/.test(m[3])?m[3].split(/=/)[1]:'true')"
});

})(jQuery);
