/*
 * Copyright 2012:
 *     - Hal Blackburn<hwtb2@caret.cam.ac.uk>
 *     - CARET, University of Cambridge
 *
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

/*jslint vars: true, nomen: true, maxerr: 50, maxlen: 80, indent: 4 */
/*jslint plusplus: true */

var require, sakai_global, alert;

/**
 * A Sakai OAE widget which shows calendar events from an iCalendar feed in a
 * daily agenda list style view.
 *
 * @param {String}
 *            tuid Unique id of the widget
 * @param {Boolean}
 *            showSettings Show the settings of the widget or not
 */
sakai_global.calendarfeed = function (tuid, showSettings) {
    "use strict";

    // JSLint complains if we don't declare all our var based functions before
    // use...
    var between,
        compareEventByStartDate,
        contractCalendarEntry,
        defaultingStateLoadHandler,
        doInit,
        expandCalendarEntry,
        fetchCalendarData,
        getState,
        groupByDay,
        hideLoadingIndicator,
        isFinite,
        localiseDate,
        notBefore,
        onStateAvailable,
        onWidgetSettingsDataSaved,
        onWidgetSettingsStateAvailable,
        paragraphBreak,
        parseEventDates,
        randomErrorTitle,
        rewriteHttpUrlToWebcal,
        rewriteWebcalUrlToHttp,
        settingsHandleRangeSlide,
        settingsSave,
        setupRangeSlider,
        showError,
        showLoadingIndicator,
        updateCalendar;

    /**
     * No-op function which can be called with unused function arguments whose
     * presense are required by external APIs which this code has control over.
     *
     *  JSLint thinks it's helpful to moan that an argument is unused, even
     *  though its presence can't be avoided without stupid hacks like using the
     *  arguments array.
     */
    var stopJSLintMoaningAboutThisUnusedVarWhichICanDoNothingAbout =
        function () {};

    // Pull require() imports into local scope
    var $ = sakai_global.calendarfeed.imports.jquery;
    var sakai = sakai_global.calendarfeed.imports.sakai;
    var dates = sakai_global.calendarfeed.imports.dates;

    /**
     * Get an internationalisation value from the widget's bundle.
     */
    var translationOf = function (key) {
        return sakai.api.i18n.getValueForKey(key, "calendarfeed");
    };

    var ICAL_PROXY_PATH = "/var/proxy/ical.json";

    // By default show events from 2 days ago up to 2 weeks in the future
    var DEFAULT_DISPLAY_RANGE = [ -2, 14 ];
    var MIN_SLIDER_DATE = -61;
    var MAX_SLIDER_DATE = 61;

    var ERROR_UNCONFIGURED_BODY = translationOf("ERROR_UNCONFIGURED_BODY");
    var ERROR_GETTING_STATE = translationOf("ERROR_GETTING_STATE");
    var ERROR_GETTING_FEED = translationOf("ERROR_GETTING_FEED");

    /*
     * This widget couldn't get through to the website. The site may by
     * experiencing difficulties, or there may be a problem with your internet
     * connection.
     *
     * The chances are this will resolve itself very soon. Press the retry
     * button and cross your fingers…
     */
    /*
     * Some light hearted exclamations to show at the top of the error box.
     */
    var LIGHT_HEARTED_ERROR_TITLES =
        translationOf("LIGHT_HEARTED_ERROR_TITLES").split("//");

    // ///////////////////////////
    // Configuration variables //
    // ///////////////////////////

    // unique container for each widget instance
    var root = $("#" + tuid);
    var mainContainer = $("#calendarfeed_main", root);
    var settingsContainer = $("#calendarfeed_settings", root);
    var settingsForm = $("#calendarfeed_settings_form", root);
    var settingsFormTitleField = $("#calendarfeed_settings_txtTitle", root);
    var settingsFormUrlField = $("#calendarfeed_settings_txtUrl", root);

    // Widget state vars
    var _title = null;
    var _feedUrl = null;
    var _groupedDays = null;
    var _totalFeedEvents = null;

    // Settings state
    var _settingsDateRange = null;

    /**
     * A class to represent events.
     */
    function Event(vevent) {

        this.vevent = vevent;
        this.absDate = dates.buildAbsoluteDateString(vevent.DTSTART);
        this.dayDelta = dates.dayDelta(dates.today(), vevent.DTSTART);
        this.relDate = dates.buildRelativeDateString(this.dayDelta);
        this.time = dates.buildTimeString(vevent.DTSTART);
        this.summary = vevent.SUMMARY || vevent.DESCRIPTION || "";
        this.description = vevent.DESCRIPTION || vevent.SUMMARY || "";
        if (this.description === this.summary) {
            this.description = "";
        }
        this.description = paragraphBreak(this.description);

        // These fields may be undefined
        this.url = vevent.URL;
        this.location = vevent.LOCATION;
        this.contact = vevent.CONTACT;
    }

    // /////////////////////
    // Utility functions //
    // /////////////////////

    /**
     * Converts a date from an UTC into the user's chosen timezone.
     */
    localiseDate = function (utcdate) {
        return sakai.api.l10n.fromGMT(utcdate, sakai.api.User.data.me);
    };

    paragraphBreak = function (text) {
        // Break the text on blank lines
        return text.split(/^\s*$/m);
    };

    /**
     * Builds a callback function to be passed to loadWidgetData which detects
     * load failure due to no previous state being saved and calls the callback
     * with success and some default values instead of failure.
     *
     * By default, loadWidgetData makes no distinction between failure to load
     * state due to the widget being loaded for the first time, and failure due
     * to network error (for example).
     */
    defaultingStateLoadHandler = function (callback, defaults) {
        // Return a callback function to be registered with loadWidgetData
        return function (success, obj) {
            if (!success) {
                var xhr = obj;

                // Check for failure to load due to no previous state being
                // saved. i.e. use defaults.
                if (xhr.status === 404) {
                    // fire the callback with success instead of failure
                    // using the defaults provided
                    callback(true, defaults);
                } else {
                    // Otherwise, assume it's a legitimate failure
                    callback(false, xhr);
                }
            } else {
                callback(true, obj);
            }

        };
    };

    randomErrorTitle = function () {
        var len = LIGHT_HEARTED_ERROR_TITLES.length;
        return LIGHT_HEARTED_ERROR_TITLES[Math.floor(Math.random() * len)];
    };

    /**
     * Shows an error message with the given error body. postInsertHook will be
     * called once the message has been inserted with the error body as its this
     * value.
     */
    showError = function (bodyHtml, postInsertHook) {
        var rendered = sakai.api.Util.TemplateRenderer("#template_error_msg", {
            title : randomErrorTitle(),
            body : bodyHtml
        });
        var errorElement = $("#error_msg", root);
        $("#error_msg", root).html(rendered).slideDown();
        if (postInsertHook) {
            postInsertHook.call(errorElement);
        }
    };

    /**
     * Called when the widget state becomes available to the main widget (not
     * settings).
     */
    onStateAvailable = function (succeeded, state) {

        // Check if the request for our state failed...
        if (!succeeded) {
            hideLoadingIndicator();

            return showError(ERROR_GETTING_STATE, function () {
                $("#error_msg #error_retry_btn", root).click(function (e) {
                    // re initialise after finishing hiding the error msg
                    $(e.target).slideUp(doInit);
                });
            });
        }

        // Check if the widget is yet to be configured, and if so show a
        // message.
        if (state.unconfigured) {
            hideLoadingIndicator();
            return showError(ERROR_UNCONFIGURED_BODY);
        }

        // Should be all good!
        _title = state.title;
        _feedUrl = state.url;
        _settingsDateRange = [ state.daysFrom, state.daysTo ];
        fetchCalendarData();
    };

    fetchCalendarData = function () {
        var failure = function () {
            hideLoadingIndicator();
            showError(ERROR_GETTING_FEED, function () {
                // Bind the "try again" button to hide the error message
                // and retry the operation.
                $("#error_msg #error_retry_btn", root).click(function () {

                    $("#error_msg", root).slideUp(function () {
                        // Once the error box has slid away, show the
                        // loading wheel and fetch the data again.
                        showLoadingIndicator();
                        fetchCalendarData();
                    });
                });

            });
        };
        var success = function (data) {
            // The proxy's iCalendar post processor is broken -- it returns
            // 200 success when it gets a bad response from the origin
            // server... We'll have to attempt to detect failure here:
            if (!data) {
                return failure();
            }

            // Hopefully the data is OK.
            if (data.vcalendar && data.vcalendar.vevents) {
                var events = data.vcalendar.vevents;
                _totalFeedEvents = events.length;

                // Convert event date strings into date objects
                events = $.map(events, parseEventDates);

                // Filter the events to just those happening today
                var range = (_settingsDateRange || DEFAULT_DISPLAY_RANGE);
                var startDate = (isFinite(range[0]) ?
                        dates.addDays(dates.today(), range[0]) : null);
                // add one as between() excludes the upper endpoint, but the
                // slider is inclusive.
                var endDate = (isFinite(range[1]) ?
                        dates.addDays(dates.today(), range[1] + 1) : null);
                events = $.grep(events, between(startDate, endDate));

                // Group the events into a list of groups, one for each day
                _groupedDays = groupByDay(events);

            }
            updateCalendar();
        };

        $.ajax({
            url : ICAL_PROXY_PATH,
            data : {
                feedurl : _feedUrl
            },
            success : success,
            failure : failure
        });
    };

    isFinite = function (dayDelta) {
        return dayDelta < MAX_SLIDER_DATE && dayDelta > MIN_SLIDER_DATE;
    };

    /**
     * Convert date strings from a JSON origionating event object into js Date
     * objects in the current user's prefered time zone.
     */
    parseEventDates = function (event) {
        event.DTSTART = localiseDate(dates.parseISO8601(event.DTSTART));
        event.DTEND =   localiseDate(dates.parseISO8601(event.DTEND));
        return event;
    };

    notBefore = function (date) {
        return function (event) {
            return event.DTSTART >= date;
        };
    };

    between = function (dateStart, dateEnd) {
        return function (event) {
            if (dateStart && dateEnd) {
                return event.DTSTART >= dateStart && event.DTSTART < dateEnd;
            }
            if (dateStart) {
                return event.DTSTART >= dateStart;
            }
            if (dateEnd) {
                return event.DTSTART < dateEnd;
            }
            return true;
        };
    };

    compareEventByStartDate = function (a, b) {
        return a.vevent.DTSTART.getTime() - b.vevent.DTSTART.getTime();
    };

    groupByDay = function (vevents) {
        var i, key, days = {};
        for (i = 0; i < vevents.length; ++i) {
            var event = vevents[i];
            // We need a string to key our obj with
            var dateKey = dates.stripTime(event.DTSTART).toISOString();
            if (!days[dateKey]) {
                days[dateKey] = [];
            }
            days[dateKey].push(new Event(event));
        }
        var sortedDays = [];
        for (key in days) {
            if (days.hasOwnProperty(key)) {
                var events = days[key];
                events.sort(compareEventByStartDate);
                sortedDays.push([ key, events ]);
            }
        }
        sortedDays.sort();
        return sortedDays;
    };

    /**
     * Loads widget saved state, calling the callback(success, data) function
     * once the state is loaded.
     */
    getState = function (callback) {
        // Load widget data, providing default values on loads before state
        // has been saved on the server.
        sakai.api.Widgets.loadWidgetData(tuid, defaultingStateLoadHandler(
            callback,
            {
                unconfigured : true,
                title : "",
                url : "",
                daysFrom : DEFAULT_DISPLAY_RANGE[0],
                daysTo : DEFAULT_DISPLAY_RANGE[1]
            }
        ));
    };

    /** Called when the calendar data has been updated. */
    updateCalendar = function () {

        var rendered = sakai.api.Util.TemplateRenderer("#agenda_template", {
            title : _title,
            webcalFeedUrl : rewriteHttpUrlToWebcal(_feedUrl),
            days : _groupedDays,
            totalFeedEvents : _totalFeedEvents
        });

        $(".ajax-content", root).html(rendered);
        $(".ajax-content .summary.compact", root).toggle(
            expandCalendarEntry,
            contractCalendarEntry
        );

        $(".ajax-content", root).show();
        hideLoadingIndicator();
        $("#title", root).hover(function (e) {
            $(e.target).children().fadeIn();
        }, function (e) {
            $(e.target).children().fadeOut();
        });
    };

    hideLoadingIndicator = function () {
        $(".loading", root).stop().hide();
    };

    showLoadingIndicator = function () {
        $(".loading", root).fadeIn(1000);
    };

    expandCalendarEntry = function (e) {
        var summary = $(e.target);
        var expanded = summary.siblings(".full");

        summary.removeClass("compact expandable").addClass("contractable");
        expanded.slideDown();
    };

    contractCalendarEntry = function (e) {
        var summary = $(e.target);
        var expanded = summary.siblings(".full");

        summary.addClass("compact expandable").removeClass("contractable");
        expanded.slideUp();
    };

    /**
     * Watch for value changes to the settings URL field in order to rewrite
     * webcal:// urls to http://.
     */
    settingsFormUrlField.change(function (e) {
        var urltext = $(e.target).val();
        // Help people inputting webcal:// links by rewriting them to http
        urltext = rewriteWebcalUrlToHttp(urltext);
        $(e.target).val(urltext);
    });

    rewriteWebcalUrlToHttp = function (url) {
        return url.replace(/^webcal:\/\//, "http://");
    };

    rewriteHttpUrlToWebcal = function (url) {
        return url.replace(/^http:\/\//, "webcal://");
    };

    onWidgetSettingsStateAvailable = function (success, state) {
        var title, url;
        if (success) {
            title = state.title;
            url = state.url;
            if (state.daysFrom && state.daysTo) {
                _settingsDateRange = [ state.daysFrom, state.daysTo ];
            }
        } else {
            alert(translationOf("SETTINGS_ERROR_FETCHING_WIDGET_STATE"));
        }
        settingsFormTitleField.val(title || "");
        settingsFormUrlField.val(url || "");
        setupRangeSlider($("#daterangeslider", root),
                settingsHandleRangeSlide);
        $("#daterangeslider", root).slider("values",
                _settingsDateRange || DEFAULT_DISPLAY_RANGE);
    };

    /** Add listener to setting form submit */
    settingsSave = function () {
        var state = {
            title : settingsFormTitleField.val(),
            url : settingsFormUrlField.val(),
            daysFrom : _settingsDateRange[0],
            daysTo : _settingsDateRange[1]
        };

        // async save our widget's state
        sakai.api.Widgets
                .saveWidgetData(tuid, state, onWidgetSettingsDataSaved);
    };

    onWidgetSettingsDataSaved = function (success) {
        if (success) {
            // Settings finished, switch to Main view
            sakai.api.Widgets.Container.informFinish(tuid, "calendarfeed");
        } else {
            sakai.api.Util.notification.show(
                translationOf("SETTINGS_ERROR_SAVING_WIDGET_STATE_TITLE"),
                translationOf("SETTINGS_ERROR_SAVING_WIDGET_STATE_BODY"),
                sakai.api.Util.notification.type.ERROR
            );
        }
    };

    setupRangeSlider = function (container, slideFunc) {
        stopJSLintMoaningAboutThisUnusedVarWhichICanDoNothingAbout(container);
        $("#daterangeslider", root).slider({
            range : true,
            min : MIN_SLIDER_DATE,
            max : MAX_SLIDER_DATE,
            values : _settingsDateRange || DEFAULT_DISPLAY_RANGE,
            slide : slideFunc,
            change : slideFunc
        });
    };

    settingsHandleRangeSlide = function (event, ui) {
        stopJSLintMoaningAboutThisUnusedVarWhichICanDoNothingAbout(event);
        _settingsDateRange = ui.values;
        var from = ui.values[0];
        var to = ui.values[1];

        var fromString = !isFinite(from) ? "any date in the past"
                : dates.buildVeryRelativeDateString(from);
        var toString = !isFinite(to) ? "any date in the future"
                : dates.buildVeryRelativeDateString(to);

        $("#calendarfeed_settings_daterangeslider_label .from", root).text(
            fromString
        );
        $("#calendarfeed_settings_daterangeslider_label .to", root).text(
            toString
        );
    };

    /**
     * Initialization function DOCUMENTATION
     */
    doInit = function () {

        if (showSettings) {
            // Setup validation/save handler on save button
            var validateOpts = {
                submitHandler : settingsSave
            };
            sakai.api.Util.Forms.validate(settingsForm, validateOpts, true);

            $("#calendarfeed_settings_save", root).click(function () {
                settingsForm.submit();
            });
            // Hook up the cancel button
            $("#calendarfeed_settings_cancel", root).click(function () {
                sakai.api.Widgets.Container.informCancel(tuid, "calendarfeed");
            });

            // Async fetch widget settings to populate form
            getState(onWidgetSettingsStateAvailable);

            // show the Settings view
            settingsContainer.show();
        } else {
            // set up Main view

            // Async fetch widget settings to populate form
            getState(onStateAvailable);

            mainContainer.show();
            showLoadingIndicator();
        }
    };

    // run the initialization function when the widget object loads
    doInit();
};

// load the master sakai object to access all Sakai OAE API methods
require(
    [
        "jquery", "sakai/sakai.api.core",
        "/devwidgets/calendarfeed/lib/dates.js",
        "/devwidgets/calendarfeed/lib/jquery.ui.slider.js"
    ],
    function (jquery, sakai, dates) {

        "use strict";

        sakai_global.calendarfeed.imports = {
            jquery : jquery,
            sakai : sakai,
            dates: dates
        };

        // inform Sakai OAE that this widget has loaded and is ready to run
        sakai.api.Widgets.widgetLoader.informOnLoad("calendarfeed");
    }
);
