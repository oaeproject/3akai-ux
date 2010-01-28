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

/*global $, Config, jQuery, json_parse, sakai, sdata, Querystring, window */

sakai.tlrp.category = function(records, skos, tuid){

    var rootel = "#" + tuid;
    var categories = [];
    var currentSearch = "";
    var currentLevel = [];
    var depth = 0;
    var contWidth = 289;
    var indexString = "";
    var maxDepth = [];
    var tab = "narrower";
    var lastTab = "narrower";

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var tlrpSliderClass= ".tlrp_cat_slider";
    var tlrpSliderClassNoDot= "tlrp_cat_slider";
    var tlrpCatTemplate = "tlrpCatTemplate";
    var tlrpCatChildrenTemplate = "tlrpCatChildrenTemplate";
    var tlrpCatContainer = "#tlrpCatContainer";
    var tlrpCatChildrenContainerParent = "#tlrpCatChildrenContainerParent";
    var tlrpCatChildrenContainer = "#tlrpCatChildrenContainer";
    var tlrpCatList = "#tlrpCatList";
    var tlrpCatListSelectedItem = "tlrp_cat_selectedItem";
    var tlrpCatListItem= ".tlrpCatListItem";
    var tlrpCatListItemNoDot= "tlrpCatListItem";
    var tlrpCatListItemArrow= ".tlrpCatListItemArrow";
    var tlrpCatListItemArrowNoDot= "tlrpCatListItemArrow";
    var tlrpArticlesTemplate = "tlrpArticleResultTemplate";

    var tlrpCatChildrenListItem= ".tlrpCatChildrenListItem";
    var tlrpChildrenCatList = "#tlrpCatChildrenList";
    var tlrpCatChildrenListSelectedItem = "tlrp_cat_selectedItemChild";
    var tlrpCatChildrenListItemNoDot= "tlrpCatChildrenListItem";
    var tlrpCatChildrenListItemArrow= ".tlrpCatChildrenListItemArrow";
    var tlrpCatChildrenListItemArrowNoDot= "tlrpCatChildrenListItemArrow";

    var tlrpArticlesContainer = "#tlrpCatArticlesContainer";
    var tlrpKeyWordBar = "tlrpCatBreadCrumbBar";
    var tlrpFloatedContainersTemplate = "tlrp_floatedContainersTemplate";
    var tlrpFloatedContainersContainer= "#tlrpCatContainerContainingParent";

    // Initialize the breadCrumbs object
    var breadCrumbs = new sakai.tlrp.breadcrumb(tuid + " ." + tlrpKeyWordBar, "." + tlrpKeyWordBar, 12);


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Clones an object
     * @param {Object} object
     */
    var cloneObject = function(object) {
        return $.extend(true, {}, object);
    };


    //////////////////////
    // Output functions //
    //////////////////////

    /**
     * Gets all articles from a category
     * @param {Object} index
     */
    var getArticles = function(cat){

        var items = [];
        for(var i =0; i < records.length; i++){
            // loop through the items and search for an articles containing the correct subject
            if(records[i].subject && records[i].subject.indexOf(cat.prefLabel) > -1){
                // clone the object to avoid making changes to main records json object
                var tempRecord = cloneObject(records[i]);
                // make sure that there are no long strings
                if(tempRecord.title && tempRecord.title.length > 20){
                    tempRecord.title = tempRecord.title.substring(0,20) + "...";
                }
                if(tempRecord.creator && typeof tempRecord.creator === "object"){
                    tempRecord.creator = tempRecord.creator.join(",").substring(0,20) + "...";
                }
                else if(tempRecord.creator){
                    if(tempRecord.creator.length > 20){
                        tempRecord.creator = tempRecord.creator.substring(0,20) + "...";
                    }
                }

                // add the article to the array
                items.push(tempRecord);
            }
        }
        return items;
    };

    /**
     * gets all the childelements and articles for a category
     * @param {Object} cat: the category object
     * @param {Object} items: the array where the child elements shoul be added
     * @param {Object} depth: the current depth, should be 0 when calling outside of a function
     * @param {Object} propertyName: the name of the property where chidl-elemts should be retrieved (narrower or related)
     */
    var getChildItems = function(cat, items, depth, propertyName){
        // add 1 to the depth
        // this is the depth of recursion
        depth ++;
        // if maxdepth[propertyName] is undefined put it to 0
        maxDepth[propertyName] = maxDepth[propertyName] || 0;
        // if this is the highest depth yet update the maxdepth
        if(maxDepth[propertyName] < depth){
            maxDepth[propertyName] = depth;
        }
        var narrower = [];
        // check if the property exists in this category
        if(cat[propertyName]){
            // if it's an array use a forloop to loop through
            if(typeof cat[propertyName] === "object"){
                for(var i =0; i < cat[propertyName].length; i++){
                    // add the id to the array
                    narrower.push(cat[propertyName][i].substring(cat[propertyName][i].lastIndexOf("/") + 1));
                }
            }
            // else just use the property
            else{
                // add the id to the array
                narrower.push(cat[propertyName].substring(cat[propertyName].lastIndexOf("/") + 1));
            }

        }

        var inumArticles = 0;
        // if there is at least 1 item in the narrower array
        if(narrower.length > 0){
            // loop through the keywords json file to serach for the related or narrower ids
            for(i =0; i < skos.items.length; i++){
                var item = skos.items[i];
                // if you found the correct item
                if(narrower.indexOf(item.label) > -1){
                    // get the child items of that item
                    item.childItems = getChildItems(item, [],depth, propertyName);
                    // add the number of Articles
                    inumArticles += item.numArticles;
                    // if no articles are found in underlying elements then don't add the child category
                    if(item.numArticles > 0){
                        items.push(item);
                    }

                }
            }
        }
        // get all the articles for the category itself
        cat.childArticles = getArticles(cat);
        cat.numArticles = inumArticles + cat.childArticles.length;
        if(items.length > 0 && cat.childArticles.length > 0){
            // if no articles are found in underlying elements then don't add the category
            var category = cloneObject(cat);
            category.childArticles = getArticles(cat);
            category.numArticles = cat.childArticles.length;
            category.childItems = [];
            items.push(category);
        }
        return items;
    };



    /**
     * gets all the categories which contain a piece of the search term
     * @param {Object} category
     */
    var getCategories = function(category){
        var cats = [];
        // runs through the keywords JSON-object
        for(var i =0; i < skos.items.length; i++){
            var item = cloneObject(skos.items[i]);
            // if the prefLabel conatais the serachterm
            if(item.prefLabel && item.prefLabel.toUpperCase().indexOf(category.toUpperCase()) > -1){
                // get the child items for this category
                item.childItems = getChildItems(item, [],0, tab);
                // if the container has no articles or childitems with articles then this shouldn't be added
                if(item.childItems.length > 0 || item.childArticles.length > 0 ){
                    cats.push(item);
                }
            }
        }
        return cats;
    };

    /**
     * Shows all Articles based on the catergory index
     * @param {Object} index
     */
    var showArticles =function(index){
        // render the articles
        $(tlrpCatChildrenContainer + depth, rootel).html($.Template.render (tlrpArticlesTemplate, {'articles' : currentLevel, 'showBalloonTip' : false, 'sortBy' : ["creator"], 'isGrouped' : false}));
        // stop all animations on this container
        $(tlrpCatChildrenContainer + depth).stop();
        // show the correct animation
        // should be diffent with first container
        if (depth === 1) {
            $(tlrpCatChildrenContainer + depth, rootel).css( {
                left: -contWidth + "px",
                overflow: "hidden"
            });
              $(tlrpCatChildrenContainer + depth, rootel).animate( { left:"0px"}, 1000 );
            window.setTimeout(function(){
                $(tlrpCatChildrenContainer + depth, rootel).css( {overflow:"auto"});
            }, 1000);
        }
        else{
            $(tlrpCatContainer + ", " + tlrpSliderClass, rootel).animate(  { left: -(contWidth * (depth-1))  + "px"} , 1000 );
        }


    };

    /**
     * Shows all categories based on a search term
     * @param {Object} category
     */
    var showCategories = function(category){
        // if this is a new search then clear the categories search
        if(currentSearch !== category){
            categories = [];
        }
        // if it's a new seach or the data for this tab hasn't been searched yet
        if(currentSearch !== category || !categories[tab]){
            // update the lastTab
            lastTab = tab;
            // set the current search equal to the category
            currentSearch = category;
            // make the JSON-object to be rendered
            var cats = {};
            cats.items = currentLevel = categories[tab] = getCategories(category);
            // cats.children should be "" beacuse this is the top layer
            cats.children = "";
            // make a number of containers
            var containers = {containers : []};
            // fills an array that represents the number of containers
            // trimpath only has a foreach loop so this is the only way to make it loop
            for(var i = 0 ; i < maxDepth[tab] - 1; i++){
                containers.containers.push(i);
            }
            // render the floated containers
            $(tlrpFloatedContainersContainer, rootel).css({width : contWidth * (maxDepth[tab] + 2) + "px"});
            $(tlrpFloatedContainersContainer, rootel).html($.Template.render (tlrpFloatedContainersTemplate, containers));
            // render the list
            $(tlrpCatContainer, rootel).html($.Template.render (tlrpCatTemplate, cats));
            // add rounded corners to the list
            $(tlrpCatListItem, rootel).corners("3px");
        }
        else if(lastTab !== tab){
            // update the lastTab
            lastTab = tab;
            // make the JSON-object to be rendered
            cats = {};
            cats.items = currentLevel = categories[tab] ;
            // cats.children should be "" beacuse this is the top layer
            cats.children = "";
            containers = {containers : []};
            // fills an array that represents the number of containers
            // trimpath only has a foreach loop so this is the only way to make it loop
            for(i = 0 ; i < maxDepth[tab] - 1; i++){
                containers.containers.push(i);
            }
            // render the floated containers
            $(tlrpFloatedContainersContainer, rootel).css({width : contWidth * (maxDepth[tab] + 2) + "px"});
            $(tlrpFloatedContainersContainer, rootel).html($.Template.render (tlrpFloatedContainersTemplate, containers));
            // render the list
            $(tlrpCatContainer, rootel).html($.Template.render (tlrpCatTemplate, cats));
            // add rounded corners to the list
            $(tlrpCatListItem, rootel).corners("3px");
        }
    };

    /**
     * Show all child items for a category
     * @param {Object} index
     */
    var showChildItems = function(index){
        // make the JSON-object that needs to be rendered
        var children = {
            'items': currentLevel
        };
        // specify that this is not the top layer
        children.children = "Children";
        $(tlrpCatChildrenContainer + depth, rootel).html($.Template.render (tlrpCatTemplate, children));
        // add corners to the list items
        $(tlrpCatChildrenListItem, rootel).corners("3px");
        $(tlrpCatChildrenContainer + depth, rootel).show();
        // stop all running animations on this container
        $(tlrpCatChildrenContainer + depth).stop();
        // if the depth is 1 the the animation of this container is different then for the rest
        // show the child elements
        if(depth === 1){
            $(tlrpCatChildrenContainer + depth, rootel).css( { left:- contWidth + "px", overflow:"hidden"});
              $(tlrpCatChildrenContainer + depth, rootel).animate( { left:"0px"}, 1000 );
            window.setTimeout(function(){
                $(tlrpCatChildrenContainer + depth, rootel).css( {overflow:"auto"});
            }, 1000);
        }
        else{
            $(tlrpCatContainer + ", " + tlrpSliderClass, rootel).animate( { left: -(contWidth * (depth - 1)) + "px"}, 1000 );
        }

    };

    /**
     * Puts all containers back to their original place
     */
    var resetView = function(){
        // put the containers in the right place
        depth = 0;
        $(tlrpCatContainer+ ", " + tlrpSliderClass).stop();
        $(tlrpCatContainer+ ", " + tlrpSliderClass, rootel).css( { left:"0px"});
        $(tlrpCatChildrenContainer + "1", rootel).stop();
        $(tlrpCatChildrenContainer + "1", rootel).css( { left:-contWidth +"px"});
        // set the cuurent lavel to top
        currentLevel = categories[tab];
    };

    /**
     * gets the correct child element in the JSON file
     * returns a JSON object which contains the data pointing towards the namespaced indexString
     * @param {Object} indexString: namespaced indexString
     * @param {Object} currentLevel: current level, normally this should be top level when called outside this function
     */
    var getCorrectChildJSON = function(indexString, currentLevel){
        // if there's no more dot in the indexString
        if(indexString.indexOf(".") === -1){
            // return the articles or the childitems
            if(currentLevel[parseInt(indexString,10)].childItems.length === 0){
                return(currentLevel[parseInt(indexString,10)].childArticles);
            }
            else{
                return(currentLevel[parseInt(indexString,10)].childItems);
            }
        }
        // if there is still a dot in the indexstring
        // this means the indexString points towards something deeper
        else{
            // change the indexString (remove the current index)
            var tempInt = parseInt(indexString.substring(0, indexString.indexOf(".")),10);
            indexString = indexString.substring(indexString.indexOf(".") + 1);
            // change the currentLevel
            currentLevel = currentLevel[tempInt].childItems;
            // call this function again with the updated parameters
            // this will eventually return the correct JSON object
            return(getCorrectChildJSON(indexString, currentLevel));
        }
    };

    /**
     * Moves the containers to the position of the depth parameter
     * @param {Object} depth
     */
    var moveContainersTo = function(depth){
        $(tlrpCatChildrenContainer + "1", rootel).stop();
        $(tlrpCatContainer + ", " + tlrpSliderClass, rootel).animate( { left: -(contWidth * (depth - 1)) + "px"}, 1000 );

    };

    /**
     * gets the children of a selected category, and displays them in the next container
     * @param {Object} e: the eventargs of the clicked category
     * @param {Object} selectedItem: the class zhich represents a selected item
     * @param {Object} item: the begining of the id in order to filter the index
     * @param {Object} arrow: the begining of the arrow id in order to filter the index
     */
    var getChildren = function(e, selectedItem, item, arrow){
        // add 1 to the depth (this is the depth containing the user's current position)
        depth ++;
        // get the id of the cliked button
        // because a span is inside the button we may need the parent of the span
        var id = e.target.id || e.target.parentNode.id;
        // get the id of the container where the listitem is in
        var parent = "#" + (e.target.parentNode.parentNode.parentNode.parentNode.id);
        // update the depth by filering out the index of the parent container
        if(parent.indexOf(tlrpCatChildrenContainer) > -1){
            depth = parseInt(parent.replace(tlrpCatChildrenContainer, ""), 10) + 1;
        }
        // get the index of the clicked button
        var index = parseInt(id.replace(arrow, "").replace(item, ""),10);

        // if the depth is 1 the indexString should be 1 as well
        if(depth === 1){
            indexString = "" + index;
        }
        // else the indexString should be namespaced
        // this represents the selected items in each listbox
        else{
            var arrIndex = indexString.split(".");
            arrIndex.splice(depth - 1);
            indexString = arrIndex.join(".") + "." + index;
        }
        // get the currentlevel JSON-object
        // this is the JSON object containing the data for the next list
        currentLevel = getCorrectChildJSON(indexString, cloneObject(categories[tab]));
        // change the selected class
        $(parent + " ." + selectedItem, rootel).removeClass(selectedItem);
        $(parent + " #" + item + index, rootel).addClass(selectedItem);
        // check if the currentLevel has childItems
        if(currentLevel[0] && currentLevel[0].childItems){
            // if so show the childItems
            showChildItems(index);
        }
        else{
            // else show it's articles
            showArticles(index);
        }
        // get's the title attribute of the clicked button
        // this contains the full title instead of the substringed title in the innerHTML
        var title = $("#" + id).attr("title");
        // add a node to the breadcrumber
        // set the callback to movecontainers
        breadCrumbs.add(title, moveContainersTo, depth);
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    /** Bind the category-list-items click event */
    $(rootel + " ." + tlrpCatListItem).live("click", function(e){
        depth = 0;
        getChildren(e,tlrpCatListSelectedItem, tlrpCatListItemNoDot, tlrpCatListItemArrowNoDot);

    });
    /** Bind the category-children-list-items click event */
    $(rootel + " ." + tlrpCatChildrenListItem).live("click", function(e){
        getChildren(e,tlrpCatChildrenListSelectedItem, tlrpCatChildrenListItemNoDot, tlrpCatChildrenListItemArrowNoDot);

    });


    //////////////////////
    // Public functions //
    //////////////////////

    /**
     * Get the class name for the breadcrumbar for the category container
     */
    var getBreadCrumbBar = function() {
        return tlrpKeyWordBar;
    };

    return {
        search: function(category){
            resetView();
            showCategories(category);
            breadCrumbs.clear();
            breadCrumbs.add(category, resetView, depth);
        },
        getBreadCrumbBar : getBreadCrumbBar,
        setTab : function(tabName){
            tab = tabName;
        }
    };
};
sdata.widgets.WidgetLoader.informOnLoad("tlrp");

