//Search page JS

$(document).ready(function() { 

// Fix small arrow horizontal position
$('.explore_nav_selected_arrow').css('right', $('.explore_nav_selected').width() / 2 + 10);

// Round cornners for elements with '.rounded_corners' class
$('.rounded_corners').corners("2px");

// IE Fixes
if (($.browser.msie) && ($.browser.version < 8)) {
	// Small Arrow Fix
	$('.explore_nav_selected_arrow').css('bottom','-10px');
	
	
}

});  