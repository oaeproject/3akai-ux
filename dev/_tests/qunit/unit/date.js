module("Date parse");

(function(){

/*
 * Test the supported date formats
 * 2010
 * 2010-02
 * 2010-02-18
 * 2010-02-18T07:44Z
 * 1997-07-16T19:20+01:00
 * 1997-07-16T19:20:30+01:00
 * 1269331220896 */

test("Date format: YYYY", function(){
    var date = sakai.api.Util.parseSakaiDate("2010");
    equals(date.getUTCFullYear(), "2010", "The year is correct");
});

test("Date format: YYYY-MM", function(){
    var date = sakai.api.Util.parseSakaiDate("2010-11");
    equals(date.getUTCFullYear(), "2010", "The year is correct");
    equals(date.getUTCMonth(), "10", "The month is correct");
});

test("Date format: YYYY-MM-DD", function(){
    var date = sakai.api.Util.parseSakaiDate("2010-11-19");
    equals(date.getUTCFullYear(), "2010", "The year is correct");
    equals(date.getUTCMonth(), "10", "The month is correct");
    equals(date.getUTCDate(), "19", "The day is correct");
});

test("Date format: YYYY-MM-DDThh:mmTZD", function(){
    var date = sakai.api.Util.parseSakaiDate("1997-07-16T19:20+01:00");
    equals(date.getUTCFullYear(), "1997", "The year is correct");
    equals(date.getUTCMonth(), "6", "The month is correct");
    equals(date.getUTCDate(), "16", "The day is correct");
    equals(date.getUTCHours()+1, "19", "The hour is correct");
    equals(date.getUTCMinutes(), "20", "The minutes are correct");
});

test("Date format: YYYY-MM-DDThh:mm:ssTZD", function(){
    var date = sakai.api.Util.parseSakaiDate("1997-07-16T19:20:30+01:00");
    equals(date.getUTCFullYear(), "1997", "The year is correct");
    equals(date.getUTCMonth(), "6", "The month is correct");
    equals(date.getUTCDate(), "16", "The day is correct");
    equals(date.getUTCHours()+1, "19", "The hour is correct");
    equals(date.getUTCMinutes(), "20", "The minutes are correct");
    equals(date.getUTCSeconds(), "30", "The seconds are correct");
});

test("Date format: 1269331220896 (milliseconds)", function(){
    var date = sakai.api.Util.parseSakaiDate(1269331220896);
    equals(date.getUTCFullYear(), "2010", "The year is correct");
    equals(date.getUTCMonth(), "2", "The month is correct");
    equals(date.getUTCDate(), "23", "The day is correct");
    equals(date.getUTCHours(), "8", "The hour is correct");
    equals(date.getUTCMinutes(), "0", "The minutes are correct");
    equals(date.getUTCSeconds(), "20", "The seconds are correct");
});

module("Date create");

test("Date format: 1269331220896 (milliseconds)", function(){
    var dateEquals = new Date();
    var date = sakai.api.Util.createSakaiDate(dateEquals, 6);

    equals(dateEquals.getTime(), date, "Test without date offset is correct");

    date = sakai.api.Util.createSakaiDate(dateEquals, 6, "+01:00");
    equals(dateEquals.getTime()+1000*60*60, date, "Test with date offset is correct");
});

test("Date format: YYYY-MM-DDThh:mm:ssTZD", function(){
    var dateEquals = new Date();
    var date = sakai.api.Util.createSakaiDate(dateEquals);

    equals(dateEquals.getUTCFullYear(), date.substr(0,4), "The year is correct");
    equals(dateEquals.getUTCMonth() + 1, date.substr(5,2), "The month is correct");
    equals(dateEquals.getUTCDate(), date.substr(8,2) , "The day is correct");
    equals(dateEquals.getUTCHours(), date.substr(11,2) , "The hour is correct");
    equals(dateEquals.getUTCMinutes(), date.substr(14,2), "The minutes are correct");
    equals(dateEquals.getUTCSeconds(), date.substr(17,2), "The seconds are correct");
});

})();