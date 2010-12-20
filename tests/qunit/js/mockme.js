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
 
/**
 * MockMe - a mock for /system/me
 *
 * Not included by default in sakai_qunit_lib as the integration tests need a real response from /system/me
 */

$.mockjax({
    url: "/system/me",
    responseText: {
        "user":
        {
            "anon":true,
            "subjects":
            [
            ],
            "superUser":false
        },
        "profile":
        {
            "sakai:search-exclude-tree":true,
            "jcr:path":"/~anonymous/public/authprofile",
            "lastName":"User",
            "jcr:uuid":"3fb3e6fb-2606-4507-8940-9a7d38ec1b08",
            "jcr:mixinTypes":
            [
                "mix:referenceable"
            ],
            "sling:resourceType":"sakai/user-profile",
            "email":"anon@sakai.invalid",
            "basic":
            {
                "jcr:path":"/~anonymous/public/authprofile/basic",
                "jcr:name":"basic",
                "access":"everybody",
                "elements":
                {
                    "jcr:path":"/~anonymous/public/authprofile/basic/elements",
                    "lastName":
                    {
                        "jcr:path":"/~anonymous/public/authprofile/basic/elements/lastName",
                        "jcr:name":"lastName",
                        "value":"User",
                        "jcr:primaryType":"nt:unstructured"
                    },
                    "email":
                    {
                        "jcr:path":"/~anonymous/public/authprofile/basic/elements/email",
                        "jcr:name":"email",
                        "value":"anon@sakai.invalid",
                        "jcr:primaryType":"nt:unstructured"
                    },
                    "jcr:name":"elements",
                    "firstName":
                    {
                        "jcr:path":"/~anonymous/public/authprofile/basic/elements/firstName",
                        "jcr:name":"firstName",
                        "value":"Anonymous",
                        "jcr:primaryType":"nt:unstructured"
                    },
                    "jcr:primaryType":"nt:unstructured"
                },
                "jcr:primaryType":"nt:unstructured"
            },
            "rep:userId":"anonymous",
            "path":"/a/an/anonymous",
            "jcr:name":"authprofile",
            "firstName":"Anonymous",
            "jcr:primaryType":"nt:unstructured"
        },
        "messages":
        {
            "unread":0
        },
        "contacts":
        {
        },
        "groups":
        [
        ]
    }
});