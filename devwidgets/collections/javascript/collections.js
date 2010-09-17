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

    var rootel = "#" + tuid;
    var $rootel = $("#" + tuid);
    // Get the main div used by the widget
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
    var browseForFilesButton = ".browse_for_files";
    var browseForContentFileButton = ".browse_for_content_file";

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

    // Layout Selection
    var collectionsHeaderSelectLayout = "#collections_header_select_layout";
    var collectionsHeaderSelectLayoutTemplate = collectionsHeaderSelectLayout + "_template";

    // Album View
    var collectionsAlbums = collections + "_albums";
    var collectionsAlbumsTemplate = collectionsAlbums + "_template";
    var collectionsAlbumsShowAlbum = collectionsAlbums + "_show_album";
    var collectionsAlbumsShowAlbumTemplate = collectionsAlbumsShowAlbum + "_template";
    var collectionsAlbumShowCategory = collectionsAlbums + "_show_category";
    var collectionsAlbumShowCategoryTemplate = collectionsAlbumShowCategory + "_template";
    var collectionsAlbumsShowItem = collectionsAlbums + "_show_item";
    var collectionsAlbumsShowItemTemplate = collectionsAlbumsShowItem + "_template";

    var settings = {};
    var collectionData = {};
    var widgetData = {};
    var currentCollectionData = {};
    var currentContentItemData = {};
    var currentCategoryData = {};
    var currentItemData = {};
    var fromViewRoom = false;
    var selectedCollectionID = -1;
    var clickedCollectionID = -1;
    var clickedCategoryID = -1;
    var selectedCategoryID = -1;
    var clickedItemID = -1;
    var selectedItemID = -1;

    /**
     * Universal Functions
     */

    var getWidgetData = function() {
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
            if (success) {
                settings = data.settings;
                collectionData = data.collectionData;
                if (showSettings) {
                    $("#widget_title", $rootel).val(settings.widgetTitle);
                } else {
                    $(collectionsHeader, $rootel).show();
                    $.TemplateRenderer(collectionsHeaderTemplate, settings, $(collectionsHeader, $rootel));
                    $.TemplateRenderer(collectionsHeaderSelectLayoutTemplate, settings, $(collectionsHeaderSelectLayout, $rootel));
                    parseState();
                }
            } else {
                collectionData = {
                    "collections": []
                };
                settings.widgetTitle = "title";
                settings.displayStyle = "mapView";
                //"albumView";
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
                    sakai.api.Widgets.Container.informFinish(tuid, "collections");
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
        settings.displayStyle = "albumView";
        //"albumView";
        saveWidgetData();
        return false;
    };

    var prepareCollectionDataForPost = function() {
        var thisCollectionData = currentCollectionData;
        var collectionExists = false;
        // Put the room's data back into the collectionData object
        for (var i = 0; i < collectionData.collections.length; i++) {
            if (collectionData.collections[i].id == selectedCollectionID) {
                collectionExists = true;
                collectionData.collections[i] = thisCollectionData;
                break;
            }
        }

        // if we're not editing, just push it onto the data stack
        if (!collectionExists) {
            collectionData.collections.push(thisCollectionData);
        }

        return collectionData;
    };

    var saveCollectionData = function() {
        collectionData = prepareCollectionDataForPost();
        saveWidgetData();
    };

    var prepareCategoryDataForPost = function() {
        var thisCategoryData = currentCategoryData;
        var categoryExists = false;
        if (currentCollectionData.categories) {
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                if (currentCollectionData.categories[i].id == selectedCategoryID) {
                    categoryExists = true;
                    currentCollectionData.categories[i] = thisCategoryData;
                    break;
                }
            }
        } else {
            currentCollectionData.categories = [];
        }

        // if we're not editing, just push it onto the data stack
        if (!categoryExists) {
            currentCollectionData.categories.push(thisCategoryData);
        }

    };

    var saveCategoryData = function() {
        prepareCategoryDataForPost();
        saveCollectionData();
    };

    var prepareItemDataForPost = function() {
        var thisItemData = currentItemData;
        var itemExists = false;
        if (currentCategoryData.items) {
            for (var i = 0; i < currentCategoryData.items.length; i++) {
                if (currentCategoryData.items[i].id == selectedItemID) {
                    itemExists = true;
                    currentCategoryData.items[i] = thisItemData;
                    break;
                }
            }
        } else {
            currentCategoryData.items = [];
        }

        // if we're not editing, just push it onto the data stack
        if (!itemExists) {
            currentCategoryData.items.push(thisItemData);
        }

    };

    var saveItemData = function() {
        prepareItemDataForPost();
        saveCategoryData();
    };

    var saveWidgetSettings = function() {
        setupWidgetSettingsForSave();
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

    var parseState = function() {

        var collection = $.bbq.getState("collection");
        var mode = $.bbq.getState("mode");
        var pos = $.bbq.getState("pos");
        var category = $.bbq.getState("category");
        var item = $.bbq.getState("item");
        var view = $.bbq.getState("view");
        var fromShow = $.bbq.getState("fromShow");

        // set the state if its not set already
        if (!view) {
          if (settings.displayStyle == "mapView") {
                $.bbq.pushState({"view":"mapView"});
                return;
            } else if (settings.displayStyle == "albumView") {
                $.bbq.pushState({"view":"albumView"});
                return;
            }
        }

        if (view == "albumView") {
          if (item) {
              selectedCollectionID = collection;
              setCollectionData();
              if (selectedCategoryID != category) {
                  selectedCategoryID = category;
                  viewCategory();
              }
              selectedItemID = item;
              showItem();
          } else if (category) {
              hideEverything();
              selectedCollectionID = collection;
              setCollectionData();
              selectedCategoryID = category;
              viewCategory();
          } else if (collection) {
              hideEverything();
              selectedCollectionID = collection;
              viewAlbum();
            } else {
              hideEverything();
              renderAlbumView();
          }
        } else if (view == "mapView") {
              if (item) {
                hideEverything();
                selectedCollectionID = collection;
                setCollectionData();
                selectedItemID = item;
                if (mode === "edit") {
                    editContent(item);
                } else {
                    showContentItem();
                }
              } else if (collection) {
                hideEverything();
                selectedCollectionID = collection;
                setCollectionData();
                if (mode === "edit") {
                    editRoom(collection, fromShow, pos);
                } else {
                    showRoom();
                }

              } else {
                hideEverything();
                renderMapView();
            }
        }

        // AES-256 security
        // show any hidden options for editing if this person is a collaborator
        if (sakai.show.canEdit()) {
            $(".configure").show();
        }
    };

    var deleteItem = function(itemID) {
        var newCategoryItemData = [];
        for (var i = 0; i < currentCategoryData.items.length; i++) {
            if (currentCategoryData.items[i].id != itemID) {
                newCategoryItemData.push(currentCategoryData.items[i]);
            }
        }
        currentItemData = {};
        currentCategoryData.items = newCategoryItemData;
        saveCategoryData();
    };

    var deleteCategory = function(cid) {
        var newCollectionData = [];
        for (var i = 0; i < currentCollectionData.categories.length; i++) {
            if (currentCollectionData.categories[i].id != cid) {
                newCollectionData.push(currentCollectionData.categories[i]);
            }
        }
        currentCategoryData = {};
        currentCollectionData.categories = newCollectionData;
        saveWidgetData();
    };

    var deleteCollection = function(cid) {
        var newCollectionData = [];
        for (var i = 0; i < collectionData.collections.length; i++) {
            if (collectionData.collections[i].id != cid) {
                newCollectionData.push(collectionData.collections[i]);
            }
        }
        currentCollectionData = {};
        collectionData.collections = newCollectionData;
        saveWidgetData();
    };

    var setCollectionData = function() {
        if (!currentCollectionData || !currentCollectionData.categories || currentCollectionData.categories.length == 0) {
            for (var i in collectionData.collections) {
                if (collectionData.collections[i].id == selectedCollectionID) {
                    currentCollectionData = collectionData.collections[i];
                    break;
                }
            }
        }
    };

    var hideEverything = function() {
        try {
            tinyMCE.execCommand('mceRemoveControl', false, 'room_overview');
            tinyMCE.execCommand('mceRemoveControl', false, 'content_description');
        } catch(e) {}
        $(".mapView").hide();
        $(".albumView").hide();
    };

    /**
     * New TinyMCE Functions
     */
    var mceConfig = {
        mode: "textareas",
        theme: "simple",
        content_css: '/devwidgets/collections/css/collections.css'
    };

    var initInlineMCE = function() {
        tinyMCE.settings = mceConfig;
    };

    $.editable.addInputType('mce', {
        element: function(settings, original) {
            var textarea = $('<textarea id="' + $(original).attr("id") + '_mce"/>');
            if (settings.rows) {
                textarea.attr('rows', settings.rows);
            } else {
                textarea.height(settings.height);
            }
            if (settings.cols) {
                textarea.attr('cols', settings.cols);
            } else {
                textarea.width(settings.width);
            }
            $(this).append(textarea);
            return (textarea);
        },
        plugin: function(settings, original) {
            tinyMCE.execCommand("mceAddControl", false, $(original).attr("id") + '_mce');
            $(window).bind("click", function(e) {
                // i know, this gets bound every time, and causes tons of events to pile up - let me know if you have a better way to do this
                if (!$(e.target).parents(".inlineEditBtn").length) {
                    tinyMCE.execCommand("mceRemoveControl", false, $(original).attr("id") + '_mce');
                    original.reset();
                }
            });
        },
        submit: function(settings, original) {
            tinyMCE.triggerSave();
            tinyMCE.execCommand("mceRemoveControl", false, $(original).attr("id") + '_mce');
        },
        reset: function(settings, original) {
            tinyMCE.execCommand("mceRemoveControl", false, $(original).attr("id") + '_mce');
            original.reset();
        }
    });

    /**
     * Universal event bindings
     */

    $("#collections_header h1", $rootel).live("click", function() {
        $.bbq.removeState('item', 'category', 'collection', 'fromShow', 'mode', 'pos');
    });

    $("#collections_header div a#configure_widget", $rootel).live("click", function() {
        $("#collections_header div").toggleClass("expanded");
        $("#collections_header div span#choose_layout").toggle();
        if (sakai.show.canEdit()) {
          if (settings.displayStyle == "albumView" && !$(".addAlbum").is(":visible")) {
              showAddAlbum();
          } else {
              hideAddAlbum();
          }
      }
    });

    $("#collections_header div span#choose_layout", $rootel).live("click", function() {
        $("#collections_header_select_layout").toggle();
    });

    $("#collections_header_select_layout li", $rootel).live("click", function() {
        hideEverything();
        $("#collections_header_select_layout li").removeClass("selected");
        $(this).addClass("selected");
        if ($(this).attr("id") == "albumView") {
            $("#collections_header div span#choose_layout a span#chosen_layout").text("Album View");
            settings.displayStyle = "albumView";
            $.bbq.pushState({
                'view': 'albumView'
            });
            showAddAlbum();
        } else if ($(this).attr("id") == "mapView") {
            if (collectionData.collections.length > 10) {
                alert("You cannot change to this view, you have too many collections");
                $.bbq.pushState({
                    'view': 'albumView'
                });
                showAddAlbum();
            } else {
                $("#collections_header div span#choose_layout a span#chosen_layout").text("Architectural View");
                settings.displayStyle = "mapView";
                $.bbq.pushState({
                    'view': 'mapView'
                });
            }
        }
        saveWidgetData();
        $("#collections_header_select_layout").toggle();
    });

    // History Mgmt
    $(window).bind("hashchange", function(e) {
        parseState();
    });

    // Hide the layout dropdown if anywhere else is clicked
    $("html").live("click", function(e) {
        if ($("#collections_header_select_layout").is(":visible")) {
            var $clicked = $(e.target);
            if (!$clicked.parents().is("#collections_header_select_layout") && !$clicked.parents().is("#choose_layout") && !$clicked.is("#choose_layout") && !$clicked.is("#collections_header_select_layout")) {
                $("#collections_header_select_layout").toggle();
            }
        }
    });

    /**
     * Album View
     */

    var clickedAlbumPosition = -1;
    var selectedAlbumPosition = -1;
    var categoryImages = [];

    var stripHTML = function(_html) {
        var ret = $('<div>' + _html + '</div>').text().trim();
        return ret;
    };

    var initializeAlbumView = function() {
        sortCollectionByPosition();
        for (var i in collectionData.collections) {
            collectionData.collections[i].albumViewPosition = i;
        }
    };

    var renderAlbumView = function() {
        hideAllAlbumView();
        initializeAlbumView();
        $(collectionsAlbums, $rootel).show();
        $.TemplateRenderer(collectionsAlbumsTemplate, collectionData, $(collectionsAlbums, $rootel));
        if (sakai.show.canEdit()) {
          $("#collections_header div", $rootel).show();
          if (collectionData.collections.length == 0) {
            if (!$("#collections_header div").hasClass("expanded")) {
              $("#collections_header div a#configure_widget").trigger("click");
          } else {
            showAddAlbum();
        }
          }
        }

        $(".albumCoverTitle span").html(stripHTML($(".albumCoverTitle span").html()));
        $(".albumCoverDescription span").each(function(elt) {
          var newDesc = stripHTML($(this).html()); // strip the html tags
          newDesc = newDesc.substring(1,newDesc.length);  // remove the " that trimpath is putting in there...
          $(this).html(newDesc);
        });
        $(".albumCoverDescription").ThreeDots({max_rows : 6,  allow_dangle:true, whole_word:false});
        $(".albumCoverTitle").ThreeDots({max_rows : 2,  allow_dangle:true, whole_word:false});
    };

    var addNewAlbum = function() {
        currentCollectionData = {};
        if (collectionData.collections) currentCollectionData.albumViewPosition = collectionData.collections.length;
        else currentCollectionData.albumViewPosition = 0;

        var d = new Date();
        currentCollectionData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
        selectedCollectionID = currentCollectionData.id;

        $.bbq.pushState({
            'collection': selectedCollectionID
        });
    };

    var viewAlbum = function() {
        hideAllAlbumView();

        if (! (currentCollectionData.id == selectedCollectionID)) {
            currentCollectionData = {};
            for (var i in collectionData.collections) {
                if (collectionData.collections[i].id == selectedCollectionID) {
                    currentCollectionData = collectionData.collections[i];
                    break;
                }
            }
        }

        // these should never happen
        if (!currentCollectionData.albumViewPosition) {
            currentCollectionData.albumViewPosition = collectionData.collections.length;
        }
        if (!currentCollectionData.id) {
            var d = new Date();
            currentCollectionData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
            selectedCollectionID = currentCollectionData.id;
        }

        $(collectionsAlbumsShowAlbum).show();
        $.TemplateRenderer(collectionsAlbumsShowAlbumTemplate, {
            "album": currentCollectionData
        },
        $(collectionsAlbumsShowAlbum, $rootel));
        selectedCollectionID = currentCollectionData.id;

        if (!currentCollectionData.title || currentCollectionData.title == "") {
            $(".configureAlbum a").trigger("click");
        } else {
            setupCategoryPreviewImages();
        }

        $(".categoryPreviewName span").each(function(elt) {
          $(this).html(stripHTML($(this).html()));
        });


        $(".categoryPreviewName").ThreeDots({max_rows : 1,  allow_dangle:true, whole_word:false});
    };

    var showAddAlbum = function() {
        if ($("#collections_header div").hasClass("expanded")) {
            if ($(".addAlbum").length == 0) $("#collections_albums").append("<div class='albumCover addAlbum'></div>");
            else $(".addAlbum").show();
        }
    };

    var hideAddAlbum = function() {
        $(".addAlbum").hide();
    };

    var hideAllAlbumView = function() {
        $(".albumView").hide();
    };

    var setupCategoryPreviewImages = function() {
        // find all items with mimeType of image/*
        // preload them all, in some intelligent way
        //  - fire up a ton of <img> tags with sequential IDs so that we can just toggle them back and forth based on mousemove position
        for (var i in currentCollectionData.categories) {
            var cat = currentCollectionData.categories[i];
            var setFirstImage = false;
            for (var j in cat.items) {
                var item = cat.items[j];
                if (item.mimeType && item.mimeType.split("/")[0] == "image") {
                    $("<img/>")[0].src = item.url;
                    // load/cache the image
                    if (!setFirstImage) {
                        setFirstImage = true;
                        $("#category_" + cat.id + " div img").attr("src", item.url);
                        categoryImages[cat.id] = {};
                        categoryImages[cat.id].currentImage = 0;
                        categoryImages[cat.id].images = [];
                    }
                    categoryImages[cat.id].images.push(item.url);
                }
            }
            if (!categoryImages[cat.id]) {
                $("#category_" + cat.id + " div img").attr("src", "/dev/_images/mimetypes/empty.png");
            }
        }
    };

    var isNewCategory = false;

    var addNewCategory = function() {
        currentCategoryData = {};
        if (currentCollectionData.categories) currentCategoryData.position = currentCollectionData.categories.length;
        else currentCategoryData.position = 0;

        var d = new Date();
        currentCategoryData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
        selectedCategoryID = currentCategoryData.id;
        currentCategoryData.items = [];
        $.bbq.pushState({
            'category': selectedCategoryID
        });
        isNewCategory = true;
    };

    var viewCategory = function() {
        hideAllAlbumView();

        for (var y in currentCollectionData.categories) {
            if (currentCollectionData.categories[y].id == selectedCategoryID) {
                currentCategoryData = currentCollectionData.categories[y];
                break;
            }
        }

        $(collectionsAlbumShowCategory).show();
        var catHTML = $.TemplateRenderer(collectionsAlbumShowCategoryTemplate, {
            "category": currentCategoryData,
            "album": currentCollectionData
        });
        $(collectionsAlbumShowCategory, $rootel).html(catHTML);
        sizeItemScrollbar();

        if (isNewCategory && sakai.show.canEdit()) {
            $(".configureCategory a").trigger("click");
            isNewCategory = false;
        }

        $(".itemPreviewTitle span").html(stripHTML($(".itemPreviewTitle span").html()));
        $(".itemPreviewTitle").ThreeDots({max_rows : 1,  allow_dangle:true, whole_word:false});

    };

    var addNewItem = function() {
        currentItemData = {};

        var d = new Date();
        currentItemData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
        selectedItemID = currentItemData.id;

        currentItemData.mimeType = "";

        $.bbq.pushState({
            'item': selectedItemID
        });
    };

    var showAddItem = function() {
        if ($(".configureCategory").hasClass("expanded")) {
            if ($(".addItem").length == 0) $(".scroll-content").prepend("<div class='scroll-content-item addItem'><div class='scrollItemContainer'></div></div>");
            else $(".addItem").show();
        }
    };

    var hideAddItem = function() {
        $(".addItem").hide();
    };

    var sizeItemScrollbar = function() {
        var numChildren = $(".scroll-content").children().length;
        var childWidth = $(".scroll-content").children().outerWidth(true);
        var totalChildWidth = childWidth * numChildren;
        var scrollContentWidth = totalChildWidth > 560 ? totalChildWidth : 560;
        $(".scroll-content").css({
            "width": scrollContentWidth + "px"
        });
    };

    var showItem = function() {
        $("#item_" + selectedItemID).addClass("selected");
        if (currentItemData.id != selectedItemID) {
            for (var i in currentCategoryData.items) {
                if (currentCategoryData.items[i].id == selectedItemID) {
                    currentItemData = currentCategoryData.items[i];
                    break;
                }
            }
        }
        $(collectionsAlbumsShowItem).show();
        $.TemplateRenderer(collectionsAlbumsShowItemTemplate, {
            "item": currentItemData
        },
        $(collectionsAlbumsShowItem, $rootel));

        if (!currentItemData.title || currentItemData.title == "") {
            $(".configureItem a").trigger("click");
        }

    };

    var toggleAlbumEditable = function() {
        $(".isEditable").each(function(elt) {
            if ($(this).hasClass("editable")) {
                //tinyMCE.execCommand("mceRemoveControl", false, $(this).attr("id")+'_mce');
                $(this).editable("disable");
                if ($(this).text() == "Click to edit") {
                    $(this).text('');
                }
            } else {
                initInlineMCE();
                if ($(this).hasClass("albumDesc")) {
                    $('.albumDesc').editable(function(value, settings) {
                        currentCollectionData.description = value;
                        saveCollectionData();
                        return (value);
                    },
                    {
                        type: 'mce',
                        submit: 'OK',
                        tooltip: 'Click to add a description of this album',
                        onblur: 'ignore',
                        cssclass: 'inlineEditBtn'
                    });
                } else if ($(this).hasClass("albumTitle")) {
                    $('.albumTitle').editable(function(value, settings) {
                        currentCollectionData.title = value;
                        saveCollectionData();
                        return (value);
                    },
                    {
                        type: 'text',
                        submit: 'OK',
                        tooltip: 'Click to add the album title',
                        cssclass: 'inlineEditBtn'
                    });
                } else if ($(this).hasClass("albumImage")) {

                }
                $(this).editable("enable");
            }
            $(this).toggleClass("editable");
        });
    };

    var toggleCategoryEditable = function() {
        $(".categoryData.isEditable").each(function(elt) {
            if ($(this).hasClass("editable")) {
                $(this).editable("disable");
                $(this).find("input").blur();
                tinyMCE.execCommand("mceRemoveControl", true, $(this).attr("id") + '_mce');
                if ($(this).text() == "Click to edit") {
                    $(this).text('');
                }
                hideAddItem();
            } else {
                if ($(this).hasClass("categoryTitle")) {
                    $('.categoryTitle').editable(function(value, settings) {
                        currentCategoryData.name = value;
                        saveCategoryData();
                        return (value);
                    },
                    {
                        type: 'text',
                        submit: 'OK',
                        tooltip: 'Click to add the category title',
                        cssclass: 'inlineEditBtn'
                    });
                }
                $(this).editable("enable");
                showAddItem();
            }
            $(this).toggleClass("editable");
        });
    };

    var toggleItemEditable = function() {
        $(".itemData.isEditable").each(function(elt) {
            if ($(this).hasClass("editable")) {
                $(this).editable("disable");
                $(this).find("input").blur();
                $(this).find("textarea").blur();
                tinyMCE.execCommand("mceRemoveControl", true, $(this).attr("id") + '_mce');
                if ($(this).text() == "Click to edit") {
                    $(this).text('');
                }
            } else {
                if ($(this).hasClass("itemDesc")) {
                    initInlineMCE();
                    $('.itemDesc').editable(function(value, settings) {
                        currentItemData.description = value;
                        saveItemData();
                        $.TemplateRenderer(collectionsAlbumShowCategoryTemplate, {
                            "category": currentCategoryData,
                            "album": currentCollectionData
                        },
                        $(collectionsAlbumShowCategory, $rootel));
                        if (sakai.show.canEdit()) {
                            $(".configure").show();
                        }
                        $("#item_" + selectedItemID).addClass("selected");
                        sizeItemScrollbar();
                        $(".itemPreviewTitle span").html(stripHTML($(".itemPreviewTitle span").html()));
                $(".itemPreviewTitle").ThreeDots({max_rows : 1,  allow_dangle:true, whole_word:false});
                        return (value);
                    },
                    {
                        type: 'mce',
                        submit: 'OK',
                        tooltip: 'Click to add a description of this album',
                        onblur: 'ignore',
                        cssclass: 'inlineEditBtn'
                    });
                } else if ($(this).hasClass("itemTitle")) {
                    $('.itemTitle').editable(function(value, settings) {
                        currentItemData.title = value;
                        saveItemData();
                        $.TemplateRenderer(collectionsAlbumShowCategoryTemplate, {
                            "category": currentCategoryData,
                            "album": currentCollectionData
                        },
                        $(collectionsAlbumShowCategory, $rootel));
                        if (sakai.show.canEdit()) {
                            $(".configure").show();
                        }
                        $("#item_" + selectedItemID).addClass("selected");
                        sizeItemScrollbar();
                        $(".itemPreviewTitle span").html(stripHTML($(".itemPreviewTitle span").html()));
                $(".itemPreviewTitle").ThreeDots({max_rows : 1,  allow_dangle:true, whole_word:false});
                        return (value);
                    },
                    {
                        type: 'text',
                        submit: 'OK',
                        tooltip: 'Click to add the album title',
                        cssclass: 'inlineEditBtn'
                    });
                } else if ($(this).hasClass("itemImage")) {

                }
                $(this).editable("enable");
            }
            $(this).toggleClass("editable");
        });
    };

    var addAlbumImage = function(url) {
        currentCollectionData.image = url;
        $(".albumImage img").attr("src", url);
        saveCollectionData();
    };

    var addItemFile = function(url, mimeType) {
        currentItemData.url = url;
        currentItemData.mimeType = mimeType;
        if (mimeType.split("/")[0] == "image") {
            $(".itemImage img").attr("src", url);
        } else if (sakai.config.MimeTypes[mimeType]) {
            $(".itemImage img").attr("src", sakai.config.MimeTypes[mimeType].URL);
        } else {
            $(".itemImage img").attr("src", sakai.config.MimeTypes["other"].URL);
        }
        $("a.itemLink").attr("href", url);
        saveItemData();
        $.TemplateRenderer(collectionsAlbumShowCategoryTemplate, {
            "category": currentCategoryData,
            "album": currentCollectionData
        },
        $(collectionsAlbumShowCategory, $rootel));
    };

    /**
     * Album View Events
     */

    $(".addItem", $rootel).live("click", function() {
        addNewItem();
    });

    $(".categoryHeader span a", $rootel).live("click", function() {
        addNewCategory();
    });

    $(".configureCategory button", $rootel).live("click", function() {
        deleteCategory(currentCategoryData.id);
        $.bbq.removeState("category", "fromShow", "pos", "mode");
    });

    $(".configureAlbum button", $rootel).live("click", function() {
        deleteCollection(currentCollectionData.id);
        $.bbq.removeState("collection", "fromShow", "pos", "mode");
    });

    $(".configureItem button", $rootel).live("click", function() {
        deleteItem(currentItemData.id);
        $.bbq.removeState("item", "fromShow", "pos", "mode");
    });

    $(".configureAlbum a", $rootel).live("click", function() {
        $(".configureAlbum").toggleClass("expanded");
        $(".configureAlbum button").toggle();
        $(".categoryHeader span").toggle();
        toggleAlbumEditable();
    });

    $(".configureCategory a", $rootel).live("click", function() {
        $(".configureCategory").toggleClass("expanded");
        $(".configureCategory button").toggle();
        toggleCategoryEditable();
        return false;
    });

    $(".configureItem a", $rootel).live("click", function() {
        $(".configureItem").toggleClass("expanded");
        $(".configureItem button").toggle();
        toggleItemEditable();
        return false;
    });

    $("#collections_albums_show_category h1", $rootel).live("click", function() {
        $.bbq.removeState('item', 'category', "fromShow", "pos", "mode");
    });

    $(".scroll-content-item", $rootel).live("mouseenter", function() {
        if (clickedItemID == -1) {
            $(this).addClass("hovered");
        }
        if ($(this).attr("id").split("item_")[1] == clickedItemID) {
            $(this).addClass("clicked");
        }
    });

    $(".scroll-content-item", $rootel).live("mouseleave", function() {
        $(this).removeClass("hovered");
        $(this).removeClass("clicked");
    });

    $(".scroll-content-item", $rootel).live("mousedown", function() {
        $(this).addClass("clicked");
        clickedItemID = $(this).attr("id").split("item_")[1];
    });

    $(".scroll-content-item", $rootel).live("mouseup", function() {
      $(this).removeClass("clicked");
        var itemid = $(this).attr("id").split("item_")[1];
          if (itemid == clickedItemID) {
            $(".scroll-content-item").removeClass("selected");
            $(this).addClass("selected");
            selectedItemID = itemid;
            clickedItemID = -1;
            $.bbq.pushState({
                "item": selectedItemID
            });
        }
    });

    var timeOfLastImageChange = 0;

    $(".categoryPreview div img", $rootel).live("mousemove", function(e) {
        var catid = $(this).parents(".categoryPreview").attr("id").split("category_")[1];
        if (categoryImages[catid]) {
            // if there are any images at all here
            var d = new Date();
            var currentTime = d.getTime();
            if (currentTime - timeOfLastImageChange > 100) {
                // throttle it so its not crazy
                timeOfLastImageChange = currentTime;
                if (categoryImages[catid].currentImage + 1 >= categoryImages[catid].images.length) {
                    categoryImages[catid].currentImage = 0;
                } else {
                    categoryImages[catid].currentImage++;
                }
                $(this).attr("src", categoryImages[catid].images[categoryImages[catid].currentImage]);
            }
        }
    });

    $(".categoryPreview", $rootel).live("mouseup", function() {
      $(this).removeClass("clicked");
      var catid = $(this).attr("id").split("category_")[1];
        if (catid == clickedCategoryID) {
          selectedCategoryID = catid;
          clickedCategoryID = -1;
          $.bbq.pushState({
              "category": selectedCategoryID
          });
      }
    });

    $(".categoryPreview", $rootel).live("mouseenter", function() {
        if (clickedCategoryID == -1) {
            $(this).addClass("hovered");
        }
        if ($(this).attr("id").split("category_")[1] == clickedCategoryID) {
            $(this).addClass("clicked");
        }
    });

    $(".categoryPreview", $rootel).live("mouseleave", function() {
      $(this).removeClass("clicked");
      $(this).removeClass("hovered");
    });

    $(".categoryPreview", $rootel).live("mousedown", function() {
      $(this).addClass("clicked");
    clickedCategoryID = $(this).attr("id").split("category_")[1];
  });

    $(".albumCover", $rootel).live("mousedown", function() {
        $(this).addClass("clicked");
        clickedCollectionID = $(this).attr("id").split("_")[1];
    });

    $(".albumCover", $rootel).live("mouseleave", function() {
      $(this).removeClass("clicked");
      $(this).removeClass("hovered");
    });

    $(".albumCover", $rootel).live("mouseenter", function() {
      if (clickedCollectionID == -1) {
        $(this).addClass("hovered");
    }
        if ($(this).attr("id").split("_")[1] == clickedCollectionID) {
            $(this).addClass("clicked");
        }
    });

    $(".albumCover", $rootel).live("mouseup", function() {
        $(this).removeClass("clicked");
        if ($(this).attr("id").split("_")[1] == clickedCollectionID) {
            if ($(this).hasClass("addAlbum")) {
                addNewAlbum();
            } else {
                selectedCollectionID = clickedCollectionID;
                clickedCollectionID = -1;
                $.bbq.pushState({
                    'collection': selectedCollectionID
                });
            }
        }
    });

    $("html").live("mouseup", function() {
        if ($(this).attr("id").split("_")[0] != "album") {
            clickedCollectionID = -1;
        }
        if ($(this).attr("id").split("_")[0] != "category") {
          clickedCategoryID = -1;
        }
        if ($(this).attr("id").split("_")[0] != "item") {
          clickedItemID = -1;
        }
    });

    /**
     * Map View
     */

    var mpinitTinyMCE = function(elt) {

        // Init tinyMCE
        tinyMCE.init({
            // General options
            mode: "exact",
            theme: "advanced",
            elements: elt,
            width: "603px",
            plugins: "spellchecker,advhr,embedresource,resourcelink,inlinepopups,preview,noneditable,nonbreaking,xhtmlxtras,template",
            theme_advanced_toolbar_location: "top",
            theme_advanced_toolbar_align: "left",
            theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull",
            theme_advanced_buttons2: "bullist,numlist,|,outdent,indent,|,spellchecker,|,image,resourcelink",
            theme_advanced_buttons3: "",
            // Example content CSS (should be your site CSS)
            content_css: sakai.config.URL.TINY_MCE_CONTENT_CSS
        });
    };

    var prepCollectionDataForMapView = function() {
        var ret = {
            "collections": []
        };

        sortCollectionByPosition();

        for (var i = 1; i < 11; i++) {
            var tmpToPush = {};
            for (j in collectionData.collections) {
                if (collectionData.collections[j].position == i) {
                    tmpToPush = collectionData.collections[j];
                }
            }

            if (!tmpToPush.position) {
                if (collectionData.collections[i - 1] && !collectionData.collections[i - 1].position) {
                    tmpToPush = collectionData.collections[i - 1];
                }
                tmpToPush.position = i;
            }

            if (!tmpToPush.id) {
                var d = new Date();
                tmpToPush.id = d.getTime() + "" + Math.floor(Math.random() * 101);
            }

            ret.collections.push(tmpToPush);
        }

        return ret;
    };

    var renderMapView = function() {
        $(collectionsMap, $rootel).show();
        var mapViewData = prepCollectionDataForMapView();
        $.TemplateRenderer(collectionsMapTemplate, mapViewData, $(collectionsMap, $rootel));
        if (sakai.show.canEdit()) {
          $("#collections_header div", $rootel).show();
        } else {
            $("span a.addLink", $rootel).hide();
        }
    };

    var editRoom = function(id, fromShowRoom, roomPosition) {
        selectedCollectionID = id;
        var roomExists = false;
        for (var i = 0; i < collectionData.collections.length; i++) {
            if (collectionData.collections[i].id == selectedCollectionID) {
                currentCollectionData = collectionData.collections[i];
                roomExists = true;
            }
        }

        if (!roomExists) {
            currentCollectionData = {
                "position": roomPosition,
                "categories": []
            };
        }

        hideEverything();
        $(collectionsEditRoomContainer, $rootel).show();
        $(collectionsEditRoomContainer, $rootel).parent().show();

        if (fromShowRoom === "true") {
            fromViewRoom = true;
            $(collectionsReturnToFloorplanFromEdit, $rootel).hide();
            $(collectionsReturnToRoomFromEdit, $rootel).show();
        } else {
            fromViewRoom = false;
            $(collectionsReturnToFloorplanFromEdit, $rootel).show();
            $(collectionsReturnToRoomFromEdit, $rootel).hide();
        }
        if (!currentCollectionData.id) {
            var d = new Date();
            currentCollectionData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
        }
        $.TemplateRenderer(collectionsEditRoomTemplate, {
            "room": currentCollectionData
        },
        $(collectionsEditRoom, $rootel));
        if (currentCollectionData.categories) {
            $.TemplateRenderer(categoriesListingBodyTemplate, {
                "categories": currentCollectionData.categories
            },
            $(categoriesListingBody, $rootel));
            sortCategoriesDisplay();
        }
        tinyMCE.execCommand('mceAddControl', false, 'room_overview');
    };

    var getRoom = function(id) {
        var thisCollectionData;
        // Get the room's data
        for (var i = 0; i < collectionData.collections.length; i++) {
            if (collectionData.collections[i].id == id) {
                thisCollectionData = collectionData.collections[i];
            }
        }
        return thisCollectionData;
    };

    var showRoom = function() {
        currentCollectionData = getRoom(selectedCollectionID);
        hideEverything();
        $(collectionsShowRoomContainer, $rootel).show();
        $.TemplateRenderer(collectionsShowRoomTemplate, {
            "room": currentCollectionData
        },
        $(collectionsShowRoom, $rootel));
        if (!sakai.show.canEdit()) {
            $("span#room_edit_links", $rootel).hide();
        }
    };

    var returnToFloorplan = function() {
        $.bbq.removeState("item", "collection", "category", "fromShow", "pos", "mode");
    };

    var editContent = function(contentItemID) {
        hideEverything();
        currentContentItemData = {};
        $(collectionsAddContentContainer, $rootel).show();
        if (contentItemID != 0) {
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                var currentCat = currentCollectionData.categories[i];
                for (var j = 0; j < currentCat.items.length; j++) {
                    if (currentCat.items[j].id == contentItemID) {
                        currentContentItemData = currentCat.items[j];
                    }
                }
            }
        }

        $.TemplateRenderer(collectionsAddContentTemplate, {
            "content": currentContentItemData
        },
        $(collectionsAddContent, $rootel));
        $.TemplateRenderer(collectionsCategoryDropdownTemplate, {
            "room": currentCollectionData
        },
        $(collectionsCategoryDropdown, $rootel));

        if (contentItemID != 0) {
            $(collectionsReturnToContentFromEditLink, $rootel).show();
            $(collectionsReturnToRoomFromEdit, $rootel).hide();
        } else {
            $(collectionsReturnToContentFromEditLink, $rootel).hide();
            $(collectionsReturnToRoomFromEdit, $rootel).show();
        }
        tinyMCE.execCommand('mceAddControl', false, 'content_description');

    };

    var showContentItem = function() {
        currentContentItemData = {};
        for (var i = 0; i < currentCollectionData.categories.length; i++) {
            for (j = 0; j < currentCollectionData.categories[i].items.length; j++) {
                if (currentCollectionData.categories[i].items[j].id == selectedItemID) {
                    currentContentItemData = currentCollectionData.categories[i].items[j];
                }
            }
        }
        $(collectionsShowContentItemContainer, $rootel).show();
        $.TemplateRenderer(collectionsShowContentItemTemplate, {
            "item": currentContentItemData
        },
        $(collectionsShowContentItem, $rootel));
    };

    /**
     * Edit the collectionData object to get ready for a POST
     */

    var saveCurrentContentData = function() {
        var isNew = true;
        if (currentContentItemData.id) {
            isNew = false;
            var curID = currentContentItemData.id;
            selectedItemID = curID;
        }
        currentContentItemData.title = $("#content_title", $rootel).val();
        currentContentItemData.url = $("#content_url", $rootel).val();
        currentContentItemData.description = $("#content_description", $rootel).val();
        currentContentItemData.mimeType = $("#content_mimetype", $rootel).val();
        for (var i = 0; i < currentCollectionData.categories.length; i++) {
            if (currentCollectionData.categories[i].name == $("#category_dropdown select option:selected", $rootel).val()) {
                if (!isNew) {
                    // replace current one
                    for (var j = 0; j < currentCollectionData.categories[i].items.length; j++) {
                        if (currentCollectionData.categories[i].items[j].id == currentContentItemData.id) {
                            currentCollectionData.categories[i].items[j] = currentContentItemData;
                        }
                    }
                } else {
                    // just add it in
                    var d = new Date();
                    currentContentItemData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
                    currentCollectionData.categories[i].items.push(currentContentItemData);
                    selectedItemID = currentContentItemData.id;
                }
            }
        }
    };

    /**
     * Map View - Room Image Methods
     */
    var addRoomImage = function(url) {
        $("#room_image", $rootel).val(url);
    };

    var addItemContent = function(url) {
        $("#content_url", $rootel).val(url);
    };

    var addContentMimetype = function(mt) {
        $("#content_mimetype", $rootel).val(mt);
    };

    /**
     * Map View - Category Methods
     */
    var deleteCategories = function(catIDs) {
        for (var i = 0; i < currentCollectionData.categories.length; i++) {
            for (var j = 0; j < catIDs.length; j++) {
                if (currentCollectionData.categories[i].id == catIDs[j]) {
                    currentCollectionData.categories.splice(i, 1);
                    $("#cat_" + catIDs[j], $rootel).parent().parent().fadeOut();
                }
            }
        }
    };

    var updateCategoryOrder = function() {
        var catOrders = $("#categories_listing_body input[type='text']", $rootel);
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
                    $("input[name='" + catID + "']", $rootel).val(j + 1);
                }
            }
        }
        sortCategoriesDisplay();
    };

    var sortCategoriesDisplay = function() {
        var rows = $("#categories_listing_body tr", $rootel);
        rows.sort(function(a, b) {
            var positionA = $(a).find("input[type='text']").val();
            var positionB = $(b).find("input[type='text']").val();
            return positionA - positionB;
        });
        $("#categories_listing_body", $rootel).html('');
        $(rows).each(function(index, elt) {
            $("#categories_listing_body", $rootel).append(elt);
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
            var catID = d.getTime() + "" + Math.floor(Math.random() * 101);
            newCategory = {
                "name": catToAdd,
                "id": catID,
                "position": currentCollectionData.categories ? currentCollectionData.categories.length + 1 : 1,
                "items": []
            };
            var currentNumCategories = currentCollectionData.categories ? currentCollectionData.categories.length : 0;
            if (currentNumCategories == 0) {
                currentCollectionData.categories = [];
                $(categoriesListingBody, $rootel).html($.TemplateRenderer(categoriesListingBodyTemplate, {
                    "categories": [newCategory]
                }));
            } else {
                $(categoriesListingBody, $rootel).append($.TemplateRenderer(categoriesListingBodyTemplate, {
                    "categories": [newCategory]
                }));
            }
            currentCollectionData.categories.push(newCategory);
            $(addCategoryTextField, $rootel).val('');
        } else {
            // name conflict, cannot add
            alert('There already exists a category named "' + catToAdd + '". Please rename your category and try adding again.');
        }
    };

    /**
     * Map View - Event Bindings
     */

    $(addCategoryButton, $rootel).live("click", function() {
        var catToAdd = $.trim($(addCategoryTextField, $rootel).val());
        if (catToAdd != "") {
            addCategory(catToAdd);
        } else {
            // do nothing, for now
        }
        return false;
    });

    $(".roomLink", $rootel).live("click", function() {
      var roomID = $(this).parents(".roomWrapper").attr("id").split("_")[1];
        if ($(this).hasClass("addLink")) {
            var editRoomPos =  $(this).attr("id").split("_")[1];
            $.bbq.pushState({"collection": roomID, "mode": "edit", "fromShow": false, "pos": editRoomPos});
        } else {
          $.bbq.pushState({"collection": roomID});
        }
        return false;
    });

    $(collectionsAddContentForm, $rootel).live("submit", function() {
        if (sakai.show.canEdit()) {
            saveCurrentContentData();
            saveCollectionData();
            $.bbq.removeState("fromShow", "pos", "mode", "collection");
            $.bbq.setState({"item": selectedItemID});
        }
        return false;
    });

    $(collectionsEditForm, $rootel).live("submit", function(e) {
        if (sakai.show.canEdit()) {
            if ($.trim($("#room_title", $rootel).val()) == "") {
                // need a title, son!
                alert("Please enter a title for this room before saving.");
                return false;
            }
            if (currentCollectionData.categories.length == 0) {
                // need categories too, kid!
                alert("Please add a category to this room before saving");
                return false;
            }
            currentCollectionData.title = $("#room_title", $rootel).val();
            currentCollectionData.image = $("#room_image", $rootel).val();
            currentCollectionData.description = tinyMCE.get("room_overview").getContent();
            saveCollectionData();
            $.bbq.removeState("fromShow", "pos", "mode", "collection");
        }
        return false;
    });

    $(collectionsReturnToFloorplanFromShow, $rootel).live("click", function() {
        $.bbq.removeState("collection", "item", "fromShow", "pos", "mode", "item");
        return false;
    });

    $(collectionsReturnToFloorplanFromEdit, $rootel).live("click", function() {
        $.bbq.removeState("item", "collection", "fromShow", "pos", "mode", "item");
        return false;
    });

    $(collectionsSettingsSubmit, $rootel).live("click", function() {
        saveWidgetSettings();
        return false;
    });

    $(collectionsSettingsCancel, $rootel).live("click", function() {
        sakai.api.Widgets.Container.informCancel(tuid, "collections");
        return false;
    });

    $("#cancel_edit_room", $rootel).live("click", function() {
        hideEverything();
        if (fromViewRoom) {
            showRoom();
        } else {
            $(collectionsMap, $rootel).show();
        }
        return false;
    });

    $("#cancel_add_content", $rootel).live("click", function() {
        hideEverything();
        currentContentItemData = {};
        showRoom();
        return false;
    });

    $("#delete_categories", $rootel).live("click", function() {
        var categoriesToDelete = $("#categories_listing_body input[type='checkbox']:checked", $rootel);
        var catIDsToDelete = [];
        $(categoriesToDelete).each(function(index, cat) {
            catIDsToDelete.push($(cat).val());
        });
        deleteCategories(catIDsToDelete);
        return false;
    });

    $("#update_order", $rootel).live("click", function() {
        updateCategoryOrder();
        return false;
    });

    $(collectionsRoomCategoryItem, $rootel).live("click", function() {
        var catItemID = $(this).attr('id').split("item_")[1];
        // show category item
    });

    $(collectionsReturnToRoomFromEdit, $rootel).live("click", function() {
        $.bbq.removeState("fromShow", "pos", "mode", "item");
        return false;
    });

    $(collectionsReturnToRoomFromEditContentItem, $rootel).live("click", function() {
        $.bbq.removeState("item", "fromShow", "pos", "mode", "item");
        return false;
    });

    $(collectionsEditRoomLink, $rootel).live("click", function() {
        if (sakai.show.canEdit()) {
            $.bbq.pushState({"mode": "edit", "fromShow": true, "collection": selectedCollectionID});
        }
        return false;
    });

    $(collectionsEditContentLink, $rootel).live("click", function() {
        if (sakai.show.canEdit()) {
            $.bbq.pushState({"mode": "edit", "item": selectedItemID});
        }
        return false;
    });

    $(collectionsAddContentLink, $rootel).live("click", function() {
        // show add content pane
        if (sakai.show.canEdit()) {
            $.bbq.pushState({"mode": "edit", "item": 0});
        }
        return false;
    });

    $(collectionsViewContentLink, $rootel).live("click", function() {
        var id = $(this).attr("id").split("cat_")[1];
        var itemID = id.split("_item_")[1];
        $.bbq.pushState({"item":itemID});
        return false;
    });

    $(collectionsReturnToContentFromEditLink, $rootel).live("click", function() {
        showContentItem();
    });

    $("#edit_page").bind("click", function() {
        hideEverything();
        $.bbq.removeState("item", "collection", "category", "fromShow", "pos", "mode");
        return false;
    });

    $("button.s3d-button.s3d-button-primary.save_button").live("click", function() {
        hideEverything();
        $(collectionsMap, $rootel).show();
        return false;
    });

    $("button.s3d-button.cancel-button").live("click", function() {
        hideEverything();
        $(collectionsMap, $rootel).show();
        return false;
    });


    // embed content bindings

    var bindToEmbedContent = function() {
        $(".itemImage.editable", $rootel).live("click", function() {
            $(window).trigger('sakai-embedcontent-init', {"name":"Item", "mode": "picker", "limit": 1, "filter": false});
            $(window).unbind("sakai-embedcontent-picker-finished");
            $(window).bind("sakai-embedcontent-picker-finished", function(e, fileList) {
                if (fileList.items.length) {
                    addItemFile(fileList.items[0].link, fileList.items[0].mimetype);
                }
            });
        });
        $(".albumImage.editable", $rootel).live("click", function() {
            $(window).trigger('sakai-embedcontent-init', {"name":"Album", "mode": "picker", "limit": 1, "filter": "image"});
            $(window).unbind("sakai-embedcontent-picker-finished");
            $(window).bind("sakai-embedcontent-picker-finished", function(e, fileList) {
                if (fileList.items.length) {
                    addAlbumImage(fileList.items[0].link);
                }
            });
        });
        $(browseForFilesButton, $rootel).live("click", function() {
            $(window).trigger('sakai-embedcontent-init', {"name":"Album", "mode": "picker", "limit": 1, "filter": "image"});
            $(window).unbind("sakai-embedcontent-picker-finished");
            $(window).bind("sakai-embedcontent-picker-finished", function(e, fileList) {
                if (fileList.items.length) {
                    addRoomImage(fileList.items[0].link);
                }
            });
        });
        $(browseForContentFileButton, $rootel).live("click", function() {
            $(window).trigger('sakai-embedcontent-init', {"name":"Album", "mode": "picker", "limit": 1, "filter": false});
            $(window).unbind("sakai-embedcontent-picker-finished");
            $(window).bind("sakai-embedcontent-picker-finished", function(e, fileList) {
                if (fileList.items.length) {
                    addItemContent(fileList.items[0].link);
                    addContentMimetype(fileList.items[0].mimetype);
                }
            });
        });
    };

    /**
     * Startup
     */
    var doInit = function() {
        getWidgetData();
        mpinitTinyMCE('room_overview');
        mpinitTinyMCE('content_description');
        if (showSettings) {
            $(collectionsSettings, $rootel).show();
            $(collectionsMainContainer, $rootel).hide();
        } else {
            $(collectionsSettings, $rootel).hide();
            $(collectionsMainContainer, $rootel).show();
        }
        if (sakai.embedcontent) {
            bindToEmbedContent();
        } else {
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
            $(window).bind("sakai-embedcontent-ready", function(e) {
                bindToEmbedContent();
            });
        }
    };
    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("collections");