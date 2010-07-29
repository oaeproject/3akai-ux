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

/*global $, Config, sdata, Querystring, DOMParser, RND, window */

var sakai = sakai || {};

/**
 * @name sakai.quiz
 *
 * @class quiz
 *
 * @description
 * Initialize the quiz widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.quiz = function(tuid, showSettings) {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var json = false;             // Variable used to recieve information by json
    var rootel ="#" + tuid;     // the main div id used by the widget
    var questions = [];
    var currentQuestion = {};
    var selectedItem = {};
    var quizes = [];
    var questionOrder = [];
    var jsonAnswers = {};
    var timerMinutes = {};
    var timerRunning = false;
    var timerID = null;
    var selection = {
        "selections": []
    };
    var selectedTag = -1;
    var lastSelection = null;
    var setOverviewScreen = false;

    // Main ids
    var quizId = "#quiz";
    var quizClass= ".quiz";
    var quizName= "quiz";

    // Containers
    var quizOutput = quizId + "_mainContainer";
    var quizSettings = quizId + "_settings";
    var quizResultGraphContainer = quizId + "_resultGraph";
    var quizSolveQuestionContainer = quizId + "_solveQuestion";
    var quizOverviewAnswersListContainer = quizId + "_overviewAnswersListContainer";
    var quizOverviewAnswersList = quizId + "_overviewAnswersList";
    var quizShowPoints = quizId + "_showPoints";
    var quizCheckAnswer = quizClass + "_checkAnswer";
    var quizCheckAnswerNoDot = quizName + "_checkAnswer";
    var quizDragTag = quizClass +  "_dragTag";
    var quizSolveQuestion = quizId + "_solveQuestion";
    var quizAnswerPopup = quizId + "_answerPopup";
    var quizStartQuiz = quizId + "_startQuiz";
    var quizQuizContainer = quizId + "_quizContainer";
    var quizExistingQuestions = quizId + "_existingQuizQuestions";
    var quizChangeQuestion = quizClass + "_changeQuestion";
    var quizChangeQuestionNoDot = quizName + "_changeQuestion";
    var quizSettingsImgTagger = quizId + "_settings_imgTagger";
    var quizAnswerTypeContainers = quizId +  "_answerTypeContainers";
    var quizImagePreview = quizId + "_URLimgPreview";
    var quizMulipleAnswersListName = quizName + "_MultipleAnswersList";
    var quizTabContainer = quizName + "_tabContainer";
    var quizInsertUrlImg = quizId + "_insertURLImg";
    var quizAdvancedSettingsContainer = quizId +  "_advancedSettings";

    // Templates
    var quizResultGraphTemplate = quizName + "_resultGraphTemplate";
    var quizOverviewAnswersListTemplate = quizName + "_overviewAnswersListTemplate";
    var quizSolveQuestionTemplate = quizName + "_solveQuestionTemplate";
    var quizPopupTemplate = quizName + "_popupTemplate";
    var quizQuizTemplate = quizName + "_quizTemplate";

    // Textboxes
    var quizTitleTxt = quizId + "_txtTitle";
    var quizRandomQuestionTxt = quizId + "_txtNumRandomQ";
    var quizTimeLimitTxt = quizId + "_txtTime";
    var quizAnswerTxt = quizId + "_answer";
    var quizAnswerTxtName = quizName + "_answer";
    var quizTxtQuestion = quizId + "_txtQuestion";
    var quizNormalAnserTxt  = quizId + "_NormalAnswertxtAnswer";
    var quizImageTxtUrl = quizId + "_txtImgURL";

    // Radiobuttons
    var quizRandomQuestionRbt = quizName + "_randomQuestionSetting";
    var quizDisplayQuestionRbt = quizName + "_displaySetting";
    var quizAnswerTypeRbt = quizName + "_answerType";
    var quizAnswerTypeMultiple = quizName + "_MultipleAnswersRbt";
    var quizAnswerTypeImageTagger = quizName + "_imgTagger";
    var quizAnswerTypeNormal = quizName + "_NormalAnswerRbt";
    var quizChooseAnswer = quizName + "_chooseAnswer";
    var quizAskRndNumQuestion = quizName + "_askNumQsetting";

    // Checkboxes
    var quizShowAnswerChk = quizId + "_showAnswersSetting";
    var quizTimeLimitChk = quizId + "_timeLimitSetting";

    // Resulttypes
    var quizResultTypes = quizId + "_resulttype_";
    var quizResultTypesName = quizName + "_resulttype_";
    var quizResultActive = quizClass + "_resulttype_active";
    var quizResultType = quizId + "_resulttype";
    var quizResultTypeName = quizName + "_resulttype";

    // Image lists
    var quizImageListSiteName = quizId + "_imgSelectSite span";

    // Buttons
    var quizShowResults = quizId + "_showResults";
    var quizStartQuizBtn = quizId + "_startQuizBtn";
    var quizInsertQuestion = quizClass + "_insertQuestion";
    var quizBackToOverview = quizId + "_backToOverview";
    var quizBackPage = quizId + "_backPage";
    var quizSubmitWidget = quizId + "_submitWidget";
    var quizNextPage = quizId + "_nextPage";
    var quizInsertTagQ = quizId + "_insertTagQuestion";
    var quizSaveImgTagger = quizId + "_saveImgTagger";
    var quizSaveImageTagger = quizId + "_saveImgTagger";
    var quizQOverviewName = quizName + "_Qoverview";
    var quizInsertQName = quizName + "_InsertQ";
    var quizImgTaggerName = quizName + "_imgTagger";
    var quizImgTagger2Name = quizName + "_imgTagger2";
    var quizSelectQ = quizName + "_selectQ";
    var quizAddAnswerToMultipleAnwers = quizId + "_addAnswerToMultipleAnswers";
    var quizAddQuestion = quizClass + "_addQuestion";
    var quizImgTab = quizClass + "_imgTab";
    var quizImgTabName = quizName + "_imgTab";
    var quizShowInfo = quizId + "_showInfo";
    var quizInfo = quizId + "_info";
    var quizAdvancedSettings = quizId + "_btnadvancedSettings";
    var quizAdvancedSettingsUp = quizId + "_toggle_advanced_settings_up";
    var quizAdvancedSettingsDown = quizId + "_toggle_advanced_settings_down";
    var quizRandomQuestionSetting = quizName + "_randomQuestionSetting";
    var quizNextQuestion = quizClass + "_nextQuestion";
    var quizBackToQuiz= quizId + "_backToQuiz";

    // Existing questions
    var quizExistingQuizListItem = quizClass + "_existingQuizListItem";
    var quizExistingQuizListItemNoDot = quizName + "_existingQuizListItem";
    var quizExistingQuizListTemplate = quizName + "_ExistingQuizListTemplate";
    var quizSelectedItem = quizName + "_selectedItem";
    var quizExistingQuestionsTemplate = quizName + "_existingQuizQuestionsTemplate";
    var quizExistingQuizList = quizId + "_existingQuizList";

    // Muliple answer, settings
    var quizMulipleAnswerListContainer = quizId + "_MultipleAnswersListContainer";
    var quizMulipleAnswerList = "ul" + quizId + "_MultipleAnswersList li";
    var quizMulipleAnswerListTemplate = quizName + "_MultipleAnswersListContainerTemplate";
    var quizMulipleAnswersListItem = quizClass + "_MultipleAnswersListItem";
    var quizMulipleAnswersListItemName = quizName + "_MultipleAnswersListItem";
    var quizMulipleAnswersList = quizId + "_MultipleAnswersList";

    //Tabs
    var quizSelectedTab = quizName + "_selectedtab";
    var quizTab = quizName + "_tab";
    var quizTabs = quizClass + "_tabs";
    var quizQTab = quizName + "_qtab";
    var quizMainTabContainer = quizName + "_maintabContainer";

    // image tagger
    var quizImgTagCloseName = quizName + "_imgTagClose";
    var quizImgTag = quizId + "_imgTag";
    var quizTagImg = quizId + "_tagImg";
    var quizBackImgTagName = quizName + "_back_imgTag";
    var quizImgTagPreviewContainer = quizId + "_tagImgPreviewContainer";
    var quizImgTagContainer = quizId + "_imgTagContainer";
    var quizTagImgInfo = quizId + "_tagImgInfo";
    var quizTxtTag = quizId + "_txtTag";
    var quizSettingsImgTaggerTemplate = quizName + "_settings_imgTagger_template";
    var quizAddTag = quizId + "_addTag";
    var quizImgTagQuestion = quizClass + "_imgTagQuestion";

    // Overview questions
    var quizListOverview = quizId + "_lstOverviewQ";
    var quizListOverviewTemplate = quizName + "_lstOverviewQTemplate";

    // textboxes and buttons on Overview questions
    var quizEditQuestion = quizClass + "_editQtxt";
    var quizEditQuestionName = quizName + "_editQtxt";
    var quizEditAnswer = quizClass + "_editAtxt";
    var quizEditAnswerName = quizName + "_editAtxt";
    var quizEditQBtn = quizClass + "_editQbtn";
    var quizRemoveQBtn = quizClass + "_removeQbtn";
    var quizEditQBtnName = quizName + "_editQbtn";
    var quizRemoveQBtnName = quizName + "_removeQbtn";
    var quizViewAnswers = quizName + "_viewAnswers";
    var quizEditAnswerBtn = quizName + "_editAbtn";
    var quizRemoveAnswerBtn = quizName + "_removeAbtn";

    ////////////////////////
    // Utility  functions //
    ////////////////////////

    /**
     * Generates a 32-char key for rijndael encryption/decryption
     * @param {Object} tempTuid
     */
    var genKeyFromTuid = function(tempTuid) {
        var key = tempTuid.replace("id", "");
        while (1) {
            key += key;
            if (key.length > 31) {
                return RND().hexToByteArray(key.substring(0, 32));
            }
        }
    };

    /**
     * decrypts a value
     * @param {Object} encrypted
     * @param {Object} id
     */
    var decrypt = function(encrypted, id) {
        return RND().byteArrayToString(RND().rijndaelDecrypt(RND().hexToByteArray(encrypted), genKeyFromTuid(id), 'ECB'));
    };
    /**
     * encrypts a value
     * @param {Object} decrypted
     * @param {Object} id
     */
    var encrypt = function(decrypted, id) {
        return RND().byteArrayToHex(RND().rijndaelEncrypt(decrypted, genKeyFromTuid(id), 'ECB'));
    };

    /**
     * Clones an object
     * @param {Object} object
     */
    var cloneObject = function(object) {
        return $.extend(true, {}, object);
    };

    /**
     * Returns an array with random and unique numbers
     * @param {Object} max: the max number
     * @param {Object} numItems: number of random numbers needed
     */
    var getRandomNumArray = function(max, numItems) {
           // The max-value shouldn't be smaller then the number of items expected
        if (max < numItems) {
            return null;
        }
        var randomNums = [];
        var i = 0;
        while (true) {
            // get a random number
            var random = Math.floor(Math.random() * (max + 1));
            // check if items is already in numer
            if (!randomNums.contains(random)) {
                // adds the random number to the array
                randomNums.push(random);
                i++;
            }
            // if numitems is correct size return the array
            if (i >= numItems) {
                 return randomNums;
            }
        }
        return null;
    };

    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * Renders the result html for all users
     */

    var renderResultHtml = function() {
        json.titles = [];
        json.values = [];
        json.procValues = [];
        json.colors = [];
        // gets the number of answers per question
        for (var i = 0; i < json.results.length; i++) {
            for (var j = 0; j < json.results[i].questions.length; j++) {
                json.titles[j] = json.questions[j].question;

                if (!json.values[j]) {
                    json.values[j] = 0;
                }
                if (json.results[i].questions[j].correct) {
                    json.values[j] += 1;
                }
            }
        }
        // make a procentual value of those values
        for (i = 0; i < json.values.length; i++) {
            json.procValues.push(Math.round(json.values[i] / json.results.length * 100));
        }
        json.colors =  ["663300","e07000","0070e0","660000","990080","c4fc95","c4e3fc","79c365","5ba940","f5f4bf","f1eca1","c3e2fc","f2eda2","8ad769","ac9d7d","79ccff","00a4e4","ac9c7d","9f8c60","abe652","f6b5b5","cd9c9c","ad8181","ee5858","ce1616"];
        // make the google graph url
        if (json.resultDisplay === "bhs") {
            json.axis = "&chxt=y&chxl=0:|";
        }
        else {
            json.axis = '&chl=';
        }
        // join all the values and colors in a string
        json.values = json.values.join("|");
        json.colorsJoined = json.colors.join("|");
        // render the results
        $(quizResultGraphContainer, rootel).html($.TemplateRenderer(quizResultGraphTemplate, json));
        $(quizResultGraphContainer, rootel).show();

    };

    /**
     * Gets the decrypted answers(s) of a question
     * @param {Object} question
     */
    var getTrueResults = function(question) {
        // check which type of answer it is
        if (question.answerType === quizAnswerTypeNormal) {
            // decrypt the answer
            return decrypt(question.answer, tuid);
        }
        else if (question.answerType === quizAnswerTypeMultiple) {
            // put the answer(s) in an array
            var answers = [];
            for (var i = 0; i < question.answer.correctAnswer.length; i++) {
                var index = parseInt(decrypt(question.answer.correctAnswer[i], tuid), 10);
                answers.push(question.answer.answers[index].value);
            }
            return answers;
        }
    };

    /**
     * Adds the user result to the suplied json object and saves it to JCR
     * @param {Object} jsonTemp: the JSONobject to which the results should be updated
     */
    var addUserResultToResults= function(jsonTemp){
        // Then start making the JSON-object
        // Add your score
        var result = {
            "points": json.points + "/" + questionOrder.length
        };
        result.questions = [];
        // loop through all the solved questions
        for (var i = 0; i < questionOrder.length; i++) {
            if (jsonAnswers.questions.length <= i) {
                result.questions.push({
                    'question': json.questions[questionOrder[i]].question,
                    'correct': false
                });
                jsonAnswers.questions.push({
                    'question': json.questions[questionOrder[i]].question,
                    'answered': "",
                    'correct': false
                });
            }
             else {
                result.questions.push({
                    'question': jsonAnswers.questions[i].question,
                    'correct': jsonAnswers.questions[i].correct
                });
            }

        }
        // add the result to the questions
        jsonTemp.results.push(result);

        // Save the JSON-object
        json = jsonTemp;
        sakai.api.Widgets.saveWidgetData(tuid, jsonTemp, renderResultHtml);

    };

    /**
     * retrieves the newest data and adds the result of the quiz to results
     */
    var addUserResult = function() {
        // First update the results in case someone solved the quiz while you were taking it

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
            if (success) {
                addUserResultToResults(data);
            } else {
                json = {};
            }
        });
    };


    /**
     * Stop the timer
     */
    var StopTheClock = function() {
        if (timerRunning) {
            clearTimeout(timerID);
        }
        timerRunning = false;
    };


    /**
     * Renders the table at the end of the quiz containing answers
     * @param {Object} selectedIndex
     */
    var renderResultTable = function(selectedIndex) {
        // hide the last question
        $(quizSolveQuestionContainer,rootel).hide();
        jsonAnswers.selectedQuestion = selectedIndex;
        jsonAnswers.showAnswers = json.showAnswers;
        // put the points in a string
        jsonAnswers.points = json.points + "/" + questionOrder.length;
        // show the ansers in a list
        $(quizOverviewAnswersListContainer, rootel).html($.TemplateRenderer(quizOverviewAnswersListTemplate, jsonAnswers));
        renderResultHtml();
        $(quizOverviewAnswersList, rootel).show();
        $(quizShowPoints,rootel).show();
        // bind the buttons to check the correct answers and ansered answers
        $(quizCheckAnswer, rootel).bind("click",
        function(e, ui) {
            var index = e.target.id.replace(quizCheckAnswerNoDot, "");
            if (selectedIndex !== index) {
                jsonAnswers.selectedAnswers = getTrueResults(json.questions[questionOrder[index]]);
                renderResultTable(index);
            }
            else {
                renderResultTable( - 1);
            }
        });


    };


     /**
     * returns a boolean representing if the question is correct
     * @param {Object} question
     */
    var checkIfQuestionIsCorrect = function(question) {
        if (question === null) {
            return null;
        }
        // If the question expects a normal answer
        if (question.answerType === quizAnswerTypeNormal) {
            // decrypt the correct answer and check if it is correct
            var correct =  (decrypt(question.answer, tuid).toUpperCase() === $.trim($(quizAnswerTxt).val()).toUpperCase());
             return {
                "isCorrect": correct,
                "answered": $.trim($(quizAnswerTxt).val()),
                "answer": decrypt(question.answer, tuid)
            };
        }
        // if the answer type is multiple choice
        else if (question.answerType === quizAnswerTypeMultiple) {
            // if there is more then 1 answer
            if (question.answer.correctAnswer.length > 1) {
                var answerString = "";
                // Put all the correct answers in a string (comma seperated)
                for (var i = 0; i < question.answer.correctAnswer.length; i++) {
                    var index = parseInt(decrypt(question.answer.correctAnswer[i], tuid), 10);
                    answerString += question.answer.answers[index].value + ", ";
                }
                // if the number of answers doesn't match the anser isn't correct
                if ($("input[name=" + quizChooseAnswer + "]:checked", rootel).length !== question.answer.correctAnswer.length) {
                    return {
                        "isCorrect": false,
                        "answered": $("input[name=" + quizChooseAnswer + "]:checked", rootel).length,
                        "answer": answerString
                    };
                }
                // Loops through all the ansers checked by the user
                for (i = 0; i < $("input[name=" + quizChooseAnswer + "]:checked", rootel).length; i++) {
                    // get the index of the answer
                    var answerIndex = parseInt($("input[name=" + quizChooseAnswer + "]:checked", rootel)[i].value.replace(quizAnswerTxtName, ""), 10);
                    // compare it width the correct answer
                    // if 1 doesn't match then the anser is not correct
                    if (parseInt(decrypt(question.answer.correctAnswer[i], tuid), 10) !== answerIndex) {
                        return {
                            "isCorrect": false,
                            "answered": $("input[name=" + quizChooseAnswer + "]:checked", rootel).length,
                            "answer": answerString
                        };
                    }
                }
                // if all the aswers matched then the answer is correct
                return {
                    "isCorrect": true,
                    "answered": $("input[name=" + quizChooseAnswer + "]:checked", rootel).length,
                    "answer": answerString
                };
            }
            // if there is only one answer
            else {
                // get the answer index
                answerIndex = parseInt($("input[name=" + quizChooseAnswer + "]:checked", rootel).val().replace(quizAnswerTxtName, ""), 10);
                // compare it width the correct answer
                if (parseInt(decrypt(question.answer.correctAnswer[0], tuid), 10) === answerIndex) {
                    return {
                        "isCorrect": true,
                        "answer": "",
                        "answered": question.answer.answers[answerIndex].value
                    };
                }

                answerString = question.answer.answers[parseInt(decrypt(question.answer.correctAnswer[0], tuid), 10)].value;
                return {
                    "isCorrect": false,
                    "answer": answerString,
                    "answered": question.answer.answers[answerIndex].value
                };
            }

        }
        // if the question is an image-tagger question
        else if (question.answerType === quizAnswerTypeImageTagger) {
            var tagsOK = 0;
            // loop through all the tags
            for (i = 0; i < $(quizDragTag, rootel).length; i++) {
                var tag = $(quizDragTag + ":eq(" + i + ")", rootel);
                // check the tags position and comare this with the correct position
                var isXOK = ((tag.position().left + tag.width()) > question.answer.answers[i].x1 && (tag.position().left + tag.width()) < question.answer.answers[i].x2);
                var isYOK = ((tag.position().top + tag.height()) > question.answer.answers[i].y1 && (tag.position().top + tag.height()) < question.answer.answers[i].y2);
               // if it falls within the boundaries then the question is correct
                if (isXOK && isYOK) {
                    tagsOK++;
                    if (tagsOK === question.answer.answers.length) {
                        return {
                            "isCorrect": true,
                            "answer": "",
                            "answered": tagsOK
                        };
                    }
                }
            }
            return {
                "isCorrect": false,
                "answer": "",
                "answered": tagsOK
            };
        }
        return {};
    };

     /**
     * Shows a question by its index
     * @param {Object} index
     */
    var renderQuestion = function(index) {
        // check if it's the last question
        json.questions[questionOrder[index]].isLastQuestion = false;
        if (questionOrder.length <= index + 1) {
            json.questions[questionOrder[index]].isLastQuestion = true;
        }
        // check how many answers there are
        if (json.questions[questionOrder[index]].answerType === quizAnswerTypeMultiple) {
            json.questions[questionOrder[index]].answerCount = json.questions[questionOrder[index]].answer.correctAnswer.length;
        }
        json.questions[questionOrder[index]].index = index;
        // render the question
        $(quizSolveQuestionContainer, rootel).html($.TemplateRenderer(quizSolveQuestionTemplate, json.questions[questionOrder[index]]));
        $(quizShowPoints).hide();
        $(quizSolveQuestion, rootel).show();
        // bind the show results button
        $(quizShowResults, rootel).bind("click",
        function(e, ui) {
            renderResultTable( - 1);
        });
        $(quizDragTag).Draggable({
            handle: 'div'

        });

    };


     /**
     * Show a popup with the correct answer
     * @param {String} correction, the correct answer
     * @param {int} index of the next question
     * @param {Boolean} true if the popup is shown because the user is out of time
     */
    var showPopup = function(correction, index, isTimedOut) {
        var popup = {};
        // show a regular popup
        popup = {
            "isTimedOut": isTimedOut,
            "IsCorrect": correction.isCorrect,
            "ShowAnswer": json.showAnswers,
            "answer": correction.answer
        };
        $(quizAnswerPopup, rootel).html($.TemplateRenderer(quizPopupTemplate, popup));
        $(quizAnswerPopup, rootel).show();
        // bind the popup click event
        // goes to the results page if this is the last question or if timedout
        //
        $(quizAnswerPopup, rootel).bind("click",
        function(e, ui) {
            // hide the popup
            $(quizAnswerPopup, rootel).hide();
            // check if the index of the next question is valid and if it's not timed out
            if (index !== -1 && !isTimedOut) {
                // show the next question
                renderQuestion(index);
            }
            // last question or timed out
            else {
                // show the results
                addUserResult();
                renderResultTable( - 1);
            }
        });
    };

     /**
     * bound to next question button
     * @param {Object} e
     * @param {Object} ui
     */
    var nextQuestionHandler = function(e, ui) {
        // get the index of the next question
        var index = parseInt(e.target.id.replace("quiz_nextQuestion", ""), 10) + 1;
        // check if the current question is correct
        var correction = checkIfQuestionIsCorrect(json.questions[questionOrder[index - 1]]);
        var questionTemp = cloneObject(json.questions[questionOrder[index - 1]]);
        // put correction in cloned question object
        questionTemp.correct = correction.isCorrect;
        questionTemp.answered = correction.answered;

        jsonAnswers.questions.push(questionTemp);
        // add points if the question was correct
        if (questionTemp.correct) {
            json.points += 1;
        }
        // show the popup where this question is the last one
        if (index === questionOrder.length) {
            showPopup(correction, -1, false);
            StopTheClock();
        }
        // show a regular popup
        else {
            showPopup(correction, index, false);
        }

    };

    /**
     * Start the timer
     * call this function every minute
     */
    var StartTheTimer = function() {
        // stop the lcok if time's up
        if (timerMinutes === 0) {
            StopTheClock();
            // show the popup notifying the user that his time's up
            showPopup(null, -1, true);
        }
        else {
            timerMinutes = timerMinutes - 1;
            timerRunning = true;
            timerID = window.setTimeout(StartTheTimer, 60000);
        }
    };

    /**
     * Initializes and starts a time
     * @param {Object} minutes
     */
    var InitializeTimer = function(minutes) {
        timerMinutes = minutes;
        StopTheClock();
        StartTheTimer();
    };

    /**
     * Shows the first question
     * @param {Object} response
     */
    var showQuestions = function() {
        // show the start quiz screen
        $(quizStartQuiz, rootel).show();
        // the questionOrder array is there for the option to ask a number of random questions
        questionOrder = [];
        // if the user selected the random questions option
        if (json.randomQrbt === quizAskRndNumQuestion) {
            // fill the array with random numbers which represent the questions indexes
            questionOrder = getRandomNumArray(json.questions.length - 1, json.numQuestions);
        }
        // if the user hasn"t checked the random question opion
        else {
            // fill the array with the indexes of all the questions
            for (var i = 0; i < json.questions.length; i++) {
                questionOrder.push(i);
            }
        }
        // empty the answer array
        jsonAnswers.questions = [];
        // check if the firt question isn"t also the last
        json.questions[questionOrder[0]].isLastQuestion = false;
        if (questionOrder.length <= 1) {
            json.questions[questionOrder[0]].isLastQuestion = true;
        }
        // put the points to 0
        json.points = 0;
        // render the start quiz screen
        $(quizQuizContainer, rootel).html($.TemplateRenderer(quizQuizTemplate, json));
        $(quizQuizContainer, rootel).show();

        // bind the start quiz button
        $(quizStartQuizBtn, rootel).bind("click",
        function(e, ui) {
            $(quizStartQuiz, rootel).hide();
            // if the user checked the timer option start the timer
            if (json.isTimeLimit) {
                InitializeTimer(json.timeLimit);
            }
            // render the first question
            renderQuestion(0);

        });

    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * Closes the settings popup
     */
    var finishNewSettings = function() {
        sakai.api.Widgets.Container.informFinish(tuid, "quiz");
    };

    /**
     * Loads the quiz-widget settings
     * @param {Object} exists: does the quiz already exist or is it a new one
     * @param {Object} quiz: the quiz data
     */
    var loadQuizSettings = function(exists, quiz) {
        $(quizOutput, rootel).hide();
        $(quizSettings, rootel).show();
        // if the quiz already exists fill in the data
        if (exists) {
            // add the questions
            questions = quiz.questions;
            // add the title
            $(quizTitleTxt, rootel).val(quiz.title);
            // change the radiobuttons
            $("input[name=" + quizRandomQuestionRbt + "][value=" + quiz.randomQrbt + "]", rootel).attr("checked", true);
            $(quizRandomQuestionTxt, rootel).val(quiz.numQuestions);
            $("input[name=" + quizDisplayQuestionRbt + "][value=" + quiz.resultsViewers + "]", rootel).attr("checked", true);
            // change the result display
            $(quizResultTypes + quiz.resultDisplay, rootel).addClass(quizResultActive.replace(".",""));
            $(quizShowAnswerChk, rootel).attr("checked", quiz.showAnswers);
            $(quizTimeLimitChk, rootel).attr("checked", quiz.isTimeLimit);
            if (quiz.isTimeLimit) {
                $(quizTimeLimitTxt, rootel).val(quiz.timeLimit);
            }
        }
        // put the site name on above the image-list
        $(quizImageListSiteName, rootel).html(sakai.api.Security.saneHTML(sakai.site.currentsite.name));
    };

    /**
     * Loads 1 question of a selected quiz in the existing quizes (settings mode)
     * @param {Object} question, the selected question
     * @param {Object} questionsTemp, a copy of the selected question
     * @param {Object} existingTuid, the tuid of the widget containinmg the existing question
     */
    var loadExistingQuizQuestion = function(question, questionsTemp, existingTuid) {
        // check the answer type and decrypt with the widget id of the widget conatining the question
        if (question.answerType === quizAnswerTypeNormal) {
            question.correctAnswer = decrypt(question.answer, existingTuid);
        }
        // get the prevIndex (for the prev button)
        question.Previndex = (question.index - 1);
        if (question.Previndex < 0) {
            question.Previndex = questionsTemp.length - 1;
        }
        // get the next index (for the next button)
        question.Nextindex = (question.index + 1) % (questionsTemp.length);
        // render the existing question list
        $(quizExistingQuestions, rootel).html($.TemplateRenderer(quizExistingQuestionsTemplate, question));
        $(quizExistingQuestions, rootel).show();
        // bind the next and previous buttons
        $(quizChangeQuestion).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace(quizChangeQuestionNoDot, ""), 10);
            loadExistingQuizQuestion(questionsTemp[index], questionsTemp, existingTuid);
        });
        // bind the insert question button
        $(quizInsertQuestion).bind("click",
        function(e, ui) {
            // clone the question object
            var questionTemp = cloneObject(question);
            // encrypt the answer with the widget id of this widget
            if (question.answerType === quizAnswerTypeNormal) {
                questionTemp.answer = encrypt(questionTemp.correctAnswer, tuid);
            }
            // decrypt and encrypt every answer with the new widget id
            else {
                for (var i = 0; i < questionTemp.answer.correctAnswer.length; i++) {
                    var tempAnswer = decrypt(questionTemp.answer.correctAnswer[i], existingTuid);
                    questionTemp.answer.correctAnswer[i] = encrypt(tempAnswer, tuid);
                }
            }
            // add the question to the quiz
            questionTemp.index = questions.length;
            questions.push(questionTemp);
        });

    };


    /**
     * Loads the existing quizes in the existing quizes-settings tab
     * @param {Object} exists
     * @param {Object} quizes
     */
    var loadExistingQuizes = function(exists, quizes) {
        if (!exists) {
            quizes = [];
        }
        var existingQuizList = {
            "items": quizes
        };
        // render the existing quizes list
        $(quizExistingQuizList, rootel).html($.TemplateRenderer(quizExistingQuizListTemplate, existingQuizList));

        $(quizExistingQuizList, rootel).show();

        // bind each quiz item
        $(quizExistingQuizListItem, rootel).bind("click",
        function(e, ui) {
            // get the index of the quiz
            var index = parseInt(e.target.id.replace(quizExistingQuizListItemNoDot, ""), 10);
            $(quizExistingQuizListItem, rootel).removeClass(quizSelectedItem);
            // set the selected quiz to the selected class
            $("#" + e.target.id, rootel).addClass(quizSelectedItem);
            // load the first question of that quiz
            loadExistingQuizQuestion(quizes[index].questions[0], quizes[index].questions, quizes[index].tuid);
        });
    };

    /**
     * add a quiz widget
     * @param {Object} quiz
     */
    var addQuiz = function(quiz) {
        // Save the quiz to the widget-node
        sakai.api.Widgets.saveWidgetData(tuid, quiz, finishNewSettings);
        // put the most important info in a new JSON-object
        var quizTemp = {
            "questions": quiz.questions,
            "title": quiz.title,
            "index": quizes.length,
            "tuid": tuid
        };
        quizes.push(quizTemp);
        // save that JSON object to the _quiz node in the site-node
        // this contains all quizes created in the site
        var tostring2 = $.toJSON(quizes);
        //sakai.api.Widgets.saveWidgetData("_quiz", tostring2, tuid, placement, finishNewSettings);
    };

    /**
     * renders the answers array and bind remove listitem button
     */
    var renderListItems = function() {
        var question = {};
        question.answers = currentQuestion.answers;
        $(quizMulipleAnswerListContainer, rootel).html($.TemplateRenderer(quizMulipleAnswerListTemplate, question));
        $(quizMulipleAnswerListContainer, rootel).show();

    };

    /**
     * add a textbox to the muliple answers Container
     * @param {String} listID
     * @param {String} input
     */
    var addAnswerToList = function(listID, input, num) {
        // first save all the values that are in the textboxes so these don"t dissappear while rerendering
        for (var i = 0; i < $(quizMulipleAnswerList, rootel).size() && i < currentQuestion.answers.length; i++) {
            currentQuestion.answers[i] = {
                "index": i,
                "value": ($(quizMulipleAnswerList + ":eq(" + i + ") input[type=text]", rootel).val())
            };
        }
        // add the new answer
        for (i = 0; i < num; i++) {
            currentQuestion.answers.push({
                "index": currentQuestion.answers.length,
                "value": ""
            });
        }
        // render the list-items
        renderListItems();
    };



    /**
     * returns the quiz-settings object
     */
    var getQuizSettingsObject = function() {
        // fill the quiz-object with the inserted questions
        var quiz = {
            "questions": questions
        };
        // set the title and other properties
        quiz.title = $(quizTitleTxt, rootel).val();
        quiz.numQuestions = questions.length;
        quiz.randomQrbt = $("input[name=" + quizRandomQuestionRbt + "]:checked", rootel).val();
        if (quiz.randomQrbt === quizAskRndNumQuestion) {
            quiz.numQuestions = parseInt($(quizRandomQuestionTxt, rootel).val(), 10);
        }
        quiz.resultsViewers = $("input[name=" + quizDisplayQuestionRbt +"]:checked", rootel).val();
        quiz.resultDisplay = $(quizResultActive, rootel).attr("id").replace(quizResultTypesName, "");
        quiz.showAnswers = $(quizShowAnswerChk, rootel).attr("checked");
        quiz.isTimeLimit = $(quizTimeLimitChk, rootel).attr("checked");
        quiz.timeLimit = parseInt($(quizTimeLimitTxt, rootel).val(), 10);
        // make the results array
        // this will contain all the answers of the people who took the quiz
        if (!$.isArray(json.results)) {
            quiz.results = [];
        }
        else {
            quiz.results = json.results;
        }
        return quiz;
    };

    /**
     * returns an imagetagger question-object
     */
    var getImgTaggerAnswerQuestionObject = function() {

        var answer = {
            "answers": []
        };
        var index = 0;
        // add each answer to the answers array
        for (var i = 0; i < selection.selections.length; i++) {
            // filter the null selections out of the array
            if (selection.selections[i] !== null) {
                index++;
                selection.selections[i].index = index;
                answer.answers.push(selection.selections[i]);
            }
        }
        return answer;
    };

    /**
     * returns the MulipleAnswersSettingsObject
     */
    var getMulipleAnswersSettingsObject = function() {

        var answer = {
            "answers": []
        };
        answer.correctAnswer = [];
        // put each answer in the answers aray
        for (var i = 0; i < $(quizMulipleAnswerList, rootel).size(); i++) {
            answer.answers.push({
                "index": i,
                "value": $(quizMulipleAnswerList + ":eq(" + i + ") input[type=text]", rootel).val()
            });
            // encrypt the correct answer's index
            if ($(quizMulipleAnswerList + ":eq(" + i + ") input[type=checkbox]", rootel).attr("checked")) {
                answer.correctAnswer.push(encrypt(i + "", tuid));
            }
        }
        return answer;
    };

    /**
     * returns a question object
     */
    var getQuestionObject = function() {
        // check if an question type is checked
        if (!$("input[name=" + quizAnswerTypeRbt + "]:checked").val()) {
            return null;
        }
        // check witch type of anser is expected
        var selectedValue = $("input[name=" + quizAnswerTypeRbt + "]:checked", rootel).val();
        if ($( quizSettingsImgTagger + ":visible", rootel).is(":visible")) {
            selectedValue = quizAnswerTypeImageTagger;
        }
        var question = {
            "question": $(quizTxtQuestion, rootel).val(),
            "answerType": selectedValue
        };
        // get the question object depending on the answer type
        if (selectedValue === quizAnswerTypeMultiple) {
            question.answer = getMulipleAnswersSettingsObject();
        }
        else if (selectedValue === quizAnswerTypeNormal) {
            question.answer = encrypt($(quizNormalAnserTxt, rootel).val(), tuid);
        }
        else if (selectedValue === quizAnswerTypeImageTagger) {
            question.answer = getImgTaggerAnswerQuestionObject();
        }
        question.index = questions.length;
        question.img = "";
        // add an image if this is added
        if (currentQuestion.img) {
            question.img = currentQuestion.img;
        }
        return question;
    };


    /**
     * Changes the tab
     * @param {Object} tabClicked
     * @param {Object} tabClass
     * @param {Object} containerClass
     */
    var changeTab = function(tabClicked, tabClass, containerClass) {
        // this tab system expects some specific ids
        // if the id of the tab-button is tab1, then the id of that tab-conatiner should be tab1Container
        $("." + tabClass, rootel).removeClass(quizSelectedTab);
        $("." + tabClass, rootel).addClass(quizTab);
        $("#" + tabClicked, rootel).removeClass(quizTab);
        $("#" + tabClicked, rootel).addClass(quizSelectedTab);
        $("." + containerClass, rootel).hide();
        $("#" + tabClicked + "Container", rootel).show();
    };

    /**
     * clear all fields in settingscreen
     */
    var clearAllSettingsFields = function() {
        $(quizTxtQuestion).val("");
        $(quizNormalAnserTxt).val("");
        $("input[name=" + quizAnswerTypeRbt + "][value=" + quizAnswerTypeNormal + "]", rootel).attr("checked", true);
        $(quizAnswerTypeContainers + " div", rootel).hide();
        var selectedValue = $("input[name=" + quizAnswerTypeRbt + "]:checked", rootel).val().substring(0, $("input[name=" + quizAnswerTypeRbt + "]:checked", rootel).val().length - 3);
        $("#" + selectedValue + "Container").show();
        $(quizImagePreview).html("");
        $(quizImageTxtUrl).val("");
        currentQuestion = {};
    };

     /**
     * Corrects the indexes after removal of a answer/question
     */
    var correctIndexesNum = function() {
        for (var i = 0; i < questions.length; i++) {
            questions[i].index = i;
            if (questions[i].answerType === quizAnswerTypeMultiple) {
                for (var j = 0; j < questions[i].answer.answers.length; j++) {
                    questions[i].answer.answers[j].index = j;
                }
            }

        }
    };

     /**
     * Correct indexes and removes equal answers in the correctanswers array
     * @param {Object} removedAnswerIndex
     */
    var correctIndexes = function(removedAnswerIndex) {
        var indexToRemove = -1;
        for (var i = 0; i < questions.length; i++) {
            questions[i].index = i;
            if (questions[i].answerType === quizAnswerTypeMultiple) {
                for (var j = 0; j < questions[i].answer.answers.length; j++) {
                    questions[i].answer.answers[j].index = j;
                    for (var k = 0; k < questions[i].answer.correctAnswer.length; k++) {
                        if (removedAnswerIndex === parseInt(decrypt(questions[i].answer.correctAnswer[k], tuid), 10)) {
                            indexToRemove = k;
                        }
                    }
                }
                if (indexToRemove !== -1) {
                    questions[i].answer.correctAnswer.splice(indexToRemove, 1);
                }
            }
        }
    };

       /**
     * Sets the right buttons on the settings screen
     * @param {Object} id
     */
    var setSettingsNextButtons = function(id) {
        // hide or show buttons depending on the screen the user is on
        $(quizBackToOverview, rootel).hide();
        $(quizSaveImageTagger, rootel).hide();
        if (id === quizQOverviewName) {
            correctIndexesNum();
            setOverviewScreen(true, -1, -1, -1);
            $(quizInsertTagQ, rootel).hide();
        }
        else if (id === quizInsertQName) {
            $(quizBackPage, rootel).hide();
            $(quizSubmitWidget, rootel).hide();
            $(quizNextPage, rootel).show();
            $(quizInsertTagQ, rootel).hide();
        }
        else if (id === quizImgTaggerName) {
            $(quizBackPage, rootel).show();
            $(quizSubmitWidget, rootel).hide();
            $(quizNextPage, rootel).hide();
            $(quizInsertTagQ, rootel).show();
        }
        else if (id === quizImgTagger2Name) {
            $(quizBackPage, rootel).hide();
            $(quizSubmitWidget, rootel).hide();
            $(quizNextPage, rootel).hide();
            $(quizInsertTagQ, rootel).hide();
            $(quizBackToOverview, rootel).show();
            $(quizSaveImgTagger, rootel).show();
        }
        else if (id === quizSelectQ) {
            $(quizBackPage, rootel).show();
            $(quizSubmitWidget, rootel).hide();
            $(quizNextPage, rootel).show();
            $(quizInsertTagQ, rootel).hide();
        }
    };

    /**
     * Binds the close selection button
     * @param {Object} e
     * @param {Object} ui
     */
     var imgCloseClickHandler = function(e, ui) {
        var index = parseInt(e.target.id.replace(quizImgTagCloseName, ""), 10);
        // remove the container from the image
        $(quizImgTag + index, rootel).remove();
        // set the selection-object to null
        // this get's filtered out later on
        // can't remove the selection because other indexes would be edited
        selection.selections[index] = null;
    };

    /**
     * Previews the selection in a different image
     * @param {Object} selection
     */
      var preview = function(selection) {
        $(quizImgTagPreviewContainer).show();
        // make the conatiner the riht widgt and height
        $(quizImgTagPreviewContainer).css({
            width: selection.width + "px",
            height: selection.height + "px"
        });
        // cut out the part of the image that is selected by using margins and position relative
        $(quizImgTagPreviewContainer + " > img").css({
            marginLeft: "-" + selection.x1 + "px",
            marginTop: "-" + selection.y1 + "px",
            position: "relative"
        });
    };

    /**
     * Binds the selection click event
     * When an earlier selection is clicked this function gets called
     * @param {Object} e
     * @param {Object} ui
     */
    var imgTagClickHandler = function(e, ui) {
        // gets the index of the selected selection
        selectedTag = parseInt(e.target.id.replace(quizBackImgTagName, ""), 10);
        // remove the container representing the selection
        $(quizImgTag + selectedTag, rootel).remove();
        // and add the real selection
        var sel = selection.selections[selectedTag];
        $(quizTxtTag, rootel).val(sel.tag);
         $(quizTagImgInfo, rootel).show();
        lastSelection = sel;
        $("img" + quizTagImg, rootel).imgAreaSelect({
            x1: sel.x1,
            y1: sel.y1,
            x2: sel.x2,
            y2: sel.y2
        });
        // set the preview as well
        preview(sel);

    };

    /**
     * Add a container to the image taht represents a selection
     * @param {Object} sel, the selection that needs to be represented
     * @param {Object} tag, the tag that signs the tag
     */
    var appendRectangle = function(sel, tag) {
        if (sel !== null) {
            // get the new index for the conatiner
            var index = selection.selections.length;
            if (selectedTag !== -1) {
                index = selectedTag;
                selectedTag = -1;
            }
            // make the selection-conatiner
            var rect = "<div class='quiz_imgTag quiz_border1' id='quiz_imgTag" + index + "' style='";
            rect += "left:" + sel.x1 + "px;";
            rect += "top:" + sel.y1 + "px;";
            rect += "width:" + sel.width + "px;";
            rect += "height:" + sel.height + "px;";
            rect += "'>";
            rect += "<div class='quiz_border2'>";
            rect += "<a href='javascript:;' class='quiz_imgTagClose' id='quiz_imgTagClose" + index + "'>X</a><div class='quiz_back_imgTag' id='quiz_back_imgTag" + index + "'></div></div>";
            rect += "<div class='quiz_tagText'>" + tag;
            rect += "</div></div>";


            // add the container to the image
            $(quizImgTagContainer, rootel).append(sakai.api.Security.saneHTML(rect));
            $("." + quizImgTagCloseName, rootel).unbind("click", imgCloseClickHandler);
            $("." + quizImgTagCloseName, rootel).bind("click", imgCloseClickHandler);
            $("." + quizBackImgTagName, rootel).unbind("click", imgTagClickHandler);
            $("." + quizBackImgTagName, rootel).bind("click", imgTagClickHandler);
            sel.isAdded = true;
            sel.tag = tag;
            selection.selections[index] = sel;

            lastSelection = null;
        }
    };

    /**
     * updates the last selection
     * when a user is editing the selection
     * @param {Object} sel
     */
    var updateLastSelection = function(sel) {
        // check if a real selection occured, if the user didn't click on the image to clear the selection
        if (sel.width !== 0 && sel.height !== 0) {
            // show the taginfo
            $(quizTagImgInfo, rootel).show();
            // show the preview
            preview(sel);
            if (lastSelection !== null && lastSelection.isAdded) {
                sel.isAdded = lastSelection.isAdded;
            }
            $(quizImgTagPreviewContainer, rootel).show();
            lastSelection = sel;
        }
        // if the selection was just a click then appan the current selection (if saved)
        else {
            if (lastSelection !== null) {
                if (lastSelection.isAdded) {
                    if (lastSelection.isAdded) {
                        appendRectangle(lastSelection, $(quizTxtTag, rootel).val());
                    }
                }
            }
        }
    };

    /**
     * get's called when a selection occurs
     * @param {Object} img
     * @param {Object} sel
     */
    var selectEndHandler = function(img, sel) {
        updateLastSelection(sel);
    };

    /**
     * initializes the imagetagger
     */
    var imgTagger = function() {
        $("img#" + quizTagImg, rootel).imgAreaSelect({
            selectionColor: "blue",
            onSelectEnd: selectEndHandler
        });
    };

    /**
     * inds the add tag button
     * @param {Object} e
     * @param {Object} ui
     */
    var addTagHandler = function(e, ui) {
        // append the selection
        appendRectangle(lastSelection, $(quizTxtTag, rootel).val());
        // hide the selection
        $("img" + quizTagImg, rootel).imgAreaSelect({
            hide: true
        });
        // clear the textbox
        $(quizTxtTag, rootel).val("");
        // hide the preview conatiner
        $(quizImgTagPreviewContainer).hide();
        $(quizTagImgInfo, rootel).hide();
    };

    /**
     * Update the imagetagger to the question list
     * Saves any changes made to the selections
     * @param {Object} e
     * @param {Object} ui
     */
    var saveImgTaggerHandler = function(e, ui) {
        e.data.answerType = quizAnswerTypeImageTagger;
        e.data.answer = getImgTaggerAnswerQuestionObject();
        if (e.data.index) {
            questions[e.data.index] = e.data;
        }
        else {
            questions.push(e.data);
        }
        changeTab(quizQOverviewName, quizQTab, quizMainTabContainer);
        setSettingsNextButtons(quizQOverviewName);
        $(quizTabs, rootel).show();
        $(quizSettingsImgTagger, rootel).hide();
    };

    /**
     * Bindst the insert imagetagger button
     * @param {Object} e
     * @param {Object} ui
     */
      var insertTagQuestionHandler = function(e, ui) {
        // set the right buttons
        setSettingsNextButtons(quizInsertQName);
        // add the correct question object
        questions.push(getQuestionObject());
        // clear all the settings
        clearAllSettingsFields();
        // hide the imgtagger screen
        $(quizSettingsImgTagger, rootel).hide();
        // show the correct tabs
        $(quizTabs, rootel).show();
        // change to the right tab
        changeTab(quizInsertQName, quizQTab, quizMainTabContainer);
    };


    /**
     * Open the image tagger
     * @param {Object} question
     */
    var openTagger = function(question) {
        selection.selections = [];
        // set the image in the json-object
        var imgTaggerJson = {
            'image': question.img
        };
        // and the question
        imgTaggerJson.question = question.question;
        // render that JSON-object
        $(quizSettingsImgTagger, rootel).html($.TemplateRenderer(quizSettingsImgTaggerTemplate, imgTaggerJson));
        // hide the tabs
        $(quizTabs, rootel).hide();
        $("." + quizMainTabContainer, rootel).hide();
        $(quizSettingsImgTagger, rootel).show();
        if (question.answer) {
            setSettingsNextButtons(quizImgTagger2Name);
        }
        else {
            setSettingsNextButtons(quizImgTaggerName);
        }
        // initialialize the imgTagger
        imgTagger();
        if (question.answer) {
            for (var i = 0; i < question.answer.answers.length; i++) {
                appendRectangle(question.answer.answers[i], question.answer.answers[i].tag);
            }
        }
        // add some event listeners
        $(quizInsertTagQ, rootel).unbind("click", insertTagQuestionHandler);
        $(quizInsertTagQ, rootel).bind("click", insertTagQuestionHandler);
        $(quizAddTag, rootel).unbind("click", addTagHandler);
        $(quizAddTag, rootel).bind("click", addTagHandler);
        $(quizSaveImageTagger, rootel).unbind("click", saveImgTaggerHandler);
        $(quizSaveImageTagger, rootel).bind("click", question, saveImgTaggerHandler);
    };

    /**
     * Sets the screen the overview screen
     * @param {Object} clear
     * @param {Object} selectedIndex
     * @param {Object} editQindex
     * @param {Object} editAnswerIndex
     */
    setOverviewScreen = function(clear, selectedIndex, editQindex, editAnswerIndex) {
        // show/hide the right screens
        $(quizNextPage, rootel).hide();
        $(quizBackPage, rootel).show();
        $(quizSubmitWidget, rootel).show();
        var quiz = {
            'questions': questions
        };
        quiz.selectedIndex = selectedIndex;
        quiz.editQindex = editQindex;
        quiz.editAnswerIndex = editAnswerIndex;
        // check if there is an item selected
        if (selectedIndex !== -1) {
            // if it's a normal question decrypt the answer and output
            if (questions[selectedIndex].answerType === quizAnswerTypeNormal) {
                quiz.showAnswers = decrypt(questions[selectedIndex].answer, tuid);
            }
            // else show the possible answers
            else {
                quiz.showAnswers = questions[selectedIndex].answer.answers;
            }
            selectedItem.index = quiz.selectedIndex;
            selectedItem.answers = quiz.showAnswers;
        }
        else if (!clear) {
            quiz.selectedIndex = selectedItem.index;
            quiz.showAnswers = selectedItem.answers;
        }
        else {
            selectedItem.index = -1;
            selectedItem.answers = [];
        }
        // render the question overview list
        $(quizListOverview, rootel).html($.TemplateRenderer(quizListOverviewTemplate, quiz));
        $(quizListOverview, rootel).show();

        // focus on textboxes which ar eselected
        if (editQindex !== -1) {
            $(quizEditQuestion, rootel).focus();
        }
        else if (editAnswerIndex !== -1) {
            $(quizEditAnswer, rootel).focus();
        }
        // add some eventlistners to buttons and textboxes
        $(quizEditQBtn, rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace(quizEditQBtnName, ""), 10);
            setOverviewScreen(false, -1, index, -1);
        });
        $(quizRemoveQBtn, rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace(quizRemoveQBtnName, ""), 10);
            questions.splice(index, 1);
            correctIndexes( - 1);
            for (var k = 0; k < json.results.length; k++) {
                json.results[k].questions.splice(index, 1);
            }
            setOverviewScreen(true, -1, -1, -1);
        });

        $(quizEditQuestion, rootel).bind("keydown",
        function(e, ui) {
            if (e.keyCode === 13) {
                var index = parseInt(e.target.id.replace(quizEditQuestionName, ""), 10);
                questions[index].question = e.target.value;
                setOverviewScreen(false, -1, -1, -1);
            }

        });

        $(quizEditAnswer, rootel).bind("keydown",
        function(e, ui) {
            if (e.keyCode === 13) {
                if (e.target.id === "") {
                    questions[selectedItem.index].answer = encrypt(e.target.value, tuid);
                }
                else {
                    var index = parseInt(e.target.id.replace(quizEditAnswerName, ""), 10);
                    questions[selectedItem.index].answer.answers[index].value = e.target.value;
                }
                setOverviewScreen(false, selectedItem.index, -1, -1);
            }

        });


        $("." + quizViewAnswers, rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace(quizViewAnswers, ""), 10);
            if (questions[index].answerType !== quizImgTag) {
                setOverviewScreen(false, index, -1, -1);
            }
            else {
                openTagger(questions[index]);
            }

        });
        $(quizEditQuestion, rootel).bind("change",
        function(e, ui) {
            var index = parseInt(e.target.id.replace("quiz_editQtxt", ""), 10);
            questions[index].question = e.target.value;

        });



        $("." + quizEditAnswerBtn, rootel).bind("click",
        function(e, ui) {
            if (e.target.id === "") {
                setOverviewScreen(false, selectedItem.index, -1, 0);
            }
            else {
                var index = parseInt(e.target.id.replace(quizEditAnswerBtn, ""), 10);
                setOverviewScreen(false, selectedItem.index, -1, index);
            }
        });
        $("." + quizRemoveAnswerBtn, rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace(quizRemoveAnswerBtn, ""), 10);
            questions[selectedItem.index].answer.answers.splice(index, 1);
            correctIndexes(index);
            setOverviewScreen(true, selectedItem.index, -1, -1);
        });

        $(quizEditAnswer, rootel).bind("change",
        function(e, ui) {
            if (e.target.id === "") {
                questions[selectedItem.index].answer = encrypt(e.target.value, tuid);
            }
            else {
                var index = parseInt(e.target.id.replace(quizEditAnswerName, ""), 10);
                questions[selectedItem.index].answer.answers[index].value = e.target.value;
            }

        });

    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /** Bind the type of ansers radiobuttons */
    $("input[name=" + quizAnswerTypeRbt + "]", rootel).bind("change",
    function(e, ui) {
        // get the selected value
        var selectedValue = $("input[name=" + quizAnswerTypeRbt + "]:checked", rootel).val();
        // show the right anwser container
        $(quizAnswerTypeContainers + " div", rootel).hide();
        selectedValue = selectedValue.substring(0, selectedValue.length - 3);
        $("#" + selectedValue + "Container").show();
        if (selectedValue === quizAnswerTypeMultiple.substring(0, quizAnswerTypeMultiple.length - 3)) {
            currentQuestion.answers = [];
            addAnswerToList(quizMulipleAnswerList, "", 3);
        }
    });
    /** Bind the quiz_addAnswerToMultipleAnswers button */
    $(quizAddAnswerToMultipleAnwers, rootel).bind("click",
    function(e, ui) {
        addAnswerToList(quizMulipleAnswersListName, "", 1);
    });

    /** Bind the quiz_addQuestion button */
    $(quizAddQuestion, rootel).bind("click",
    function(e, ui) {
        questions.push(getQuestionObject());
        clearAllSettingsFields();
    });

    /** Bind the quiz_submitWidget button */
    $(quizSubmitWidget, rootel).bind("click",
    function(e, ui) {
        addQuiz(getQuizSettingsObject());
    });
    /** Bind the quiz_imgTab button */
    $(quizImgTab, rootel).bind("click",
    function(e, ui) {
        if (e.target.id === "") {
            e.target = e.target.parentNode;
        }
        changeTab(e.target.id, quizImgTabName, quizTabContainer);
    });
    /** Bind the quiz_qtab button */
    $("." + quizQTab, rootel).bind("click",
    function(e, ui) {
        changeTab(e.target.id, quizQTab, quizMainTabContainer);
        setSettingsNextButtons(e.target.id);
    });

    /** Bind the quiz_insertURLImg button */
    $(quizInsertUrlImg, rootel).bind("click",
    function(e, ui) {
        $(quizImagePreview).html(sakai.api.Security.saneHTML("<img src='" + $(quizImageTxtUrl).val() + "' width='150px'/>"));
        currentQuestion.img = $(quizImageTxtUrl).val();
    });
    /** Bind the quiz_nextPage button */
    $(quizNextPage, rootel).bind("click",
    function(e, ui) {
        changeTab(quizQOverviewName, quizQTab, quizMainTabContainer);
        setSettingsNextButtons(quizQOverviewName);
        $(quizTabs, rootel).show();
        $(quizSettingsImgTagger, rootel).hide();
    });
    /** Bind the quiz_backPage button */
    $(quizBackPage, rootel).bind("click",
    function(e, ui) {
        changeTab(quizInsertQName, quizQTab, quizMainTabContainer);
        setSettingsNextButtons(quizInsertQName);
        $(quizTabs, rootel).show();
        $(quizSettingsImgTagger, rootel).hide();
    });
    /** Bind the quiz_backToOverview button */
    $(quizBackToOverview, rootel).bind("click",
    function(e, ui) {
        changeTab(quizQOverviewName, quizQTab, quizMainTabContainer);
        setSettingsNextButtons(quizQOverviewName);
        $(quizTabs, rootel).show();
        $(quizSettingsImgTagger, rootel).hide();
    });



    /** Bind the quiz_showInfo button */
    $(quizShowInfo, rootel).bind("mouseover",
    function(e, ui) {
        $(quizInfo, rootel).css("top", $(quizShowInfo, rootel).position().top + 25);
        $(quizInfo, rootel).css("left", $(quizShowInfo, rootel).position().left + 25);
        $(quizInfo, rootel).show();
    });

    /** Bind the quiz_info button */
    $(quizInfo, rootel).bind("mouseover",
    function(e, ui) {
        $(quizInfo, rootel).css("top", $(quizShowInfo, rootel).position().top + 25);
        $(quizInfo, rootel).css("left", $(quizShowInfo, rootel).position().left + 25);
        $(quizInfo, rootel).show();

    });
    /** Bind the quiz_showInfo button */
    $(quizShowInfo, rootel).bind("mouseout",
    function(e, ui) {
        $(quizInfo, rootel).hide();
    });

    /** Bind the quiz_resulttype button */
    $(quizResultType + " li a", rootel).bind("click",
    function(e, ui) {
        $(quizResultType + " li", rootel).attr("class", "");
        if (e.target.parentNode.parentNode.id !== quizResultTypeName) {
            $("#" + e.target.parentNode.parentNode.id, rootel).attr("class", quizResultActive.replace(".",""));
        }
        else {
            $("#" + e.target.parentNode.id, rootel).attr("class", quizResultActive.replace(".",""));
        }
    });
    /** Bind the quiz_info button */
    $(quizInfo, rootel).bind("mouseout",
    function(e, ui) {
        $(quizInfo, rootel).hide();
    });

    /** Bind the quiz_btnadvancedSettings button */
    $(quizAdvancedSettings, rootel).bind("click",
    function(e, ui) {

        $(quizAdvancedSettingsUp, rootel).toggle();
        $(quizAdvancedSettingsDown, rootel).toggle();
        $(quizAdvancedSettingsContainer, rootel).toggle();
    });

    /** Bind the quiz_timeLimitSetting button */
    $(quizTimeLimitChk, rootel).bind("click",
    function(e, ui) {
        if ($(quizTimeLimitChk, rootel).attr("checked")) {
            $(quizTimeLimitTxt, rootel).focus();
        }
    });
    /** Bind the quiz_randomQuestionSetting button */
    $("input[name=" + quizRandomQuestionSetting + "]", rootel).bind("click",
    function(e, ui) {
        var selectedValue = $("input[name=" + quizRandomQuestionSetting + "]:checked", rootel).val();
        if (selectedValue === quizAskRndNumQuestion) {
            $(quizRandomQuestionTxt, rootel).focus();
        }
    });

    $(quizImgTagQuestion, rootel).bind("click",
    function(e, ui) {
        currentQuestion.question = $(quizTxtQuestion, rootel).val();
        currentQuestion.img = $(quizImageTxtUrl).val();
        openTagger(currentQuestion);
    });

    $(rootel + " " + quizNextQuestion).live("click", nextQuestionHandler);

   $(rootel + " " + quizBackToQuiz).live("click",
        function(e, ui) {
            jsonAnswers = {};
            showQuestions();
    });
    $(rootel + " " + quizShowResults).live("click", function(e, ui) {
        $(quizShowResults, rootel).hide();
        renderResultTable(- 1);
    });
    $(rootel + " " + quizMulipleAnswersListItem).live("click",  function(e, ui) {
        for (var i = 0; i < $('ul' + quizMulipleAnswersList + ' li', rootel).size() && i < currentQuestion.answers.length; i++) {
            currentQuestion.answers[i] = {
                'index': i,
                'value': ($('ul' + quizMulipleAnswersList + ' li:eq(' + i + ') input[type=text]', rootel).val())
            };
        }
        var index = parseInt(e.target.parentNode.id.replace(quizMulipleAnswersListItemName, ""), 10);
        currentQuestion.answers.splice(index, 1);
        renderListItems();
    });

    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Initializes the quiz widget
     */
    var doInit = function(){
        // show settings page
        if (showSettings) {
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                if (success) {
                    // load the quiz settings
                    json = data;
                    loadQuizSettings(true, json);
                } else {
                    loadQuizSettings(false, data.status);
                }
            });

            /*sakai.api.Widgets.loadWidgetData("_quiz", tuid, placement, function(success, data){
                if (success) {
                    // load the existing quizes page
                    quizes = data;
                    loadExistingQuizes(true, quizes);
                } else {
                    loadExistingQuizes(false, data.status);
                }
            });*/

        } else {
            // load the output window
            $(quizSettings, rootel).hide();
            $(quizOutput, rootel).show();

            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

                if (success) {
                    json = data;
                    showQuestions();
                } else {
                    fluid.log("quiz.js: Could not load quiz data!");
                }

            });
        }
    };
    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("quiz");