require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ],
    function($, sakai) {

    // Mock Objects
    var mockMessage = {
        items: 13,
        results: [{
            "jcr:path":"/~stuart/message/inbox/192aa0c0e5e73d2137c193160201de4ed46cd37f",
            "jcr:name":"192aa0c0e5e73d2137c193160201de4ed46cd37f",
            "sakai:category":"message",
            "_charset_":"utf-8",
            "sakai:created":"2011-03-04T09:44:34-05:00",
            "lastModified":1299249874595,
            "sakai:type":"internal",
            "sakai:to":"internal:stuart",
            "_copiedFrom":"a:jenny/message/outbox/192aa0c0e5e73d2137c193160201de4ed46cd37f",
            "_path":"a:stuart/message/inbox/192aa0c0e5e73d2137c193160201de4ed46cd37f",
            "_copiedFromId":"Tkywufzby0IU5r6iz4w",
            "sling:resourceType":"sakai/message",
            "_id":"T1yWmsA1f2Eegv1lL5b",
            "sakai:sendstate":"notified",
            "createdBy":"admin",
            "created":1299249874537,
            "sakai:body":"hello",
            "_copiedDeep":true,
            "lastModifiedBy":"admin",
            "sakai:subject":"sup",
            "sling:resourceSuperType":"sparse/Content",
            "sakai:id":"192aa0c0e5e73d2137c193160201de4ed46cd37f",
            "sakai:messagebox":"inbox",
            "sakai:read":false,
            "sakai:from":"jenny",
            "id":"192aa0c0e5e73d2137c193160201de4ed46cd37f",
            "userTo":[{
                "hash":"stuart",
                "basic":{
                    "access":"everybody",
                    "elements":{
                        "lastName":{"value":"Freeman"},
                        "email":{"value":"stuart.freeman@et.gatech.edu"},
                        "firstName":{"value":"Stuart"}
                    }
                },
                "rep:userId":"stuart",
                "userid":"stuart",
                "user":"stuart",
                "sakai:status":"online",
                "sakai:location":"none"
            }],
            "userFrom":[{
                "hash":"jenny",
                "basic":{
                    "access":"everybody",
                    "elements":{
                        "lastName":{"value":"Freeman"},
                        "email":{"value":"stuart.freeman@et.gatech.edu"},
                        "firstName":{"value":"Jenny"}
                    }
                },
                "rep:userId":"jenny",
                "userid":"jenny",
                "user":"jenny",
                "sakai:status":"offline",
                "sakai:location":"none"
            }]
        }],
        total: 1
    };

    // Mock URLs
    $.mockjax({
        url: "/var/message/boxcategory.json?box=inbox&category=message&items=13&page=1&sortBy=sakai:created&sortOrder=asc",
        responseText: mockMessage
    });

    $.mockjax({
        url: "/var/message/boxcategory.json?box=&*",
        "status": 500
    });

    $.mockjax({
        url: "/system/batch",
        dataType: 'json',
        response: function(postData) {
            this.responseText = {postData: postData};
        }
    });

    $.mockjax({
        url: "~undefined/message.count.json?filters=sakai:messagebox,sakai:read&values=inbox,false&groupedby=sakai:category*",
        responseText: {"count":[]}
    });

    require.ready(function() {
        module("Communication");

        asyncTest("Get the messages in a user's inbox", 2, function() {
            sakai.api.Communication.getAllMessages("inbox", "message", 13, 1, "sakai:created", "asc", function(success, data) {
                ok(success);
                same(data, mockMessage, "Expected message data");
                start();
            });
        });

        asyncTest("Get messages handle error", 2, function() {
            sakai.api.Communication.getAllMessages("", "", 13, 1, "", "", function(success, data) {
                ok(!success);
                same(data, {}, "Expect empty data");
                start();
            });
        });

        var getRequests = function(data) {
            // OH NOES we're calling eval on the data we just POSTed!
            var requests = eval(data.postData.data.requests);
            return requests;
        };

        asyncTest("Trash Message", 3, function() {
            sakai.api.Communication.deleteMessages(["/~stuart/message/inbox/192aa0c0e5e73d2137c193160201de4ed46cd37f"], false, function(success, data) {
                ok(success);
                var requests = getRequests(data);
                equals(requests.length, 1, "Expect that we only made one request");
                equals(requests[0].parameters["sakai:messagebox"], "trash", "Expect that the message was put in the trash");
                start();
            });
        });

        asyncTest("Delete Message", 3, function() {
            sakai.api.Communication.deleteMessages(["/~stuart/message/inbox/192aa0c0e5e73d2137c193160201de4ed46cd37f"], true, function(success, data) {
                ok(success);
                var requests = getRequests(data);
                equals(requests.length, 1, "Expect that we only made one request");
                equals(requests[0].parameters[":operation"], "delete", "Expect that the message was deleted");
                start();
            });
        });

        asyncTest("Mark Message Read", 3, function() {
            sakai.api.Communication.markMessagesAsRead(["/~stuart/message/inbox/192aa0c0e5e73d2137c193160201de4ed46cd37f"], function(success, data) {
                ok(success);
                var requests = getRequests(data);
                equals(requests.length, 1, "Expect that we only made one request");
                equals(requests[0].parameters["sakai:read"], "true", "Expect that the message was marked as read");
                start();
            });
        });

        asyncTest("Count Unread Messages", 2, function() {
            sakai.api.Communication.getUnreadMessageCount("inbox", function(success, data) {
                ok(success);
                start();
                same({count:[]}, data, "Expect empty count");
            });
        });

    });
});
