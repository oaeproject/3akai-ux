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
/*global $, Config, jQuery, json_parse, sakai, sdata, */

/**
 * Object responsible for sorting article results and displaying the appropriate HTML
 * @param {string} rootel The id of the element where to search for the nescecary html elements.
 */
sakai.tlrp.sort = function(oData, rootel) {
    rootel = $(rootel);
    // The object that will contain all the data.
    var data = [];

    var sortByAvailableOptions = ['creator', 'date', 'source', 'subject', 'title'];
    // This is the array that wil contain all the ways that the objects are sorted.
    var sortBy = [];
    var sortOrder = [];
    var sortBySelector = ""; // The jQuery selector where the sorted by message will come.
    var sortCallback = false;

    // CSS IDs //
    /////////////

    var tlrp = "#tlrp";
    var tlrpClass = ".tlrp";

    var tlrpSortBy = tlrp + "SortBy";
    var tlrpSortByClass = tlrpClass + "SortBy";
    var tlrpSortByTemplate = tlrpSortBy + "Template";
    var tlrpSortByThenBy = tlrpSortByClass + "ThenBy";
    var tlrpSortByThenByOption = tlrpSortByThenBy + "Option";

    var tlrpSortByAvailableOptions = tlrpSortByClass + "AvailableOptions";
    var tlrpSortByItem = tlrpSortByClass + "Item";
    var tlrpSortByItemOptions = tlrpSortBy + "ItemOptions";
    var tlrpSortByItemOptionsTemplate = tlrpSortByItemOptions + "Template";

    var tlrpSortByAscending = tlrpSortByClass + "Ascending";
    var tlrpSortByDescending = tlrpSortByClass + "Descending";
    var tlrpSortByEditOption = tlrpSortByClass + "EditOption";


    ///////////////////
    // Functionality //
    ///////////////////

    /**
     * Set the data that needs to be sorted.
     * @param {Object} oData
     */
    var setData = function(oData) {
        data = oData;
    };

    /**
     * Get the data.
     */
    var getData = function() {
        return data;
    };

    /**
     * Adds a sorting method to the list.
     * @param {string} sort The attribute you want to sort on. Make sure it is in the sortByAvailableOptions list!
     * @param {string} order asc or desc
     */
    var addSort = function(sort, order) {
        // Make sure that the given sort is an option that we allow sorting on.
        if (sortByAvailableOptions.indexOf(sort) === -1) {
            throw new Error("This is not an available option to sort on.");
        }
        if (order !== "asc" && order !== "desc") {
            throw new Error("This is not an available sort order.");
        }
        // We dont add sortings twice.
        if (sortBy.indexOf(sort) === -1) {
            sortBy.push(sort);
            sortOrder.push(order);
            sortByAvailableOptions.splice(sortByAvailableOptions.indexOf(sort), 1);
        }
    };

    /**
     * Removes a sorting out of the list.
     * @param {string} sort
     */
    var removeSort = function(sort) {
        if (sortBy.indexOf(sort) !== -1) {
            sortBy.splice(sort.indexOf, 1);
            sortOrder.splice(sort.indexOf, 1);
            sortByAvailableOptions.push(sort);
        }
    };

    /**
     * This will perform an actual sort.
     * @return {object[]} A sorted array of objects.
     */
    var sort = function() {
        // If there is no sorting set, we do nothing..
        if (sortBy.length > 0) {
            var options = {};
            var sortByOrder = 'asc';
            for (var i = 0; i < sortBy.length; i++) {
                // Set the sortby and sortorder for this object.
                $(options).attr(sortBy[i], sortOrder[i]);
                if (i === 0) {
                    sortByOrder = sortOrder[i];
                }
            }
            // Sort the actual data.
            var t = $(data).sort(options, sortByOrder);
            setData($(t).get());

            // Execute the callback.
            if (sortCallback) {
                sortCallback(getData());
            }
        }

        return getData();
    };

    /**
     * Remove all the sorting that is in place.
     */
    var clearSort = function() {
        var to = sortBy.length;
        for (var i = 0; i < to; i++) {
            sortByAvailableOptions.push(sortBy[0]);
            sortBy.splice(0, 1);
        }
    };

    /**
     * Returns the array with all the current sortings.
     */
    var getSortBy = function() {
        return sortBy;
    };

    /**
     * The callback function that will be executed once the sorting is done.
     * @param {Object} method
     */
    var setSortCallback = function(method) {
        sortCallback = method;
    };

    ////////////////////////
    // Template functions //
    ////////////////////////

    /**
     * Sets the jQuery selector where the sorted by message will come in.
     * @param {string} selector The jQuery selector.
     */
    var setSortBySelector = function(selector) {
        sortBySelector = selector;
    };

    /**
     * Returns the jQuery selector for the sorted by message.
     */
    var getSortBySelector = function() {
        return sortBySelector;
    };

    /**
     * Generates the HTML for the sorted by message.
     * @param {Object} template
     */
    var generateSortByHTML = function(template) {
        // If no template is provided we use a standard one.
        if (typeof template === "undefined") {
            template = tlrpSortByTemplate;
        }
        var json = {
            'sortedBy': sortBy,
            'availableOptions': sortByAvailableOptions
        };

        return $.Template.render (template.replace(/#/gi, ''), json);
    };


    ////////////
    // Events //
    ////////////

    // A user wants to view the extra options to sort on.
    $(tlrpSortByThenBy, rootel).live('click', function() {
        $(tlrpSortByAvailableOptions, rootel).toggle();
        $(tlrpSortByAvailableOptions, rootel).css({
            'left': $(this).offset().left,
            'top': $(this).offset().top + 18
        });
    });

    // If the user clicks somewhere else, the container is hidden
    $("body:not(" + tlrpSortByThenBy + ")").click(function() {
        if ($(tlrpSortByAvailableOptions, rootel).is(":visible")) {
            $(tlrpSortByAvailableOptions, rootel).hide();
        }
        if ($(tlrpSortByItemOptions).is(":visible")) {
            $(tlrpSortByItemOptions).hide();
        }
    });


    // A user wants to add an extra option of sorting.
    $(tlrpSortByThenByOption, rootel).live('click', function() {
        // Add the sorting
        var s = $(this).html();
        addSort(s, 'asc');
        // Do sorting
        sort();
        // Render the sorted by message.
        $(getSortBySelector()).html(generateSortByHTML());
    });

    // A user wants to see the options for a sorting option
    $(tlrpSortByItem, rootel).live('click', function() {
        $("#tlrpSortByItemOptions").css({
            'left': $(this).offset().left,
            'top': $(this).offset().top + 18
        });
        $(tlrpSortByItemOptions).toggle();

        var mySortOrder = sortOrder[sortBy.indexOf($(this).html())];

        var json = {
            'sort': $(this).html(),
            'sortedBy': sortBy,
            'sortOrder': mySortOrder,
            'availableOptions': sortByAvailableOptions
        };
        $(tlrpSortByItemOptions).html($.Template.render (tlrpSortByItemOptionsTemplate.replace('#',''), json));
    });

    /**
     * Someone wants to change the sort order.
     * It's not nescecary to add the rootel because it isnt in the container!
     */
    $(tlrpSortByDescending).live('click', function(e) {
        var s = e.target.id.replace(/tlrpSortByDescending/, '');
        sortOrder[sortBy.indexOf(s)] = 'desc';
        sort();
    });
    $(tlrpSortByDescending).live('click', function(e) {
        var s = e.target.id.replace(/tlrpSortByAscending/, '');
        sortOrder[sortBy.indexOf(s)] = 'asc';
        sort();
    });

    $(tlrpSortByEditOption).live('click', function(e) {
        var s = e.target.id.split('_');
        // Remove this sorting
        removeSort(s[1]);
        // Add the new one
        addSort(s[2], 'asc');
        // sort the data.
        sort();
    });


    ////////////////////
    // Initialisation //
    ////////////////////

    setData(oData);
    sortByAvailableOptions = sortByAvailableOptions.sort();

    ///////////////////
    // Return values //
    ///////////////////

    return {
        'addSort': addSort,
        'removeSort': removeSort,
        'clearSort': clearSort,
        'setData': setData,
        'getData': getData,
        'setSortBySelector': setSortBySelector,
        'getSortBySelector': getSortBySelector,
        'getSortBy' : getSortBy,
        'sort': sort,
        'generateSortByHTML': generateSortByHTML,
        'setSortCallback': setSortCallback

    };

};
sdata.widgets.WidgetLoader.informOnLoad("tlrp");
