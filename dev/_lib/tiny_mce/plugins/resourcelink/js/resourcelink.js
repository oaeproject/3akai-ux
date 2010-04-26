tinyMCEPopup.requireLangPack();


var ResourceLinkDialog = {
	init : function() {
		// Get the selected contents as text and place it in the input

		
		$("#linktext").val(tinyMCEPopup.editor.selection.getContent({format : 'text'}));
		//f.somearg.value = tinyMCEPopup.getWindowArg('some_custom_arg');
		if ($("#linktext").val().trim() != "") {
		  $("#insert").removeAttr('disabled');
		}
		
		// if a link is selected in the editor, prepopulate the dialog
		var curSelectionHTML = tinyMCEPopup.editor.selection.getContent();
		
		if ($(curSelectionHTML).is('a') || $(curSelectionHTML).find('a').length > 0) { // because you could select just the a or its container
		  var curSelectionHref;
		  if ($(curSelectionHTML).is('a'))
		    curSelectionHref = $(curSelectionHTML).attr('href');
		  else
		    curSelectionHref = $(curSelectionHTML).find('a').attr('href');
		    
		  // check to see if its a resource link or if its a regular link
		  if (curSelectionHref.indexOf('xythos') != -1) {
		    $("#resource_filename").html(curSelectionHref);
		    $("#resource_url").val(curSelectionHref);
		  } else {
        $("#link_url").val(curSelectionHref);
        $("#link_to_web").attr("checked", "checked");
        $("#link_url").removeAttr("disabled");
      }
		}
		
		// enable the link to be inserted only if there is text to link to
	  $("#linktext").live('change keyup click', function() {
	    if ($("#linktext").val().trim() != "") {
	      $("#insert").removeAttr('disabled');
	    } else {
	      $("#insert").attr('disabled','disabled');
	    }
	  });
	  
	  // allow clicking on the disabled-by-default url field to enable it
	  $("#link_url").live('change click keyup', function() { // yeah this doesn't work, event never fires on a disabled input, looking into it
     if ($("#linktext").val().trim() != "") {
	      $("#insert").removeAttr('disabled');
	    } else {
	      $("#insert").attr('disabled','disabled');
	    }
	  });
	  
	  
	},
	
	setResourceLink : function(filename, url) {
	  var link_text = $("#linktext").val().trim();
	  $("#resource_filename").html(url);
	  $("#resource_url").val(url);
	  if (link_text == "") {
	    $("#linktext").val(filename);
	  }
	  $("#insert").removeAttr('disabled');
	},
	
	browse : function() {
	  $("#link_to_res").attr('checked', 'checked');
	  $("#link_url").val('url').attr('disabled', 'disabled');
	  tinyMCEPopup.editor.execCommand('mceResourceLinkBrowse');
	},
	
	insert : function() {
		// Insert the contents from the input into the document
    var to_insert = '';
    var link_text = $("#linktext").val().trim();
    
    // first, check to see that the link text to be inserted isn't blank
    if (link_text == '') {
      return; // TODO display error message in-line for missing text
    }
    
    // now make sure that if we're lnking to a web resource,
    // that the url provided is a real url
    if ($("input[type=radio]:checked").attr('id') == 'link_to_web') {
      var regexp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i // from jquery validate plugin
      var url = $("#link_url").val().trim();
      if (regexp.test(url)) {
        // is a url
        to_insert = "<a href='" + url + "'>" + link_text + "</a>";
      } else {
        alert('Please choose a valid link url');
        return;
      }
    } else {
      var url = $("#resource_url").val().trim();
      if (url != "") {
        to_insert = "<a href='" + url + "'>" + link_text + "</a>";
      }
    }

		tinyMCEPopup.editor.execCommand('mceInsertContent', false, to_insert);
		tinyMCEPopup.close();
	},
	
	change_location : function() {
	  if ($("input[type=radio]:checked").attr('id') == 'link_to_res') {
	    $("#link_url").attr('disabled', 'disabled').val('url');
	  } else {
	    $("#link_url").val('').removeAttr('disabled').focus();
	  }
	},
	

};

tinyMCEPopup.onInit.add(ResourceLinkDialog.init, ResourceLinkDialog);
