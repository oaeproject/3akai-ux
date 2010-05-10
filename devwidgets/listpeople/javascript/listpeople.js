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
 * People Lister widget
 * This is a general widget which aims to display an arbitriary number of
 * people, loading dynamically if the list is very long.
 * Also this is a first attempt at implementing a general UI component which
 * needs to be part of the frontend API as a widget.
 */

/*global $, Config, sdata */

// Namespaces
var sakai = sakai || {};
sakai.api.UI.listPeople = {};

/**
 * Initialize the listpeople widget
 * This is the widget loader's default callback
 * @param tuid {String} Unique id of the widget
 * @param showSettings {Boolean} Show the settings of the widget or not
 */
sakai.listpeople = function(tuid, showSettings){

    // Reset to defaults
    sakai.api.UI.listPeople.init(tuid);
};

/**
 * Reset
 * Resets the people lister to a default state
 * @param tuid {String} Unique id of the widget
 * @returns void
 */
sakai.api.UI.listPeople.reset = function(tuid) {

};

/**
 * Render
 * Renders the people lister with a specified set of data. Usually this data is
 * a result JSON coming from a search servlet.
 * @param tuid {String} Unique id of the widget
 * @param iData {Array} An array of objects, containing the to be dsplayed user's
 * name, picture etc...
 * @returns void
 */
sakai.api.UI.listPeople.render = function(tuid, iData) {

};



sdata.widgets.WidgetLoader.informOnLoad("listpeople");
