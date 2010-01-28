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

/*global $, Config, jQuery, json_parse, sakai, sdata, Querystring, DOMParser */

sakai.tlrp.author = function(records, tuid) {

    var alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    var rootel = "#" + tuid;
    var authors = [];
    var authorNames = [];
    var selectedLetter = "A";
     var sorter = {};
    var lastSearch;
    var displayedArticles = [];


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var tlrpKeyWordBar = "tlrpAuthorBreadCrumbBar";
    var breadCrumber = new sakai.tlrp.breadcrumb(tuid + " ." + tlrpKeyWordBar, "." + tlrpKeyWordBar);

    // Templates
    var tlrpAlphabetTemplate = "tlrpAlphabetTemplate";
    var tlrpAuthorsListTemplate = "tlrpAuthorsListTemplate";
    var tlrpArticlesTemplate = "tlrpArticleResultTemplate";

    // Containers
    var tlrpAlphabetContainer = ".tlrp_alphabetBar";
    var tlrpAuthorsList = "#tlrp_authorsList";
    var tlrpAlphabetParentContainer = ".tlrp_alphabetBarContainer";
    var tlrpArticlesParentContainer = "#tlrpAuthorArticles";
    var tlrpArticlesContainer = "#tlrpAuthorContainer";
    var tlrpLeftTabAuthorContainer = "#tlrpLeftTabAuthorContainer";

    // Buttons
    var tlrpAlphabetLetter = "tlrp_alphabetLetter";
    var tlrpAuthorIndex = "tlrp_authorIndex";

    // Classes
    var tlrpSelectedLetter = "tlrp_selectedLetterAlphabet";

    // Sorter
    var tlrpAuthorSortChk = "#tlrpAuthorSortCheckbox";
    var tlrpAuthorResultsDisplayed = "#tlrpAuthorResultsDisplayed";
    var tlrpAuthorResultsTotal = "#tlrpAuthorResultsTotal";
    var tlrpAuthorSortContainer = "#tlrpAuthorSortContainer";
    var tlrpSortChk = "#tlrpAuthorSortCheckbox";
    var tlrpAuthorResultsClearFilter = "#tlrpAuthorResultsClearFilter";


    //////////////////////
    // Output functions //
    //////////////////////

    /**
     * Gets the author index (return -1 if not added yet)
     * @param {Object} author
     * @param {Object} arr
     */
    var getAuthorIndex=function(author, arr){
        for(var i = 0; i <arr.length; i++){
            if(author === arr[i].author){
                return i;
            }
        }
        return -1;
    };

    /**
     * Add the article for 1 author
     * @param {Object} article: the article
     * @param {Object} author: the author bound to that article
     */
    var addAuthor = function(article, author){
        // get the fist letter of that author
        var letter = author.substring(0,1).toUpperCase();
        // check if there is already an array for that letter
        authors[letter] = authors[letter] || [];
        // add the author to  that letter
        var writer = author.toUpperCase();
        authors[letter][writer] = authors[letter][writer] || {articles : []};
        // add the article to the articles of that author
        authors[letter][writer].articles.push(article);
        // add the author name to a seperate array
        authorNames[letter] = authorNames[letter] || [];
        // get the author index (rturns -1 if the author isn't added yet)
        var authorIndex = getAuthorIndex(author,authorNames[letter]);
        if(authorIndex === -1){
            // add the author to the array with the first letter of his name
            // and put his article count to 1
            authorNames[letter].push({author : author, numArticles : 1});
        }
        else{
            // add 1 to the author's article count
            authorNames[letter][authorIndex].numArticles ++;
        }
    };

    /**
     * Add the author(s) article
     * @param {Object} article
     */
    var addAuthors = function(article){
        if(article.creator){

            if(typeof article.creator === "object"){
                // if there are muliple authors who wrote the article then they should each be added
                for(var i = 0; i < article.creator.length ; i++){
                    addAuthor(article, article.creator[i]);
                }
            }
            else{
                // add the author of the article
                addAuthor(article, article.creator);
            }
        }
    };

    /**
     * Sorts the authors object on alphabet
     * @param {Object} item1
     * @param {Object} item2
     */
    var upperSort =function(item1, item2){
        item1 = item1.author.toUpperCase();
        item2 = item2.author.toUpperCase();
        if(item1.author < item2.author){
            return -1;
        }
        else if(item1.author > item2.author){
            return 1;
        }
        return 0;
    };

    /**
     * show all the authors for the letter
     * @param {Object} letter
     */
    var showAuthors = function(letter){
        // change the slected letter
        selectedLetter = letter;
        // get the authors for that letter if there are none add an empty array
        authorNames[letter] = authorNames[letter] || [];
        authorNames[letter] = authorNames[letter].sort(upperSort);
        // render the authors list
        $(tlrpAuthorsList, rootel).html($.Template.render(tlrpAuthorsListTemplate, {authors : authorNames[letter], letter: letter.toLowerCase()}));
    };

    /**
     * Make a neaw search
     * @param {Object} term: the new search term
     */
    var search = function(term){

        term = term || "";
        // hide the articles container
        $(tlrpArticlesParentContainer, rootel).hide();
        // show the alphabet bar and the authors list
        $(tlrpAuthorsList + ", " + tlrpAlphabetParentContainer).show();
        // clear the breadcrumber and add the new search
        breadCrumber.clear();
        breadCrumber.add(term, function(){
            search(lastSearch);
        });
        // if the searchterm is really a new search the clear the array containing the data of the last search
        if(!lastSearch && term.toUpperCase() !== lastSearch){
            authorNames = [];
            authors = [];
            lastSearch = term = term.toUpperCase();
            // loop through all the items in the record json object
            for(var i = 0; i < records.length; i++){
                var item = records[i];
                // if the item is an array
                if(item.subject && typeof item.subject === "object"){
                    // loop through the subject array
                    for(var j = 0; j < item.subject.length ; j++){
                        // if a subject contains the searchterm
                        if(item.subject[j].toUpperCase().indexOf(term) > -1){
                            // add the author and his article
                            addAuthors(item);
                            // break the for loop
                            break;
                        }
                    }
                }
                else if(item.subject){
                    // check if the subject contains the searchterm and add the author and his article if so
                    if(item.subject.toUpperCase().indexOf(term) > -1){
                        addAuthors(item);
                    }
                }
            }
            // show the authors of the currently selected letter
            showAuthors(selectedLetter);
        }

    };

    /**
     * Show all the articles in the array
     * @param {Object} sortedArticles: array containing the articles
     */
     var showSortedArticles = function(sortedArticles) {
         // Show some numbers to the user
        $(tlrpAuthorResultsDisplayed, rootel).text(sortedArticles.length);
        $(tlrpAuthorResultsTotal, rootel).text(records.length);
        // check if grouped checkbox is checked
        var isGrouped = $(tlrpAuthorSortChk,rootel).is(":checked");
        // make the JSON-object to be rendered
        var results = {'articles' : sortedArticles, 'showBalloonTip' : true, 'sortBy' : sorter.getSortBy(), 'isGrouped' : isGrouped};
        // render the articles conatainer
        $(tlrpArticlesContainer, rootel).html($.Template.render(tlrpArticlesTemplate, results));
        $(tlrpAuthorsList + ", " + tlrpAlphabetParentContainer).hide();
        $(tlrpArticlesParentContainer, rootel).show();

        $(tlrpAuthorSortContainer, rootel).html(sorter.generateSortByHTML());
    };

    /**
     * Show all the articles of 1 author
     * @param {Object} author: the name of the author
     */
    var showArticles = function(author){
        // add the author to the breadcrumber
        breadCrumber.add(author);
        author = author.toUpperCase();
        var letter = author.substring(0,1);
        // find the author's articles in the array
        displayedArticles = authors[letter][author].articles;
        // set the data for the sorter
        sorter.setData(displayedArticles);
        // show the articles
        showSortedArticles(displayedArticles);
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /** Bind all the letters in the alphabet*/
    $(tlrpAlphabetContainer + " li a", rootel).live("click", function(e){
        // get the letter cliked on
        $("." + tlrpSelectedLetter, rootel).removeClass(tlrpSelectedLetter);
        $("#" + e.target.id, rootel).addClass(tlrpSelectedLetter);
        var index = parseInt(e.target.id.replace(tlrpAlphabetLetter, ""),10);
        // show the authors for that letter
        showAuthors(alphabet[index]);
    });
    /** Bind all the authors click events*/
    $(tlrpAuthorsList + " li a", rootel).live("click", function(e){
        var index = parseInt(e.target.id.replace(tlrpAuthorIndex, ""),10);
        var author = authorNames[selectedLetter][index].author;
        // show the articles of that author
        showArticles(author);
    });
    /** Bind the sort checkbox */
    $(tlrpSortChk, rootel).bind('click', function() {
        sorter.sort();
    });
    /**
     * Removes all the sorting options.
     */
    $(tlrpAuthorResultsClearFilter, rootel).live('click', function() {
        // Remove the grouping
        $(tlrpSortChk, rootel).attr('checked', '');
        // Reset the sorting
        sorter.clearSort();
        sorter.addSort("creator", "asc");
        // The sorter will call the showArticles method for us.
        sorter.sort();
    });


    //////////////////////////////
    // Initialization functions //
    //////////////////////////////

    /**
     * Initialize the author search page
     */
    var doInit = function(){
        // render the alphabet bar
        $(tlrpAlphabetContainer, rootel).html($.Template.render(tlrpAlphabetTemplate, {alphabet : alphabet}));
        // select the first letter
        $("#" + tlrpAlphabetLetter + "0", rootel).addClass(tlrpSelectedLetter);
        // initialize the sorter
        sorter = sakai.tlrp.sort(displayedArticles, "#" + tuid +  " " + tlrpLeftTabAuthorContainer);
        sorter.setSortBySelector(tlrpAuthorSortContainer);
        sorter.setSortCallback(showSortedArticles);
        sorter.addSort('creator', 'asc');
    };
    doInit();



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
        search:search,
        getBreadCrumbBar : getBreadCrumbBar
    };
};
sdata.widgets.WidgetLoader.informOnLoad("tlrp");