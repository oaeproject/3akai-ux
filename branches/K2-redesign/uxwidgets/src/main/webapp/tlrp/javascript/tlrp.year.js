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
/*global $, Config, jQuery, sakai, sdata, window */


sakai.tlrp.year = function(records, tuid) {

    //////////////////////
    // Config variables //
    //////////////////////
    
    var rootel = $("#" + tuid);
    var tlrpKeyWordBar = "tlrpTagBreadCrumbBar";
    var balloon = false;
    var breadCrumber = false;
    
    
    /////////////
    // CSS Ids //
    /////////////
    
    var tlrpYear = "tlrpYear";
    var tlrpYearID = "#" + tlrpYear;
    var tlrpYearClass = "." + tlrpYear;
    
    var tlrpYearResults = tlrpYearID + "Results";
    var tlrpYearTemplate = tlrpYear + "Template";
    var tlrpYearResultsListItems = tlrpYearResults + " ul li";
    // Balloon tip
    var tlrpArticle = "#tlrpArticle";
    var tlrpArticleNoDescription = tlrpArticle + "NoDescription";
    var tlrpArticleDescription = tlrpArticle + "Description";
    var tlrpArticleDescriptionForYear = tlrpArticleDescription + "ForYear";
    var tlrpArticleDescriptionAuthor = tlrpArticleDescription + "Author";
    var tlrpArticleDescriptionDescription = tlrpArticleDescription + "Description";
    var tlrpYearArticle = tlrpYearClass + "Article";
    var tlrpYearArticleCreator = tlrpYearArticle + "Creator";
    var tlrpYearArticleDescription = tlrpYearArticle + "Description";
    var tlrpYearTooMuchresults = tlrpYearClass + "TooMuchResults";
    var tlrpYearTooMuchResultsBalloon = tlrpYearTooMuchresults.replace('.','#') + "Balloon";
    var tlrpLeftTabYearContainer = "#tlrpLeftTabYearContainer";
    
    //////////////////////
    // Search functions //
    //////////////////////
    
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
        if (typeof item.creator !== "string") {
            item.creator = item.creator.join(', ');
        }
        return item;
    };
    
    /**
     * Does the actual search.
     * @param {string} subject The term to look for
     * @return {object[]} Will return an array that contains the year which themselves are arrays of articles.
     */
    var findItems = function(term) {
        var itemsByYear = [];
        var nrOfYears = 0;
        for (var i in records) {
            // Make sure we have the subject property
            if (records[i].hasOwnProperty('title')) {
                // If it is an array we loop over it.
                if (typeof records[i].title === "string") {
                    if (records[i].title.toUpperCase().indexOf(term.toUpperCase()) !== -1) {
                        var item = doMarkUp(records[i]);
                        var date = parseInt(item.date, 10);
                        if (date.toString() !== "NaN") {
                            // We already added this
                            if (typeof itemsByYear[date] === "undefined") {
                                itemsByYear[date] = {
                                    'year': date,
                                    'articles': []
                                };
                                nrOfYears++;
                            }
                            itemsByYear[date].articles.push(item);
                        }
                    }
                }
            }
        }
        itemsByYear.nrOfYears = nrOfYears;
        return itemsByYear;
    };
    
    
    /**
     * Main search term
     * @param {Object} term
     */
    var search = function(term) {
        // Find the actual items.
        var items = findItems(term);
        // Sort the years
        items = items.sort();
        var sorter = sakai.tlrp.sort([], tuid);
        sorter.addSort('title', 'asc');
        // Sort the items in the year arrays.
        for (var i = 0; i < items.nrOfYears; i++) {
            sorter.setData(items[i].articles);
            sorter.sort();
            items[i].articles = sorter.getData();
        }        
        
        // Add breadcrumb
        breadCrumber.clear();
        breadCrumber.add(term);
        
        // Make the window big enough.
        $(tlrpYearResults, rootel).css('width', (items.nrOfYears * 220)+ "px");
        
        var json = {
            'years': items
        };
        $(tlrpYearResults, rootel).html($.Template.render (tlrpYearTemplate, json));
        
        
        
        // Add some nice rounded corners
        $(tlrpYearResultsListItems, rootel).corners("5px");
    };
    
    ///////////////////
    // AID Functions //
    ///////////////////
    
    /**
     * This function will shorten the string str after maxChars characters and add the appendix if nescecary.
     * @param {string} str the string you wish to substring
     * @param {Number} maxChars After how many characters should the string be cut off.
     * @param {string} appendix What addendum should we append. 
     */
    var checkDoSubstring = function(str, maxChars, appendix) {
        if (str.length > maxChars) {
            str = str.substring(0, maxChars) + appendix;
        }
        return str;
    };    
    
    /**
     * Returns the breadcrumb bar
     */
    var getBreadCrumbBar = function() {
        return tlrpKeyWordBar;
    };
    
    ////////////////////////
    // Events for sliding //
    ////////////////////////
    
    var goScroll = false;
    var goScrollLeft = 0;
    var goX = 0;
    
    $(tlrpLeftTabYearContainer).mousedown(function(event) {
        $(this).data('down', true).data('x', event.clientX).data('scrollLeft', this.scrollLeft);
        
        return false;
    }).mouseup(function(event) {
        $(this).data('down', false);
    }).mousewheel(function(event, delta) {
        this.scrollLeft -= (delta * 30);
    }).css({
        'overflow': 'hidden',
        'cursor': '-moz-grab'
    });
    
    $(window).mouseout(function(event) {
        if ($(tlrpLeftTabYearContainer).data('down')) {
            try {
                if (event.originalTarget.nodeName === 'BODY' || event.originalTarget.nodeName === 'HTML') {
                    $(tlrpLeftTabYearContainer).data('down', false);
                }
            } 
            catch (e) {
            }
        }
    }).mousemove(function(event) {
        if ($(tlrpLeftTabYearContainer).data('down')) {
           $(tlrpLeftTabYearContainer).scrollLeft($(tlrpLeftTabYearContainer).data('scrollLeft') + $(tlrpLeftTabYearContainer).data('x') - event.clientX);
        }
    });

    
    //////////////////////
    // Balloon tooltips //
    //////////////////////
    
    // Articles
    $(tlrpYearResultsListItems, rootel).live('mouseover', function() {
        // Get the balloon tip
        if (!balloon) {
            balloon = $(tlrpArticleDescription, rootel).clone();
            balloon.attr('id', tlrpArticleDescriptionForYear.replace("#", ''));
            // Add it too the body.
            // We only do this once for optimalization.
            $("body").append(balloon);
        }
         // Get the creator and description
        var desc = $(tlrpYearArticleDescription, this).text();
        var creator = $(tlrpYearArticleCreator, this).text();
        if (desc === "") {
            desc = $(tlrpArticleNoDescription).text();
        }
        
        desc = checkDoSubstring(desc, 100, '...');
        creator = checkDoSubstring(creator, 100, '...');
        
        // Set it's text.
        $(tlrpArticleDescriptionAuthor, balloon).text(creator);
        $(tlrpArticleDescriptionDescription, balloon).text(desc);

        // Position the balloon correctly. The opacity is to cancel the fadeOut.
        $(balloon).css({
            'opacity': '1',
            'position': 'absolute',
            'left': $(this).offset().left + 10,
            'top': $(this).offset().top + 25,
            'margin': '0px'
        
        });
        // Maybe we are still fading the animation out. We have to stop this.
        $(balloon).stop();
        $(balloon).show();
    });
    
    /**
     * Roll out of the link. Remove the balloon tip.
     * @param {Object} e
     */
    $(tlrpYearResultsListItems, rootel).live('mouseout', function(e) {
        $(tlrpArticleDescriptionForYear).fadeOut("fast");
    });
    
    // Too much results
    $(tlrpYearTooMuchresults, rootel).live('mouseover', function() {
        // Get the balloon tip
        var balloon = $(tlrpYearTooMuchResultsBalloon);
               
        // Position the balloon correctly. The opacity is to cancel the fadeOut.
        $(balloon).css({
            'opacity': '1',
            'position': 'absolute',
            'left': $(this).offset().left + 60,
            'top': $(this).offset().top - 55,
            'margin': '0px'
        
        });
        // Maybe we are still fading the animation out. We have to stop this.
        $(balloon).stop();
        $(balloon).show();
    });
    
    /**
     * Roll out of the link. Remove the balloon tip.
     * @param {Object} e
     */
    $(tlrpYearTooMuchresults, rootel).live('mouseout', function(e) {
        $(tlrpYearTooMuchResultsBalloon, rootel).fadeOut("fast");
    });
    
    
    /////////////////////////////
    // Initialisation function //
    /////////////////////////////
    
    var doInit = function() {
        breadCrumber = new sakai.tlrp.breadcrumb(tuid + " ." + tlrpKeyWordBar, "." + tlrpKeyWordBar);
    };
    
    doInit();
    
    /////////////////////////////
    // Return public functions //
    /////////////////////////////
    
    return {
        'search': search,
        'getBreadCrumbBar': getBreadCrumbBar
    };  
};
sdata.widgets.WidgetLoader.informOnLoad("tlrp");