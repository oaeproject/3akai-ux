/******************************************************************************************************

	jQuery.ThreeDots

	Author Jeremy Horn
	Version 1.0.10 (Developed in Aptana Studio 1.5.1)
	Date: 1/25/2010

	Copyright (c) 2010 Jeremy Horn- jeremydhorn(at)gmail(dot)c0m | http://tpgblog.com
	Dual licensed under MIT and GPL.

	For more detailed documentation, including the latest updates and links to more usage and 
	examples, go to:
	
			http://tpgblog.com/ThreeDots/

	KNOWN BUGS
		None

	DESCRIPTION

		Sometimes the text ...
			... is too long ...
			... won't fit within the number of rows you have available.
		
		Sometimes all you need is ... ThreeDots!
		
		ThreeDots is a customizable jQuery plugin for the smart truncation of text.  It shortens 
		provided text to fit specified dimensions and appends the desired ellipsis style
		if/when truncation occurs.  		
		
		For example ---
		
			This:
				There was once a brown fox
				that liked to eat chocolate
				pudding.
			
			When restricted to 2 lines by ThreeDots, can become:
				There was once a brown fox
				that liked to eat ...
				
			Or:
				There was once a brown fox
				that liked to (click for more)

			... and most any other permutation you desire.


	BY DEFAULT
		The three dots ellipsis ("...") is used, as shown in the prior example, and limits
		text to a maximum of 2 lines.  These and many other characteristics are fully customizable,
		and fully itemized and explained below.


	IMPLEMENTATION

		HTML:		<div class='text_here'><span class='ellipsis_text'>TEXT</span></div>
		JS:			$('.text_here').ThreeDots(); // USE DEFAULTS
					$('.text_here2').ThreeDots({ { max_rows:3 });
		

	COMPATIBILITY

		Tested in FF3.5, IE7, Chrome
		With jQuery 1.3.x, 1.4

	METHODS

		ThreeDots()
		
		When intialized the ThreeDots plugin creates and assigns the full set of provided text 
		to each container element as a publically accessible attribute, 'threedots'.  Method 
		implementation supports chaining and returns jQuery object.

		Note that to implement, the text that you wish to ellipsize must be wrapped in a span
		assigned either the default class 'ellipsis_text' or other custom class of your 
		preference -- customizable via the options/settings.
		
		If the text becomes truncated to fit within the constrained space defined by the 
		container element that holds the 'ellipsis_text' span then an additional span is
		appended within the container object, and after the 'ellipsis_text' span.
		
		Note, that the span class of 'threedots_ellipsis' can also be customized via the 
		options/settings and have it's own CSS/jQuery styles/actions/etc. applied to it as
		desired.
		
		If any of the specified settings are invalid or the 'ellipsis_text' span is missing
		nothing will happen.

		IMPORTANT:	The horizontal constrains placed upon each row are controled by the 
					container object.  The container object is the object specified in the 
					primary selector.
					
						e.g. $('container_object').ThreeDots();
					
					So, remember to set container_object's WIDTH.
						
		ThreeDots.update()
			Refreshes the contents of the text within the target object inline with the
			options provided. Note, that the current implementation of options/settings
			are destructive.  This means that whenever OPTIONS are specified they are
			merged with the DEFAULT options and applied to the current object(s), and 
			destroy/override any previously specified options/settings.
			
				example:
					var obj = $('.text_here').ThreeDots();  // uses DEFAULT: max_rows = 2
					obj.update({max_rows:3});				// update the text with max_rows = 3

	CUSTOMIZATION

		ThreeDots(OPTIONS)
		e.g. $('.text_here').ThreeDots({ max_rows: 4 });
					
		
		valid_delimiters:	character array of special characters upon which the text string may be broken up;
							defines what characters can be used to express the bounds of a word
							
							all elements in this array must be 1 character in length; any delimiter less than 
							or greater than	1 character will be ignored
														
							
		ellipsis_string: 	defines what to display at the tail end of the text provided if the text becomes 
							truncated to fit within the space defined by the container object
												
							
		max_rows:			specifies the upper limit for the number of rows that the object's text can use
				
		
		text_span_class:	by default ThreeDots will look within the specified object(s) for a span
							of the class 'ellipsis_text'
							
		
		e_span_class:		if an ellipsis_string is displayed at the tail end of the selected object's
							text due to truncation of that text then it will be displayed wrapped within
							a span associated with the class defined by e_span_class and immediately
							following the text_span_class' span
		
		
		whole_word:			when fitting the provided text to the max_rows within the container object
							this boolean setting defines whether or not the 
							
								if true
									THEN	don't truncate any words; ellipsis can ONLY be placed after 
											the last whole word that fits within the provided space, OR
											
								if false
									THEN	maximuze the text within the provided space, allowing the 
											PARTIAL display of words before the ellipsis
		
		
		allow_dangle:		a dangling ellipsis is an ellipsis that typically occurs due to words that
							are longer than a single row of text, resulting, upon text truncation in
							the ellipsis being displayed on a row all by itself
													
							if allow_dangle is set to false, whole_words is overridden ONLY in the 
							circumstances where a dangling ellipsis occurs and the displayed text
							is adjusted to minimize the occurence of such dangling
									
		
		alt_text_e: 		alt_text_e is a shortcut to enabling the user of the product that 
							made use of ThreeDots to see the full text, prior to truncation
							
							if the value is set to true, then the ellipsis span's title property
							is set to the full, original text (pre-truncation)
		
		
		alt_text_t: 		alt_text_t is a shortcut to enabling the user of the product that 
							made use of ThreeDots to see the full text, prior to truncation
							
							if the value is set to true AND the ellipsis is displayed, then the 
							text span's title property is set to the full, original text 
							(pre-truncation) 
	

	MORE

		For latest updates and links to more usage and examples, go to:
			http://tpgblog.com/ThreeDots/
			
	FUTURE NOTE
	
		Do not write any code dependent on the c_settings variable.  If you don't know what this is
		cool -- you don't need to. ;-)  c_settings WILL BE DEPRECATED.
		
		Further optimizations in progress...

******************************************************************************************************/


(function($) {

	/**********************************************************************************

		METHOD
			ThreeDots {PUBLIC}

		DESCRIPTION
			ThreeDots method constructor
			
			allows for the customization of ellipsis, delimiters, etc., and smart 
			truncation of provided objects' text
					
				e.g. $(something).ThreeDots();

	**********************************************************************************/

	$.fn.ThreeDots = function(options) {
		var return_value = this;

		// check for new & valid options
		if ((typeof options == 'object') || (options == undefined)) {
			$.fn.ThreeDots.the_selected = this;

			var return_value = $.fn.ThreeDots.update(options);

		}
		
		return return_value;
	};


	/**********************************************************************************

		METHOD
			ThreeDots.update {PUBLIC}

		DESCRIPTION
			applies the core logic of ThreeDots
			
			allows for the customization of ellipsis, delimiters, etc., and smart 
			truncation of provided objects' text
			
			updates the objects' visible text to fit within its container(s)
		
		TODO
			instead of having all options/settings calls be constructive have 
			settings associated w/ object returned also accessible from HERE 
			[STATIC settings, associated w/ the initial call] 

	**********************************************************************************/

	$.fn.ThreeDots.update = function(options) {
		// initialize local variables
		var curr_this, last_word = null;
		var lineh, paddingt, paddingb, innerh, temp_height;
		var curr_text_span, lws; /* last word structure */
		var last_text, three_dots_value, last_del;

		// check for new & valid options
		if ((typeof options == 'object') || (options == undefined)) {

			// then update the settings
			// CURRENTLY, settings are not CONSTRUCTIVE, but merged with the DEFAULTS every time
			$.fn.ThreeDots.c_settings = $.extend({}, $.fn.ThreeDots.settings, options);
			var max_rows = $.fn.ThreeDots.c_settings.max_rows;
			if (max_rows < 1) {
				return $.fn.ThreeDots.the_selected;
			}

			// make sure at least 1 valid delimiter
			var valid_delimiter_exists = false;
			jQuery.each($.fn.ThreeDots.c_settings.valid_delimiters, function(i, curr_del) {
				if (((new String(curr_del)).length == 1)) {
					valid_delimiter_exists = true; 
				}
			});
			if (valid_delimiter_exists == false) {
				return $.fn.ThreeDots.the_selected;
			}
			
			// process all provided objects
			$.fn.ThreeDots.the_selected.each(function() {

				// element-specific code here
				curr_this = $(this);
		
				// obtain the text span
				if ($(curr_this).children('.'+$.fn.ThreeDots.c_settings.text_span_class).length == 0) { 
					// if span doesnt exist, then go to next
					return true;
				}
				curr_text_span = $(curr_this).children('.'+$.fn.ThreeDots.c_settings.text_span_class).get(0);

				// pre-calc fixed components of num_rows
				var nr_fixed = num_rows(curr_this, true);

				// remember where it all began so that we can see if we ended up exactly where we started
				var init_text_span = $(curr_text_span).text();

				// preprocessor
				the_bisector(curr_this, curr_text_span, nr_fixed);
				var init_post_b = $(curr_text_span).text();

				// if the object has been initialized, then user must be calling UPDATE
				// THEREFORE refresh the text area before re-operating
				if ((three_dots_value = $(curr_this).attr('threedots')) != undefined) {
					$(curr_text_span).text(three_dots_value);						
					$(curr_this).children('.'+$.fn.ThreeDots.c_settings.e_span_class).remove();
				}

				last_text = $(curr_text_span).text();
				if (last_text.length <= 0) {
					last_text = '';
				}
				$(curr_this).attr('threedots', init_text_span);

				if (num_rows(curr_this, nr_fixed) > max_rows) {
					// append the ellipsis span & remember the original text
					curr_ellipsis = $(curr_this).append('<span style="white-space:nowrap" class="'	
														+ $.fn.ThreeDots.c_settings.e_span_class + '">'
														+ $.fn.ThreeDots.c_settings.ellipsis_string 
														+ '</span>');
	
					// remove 1 word at a time UNTIL max_rows
					while (num_rows(curr_this, nr_fixed) > max_rows) {
						
						lws = the_last_word($(curr_text_span).text());// HERE
						$(curr_text_span).text(lws.updated_string);
						last_word = lws.word;
						last_del = lws.del;

						if (last_del == null) {
							break;					
						}
					} // while (num_rows(curr_this, nr_fixed) > max_rows)

					// check for super long words
					if (last_word != null) {
						var is_dangling = dangling_ellipsis(curr_this, nr_fixed);

						if ((num_rows(curr_this, nr_fixed) <= max_rows - 1) 
							|| (is_dangling) 
							|| (!$.fn.ThreeDots.c_settings.whole_word)) {

							last_text = $(curr_text_span).text();
							if (lws.del != null) {
								$(curr_text_span).text(last_text + last_del);
							}
									
							if (num_rows(curr_this, nr_fixed) > max_rows) {
								// undo what i just did and stop
								$(curr_text_span).text(last_text);
							} else {
								// keep going
								$(curr_text_span).text($(curr_text_span).text() + last_word);
								
								// break up the last word IFF (1) word is longer than a line, OR (2) whole_word == false
								if ((num_rows(curr_this, nr_fixed) > max_rows + 1) 
									|| (!$.fn.ThreeDots.c_settings.whole_word)
									|| (init_post_b == last_word)
									|| is_dangling) {
									// remove 1 char at a time until it all fits
									while ((num_rows(curr_this, nr_fixed) > max_rows)) {
										if ($(curr_text_span).text().length > 0) {
											$(curr_text_span).text(
												$(curr_text_span).text().substr(0, $(curr_text_span).text().length - 1)
											);
										} else {
											/* 
											 there is no hope for you; you are crazy;
											 either pick a shorter ellipsis_string OR
											 use a wider object --- geeze!
											 */
											break;
										}
									}							
								}
							}
						}
					}
				}	
				
				// if nothing has changed, remove the ellipsis
				if (init_text_span == $($(curr_this).children('.' + $.fn.ThreeDots.c_settings.text_span_class).get(0)).text()) {
					$(curr_this).children('.' + $.fn.ThreeDots.c_settings.e_span_class).remove();
				} else {				
					// only add any title text if the ellipsis is visible
					if (($(curr_this).children('.' + $.fn.ThreeDots.c_settings.e_span_class)).length > 0) {
						if ($.fn.ThreeDots.c_settings.alt_text_t) {
							$(curr_this).children('.' + $.fn.ThreeDots.c_settings.text_span_class).attr('title', init_text_span);
						}
						
						if ($.fn.ThreeDots.c_settings.alt_text_e) {
							$(curr_this).children('.' + $.fn.ThreeDots.c_settings.e_span_class).attr('title', init_text_span);
						}
						
					}
				}
			}); // $.fn.ThreeDots.the_selected.each(function() 
		}

		return $.fn.ThreeDots.the_selected;
	};


	/**********************************************************************************

		METHOD
			ThreeDots.settings {PUBLIC}

		DESCRIPTION
			data structure containing the max_rows, ellipsis string, and other
			behavioral settings
			
			can be directly accessed by '$.fn.ThreeDots.settings = ...... ;'

	**********************************************************************************/

	$.fn.ThreeDots.settings = {
		valid_delimiters: 	[' ', ',', '.'],		// what defines the bounds of a word to you?
		ellipsis_string: 	'...',
		max_rows:			2,
		text_span_class:	'ellipsis_text',
		e_span_class:		'threedots_ellipsis',
		whole_word:			true,
		allow_dangle:		false,
		alt_text_e: 		false,					// if true, mouse over of ellipsis displays the full text
		alt_text_t: 		false  					// if true & if ellipsis displayed, mouse over of text displays the full text
	};


	/**********************************************************************************

		METHOD
			dangling_ellipsis {private}

		DESCRIPTION
			determines whether or not the currently calculated ellipsized text
			is displaying a dangling ellipsis (= an ellipsis on a line by itself)
			
			returns true if ellipsis is dangling, otherwise false

	**********************************************************************************/

	function dangling_ellipsis(obj, nr_fixed){
		if ($.fn.ThreeDots.c_settings.allow_dangle == true) {
			return false; // why do when no doing need be done?
		}

		// initialize variables
		var ellipsis_obj 		= $(obj).children('.'+$.fn.ThreeDots.c_settings.e_span_class).get(0);
		var remember_display 	= $(ellipsis_obj).css('display');
		var num_rows_before 	= num_rows(obj, nr_fixed);

		// temporarily hide ellipsis
		$(ellipsis_obj).css('display','none');
		var num_rows_after 		= num_rows(obj, nr_fixed);

		// restore ellipsis
		$(ellipsis_obj).css('display',remember_display);
		
		if (num_rows_before > num_rows_after) {
			return true; 	// ASSUMPTION: 	removing the ellipsis changed the height
							// 				THEREFORE the ellipsis was on a row all by its lonesome
		} else {
			return false;	// nothing dangling here
		}
	}


	/**********************************************************************************

		METHOD
			num_rows {private}

		DESCRIPTION
			returns the number of rows/lines that the current object's text covers if
			cstate is an object
			
			this function can be initially called to pre-calculate values that will 
			stay fixed throughout the truncation process for the current object so
			that the values do not have to be called every time; to do this the
			num_rows function is called with a boolean value within the cstate
			
			when boolean cstate, an object is returned containing padding and line
			height information that is then passed in as the cstate object on
			subsequent calls to the function

	**********************************************************************************/

	function num_rows(obj, cstate){	
		var the_type = typeof cstate;
	
		if (	(the_type == 'object') 
			||	(the_type == undefined)	) {
			// do the math & return
			return $(obj).height() / cstate.lh;
			
		} else if (the_type == 'boolean') {
			var lineheight	= lineheight_px($(obj));

			return {
				lh: lineheight
			};
		} 
	}

	
	/**********************************************************************************

		METHOD
			the_last_word {private}

		DESCRIPTION
			return a data structure containing...
			 
				[word] 				the last word within the specified text	defined 
									by the specified valid_delimiters, 
				[del] 				the delimiter occurring	directly before the 
									word, and 
				[updated_string] 	the updated text minus the last word 
			
			[del] is null if the last word is the first and/or only word in the text 
			string

	**********************************************************************************/

	function the_last_word(str){
		var temp_word_index;
		var v_del = $.fn.ThreeDots.c_settings.valid_delimiters;
		
		// trim the string
		str = jQuery.trim(str);
		
		// initialize variables
		var lastest_word_idx = -1;
		var lastest_word = null;
		var lastest_del = null;

		// for all given delimiters, determine which delimiter results in the smallest word cut
		jQuery.each(v_del, function(i, curr_del){
			if (((new String(curr_del)).length != 1)
				|| (curr_del == null)) {  // implemented to handle IE NULL condition; if only typeof could say CHAR :(
				return false; // INVALID delimiter; must be 1 character in length
			}

			var tmp_word_index = str.lastIndexOf(curr_del);
			if (tmp_word_index != -1) {
				if (tmp_word_index > lastest_word_idx) {
					lastest_word_idx 	= tmp_word_index;
					lastest_word 		= str.substring(lastest_word_idx+1);
					lastest_del			= curr_del;
				}
			}
		});
		
		// return data structure of word reduced string and the last word
		if (lastest_word_idx > 0) {
			return {
				updated_string:	jQuery.trim(str.substring(0, lastest_word_idx/*-1*/)),
				word: 			lastest_word,
				del: 			lastest_del
			};
		} else { // the lastest word
			return {
				updated_string:	'',
				word: 			jQuery.trim(str),
				del: 			null
			};
		}
	}

			
	/**********************************************************************************

		METHOD
			lineheight_px {private}

		DESCRIPTION
			returns the line height of a row of the provided text (within the text 
			span) in pixels

	**********************************************************************************/

	function lineheight_px(obj) {
		// shhhh... show
		$(obj).append("<div id='temp_ellipsis_div' style='position:absolute; visibility:hidden'>H</div>");
		// measure
		var temp_height = $('#temp_ellipsis_div').height();
		// cut
		$('#temp_ellipsis_div').remove();

		return temp_height;
	}
	
	/**********************************************************************************

		METHOD
			the_bisector (private)

		DESCRIPTION
			updates the target objects current text to shortest overflowing string 
			length (if overflowing is occurring) by adding/removing halves (like
			binary search)

			because...
				taking some bigger steps at the beginning should save us some real 
				time in the end

	**********************************************************************************/
	
	function the_bisector(obj, curr_text_span, nr_fixed){
		var init_text = $(curr_text_span).text();
		var curr_text = init_text;
		var max_rows = $.fn.ThreeDots.c_settings.max_rows;
		var front_half, back_half, front_of_back_half, middle, back_middle;
		var start_index;
		
		if (num_rows(obj, nr_fixed) <= max_rows) {
			// do nothing
			return;
		} else {
			// zero in on the solution
			start_index = 0;
			curr_length = curr_text.length;

			curr_middle = Math.floor((curr_length - start_index) / 2);
			front_half = init_text.substring(start_index, start_index+curr_middle);
			back_half = init_text.substring(start_index + curr_middle);
				
			while (curr_middle != 0) {
				$(curr_text_span).text(front_half);
				
				if (num_rows(obj, nr_fixed) <= (max_rows)) {
					// text = text + front half of back-half
					back_middle 		= Math.floor(back_half.length/2);
					front_of_back_half 	= back_half.substring(0, back_middle);
					
					start_index = front_half.length;
					curr_text 	= front_half+front_of_back_half;
					curr_length = curr_text.length;

					$(curr_text_span).text(curr_text);
				} else {
					// text = front half (which it already is)
					curr_text = front_half;
					curr_length = curr_text.length;
				}
				
				curr_middle = Math.floor((curr_length - start_index) / 2);
				front_half = init_text.substring(0, start_index+curr_middle);
				back_half = init_text.substring(start_index + curr_middle);
			}
		}
	}
	
})(jQuery);