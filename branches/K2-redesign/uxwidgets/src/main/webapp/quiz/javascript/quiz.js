var sakai = sakai || {};
var RND = RND ||
function() {
    throw "Rijndael undefined";
};
var $ = $ ||
function() {
    throw "JQuery undefined";
};
var sdata = sdata ||
function() {
    throw "sdata undefined";
};
var json_parse = json_parse || 
function(){
	throw "json_parse undefined";
};
/**
 * Initialize the quiz widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement Widget place
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.quiz = function(tuid, placement, showSettings) {

    var json = false; // Variable used to recieve information by json
    var me = false; // Contains information about the current user
    var rootel = $("#" + tuid); // Get the main div used by the widget
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

    /**
	 * Gets the current user
	 */
    var getCurrentUser = function() {
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/rest/me",
            onSuccess: function(data) {
                me = json_parse(data);
                if (!me) {
                    alert('An error occured when getting the current user.');
                }
            },
            onFail: function(status) {
                alert("Couldn't connect to the server.");
            }
        });
    };
    getCurrentUser();

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
        var clonedObject = {};
        $.extend(clonedObject, object);
        return clonedObject;
    };

    var finishNewSettings = function() {
        sdata.container.informFinish(tuid);
    };

    /**
	 * loads everything that needs to be displayed in the quizwidget-settings 
	 */
    var loadQuizSettings = function(exists, quiz) {
        if (exists) {
            questions = quiz.questions;
            $("#quiz_txtTitle", rootel).val(quiz.title);

            $("input[name=quiz_randomQuestionSetting][value=" + quiz.randomQrbt + "]", rootel).attr("checked", true);
            $("#quiz_txtNumRandomQ", rootel).val(quiz.numQuestions);
            $("input[name=quiz_displaySetting][value=" + quiz.resultsViewers + "]", rootel).attr("checked", true);

            $('#quiz_resulttype_' + quiz.resultDisplay, rootel).addClass("quiz_resulttype_active");
            $('#quiz_showAnswersSetting', rootel).attr("checked", quiz.showAnswers);
            $('#quiz_timeLimitSetting', rootel).attr("checked", quiz.isTimeLimit);
            if (quiz.isTimeLimit) {
                $('#quiz_txtTime', rootel).val(quiz.timeLimit);
            }
        }
        $("#quiz_mainContainer", rootel).hide();
        $("#quiz_settings", rootel).show();
        var list = {
            'items': ["test", "test", "test", "test", "test", "test", "test", "test"]
        };

        $("#quiz_ImgSiteList", rootel).html(sdata.html.Template.render('quiz_ListTemplate', list));
        $("#quiz_ImgSiteList", rootel).show();
        $("#quiz_imgSelectSite span", rootel).html(placement.split("/")[0]);
    };

    /**
	 * Checks if an item is already in an array
	 * @param {Object} arr
	 * @param {Object} item
	 */
    var checkIfItemExists = function(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    };

    /**
	 * Returns an array with random and unique numbers
	 * @param {Object} max
	 * @param {Object} numItems
	 */
    var getRandomNumArray = function(max, numItems) {
        var randomNums = [];
        var arrFilled = false;
        var i = 0;
        while (!arrFilled) {
            var random = Math.floor(Math.random() * (max + 1));
            if (!checkIfItemExists(randomNums, random)) {
                randomNums.push(random);
                i++;
            }

            if (max < numItems) {
                return null;
            }
            if (i >= numItems) {
                arrFilled = true;
            }

        }
        return randomNums;
    };

    var getRandomColor = function() {
        var randomColors = [];
        for (var i = 0; i < 10; i++) {
            randomColors.push("" + i);
        }
        randomColors.push("a");
        randomColors.push("b");
        randomColors.push("c");
        randomColors.push("d");
        randomColors.push("e");
        randomColors.push("f");

        var color = "";
        for (i = 0; i < 6; i++) {
            color += randomColors[Math.round(Math.random() * 14)];
        }
        return color;
    };

    /**
	 * Gets the html for the statisics
	 */
    var renderResultHtml = function() {
        json.titles = [];
        json.values = [];
        json.procValues = [];
        json.colors = [];
        for (var i = 0; i < json.results.length; i++) {
            for (var j = 0; j < json.results[i].questions.length; j++) {
                json.titles[j] = json.questions[j].question;

                if (typeof json.values[j] === "undefined") {
                    json.values[j] = 0;
                }
                if (json.results[i].questions[j].correct) {
                    json.values[j] += 1;
                }
            }
        }
        for (i = 0; i < json.values.length; i++) {
            json.procValues.push(Math.round(json.values[i] / json.results.length * 100));
        }
		json.colors =  ["663300","e07000","0070e0","660000","990080","c4fc95","c4e3fc","79c365","5ba940","f5f4bf","f1eca1","c3e2fc","f2eda2","8ad769","ac9d7d","79ccff","00a4e4","ac9c7d","9f8c60","abe652","f6b5b5","cd9c9c","ad8181","ee5858","ce1616"];
	    if (json.resultDisplay === "bhs") {
            json.axis = "&chxt=y&chxl=0:|";
        }
        else {
            json.axis = '&chl=';
        }
        json.values = json.values.join("|");
        json.colorsJoined = json.colors.join("|");
        $("#quiz_resultGraph", rootel).html(sdata.html.Template.render('quiz_resultGraphTemplate', json));
        $("#quiz_resultGraph", rootel).show();

    };

    /**
	 * Gets the decrypted answers(s) of a question
	 * @param {Object} question
	 */
    var getTrueResults = function(question) {
        if (question.answerType === "quiz_NormalAnswerRbt") {
            return decrypt(question.answer, tuid);
        }
        else if (question.answerType === "quiz_MultipleAnswersRbt") {
            var answers = [];
            for (var i = 0; i < question.answer.correctAnswer.length; i++) {
                var index = parseInt(decrypt(question.answer.correctAnswer[i], tuid), 10);
                answers.push(question.answer.answers[index].value);
            }
            return answers;
        }
    };

    /**
	 * Adds the result of the quiz to results
	 */
    var addUserResult = function() {
        var result = {
            "points": json.points + "/" + questionOrder.length
        };
        result.questions = [];
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
        json.results.push(result);

        var tostring = sdata.JSON.stringify(json);
        sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "quiz", tostring, finishNewSettings);
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
        $("#quiz_solveQuestion").hide();
        jsonAnswers.selectedQuestion = selectedIndex;
        jsonAnswers.showAnswers = json.showAnswers;
        jsonAnswers.points = json.points + "/" + questionOrder.length;
        $("#quiz_overviewAnswersListContainer", rootel).html(sdata.html.Template.render('quiz_overviewAnswersListTemplate', jsonAnswers));
        renderResultHtml();
        $("#quiz_overviewAnswersList", rootel).show();
        $("#quiz_showPoints").show();
        $(".quiz_checkAnswer", rootel).bind("click",
        function(e, ui) {
            var index = e.target.id.replace("quiz_checkAnswer", "");
            if (selectedIndex !== index) {
                jsonAnswers.selectedAnswers = getTrueResults(json.questions[questionOrder[index]]);
                renderResultTable(index);
            }
            else {
                renderResultTable( - 1);
            }
        });
        $("#quiz_backToQuiz", rootel).bind("click",
        function(e, ui) {
            jsonAnswers = {};
            showQuestions();
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
		
        if (question.answerType === "quiz_NormalAnswerRbt") {
            if (decrypt(question.answer, tuid).toUpperCase() === $.trim($("#quiz_answer").val()).toUpperCase()) {
                return {
                    "isCorrect": true,
                    "answer": "",
                    "answered": $.trim($("#quiz_answer").val())
                };
            }
            return {
                "isCorrect": false,
                "answered": $.trim($("#quiz_answer").val()),
                "answer": decrypt(question.answer, tuid)
            };
        }
        else if (question.answerType === "quiz_MultipleAnswersRbt") {
            if (question.answer.correctAnswer.length > 1) {
                var answerString = "";
                for (var i = 0; i < question.answer.correctAnswer.length; i++) {
                    var index = parseInt(decrypt(question.answer.correctAnswer[i], tuid), 10);
                    answerString += question.answer.answers[index].value + ", ";
                }

                for (i = 0; i < $('input[name=quiz_chooseAnswer]:checked', rootel).length; i++) {
                    var answerIndex = parseInt($('input[name=quiz_chooseAnswer]:checked', rootel)[i].value.replace("quiz_answer", ""), 10);

                }
                if ($('input[name=quiz_chooseAnswer]:checked', rootel).length !== question.answer.correctAnswer.length) {
                    return {
                        "isCorrect": false,
                        "answered": $('input[name=quiz_chooseAnswer]:checked', rootel).length,
                        "answer": answerString
                    };
                }
                for (i = 0; i < $('input[name=quiz_chooseAnswer]:checked', rootel).length; i++) {
                    answerIndex = parseInt($('input[name=quiz_chooseAnswer]:checked', rootel)[i].value.replace("quiz_answer", ""), 10);
                    if (parseInt(decrypt(question.answer.correctAnswer[i], tuid), 10) !== answerIndex) {
                        return {
                            "isCorrect": false,
                            "answered": $('input[name=quiz_chooseAnswer]:checked', rootel).length,
                            "answer": answerString
                        };
                    }
                }

                return {
                    "isCorrect": true,
                    "answered": $('input[name=quiz_chooseAnswer]:checked', rootel).length,
                    "answer": answerString
                };
            }
            else {
                answerIndex = parseInt($('input[name=quiz_chooseAnswer]:checked', rootel).val().replace("quiz_answer", ""), 10);
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
        else if (question.answerType === "quiz_imgTagger") {
            var tagsOK = 0;
            for (i = 0; i < $('.quiz_dragTag', rootel).length; i++) {
                var tag = $('.quiz_dragTag:eq(' + i + ')', rootel);
                var isXOK = ((tag.position().left + tag.width()) > question.answer.answers[i].x1 && (tag.position().left + tag.width()) < question.answer.answers[i].x2);
                var isYOK = ((tag.position().top + tag.height()) > question.answer.answers[i].y1 && (tag.position().top + tag.height()) < question.answer.answers[i].y2);
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
        json.questions[questionOrder[index]].isLastQuestion = false;
        if (questionOrder.length <= index + 1) {
            json.questions[questionOrder[index]].isLastQuestion = true;
        }
        if (json.questions[questionOrder[index]].answerType === "quiz_MultipleAnswersRbt") {
            json.questions[questionOrder[index]].answerCount = json.questions[questionOrder[index]].answer.correctAnswer.length;
        }
        json.questions[questionOrder[index]].index = index;

        $("#quiz_solveQuestion", rootel).html(sdata.html.Template.render('quiz_solveQuestionTemplate', json.questions[questionOrder[index]]));
        $("#quiz_showPoints").hide();
        $("#quiz_solveQuestion", rootel).show();
        $(".quiz_nextQuestion", rootel).bind("click", nextQuestionHandler);
        $("#quiz_showResults", rootel).bind("click",
        function(e, ui) {
            renderResultTable( - 1);
        });
        $('.quiz_dragTag').Draggable({
            handle: 'div'

        });

    };

	
	    /**
	 * Show a popup with the correct answer
	 * @param {Object} correction
	 * @param {Object} index
	 */
    var showPopup = function(correction, index, isTimedOut) {
        var popup = {};
        if (isTimedOut) {
            popup = {
                "isTimedOut": true
            };
            $("#quiz_answerPopup", rootel).html(sdata.html.Template.render('quiz_popupTemplate', popup));
            $("#quiz_answerPopup", rootel).show();
            $("#quiz_answerPopup", rootel).bind("click",
            function(e, ui) {
                addUserResult();
                renderResultTable( - 1);
            });
        }
        else {
            popup = {
                "isTimedOut": false,
                "IsCorrect": correction.isCorrect,
                "ShowAnswer": json.showAnswers,
                "answer": correction.answer
            };
            $("#quiz_answerPopup", rootel).html(sdata.html.Template.render('quiz_popupTemplate', popup));
            $("#quiz_answerPopup", rootel).show();
            $("#quiz_answerPopup", rootel).bind("click",
            function(e, ui) {
                $("#quiz_answerPopup", rootel).hide();
                if (index !== -1) {
                    renderQuestion(index);
                }
                else {
                    addUserResult();

                    renderResultTable( - 1);
                }
            });
        }

    };
	
	    /**
	 * bound to next question button
	 * @param {Object} e
	 * @param {Object} ui
	 */
    var nextQuestionHandler = function(e, ui) {
        var index = parseInt(e.target.id.replace("quiz_nextQuestion", ""), 10) + 1;
        var correction = checkIfQuestionIsCorrect(json.questions[questionOrder[index - 1]]);
        var questionTemp = cloneObject(json.questions[questionOrder[index - 1]]);
        questionTemp.correct = correction.isCorrect;
        questionTemp.answered = correction.answered;

        jsonAnswers.questions.push(questionTemp);
        if (questionTemp.correct) {
            json.points += 1;
        }
        if (index === questionOrder.length) {
            showPopup(correction, -1, false);
            StopTheClock();
        }
        else {
            showPopup(correction, index, false);
        }

    };




    /**
	 * Start the timer
	 */
    var StartTheTimer = function() {
        if (timerMinutes === 0) {
            StopTheClock();
            showPopup(null, -1, true);
        }
        else {
            self.status = timerMinutes;
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
        $("#quiz_startQuiz", rootel).show();
        questionOrder = [];
        if (json.randomQrbt === "quiz_askNumQsetting") {
            questionOrder = getRandomNumArray(json.questions.length - 1, json.numQuestions);
        }
        else {
            for (var i = 0; i < json.questions.length; i++) {
                questionOrder.push(i);
            }
        }
        jsonAnswers.questions = [];
        json.questions[questionOrder[0]].isLastQuestion = false;
        if (questionOrder.length <= 1) {
            json.questions[questionOrder[0]].isLastQuestion = true;
        }

        json.points = 0;
        $("#quiz_quizContainer", rootel).html(sdata.html.Template.render('quiz_quizTemplate', json));
        $("#quiz_quizContainer", rootel).show();
        $("#quiz_showResults", rootel).bind("click", showResultsHandler);
        $("#quiz_startQuizBtn", rootel).bind("click",
        function(e, ui) {
            $("#quiz_startQuiz", rootel).hide();
            if (json.isTimeLimit) {
                InitializeTimer(json.timeLimit);
            }
            renderQuestion(0);

        });

    };




    var showResultsHandler = function(e, ui) {
        $("#quiz_startQuiz", rootel).hide();
        renderResultTable(- 1);
    };
    /**
	 * Loads 1 question of a selected quiz
	 * @param {Object} question
	 * @param {Object} questionsTemp
	 * @param {Object} existingTuid
	 */
    var loadExistingQuizQuestion = function(question, questionsTemp, existingTuid) {
        if (question.answerType === "quiz_NormalAnswerRbt") {
            question.correctAnswer = decrypt(question.answer, existingTuid);
        }

        question.Previndex = (question.index - 1);
        if (question.Previndex < 0) {
            question.Previndex = questionsTemp.length - 1;
        }
        question.Nextindex = (question.index + 1) % (questionsTemp.length);
        $("#quiz_existingQuizQuestions", rootel).html(sdata.html.Template.render('quiz_existingQuizQuestionsTemplate', question));
        $("#quiz_existingQuizQuestions", rootel).show();
        $(".quiz_changeQuestion").bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace("quiz_changeQuestion", ""), 10);
            loadExistingQuizQuestion(questionsTemp[index], questionsTemp, existingTuid);
        });
        $(".quiz_insertQuestion").bind("click",
        function(e, ui) {
            var questionTemp = cloneObject(question);
            if (question.answerType === "quiz_NormalAnswerRbt") {
                questionTemp.answer = encrypt(questionTemp.correctAnswer, tuid);
            }
            else {
                for (var i = 0; i < questionTemp.answer.correctAnswer.length; i++) {
                    var tempAnswer = decrypt(questionTemp.answer.correctAnswer[i], existingTuid);
                    questionTemp.answer.correctAnswer[i] = encrypt(tempAnswer, tuid);
                }
            }
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
        $("#quiz_existingQuizList", rootel).html(sdata.html.Template.render('quiz_ExistingQuizListTemplate', existingQuizList));
        $("#quiz_existingQuizList", rootel).show();
        $(".quiz_existingQuizListItem", rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace("quiz_existingQuizListItem", ""), 10);
            $(".quiz_existingQuizListItem", rootel).removeClass("quiz_selectedItem");
            $("#" + e.target.id, rootel).addClass("quiz_selectedItem");
            loadExistingQuizQuestion(quizes[index].questions[0], quizes[index].questions, quizes[index].tuid);
        });

    };


    if (showSettings) {
        sdata.Ajax.request({
            url: "/sdata/f/" + placement + "/" + tuid + "/quiz?sid=" + Math.random(),
            httpMethod: "GET",
            onSuccess: function(data) {
                json = json_parse(data);
                loadQuizSettings(true, json);
            },
            onFail: function(status) {
                loadQuizSettings(false, status);
            }
        });

        sdata.Ajax.request({
            url: "/sdata/f/" + placement.split("/")[0] + "/_quiz?sid=" + Math.random(),
            httpMethod: "GET",
            onSuccess: function(data) {
                quizes = json_parse(data);
                loadExistingQuizes(true, quizes);
            },
            onFail: function(status) {
                loadExistingQuizes(false, status);
            }
        });

    } else {
        $("#quiz_settings", rootel).hide();
        $("#quiz_mainContainer", rootel).show();

        sdata.Ajax.request({
            url: "/sdata/f/" + placement + "/" + tuid + "/quiz?sid=" + Math.random(),
            httpMethod: "GET",
            onSuccess: function(data) {
                json = json_parse(data);
                showQuestions();
            },
            onFail: function(status) {
                alert("Could not receive quiz data.");
            }
        });

    }



    /**
	 * gets the index of an item, if it doesn't exists it's added and the index is returned
	 * @param {Object} arr
	 * @param {Object} value
	 */
    var getIndex = function(arr, value) {
        for (var j = 0; j < arr.length; j++) {
            if (value === arr[j]) {
                return j;
            }
        }
        arr.push(value);
        return arr.length - 1;
    };

   
    /**
	 * add a quiz widget
	 * @param {Object} quiz
	 */
    var addQuiz = function(quiz) {
        var tostring = sdata.JSON.stringify(quiz);
        sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "quiz", tostring, finishNewSettings);
        var quizTemp = {
            "questions": quiz.questions,
            "title": quiz.title,
            "index": quizes.length,
            "tuid": tuid
        };
        quizes.push(quizTemp);
        var tostring2 = sdata.JSON.stringify(quizes);
        sdata.widgets.WidgetPreference.save("/sdata/f/" + placement.split("/")[0], "_quiz", tostring2, finishNewSettings);
    };
	    /**
	 * render array en bind remove listitem button
	 */
    var renderListItems = function() {
        var question = {};
        question.answers = currentQuestion.answers;
        $("#quiz_MultipleAnswersListContainer", rootel).html(sdata.html.Template.render('quiz_MultipleAnswersListContainerTemplate', question));
        $("#quiz_MultipleAnswersListContainer", rootel).show();
        $(".quiz_MultipleAnswersListItem", rootel).bind("click", removeListItemHandler);
    };
	    /**
	 * removes clicked item from answers array
	 * @param {Object} e
	 * @param {Object} ui
	 */
    var removeListItemHandler = function(e, ui) {
        for (var i = 0; i < $('ul#quiz_MultipleAnswersList li', rootel).size() && i < currentQuestion.answers.length; i++) {
            currentQuestion.answers[i] = {
                'index': i,
                'value': ($('ul#quiz_MultipleAnswersList li:eq(' + i + ') input[type=text]', rootel).val())
            };
        }
        var index = parseInt(e.target.parentNode.id.replace("quiz_MultipleAnswersListItem", ""), 10);
        currentQuestion.answers.splice(index, 1);
        renderListItems();
    };
	
	

    /**
	 * add a textbox to the mulipleanswersContainer
	 * @param {String} listID
	 * @param {String} input
	 */
    var addAnswerToList = function(listID, input, num) {

        for (var i = 0; i < $('ul#quiz_MultipleAnswersList li', rootel).size() && i < currentQuestion.answers.length; i++) {
            currentQuestion.answers[i] = {
                'index': i,
                'value': ($('ul#quiz_MultipleAnswersList li:eq(' + i + ') input[type=text]', rootel).val())
            };
        }
        for (i = 0; i < num; i++) {
            currentQuestion.answers.push({
                'index': currentQuestion.answers.length,
                'value': ''
            });
        }

        renderListItems();
    };
    /**
	 * removes a listitem from a list
	 * @param {String} listItemPrefix
	 * @param {String} listItemID
	 */
    var removeAnswerFromList = function(listItemPrefix, listItemID) {
        $("#" + listItemPrefix + listItemID.substring(listItemID.length - 1, listItemID.length)).remove();
    };





    /**
	 * returns the quiz-settings object
	 */
    var getQuizSettingsObject = function() {
        var quiz = {
            "questions": questions
        };
        quiz.title = $("#quiz_txtTitle", rootel).val();
        quiz.numQuestions = questions.length;
        quiz.randomQrbt = $('input[name=quiz_randomQuestionSetting]:checked', rootel).val();
        if (quiz.randomQrbt === "quiz_askNumQsetting") {
            quiz.numQuestions = parseInt($("#quiz_txtNumRandomQ", rootel).val(), 10);
        }
        quiz.resultsViewers = $('input[name=quiz_displaySetting]:checked', rootel).val();
        quiz.resultDisplay = $('.quiz_resulttype_active', rootel).attr("id").replace("quiz_resulttype_", "");
        quiz.showAnswers = $('#quiz_showAnswersSetting', rootel).attr("checked");
        quiz.isTimeLimit = $('#quiz_timeLimitSetting', rootel).attr("checked");
        quiz.timeLimit = parseInt($('#quiz_txtTime', rootel).val(), 10);
        if (!$.isArray(json.results)) {
            quiz.results = [];
        }
        else {
            quiz.results = json.results;
        }
        return quiz;
    };
	
	    var getImgTaggerAnswerQuestionObject = function() {

        var answer = {
            'answers': []
        };
        var index = 0;
        for (var i = 0; i < selection.selections.length; i++) {
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
            'answers': []
        };
        answer.correctAnswer = [];
        for (var i = 0; i < $('ul#quiz_MultipleAnswersList li', rootel).size(); i++) {
            answer.answers.push({
                'index': i,
                'value': $('ul#quiz_MultipleAnswersList li:eq(' + i + ') input[type=text]', rootel).val()
            });
            if ($('ul#quiz_MultipleAnswersList li:eq(' + i + ') input[type=checkbox]', rootel).attr("checked")) {
                answer.correctAnswer.push(encrypt(i + "", tuid));
            }
        }
        return answer;
    };

    /**
	 * returns the question object
	 */
    var getQuestionObject = function() {
		if (typeof $('input[name=quiz_answerType]:checked').val() === "undefined") {
			return null;
		}
		
        var selectedValue = $('input[name=quiz_answerType]:checked', rootel).val();
        if ($("#quiz_settings_imgTagger:visible", rootel).is(':visible')) {
            selectedValue = "quiz_imgTagger";
        }
        var question = {
            'question': $("#quiz_txtQuestion", rootel).val(),
            'answerType': selectedValue
        };

        if (selectedValue === "quiz_MultipleAnswersRbt") {
            question.answer = getMulipleAnswersSettingsObject();
        }
        else if (selectedValue === "quiz_NormalAnswerRbt") {
            question.answer = encrypt($("#quiz_NormalAnswertxtAnswer", rootel).val(), tuid);
        }
        else if (selectedValue === "quiz_imgTagger") {
            question.answer = getImgTaggerAnswerQuestionObject();
        }
        question.index = questions.length;
        question.img = "";
        if (typeof currentQuestion.img !== "undefined") {
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
        $("." + tabClass, rootel).removeClass("quiz_selectedtab");
        $("." + tabClass, rootel).addClass("quiz_tab");
        $("#" + tabClicked, rootel).removeClass("quiz_tab");
        $("#" + tabClicked, rootel).addClass("quiz_selectedtab");
        $("." + containerClass, rootel).hide();
        $("#" + tabClicked + "Container", rootel).show();
    };

    /**
	 * clear all fields in settingscreen
	 */
    var clearAllSettingsFields = function() {
        $("#quiz_txtQuestion").val("");
        $("#quiz_NormalAnswertxtAnswer").val("");
        $("input[name=quiz_answerType][value=quiz_NormalAnswerRbt]", rootel).attr("checked", true);
        $("#quiz_answerTypeContainers div", rootel).hide();
        var selectedValue = $('input[name=quiz_answerType]:checked', rootel).val().substring(0, $('input[name=quiz_answerType]:checked', rootel).val().length - 3);
        $("#" + selectedValue + "Container").show();
        $("#quiz_URLimgPreview").html("");
        $("#quiz_txtImgURL").val("");
        currentQuestion = {};
    };
	
	   /**
	 * Corrects the indexes after removal of a answer/question
	 */
    var correctIndexesNum = function() {
        var indexToRemove = -1;
        for (var i = 0; i < questions.length; i++) {
            questions[i].index = i;
            if (questions[i].answerType === "quiz_MultipleAnswersRbt") {
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
            if (questions[i].answerType === "quiz_MultipleAnswersRbt") {
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
        $("#quiz_backToOverview", rootel).hide();
        $("#quiz_saveImgTagger", rootel).hide();
        if (id === "quiz_Qoverview") {
            correctIndexesNum();
            setOverviewScreen(true, -1, -1, -1);
            $("#quiz_insertTagQuestion", rootel).hide();
        }
        else if (id === "quiz_InsertQ") {
            $("#quiz_backPage", rootel).hide();
            $("#quiz_submitWidget", rootel).hide();
            $("#quiz_nextPage", rootel).show();
            $("#quiz_insertTagQuestion", rootel).hide();
        }
        else if (id === "quiz_imgTagger") {
            $("#quiz_backPage", rootel).show();
            $("#quiz_submitWidget", rootel).hide();
            $("#quiz_nextPage", rootel).hide();
            $("#quiz_insertTagQuestion", rootel).show();
        }
        else if (id === "quiz_imgTagger2") {
            $("#quiz_backPage", rootel).hide();
            $("#quiz_submitWidget", rootel).hide();
            $("#quiz_nextPage", rootel).hide();
            $("#quiz_insertTagQuestion", rootel).hide();
            $("#quiz_backToOverview", rootel).show();
            $("#quiz_saveImgTagger", rootel).show();
        }
        else if (id === "quiz_selectQ") {
            $("#quiz_backPage", rootel).show();
            $("#quiz_submitWidget", rootel).hide();
            $("#quiz_nextPage", rootel).show();
            $("#quiz_insertTagQuestion", rootel).hide();
        }
    };
	 var imgCloseClickHandler = function(e, ui) {
        var index = parseInt(e.target.id.replace("quiz_imgTagClose", ""), 10);
        $('#quiz_imgTag' + index, rootel).remove();
        selection.selections[index] = null;
    };
	  var preview = function(selection) {
        $('#quiz_tagImgPreviewContainer').show();
        $('#quiz_tagImgPreviewContainer').css({
            width: selection.width + 'px',
            height: selection.height + 'px'
        });
        $('#quiz_tagImgPreviewContainer > img').css({
            marginLeft: '-' + selection.x1 + 'px',
            marginTop: '-' + selection.y1 + 'px',
            position: 'relative'
        });
    };
    var imgTagClickHandler = function(e, ui) {
        var index = parseInt(e.target.id.replace("quiz_back_imgTag", ""), 10);
        selectedTag = index;
        $('#quiz_imgTag' + index, rootel).remove();
        var sel = selection.selections[index];
        $("#quiz_txtTag", rootel).val(sel.tag);
        lastSelection = sel;
        $('img#quiz_tagImg', rootel).imgAreaSelect({
            x1: sel.x1,
            y1: sel.y1,
            x2: sel.x2,
            y2: sel.y2
        });
        preview(sel);

    };
	    var appendRectangle = function(sel, tag) {
        if (sel !== null) {
            var index = selection.selections.length;
            if (selectedTag !== -1) {
                index = selectedTag;
                selectedTag = -1;
            }
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
            $('#quiz_imgTagContainer', rootel).append(rect);
            $(".quiz_imgTagClose", rootel).unbind("click", imgCloseClickHandler);
            $(".quiz_imgTagClose", rootel).bind("click", imgCloseClickHandler);
            $(".quiz_back_imgTag", rootel).unbind("click", imgTagClickHandler);
            $(".quiz_back_imgTag", rootel).bind("click", imgTagClickHandler);
            sel.isAdded = true;
            sel.tag = tag;
            selection.selections[index] = sel;

            lastSelection = null;
        }
    };
  
	 var updateLastSelection = function(sel) {
        if (sel.width !== 0 && sel.height !== 0) {
            $('#quiz_tagImgInfo', rootel).show();
            preview(sel);
            if (lastSelection !== null) {
                if (typeof lastSelection.isAdded !== "undefined") {
                    sel.isAdded = lastSelection.isAdded;
                    if (sel.isAdded) {
                        $('#quiz_tagImgInfo', rootel).hide();
                    }
                }
            }
            $('#quiz_tagImgInfo', rootel).show();
            $('#quiz_tagImgPreviewContainer', rootel).show();
            lastSelection = sel;

        }
        else {
            if (lastSelection !== null) {
                if (typeof lastSelection.isAdded !== "undefined") {
                    if (lastSelection.isAdded) {
                        appendRectangle(lastSelection, $("#quiz_txtTag", rootel).val());
                    }
                }
            }
        }

    };
    var selectEndHandler = function(img, sel) {
        updateLastSelection(sel);
    };
    var imgTagger = function() {
        $('img#quiz_tagImg', rootel).imgAreaSelect({
            selectionColor: 'blue',
            onSelectEnd: selectEndHandler
        });
    };
	   


    var addTagHandler = function(e, ui) {
        appendRectangle(lastSelection, $("#quiz_txtTag", rootel).val());
        $('img#quiz_tagImg', rootel).imgAreaSelect({
            hide: true
        });
        $("#quiz_txtTag", rootel).val("");
        $('#quiz_tagImgPreviewContainer').hide();
        $('#quiz_tagImgInfo', rootel).hide();
    };

    var saveImgTaggerHandler = function(e, ui) {
        e.data.answerType = "quiz_imgTagger";
        e.data.answer = getImgTaggerAnswerQuestionObject();
        if (typeof e.data.index !== "undefined") {
            questions[e.data.index] = e.data;
        }
        else {
            questions.push(e.data);
        }
        changeTab("quiz_Qoverview", "quiz_qtab", "quiz_maintabContainer");
        setSettingsNextButtons("quiz_Qoverview");
        $(".quiz_tabs", rootel).show();
        $("#quiz_settings_imgTagger", rootel).hide();
    };
  var insertTagQuestionHandler = function(e, ui) {

        setSettingsNextButtons("quiz_InsertQ");
        questions.push(getQuestionObject());
        clearAllSettingsFields();

        $("#quiz_settings_imgTagger", rootel).hide();
        $(".quiz_tabs", rootel).show();
        changeTab("quiz_InsertQ", "quiz_qtab", "quiz_maintabContainer");
    };
    var openTagger = function(question) {
        selection.selections = [];
        var imgTaggerJson = {
            'image': question.img
        };
        imgTaggerJson.question = question.question;
        $("#quiz_settings_imgTagger", rootel).html(sdata.html.Template.render('quiz_settings_imgTagger_template', imgTaggerJson));
        $(".quiz_tabs", rootel).hide();
        $(".quiz_maintabContainer", rootel).hide();
        $("#quiz_settings_imgTagger", rootel).show();
        if (typeof question.answer !== "undefined") {
            setSettingsNextButtons("quiz_imgTagger2");
        }
        else {
            setSettingsNextButtons("quiz_imgTagger");
        }

        imgTagger();
        if (typeof question.answer !== "undefined") {
            for (var i = 0; i < question.answer.answers.length; i++) {
                appendRectangle(question.answer.answers[i], question.answer.answers[i].tag);
            }
        }
        $("#quiz_insertTagQuestion", rootel).unbind("click", insertTagQuestionHandler);
        $("#quiz_insertTagQuestion", rootel).bind("click", insertTagQuestionHandler);
        $("#quiz_addTag", rootel).unbind("click", addTagHandler);
        $("#quiz_addTag", rootel).bind("click", addTagHandler);
        $("#quiz_saveImgTagger", rootel).unbind("click", saveImgTaggerHandler);
        $("#quiz_saveImgTagger", rootel).bind("click", question, saveImgTaggerHandler);
    };
	
	    /**
	 * Sets the screen the overview screen
	 * @param {Object} clear
	 * @param {Object} selectedIndex
	 * @param {Object} editQindex
	 * @param {Object} editAnswerIndex
	 */
    var setOverviewScreen = function(clear, selectedIndex, editQindex, editAnswerIndex) {
        $("#quiz_nextPage", rootel).hide();
        $("#quiz_backPage", rootel).show();
        $("#quiz_submitWidget", rootel).show();
        var quiz = {
            'questions': questions
        };
        quiz.selectedIndex = selectedIndex;
        quiz.editQindex = editQindex;
        quiz.editAnswerIndex = editAnswerIndex;
        if (selectedIndex !== -1) {
            if (questions[selectedIndex].answerType === "quiz_NormalAnswerRbt") {
                quiz.showAnswers = decrypt(questions[selectedIndex].answer, tuid);
            }
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

        $("#quiz_lstOverviewQ", rootel).html(sdata.html.Template.render('quiz_lstOverviewQTemplate', quiz));
        $("#quiz_lstOverviewQ", rootel).show();

        if (editQindex !== -1) {
            $(".quiz_editQtxt", rootel).focus();
        }
        else if (editAnswerIndex !== -1) {
            $(".quiz_editAtxt", rootel).focus();
        }

        $(".quiz_editQbtn", rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace("quiz_editQbtn", ""), 10);
            setOverviewScreen(false, -1, index, -1);
        });
        $(".quiz_removeQbtn", rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace("quiz_removeQbtn", ""), 10);
            questions.splice(index, 1);
            correctIndexes( - 1);
            for (var k = 0; k < json.results.length; k++) {
                json.results[k].questions.splice(index, 1);
            }
            setOverviewScreen(true, -1, -1, -1);
        });
        $(".quiz_editQtxt", rootel).bind("keydown",
        function(e, ui) {
            if (e.keyCode === 13) {
                var index = parseInt(e.target.id.replace("quiz_editQtxt", ""), 10);
                questions[index].question = e.target.value;
                setOverviewScreen(false, -1, -1, -1);
            }

        });
        $(".quiz_editAtxt", rootel).bind("keydown",
        function(e, ui) {
            if (e.keyCode === 13) {
                if (e.target.id === "") {
                    questions[selectedItem.index].answer = encrypt(e.target.value, tuid);
                }
                else {
                    var index = parseInt(e.target.id.replace("quiz_editAtxt", ""), 10);
                    questions[selectedItem.index].answer.answers[index].value = e.target.value;
                }
                setOverviewScreen(false, selectedItem.index, -1, -1);
            }

        });
		

        $(".quiz_viewAnswers", rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace("quiz_viewAnswers", ""), 10);
            if (questions[index].answerType !== "quiz_imgTagger") {
                setOverviewScreen(false, index, -1, -1);
            }
            else {
                openTagger(questions[index]);
            }

        });
        $(".quiz_editQtxt", rootel).bind("change",
        function(e, ui) {
            var index = parseInt(e.target.id.replace("quiz_editQtxt", ""), 10);
            questions[index].question = e.target.value;

        });
        $(".quiz_editAbtn", rootel).bind("click",
        function(e, ui) {
            if (e.target.id === "") {
                setOverviewScreen(false, selectedItem.index, -1, 0);
            }
            else {
                var index = parseInt(e.target.id.replace("quiz_editAbtn", ""), 10);
                setOverviewScreen(false, selectedItem.index, -1, index);
            }
        });
        $(".quiz_removeAbtn", rootel).bind("click",
        function(e, ui) {
            var index = parseInt(e.target.id.replace("quiz_removeAbtn", ""), 10);
            questions[selectedItem.index].answer.answers.splice(index, 1);
            correctIndexes(index);
            setOverviewScreen(true, selectedItem.index, -1, -1);
        });
        $(".quiz_editAtxt", rootel).bind("change",
        function(e, ui) {
            if (e.target.id === "") {
                questions[selectedItem.index].answer = encrypt(e.target.value, tuid);
            }
            else {
                var index = parseInt(e.target.id.replace("quiz_editAtxt", ""), 10);
                questions[selectedItem.index].answer.answers[index].value = e.target.value;
            }

        });

    };

    /** Bind the choose permissions radiobuttons */
    $("input[name=quiz_answerType]", rootel).bind("change",
    function(e, ui) {
        var selectedValue = $('input[name=quiz_answerType]:checked', rootel).val();
        $("#quiz_answerTypeContainers div", rootel).hide();
        selectedValue = selectedValue.substring(0, selectedValue.length - 3);
        $("#" + selectedValue + "Container").show();
        if (selectedValue === "quiz_MultipleAnswers") {
            currentQuestion.answers = [];
            addAnswerToList("quiz_MultipleAnswersList", "", 3);
        }
    });
    /** Bind the quiz_addAnswerToMultipleAnswers button */
    $("#quiz_addAnswerToMultipleAnswers", rootel).bind("click",
    function(e, ui) {
        addAnswerToList("quiz_MultipleAnswersList", "", 1);
    });
    /** Bind the quiz_addQuestion button */
    $(".quiz_addQuestion", rootel).bind("click",
    function(e, ui) {
        questions.push(getQuestionObject());
        clearAllSettingsFields();
    });
    /** Bind the quiz_submitWidget button */
    $("#quiz_submitWidget", rootel).bind("click",
    function(e, ui) {
        addQuiz(getQuizSettingsObject());
    });
    /** Bind the quiz_imgTab button */
    $(".quiz_imgTab", rootel).bind("click",
    function(e, ui) {
        if (e.target.id === "") {
            e.target = e.target.parentNode;
        }
        changeTab(e.target.id, "quiz_imgTab", "quiz_tabContainer");
    });
    /** Bind the quiz_qtab button */
    $(".quiz_qtab", rootel).bind("click",
    function(e, ui) {
        changeTab(e.target.id, "quiz_qtab", "quiz_maintabContainer");
        setSettingsNextButtons(e.target.id);
    });
   
    /** Bind the quiz_insertURLImg button */
    $("#quiz_insertURLImg", rootel).bind("click",
    function(e, ui) {
        $("#quiz_URLimgPreview").html("<img src='" + $("#quiz_txtImgURL").val() + "' width='150px'/>");
        currentQuestion.img = $("#quiz_txtImgURL").val();
    });
    /** Bind the quiz_nextPage button */
    $("#quiz_nextPage", rootel).bind("click",
    function(e, ui) {
        changeTab("quiz_Qoverview", "quiz_qtab", "quiz_maintabContainer");
        setSettingsNextButtons("quiz_Qoverview");
        $(".quiz_tabs", rootel).show();
        $("#quiz_settings_imgTagger", rootel).hide();
    });
    /** Bind the quiz_backPage button */
    $("#quiz_backPage", rootel).bind("click",
    function(e, ui) {
        changeTab("quiz_InsertQ", "quiz_qtab", "quiz_maintabContainer");
        setSettingsNextButtons("quiz_InsertQ");
        $(".quiz_tabs", rootel).show();
        $("#quiz_settings_imgTagger", rootel).hide();
    });
    /** Bind the quiz_backToOverview button */
    $("#quiz_backToOverview", rootel).bind("click",
    function(e, ui) {
        changeTab("quiz_Qoverview", "quiz_qtab", "quiz_maintabContainer");
        setSettingsNextButtons("quiz_Qoverview");
        $(".quiz_tabs", rootel).show();
        $("#quiz_settings_imgTagger", rootel).hide();
    });

    /** Bind the quiz_showInfo button */
    $("#quiz_showInfo", rootel).bind("mouseover",
    function(e, ui) {
        $("#quiz_info", rootel).css("top", $("#quiz_showInfo", rootel).position().top + 25);
        $("#quiz_info", rootel).css("left", $("#quiz_showInfo", rootel).position().left + 25);
        $("#quiz_info", rootel).show();
    });

    /** Bind the quiz_info button */
    $("#quiz_info", rootel).bind("mouseover",
    function(e, ui) {
        $("#quiz_info", rootel).css("top", $("#quiz_showInfo", rootel).position().top + 25);
        $("#quiz_info", rootel).css("left", $("#quiz_showInfo", rootel).position().left + 25);
        $("#quiz_info", rootel).show();

    });
    /** Bind the quiz_showInfo button */
    $("#quiz_showInfo", rootel).bind("mouseout",
    function(e, ui) {
        $("#quiz_info", rootel).hide();
    });
    /** Bind the quiz_resulttype button */
    $("#quiz_resulttype li a", rootel).bind("click",
    function(e, ui) {
        $("#quiz_resulttype li", rootel).attr("class", "");
        if (e.target.parentNode.parentNode.id !== "quiz_resulttype") {
            $("#" + e.target.parentNode.parentNode.id, rootel).attr("class", "quiz_resulttype_active");
        }
        else {
            $("#" + e.target.parentNode.id, rootel).attr("class", "quiz_resulttype_active");
        }
    });
    /** Bind the quiz_info button */
    $("#quiz_info", rootel).bind("mouseout",
    function(e, ui) {
        $("#quiz_info", rootel).hide();
    });
    /** Bind the quiz_btnadvancedSettings button */
    $("#quiz_btnadvancedSettings", rootel).bind("click",
    function(e, ui) {

        $("#quiz_toggle_advanced_settings_up", rootel).toggle();
        $("#quiz_toggle_advanced_settings_down", rootel).toggle();
        $("#quiz_advancedSettings", rootel).toggle();
    });
    /** Bind the quiz_timeLimitSetting button */
    $("#quiz_timeLimitSetting", rootel).bind("click",
    function(e, ui) {
        if ($('#quiz_timeLimitSetting', rootel).attr("checked")) {
            $("#quiz_txtTime", rootel).focus();
        }
    });
    /** Bind the quiz_randomQuestionSetting button */
    $("input[name=quiz_randomQuestionSetting]", rootel).bind("click",
    function(e, ui) {
        var selectedValue = $('input[name=quiz_randomQuestionSetting]:checked', rootel).val();
        if (selectedValue === "quiz_askNumQsetting") {
            $("#quiz_txtNumRandomQ", rootel).focus();
        }
    });

    $(".quiz_imgTagQuestion", rootel).bind("click",
    function(e, ui) {
        currentQuestion.question = $("#quiz_txtQuestion", rootel).val();
        currentQuestion.img = $("#quiz_txtImgURL").val();
        openTagger(currentQuestion);
    });
  

};

sdata.widgets.WidgetLoader.informOnLoad("quiz");