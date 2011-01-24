/**
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
 *
 */
define(
    [
        "sakai/sakai.api.communication",
        "sakai/sakai.api.content",
        "sakai/sakai.api.groups",
        "sakai/sakai.api.i18n",
        "sakai/sakai.api.l10n",
        "sakai/sakai.api.server",
        "sakai/sakai.api.user",
        "sakai/sakai.api.util",
        "sakai/sakai.api.widgets",
        "/dev/configuration/config.js"
    ],
        function(sakai_comm,
                sakai_content,
                sakai_groups,
                sakai_i18n,
                sakai_l10n,
                sakai_server,
                sakai_user,
                sakai_util,
                sakai_widgets,
                sakai_conf) {

    return {

        api : {
            Communication : sakai_comm,
            Groups : sakai_groups,
            i18n : sakai_i18n,
            l10n : sakai_l10n,
            Security : sakai_util.Security,
            Server : sakai_server,
            User : sakai_user,
            Util : sakai_util,
            Widgets : sakai_widgets
        },
        config : sakai_conf
    };
    
});
