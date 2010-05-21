/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

var sakai = sakai || {};

// This function is called by the sakai ux framework when a widget is
// embedded in the page.
sakai.memorypalace = function(tuid, showSettings) {
  
//  var me = sdata.me; // Contains information about the current user
  var rootel = "#" + tuid; // Get the main div used by the widget
  var memorypalace = "#memorypalace";
  
  // Containers
  var memorypalaceMainContainer = memorypalace + "_main_container";
  var memorypalaceContainer = memorypalace + "_container";  
  var memorypalaceSettings = memorypalace + "_settings";
  var memorypalaceHeader = memorypalace + "_header"
  var memorypalaceMap = memorypalace + "_map";  
  var memorypalaceEditRoom = memorypalace + "_room_edit";
  var memorypalaceEditRoomContainer = memorypalaceEditRoom + "_container";
  var categoriesListingBody = "#categories_listing_body"
  var memorypalaceShowRoom = "#memorypalace_show_room";
  var memorypalaceShowRoomContainer = memorypalaceShowRoom + "_conatiner";
  var memorypalaceAddContent = memorypalace + "_add_content";
  var memorypalaceAddContentContainer = memorypalaceAddContent + "_container";
  var memorypalaceCategoryDropdown = "#category_dropdown"
  var memorypalaceShowContentItem = "#memorypalace_show_content_item";
  var memorypalaceShowContentItemContainer = memorypalaceShowContentItem + "_container";
  
  // Templates
  var memorypalaceMapTemplate = "memorypalace_map_template";
  var memorypalaceHeaderTemplate = "memorypalace_header_template";
  var memorypalaceEditRoomTemplate = "memorypalace_room_edit_template";
  var categoriesListingBodyTemplate = "categories_listing_body_template";
  var memorypalaceShowRoomTemplate = "memorypalace_show_room_template";
  var memorypalaceAddContentTemplate = "memorypalace_add_content_template";
  var memorypalaceCategoryDropdownTemplate = "category_dropdown_template";
  var memorypalaceShowContentItemTemplate = "memorypalace_show_content_item_template";
  
  // Buttons
  var memorypalaceSettingsSubmit = memorypalaceSettings + "_submit";
  var memorypalaceSettingsCancel = memorypalaceSettings + "_cancel";
  var addCategoryButton = "#do_add_category";
  var browseForFilesButton = "#browse_for_files";
  var browseForContentFileButton = "#browse_for_content_file";

  
  // Links
  var returnToFloorplanLink = ".return_to_floorplan_link";
  var memorypalaceRoomCategoryItem = ".room_categories span a"
  var memorypalaceEditRoomLink = ".edit_this_room_link";
  var memorypalaceAddContentLink = ".add_content_link";
  var memorypalaceReturnToFloorplanFromEdit = "#return_to_floorplan_from_edit";
  var memorypalaceReturnToRoomFromEdit = "#return_to_room_from_edit";
  var memorypalaceReturnToRoomFromEditContentItem = "#return_to_room_from_edit_content_item";
  var memorypalaceReturnToFloorplanFromShow = "#return_to_floorplan_from_show";
  var memorypalaceViewContentLink = "div.room_categories span a";
  var memoryPalaceEditContentLink = ".edit_this_content_link";
  var memorypalaceReturnToContentFromEditLink = "#return_to_content_from_edit";
  
  // Form
  var memoryPalaceEditForm = "#memorypalace_room_edit form";
  var memorypalaceAddContentForm = "#memorypalace_add_content form";
  var addCategoryTextField = "#add_category";


  // Pick Resource Dialog
  var browseResourceFilesDialog = "#browse_resource_files";
  var chooseImageButton = "#choose_image";


  
  var settings = {};
  var roomData = {};
  var currentRoomPosition = 0;
  var currentRoomData = {};
  var currentContentItemData = {};
  var currentContentItemID = 0;
  var fromViewRoom = false;
  
  var getWidgetSettings = function() {
    var url = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id).replace(/__TUID__/, tuid).replace(/__NAME__/, "settings.json");
    $.ajax({
      url: url,
      success: function(data) {
        var parsedSettingsJSON = data;
        settings = parsedSettingsJSON;
        if (showSettings) {
          // put the title in
          $("#portfolio_title", $(rootel)[0]).val(settings.widgetTitle);
        }
        else {
          $(memorypalaceHeader, $(rootel)[0]).show();
          $.TemplateRenderer(memorypalaceHeaderTemplate, settings, $(memorypalaceHeader, $(rootel)[0]));
          if (settings.displayStyle == "mapView") {
            getRoomData();
          }
        }
      },
      error: function() {
        roomData = {"rooms":[{"position":"1","categories":[]},{"position":"2","categories":[]},{"position":"3","categories":[]},{"position":"4","categories":[]},{"position":"5","categories":[]},{"position":"6","categories":[]},{"position":"7","categories":[]},{"position":"8","categories":[]},{"position":"9","categories":[]},{"position":"10","categories":[]}]};
        saveRoomData();
        return;
      }
    });
  }
  
  var setupWidgetSettingsForSave = function() {
    settings = {};
    var title = $("#portfolio_title").val();
    if ($.trim(title) == "") {
      alert('Please input a title');
      return false;
    }
    settings.widgetTitle = title;
    settings.displayStyle = "mapView";
    settings['sling:resourceType'] = 'sakai/settings';
    
    saveWidgetSettings();
  };

  var saveWidgetSettings = function() {
    var saveUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id).replace(/__TUID__/, tuid).replace(/__NAME__/, "settings");
    $.ajax({
      url: saveUrl,
      type: "POST",
      data: settings,
      success: function(data) {
        finishSaveWidgetSettings();
      },
      error: function() {
        alert('Error saving settings');
      }
    });
  };
  
  var finishSaveWidgetSettings = function() {
    sdata.container.informFinish(tuid);
  };
  
  var getRoomData = function() {
    // get room data, render on success
    var url = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id).replace(/__TUID__/, tuid).replace(/__NAME__/, "rooms.json");
    $.ajax({
      url: url,
      success: function(data) {
        tmpdata = data;
        roomData = $.parseJSON(tmpdata.roomData);
        renderRooms();
      },
      error: function() {
        renderRooms();
        return;
      }
    });
  };

  var mpinitTinyMCE = function(elt) {

      // Init tinyMCE
      tinyMCE.init({
          // General options
          mode : "exact",
          theme: "advanced",
          elements: elt,
          width: "603px",
          plugins: "spellchecker,advhr,embedresource,resourcelink,inlinepopups,preview,noneditable,nonbreaking,xhtmlxtras,template",
          theme_advanced_toolbar_location: "top",
          theme_advanced_toolbar_align: "left",          
          theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull",
          theme_advanced_buttons2 : "bullist,numlist,|,outdent,indent,|,spellchecker,|,image,resourcelink",
          theme_advanced_buttons3 : "",
          // Example content CSS (should be your site CSS)
          content_css: sakai.config.URL.TINY_MCE_CONTENT_CSS
      });
  }


  /**
   * Map View
   */
   
  var renderRooms = function() {
    $(memorypalaceMap, $(rootel)[0]).show();
    $.TemplateRenderer(memorypalaceMapTemplate, roomData, $(memorypalaceMap, $(rootel)[0]));
    if (!sakai.site.isCollaborator) {
      $("span a.addLink", $(rootel)[0]).hide();
    }
  }
  
  var editRoom = function(roomPosition, fromShowRoom) {
    currentRoomPosition = roomPosition;
    for (var i=0; i<roomData.rooms.length; i++) {
      if (roomData.rooms[i].position == currentRoomPosition) {
        currentRoomData = roomData.rooms[i];
      }
    }
    
    hideEverything(); 
    $(memorypalaceEditRoomContainer, $(rootel)[0]).show();
    $(memorypalaceEditRoomContainer, $(rootel)[0]).parent().show()

    if (fromShowRoom) {
      fromViewRoom = true;
      $(memorypalaceReturnToFloorplanFromEdit, $(rootel)[0]).hide();
      $(memorypalaceReturnToRoomFromEdit, $(rootel)[0]).show();
    } else {
      fromViewRoom = false;
      $(memorypalaceReturnToFloorplanFromEdit, $(rootel)[0]).show();
      $(memorypalaceReturnToRoomFromEdit, $(rootel)[0]).hide();
    }
    if (!currentRoomData.id) {
      var d = new Date();
      currentRoomData.id = "room" + d.getTime() + "" + Math.floor(Math.random()*101);
    }
    $.TemplateRenderer(memorypalaceEditRoomTemplate, {"room" : currentRoomData}, $(memorypalaceEditRoom, $(rootel)[0]));
    if (currentRoomData.categories) {
      $.TemplateRenderer(categoriesListingBodyTemplate, {"categories" : currentRoomData.categories}, $(categoriesListingBody, $(rootel)[0]));
      sortCategoriesDisplay();
    }
    tinyMCE.execCommand('mceAddControl', false, 'room_overview');
  }

  var saveRoomData = function() {
    roomData = serializeRoomDataForPost();
    var postData = JSON.stringify(roomData);
    var wrappedData = {"roomData" : postData};
    var saveUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id).replace(/__TUID__/, tuid).replace(/__NAME__/, "rooms");
    $.ajax({
      url: saveUrl,
      type: "POST",
      data: wrappedData
    });
  };
  
  var getRoom = function(position) {
    var thisRoomData;
     // Get the room's data
     for (var i=0; i<roomData.rooms.length; i++) {
       if (roomData.rooms[i].position == position) {
         thisRoomData = roomData.rooms[i];
       }
     }
     return thisRoomData;
  }
  
  var showRoom = function(position) {
    currentRoomPosition = position;
    currentRoomData = getRoom(currentRoomPosition);
    hideEverything();
    $(memorypalaceShowRoomContainer, $(rootel)[0]).show();
    $.TemplateRenderer(memorypalaceShowRoomTemplate, {"room" : currentRoomData}, $(memorypalaceShowRoom, $(rootel)[0]));
    if (!sakai.site.isCollaborator) {
      $("span#room_edit_links", $(rootel)[0]).hide();
    }
  };
  
  var hideEverything = function() {      
    try {
      tinyMCE.execCommand('mceRemoveControl', false, 'room_overview');
      tinyMCE.execCommand('mceRemoveControl', false, 'content_description');
    } catch (e) {
    }
    $(memorypalaceMap, $(rootel)[0]).hide();
    $(memorypalaceShowRoomContainer, $(rootel)[0]).hide();
    $(memorypalaceEditRoomContainer, $(rootel)[0]).hide();
    $(memorypalaceSettings, $(rootel)[0]).hide();
    $(memorypalaceAddContentContainer, $(rootel)[0]).hide();
    $(memorypalaceShowContentItemContainer, $(rootel)[0]).hide();
  }
  
  var returnToFloorplan = function() {
    currentRoomPosition = 0;
    currentRoomData = {};
    hideEverything();
    $(memorypalaceMap, $(rootel)[0]).show();
  };
  
  var editContent = function(contentItemID) {
    hideEverything();
    currentContentItemData = {};
    $(memorypalaceAddContentContainer, $(rootel)[0]).show();
    if (contentItemID != 0) {
      for (var i=0; i<currentRoomData.categories.length; i++) {
        var currentCat = currentRoomData.categories[i];
        for (var j=0; j<currentCat.items.length; j++) {
          if (currentCat.items[j].id == contentItemID) {
            currentContentItemData = currentCat.items[j];
          }
        }
      }
    }
    
    $.TemplateRenderer(memorypalaceAddContentTemplate, {"content" : currentContentItemData}, $(memorypalaceAddContent, $(rootel)[0]));
    $.TemplateRenderer(memorypalaceCategoryDropdownTemplate, {"room" : currentRoomData}, $(memorypalaceCategoryDropdown, $(rootel)[0]));
    
    if (contentItemID != 0) {
      $(memorypalaceReturnToContentFromEditLink, $(rootel)[0]).show();
      $(memorypalaceReturnToRoomFromEdit, $(rootel)[0]).hide();
    } else {
      $(memorypalaceReturnToContentFromEditLink, $(rootel)[0]).hide();
      $(memorypalaceReturnToRoomFromEdit, $(rootel)[0]).show();
    }
    tinyMCE.execCommand('mceAddControl', false, 'content_description');
    
  };
  
  var showContentItem = function(itemID) {
    currentContentItemID = itemID;
    hideEverything();
    currentContentItemData = {};
    for (var i=0; i<currentRoomData.categories.length; i++) {
      for (j=0; j<currentRoomData.categories[i].items.length; j++) {
        if (currentRoomData.categories[i].items[j].id == itemID) {
          currentContentItemData = currentRoomData.categories[i].items[j];
        }
      }
    }
    $(memorypalaceShowContentItemContainer, $(rootel)[0]).show();
    $.TemplateRenderer(memorypalaceShowContentItemTemplate, {"item" : currentContentItemData}, $(memorypalaceShowContentItem, $(rootel)[0]));
  };
  
  /** 
   * Edit the roomData object to get ready for a POST
   */
   var serializeRoomDataForPost = function() {
     var thisRoomData = currentRoomData;    
     // Put the room's data back into the roomData object
     for (var i=0; i<roomData.rooms.length; i++) {
       if (roomData.rooms[i].position == currentRoomPosition) {
         roomData.rooms[i] = thisRoomData;
       }
     }
     return roomData;
   };
   
   var saveCurrentContentData = function() {
      var isNew = true;
      if (currentContentItemData.id) {
        isNew = false;
        var curID = currentContentItemData.id;
        currentContentItemID = curID;
      }
      currentContentItemData.title = $("#content_title", $(rootel)[0]).val();
      currentContentItemData.url = $("#content_url", $(rootel)[0]).val();
      currentContentItemData.synopsis = $("#content_description", $(rootel)[0]).val();
      currentContentItemData.mimetype = $("#content_mimetype", $(rootel)[0]).val(); //"image/jpeg"; // TODO add this in once we can get it from the web
      for (var i=0; i<currentRoomData.categories.length; i++) {
        if (currentRoomData.categories[i].name == $("#category_dropdown select option:selected", $(rootel)[0]).val()) {
          if (!isNew) { // replace current one
            for (var j=0; j<currentRoomData.categories[i].items.length; j++) {
              if (currentRoomData.categories[i].items[j].id == currentContentItemData.id) {
                currentRoomData.categories[i].items[j] = currentContentItemData;
              }
            }
          } else {
            // just add it in
            var d = new Date();
            currentContentItemData.id = "content" + d.getTime() + "" + Math.floor(Math.random()*101);
            currentRoomData.categories[i].items.push(currentContentItemData);
            currentContentItemID = currentContentItemData.id;
          }
        }
      }
   };
   
   /**
    * Room Image Methods
    * Dependent on contentmedia_memorypalace.js
    */
    var chooseImage = function() {
        // internet resource or file resource?
        var resourceURL = '';
        if ($(".embedresource_active", $(rootel)[0]).attr("id") == "embedresource_tab-1") {
            // file resource
            var selectedResource = $(".contentmedia_file_selected", $(rootel)[0]);
            var path = $.trim($(selectedResource).find(".contentmedia_hidden").text());
            resourceURL = path;

            $.ajax({
                url: "/sharedoc",
                type: "POST",
                data: {
                    "resource": path.replace("/xythos", ""),
                    "groupid": "/sites" + parent.location.href.substring(parent.location.href.lastIndexOf("/"))
                },
                success: function(data) {
                    },
                error: function(xhr, textStatus, thrownError) {
                    }
            });
        } else {
            var resource_path = $.trim($("input[name='resource_url']", $(rootel)[0]).val());
            resourceURL = resource_path;
        }
        return resourceURL;
    };
		
	 var getMimeType = function() {
	   var mimeType = "";
	   if ($(".embedresource_active", $(rootel)[0]).attr("id") == "embedresource_tab-1") {
       var selectedResource = $(".contentmedia_file_selected", $(rootel)[0]);
       mimeType= $.trim($(selectedResource).find("span.mimetype").text());
     } else {
       var resource_path = $.trim($("input[name='resource_url']", $(rootel)[0]).val());
      /*
       $.ajax({
         url: // Server Proxy to get mime type,
         type: "GET",
         success: function(e){
           console.log(e);
         },
         error: function(xhr, textStatus, thrownError) {
           console.log(xhr,textStatus,thrownError);
         }
       });
       */
     }
     return mimeType;
	 };
   
   var addRoomImage = function(url) {
     $("#room_image", $(rootel)[0]).val(url);
   };
   
   var addContentImage = function(url) {
     $("#content_url", $(rootel)[0]).val(url);
   };
   
   var addContentMimetype = function(mt) {
     $("#content_mimetype", $(rootel)[0]).val(mt);
   };
  
   /**
    * Category Methods
    */
    var deleteCategories = function(catIDs) {
        for (var i = 0; i < currentRoomData.categories.length; i++) {
            for (var j = 0; j < catIDs.length; j++) {
                if (currentRoomData.categories[i].id == catIDs[j]) {
                    currentRoomData.categories.splice(i, 1);
                    $("#cat_" + catIDs[j], $(rootel)[0]).parent().parent().fadeOut();
                }
            }
        }
    };
    
    var updateCategoryOrder = function() {
        var catOrders = $("#categories_listing_body input[type='text']", $(rootel)[0]);
        // make sure there aren't any dups
        var orders = [];
        catOrders.each(function(index, elt) {
            if ($.inArray($(elt).val(), orders) == -1) {
                orders.push($(elt).val());
            } else {
                // duplicate, do something better than this
                alert('duplicate order, try again');
                return;
            }
        });

        // sort them by order
        catOrders.sort(function(a, b) {
            var positionA = $(a).val();
            var positionB = $(b).val();
            return positionA - positionB;
        });

        // update order in currentRoomData
        for (var j = 0; j < catOrders.length; j++) {
            var catID = $(catOrders[j]).attr("name");
            var catPos = $(catOrders[j]).val();
            for (var i = 0; i < currentRoomData.categories.length; i++) {
                if (currentRoomData.categories[i].id == catID) {
                    currentRoomData.categories[i].position = j + 1;
                    $("input[name='" + catID + "']", $(rootel)[0]).val(j + 1);
                }
            }
        }
        sortCategoriesDisplay();
    };
    
    var sortCategoriesDisplay = function() {
      var rows = $("#categories_listing_body tr", $(rootel)[0]);
      rows.sort(function(a,b) {
        var positionA = $(a).find("input[type='text']").val();
        var positionB = $(b).find("input[type='text']").val();
        return positionA - positionB;
      })
      $("#categories_listing_body", $(rootel)[0]).html('');
      $(rows).each(function(index, elt) {
        $("#categories_listing_body", $(rootel)[0]).append(elt);
      });
    };
  
    var addCategory = function(catToAdd) {
        var newCategory;
        var canAdd = true;
        for (var j = 0; j < currentRoomData.categories.length; j++) {
            if (currentRoomData.categories[j].name == catToAdd) {
                canAdd = false;
            }
        }
        if (canAdd) {
            var d = new Date();
            var catID = catToAdd.replace(" ", "-") + d.getTime() + "" + Math.floor(Math.random() * 101);
            newCategory = {
                "name": catToAdd,
                "id": catID,
                "position": currentRoomData.categories.length + 1,
                "items": []
            };
            currentRoomData.categories.push(newCategory);
            $(categoriesListingBody, $(rootel)[0]).append($.TemplateRenderer(categoriesListingBodyTemplate, {"categories": [newCategory]}));
            $(addCategoryTextField, $(rootel)[0]).val('');
        } else {
            // name conflict, cannot add
            alert('There already exists a category named "' + catToAdd + '". Please rename your category and try adding again.');
        }
    };
  
  
  /**
   * Event Bindings
   */
   
   $(addCategoryButton, $(rootel)[0]).live("click", function() {
     var catToAdd = $.trim($(addCategoryTextField, $(rootel)[0]).val());
     if (catToAdd != "") {
       addCategory(catToAdd);
     } else {
       // do nothing, for now
     }
      return false;     
   });
   
    $(browseResourceFilesDialog, $(rootel)[0]).jqm({
        modal: true,
        width: 775,
        height: 450
    });
   
   $(browseForFilesButton, $(rootel)[0]).live("click", function() {
     sakai.memorypalacecontent();
     $(browseResourceFilesDialog, $(rootel)[0]).jqmShow();
      return false;     
   });
   
   $(browseForContentFileButton, $(rootel)[0]).live("click", function() {
     sakai.memorypalacecontent();
     $(browseResourceFilesDialog, $(rootel)[0]).jqmShow();
      return false;     
   });
   
   $(".roomLink", $(rootel)[0]).live("click", function() {
     if ($(this).hasClass("addLink")) {
      editRoom($(this).attr("id").split("_")[1], false);
    } else {
      showRoom($(this).attr("id").split("_")[1], false);
    }
    return false;
   });
   
   $(memorypalaceAddContentForm, $(rootel)[0]).live("submit", function() {
     if (sakai.site.isCollaborator) {
       saveCurrentContentData();
       saveRoomData();
       showContentItem(currentContentItemID);
     }
     return false;
   });
   
   $(memoryPalaceEditForm, $(rootel)[0]).live("submit", function(e) {
     if (sakai.site.isCollaborator) {
       if ($.trim($("#room_title", $(rootel)[0]).val()) == "") {
         // need a title, son!
         alert("Please enter a title for this room before saving.");
         return;
       }
       if (currentRoomData.categories.length == 0) {
         // need categories too, kid!
         alert("Please add a category to this room before saving");
         return;
       }
       currentRoomData.title = $("#room_title", $(rootel)[0]).val();
       currentRoomData.image = $("#room_image", $(rootel)[0]).val();
       currentRoomData.description = tinyMCE.get("room_overview").getContent();
       saveRoomData();
       hideEverything();
       $(memorypalaceMap, $(rootel)[0]).show();
       $.TemplateRenderer(memorypalaceMapTemplate, roomData, $(memorypalaceMap, $(rootel)[0]));
     }
     return false;
   });
   
   $(memorypalaceReturnToFloorplanFromShow, $(rootel)[0]).live("click", function() {
     returnToFloorplan();
      return false;     
   });
   
   $(memorypalaceReturnToFloorplanFromEdit, $(rootel)[0]).live("click", function() {
     returnToFloorplan();
      return false;     
   });
   
   // Bind the Settings Submit button
   $(memorypalaceSettingsSubmit, $(rootel)[0]).live("click", function() {
      setupWidgetSettingsForSave();
      return false;
   });
   
   $(memorypalaceSettingsCancel, $(rootel)[0]).live("click", function() {
      sdata.container.informCancel(tuid);
      return false;      
   });

   $("#cancel_choose_image", $(rootel)[0]).live("click", function() {
     $(browseResourceFilesDialog, $(rootel)[0]).jqmHide();
     return false;
   });

   $(chooseImageButton, $(rootel)[0]).live("click", function() {
      var resourceURL = chooseImage();
      var mimeType = getMimeType();
      if ($("#memorypalace_add_content_container", $(rootel)[0]).is(":visible")) {
        addContentImage(resourceURL);
        addContentMimetype(mimeType);
      } else {
        addRoomImage(resourceURL);
      }
      $(browseResourceFilesDialog, $(rootel)[0]).jqmHide();
      return false;
   });
   
   $("#cancel_edit_room", $(rootel)[0]).live("click", function() {
     hideEverything();
     if (fromViewRoom) {
       showRoom(currentRoomPosition);
     } else {
       $(memorypalaceMap, $(rootel)[0]).show();
     }      
     return false;
   });
   
   $("#cancel_add_content", $(rootel)[0]).live("click", function() {
     hideEverything();
     currentContentItemData = {};
     showRoom(currentRoomPosition);
     return false;     
   });

   $("#delete_categories", $(rootel)[0]).live("click", function() {
     var categoriesToDelete = $("#categories_listing_body input[type='checkbox']:checked", $(rootel)[0]);
     var catIDsToDelete = [];
     $(categoriesToDelete).each(function(index, cat) {
       catIDsToDelete.push($(cat).val());
     });
     deleteCategories(catIDsToDelete);
     return false;     
   });
   
   $("#update_order", $(rootel)[0]).live("click", function() {
     updateCategoryOrder();
     return false;
   });
  
   $(memorypalaceRoomCategoryItem, $(rootel)[0]).live("click", function(){
     var catItemID = $(this).attr('id').split("item_")[1];
     // show category item
   });
   
   $(memorypalaceReturnToRoomFromEdit, $(rootel)[0]).live("click", function(){
     showRoom(currentRoomPosition);
     return false;
   });
   
   $(memorypalaceReturnToRoomFromEditContentItem, $(rootel)[0]).live("click", function() {
     showRoom(currentRoomPosition);
     return false;     
   });
   
   $(memorypalaceEditRoomLink, $(rootel)[0]).live("click", function() {
     if (sakai.site.isCollaborator)
      editRoom(currentRoomPosition, true);
     return false;     
   });
   
   $(memoryPalaceEditContentLink, $(rootel)[0]).live("click", function() {
     if (sakai.site.isCollaborator)     
      editContent(currentContentItemID);
     return false;     
   });
   
   $(memorypalaceAddContentLink, $(rootel)[0]).live("click", function() {
     // show add content pane
     if (sakai.site.isCollaborator)
      editContent(0);
     return false;     
   });
  
  $(memorypalaceViewContentLink, $(rootel)[0]).live("click", function() {
    var id = $(this).attr("id").split("cat_")[1];
    var itemID = id.split("_item_")[1];
    showContentItem(itemID);
     return false;    
  });
  
  $(memorypalaceReturnToContentFromEditLink, $(rootel)[0]).live("click", function() {
    showContentItem(currentContentItemID);
  });
  
  $("#edit_page").bind("click", function() {
    hideEverything();
      return false;    
  });
  
  $("button.s3d-button.s3d-button-primary.save_button").live("click", function() {
    hideEverything();
    $(memorypalaceMap, $(rootel)[0]).show();
    return false;    
  });
  
  $("button.s3d-button.cancel-button").live("click", function() {
    hideEverything();
    $(memorypalaceMap, $(rootel)[0]).show();
    return false;    
  });
  
  /**
   * Startup
   */
  getWidgetSettings();
  mpinitTinyMCE('room_overview');
  mpinitTinyMCE('content_description');
  if (showSettings) {
    $(memorypalaceSettings, $(rootel)[0]).show();
    $(memorypalaceMainContainer, $(rootel)[0]).hide();
  } else {
    $(memorypalaceSettings, $(rootel)[0]).hide();
    $(memorypalaceMainContainer, $(rootel)[0]).show();
  }
};


sdata.widgets.WidgetLoader.informOnLoad("memorypalace");