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
sakai.collections = function(tuid, showSettings) {
  
//  var me = sdata.me; // Contains information about the current user
  var rootel = "#" + tuid; // Get the main div used by the widget
  var collections = "#collections";
  
  // Containers
  var collectionsMainContainer = collections + "_main_container";
  var collectionsContainer = collections + "_container";  
  var collectionsSettings = collections + "_settings";
  var collectionsHeader = collections + "_header";
  var collectionsMap = collections + "_map";  
  var collectionsEditRoom = collections + "_map_room_edit";
  var collectionsEditRoomContainer = collectionsEditRoom + "_container";
  var categoriesListingBody = "#categories_listing_body";
  var collectionsShowRoom = "#collections_map_show_room";
  var collectionsShowRoomContainer = collectionsShowRoom + "_conatiner";
  var collectionsAddContent = collections + "_map_add_content";
  var collectionsAddContentContainer = collectionsAddContent + "_container";
  var collectionsCategoryDropdown = "#category_dropdown";
  var collectionsShowContentItem = "#collections_map_show_content_item";
  var collectionsShowContentItemContainer = collectionsShowContentItem + "_container";

  // Templates
  var collectionsMapTemplate = "collections_map_template";
  var collectionsHeaderTemplate = "collections_header_template";
  var collectionsEditRoomTemplate = "collections_map_room_edit_template";
  var categoriesListingBodyTemplate = "collections_map_categories_listing_body_template";
  var collectionsShowRoomTemplate = "collections_map_show_room_template";
  var collectionsAddContentTemplate = "collections_map_add_content_template";
  var collectionsCategoryDropdownTemplate = "category_dropdown_template";
  var collectionsShowContentItemTemplate = "collections_map_show_content_item_template";
  
  // Buttons
  var collectionsSettingsSubmit = collectionsSettings + "_submit";
  var collectionsSettingsCancel = collectionsSettings + "_cancel";
  var addCategoryButton = "#do_add_category";
  var browseForFilesButton = "#browse_for_files";
  var browseForContentFileButton = "#browse_for_content_file";

  
  // Links
  var returnToFloorplanLink = ".return_to_floorplan_link";
  var collectionsRoomCategoryItem = ".room_categories span a";
  var collectionsEditRoomLink = ".edit_this_room_link";
  var collectionsAddContentLink = ".add_content_link";
  var collectionsReturnToFloorplanFromEdit = "#return_to_floorplan_from_edit";
  var collectionsReturnToRoomFromEdit = "#return_to_room_from_edit";
  var collectionsReturnToRoomFromEditContentItem = "#return_to_room_from_edit_content_item";
  var collectionsReturnToFloorplanFromShow = "#return_to_floorplan_from_show";
  var collectionsViewContentLink = "div.room_categories span a";
  var collectionsEditContentLink = ".edit_this_content_link";
  var collectionsReturnToContentFromEditLink = "#return_to_content_from_edit";
  
  // Form
  var collectionsEditForm = "#collections_map_room_edit form";
  var collectionsAddContentForm = "#collections_map_add_content form";
  var addCategoryTextField = "#add_category";


  // Pick Resource Dialog
  var browseResourceFilesDialog = "#browse_resource_files";
  var chooseImageButton = "#choose_image";
  
  // Album View
  var collectionsAlbums = collections + "_albums";
  var collectionsAlbumsTemplate = collectionsAlbums + "_template";
  var collectionsAlbumsShowAlbum = collectionsAlbums + "_show_album";
  var collectionsAlbumsShowAlbumTemplate = collectionsAlbumsShowAlbum + "_template";

  
  var settings = {};
  var collectionData = {};
  var widgetData = {};
  var currentRoomPosition = 0;
  var currentCollectionData = {};
  var currentContentItemData = {};
  var currentContentItemID = 0;
  var fromViewRoom = false;
  
  /**
   * Universal Functions
   */
  
  var getWidgetData = function() {
    sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
      if (success) {
        settings = data.settings;
        collectionData = data.collectionData;
        if (showSettings) {
          $("#widget_title", $(rootel)[0]).val(settings.widgetTitle);
        } else {
          $(collectionsHeader, $(rootel)[0]).show();
          $.TemplateRenderer(collectionsHeaderTemplate, settings, $(collectionsHeader, $(rootel)[0]));
          if (settings.displayStyle == "mapView") {
            renderMapView();
          } else if (settings.displayStyle == "albumView") {
            renderAlbumView();
          }
        }
      } else {
        collectionData = {"collections":[]};
        settings.widgetTitle = "title";
        settings.displayStyle =  "mapView";//"albumView";
        return;
      }
    });
  };
  
  var saveWidgetData = function() {
    widgetData.collectionData = collectionData;
    widgetData.settings = settings;
    sakai.api.Widgets.saveWidgetData(tuid, widgetData, function(success, data) {
      if (success) {
        if (showSettings) {
          sakai.api.Widgets.Container.informFinish(tuid);
        }
      }
    });
  };

  var setupWidgetSettingsForSave = function() {
    settings = {};
    var title = $("#widget_title").val();
    if ($.trim(title) == "") {
      alert('Please input a title');
      return false;
    }
    settings.widgetTitle = title;
    settings.displayStyle ="mapView";//"albumView"; 
    saveWidgetData();
    return false;
  };
  
  var serializeCollectionDataForPost = function() {
    var thisCollectionData = currentCollectionData;    
    var collectionExists = false;
    // Put the room's data back into the collectionData object
    for (var i=0; i<collectionData.collections.length; i++) {
      if (collectionData.collections[i].position == currentRoomPosition) {
        collectionExists = true;
        collectionData.collections[i] = thisCollectionData;
      }
    }
    
    // if we're not editing, just push it onto the data stack
    if (!collectionExists) {
      collectionData.collections.push(thisCollectionData);
    }
    
    return collectionData;
  };

  var saveWidgetSettings = function() {
    setupWidgetSettingsForSave();
    saveWidgetData();
  };
  
  var saveCollectionData = function() {
    collectionData = serializeCollectionDataForPost();
    saveWidgetData();
  };

  var sortCollectionByPosition = function() {
    collectionData.collections.sort(function(a, b) {
        var positionA = a.position;
        var positionB = b.position;
        if (positionA && positionB) {
          return positionA - positionB;
        } else if (positionA) {
          return -1;
        } else if (positionB) {
          return 1;
        } else {
          return 0;
        }
    });
  };

  var hideAllViews = function() {
    $(".mapView").hide();
    $(".albumView").hide();
  };

  /**
   * Universal event bindings
   */
   
  $("#collections_header div a#configure_widget").live("click", function() {
    $("#collections_header div").toggleClass("expanded");
    $("#collections_header div span#choose_layout").toggle();
    if (settings.displayStyle == "albumView" && !$(".addAlbum").is(":visible")) {
      showAddAlbum();
    } else {
      hideAddAlbum();
    }
  });
  
  $("#collections_header div span#choose_layout").live("click", function() {
    $("#collections_header_select_layout").toggle();
  });
  
  $("#collections_header_select_layout li").live("click", function() {
    hideAllViews();
    if ($(this).attr("id") == "albumView") {
      $("#collections_header div span#choose_layout a span#chosen_layout").text("Album View");
      settings.displayStyle = "albumView";
      renderAlbumView();
    } else if ($(this).attr("id") == "mapView") {
      if (collectionData.collections.length > 10) {
        alert("You cannot change to this view, you have too many collections"); 
        renderAlbumView();
        showAddAlbum();
      } else {
        $("#collections_header div span#choose_layout a span#chosen_layout").text("Architectural View");
        settings.displayStyle = "mapView";
        renderMapView();      
      }
    }
    saveWidgetData();
    $("#collections_header_select_layout").toggle();
  });
  
  // Hide the layout dropdown if anywhere else is clicked
  $("html").live("click", function(e) {
    if ($("#collections_header_select_layout").is(":visible")) {
      var $clicked = $(e.target);
      if (!$clicked.parents().is("#collections_header_select_layout") && 
          !$clicked.parents().is("#choose_layout") && 
          !$clicked.is("#choose_layout") && 
          !$clicked.is("#collections_header_select_layout")) {
        $("#collections_header_select_layout").toggle();
      }
    }
  });

  /**
   * Album View
   */
   
  var clickedAlbumPosition = -1;
  var selectedAlbumPosition = -1;
  var albumData = {};
  
  var initializeAlbumView = function() {
    sortCollectionByPosition();
    for (var i in collectionData.collections) {
      collectionData.collections[i].albumViewPosition = i;
    }
  };
   
  var renderAlbumView = function() {
    initializeAlbumView();
    $(collectionsAlbums, $(rootel)[0]).show();
    $.TemplateRenderer(collectionsAlbumsTemplate, collectionData, $(collectionsAlbums, $(rootel)[0]));
  };

  var viewAlbum = function() {
    hideAllAlbumView();
    for (var i in collectionData.collections) {
      if (collectionData.collections[i].albumViewPosition == selectedAlbumPosition) {
       albumData = collectionData.collections[i];
       break;
      }
    }
    $(collectionsAlbumsShowAlbum).show();
    $.TemplateRenderer(collectionsAlbumsShowAlbumTemplate, {"album":albumData}, $(collectionsAlbumsShowAlbum, $(rootel)[0]));
  };
  
  var showAddAlbum = function() {
    if ($(".addAlbum").length == 0)
      $("#collections_albums").prepend("<div class='albumCover addAlbum'></div>");
    else
     $(".addAlbum").show();
  };
  
  var hideAddAlbum = function() {
    $(".addAlbum").hide();
  };
  
  var hideAllAlbumView = function() {
    $("#collections_header div").removeClass("expanded");
    $("#collections_header div span#choose_layout").hide();
    $("#collections_header_select_layout").hide();
    $(".albumView").hide();
  };
  
  /**
   * Album View Events
   */   
  /*
  $(".addAlbum").live("click", function() {
    hideAllAlbumView();
    
    $.TemplateRenderer(collectionsAlbumsShowAlbumTemplate, {"album":{}}, $(collectionsAlbumsShowAlbum));
  });
  */
  $(".albumCover").live("mousedown", function() {
    $(this).addClass("clicked");
    clickedAlbumPosition = $(this).attr("id").split("_")[1];
  });
  
  $(".albumCover").live("mouseleave", function() {
    $(this).removeClass("clicked"); 
  });
  
  $(".albumCover").live("mouseenter", function() {
    if ($(this).attr("id").split("_")[1] == clickedAlbumPosition) {
      $(this).addClass("clicked");
    }
  });
  
  $(".albumCover").live("mouseup", function() {
    $(this).removeClass("clicked");
    if ($(this).attr("id").split("_")[1] == clickedAlbumPosition) {
      selectedAlbumPosition = clickedAlbumPosition;
      viewAlbum();
    }
  });
  
  $("html").live("mouseup", function() {
    if ($(this).attr("id").split("_")[0] != "album") {
      clickedAlbumPosition = -1;
    }
  });
  
  /**
   * Map View
   */

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
   };
 
  var prepCollectionDataForMapView = function() {
    var ret = {"collections":[]};
    
    sortCollectionByPosition();
    
    for (var i=1; i<11; i++) {
      var tmpToPush = {};
      for (collection in collectionData.collections) {
        if (collectionData.collections[collection].position == i) {
          tmpToPush = collectionData.collections[collection];
          continue;
        }
      }
      
      if (!tmpToPush.position)
        tmpToPush.position = i;
      
      ret.collections.push(tmpToPush);
    }
    
    return ret;
  };
   
  var renderMapView = function() {
    $(collectionsMap, $(rootel)[0]).show();
    var mapViewData = prepCollectionDataForMapView();
    $.TemplateRenderer(collectionsMapTemplate, mapViewData, $(collectionsMap, $(rootel)[0]));
    if (!sakai.site.isCollaborator) {
      $("span a.addLink", $(rootel)[0]).hide();
    }
  };
  
  var editRoom = function(roomPosition, fromShowRoom) {
    currentRoomPosition = roomPosition;
    var roomExists = false;
    for (var i=0; i<collectionData.collections.length; i++) {
      if (collectionData.collections[i].position == currentRoomPosition) {
        currentCollectionData = collectionData.collections[i];
        roomExists = true;
      }
    }
    
    if (!roomExists) {
      currentCollectionData = {"position":roomPosition,"categories":[]};
    }
    
    hideEverything(); 
    $(collectionsEditRoomContainer, $(rootel)[0]).show();
    $(collectionsEditRoomContainer, $(rootel)[0]).parent().show();

    if (fromShowRoom) {
      fromViewRoom = true;
      $(collectionsReturnToFloorplanFromEdit, $(rootel)[0]).hide();
      $(collectionsReturnToRoomFromEdit, $(rootel)[0]).show();
    } else {
      fromViewRoom = false;
      $(collectionsReturnToFloorplanFromEdit, $(rootel)[0]).show();
      $(collectionsReturnToRoomFromEdit, $(rootel)[0]).hide();
    }
    if (!currentCollectionData.id) {
      var d = new Date();
      currentCollectionData.id = "room" + d.getTime() + "" + Math.floor(Math.random()*101);
    }
    $.TemplateRenderer(collectionsEditRoomTemplate, {"room" : currentCollectionData}, $(collectionsEditRoom, $(rootel)[0]));
    if (currentCollectionData.categories) {
      $.TemplateRenderer(categoriesListingBodyTemplate, {"categories" : currentCollectionData.categories}, $(categoriesListingBody, $(rootel)[0]));
      sortCategoriesDisplay();
    }
    tinyMCE.execCommand('mceAddControl', false, 'room_overview');
  };

  var getRoom = function(position) {
    var thiscollectionData;
     // Get the room's data
     for (var i=0; i<collectionData.collections.length; i++) {
       if (collectionData.collections[i].position == position) {
         thiscollectionData = collectionData.collections[i];
       }
     }
     return thiscollectionData;
  };
  
  var showRoom = function(position) {
    currentRoomPosition = position;
    currentCollectionData = getRoom(currentRoomPosition);
    hideEverything();
    $(collectionsShowRoomContainer, $(rootel)[0]).show();
    $.TemplateRenderer(collectionsShowRoomTemplate, {"room" : currentCollectionData}, $(collectionsShowRoom, $(rootel)[0]));
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
    $(collectionsMap, $(rootel)[0]).hide();
    $(collectionsShowRoomContainer, $(rootel)[0]).hide();
    $(collectionsEditRoomContainer, $(rootel)[0]).hide();
    $(collectionsSettings, $(rootel)[0]).hide();
    $(collectionsAddContentContainer, $(rootel)[0]).hide();
    $(collectionsShowContentItemContainer, $(rootel)[0]).hide();
  };
  
  var returnToFloorplan = function() {
    currentRoomPosition = 0;
    currentCollectionData = {};
    hideEverything();
    $(collectionsMap, $(rootel)[0]).show();
  };
  
  var editContent = function(contentItemID) {
    hideEverything();
    currentContentItemData = {};
    $(collectionsAddContentContainer, $(rootel)[0]).show();
    if (contentItemID != 0) {
      for (var i=0; i<currentCollectionData.categories.length; i++) {
        var currentCat = currentCollectionData.categories[i];
        for (var j=0; j<currentCat.items.length; j++) {
          if (currentCat.items[j].id == contentItemID) {
            currentContentItemData = currentCat.items[j];
          }
        }
      }
    }
    
    $.TemplateRenderer(collectionsAddContentTemplate, {"content" : currentContentItemData}, $(collectionsAddContent, $(rootel)[0]));
    $.TemplateRenderer(collectionsCategoryDropdownTemplate, {"room" : currentCollectionData}, $(collectionsCategoryDropdown, $(rootel)[0]));
    
    if (contentItemID != 0) {
      $(collectionsReturnToContentFromEditLink, $(rootel)[0]).show();
      $(collectionsReturnToRoomFromEdit, $(rootel)[0]).hide();
    } else {
      $(collectionsReturnToContentFromEditLink, $(rootel)[0]).hide();
      $(collectionsReturnToRoomFromEdit, $(rootel)[0]).show();
    }
    tinyMCE.execCommand('mceAddControl', false, 'content_description');
    
  };
  
  var showContentItem = function(itemID) {
    currentContentItemID = itemID;
    hideEverything();
    currentContentItemData = {};
    for (var i=0; i<currentCollectionData.categories.length; i++) {
      for (j=0; j<currentCollectionData.categories[i].items.length; j++) {
        if (currentCollectionData.categories[i].items[j].id == itemID) {
          currentContentItemData = currentCollectionData.categories[i].items[j];
        }
      }
    }
    $(collectionsShowContentItemContainer, $(rootel)[0]).show();
    $.TemplateRenderer(collectionsShowContentItemTemplate, {"item" : currentContentItemData}, $(collectionsShowContentItem, $(rootel)[0]));
  };
  
  /** 
   * Edit the collectionData object to get ready for a POST
   */

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
      for (var i=0; i<currentCollectionData.categories.length; i++) {
        if (currentCollectionData.categories[i].name == $("#category_dropdown select option:selected", $(rootel)[0]).val()) {
          if (!isNew) { // replace current one
            for (var j=0; j<currentCollectionData.categories[i].items.length; j++) {
              if (currentCollectionData.categories[i].items[j].id == currentContentItemData.id) {
                currentCollectionData.categories[i].items[j] = currentContentItemData;
              }
            }
          } else {
            // just add it in
            var d = new Date();
            currentContentItemData.id = "content" + d.getTime() + "" + Math.floor(Math.random()*101);
            currentCollectionData.categories[i].items.push(currentContentItemData);
            currentContentItemID = currentContentItemData.id;
          }
        }
      }
   };
   
   /**
    * Map View - Room Image Methods
    * Dependent on contentmedia_collections.js
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
    * Map View - Category Methods
    */
    var deleteCategories = function(catIDs) {
        for (var i = 0; i < currentCollectionData.categories.length; i++) {
            for (var j = 0; j < catIDs.length; j++) {
                if (currentCollectionData.categories[i].id == catIDs[j]) {
                    currentCollectionData.categories.splice(i, 1);
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

        // update order in currentCollectionData
        for (var j = 0; j < catOrders.length; j++) {
            var catID = $(catOrders[j]).attr("name");
            var catPos = $(catOrders[j]).val();
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                if (currentCollectionData.categories[i].id == catID) {
                    currentCollectionData.categories[i].position = j + 1;
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
      });
      $("#categories_listing_body", $(rootel)[0]).html('');
      $(rows).each(function(index, elt) {
        $("#categories_listing_body", $(rootel)[0]).append(elt);
      });
    };
  
    var addCategory = function(catToAdd) {
        var newCategory;
        var canAdd = true;
        if (currentCollectionData.categories) {
          for (var j = 0; j < currentCollectionData.categories.length; j++) {
              if (currentCollectionData.categories[j].name == catToAdd) {
                  canAdd = false;
              }
          }
        }
        
        if (canAdd) {
            var d = new Date();
            var catID = catToAdd.replace(" ", "-") + d.getTime() + "" + Math.floor(Math.random() * 101);
            newCategory = {
                "name": catToAdd,
                "id": catID,
                "position": currentCollectionData.categories ? currentCollectionData.categories.length + 1 : 1,
                "items": []
            };
            var currentNumCategories = currentCollectionData.categories ? currentCollectionData.categories.length : 0;
            if (currentNumCategories == 0) {
              currentCollectionData.categories = [];
              $(categoriesListingBody, $(rootel)[0]).html($.TemplateRenderer(categoriesListingBodyTemplate, {"categories": [newCategory]}));
            } else {
              $(categoriesListingBody, $(rootel)[0]).append($.TemplateRenderer(categoriesListingBodyTemplate, {"categories": [newCategory]}));
            }
            currentCollectionData.categories.push(newCategory);
            $(addCategoryTextField, $(rootel)[0]).val('');
        } else {
            // name conflict, cannot add
            alert('There already exists a category named "' + catToAdd + '". Please rename your category and try adding again.');
        }
    };
  
  
  /**
   * Map View - Event Bindings
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
   
   $(browseResourceFilesDialog, $(rootel)[0]).jqm({modal: true, width: 775, height: 450});
   
   $(browseForFilesButton, $(rootel)[0]).live("click", function() {
     sakai.collectionscontent();
     $(browseResourceFilesDialog, $(rootel)[0]).jqmShow();
      return false;     
   });
   
   $(browseForContentFileButton, $(rootel)[0]).live("click", function() {
     sakai.collectionscontent();
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
   
   $(collectionsAddContentForm, $(rootel)[0]).live("submit", function() {
     if (sakai.site.isCollaborator) {
       saveCurrentContentData();
       saveCollectionData();
       showContentItem(currentContentItemID);
     }
     return false;
   });
   
   $(collectionsEditForm, $(rootel)[0]).live("submit", function(e) {
     if (sakai.site.isCollaborator) {
       if ($.trim($("#room_title", $(rootel)[0]).val()) == "") {
         // need a title, son!
         alert("Please enter a title for this room before saving.");
         return false;
       }
       if (currentCollectionData.categories.length == 0) {
         // need categories too, kid!
         alert("Please add a category to this room before saving");
         return false;
       }
       currentCollectionData.title = $("#room_title", $(rootel)[0]).val();
       currentCollectionData.image = $("#room_image", $(rootel)[0]).val();
       currentCollectionData.description = tinyMCE.get("room_overview").getContent();
       saveCollectionData();
       var mapData = prepCollectionDataForMapView();
       hideEverything();
       $(collectionsMap, $(rootel)[0]).show();
       $.TemplateRenderer(collectionsMapTemplate, mapData, $(collectionsMap, $(rootel)[0]));
     }
     return false;
   });
   
   $(collectionsReturnToFloorplanFromShow, $(rootel)[0]).live("click", function() {
     returnToFloorplan();
      return false;     
   });
   
   $(collectionsReturnToFloorplanFromEdit, $(rootel)[0]).live("click", function() {
     returnToFloorplan();
      return false;     
   });
   
   $(collectionsSettingsSubmit, $(rootel)[0]).live("click", function() {
      saveWidgetSettings();
      return false;
   });
   
   $(collectionsSettingsCancel, $(rootel)[0]).live("click", function() {
      sakai.api.Widgets.Container.informCancel(tuid);
      return false;      
   });

   $("#cancel_choose_image", $(rootel)[0]).live("click", function() {
     $(browseResourceFilesDialog, $(rootel)[0]).jqmHide();
     return false;
   });

   $(chooseImageButton, $(rootel)[0]).live("click", function() {
      var resourceURL = chooseImage();
      var mimeType = getMimeType();
      if ($("#collections_map_add_content_container", $(rootel)[0]).is(":visible")) {
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
       $(collectionsMap, $(rootel)[0]).show();
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
  
   $(collectionsRoomCategoryItem, $(rootel)[0]).live("click", function(){
     var catItemID = $(this).attr('id').split("item_")[1];
     // show category item
   });
   
   $(collectionsReturnToRoomFromEdit, $(rootel)[0]).live("click", function(){
     showRoom(currentRoomPosition);
     return false;
   });
   
   $(collectionsReturnToRoomFromEditContentItem, $(rootel)[0]).live("click", function() {
     showRoom(currentRoomPosition);
     return false;     
   });
   
   $(collectionsEditRoomLink, $(rootel)[0]).live("click", function() {
     if (sakai.site.isCollaborator)
      editRoom(currentRoomPosition, true);
     return false;     
   });
   
   $(collectionsEditContentLink, $(rootel)[0]).live("click", function() {
     if (sakai.site.isCollaborator)     
      editContent(currentContentItemID);
     return false;     
   });
   
   $(collectionsAddContentLink, $(rootel)[0]).live("click", function() {
     // show add content pane
     if (sakai.site.isCollaborator)
      editContent(0);
     return false;     
   });
  
  $(collectionsViewContentLink, $(rootel)[0]).live("click", function() {
    var id = $(this).attr("id").split("cat_")[1];
    var itemID = id.split("_item_")[1];
    showContentItem(itemID);
     return false;    
  });
  
  $(collectionsReturnToContentFromEditLink, $(rootel)[0]).live("click", function() {
    showContentItem(currentContentItemID);
  });
  
  $("#edit_page").bind("click", function() {
    hideEverything();
      return false;    
  });
  
  $("button.s3d-button.s3d-button-primary.save_button").live("click", function() {
    hideEverything();
    $(collectionsMap, $(rootel)[0]).show();
    return false;    
  });
  
  $("button.s3d-button.cancel-button").live("click", function() { 
    hideEverything();
    $(collectionsMap, $(rootel)[0]).show();
    return false;    
  });
  
  /**
   * Startup
   */
  getWidgetData();
  mpinitTinyMCE('room_overview');
  mpinitTinyMCE('content_description');
  if (showSettings) {
    $(collectionsSettings, $(rootel)[0]).show();
    $(collectionsMainContainer, $(rootel)[0]).hide();
  } else {
    $(collectionsSettings, $(rootel)[0]).hide();
    $(collectionsMainContainer, $(rootel)[0]).show();
  }
};


sakai.api.Widgets.widgetLoader.informOnLoad("collections");