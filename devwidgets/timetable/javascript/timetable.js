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
/*
 * Dependencies
 *
 * /dev/lib/jquery/jquery-ui.full.js
 * /dev/lib/jquery/jquery-ui-datepicker.js (datepicker)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 */
require(["jquery", "sakai/sakai.api.core", "/dev/lib/jquery/jquery-ui-datepicker.js"], function($, sakai){

    /**
     * @name sakai_global.timetable
     *
     * @class timetable
     *
     * @description
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.timetable = function(tuid, showSettings){
    
        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        
        var $rootel = $("#" + tuid);
        var timetableTemplateContainer = "timetable_main_template";
        
        var $settingsContainer = $("#timetable_settings", $rootel);
        var $settingsForm = $("#timetable_settings_form", $rootel);
        
        var $addEventContainer = $("#new_event_entry", $rootel);
        var $addEventForm = $('form', $addEventContainer);
        var $addEventFormDateInput = $('.n_e_date', $addEventForm);
        var $addEventFormNuds = $('.n_e_time', $addEventForm);
        var $addEventFormSelect = $("select#n_e_type", $addEventForm);
        
        var $mainContainer = $("#timetable_main", $rootel);
        var $addEventLinks;
        
        var $eventList, $eventInfo;
        
        var data = {};
        var startDate, endDate;
        
        
        ///////////////////////
        // Utility functions //
        ///////////////////////     
        
        var showAddEventEntry = function(hash){
            hash.w.show();
            $rootel = $("#" + hash.w.attr("id") + "." + hash.w.attr("class").split(" ").join("."));
        };
        
        var hideAddEventEntry = function(hash){
            $rootel = $("#" + tuid);
            hash.o.remove();
            hash.w.hide();
        };
        
        /**
         *
         * @param {Object} success
         * @param {Object} loadedData
         */
        function hideAndRemoveOldEventsAndRenderTemplate(success, loadedData){
            data.events = [];
            if (success) {
                for (var i = 0; i < loadedData.events.length; i++) {
                    var event = loadedData.events[i];
                    var date = new Date(event.start);
                    var now = new Date();
                    if (date >= now) {
                        data.events.push(event);
                    }
                    else {
                        //TODO delete the event
                    }
                }
            }
            
            $mainContainer.html(sakai.api.Util.TemplateRenderer(timetableTemplateContainer, {
                "data": data
            }, false, false));
            $eventList = $('#event_entries #event_entries_list', $mainContainer);
            $eventInfo = $('#event_entry_info', $mainContainer);
            if (!$mainContainer.is(':visible')) {
                $mainContainer.show();
            }
            $eventInfo.height($eventList.height() - 63);
            $(".sort_events_container select", $mainContainer).change(sortEventsChangeEvent).change();
        }
        
        /**
         *
         * @param {Time} start
         * @param {Time} end
         */
        function convertTwoTimeObjectToAReadableString(start, end){
            // date
            var start_date = start.getDate();
            var start_month = start.getMonth();
            var start_year = start.getFullYear();
            
            var end_date = end.getDate();
            var end_month = end.getMonth();
            var end_year = end.getFullYear();
            
            // time
            var start_hour = start.getHours() + "";
            if (start_hour.length == 1) {
                start_hour = "0" + start_hour;
            }
            var start_min = start.getMinutes() + "";
            if (start_min.length == 1) {
                start_min = "0" + start_min;
            }
            var end_hour = end.getHours() + "";
            if (end_hour.length == 1) {
                end_hour = "0" + end_hour;
            }
            var end_min = end.getMinutes() + "";
            if (end_min.length == 1) {
                end_min = "0" + end_min;
            }
            
            var dayNames = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
            var monthNames = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
            
            
            if (start_date === end_date && start_month == end_month && start_year == end_year) {
                //Wednesday February 12, 2012, 14:00-15:00
                return dayNames[start.getDay()] + ' ' + monthNames[start_month] + ' ' + start_date + ', ' + start_year + ', ' + start_hour + ':' + start_min + '-' + end_hour + ':' + end_min;
            }
            else {
                //Wednesday February 12, 2012, 14:00 - Thursday February 12, 2012, 15:00
                return dayNames[start.getDay()] + ' ' + monthNames[start_month] + ' ' + start_date + ', ' + start_year + ', ' + start_hour + ':' + start_min + ' - ' + dayNames[end.getDay()] + ' ' + monthNames[end_month] + ' ' + end_date + ', ' + end_year + ', ' + end_hour + ':' + end_min
            }
        }
        
        /**
         *
         * @param {String} date
         */
        function fromDateToHourInAMorPM(date){
            date = new Date(date);
            var hour = date.getHours();
            var AMorPM = "AM";
            if (hour > 12) {
                hour - 12;
                AMorPM = "PM";
            }
            return hour + AMorPM;
        }
        
        ////////////////////
        // Event Handlers //
        ////////////////////  
        
        $settingsForm.bind("submit", function(ev){
            // Settings finished, switch to Main view
            sakai.api.Widgets.Container.informFinish(tuid, "timetable");
            return false;
        });
        
        var eventListClickEvent = function(){
            if ($(this).hasClass('selected')) {
                return;
            }
            $eventList.find('li.selected').removeClass('selected');
            $(this).addClass('selected');
            $eventInfo.removeClass(); //removes all the classes.
            $eventInfo.addClass('selected_index_' + $(this).index());
            
            //retrieve notes:
            var id = $(this).attr('data-id');
            for (i = 0; i < data.events.length; i++) {
                var e = data.events[i];
                if (e.id == id) {
                    //fill in details
                    $('#event_entry_info_details h3', $eventInfo).html(e.title);
                    $('#event_entry_info_details strong', $eventInfo).html(fromDateToHourInAMorPM(e.start) + ' - ' + fromDateToHourInAMorPM(e.end));
                    $('#event_entry_info_notes p', $eventInfo).html(e.description);
                }
            }
            $eventInfo.show();
        };
        
        var sortEventsChangeEvent = function(){
            var listitems = $eventList.children('li').get();
            var selectVal = $(this).val();
            
            var compA, compB;
            
            listitems.sort(function(a, b){
                if (selectVal == 'Id') {
                    compA = parseInt($(a).attr('data-id'), 10);
                    compB = parseInt($(b).attr('data-id'), 10);
                }
                else {
                    for (i = 0; i < data.events.length; i++) {
                        var e = data.events[i];
                        if (e.id == $(a).attr('data-id')) {
                            compA = e.start;
                        }
                    }
                    for (i = 0; i < data.events.length; i++) {
                        var e = data.events[i];
                        if (e.id == $(b).attr('data-id')) {
                            compB = e.start;
                        }
                    }
                }
                return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
            })
            $.each(listitems, function(idx, itm){
                $eventList.append(itm);
            });
            
            // if the first event was selected and it's on a different place now, the box should have a curved border on the top left
            $eventInfo.removeClass();
            $eventInfo.addClass('selected_index_' + $eventList.find('li.selected').index());
        };
        
        /////////////////////////////
        // Initialization function //
        /////////////////////////////       
        
        var doCreateEvent = function(){
            var event = {
                'id': data.events.length, // temp created my own id system
                'title': $.trim($('#n_e_title', $addEventForm).val()),
                'start': startDate,
                'end': endDate,
                'description': $.trim($('#n_e_description', $addEventForm).val())
            };
            event.readableTime = convertTwoTimeObjectToAReadableString(event.start, event.end);
            data.events.push(event);
            
            sakai.api.Widgets.saveWidgetData(tuid, data, function(success){
                if (success) {
                    sakai.api.Widgets.Container.informFinish(tuid, "timetable");
                    sakai.api.Widgets.loadWidgetData(tuid, function(success, loadedData){
                        hideAndRemoveOldEventsAndRenderTemplate(success, loadedData);
                    });
                }
                else {
                    alert('something went wrong saving the date');
                }
            });
            $addEventContainer.jqmHide();
        };
        
        var initialiseStartAndEndDate = function(){
            startDate = new Date($('.n_e_date', '#new_event_starts').val() + ' ' + $('.n_e_time', '#new_event_starts').val());
            endDate = new Date($('.n_e_date', '#new_event_ends').val() + ' ' + $('.n_e_time', '#new_event_ends').val());
        }
        
        var doValidateAddEventForm = function(){
            $.validator.addMethod("n_e_time", function(value, element){
                return this.optional(element) || /^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/.test(value);
            }, "Invalit format, use only 'hh:mm' please.");
            
            $.validator.addMethod("timeComparison", function(value, element){
                initialiseStartAndEndDate();
                return startDate < endDate;
            }, 'End date must be greater than start date, please.');
            
            $addEventForm.validate({
                onclick: false,
                onkeyup: false,
                onfocusout: false,
                submitHandler: function(form, validator){
                    doCreateEvent();
                    return false;
                },
                errorPlacement: function(){
                }
            });
            
            //SUGGESTION add a validation start date >= Time.now
        }
        
        var doSetupDateAndTimePicker = function(){
            // datepicker               
            $addEventFormDateInput.datepicker({
                dateFormat: 'mm/dd/yy',
                hideIfNoPrevNext: true,
                showOtherMonths: true
            });
            
            // timepicker
            $addEventFormNuds.each(function(){
                var $timeinput = $(this);
                
                // add UI elements
                $timeinput.after('<div class="ayrton_nud"><a class="ayrton_nud_u">up</a><a class="ayrton_nud_d">down</a></div>');
                
                // clickhandler
                var mininterval = 15;
                $timeinput.parent().find('a').click(function(){
                    var tval = $timeinput.val();
                    
                    var th = parseInt(tval.split(':')[0], 10);
                    var tm = parseInt(tval.split(':')[1], 10);
                    
                    if ($(this).hasClass('ayrton_nud_u')) {
                        tm += mininterval;
                        if (tm >= 60) {
                            th += 1;
                            tm -= 60;
                        }
                        
                        if (th > 23) {
                            th = 0;
                        }
                    }
                    else 
                        if ($(this).hasClass('ayrton_nud_d')) {
                            tm -= mininterval;
                            if (tm < 0) {
                                th -= 1;
                                tm += 60;
                            }
                            
                            if (th < 0) {
                                th = 23;
                            }
                        }
                        else {
                            return;
                        }
                    
                    // make sure there's a 0x prefix
                    th += '';
                    tm += '';
                    if (th.length < 2) {
                        th = '0' + th;
                    }
                    if (tm.length < 2) {
                        tm = '0' + tm;
                    }
                    $timeinput.val(th + ':' + tm);
                    
                });
            });
        };
        
        var doFillInEventTypes = function(){
            // filling in all event types in the dropdown
            var event_types_arr = ['Lecture', 'Seminar'], event_types_options = '';
            for (var i = 0; i < event_types_arr.length; i++) {
                event_types_options += '<option value="' + event_types_arr[i] + '">' + event_types_arr[i] + '</option>';
            }
            $addEventFormSelect.html(event_types_options);
        };
        
        
        var doInit = function(){
            if (showSettings) {
                $settingsContainer.show();
            }
            else {
                // Load the widget data
                sakai.api.Widgets.loadWidgetData(tuid, function(success, loadedData){
                    // setting up the Add Event modal screen
                    $addEventContainer.jqm({
                        modal: true,
                        overlay: 20,
                        zIndex: 5000,
                        toTop: true,
                        onHide: hideAddEventEntry,
                        onShow: showAddEventEntry
                    });
                    
                    doFillInEventTypes();
                    data.isManager = sakai_global.currentgroup.manager;
                    hideAndRemoveOldEventsAndRenderTemplate(success, loadedData);
                    
                    $addEventLinks = $('a.add_event_link', $mainContainer);
                    $addEventLinks.click(function(){
                        $addEventContainer.jqmShow();
                    });
                    
                    $eventList.find('li').live('click', eventListClickEvent);
                    
                    doSetupDateAndTimePicker();
                    doValidateAddEventForm();
                });
            }
        };
        doInit();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("timetable");
});
