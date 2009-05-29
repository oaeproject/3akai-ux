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

/*global $, sdata, Querystring */

var sakai = sakai || {};
sakai.remotecontent = function(tuid, placement, showSettings){
    var rootel = $("#" + tuid);
    var me = false;
    var bAdvancedSettingsDisplayed = false;
    var selectedBorderColor = "#cccccc";
    var iFrameStandardWidth = 550;
    var iFrameStandardHeight = 200;

    var iFramePreviewMaxWidth = 600;
    var iFramePreviewMaxHeight = 300;
	
	var defaultBoxBorderSize = 2;
    
    var selectedWidth;
    var selectedHeight;
    
	
    /**
     * Called when the data has been saved to the JCR.
     */
    var savedDataToJCR = function() {
    	sdata.container.informFinish(tuid);
    };
	
    /**
     * The function that fills in the input fields in the settings tab.
     * @param A JSON object that contains the necessary information.
     */
    var displaySettings = function(parameters) {
    	 if (parameters.url) {
	    	$("#remotecontent_settingsUrl").val(parameters.url);
	    	$("#remotecontent_previewFrame").attr('src', parameters.url);
	    	$("#remotecontent_width").val(parameters.width);
	    	$("#remotecontent_height").val(parameters.height);
	    	$("#remotecontent_borders").val(parameters.borderSize);
	    	selectedBorderColor = parameters.borderColor;

	    	var iWidth = (parseInt(parameters.width, 10) < iFramePreviewMaxWidth) ? parseInt(parameters.width, 10) : iFramePreviewMaxWidth;
	    	var iHeight = (parseInt(parameters.height, 10) < iFramePreviewMaxHeight) ? parseInt(parameters.height, 10) : iFramePreviewMaxHeight;
	    	
	    	$("#remotecontent_previewFrame").css({'width' : iWidth + 'px', 'height' : iHeight + 'px'});
	    	
	    	
	    	
	    	$(".remotecontent_colourBox").each(function() {
				if ($(this).css('background-color') === parameters.borderColor) {
					$(this).css({'border-width' : '2px'});
				}
			});
	    	
	    	//    	adjust the frame
	    	if (/^\d+$/.test(parameters.borderSize)) {
	        	//	give the selected one a nice border.
	        	$("#remotecontent_previewFrame").css({'border-width' : parameters.borderSize + 'px'});
	    	}
	    	$("#remotecontent_previewFrame").css({'border-color' : selectedBorderColor});
    	 }
    };
	
	
    /**
     * Will display the iframe.
     * @param A JSON object that contains the necessary information.
     */
    var displayRemoteContent = function(parameters) {

    	 
    	var sFrame = '<iframe border="0" ';
		if (parameters.url) {
			sFrame += 'src="' + parameters.url + '" ';
		}
		if (parameters.width && parameters.height) {
			sFrame += 'width="' + parameters.width + '" height="' + parameters.height + '" ';
		}
		if (parameters.borderSize !== "" && parameters.borderColor !== "") {
			sFrame += 'style="border-style:solid;border-width:' + parameters.borderSize + 'px;border-color:' + parameters.borderColor + ';" ';
		}
		sFrame += '></iframe>';

		// show the iframe on the page.
		$("#remotecontent_mainContainer", rootel).append(sFrame);
    };
	
	
    /**
     * Will fetch the URL and other parameters from the JCR and according to which
     * view we are in, fill in the settings or display an iframe.
     */
    var getRemoteContent = function() {
    	$.ajax({
   			url :"/sdata/f/" + placement + "/" + tuid + "/remotecontent",
			cache: false,
   			success : function(data) {
    			//	We will get a JSON string that will contain the necessary information.
    			var parameters = $.evalJSON(data);
    			
    			if (showSettings) {
    		    	//	Fill in the settings page.
    		    	displaySettings(parameters);
    		    }
    		    else {
    		    	//	show the frame
    		    	displayRemoteContent(parameters);
    		    }
    		}
    	
    	});
    };
    
    
    
    /**
     * This function shall save the settings too the jcr or
     * in case the user didn't fill in everything correctly show a remark.
     */
    var saveRemoteContent = function() {
    	//	Get all the values
    	var sURL = $("#remotecontent_settingsUrl").val();
    	var sWidth = $("#remotecontent_width").val() || iFrameStandardWidth;
    	var sHeight = $("#remotecontent_height").val() || iFrameStandardHeight;
    	var sBorderSize = $("#remotecontent_borders").val();
    	
    	//	Check if all the necessary fields are filled in.
    	var bOK = true;
    	//	clear any errors that we might have.
    	$("#urlError").html("");
    	$("#sizeError").html("");
    	$("#borderError").html("");
    	
    	if (sURL === "") {
    		bOK = false;
    		$("#urlError").html("Please enter an URL.<br />");
    	}
    	if ((sWidth !== "" && sHeight === "") || (sWidth === "" && sHeight !== "")) {
    		bOK = false;
    		$("#sizeError").append("Please enter a valid number for both input fields.<br />");
    	}
    	if (sWidth !== "" && sHeight !== "") {
    		//if (!/^\d+$/.test(sWidth) || !/^\d+$/.test(sHeight)) {
        	//	bOK = false;
        	//	$("#sizeError").append("Please enter valid numbers only.<br />");
    		//}
    	}
    	if (sBorderSize !== "" && ! (/^\d+$/).test(sBorderSize)) {
    		bOK = false;
    		$("#borderError").append("Please enter valid numbers only.<br />");
    	}
    	
    	
    	if (bOK) {

    		if (!sURL.match('http://')) {
    			sURL = 'http://' + sURL;
    		}
    		
    		//	Everything is OK, save it to JCR.
    		var parameters = {"url" : sURL, "width" : sWidth, "height" : sHeight, "borderSize" : sBorderSize, "borderColor" : selectedBorderColor};

        	var str = $.toJSON(parameters); // Convert the posts to a JSON string

    		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "remotecontent", str, savedDataToJCR);
    	}
    };
    
    
	
	
	
	/**************************
	 * 	ALL THE BINDINGS
	 */
	
    //	set the standard width & height
    //$("#remotecontent_previewFrame").css({'width' : iFrameStandardWidth, 'height' : iFrameStandardHeight}); 
    
    $("#remotecontent_settingsUrl").change(function() {
    	//	Start fetch url
    	var sURL = $(this).val();
    	if (sURL !== "") {
    		if (!sURL.match('http://')) {
    			sURL = 'http://' + sURL;
    		}
        	$("#remotecontent_previewFrame").attr('src', sURL);
    	}
    });
    $("#remotecontent_width,#remotecontent_height").change(function() {
    	var sWidth = $("#remotecontent_width").val();
    	var sHeight = $("#remotecontent_height").val();
    	//	if the selected width is smaller then the allowed max width then we show it
    	//	if it is not then we will show a small warning

		$("#sizeError").html('');
    	if (/^\d+$/.test(sWidth)) {
	    	if (sWidth < iFramePreviewMaxWidth) {
	    		$("#remotecontent_previewFrame").css({'width' : sWidth + 'px'});
	    	}
	    	else {
	    		$("#sizeError").append('<span style="color:black">Don\'t worry! The width will be changed in the page, but won\'t be displayed in this preview.</span><br />');
	    	}
    	}
    	if (/^\d+$/.test(sHeight)) {
	    	if (sHeight < iFramePreviewMaxHeight) {
	    		$("#remotecontent_previewFrame").css({'height' : sHeight + 'px'});
	    	}
	    	else {
	    		$("#sizeError").append('<span style="color:black">Don\'t worry! The height will be changed in the page, but won\'t be displayed in this preview.</span><br />');
	    	}
    	}
    });
    
    $("#remotecontent_borders").change(function() {
    	if (/^\d+$/.test($("#remotecontent_borders").val())) {
    		$("#remotecontent_previewFrame").css({'border-width' : $("#remotecontent_borders").val() + 'px'});
    	}
    });
    
    //	toggle the advanced view
    $("#remotecontent_settingsBtnAdvanced").click(function(){
    	$("#remotecontent_settingsAdvanced").toggle();
    	
    	bAdvancedSettingsDisplayed = !bAdvancedSettingsDisplayed;
    	//	change the picture up or down
    	if (bAdvancedSettingsDisplayed) {
    		$("#remotecontent_settingsBtnAdvanced").html("Advanced Settings &uarr;");
    	}
    	else {
    		$("#remotecontent_settingsBtnAdvanced").html("Advanced Settings &darr;");
    	}
    });
	
	
    //	When you push the save button..
    $("#remotecontent_view_insert").click(function()  {
    	saveRemoteContent();
    });
	
	//	Cancel it
    $("#remotecontent_view_cancel").click(function()  {
    	sdata.container.informFinish(tuid);
    });
	
    
    
    //colourboxes animation
    $(".remotecontent_colourBox").click(function() {
    	//	save the selected color
    	selectedBorderColor = $(this).css('background-color');
    	//	remove all borders
    	$(".remotecontent_colourBox").css({'border-width' : '0'} );

    	//	give the selected one a nice border.
    	$(this).css({'border-width' : defaultBoxBorderSize + 'px'});
    	
    	//	adjust the frame
    	var sBorderSize = $("#remotecontent_borders").val();
    	if (/^\d+$/.test(sBorderSize)) {
        	//	give the selected one a nice border.
        	$("#remotecontent_previewFrame").css({'border-width' : sBorderSize + 'px'});
    	}
    	$("#remotecontent_previewFrame").css({'border-color' : selectedBorderColor});
    });
    
    
    //	show settings or not?
    if (showSettings) {
    	$("#remotecontent_mainContainer").hide();
    	$("#remotecontent_settings").show();
    }
    else {
    	$("#remotecontent_settings").hide();
    	$("#remotecontent_mainContainer").show();
    }
	
	
	getRemoteContent();
};


sdata.widgets.WidgetLoader.informOnLoad("remotecontent");