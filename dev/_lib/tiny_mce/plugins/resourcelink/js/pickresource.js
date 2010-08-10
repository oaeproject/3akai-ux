//tinyMCEPopup.requireLangPack();


var PickResourceDialog = {
	init : function() {
		// Get the selected contents as text and place it in the input
		//f.linktext.value = tinyMCEPopup.editor.selection.getContent({format : 'text'});
		//f.somearg.value = tinyMCEPopup.getWindowArg('some_custom_arg');
	},
	
	insert : function() {
		// Insert the contents from the input into the document
    var popups = tinyMCEPopup.editor.windowManager.windows;
    var thisID = tinyMCEPopup.id;
    var selectedFilename = $(".contentmedia_file_selected .contentmedia_file_name").text();
    var selectedFilePath = $(".contentmedia_file_selected .contentmedia_hidden").text();
    for (field in popups) {
      if (popups.hasOwnProperty(field)) {
          if (field != thisID) {
              parent.$("#" + field + "_ifr").get(0).contentWindow.ResourceLinkDialog.setResourceLink(selectedFilename, selectedFilePath);
          }
      }
    }
		tinyMCEPopup.close();
	}
	

};

tinyMCEPopup.onInit.add(PickResourceDialog.init, PickResourceDialog);
