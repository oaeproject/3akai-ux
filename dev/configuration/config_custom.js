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
define(["config/config"], function(config) {

    // Custom CSS Files to load in
    config.skinCSS = ["/dev/skins/default/skin.css"];

    /**
     * Kaltura Settings
     */
    config.kaltura = {
        serverURL:  "http://www.kaltura.com",
        partnerId:  "INSERT_YOUR_PARTNER_ID_HERE",
        playerId: "INSERT_YOUR_PLAYER_ID_HERE"
    };

    /**
     * Add Kaltura mime-types
     */
    config.MimeTypes['kaltura/video'] = {
        cssClass: "icon-video-sprite",
        URL: "/dev/images/mimetypes/video.png",
        description: "KALTURA_VIDEO_FILE"
    };
    config.MimeTypes['kaltura/audio'] = {
        cssClass: "icon-sound-sprite",
        URL: "/dev/images/mimetypes/sound.png",
        description: "KALTURA_AUDIO_FILE"
    };

    return config;
});
