/*
* jQuery pager plugin
* Version 1.0 (12/22/2008)
* @requires jQuery v1.2.6 or later
*
* Example at: http://jonpauldavies.github.com/JQuery/Pager/PagerDemo.html
*
* Copyright (c) 2008-2009 Jon Paul Davies
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* 
* Read the related blog post and contact the author at http://www.j-dee.com/2008/12/22/jquery-pager-plugin/
*
* This version is far from perfect and doesn't manage it's own state, therefore contributions are more than welcome!
*
* Usage: .pager({ pagenumber: 1, pagecount: 15, buttonClickCallback: PagerClickTest });
*
* Where pagenumber is the visible page number
*       pagecount is the total number of pages to display
*       buttonClickCallback is the method to fire when a pager button is clicked.
*
* buttonClickCallback signiture is PagerClickTest = function(pageclickednumber) 
* Where pageclickednumber is the number of the page clicked in the control.
*
* The included Pager.CSS file is a dependancy but can obviously tweaked to your wishes
* Tested in IE6 IE7 Firefox & Safari. Any browser strangeness, please report.
* 
* modified by Oszkar Nagy (oszkar@caret.cam.ac.uk) for Sakai
* modified by Simon Gaeremynck (sg555@caret.cam.ac.uk) for Sakai
*/
(function($) {

    $.fn.pager = function(options){
    
        var opts = $.extend({}, $.fn.pager.defaults, options);
        
        return this.each(function(){
        
            // empty out the destination element and then render out the pager with the supplied options
			var htmlparts = {};
			if (typeof options.htmlparts === "undefined") {
				htmlparts = $.fn.pager.defaults.htmlparts;
			}
            $(this).empty().append(renderpager(parseInt(options.pagenumber, 10), parseInt(options.pagecount, 10), options.buttonClickCallback, htmlparts));
            
        });
    };

    // render and return the pager with the supplied options
    function renderpager(pagenumber, pagecount, buttonClickCallback, htmlparts) {

        // setup $pager to hold render
        var $pager = $('<ul class="sakai_pager"></ul>');

        // add in the previous and next buttons
        //$pager.append(renderButton('First', pagenumber, pagecount, buttonClickCallback)).append(renderButton('&laquo; Prev', pagenumber, pagecount, buttonClickCallback));
		
		// Without 'First' button
		$pager.append(renderButton('prev', pagenumber, pagecount, buttonClickCallback, htmlparts));
		
        // pager currently only handles 10 viewable pages ( could be easily parameterized, maybe in next version ) so handle edge cases
        var startPoint = 1;
        var endPoint = 5;

        if (pagenumber > 3) {
            startPoint = pagenumber - 2;
            endPoint = pagenumber + 2;
        }

        if (endPoint > pagecount) {
            startPoint = pagecount - 3;
            endPoint = pagecount;
        }

        if (startPoint < 1) {
            startPoint = 1;
        }
		
		// Add 3 dots divider
		var $divider_begin = $('<li id="jq_pager_three_dots_begin" class="dots hidden">...</li>');
		$pager.append($divider_begin);
		
        // loop thru visible pages and render buttons
        for (var page = startPoint; page <= endPoint; page++) {

            var currentButton = $('<li class="page-number"><span>' + (page) + '</span></li>');

            page == pagenumber ? currentButton.addClass('pgCurrent') : currentButton.click(function() { buttonClickCallback(this.firstChild.firstChild.data); });
            currentButton.appendTo($pager);
        }

        // render in the next and last buttons before returning the whole rendered control back.
        //$pager.append(renderButton('Next &raquo;', pagenumber, pagecount, buttonClickCallback)).append(renderButton('Last', pagenumber, pagecount, buttonClickCallback));
		
		// Add 3 dots divider
		var $divider_end = $('<li id="jq_pager_three_dots_end" class="dots hidden">...</li>');
		$pager.append($divider_end);
		
		// without 'Last' button:
		$pager.append(renderButton('next', pagenumber, pagecount, buttonClickCallback, htmlparts));
		
		if (startPoint > 1)
			{
				$divider_begin.removeClass('hidden');
			}
		
		if (pagecount > endPoint)
			{
				$divider_end.removeClass('hidden');
			}
			
        return $pager;
    }

    // renders and returns a 'specialized' button, ie 'next', 'previous' etc. rather than a page number button
    function renderButton(part, pagenumber, pagecount, buttonClickCallback, htmlparts) {

		var buttonLabel = htmlparts[part];

        var $Button = $('<li class="pgNext">' + buttonLabel + '</li>');

        var destPage = 1;

        // work out destination page for required button type
        switch (part) {
            case "first":
                destPage = 1;
                break;
            case "prev":
                destPage = pagenumber - 1;
				$Button = $('<li class="pgPrev">' + buttonLabel + '</li>');
                break;
            case "next":
                destPage = pagenumber + 1;
                break;
            case "last":
                destPage = pagecount;
                break;
        }

        // disable and 'grey' out buttons if not needed.
        if (part === "first" || part === "prev") {
            pagenumber <= 1 ? $Button.addClass('pgEmpty') : $Button.click(function() { buttonClickCallback(destPage); });
        }
        else {
            pagenumber >= pagecount ? $Button.addClass('pgEmpty') : $Button.click(function() { buttonClickCallback(destPage); });
        }

        return $Button;
    }

    // pager defaults. hardly worth bothering with in this case but used as placeholder for expansion in the next version
    $.fn.pager.defaults = {
        pagenumber: 1,
        pagecount: 1,
		htmlparts : {
			'first' : 'first',
			'last' : 'last',
			'prev' : '<span><img src="/dev/_images/scroll_arrow_left.png" alt="" /> <span class="t">Prev</span></span>',
			'next' : '<span><span class="t">Next</span> <img src="/dev/_images/scroll_arrow_right.png" alt="" /></span>' 
		}
    };

})(jQuery);