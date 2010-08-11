tinyMCEPopup.requireLangPack();

var EmbedMediaDialog = {
    init: function(){
        // enable the tabs
        $("#embedresource_tabs ul li").live('click', function(){
            var which = $(this).attr("id").split("-")[1];
            // reset them, hide them both, then show the right one
            $("#embedresource_tabs ul li").removeClass("tab_active").addClass("tab_inactive");
            $(this).addClass("tab_active").removeClass("tab_inactive");
            
            $(".embedresource_tab").removeClass("embedresource_active").removeClass("embedresource_inactive");
            $(".embedresource_tab").addClass("embedresource_inactive");
            $("#embedresource_tab-" + which).removeClass("embedresource_inactive").addClass("embedresource_active");
            
        });
        
        $("input[name='resource_url']").live('focusin', function(){
            $("textarea[name='resource_embed']").val('');
            $(".mceActionPanel input#insert").attr('disabled', 'disabled');
        });
        
        $("input[name='resource_url']").live('click keyup', function(){
            var regexp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i // from jquery validate plugin
            var resource_url = $("input[name='resource_url']").val().trim();
            if (regexp.test(resource_url)) {
                $(".mceActionPanel input#insert").removeAttr('disabled');
            }
            else {
                $(".mceActionPanel input#insert").attr('disabled', 'disabled');
            }
        });
        
        $("textarea[name='resource_embed']").live('focusin', function(){
            $("input[name='resource_url']").val('');
            $(".mceActionPanel input#insert").attr('disabled', 'disabled');
        });
        
        $("textarea[name='resource_embed']").live('click keyup', function(){
        
            if ($("textarea[name='resource_embed']").val().trim() !== '') {
                $(".mceActionPanel input#insert").removeAttr('disabled');
            }
        });
        
        // Get the selected contents as text and place it in the input
    },
    
    settings: function(){
        $("#embedresource_choose").hide();
        $("#embedresource_settings").show();
    },
    
    insert: function(){
        var to_insert = '';
        
        // internet resource or file resource?
        if ($(".embedresource_active").attr("id") === "embedresource_tab-1") {
            // file resource
            var selectedResource = $(".contentmedia_file_selected");
            // check for what kind of file it is
            var mimeType = $(selectedResource).find(".mimetype").text().trim();
            var path = $(selectedResource).find(".contentmedia_hidden").text().trim();
            // wrap it in an appropriate tag
            if (mimeType == "image") {
                to_insert = '<img src="' + path + '" alt="an image"/>';
            }
            else {
                to_insert = "<p>Videos not yet supported</p>";
            }
            // share the file
            $.ajax({
                url: "/sharedoc",
                type: "POST",
                success: function(data){
                },
                error: function(xhr, textStatus, thrownError){
                },
                data: {
                    "resource": path.replace("/xythos", ""),
                    "groupid": "/sites" + window.location.href.substring(window.location.href.lastIndexOf("/"))
                }
            });
        }
        else {
            // internet resource
            if ($("textarea[name='resource_embed']").val().trim() !== '') {
                to_insert = $("textarea[name='resource_embed']").val();
            }
            else {
                var resource_path = $("input[name='resource_url']").val().trim();
                to_insert = $.TemplateRenderer("video_not_supported", {});
            }
        }
        
        
        
        
        tinyMCEPopup.editor.execCommand('mceInsertContent', false, to_insert);
        tinyMCEPopup.close();
    }
};

tinyMCEPopup.onInit.add(EmbedMediaDialog.init, EmbedMediaDialog);
