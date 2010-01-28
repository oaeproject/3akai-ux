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
/*global $, Config, jQuery, json_parse, sakai, sdata, Querystring */

/**
 *
 * @param {Object} json The json file data.
 */
 sakai.tlrp.tags = function(records, tuid) {
    var rootel = "#" + tuid;
    var searchterm = "";
    var hasSearched = false;
    var sorter = {};
    var breadCrumber = {};


    // Get all the items in one big array.
    var searchTrough = records;
    var displayedArticles = [];


    /////////////
    // CSS IDs //
    /////////////


    var tlrpTag = "#tlrpTag";
    var tlrpTagLink = ".tlrpTagLink";

    var tlrpTagArticles = tlrpTag + "Articles";
    var tlrpTagArticlesContainer = tlrpTagArticles + "Container";

    var tlrpTagResults = tlrpTag + "Results";
    var tlrpTagResultsTotal = tlrpTagResults + "Total";
    var tlrpTagResultsDisplayed = tlrpTagResults + "Displayed";

    var tlrpTagSort = tlrpTag + "Sort";
    var tlrpTagSortContainer = tlrpTagSort + "Container";
    var tlrpTagSortCheckbox = tlrpTagSort + "Checkbox";
    var tlrpTagSubjectsContainer = tlrpTag + "SubjectsContainer";
    var tlrpTagSubjectsTemplate = "tlrpTagSubjectsTemplate";
    var tlrpKeyWordBar = "tlrpTagBreadCrumbBar";

    var tlrpTagResultsClearFilter = "#tlrpTagResultsClearFilter";


    ///////////////////
    // Functionality //
    ///////////////////

    /**
     * Returns the jQuery selector for the breadcrumb bar.
     */
    var getBreadCrumbBar = function() {
        return tlrpKeyWordBar;
    };

     /**
     * Sort the results. The one with the most results get come first.
     * @param {Object} a The first object {'subject' : 'Data model', 'count' : 7}
     * @param {Object} b The second object {'subject' : 'Data transfer', 'count' : 23}
     */
    var sortByCount = function(a, b) {
        return (a.count < b.count) ? 1 : ((a.count === b.count) ? 0 : -1);
    };

    /**
     * Increase the count for the given subject. If the subject isn't found it will be added.
     * @param {Object[]} founditems
     * @param {String} subject
     */
    var addNotch = function(founditems, subject) {
        for (var i in founditems) {
            if (founditems[i].hasOwnProperty('subject') && founditems[i].subject === subject) {
                founditems[i].count = founditems[i].count + 1;
                return founditems;
            }
        }
        var o = {'subject' : subject, 'count' : 1};
        founditems.push(o);
        return founditems;
    };

    /**
     * Converts arrays to comma seperated strings in this item and makes undefined properties empty.
     * @param {Object} item
     */
    var doMarkUp = function(item) {
        if (typeof item.creator === "undefined") {
            item.creator = "";
        }
        if (typeof item.date === "undefined") {
            item.date = "";
        }
        if (typeof item.title === "undefined") {
            item.title = "";
        }
        if (typeof item.source === "undefined") {
            item.source = "";
        }
        if (typeof item.creator === "object") {
            item.creator = item.creator.join(', ');
        }
        return item;
    };

    /**
     * This will go trough the array with all the records.
     * @param {string} subject The subject you are looking for. If lookForSubjects is true, this can be a partial match.
     * @param {boolean} lookForSubjects Wethere to look for subjects or parameters.
     *  true -> Will return an array with subjects and their counts.
     *  false -> will return an array of records where a subject matches the subject parameter perfectly.
     */
    var findItems = function(subject, lookForSubjects) {
      var foundItems = [];
      var reg = new RegExp("^.*" + subject + ".*$","i");
      if (!lookForSubjects) {
          // We are not looking for subjects that partially match this term.
          // Instead we are looking for articles that have this termas as a subject. or one of them.
          reg = new RegExp("^" + subject + "$","i");
      }
      for (var i in searchTrough) {
            // Make sure we have the subject property
            // If it is an array we loop over it.
            if (typeof searchTrough[i].subject === "string" && (subject === "" || reg.test(searchTrough[i].subject))) {
                    if (lookForSubjects) {
                        // We found it, add or increase the count for it.
                        foundItems = addNotch(foundItems, searchTrough[i].subject);
                    }
                    else {
                        foundItems.push(doMarkUp(searchTrough[i]));
                    }
            }
            else {
                // The subject is an array.
                // Loop over all the items in this array and check if it matches the searchterm.
                for (var o in searchTrough[i].subject) {
                    //if (searchTrough[i].subject.hasOwnProperty(o) && searchTrough[i].subject[o].toUpperCase().indexOf(subject.toUpperCase()) !== -1) {
                    //if (searchTrough[i].subject.hasOwnProperty(o) && (subject === "" || reg.test(searchTrough[i].subject[o]))) {
                      if ((subject === "" || reg.test(searchTrough[i].subject[o]))) {
                        if (lookForSubjects) {
                            // We found it, add or increase the count for it.
                            foundItems = addNotch(foundItems, searchTrough[i].subject[o]);
                        }
                        else {
                            foundItems.push(doMarkUp(searchTrough[i]));
                        }
                    }
                }
            }
        }
        return foundItems;
    };

    /**
     * The private method that will perform the actual search.
     */
    var doSearch = function() {
        // Get all the items.
        var founditems = findItems(searchterm, true);
        founditems = founditems.sort(sortByCount);
        var results = {'items' : founditems};
        $(tlrpTagSubjectsContainer, rootel).html($.Template.render(tlrpTagSubjectsTemplate, results));

    };

    /**
     * This function will show the starting view. (All the categories).
     */
    var showStart = function() {
        $(tlrpTagArticles).hide();
        $(tlrpTagSubjectsContainer, rootel).show();
    };

    /**
     * The main public search function
     * @param {String} term The search term we are looking for.
     */
    var search = function(term) {
        // Hide the containers
        $(tlrpTagArticles).hide();
        $(tlrpTagSubjectsContainer, rootel).show();

        // Add breadcrumb
        breadCrumber.clear();
        breadCrumber.add(term, showStart);

        // If it is the same query there is no need to go trough the extensive search again.
        if (term !== searchterm || !hasSearched) {
            // Save the term for later on.
            searchterm = term;
            doSearch();
            hasSearched = true;
        }
    };

    //////////////////////
    // Display articles //
    //////////////////////
    /**
     * This method will display the already sorted articles.
     * @param {Object[]} sortedArticles Array of sorted article objects.
     */
    var showArticles = function(sortedArticles) {
        // Show how many articles we found.
        $(tlrpTagResultsDisplayed, rootel).text(sortedArticles.length);
        $(tlrpTagResultsTotal, rootel).text(searchTrough.length);

        // Do we want to group the results or not?
        var isGrouped = $(tlrpTagSortCheckbox, rootel).is(":checked");

        // Display the articles.
        var results = {'articles' : sortedArticles, 'showBalloonTip' : true, 'sortBy' : sorter.getSortBy(), 'isGrouped' : isGrouped};
        $(tlrpTagArticlesContainer, rootel).html($.Template.render("tlrpArticleResultTemplate", results));

        // Display the sort options
        $(tlrpTagSortContainer, rootel).html(sorter.generateSortByHTML());
    };

    /**
     * Searches for all the articles that have a subject equal to the given parameter.
     * @param {string} subject Subject to look for.
     */
    var searchArticlesFor = function(subject) {
        displayedArticles = findItems(subject, false);

        // Show the breadcrumb
        breadCrumber.add(subject);

        // Sort the articles.
        sorter.setData(displayedArticles);
        // showArticles will be executed when we are finished sorting them.
        sorter.sort();
    };

    ////////////
    // Events //
    ////////////

    /**
     * The user wants to group the results.
     */
    $(tlrpTagSortCheckbox, rootel).bind('click', function() {
        sorter.sort();
    });

    /**
     * Removes all the sorting options.
     */
    $(tlrpTagResultsClearFilter, rootel).live('click', function() {
        // Remove the grouping
        $(tlrpTagSortCheckbox, rootel).attr('checked', '');
        // Reset the sorting
        sorter.clearSort();
        sorter.addSort("creator", "asc");
        // The sorter will call the showArticles method for us.
        sorter.sort();
    });

    /**
     * Someone clicked a subject. This will show all the articles for that subject.
     * The subject name is placed inside the id.
     */
    $(tlrpTagLink).live('click', function(ev) {
        // Show the new container
       $(tlrpTagSubjectsContainer).hide();
       $(tlrpTagArticles).show();
       // Get the subject
       var subject = ev.target.id.replace(tlrpTagLink.replace(/\./gi,''),'');
       // Show all the articles for this subject.
       searchArticlesFor(subject);
    });


    ////////////////////
    // Initialisation //
    ////////////////////

    var doInit = function() {
        // Fire up default sorting.
        sorter = sakai.tlrp.sort(displayedArticles, "#" + tuid + " #tlrpLeftTabTagContainer");
        sorter.setSortBySelector(tlrpTagSortContainer);
        sorter.setSortCallback(showArticles);
        sorter.addSort('creator', 'asc');
        // Breadcrumb mechanisme.
        breadCrumber = new sakai.tlrp.breadcrumb(tuid + " ." + tlrpKeyWordBar, "." + tlrpKeyWordBar);
    };

    doInit();

    //////////////////////
    // Public functions //
    //////////////////////

    return {
        'search' : search,
        'getBreadCrumbBar' : getBreadCrumbBar
    };
};

sdata.widgets.WidgetLoader.informOnLoad("tlrp");