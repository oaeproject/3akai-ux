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

var define;

define(function () {

    "use strict";

    /*
     * A regex which matches an ISO8601 string. The datetime and timezone
     * parts are captured.
     *
     * Note: this is not quite strict as the T can appear without a date/time on
     * either side.
     */
    /*jslint maxlen: 200 */
    var ISO8601_PATTERN =
        /^(?:(\d{4})-(\d{2})-(\d{2}))T?(?:(\d{2}):(\d{2}):(\d{2}))(Z|z|([+\-]\d{2})(?::?(\d{2}))?)?$/;
    /*jslint maxlen: 80 */

    var DAYS = {
        "0" : "Mon",
        "1" : "Tue",
        "2" : "Wed",
        "3" : "Thu",
        "4" : "Fri",
        "5" : "Sat",
        "6" : "Sun"
    };

    var MONTHS = {
        "0" : "Jan",
        "1" : "Feb",
        "2" : "Mar",
        "3" : "Apr",
        "4" : "May",
        "5" : "Jun",
        "6" : "Jul",
        "7" : "Aug",
        "8" : "Sep",
        "9" : "Oct",
        "10" : "Nov",
        "11" : "Dec"
    };

    // Length of one day in milliseconds
    var DAY_MILLIS = 1000 * 60 * 60 * 24;

    /**
     * Parses an ISO 8601 date/time string into an object with keys:
     * year, month, day, hour, minute, second, offsetHours, offsetMinutes.
     * Missing values default to 0, except the year which defaults to 1970
     * (because it's the unix epoch).
     */
    var rawParseISO8601String = function (datestr) {
        var match = ISO8601_PATTERN.exec(datestr);
        if (!match) {
            return undefined;
        }

        var offsetHours = Number(match[8] || 0);
        var offsetMinutes = Number(match[9] || 0);

        return {
            year:          Number(match[1] || 1970),
            // js uses 0-11 for month, 8601 uses 1-12
            month:         Number(match[2] || 1) - 1,
            // js & 8601 both use 1-31 for day
            day:           Number(match[3] || 0),
            // Convert hour and minute into UTC+0 by subtracting the offset
            // Note that the offset is 0 when no tz is specified, so noop.
            hour:          Number(match[4] || 0) - offsetHours,
            minute:        Number(match[5] || 0) - offsetMinutes,
            second:        Number(match[6] || 0),
            hasTimezone:   Boolean(match[7])
            // match[7] can be Z or z in which case 8 and 9 are undefined
            // and default to 0 (e.g. UTC+0 which is what Z specifies)
        };
    };

    /**
     * Parses an ISO 8601 date/time string, correctly handling the
     * timezone/offset component (unlike Date.parse()).
     * @param datestr
     */
    var parseISO8601 = function (datestr) {
        var bits = rawParseISO8601String(datestr);
        if (!bits) {
            return undefined;
        }

        var date = new Date();
        if (bits.hasTimezone) {
            // The date has no timezone (UTC offset) specified. ISO 8601
            // says that the time should be interpreted as being in the
            // current locale in this instance.
            date.setFullYear(bits.year);
            date.setMonth(bits.month);
            date.setDate(bits.day); // setDate means setDay. Go figure.
            date.setHours(bits.hour);
            date.setMinutes(bits.minute);
            date.setSeconds(bits.second);
            date.setMilliseconds(0);
        } else {
            date.setUTCFullYear(bits.year);
            date.setUTCMonth(bits.month);
            date.setUTCDate(bits.day); // setDate means setDay. Go figure.
            date.setUTCHours(bits.hour);
            date.setUTCMinutes(bits.minute);
            date.setUTCSeconds(bits.second);
            date.setUTCMilliseconds(0);
        }
        return date;
    };

    var stripTime = function (date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    var today = function () {
        return stripTime(new Date());
    };

    var tomorrow = function () {
        var today = dateToday();
        today.setDate(today.getDate() + 1);
        return today;
    };

    var dayDelta = function (from, to) {
        // Millisecond time @ start of today
        var fromms = stripTime(from).getTime();
        var toms = stripTime(to).getTime();
        // Calculate number of days between from and to.
        return Math.floor((toms - fromms) / DAY_MILLIS);
    };

    var buildTimeString = function (date) {
        var hour = date.getHours();
        var minute = String(date.getMinutes());
        if (minute.length === 1) {
            minute = "0" + minute;
        }
        return hour + ":" + minute;
    };

    /**
     * Builds a relative date string from an integer day delta. Day deltas can
     * be calculated by getDayDelta().
     *
     * For example: buildRelativeDateString(0) => "Today"
     * buildRelativeDateString(-1) => "Yesterday" buildRelativeDateString(1) =>
     * "Tomorrow" buildRelativeDateString(-10) => "10 days ago"
     * buildRelativeDateString(10) => "In 10 days"
     */
    var buildRelativeDateString = function (delta) {
        // make sure we have an integer
        var days = Math.floor(delta);
        if (days === 0) {
            return "Today";
        }
        if (days === 1) {
            return "Tomorrow";
        }
        if (days === -1) {
            return "Yesterday";
        }
        if (days < 0) {
            return String(Math.abs(days)) + " days ago";
        }
        return "In " + days + " days time";
    };

    /**
     * Builds relative date strings which are even more relative than
     * buildRelativeDateString() in that it doesn't refer to Today/Yesterday etc
     * which could confuse people in the context of choosing a general sliding
     * time window to show events inside.
     */
    var buildVeryRelativeDateString = function (delta) {
        var days = Math.floor(delta);
        if (days === 0) {
            return "the present day";
        }
        if (days < 0) {
            return String(Math.abs(days)) + " days in the past";
        }
        return String(days) + " days in the future";
    };

    var buildAbsoluteDateString = function (date) {
        var dayName = DAYS[date.getDay()];
        var dayNumber = date.getDate();
        var monthName = MONTHS[date.getMonth()];
        return dayName + " " + dayNumber + " " + monthName;
    };

    /**
     * Add some days to a date.
     *
     * @param date
     *            The date to add the days to.
     * @param days
     *            The number of days to add (can be fractional, e.g. 1.6 days).
     */
    var addDays = function (date, days) {
        var millis = date.getTime();
        millis += days * DAY_MILLIS;
        return new Date(millis);
    };

    // Export our public api
    return {
        parseISO8601: parseISO8601,
        today: today,
        tomorrow: tomorrow,
        stripTime: stripTime,
        dayDelta: dayDelta,
        addDays: addDays,
        buildAbsoluteDateString: buildAbsoluteDateString,
        buildVeryRelativeDateString: buildVeryRelativeDateString,
        buildRelativeDateString: buildRelativeDateString,
        buildTimeString: buildTimeString
    };
});
