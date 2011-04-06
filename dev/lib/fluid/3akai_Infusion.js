/* 3akai_Infusion.js
 * custom build for Sakai
 * built with: ant customBuild -Dinclude="uploader, reorderer" -Dexclude="jQuery, jQueryUICore, jQueryUIWidgets, jQueryTooltipPlugin" -Djsfilename="3akai_Infusion.js" -DnoMinify="true"
 */

/*
Copyright 2007-2010 University of Cambridge
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, YAHOO, opera*/
var fluid_1_2 = fluid_1_2 || {};
var fluid = fluid || fluid_1_2;
require(["jquery", "/dev/lib/jquery/jquery-ui.full.js"], function(jQuery) {
    (function ($, fluid) {

        fluid.version = "Infusion 1.2";

        fluid.environment = {
            fluid: fluid
        };
        var globalObject = window || {};

        /**
         * Causes an error message to be logged to the console and a real runtime error to be thrown.
         * 
         * @param {String|Error} message the error message to log
         */
        fluid.fail = function (message) {
            fluid.setLogging(true);
            fluid.log(message.message? message.message : message);
            throw new Error(message);
            //message.fail(); // Intentionally cause a browser error by invoking a nonexistent function.
        };

        /**
         * Wraps an object in a jQuery if it isn't already one. This function is useful since
         * it ensures to wrap a null or otherwise falsy argument to itself, rather than the
         * often unhelpful jQuery default of returning the overall document node.
         * 
         * @param {Object} obj the object to wrap in a jQuery
         */
        fluid.wrap = function (obj) {
            return ((!obj || obj.jquery) ? obj : $(obj)); 
        };

        /**
         * If obj is a jQuery, this function will return the first DOM element within it.
         * 
         * @param {jQuery} obj the jQuery instance to unwrap into a pure DOM element
         */
        fluid.unwrap = function (obj) {
            return obj && obj.jquery && obj.length === 1 ? obj[0] : obj; // Unwrap the element if it's a jQuery.
        };

        /** 
         * Searches through the supplied object for the first value which matches the one supplied.
         * @param obj {Object} the Object to be searched through
         * @param value {Object} the value to be found. This will be compared against the object's
         * member using === equality.
         * @return {String} The first key whose value matches the one supplied, or <code>null</code> if no
         * such key is found.
         */
        fluid.keyForValue = function (obj, value) {
            for (var key in obj) {
                if (obj[key] === value) {
                    return key;
                }
            }
            return null;
        };

        /**
         * This method is now deprecated and will be removed in a future release of Infusion. 
         * See fluid.keyForValue instead.
         */
        fluid.findKeyInObject = fluid.keyForValue;

        /** 
         * Clears an object or array of its contents. For objects, each property is deleted.
         * 
         * @param {Object|Array} target the target to be cleared
         */
        fluid.clear = function (target) {
            if (target instanceof Array) {
                target.length = 0;
            }
            else {
                for (var i in target) {
                    delete target[i];
                }
            }
        };

        /** A basic utility that returns its argument unchanged */

        fluid.identity = function(arg) {
            return arg;
        }

        // Framework and instantiation functions.

        /**
         * Fetches a single container element and returns it as a jQuery.
         * 
         * @param {String||jQuery||element} an id string, a single-element jQuery, or a DOM element specifying a unique container
         * @return a single-element jQuery of container
         */
        fluid.container = function (containerSpec) {
            var container = containerSpec;
            if (typeof containerSpec === "string" || 
              containerSpec.nodeType && (containerSpec.nodeType === 1  || containerSpec.nodeType === 9)) {
                container = $(containerSpec);
            }

            // Throw an exception if we've got more or less than one element.
            if (!container || !container.jquery || container.length !== 1) {
                if (typeof(containerSpec) !== "string") {
                    containerSpec = container.selector;
                }
                fluid.fail({
                    name: "NotOne",
                    message: "A single container element was not found for selector " + containerSpec
                });
            }

            return container;
        };

        // stubs for two functions in FluidDebugging.js
        fluid.dumpEl = fluid.identity;
        fluid.renderTimestamp = fluid.identity;

        /**
         * Retreives and stores a component's default settings centrally.
         * @param {boolean} (options) if true, manipulate a global option (for the head
         *   component) rather than instance options.
         * @param {String} componentName the name of the component
         * @param {Object} (optional) an container of key/value pairs to set
         * 
         */
        var defaultsStore = {};
        var globalDefaultsStore = {};
        fluid.defaults = function () {
            var offset = 0;
            var store = defaultsStore;
            if (typeof arguments[0] === "boolean") {
                store = globalDefaultsStore;
                offset = 1;
            }
            var componentName = arguments[offset];
            var defaultsObject = arguments[offset + 1];
            if (defaultsObject !== undefined) {
                store[componentName] = defaultsObject;   
                return defaultsObject;
            }

            return store[componentName];
        };

        /**
         * Creates a new DOM Binder instance, used to locate elements in the DOM by name.
         * 
         * @param {Object} container the root element in which to locate named elements
         * @param {Object} selectors a collection of named jQuery selectors
         */
        fluid.createDomBinder = function (container, selectors) {
            var cache = {}, that = {};

            function cacheKey(name, thisContainer) {
                return fluid.allocateSimpleId(thisContainer) + "-" + name;
            }

            function record(name, thisContainer, result) {
                cache[cacheKey(name, thisContainer)] = result;
            }

            that.locate = function (name, localContainer) {
                var selector, thisContainer, togo;

                selector = selectors[name];
                thisContainer = localContainer? localContainer: container;
                if (!thisContainer) {
                    fluid.fail("DOM binder invoked for selector " + name + " without container");
                }

                if (!selector) {
                    return thisContainer;
                }

                if (typeof(selector) === "function") {
                    togo = $(selector.call(null, fluid.unwrap(thisContainer)));
                } else {
                    togo = $(selector, thisContainer);
                }
                if (togo.get(0) === document) {
                    togo = [];
                    //fluid.fail("Selector " + name + " with value " + selectors[name] +
                    //            " did not find any elements with container " + fluid.dumpEl(container));
                }
                if (!togo.selector) {
                    togo.selector = selector;
                    togo.context = thisContainer;
                }
                togo.selectorName = name;
                record(name, thisContainer, togo);
                return togo;
            };
            that.fastLocate = function (name, localContainer) {
                var thisContainer = localContainer? localContainer: container;
                var key = cacheKey(name, thisContainer);
                var togo = cache[key];
                return togo? togo : that.locate(name, localContainer);
            };
            that.clear = function () {
                cache = {};
            };
            that.refresh = function (names, localContainer) {
                var thisContainer = localContainer? localContainer: container;
                if (typeof names === "string") {
                    names = [names];
                }
                if (thisContainer.length === undefined) {
                    thisContainer = [thisContainer];
                }
                for (var i = 0; i < names.length; ++ i) {
                    for (var j = 0; j < thisContainer.length; ++ j) {
                        that.locate(names[i], thisContainer[j]);
                    }
                }
            };

            return that;
        };

        /** Determines whether the supplied object can be treated as an array, by 
         * iterating an index towards its length. The test functions by detecting
         * a property named "length" which is of type "number", but excluding objects
         * which are themselves of type "string".
         */
        fluid.isArrayable = function(totest) {
            return typeof(totest) !== "string" && typeof(totest.length) === "number";
        }

        /**
         * Attaches the user's listeners to a set of events.
         * 
         * @param {Object} events a collection of named event firers
         * @param {Object} listeners optional listeners to add
         */
        fluid.mergeListeners = function (events, listeners) {
            if (listeners) {
                for (var key in listeners) {
                    var value = listeners[key];
                    var keydot = key.indexOf(".");
                    var namespace;
                    if (keydot !== -1) {
                        namespace = key.substring(keydot + 1);
                        key = key.substring(0, keydot);
                    }
                    if (!events[key]) {
                        events[key] = fluid.event.getEventFirer();
                    }   
                    var firer = events[key];
                    if (typeof(value) === "function") {
                        firer.addListener(value, namespace);
                    }
                    else if (value && fluid.isArrayable(value)) {
                        for (var i = 0; i < value.length; ++ i) {
                            firer.addListener(value[i], namespace);
                        }
                    }
                }
            }    
        };

        /**
         * Sets up a component's declared events.
         * Events are specified in the options object by name. There are three different types of events that can be
         * specified: 
         * 1. an ordinary multicast event, specified by "null. 
         * 2. a unicast event, which allows only one listener to be registered
         * 3. a preventable event
         * 
         * @param {Object} that the component
         * @param {Object} options the component's options structure, containing the declared event names and types
         */
        fluid.instantiateFirers = function (that, options) {
            that.events = {};
            if (options.events) {
                for (var event in options.events) {
                    var eventType = options.events[event];
                    that.events[event] = fluid.event.getEventFirer(eventType === "unicast", eventType === "preventable");
                }
            }
            fluid.mergeListeners(that.events, options.listeners);
        };

        /**
         * Merges the component's declared defaults, as obtained from fluid.defaults(),
         * with the user's specified overrides.
         * 
         * @param {Object} that the instance to attach the options to
         * @param {String} componentName the unique "name" of the component, which will be used
         * to fetch the default options from store. By recommendation, this should be the global
         * name of the component's creator function.
         * @param {Object} userOptions the user-specified configuration options for this component
         */
        fluid.mergeComponentOptions = function (that, componentName, userOptions) {
            var defaults = fluid.defaults(componentName); 
            that.options = fluid.merge(defaults? defaults.mergePolicy: null, {}, defaults, userOptions);    
        };


        /** Expect that an output from the DOM binder has resulted in a non-empty set of 
         * results. If none are found, this function will fail with a diagnostic message, 
         * with the supplied message prepended.
         */
        fluid.expectFilledSelector = function (result, message) {
            if (result && result.length === 0 && result.jquery) {
                fluid.fail(message + ": selector \"" + result.selector + "\" with name " + result.selectorName +
                           " returned no results in context " + fluid.dumpEl(result.context));
            }
        };

        /** 
         * The central initialiation method called as the first act of every Fluid
         * component. This function automatically merges user options with defaults,
         * attaches a DOM Binder to the instance, and configures events.
         * 
         * @param {String} componentName The unique "name" of the component, which will be used
         * to fetch the default options from store. By recommendation, this should be the global
         * name of the component's creator function.
         * @param {jQueryable} container A specifier for the single root "container node" in the
         * DOM which will house all the markup for this component.
         * @param {Object} userOptions The configuration options for this component.
         */
        fluid.initView = function (componentName, container, userOptions) {
            var that = {};
            fluid.expectFilledSelector(container, "Error instantiating component with name \"" + componentName); 
            fluid.mergeComponentOptions(that, componentName, userOptions);

            if (container) {
                that.container = fluid.container(container);
                fluid.initDomBinder(that);
            }
            fluid.instantiateFirers(that, that.options);

            return that;
        };

        /** A special "marker object" which is recognised as one of the arguments to 
         * fluid.initSubcomponents. This object is recognised by reference equality - 
         * where it is found, it is replaced in the actual argument position supplied
         * to the specific subcomponent instance, with the particular options block
         * for that instance attached to the overall "that" object.
         */
        fluid.COMPONENT_OPTIONS = {};

        /** Another special "marker object" representing that a distinguished 
         * (probably context-dependent) value should be substituted.
         */
        fluid.VALUE = {};

        /** Construct a dummy or "placeholder" subcomponent, that optionally provides empty
         * implementations for a set of methods.
         */
        fluid.emptySubcomponent = function (options) {
            var that = {};
            options = $.makeArray(options);
            for (var i = 0; i < options.length; ++ i) {
                that[options[i]] = function () {};
            }
            return that;
        };

        /**
         * Creates a new "little component": a that-ist object with options merged into it by the framework.
         * This method is a convenience for creating small objects that have options but don't require full
         * View-like features such as the DOM Binder or events
         * 
         * @param {Object} name the name of the little component to create
         * @param {Object} options user-supplied options to merge with the defaults
         */
        fluid.initLittleComponent = function(name, options) {
            var that = {};
            fluid.mergeComponentOptions(that, name, options);
            return that;
        };

        fluid.initSubcomponent = function (that, className, args) {
            return fluid.initSubcomponents(that, className, args)[0];
        };

        /** Initialise all the "subcomponents" which are configured to be attached to 
         * the supplied top-level component, which share a particular "class name".
         * @param {Component} that The top-level component for which sub-components are
         * to be instantiated. It contains specifications for these subcomponents in its
         * <code>options</code> structure.
         * @param {String} className The "class name" or "category" for the subcomponents to
         * be instantiated. A class name specifies an overall "function" for a class of 
         * subcomponents and represents a category which accept the same signature of
         * instantiation arguments.
         * @param {Array of Object} args The instantiation arguments to be passed to each 
         * constructed subcomponent. These will typically be members derived from the
         * top-level <code>that</code> or perhaps globally discovered from elsewhere. One
         * of these arguments may be <code>fluid.COMPONENT_OPTIONS</code> in which case this
         * placeholder argument will be replaced by instance-specific options configured
         * into the member of the top-level <code>options</code> structure named for the
         * <code>className</code>
         * @return {Array of Object} The instantiated subcomponents, one for each member
         * of <code>that.options[className]</code>.
         */

        fluid.initSubcomponents = function (that, className, args) {
            var entry = that.options[className];
            if (!entry) {
                return;
            }
            var entries = $.makeArray(entry);
            var optindex = -1;
            var togo = [];
            args = $.makeArray(args);
            for (var i = 0; i < args.length; ++ i) {
                if (args[i] === fluid.COMPONENT_OPTIONS) {
                    optindex = i;
                }
            }
            for (i = 0; i < entries.length; ++ i) {
                entry = entries[i];
                if (optindex !== -1 && entry.options) {
                    args[optindex] = entry.options;
                }
                if (typeof(entry) !== "function") {
                    var entryType = typeof(entry) === "string"? entry : entry.type;
                    var globDef = fluid.defaults(true, entryType);
                    fluid.merge("reverse", that.options, globDef);
                    togo[i] = entryType === "fluid.emptySubcomponent"?
                       fluid.emptySubcomponent(entry.options) : 
                       fluid.invokeGlobalFunction(entryType, args, {fluid: fluid});
                }
                else {
                    togo[i] = entry.apply(null, args);
                }

                var returnedOptions = togo[i]? togo[i].returnedOptions : null;
                if (returnedOptions) {
                    fluid.merge(that.options.mergePolicy, that.options, returnedOptions);
                    if (returnedOptions.listeners) {
                        fluid.mergeListeners(that.events, returnedOptions.listeners);
                    }
                }
            }
            return togo;
        };

        /**
         * Creates a new DOM Binder instance for the specified component and mixes it in.
         * 
         * @param {Object} that the component instance to attach the new DOM Binder to
         */
        fluid.initDomBinder = function (that) {
            that.dom = fluid.createDomBinder(that.container, that.options.selectors);
            that.locate = that.dom.locate;      
        };


        /** Returns true if the argument is a primitive type **/
        fluid.isPrimitive = function (value) {
            var valueType = typeof(value);
            return !value || valueType === "string" || valueType === "boolean" || valueType === "number" || valueType === "function";
        };

        function mergeImpl(policy, basePath, target, source) {
            var thisPolicy = policy && typeof(policy) !== "string"? policy[basePath] : policy;
            if (typeof(thisPolicy) === "function") {
                thisPolicy.apply(null, target, source);
                return target;
            }
            if (thisPolicy === "replace") {
                fluid.clear(target);
            }

            for (var name in source) {
                var path = (basePath? basePath + ".": "") + name;
                var thisTarget = target[name];
                var thisSource = source[name];
                var primitiveTarget = fluid.isPrimitive(thisTarget);

                if (thisSource !== undefined) {
                    if (thisSource !== null && typeof thisSource === 'object' &&
                          !thisSource.nodeType && !thisSource.jquery && thisSource !== fluid.VALUE) {
                        if (primitiveTarget) {
                            target[name] = thisTarget = thisSource instanceof Array? [] : {};
                        }
                        mergeImpl(policy, path, thisTarget, thisSource);
                    }
                    else {
                        if (thisTarget === null || thisTarget === undefined || thisPolicy !== "reverse") {
                            target[name] = thisSource;
                        }
                    }
                }
            }
            return target;
        }

        /** Merge a collection of options structures onto a target, following an optional policy.
         * This function is typically called automatically, as a result of an invocation of
         * <code>fluid.iniView</code>. The behaviour of this function is explained more fully on
         * the page http://wiki.fluidproject.org/display/fluid/Options+Merging+for+Fluid+Components .
         * @param policy {Object/String} A "policy object" specifiying the type of merge to be performed.
         * If policy is of type {String} it should take on the value "reverse" or "replace" representing
         * a static policy. If it is an
         * Object, it should contain a mapping of EL paths onto these String values, representing a
         * fine-grained policy. If it is an Object, the values may also themselves be EL paths 
         * representing that a default value is to be taken from that path.
         * @param target {Object} The options structure which is to be modified by receiving the merge results.
         * @param options1, options2, .... {Object} an arbitrary list of options structure which are to
         * be merged "on top of" the <code>target</code>. These will not be modified.    
         */

        fluid.merge = function (policy, target) {
            var path = "";

            for (var i = 2; i < arguments.length; ++i) {
                var source = arguments[i];
                if (source !== null && source !== undefined) {
                    mergeImpl(policy, path, target, source);
                }
            }
            if (policy && typeof(policy) !== "string") {
                for (var key in policy) {
                    var elrh = policy[key];
                    if (typeof(elrh) === 'string' && elrh !== "replace") {
                        var oldValue = fluid.model.getBeanValue(target, key);
                        if (oldValue === null || oldValue === undefined) {
                            var value = fluid.model.getBeanValue(target, elrh);
                            fluid.model.setBeanValue(target, key, value);
                        }
                    }
                }
            }
            return target;     
        };

        /** Return an empty container as the same type as the argument (either an
         * array or hash */
        fluid.freshContainer = function(tocopy) {
            return fluid.isArrayable(tocopy)? [] : {};   
        };

        /** Performs a deep copy (clone) of its argument **/

        fluid.copy = function (tocopy) {
            if (fluid.isPrimitive(tocopy)) {
                return tocopy;
            }
            return $.extend(true, fluid.freshContainer(tocopy), tocopy);
        };

        fluid.getGlobalValue = function(path, env) {
            env = env || fluid.environment;
            return fluid.model.getBeanValue(globalObject, path, env);
        };

        /**
         * Allows for the calling of a function from an EL expression "functionPath", with the arguments "args", scoped to an framework version "environment".
         * @param {Object} functionPath - An EL expression
         * @param {Object} args - An array of arguments to be applied to the function, specified in functionPath
         * @param {Object} environment - (optional) The object to scope the functionPath to  (typically the framework root for version control)
         */
        fluid.invokeGlobalFunction = function (functionPath, args, environment) {
            var func = fluid.getGlobalValue(functionPath, environment);
            if (!func) {
                fluid.fail("Error invoking global function: " + functionPath + " could not be located");
            } else {
                return func.apply(null, args);
            }
        };

        /** Registers a new global function at a given path (currently assumes that
         * it lies within the fluid namespace)
         */

        fluid.registerGlobalFunction = function (functionPath, func, env) {
            env = env || fluid.environment;
            fluid.model.setBeanValue(globalObject, functionPath, func, env);
        };

        fluid.registerGlobal = fluid.registerGlobalFunction;

        /** Ensures that an entry in the global namespace exists **/
        fluid.registerNamespace = function (naimspace, env) {
            env = env || fluid.environment;
            var existing = fluid.getGlobalValue(naimspace, env);
            if (!existing) {
                existing = {};
                fluid.registerGlobal(naimspace, existing, env);
            }
            return existing;
        };

        // The Model Events system.

        fluid.event = {};

        var fluid_guid = 1;
        /** Construct an "event firer" object which can be used to register and deregister 
         * listeners, to which "events" can be fired. These events consist of an arbitrary
         * function signature. General documentation on the Fluid events system is at
         * http://wiki.fluidproject.org/display/fluid/The+Fluid+Event+System .
         * @param {Boolean} unicast If <code>true</code>, this is a "unicast" event which may only accept
         * a single listener.
         * @param {Boolean} preventable If <code>true</code> the return value of each handler will 
         * be checked for <code>false</code> in which case further listeners will be shortcircuited, and this
         * will be the return value of fire()
         */

        fluid.event.getEventFirer = function (unicast, preventable) {
            var log = fluid.log;
            var listeners = {};
            return {
                addListener: function (listener, namespace, predicate) {
                    if (!listener) {
                        return;
                    }
                    if (unicast) {
                        namespace = "unicast";
                    }
                    if (!namespace) {
                        if (!listener.$$guid) {
                            listener.$$guid = fluid_guid++;
                        }
                        namespace = listener.$$guid;
                    }

                    listeners[namespace] = {listener: listener, predicate: predicate};
                },

                removeListener: function (listener) {
                    if (typeof(listener) === 'string') {
                        delete listeners[listener];
                    }
                    else if (typeof(listener) === 'object' && listener.$$guid) {
                        delete listeners[listener.$$guid];
                    }
                },

                fire: function () {
                    for (var i in listeners) {
                        var lisrec = listeners[i];
                        var listener = lisrec.listener;
                        if (lisrec.predicate && !lisrec.predicate(listener, arguments)) {
                            continue;
                        }
                        try {
                            var ret = listener.apply(null, arguments);
                            if (preventable && ret === false) {
                                return false;
                            }
                        }
                        catch (e) {
                            log("FireEvent received exception " + e.message + " e " + e + " firing to listener " + i);
                            throw (e);       
                        }
                    }
                }
            };
        };


        // Model functions

        fluid.model = {};

        /** Copy a source "model" onto a target **/
        fluid.model.copyModel = function (target, source) {
            fluid.clear(target);
            $.extend(true, target, source);
        };

        /** Parse an EL expression separated by periods (.) into its component segments.
         * @param {String} EL The EL expression to be split
         * @return {Array of String} the component path expressions.
         * TODO: This needs to be upgraded to handle (the same) escaping rules (as RSF), so that
         * path segments containing periods and backslashes etc. can be processed.
         */
        fluid.model.parseEL = function (EL) {
            return String(EL).split('.');
        };

        fluid.model.composePath = function (prefix, suffix) {
            return prefix === ""? suffix : prefix + "." + suffix;
        };

        fluid.model.getPenultimate = function (root, EL, environment, create) {
            var segs = fluid.model.parseEL(EL);
            for (var i = 0; i < segs.length - 1; ++i) {
                if (!root) {
                    return root;
                }
                var segment = segs[i];
                if (environment && environment[segment]) {
                    root = environment[segment];
                    environment = null;
                }
                else {
                    if (root[segment] === undefined && create) {
                        root[segment] = {};
                        }
                    root = root[segment];
                }
            }
            return {root: root, last: segs[segs.length - 1]};
        };

        fluid.model.setBeanValue = function (root, EL, newValue, environment) {
            var pen = fluid.model.getPenultimate(root, EL, environment, true);
            pen.root[pen.last] = newValue;
        };

        /** Evaluates an EL expression by fetching a dot-separated list of members
         * recursively from a provided root.
         * @param root The root data structure in which the EL expression is to be evaluated
         * @param {string} EL The EL expression to be evaluated
         * @param environment An optional "environment" which, if it contains any members
         * at top level, will take priority over the root data structure.
         * @return The fetched data value.
         */

        fluid.model.getBeanValue = function (root, EL, environment) {
            if (EL === "" || EL === null || EL === undefined) {
                return root;
            }
            var pen = fluid.model.getPenultimate(root, EL, environment);
            return pen.root? pen.root[pen.last] : pen.root;
        };

        // Logging
        var logging;
        /** method to allow user to enable logging (off by default) */
        fluid.setLogging = function (enabled) {
            if (typeof enabled === "boolean") {
                logging = enabled;
            } else {
                logging = false;
            }
        };

        /** Log a message to a suitable environmental console. If the standard "console" 
         * stream is available, the message will be sent there - otherwise either the
         * YAHOO logger or the Opera "postError" stream will be used. Logging must first
         * be enabled with a call fo the fluid.setLogging(true) function.
         */
        fluid.log = function (str) {
            if (logging) {
                str = fluid.renderTimestamp(new Date()) + ":  " + str;
                if (typeof(console) !== "undefined") {
                    if (console.debug) {
                        console.debug(str);
                    } else {
                        console.log(str);
                    }
                }
                else if (typeof(YAHOO) !== "undefined") {
                    YAHOO.log(str);
                }
                else if (typeof(opera) !== "undefined") {
                    opera.postError(str);
                }
            }
        };

        // DOM Utilities.

        /**
         * Finds the nearest ancestor of the element that passes the test
         * @param {Element} element DOM element
         * @param {Function} test A function which takes an element as a parameter and return true or false for some test
         */
        fluid.findAncestor = function (element, test) {
            element = fluid.unwrap(element);
            while (element) {
                if (test(element)) {
                    return element;
                }
                element = element.parentNode;
            }
        };

        /**
         * Returns a jQuery object given the id of a DOM node. In the case the element
         * is not found, will return an empty list.
         */
        fluid.jById = function (id, dokkument) {
            dokkument = dokkument && dokkument.nodeType === 9? dokkument : document;
            var element = fluid.byId(id, dokkument);
            var togo = element? $(element) : [];
            togo.selector = "#" + id;
            togo.context = dokkument;
            return togo;
        };

        /**
         * Returns an DOM element quickly, given an id
         * 
         * @param {Object} id the id of the DOM node to find
         * @param {Document} dokkument the document in which it is to be found (if left empty, use the current document)
         * @return The DOM element with this id, or null, if none exists in the document.
         */
        fluid.byId = function (id, dokkument) {
            dokkument = dokkument && dokkument.nodeType === 9? dokkument : document;
            var el = dokkument.getElementById(id);
            if (el) {
                if (el.getAttribute("id") !== id) {
                    fluid.fail("Problem in document structure - picked up element " +
                    fluid.dumpEl(el) +
                    " for id " +
                    id +
                    " without this id - most likely the element has a name which conflicts with this id");
                }
                return el;
            }
            else {
                return null;
            }
        };

        /**
         * Returns the id attribute from a jQuery or pure DOM element.
         * 
         * @param {jQuery||Element} element the element to return the id attribute for
         */
        fluid.getId = function (element) {
            return fluid.unwrap(element).getAttribute("id");
        };

        /** 
         * Allocate an id to the supplied element if it has none already, by a simple
         * scheme resulting in ids "fluid-id-nnnn" where nnnn is an increasing integer.
         */

        fluid.allocateSimpleId = function (element) {
            element = fluid.unwrap(element);
            if (!element.id) {
                element.id = "fluid-id-" + (fluid_guid++); 
            }
            return element.id;
        };


        // Functional programming utilities.

        function transformInternal(source, togo, key, args) {
            var transit = source[key];
                for (var j = 0; j < args.length - 1; ++ j) {
                    transit = args[j + 1](transit, key);
                }
            togo[key] = transit; 
        }

        /** Return a list or hash of objects, transformed by one or more functions. Similar to
         * jQuery.map, only will accept an arbitrary list of transformation functions and also
         * works on non-arrays.
         * @param list {Array or Object} The initial container of objects to be transformed.
         * @param fn1, fn2, etc. {Function} An arbitrary number of optional further arguments,
         * all of type Function, accepting the signature (object, index), where object is the
         * list member to be transformed, and index is its list index. Each function will be
         * applied in turn to each list member, which will be replaced by the return value
         * from the function.
         * @return The finally transformed list, where each member has been replaced by the
         * original member acted on by the function or functions.
         */
        fluid.transform = function (source) {
            var togo = fluid.freshContainer(source);
            if (fluid.isArrayable(source)) {
                for (var i = 0; i < source.length; ++ i) {
                    transformInternal(source, togo, i, arguments);
                }
            }
            else {
                for (var key in source) {
                    transformInternal(source, togo, key, arguments);
                }
            }  
            return togo;
        };

        /** Scan through a list of objects, terminating on and returning the first member which
         * matches a predicate function.
         * @param list {Array} The list of objects to be searched.
         * @param fn {Function} A predicate function, acting on a list member. A predicate which
         * returns any value which is not <code>null</code> or <code>undefined</code> will terminate
         * the search. The function accepts (object, index).
         * @param deflt {Object} A value to be returned in the case no predicate function matches
         * a list member. The default will be the natural value of <code>undefined</code>
         * @return The first return value from the predicate function which is not <code>null</code>
         * or <code>undefined</code>
         */
        fluid.find = function (list, fn, deflt) {
            for (var i = 0; i < list.length; ++ i) {
                var transit = fn(list[i], i);
                if (transit !== null && transit !== undefined) {
                    return transit;
                }
            }
            return deflt;
        };

        /** Scan through a list of objects, "accumulating" a value over them 
         * (may be a straightforward "sum" or some other chained computation).
         * @param list {Array} The list of objects to be accumulated over.
         * @param fn {Function} An "accumulation function" accepting the signature (object, total, index) where
         * object is the list member, total is the "running total" object (which is the return value from the previous function),
         * and index is the index number.
         * @param arg {Object} The initial value for the "running total" object.
         * @return {Object} the final running total object as returned from the final invocation of the function on the last list member.
         */
        fluid.accumulate = function (list, fn, arg) {
            for (var i = 0; i < list.length; ++ i) {
                arg = fn(list[i], arg, i);
            }
            return arg;
        };

        /** Can through a list of objects, removing those which match a predicate. Similar to
         * jQuery.grep, only acts on the list in-place by removal, rather than by creating
         * a new list by inclusion.
         * @param list {Array} The list of objects to be scanned over.
         * @param fn {Function} A predicate function determining whether an element should be
         * removed. This accepts the standard signature (object, index) and returns a "truthy"
         * result in order to determine that the supplied object should be removed from the list.
         * @return The list, transformed by the operation of removing the matched elements. The
         * supplied list is modified by this operation.
         */
        fluid.remove_if = function (list, fn) {
            for (var i = 0; i < list.length; ++ i) {
                if (fn(list[i], i)) {
                    list.splice(i, 1);
                    --i;
                }
            }
            return list;
        };


        // Other useful helpers.

        /**
         * Simple string template system. 
         * Takes a template string containing tokens in the form of "%value".
         * Returns a new string with the tokens replaced by the specified values.
         * Keys and values can be of any data type that can be coerced into a string. Arrays will work here as well.
         * 
         * @param {String}    template    a string (can be HTML) that contains tokens embedded into it
         * @param {object}    values        a collection of token keys and values
         */
        fluid.stringTemplate = function (template, values) {
            var newString = template;
            for (var key in values) {
                var searchStr = "%" + key;
                newString = newString.replace(searchStr, values[key]);
            }
            return newString;
        };

    })(jQuery, fluid_1_2);
    /*
    Copyright 2008-2010 University of Cambridge
    Copyright 2008-2009 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    // Declare dependencies.
    /*global jQuery */

    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {

        fluid.dom = fluid.dom || {};

        // Node walker function for iterateDom.
        var getNextNode = function (iterator) {
            if (iterator.node.firstChild) {
                iterator.node = iterator.node.firstChild;
                iterator.depth += 1;
                return iterator;
            }
            while (iterator.node) {
                if (iterator.node.nextSibling) {
                    iterator.node = iterator.node.nextSibling;
                    return iterator;
                }
                iterator.node = iterator.node.parentNode;
                iterator.depth -= 1;
            }
            return iterator;
        };

        /**
         * Walks the DOM, applying the specified acceptor function to each element.
         * There is a special case for the acceptor, allowing for quick deletion of elements and their children.
         * Return "delete" from your acceptor function if you want to delete the element in question.
         * Return "stop" to terminate iteration.
         * 
         * @param {Element} node the node to start walking from
         * @param {Function} acceptor the function to invoke with each DOM element
         * @param {Boolean} allnodes Use <code>true</code> to call acceptor on all nodes, 
         * rather than just element nodes (type 1)
         */
        fluid.dom.iterateDom = function (node, acceptor, allNodes) {
            var currentNode = {node: node, depth: 0};
            var prevNode = node;
            var condition;
            while (currentNode.node !== null && currentNode.depth >= 0 && currentNode.depth < fluid.dom.iterateDom.DOM_BAIL_DEPTH) {
                condition = null;
                if (currentNode.node.nodeType === 1 || allNodes) {
                    condition = acceptor(currentNode.node, currentNode.depth);
                }
                if (condition) {
                    if (condition === "delete") {
                        currentNode.node.parentNode.removeChild(currentNode.node);
                        currentNode.node = prevNode;
                    }
                    else if (condition === "stop") {
                        return currentNode.node;
                    }
                }
                prevNode = currentNode.node;
                currentNode = getNextNode(currentNode);
            }
        };

        // Work around IE circular DOM issue. This is the default max DOM depth on IE.
        // http://msdn2.microsoft.com/en-us/library/ms761392(VS.85).aspx
        fluid.dom.iterateDom.DOM_BAIL_DEPTH = 256;

        /**
         * Checks if the sepcified container is actually the parent of containee.
         * 
         * @param {Element} container the potential parent
         * @param {Element} containee the child in question
         */
        fluid.dom.isContainer = function (container, containee) {
            for (; containee; containee = containee.parentNode) {
                if (container === containee) {
                    return true;
                }
            }
            return false;
        };

        /** Return the element text from the supplied DOM node as a single String */
        fluid.dom.getElementText = function(element) {
            var nodes = element.childNodes;
            var text = "";
            for (var i = 0; i < nodes.length; ++ i) {
              var child = nodes[i];
              if (child.nodeType == 3) {
                text = text + child.nodeValue;
                }
              }
            return text; 
        };

    })(jQuery, fluid_1_2);
    /*
    Copyright 2008-2010 University of Cambridge
    Copyright 2008-2009 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    /*global jQuery*/
    /*global fluid_1_2*/

    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {

      var unUnicode = /(\\u[\dabcdef]{4}|\\x[\dabcdef]{2})/g;

      fluid.unescapeProperties = function (string) {
        string = string.replace(unUnicode, function(match) {
          var code = match.substring(2);
          var parsed = parseInt(code, 16);
          return String.fromCharCode(parsed);
          }
        );
        var pos = 0;
        while (true) {
            var backpos = string.indexOf("\\", pos);
            if (backpos === -1) {
                break;
            }
            if (backpos === string.length - 1) {
              return [string.substring(0, string.length - 1), true];
            }
            var replace = string.charAt(backpos + 1);
            if (replace === "n") replace = "\n";
            if (replace === "r") replace = "\r";
            if (replace === "t") replace = "\t";
            string = string.substring(0, backpos) + replace + string.substring(backpos + 2);
            pos = backpos + 1;
        }
        return [string, false];
      };

      var breakPos = /[^\\][\s:=]/;

      fluid.parseJavaProperties = function(text) {
        // File format described at http://java.sun.com/javase/6/docs/api/java/util/Properties.html#load(java.io.Reader)
        var togo = {};
        text = text.replace(/\r\n/g, "\n");
        text = text.replace(/\r/g, "\n");
        lines = text.split("\n");
        var contin, key, valueComp, valueRaw, valueEsc;
        for (var i = 0; i < lines.length; ++ i) {
          var line = $.trim(lines[i]);
          if (!line || line.charAt(0) === "#" || line.charAt(0) === '!') {
              continue;
          }
          if (!contin) {
            valueComp = "";
            var breakpos = line.search(breakPos);
            if (breakpos === -1) {
              key = line;
              valueRaw = "";
              }
            else {
              key = $.trim(line.substring(0, breakpos + 1)); // +1 since first char is escape exclusion
              valueRaw = $.trim(line.substring(breakpos + 2));
              if (valueRaw.charAt(0) === ":" || valueRaw.charAt(0) === "=") {
                valueRaw = $.trim(valueRaw.substring(1));
              }
            }

            key = fluid.unescapeProperties(key)[0];
            valueEsc = fluid.unescapeProperties(valueRaw);
          }
          else {
            valueEsc = fluid.unescapeProperties(line);
          }

          contin = valueEsc[1];
          if (!valueEsc[1]) { // this line was not a continuation line - store the value
            togo[key] = valueComp + valueEsc[0];
          }
          else {
            valueComp += valueEsc[0];
          }
        }
        return togo;
      };

        /** 
         * Expand a message string with respect to a set of arguments, following a basic
         * subset of the Java MessageFormat rules. 
         * http://java.sun.com/j2se/1.4.2/docs/api/java/text/MessageFormat.html
         * 
         * The message string is expected to contain replacement specifications such
         * as {0}, {1}, {2}, etc.
         * @param messageString {String} The message key to be expanded
         * @param args {String/Array of String} An array of arguments to be substituted into the message.
         * @return The expanded message string. 
         */
        fluid.formatMessage = function (messageString, args) {
            if (!args) {
                return messageString;
            } 
            if (typeof(args) === "string") {
                args = [args];
            }
            for (var i = 0; i < args.length; ++ i) {
                messageString = messageString.replace("{" + i + "}", args[i]);
            }
            return messageString;
        };

    })(jQuery, fluid_1_2);
      /*
    Copyright 2007-2010 University of Cambridge
    Copyright 2007-2009 University of Toronto
    Copyright 2007-2009 University of California, Berkeley

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    // Declare dependencies.
    /*global jQuery, YAHOO, opera*/

    (function ($, fluid) {

        fluid.renderTimestamp = function (date) {
            var zeropad = function (num, width) {
                 if (!width) width = 2;
                 var numstr = (num == undefined? "" : num.toString());
                 return "00000".substring(5 - width + numstr.length) + numstr;
                 }
            return zeropad(date.getHours()) + ":" + zeropad(date.getMinutes()) + ":" + zeropad(date.getSeconds()) + "." + zeropad(date.getMilliseconds(), 3);
        };


        /** 
         * Dumps a DOM element into a readily recognisable form for debugging - produces a
         * "semi-selector" summarising its tag name, class and id, whichever are set.
         * 
         * @param {jQueryable} element The element to be dumped
         * @return A string representing the element.
         */
        fluid.dumpEl = function (element) {
            var togo;

            if (!element) {
                return "null";
            }
            if (element.nodeType === 3 || element.nodeType === 8) {
                return "[data: " + element.data + "]";
            } 
            if (element.nodeType === 9) {
                return "[document: location " + element.location + "]";
            }
            if (!element.nodeType && fluid.isArrayable(element)) {
                togo = "[";
                for (var i = 0; i < element.length; ++ i) {
                    togo += fluid.dumpEl(element[i]);
                    if (i < element.length - 1) {
                        togo += ", ";
                    }
                }
                return togo + "]";
            }
            element = $(element);
            togo = element.get(0).tagName;
            if (element.attr("id")) {
                togo += "#" + element.attr("id");
            }
            if (element.attr("class")) {
                togo += "." + element.attr("class");
            }
            return togo;
        };

    })(jQuery, fluid_1_2);
        /*
    Copyright 2008-2010 University of Cambridge
    Copyright 2008-2009 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    /*global jQuery*/
    /*global fluid_1_2*/

    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {

        fluid.VALUE = {};

        fluid.BINDING_ROOT_KEY = "fluid-binding-root";

        /** Recursively find any data stored under a given name from a node upwards
         * in its DOM hierarchy **/

        fluid.findData = function(elem, name) {
            while (elem) {
                var data = $.data(elem, name);
                if (data) {return data;}
                elem = elem.parentNode;
                }
            };

        fluid.bindFossils = function(node, data, fossils) {
            $.data(node, fluid.BINDING_ROOT_KEY, {data: data, fossils: fossils});
            };

        fluid.findForm = function (node) {
          return fluid.findAncestor(node, 
              function(element) {return element.nodeName.toLowerCase() === "form";});
        };

        /** A generalisation of jQuery.val to correctly handle the case of acquiring and
         * setting the value of clustered radio button/checkbox sets, potentially, given
         * a node corresponding to just one element.
         */
        fluid.value = function (nodeIn, newValue) {
            var node = fluid.unwrap(nodeIn);
            var multiple = false;
            if (node.nodeType === undefined && node.length > 1) {
                node = node[0];
                multiple = true;
            }
            var jNode = $(node);
            if ("input" !== node.nodeName.toLowerCase()
               || ! /radio|checkbox/.test(node.type)) {return $(node).val(newValue);}
            var name = node.name;
            if (name === undefined) {
                fluid.fail("Cannot acquire value from node " + fluid.dumpEl(node) + " which does not have name attribute set");
            }
            var elements;
            if (multiple) {
                elements = nodeIn;
            }
            else {
                var elements = document.getElementsByName(name);
                var scope = fluid.findForm(node);
                elements = $.grep(elements, 
                  function(element) {
                    if (element.name !== name) {return false;}
                    return !scope || fluid.dom.isContainer(scope, element);
                  });
            }
            if (newValue !== undefined) {
                if (typeof(newValue) === "boolean") {
                    newValue = (newValue? "true" : "false");
                }
              // jQuery gets this partially right, but when dealing with radio button array will
              // set all of their values to "newValue" rather than setting the checked property
              // of the corresponding control. 
                $.each(elements, function() {
                   this.checked = (newValue instanceof Array? 
                     $.inArray(this.value, newValue) !== -1 : newValue === this.value);
                });
            }
            else { // this part jQuery will not do - extracting value from <input> array
                var checked = $.map(elements, function(element) {
                    return element.checked? element.value : null;
                });
                return node.type === "radio"? checked[0] : checked;
                }
           };

        /** "Automatically" apply to whatever part of the data model is
         * relevant, the changed value received at the given DOM node*/
        fluid.applyChange = function(node, newValue, applier) {
            node = fluid.unwrap(node);
            if (newValue === undefined) {
                newValue = fluid.value(node);
            }
            if (node.nodeType === undefined && node.length > 0) {node = node[0];} // assume here that they share name and parent
            var root = fluid.findData(node, fluid.BINDING_ROOT_KEY);
            if (!root) {
                fluid.fail("Bound data could not be discovered in any node above " + fluid.dumpEl(node));
            }
            var name = node.name;
            var fossil = root.fossils[name];
            if (!fossil) {
                fluid.fail("No fossil discovered for name " + name + " in fossil record above " + fluid.dumpEl(node));
            }
            if (typeof(fossil.oldvalue) === "boolean") { // deal with the case of an "isolated checkbox"
                newValue = newValue[0]? true: false;
            }
            var EL = root.fossils[name].EL;
            if (applier) {
                applier.fireChangeRequest({path: EL, value: newValue, source: node.id});
            }
            else {
                fluid.model.setBeanValue(root.data, EL, newValue);
            }    
            };

        fluid.pathUtil = {};

        var getPathSegmentImpl = function(accept, path, i) {
            var segment = null; // TODO: rewrite this with regexes and replaces
            if (accept) {
                segment = "";
            }
            var escaped = false;
            var limit = path.length;
            for (; i < limit; ++i) {
                var c = path.charAt(i);
                if (!escaped) {
                    if (c === '.') {
                        break;
                        }
                    else if (c === '\\') {
                        escaped = true;
                        }
                    else if (segment !== null) {
                        segment += c;
                    }
                }
                else {
                    escaped = false;
                    if (segment !== null)
                        accept += c;
                    }
                }
            if (segment !== null) {
                accept[0] = segment;
            }
            return i;
            };

        var globalAccept = []; // reentrancy risk

        fluid.pathUtil.getPathSegment = function(path, i) {
            getPathSegmentImpl(globalAccept, path, i);
            return globalAccept[0];
            }; 

        fluid.pathUtil.getHeadPath = function(path) {
            return fluid.pathUtil.getPathSegment(path, 0);
            };

        fluid.pathUtil.getFromHeadPath = function(path) {
            var firstdot = getPathSegmentImpl(null, path, 0);
            return firstdot === path.length ? null
                : path.substring(firstdot + 1);
            };

        function lastDotIndex(path) {
            // TODO: proper escaping rules
            return path.lastIndexOf(".");
            }

        fluid.pathUtil.getToTailPath = function(path) {
            var lastdot = lastDotIndex(path);
            return lastdot == -1 ? null : path.substring(0, lastdot);
            };

      /** Returns the very last path component of a bean path */
        fluid.pathUtil.getTailPath = function(path) {
            var lastdot = lastDotIndex(path);
            return fluid.pathUtil.getPathSegment(path, lastdot + 1);
            };

        var composeSegment = function(prefix, toappend) {
            for (var i = 0; i < toappend.length; ++i) {
                var c = toappend.charAt(i);
                if (c === '.' || c === '\\' || c === '}') {
                    prefix += '\\';
                }
                prefix += c;
            }
            return prefix;
        };

        /**
         * Compose a prefix and suffix EL path, where the prefix is already escaped.
         * Prefix may be empty, but not null. The suffix will become escaped.
         */
        fluid.pathUtil.composePath = function(prefix, suffix) {
            if (prefix.length !== 0) {
                prefix += '.';
            }
            return composeSegment(prefix, suffix);
            };    

        fluid.pathUtil.matchPath = function(spec, path) {
            var togo = "";
            while (true) {
              if (!spec) {break;}
              if (!path) {return null;}
              var spechead = fluid.pathUtil.getHeadPath(spec);
              var pathhead = fluid.pathUtil.getHeadPath(path);
              // if we fail to match on a specific component, fail.
              if (spechead !== "*" && spechead !== pathhead) {
                  return null;
              }
              togo = fluid.pathUtil.composePath(togo, pathhead);
              spec = fluid.pathUtil.getFromHeadPath(spec);
              path = fluid.pathUtil.getFromHeadPath(path);
            }
            return togo;
          };


        fluid.model.applyChangeRequest = function(model, request) {
            if (request.type === "ADD") {
                fluid.model.setBeanValue(model, request.path, request.value);
                }
            else if (request.type === "DELETE") {
                var totail = fluid.pathUtil.getToTailPath(request.path);
                var tail = fluid.pathUtil.getTailPath(request.path);
                var penult = fluid.model.getBeanValue(model, penult);
                delete penult[tail];
            }
        };

        fluid.model.bindRequestChange = function(that) {
            that.requestChange = function(path, value, type) {
                var changeRequest = {
                    path: path,
                    value: value,
                    type: type
                };
            that.fireChangeRequest(changeRequest);
            }
        };

        fluid.makeChangeApplier = function(model) {
            var baseEvents = {
                guards: fluid.event.getEventFirer(false, true),
                modelChanged: fluid.event.getEventFirer(false, false)
            };
            var that = {
                model: model
            };
            function makePredicate(listenerMember, requestIndex) {
              return function(listener, args) {
                    var changeRequest = args[requestIndex];
                    return fluid.pathUtil.matchPath(listener[listenerMember], changeRequest.path);
                };
            }
            function adaptListener(that, name, listenerMember, requestIndex) {
                var predicate = makePredicate(listenerMember, requestIndex);
                that[name] = {
                    addListener: function(pathSpec, listener, namespace) {
                        listener[listenerMember] = pathSpec;
                        baseEvents[name].addListener(listener, namespace, predicate);
                    },
                    removeListener: function(listener) {
                        baseEvents[name].removeListener(listener);
                    }
                };
            }

            adaptListener(that, "guards", "guardedPathSpec", 1);
            adaptListener(that, "modelChanged", "triggerPathSpec", 2);
            that.fireChangeRequest = function(changeRequest) {
                if (!changeRequest.type) {
                    changeRequest.type = "ADD";
                }
                var prevent = baseEvents.guards.fire(model, changeRequest);
                if (prevent === false) {
                    return;
                }
                var oldModel = {};
                fluid.model.copyModel(oldModel, model);
                fluid.model.applyChangeRequest(model, changeRequest);
                baseEvents.modelChanged.fire(model, oldModel, changeRequest);
            };
            fluid.model.bindRequestChange(that);

            return that;
        };

        fluid.makeSuperApplier = function() {
            var subAppliers = [];
            var that = {};
            that.addSubApplier = function(path, subApplier) {
                subAppliers.push({path: path, subApplier: subApplier});
            };
            that.fireChangeRequest = function(request) {
                for (var i = 0; i < subAppliers.length; ++ i) {
                    var path = subAppliers[i].path;
                    if (request.path.indexOf(path) === 0) {
                        var subpath = request.path.substring(path.length + 1);
                        var subRequest = fluid.copy(request);
                        subRequest.path = subpath;
                        // TODO: Deal with the as yet unsupported case of an EL rvalue DAR
                        subAppliers[i].subApplier.fireChangeRequest(subRequest);
                    }
                }
            };
            return that;
        };

        fluid.attachModel = function(baseModel, path, model) {
            var segs = fluid.model.parseEL(path);
            for (var i = 0; i < segs.length - 1; ++ i) {
                var seg = segs[i];
                var subModel = baseModel[seg];
                if (!subModel) {
                    baseModel[seg] = subModel = {};
                }
                baseModel = subModel;
            }
            baseModel[segs[segs.length - 1]] = model;
        };

        fluid.assembleModel = function (modelSpec) {
           var model = {};
           var superApplier = fluid.makeSuperApplier();
           var togo = {model: model, applier: superApplier};
           for (path in modelSpec) {
               var rec = modelSpec[path];
               fluid.attachModel(model, path, rec.model);
               if (rec.applier) {
                  superApplier.addSubApplier(path, rec.applier);
               }
           }
           return togo;
        };

    })(jQuery, fluid_1_2);
    /*
    Copyright 2008-2010 University of Cambridge
    Copyright 2008-2009 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    /*global jQuery*/

    fluid_1_2 = fluid_1_2 || {};
    fluid = fluid || fluid_1_2;

    (function ($, fluid) {

        // $().fluid("selectable", args)
        // $().fluid("selectable".that()
        // $().fluid("pager.pagerBar", args)
        // $().fluid("reorderer", options)

    /** Create a "bridge" from code written in the Fluid standard "that-ist" style,
     *  to the standard JQuery UI plugin architecture specified at http://docs.jquery.com/UI/Guidelines .
     *  Every Fluid component corresponding to the top-level standard signature (JQueryable, options)
     *  will automatically convert idiomatically to the JQuery UI standard via this adapter. 
     *  Any return value which is a primitive or array type will become the return value
     *  of the "bridged" function - however, where this function returns a general hash
     *  (object) this is interpreted as forming part of the Fluid "return that" pattern,
     *  and the function will instead be bridged to "return this" as per JQuery standard,
     *  permitting chaining to occur. However, as a courtesy, the particular "this" returned
     *  will be augmented with a function that() which will allow the original return
     *  value to be retrieved if desired.
     *  @param {String} name The name under which the "plugin space" is to be injected into
     *  JQuery
     *  @param {Object} peer The root of the namespace corresponding to the peer object.
     */

        fluid.thatistBridge = function (name, peer) {

            var togo = function(funcname) {
                var segs = funcname.split(".");
                var move = peer;
                for (var i = 0; i < segs.length; ++i) {
                    move = move[segs[i]];
                }
                var args = [this];
                if (arguments.length === 2) {
                    args = args.concat($.makeArray(arguments[1]));
                }
                var ret = move.apply(null, args);
                this.that = function() {
                    return ret;
                }
                var type = typeof(ret);
                return !ret || type === "string" || type === "number" || type === "boolean"
                  || ret && ret.length !== undefined? ret: this;
            };
            $.fn[name] = togo;
            return togo;
        };

        fluid.thatistBridge("fluid", fluid);
        fluid.thatistBridge("fluid_1_2", fluid_1_2);

        // Private constants.
        var NAMESPACE_KEY = "fluid-keyboard-a11y";

        /**
         * Gets stored state from the jQuery instance's data map.
         */
        var getData = function(target, key) {
            var data = $(target).data(NAMESPACE_KEY);
            return data ? data[key] : undefined;
        };

        /**
         * Stores state in the jQuery instance's data map. Unlike jQuery's version,
         * accepts multiple-element jQueries.
         */
        var setData = function(target, key, value) {
            $(target).each(function() {
                var data = $.data(this, NAMESPACE_KEY) || {};
                data[key] = value;

                $.data(this, NAMESPACE_KEY, data);
            });
        };
    /** Global focus manager - makes use of jQuery delegate plugin if present,
     * detecting presence of "focusin" event.
     */

        var lastFocusedElement = "disabled";

        if ($.event.special["focusin"]) {
            lastFocusedElement = null;
            $(document).bind("focusin", function(event){
                lastFocusedElement = event.target;
            });
        }

        fluid.getLastFocusedElement = function () {
            if (lastFocusedElement === "disabled") {
               fluid.fail("Focus manager not enabled - please include jquery.delegate.js or equivalent for support of 'focusin' event");
            }
            return lastFocusedElement;
        }

    /*************************************************************************
     * Tabindex normalization - compensate for browser differences in naming
     * and function of "tabindex" attribute and tabbing order.
     */

        // -- Private functions --


        var normalizeTabindexName = function() {
            return $.browser.msie ? "tabIndex" : "tabindex";
        };

        var canHaveDefaultTabindex = function(elements) {
           if (elements.length <= 0) {
               return false;
           }

           return $(elements[0]).is("a, input, button, select, area, textarea, object");
        };

        var getValue = function(elements) {
            if (elements.length <= 0) {
                return undefined;
            }

            if (!fluid.tabindex.hasAttr(elements)) {
                return canHaveDefaultTabindex(elements) ? Number(0) : undefined;
            }

            // Get the attribute and return it as a number value.
            var value = elements.attr(normalizeTabindexName());
            return Number(value);
        };

        var setValue = function(elements, toIndex) {
            return elements.each(function(i, item) {
                $(item).attr(normalizeTabindexName(), toIndex);
            });
        };

        // -- Public API --

        /**
         * Gets the value of the tabindex attribute for the first item, or sets the tabindex value of all elements
         * if toIndex is specified.
         * 
         * @param {String|Number} toIndex
         */
        fluid.tabindex = function(target, toIndex) {
            target = $(target);
            if (toIndex !== null && toIndex !== undefined) {
                return setValue(target, toIndex);
            } else {
                return getValue(target);
            }
        };

        /**
         * Removes the tabindex attribute altogether from each element.
         */
        fluid.tabindex.remove = function(target) {
            target = $(target);
            return target.each(function(i, item) {
                $(item).removeAttr(normalizeTabindexName());
            });
        };

        /**
         * Determines if an element actually has a tabindex attribute present.
         */
        fluid.tabindex.hasAttr = function(target) {
            target = $(target);
            if (target.length <= 0) {
                return false;
            }
            var togo = target.map(
                function() {
                    var attributeNode = this.getAttributeNode(normalizeTabindexName());
                    return attributeNode ? attributeNode.specified : false;
                }
                );
            return togo.length === 1? togo[0] : togo;
        };

        /**
         * Determines if an element either has a tabindex attribute or is naturally tab-focussable.
         */
        fluid.tabindex.has = function(target) {
            target = $(target);
            return fluid.tabindex.hasAttr(target) || canHaveDefaultTabindex(target);
        };

        var ENABLEMENT_KEY = "enablement";

        /** Queries or sets the enabled status of a control. An activatable node
         * may be "disabled" in which case its keyboard bindings will be inoperable
         * (but still stored) until it is reenabled again.
         */

        fluid.enabled = function(target, state) {
            target = $(target);
            if (state === undefined) {
                return getData(target, ENABLEMENT_KEY) !== false;
            }
            else {
                $("*", target).each(function() {
                    if (getData(this, ENABLEMENT_KEY) !== undefined) {
                        setData(this, ENABLEMENT_KEY, state);
                    }
                    else if (/select|textarea|input/i.test(this.nodeName)) {
                        $(this).attr("disabled", !state);
                    }
                });
                setData(target, ENABLEMENT_KEY, state);
            }
        };


    // Keyboard navigation
        // Public, static constants needed by the rest of the library.
        fluid.a11y = $.a11y || {};

        fluid.a11y.orientation = {
            HORIZONTAL: 0,
            VERTICAL: 1,
            BOTH: 2
        };

        var UP_DOWN_KEYMAP = {
            next: $.ui.keyCode.DOWN,
            previous: $.ui.keyCode.UP
        };

        var LEFT_RIGHT_KEYMAP = {
            next: $.ui.keyCode.RIGHT,
            previous: $.ui.keyCode.LEFT
        };

        // Private functions.
        var unwrap = function(element) {
            return element.jquery ? element[0] : element; // Unwrap the element if it's a jQuery.
        };


        var makeElementsTabFocussable = function(elements) {
            // If each element doesn't have a tabindex, or has one set to a negative value, set it to 0.
            elements.each(function(idx, item) {
                item = $(item);
                if (!item.fluid("tabindex.has") || item.fluid("tabindex") < 0) {
                    item.fluid("tabindex", 0);
                }
            });
        };

        // Public API.
        /**
         * Makes all matched elements available in the tab order by setting their tabindices to "0".
         */
        fluid.tabbable = function(target) {
            target = $(target);
            makeElementsTabFocussable(target);
        };

        /*********************************************************************** 
         * Selectable functionality - geometrising a set of nodes such that they
         * can be navigated (by setting focus) using a set of directional keys
         */

        var CONTEXT_KEY = "selectionContext";
        var NO_SELECTION = -32768;

        var cleanUpWhenLeavingContainer = function(selectionContext) {
            if (selectionContext.options.onLeaveContainer) {
                selectionContext.options.onLeaveContainer(
                  selectionContext.selectables[selectionContext.activeItemIndex]);
            } else if (selectionContext.options.onUnselect) {
                selectionContext.options.onUnselect(
                selectionContext.selectables[selectionContext.activeItemIndex]);
            }

            if (!selectionContext.options.rememberSelectionState) {
                selectionContext.activeItemIndex = NO_SELECTION;
            }
        };

        /**
         * Does the work of selecting an element and delegating to the client handler.
         */
        var drawSelection = function(elementToSelect, handler) {
            if (handler) {
                handler(elementToSelect);
            }
        };

        /**
         * Does does the work of unselecting an element and delegating to the client handler.
         */
        var eraseSelection = function(selectedElement, handler) {
            if (handler && selectedElement) {
                handler(selectedElement);
            }
        };

        var unselectElement = function(selectedElement, selectionContext) {
            eraseSelection(selectedElement, selectionContext.options.onUnselect);
        };

        var selectElement = function(elementToSelect, selectionContext) {
            // It's possible that we're being called programmatically, in which case we should clear any previous selection.
            unselectElement(selectionContext.selectedElement(), selectionContext);

            elementToSelect = unwrap(elementToSelect);
            var newIndex = selectionContext.selectables.index(elementToSelect);

            // Next check if the element is a known selectable. If not, do nothing.
            if (newIndex === -1) {
               return;
            }

            // Select the new element.
            selectionContext.activeItemIndex = newIndex;
            drawSelection(elementToSelect, selectionContext.options.onSelect);
        };

        var selectableFocusHandler = function(selectionContext) {
            return function(evt) {
                // FLUID-3590: newer browsers (FF 3.6, Webkit 4) have a form of "bug" in that they will go bananas
                // on attempting to move focus off an element which has tabindex dynamically set to -1.
                $(evt.target).fluid("tabindex", 0);
                selectElement(evt.target, selectionContext);

                // Force focus not to bubble on some browsers.
                return evt.stopPropagation();
            };
        };

        var selectableBlurHandler = function(selectionContext) {
            return function(evt) {
                $(evt.target).fluid("tabindex", selectionContext.options.selectablesTabindex);
                unselectElement(evt.target, selectionContext);

                // Force blur not to bubble on some browsers.
                return evt.stopPropagation();
            };
        };

        var reifyIndex = function(sc_that) {
            var elements = sc_that.selectables;
            if (sc_that.activeItemIndex >= elements.length) {
                sc_that.activeItemIndex = 0;
            }
            if (sc_that.activeItemIndex < 0 && sc_that.activeItemIndex !== NO_SELECTION) {
                sc_that.activeItemIndex = elements.length - 1;
            }
            if (sc_that.activeItemIndex >= 0) {
                $(elements[sc_that.activeItemIndex]).focus();
            }
        };

        var prepareShift = function(selectionContext) {
            // FLUID-3590: FF 3.6 and Safari 4.x won't fire blur() when programmatically moving focus.
            var selElm = selectionContext.selectedElement();
            if (selElm) {
                selElm.blur();
            }

            unselectElement(selectionContext.selectedElement(), selectionContext);
            if (selectionContext.activeItemIndex === NO_SELECTION) {
              selectionContext.activeItemIndex = -1;
            }
        };

        var focusNextElement = function(selectionContext) {
            prepareShift(selectionContext);
            ++selectionContext.activeItemIndex;
            reifyIndex(selectionContext);
        };

        var focusPreviousElement = function(selectionContext) {
            prepareShift(selectionContext);
            --selectionContext.activeItemIndex;
            reifyIndex(selectionContext);
        };

        var arrowKeyHandler = function(selectionContext, keyMap, userHandlers) {
            return function(evt) {
                if (evt.which === keyMap.next) {
                    focusNextElement(selectionContext);
                    evt.preventDefault();
                } else if (evt.which === keyMap.previous) {
                    focusPreviousElement(selectionContext);
                    evt.preventDefault();
                }
            };
        };

        var getKeyMapForDirection = function(direction) {
            // Determine the appropriate mapping for next and previous based on the specified direction.
            var keyMap;
            if (direction === fluid.a11y.orientation.HORIZONTAL) {
                keyMap = LEFT_RIGHT_KEYMAP;
            } 
            else if (direction === fluid.a11y.orientation.VERTICAL) {
                // Assume vertical in any other case.
                keyMap = UP_DOWN_KEYMAP;
            }

            return keyMap;
        };

        var tabKeyHandler = function(selectionContext) {
            return function(evt) {
                if (evt.which !== $.ui.keyCode.TAB) {
                    return;
                }
                cleanUpWhenLeavingContainer(selectionContext);

                // Catch Shift-Tab and note that focus is on its way out of the container.
                if (evt.shiftKey) {
                    selectionContext.focusIsLeavingContainer = true;
                }
            };
        };

        var containerFocusHandler = function(selectionContext) {
            return function(evt) {
                var shouldOrig = selectionContext.options.autoSelectFirstItem;
                var shouldSelect = typeof(shouldOrig) === "function" ? 
                     shouldOrig() : shouldOrig;

                // Override the autoselection if we're on the way out of the container.
                if (selectionContext.focusIsLeavingContainer) {
                    shouldSelect = false;
                }

                // This target check works around the fact that sometimes focus bubbles, even though it shouldn't.
                if (shouldSelect && evt.target === selectionContext.container.get(0)) {
                    if (selectionContext.activeItemIndex === NO_SELECTION) {
                        selectionContext.activeItemIndex = 0;
                    }
                    $(selectionContext.selectables[selectionContext.activeItemIndex]).focus();
                }

               // Force focus not to bubble on some browsers.
               return evt.stopPropagation();
            };
        };

        var containerBlurHandler = function(selectionContext) {
            return function(evt) {
                selectionContext.focusIsLeavingContainer = false;

                // Force blur not to bubble on some browsers.
                return evt.stopPropagation();
            };
        };

        var makeElementsSelectable = function(container, defaults, userOptions) {

            var options = $.extend(true, {}, defaults, userOptions);

            var keyMap = getKeyMapForDirection(options.direction);

            var selectableElements = options.selectableElements? options.selectableElements :
                  container.find(options.selectableSelector);

            // Context stores the currently active item(undefined to start) and list of selectables.
            var that = {
                container: container,
                activeItemIndex: NO_SELECTION,
                selectables: selectableElements,
                focusIsLeavingContainer: false,
                options: options
            };

            that.selectablesUpdated = function(focusedItem) {
              // Remove selectables from the tab order and add focus/blur handlers
                if (typeof(that.options.selectablesTabindex) === "number") {
                    that.selectables.fluid("tabindex", that.options.selectablesTabindex);
                }
                that.selectables.unbind("focus." + NAMESPACE_KEY);
                that.selectables.unbind("blur." + NAMESPACE_KEY);
                that.selectables.bind("focus."+ NAMESPACE_KEY, selectableFocusHandler(that));
                that.selectables.bind("blur." + NAMESPACE_KEY, selectableBlurHandler(that));
                if (focusedItem) {
                    selectElement(focusedItem, that);
                }
                else {
                    reifyIndex(that);
                }
            };

            that.refresh = function() {
                if (!that.options.selectableSelector) {
                    throw("Cannot refresh selectable context which was not initialised by a selector");
                }
                that.selectables = container.find(options.selectableSelector);
                that.selectablesUpdated();
            };

            that.selectedElement = function() {
                return that.activeItemIndex < 0? null : that.selectables[that.activeItemIndex];
            };

            // Add various handlers to the container.
            if (keyMap) {
                container.keydown(arrowKeyHandler(that, keyMap));
            }
            container.keydown(tabKeyHandler(that));
            container.focus(containerFocusHandler(that));
            container.blur(containerBlurHandler(that));

            that.selectablesUpdated();

            return that;
        };

        /**
         * Makes all matched elements selectable with the arrow keys.
         * Supply your own handlers object with onSelect: and onUnselect: properties for custom behaviour.
         * Options provide configurability, including direction: and autoSelectFirstItem:
         * Currently supported directions are jQuery.a11y.directions.HORIZONTAL and VERTICAL.
         */
        fluid.selectable = function(target, options) {
            target = $(target);
            var that = makeElementsSelectable(target, fluid.selectable.defaults, options);
            setData(target, CONTEXT_KEY, that);
            return that;
        };

        /**
         * Selects the specified element.
         */
        fluid.selectable.select = function(target, toSelect) {
            $(toSelect).focus();
        };

        /**
         * Selects the next matched element.
         */
        fluid.selectable.selectNext = function(target) {
            target = $(target);
            focusNextElement(getData(target, CONTEXT_KEY));
        };

        /**
         * Selects the previous matched element.
         */
        fluid.selectable.selectPrevious = function(target) {
            target = $(target);
            focusPreviousElement(getData(target, CONTEXT_KEY));
        };

        /**
         * Returns the currently selected item wrapped as a jQuery object.
         */
        fluid.selectable.currentSelection = function(target) {
            target = $(target);
            var that = getData(target, CONTEXT_KEY);
            return $(that.selectedElement());
        };

        fluid.selectable.defaults = {
            direction: fluid.a11y.orientation.VERTICAL,
            selectablesTabindex: -1,
            autoSelectFirstItem: true,
            rememberSelectionState: true,
            selectableSelector: ".selectable",
            selectableElements: null,
            onSelect: null,
            onUnselect: null,
            onLeaveContainer: null
        };

        /********************************************************************
         *  Activation functionality - declaratively associating actions with 
         * a set of keyboard bindings.
         */

        var checkForModifier = function(binding, evt) {
            // If no modifier was specified, just return true.
            if (!binding.modifier) {
                return true;
            }

            var modifierKey = binding.modifier;
            var isCtrlKeyPresent = modifierKey && evt.ctrlKey;
            var isAltKeyPresent = modifierKey && evt.altKey;
            var isShiftKeyPresent = modifierKey && evt.shiftKey;

            return isCtrlKeyPresent || isAltKeyPresent || isShiftKeyPresent;
        };

        /** Constructs a raw "keydown"-facing handler, given a binding entry. This
         *  checks whether the key event genuinely triggers the event and forwards it
         *  to any "activateHandler" registered in the binding. 
         */
        var makeActivationHandler = function(binding) {
            return function(evt) {
                var target = evt.target;
                if (!fluid.enabled(evt.target)) {
                    return;
                }
    // The following 'if' clause works in the real world, but there's a bug in the jQuery simulation
    // that causes keyboard simulation to fail in Safari, causing our tests to fail:
    //     http://ui.jquery.com/bugs/ticket/3229
    // The replacement 'if' clause works around this bug.
    // When this issue is resolved, we should revert to the original clause.
    //            if (evt.which === binding.key && binding.activateHandler && checkForModifier(binding, evt)) {
                var code = evt.which? evt.which : evt.keyCode;
                if (code === binding.key && binding.activateHandler && checkForModifier(binding, evt)) {
                    var event = $.Event("fluid-activate");
                    $(evt.target).trigger(event, [binding.activateHandler]);
                    if (event.isDefaultPrevented()) {
                        evt.preventDefault();
                    }
                }
            };
        };

        var makeElementsActivatable = function(elements, onActivateHandler, defaultKeys, options) {
            // Create bindings for each default key.
            var bindings = [];
            $(defaultKeys).each(function(index, key) {
                bindings.push({
                    modifier: null,
                    key: key,
                    activateHandler: onActivateHandler
                });
            });

            // Merge with any additional key bindings.
            if (options && options.additionalBindings) {
                bindings = bindings.concat(options.additionalBindings);
            }

            setData(elements, ENABLEMENT_KEY, true);

            // Add listeners for each key binding.
            for (var i = 0; i < bindings.length; ++ i) {
                var binding = bindings[i];
                elements.keydown(makeActivationHandler(binding));
            }
            elements.bind("fluid-activate", function(evt, handler) {
                handler = handler || onActivateHandler;
                return handler? handler(evt): null;
            });
        };

        /**
         * Makes all matched elements activatable with the Space and Enter keys.
         * Provide your own handler function for custom behaviour.
         * Options allow you to provide a list of additionalActivationKeys.
         */
        fluid.activatable = function(target, fn, options) {
            target = $(target);
            makeElementsActivatable(target, fn, fluid.activatable.defaults.keys, options);
        };

        /**
         * Activates the specified element.
         */
        fluid.activate = function(target) {
            $(target).trigger("fluid-activate");
        };

        // Public Defaults.
        fluid.activatable.defaults = {
            keys: [$.ui.keyCode.ENTER, $.ui.keyCode.SPACE]
        };


      })(jQuery, fluid_1_2);
    /*
        json2.js
        2007-11-06

        Public Domain

        No warranty expressed or implied. Use at your own risk.

        See http://www.JSON.org/js.html

        This file creates a global JSON object containing two methods:

            JSON.stringify(value, whitelist)
                value       any JavaScript value, usually an object or array.

                whitelist   an optional that determines how object values are
                            stringified.

                This method produces a JSON text from a JavaScript value.
                There are three possible ways to stringify an object, depending
                on the optional whitelist parameter.

                If an object has a toJSON method, then the toJSON() method will be
                called. The value returned from the toJSON method will be
                stringified.

                Otherwise, if the optional whitelist parameter is an array, then
                the elements of the array will be used to select members of the
                object for stringification.

                Otherwise, if there is no whitelist parameter, then all of the
                members of the object will be stringified.

                Values that do not have JSON representaions, such as undefined or
                functions, will not be serialized. Such values in objects will be
                dropped, in arrays will be replaced with null. JSON.stringify()
                returns undefined. Dates will be stringified as quoted ISO dates.

                Example:

                var text = JSON.stringify(['e', {pluribus: 'unum'}]);
                // text is '["e",{"pluribus":"unum"}]'

            JSON.parse(text, filter)
                This method parses a JSON text to produce an object or
                array. It can throw a SyntaxError exception.

                The optional filter parameter is a function that can filter and
                transform the results. It receives each of the keys and values, and
                its return value is used instead of the original value. If it
                returns what it received, then structure is not modified. If it
                returns undefined then the member is deleted.

                Example:

                // Parse the text. If a key contains the string 'date' then
                // convert the value to a date.

                myData = JSON.parse(text, function (key, value) {
                    return key.indexOf('date') >= 0 ? new Date(value) : value;
                });

        This is a reference implementation. You are free to copy, modify, or
        redistribute.

        Use your own copy. It is extremely unwise to load third party
        code into your pages.
    */

    /*jslint evil: true */
    /*extern JSON */

    if (!this.JSON) {

        JSON = function () {

            function f(n) {    // Format integers to have at least two digits.
                return n < 10 ? '0' + n : n;
            }

            Date.prototype.toJSON = function () {

    // Eventually, this method will be based on the date.toISOString method.

                return this.getUTCFullYear()   + '-' +
                     f(this.getUTCMonth() + 1) + '-' +
                     f(this.getUTCDate())      + 'T' +
                     f(this.getUTCHours())     + ':' +
                     f(this.getUTCMinutes())   + ':' +
                     f(this.getUTCSeconds())   + 'Z';
            };


            var m = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            };

            function stringify(value, whitelist) {
                var a,          // The array holding the partial texts.
                    i,          // The loop counter.
                    k,          // The member key.
                    l,          // Length.
                    r = /["\\\x00-\x1f\x7f-\x9f]/g,
                    v;          // The member value.

                switch (typeof value) {
                case 'string':

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe sequences.

                    return r.test(value) ?
                        '"' + value.replace(r, function (a) {
                            var c = m[a];
                            if (c) {
                                return c;
                            }
                            c = a.charCodeAt();
                            return '\\u00' + Math.floor(c / 16).toString(16) +
                                                       (c % 16).toString(16);
                        }) + '"' :
                        '"' + value + '"';

                case 'number':

    // JSON numbers must be finite. Encode non-finite numbers as null.

                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':
                    return String(value);

                case 'object':

    // Due to a specification blunder in ECMAScript,
    // typeof null is 'object', so watch out for that case.

                    if (!value) {
                        return 'null';
                    }

    // If the object has a toJSON method, call it, and stringify the result.

                    if (typeof value.toJSON === 'function') {
                        return stringify(value.toJSON());
                    }
                    a = [];
                    if (typeof value.length === 'number' &&
                            !(value.propertyIsEnumerable('length'))) {

    // The object is an array. Stringify every element. Use null as a placeholder
    // for non-JSON values.

                        l = value.length;
                        for (i = 0; i < l; i += 1) {
                            a.push(stringify(value[i], whitelist) || 'null');
                        }

    // Join all of the elements together and wrap them in brackets.

                        return '[' + a.join(',') + ']';
                    }
                    if (whitelist) {

    // If a whitelist (array of keys) is provided, use it to select the components
    // of the object.

                        l = whitelist.length;
                        for (i = 0; i < l; i += 1) {
                            k = whitelist[i];
                            if (typeof k === 'string') {
                                v = stringify(value[k], whitelist);
                                if (v) {
                                    a.push(stringify(k) + ':' + v);
                                }
                            }
                        }
                    } else {

    // Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (typeof k === 'string') {
                                v = stringify(value[k], whitelist);
                                if (v) {
                                    a.push(stringify(k) + ':' + v);
                                }
                            }
                        }
                    }

    // Join all of the member texts together and wrap them in braces.

                    return '{' + a.join(',') + '}';
                }
            }

            return {
                stringify: stringify,
                parse: function (text, filter) {
                    var j;

                    function walk(k, v) {
                        var i, n;
                        if (v && typeof v === 'object') {
                            for (i in v) {
                                if (Object.prototype.hasOwnProperty.apply(v, [i])) {
                                    n = walk(i, v[i]);
                                    if (n !== undefined) {
                                        v[i] = n;
                                    }
                                }
                            }
                        }
                        return filter(k, v);
                    }


    // Parsing happens in three stages. In the first stage, we run the text against
    // regular expressions that look for non-JSON patterns. We are especially
    // concerned with '()' and 'new' because they can cause invocation, and '='
    // because it can cause mutation. But just to be safe, we want to reject all
    // unexpected forms.

    // We split the first stage into 4 regexp operations in order to work around
    // crippling inefficiencies in IE's and Safari's regexp engines. First we
    // replace all backslash pairs with '@' (a non-JSON character). Second, we
    // replace all simple value tokens with ']' characters. Third, we delete all
    // open brackets that follow a colon or comma or that begin the text. Finally,
    // we look to see that the remaining characters are only whitespace or ']' or
    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                    if (/^[\],:{}\s]*$/.test(text.replace(/\\./g, '@').
    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g, ']').
    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

    // In the second stage we use the eval function to compile the text into a
    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
    // in JavaScript: it can begin a block or an object literal. We wrap the text
    // in parens to eliminate the ambiguity.

                        j = eval('(' + text + ')');

    // In the optional third stage, we recursively walk the new structure, passing
    // each name/value pair to a filter function for possible transformation.

                        return typeof filter === 'function' ? walk('', j) : j;
                    }

    // If the text is not JSON parseable, then a SyntaxError is thrown.

                    throw new SyntaxError('parseJSON');
                }
            };
        }();
    }
    /*
    Copyright 2008-2010 University of Cambridge
    Copyright 2008-2010 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    // Declare dependencies.
    /*global jQuery*/
    /*global fluid_1_2*/

    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {
        /** 
         * Returns the absolute position of a supplied DOM node in pixels.
         * Implementation taken from quirksmode http://www.quirksmode.org/js/findpos.html
         */
        fluid.dom.computeAbsolutePosition = function (element) {
            var curleft = 0, curtop = 0;
            if (element.offsetParent) {
                do {
                    curleft += element.offsetLeft;
                    curtop += element.offsetTop;
                    element = element.offsetParent;
                } while (element);
                return [curleft, curtop];
            }
        };

        /** 
         * Cleanse the children of a DOM node by removing all <script> tags.
         * This is necessary to prevent the possibility that these blocks are
         * reevaluated if the node were reattached to the document. 
         */
        fluid.dom.cleanseScripts = function (element) {
            var cleansed = $.data(element, fluid.dom.cleanseScripts.MARKER);
            if (!cleansed) {
                fluid.dom.iterateDom(element, function (node) {
                    return node.tagName.toLowerCase() === "script"? "delete" : null;
                });
                $.data(element, fluid.dom.cleanseScripts.MARKER, true);
            }
        };  
        fluid.dom.cleanseScripts.MARKER = "fluid-scripts-cleansed";

        /**
         * Inserts newChild as the next sibling of refChild.
         * @param {Object} newChild
         * @param {Object} refChild
         */
        fluid.dom.insertAfter = function (newChild, refChild) {
            var nextSib = refChild.nextSibling;
            if (!nextSib) {
                refChild.parentNode.appendChild(newChild);
            }
            else {
                refChild.parentNode.insertBefore(newChild, nextSib);
            }
        };

        // The following two functions taken from http://developer.mozilla.org/En/Whitespace_in_the_DOM
        /**
         * Determine whether a node's text content is entirely whitespace.
         *
         * @param node  A node implementing the |CharacterData| interface (i.e.,
         *              a |Text|, |Comment|, or |CDATASection| node
         * @return     True if all of the text content of |nod| is whitespace,
         *             otherwise false.
         */
        fluid.dom.isWhitespaceNode = function (node) {
           // Use ECMA-262 Edition 3 String and RegExp features
            return !(/[^\t\n\r ]/.test(node.data));
        };

        /**
         * Determine if a node should be ignored by the iterator functions.
         *
         * @param nod  An object implementing the DOM1 |Node| interface.
         * @return     true if the node is:
         *                1) A |Text| node that is all whitespace
         *                2) A |Comment| node
         *             and otherwise false.
         */
        fluid.dom.isIgnorableNode = function (node) {
            return (node.nodeType === 8) || // A comment node
             ((node.nodeType === 3) && fluid.dom.isWhitespaceNode(node)); // a text node, all ws
        };

    })(jQuery, fluid_1_2);
    /*
    Copyright 2008-2010 University of Cambridge
    Copyright 2008-2010 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    // Declare dependencies.
    /*global jQuery*/
    /*global fluid_1_2*/

    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {

        fluid.orientation = {
            HORIZONTAL: 4,
            VERTICAL: 1
        };

        fluid.rectSides = {
            // agree with fluid.orientation
            4: ["left", "right"],
            1: ["top", "bottom"],
            // agree with fluid.direction
            8: "top",
            12: "bottom",
            2: "left",
            3: "right"
        };

        /**
         * This is the position, relative to a given drop target, that a dragged item should be dropped.
         */
        fluid.position = {
            BEFORE: -1,
            AFTER: 1,
            INSIDE: 2,
            REPLACE: 3
        };

        /**
         * For incrementing/decrementing a count or index, or moving in a rectilinear direction.
         */
        fluid.direction = {
            NEXT: 1,
            PREVIOUS: -1,
            UP: 8,
            DOWN: 12,
            LEFT: 2,
            RIGHT: 3
        };

        fluid.directionSign = function (direction) {
            return direction === fluid.direction.UP || direction === fluid.direction.LEFT? 
                 fluid.direction.PREVIOUS : fluid.direction.NEXT;
        };

        fluid.directionAxis = function (direction) {
            return direction === fluid.direction.LEFT || direction === fluid.direction.RIGHT?
                0 : 1; 
        };

        fluid.directionOrientation = function (direction) {
            return fluid.directionAxis(direction)? fluid.orientation.VERTICAL : fluid.orientation.HORIZONTAL;
        };

        fluid.keycodeDirection = {
            up: fluid.direction.UP,
            down: fluid.direction.DOWN,
            left: fluid.direction.LEFT,
            right: fluid.direction.RIGHT
        };

        // moves a single node in the DOM to a new position relative to another
        fluid.moveDom = function (source, target, position) {
            source = fluid.unwrap(source);
            target = fluid.unwrap(target);

            var scan;
            // fluid.log("moveDom source " + fluid.dumpEl(source) + " target " + fluid.dumpEl(target) + " position " + position);     
            if (position === fluid.position.INSIDE) {
                target.appendChild(source);
            }
            else if (position === fluid.position.BEFORE) {
                for (scan = target.previousSibling; ; scan = scan.previousSibling) {
                    if (!scan || !fluid.dom.isIgnorableNode(scan)) {
                        if (scan !== source) {
                            fluid.dom.cleanseScripts(source);
                            target.parentNode.insertBefore(source, target);    
                        }
                        break;
                    }
                }
            }
            else if (position === fluid.position.AFTER) {
                for (scan = target.nextSibling; ; scan = scan.nextSibling) {
                    if (!scan || !fluid.dom.isIgnorableNode(scan)) {
                        if (scan !== source) {
                            fluid.dom.cleanseScripts(source);
                            fluid.dom.insertAfter(source, target);
                        }
                        break;
                    }
                }
            }
            else {
                fluid.fail("Unrecognised position supplied to fluid.moveDom: " + position);
            }
        };

        fluid.normalisePosition = function (position, samespan, targeti, sourcei) {
            // convert a REPLACE into a primitive BEFORE/AFTER
            if (position === fluid.position.REPLACE) {
                position = samespan && targeti >= sourcei? fluid.position.AFTER: fluid.position.BEFORE;
            }
            return position;
        };

        fluid.permuteDom = function (element, target, position, sourceelements, targetelements) {
            element = fluid.unwrap(element);
            target = fluid.unwrap(target);
            var sourcei = $.inArray(element, sourceelements);
            if (sourcei === -1) {
                fluid.fail("Error in permuteDom: source element " + fluid.dumpEl(element) 
                   + " not found in source list " + fluid.dumpEl(sourceelements));
            }
            var targeti = $.inArray(target, targetelements);
            if (targeti === -1) {
                fluid.fail("Error in permuteDom: target element " + fluid.dumpEl(target) 
                   + " not found in source list " + fluid.dumpEl(targetelements));
            }
            var samespan = sourceelements === targetelements;
            position = fluid.normalisePosition(position, samespan, targeti, sourcei);

            //fluid.log("permuteDom sourcei " + sourcei + " targeti " + targeti);
            // cache the old neighbourhood of the element for the final move
            var oldn = {};
            oldn[fluid.position.AFTER] = element.nextSibling;
            oldn[fluid.position.BEFORE] = element.previousSibling;
            fluid.moveDom(sourceelements[sourcei], targetelements[targeti], position);

            // perform the leftward-moving, AFTER shift
            var frontlimit = samespan? targeti - 1: sourceelements.length - 2;
            var i;
            if (position === fluid.position.BEFORE && samespan) { 
                // we cannot do skip processing if the element was "fused against the grain" 
                frontlimit--;
            }
            if (!samespan || targeti > sourcei) {
                for (i = frontlimit; i > sourcei; -- i) {
                    fluid.moveDom(sourceelements[i + 1], sourceelements[i], fluid.position.AFTER);
                }
                if (sourcei + 1 < sourceelements.length) {
                    fluid.moveDom(sourceelements[sourcei + 1], oldn[fluid.position.AFTER], fluid.position.BEFORE);
                }
            }
            // perform the rightward-moving, BEFORE shift
            var backlimit = samespan? sourcei - 1: targetelements.length - 1;
            if (position === fluid.position.AFTER) { 
                // we cannot do skip processing if the element was "fused against the grain" 
                targeti++;
            }
            if (!samespan || targeti < sourcei) {
                for (i = targeti; i < backlimit; ++ i) {
                    fluid.moveDom(targetelements[i], targetelements[i + 1], fluid.position.BEFORE);
                }
                if (backlimit >= 0 && backlimit < targetelements.length - 1) {
                    fluid.moveDom(targetelements[backlimit], oldn[fluid.position.BEFORE], fluid.position.AFTER);
                }                
            }

        };

        var curCss = function (a, name) {
            return window.getComputedStyle? window.getComputedStyle(a, null).getPropertyValue(name) : 
              a.currentStyle[name];
        };

        var isAttached = function (node) {
            while (node && node.nodeName) {
                if (node.nodeName === "BODY") {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        };

        var generalHidden = function (a) {
            return "hidden" === a.type || curCss(a, "display") === "none" || curCss(a, "visibility") === "hidden" || !isAttached(a);
        };


        var computeGeometry = function (element, orientation, disposition) {
            var elem = {};
            elem.element = element;
            elem.orientation = orientation;
            if (disposition === fluid.position.INSIDE) {
                elem.position = disposition;
            }
            if (generalHidden(element)) {
                elem.clazz = "hidden";
            }
            var pos = fluid.dom.computeAbsolutePosition(element) || [0, 0];
            var width = element.offsetWidth;
            var height = element.offsetHeight;
            elem.rect = {left: pos[0], top: pos[1]};
            elem.rect.right = pos[0] + width;
            elem.rect.bottom = pos[1] + height;
            return elem;
        };

        // A "suitable large" value for the sentinel blocks at the ends of spans
        var SENTINEL_DIMENSION = 10000;

        function dumprect(rect) {
            return "Rect top: " + rect.top +
                     " left: " + rect.left + 
                   " bottom: " + rect.bottom +
                    " right: " + rect.right;
        }

        function dumpelem(cacheelem) {
            if (!cacheelem || !cacheelem.rect) {
                return "null";
            } else {
                return dumprect(cacheelem.rect) + " position: " +
                cacheelem.position +
                " for " +
                fluid.dumpEl(cacheelem.element);
            }
        }

        fluid.dropManager = function () {
            var targets = [];
            var cache = {};
            var that = {};

            var lastClosest;

            function cacheKey(element) {
                return fluid.allocateSimpleId(element);
            }

            function sentinelizeElement(targets, sides, cacheelem, fc, disposition, clazz) {
                var elemCopy = $.extend(true, {}, cacheelem);
                elemCopy.rect[sides[fc]] = elemCopy.rect[sides[1 - fc]] + (fc? 1: -1);
                elemCopy.rect[sides[1 - fc]] = (fc? -1 : 1) * SENTINEL_DIMENSION;
                elemCopy.position = disposition === fluid.position.INSIDE?
                   disposition : (fc? fluid.position.BEFORE : fluid.position.AFTER);
                elemCopy.clazz = clazz;
                targets[targets.length] = elemCopy;
            }

            function splitElement(targets, sides, cacheelem, disposition, clazz1, clazz2) {
                var elem1 = $.extend(true, {}, cacheelem);
                var elem2 = $.extend(true, {}, cacheelem);
                var midpoint = (elem1.rect[sides[0]] + elem1.rect[sides[1]]) / 2;
                elem1.rect[sides[1]] = midpoint; 
                elem1.position = fluid.position.BEFORE;

                elem2.rect[sides[0]] = midpoint; 
                elem2.position = fluid.position.AFTER;

                elem1.clazz = clazz1;
                elem2.clazz = clazz2;
                targets[targets.length] = elem1;
                targets[targets.length] = elem2;
            }

            // Expand this configuration point if we ever go back to a full "permissions" model
            function getRelativeClass(thisElements, index, relative, thisclazz, mapper) {
                index += relative;
                if (index < 0 && thisclazz === "locked") {
                    return "locked";
                }
                if (index >= thisElements.length || mapper === null) {
                    return null;
                } else {
                    relative = thisElements[index];
                    return mapper(relative) === "locked" && thisclazz === "locked" ? "locked" : null;
                }
            }

            var lastGeometry;
            var displacementX, displacementY;

            that.updateGeometry = function (geometricInfo) {
                lastGeometry = geometricInfo;
                targets = [];
                cache = {};
                var mapper = geometricInfo.elementMapper;
                for (var i = 0; i < geometricInfo.extents.length; ++ i) {
                    var thisInfo = geometricInfo.extents[i];
                    var orientation = thisInfo.orientation;
                    var sides = fluid.rectSides[orientation];

                    var processElement = function (element, sentB, sentF, disposition, j) {
                        var cacheelem = computeGeometry(element, orientation, disposition);
                        cacheelem.owner = thisInfo;
                        if (cacheelem.clazz !== "hidden" && mapper) {
                            cacheelem.clazz = mapper(element);
                        }
                        cache[cacheKey(element)] = cacheelem;
                        var backClass = getRelativeClass(thisInfo.elements, j, fluid.position.BEFORE, cacheelem.clazz, mapper); 
                        var frontClass = getRelativeClass(thisInfo.elements, j, fluid.position.AFTER, cacheelem.clazz, mapper); 
                        if (disposition === fluid.position.INSIDE) {
                            targets[targets.length] = cacheelem;
                        }
                        else {
                            splitElement(targets, sides, cacheelem, disposition, backClass, frontClass);
                        }
                        // deal with sentinel blocks by creating near-copies of the end elements
                        if (sentB && geometricInfo.sentinelize) {
                            sentinelizeElement(targets, sides, cacheelem, 1, disposition, backClass);
                        }
                        if (sentF && geometricInfo.sentinelize) {
                            sentinelizeElement(targets, sides, cacheelem, 0, disposition, frontClass);
                        }
                        //fluid.log(dumpelem(cacheelem));
                        return cacheelem;
                    };

                    var allHidden = true;
                    for (var j = 0; j < thisInfo.elements.length; ++ j) {
                        var element = thisInfo.elements[j];
                        var cacheelem = processElement(element, j === 0, j === thisInfo.elements.length - 1, 
                                fluid.position.INTERLEAVED, j);
                        if (cacheelem.clazz !== "hidden") {
                            allHidden = false;
                        }
                    }
                    if (allHidden && thisInfo.parentElement) {
                        processElement(thisInfo.parentElement, true, true, 
                                fluid.position.INSIDE);
                    }
                }   
            };

            that.startDrag = function (event, handlePos, handleWidth, handleHeight) {
                var handleMidX = handlePos[0] + handleWidth / 2;
                var handleMidY = handlePos[1] + handleHeight / 2;
                var dX = handleMidX - event.pageX;
                var dY = handleMidY - event.pageY;
                that.updateGeometry(lastGeometry);
                lastClosest = null;
                displacementX = dX;
                displacementY = dY;
                $("body").bind("mousemove.fluid-dropManager", that.mouseMove);
            };

            that.lastPosition = function () {
                return lastClosest;
            };

            that.endDrag = function () {
                $("body").unbind("mousemove.fluid-dropManager");
            };

            that.mouseMove = function (evt) {
                var x = evt.pageX + displacementX;
                var y = evt.pageY + displacementY;
                //fluid.log("Mouse x " + x + " y " + y );

                var closestTarget = that.closestTarget(x, y, lastClosest);
                if (closestTarget && closestTarget !== fluid.dropManager.NO_CHANGE) {
                    lastClosest = closestTarget;

                    that.dropChangeFirer.fire(closestTarget);
                }
            };

            that.dropChangeFirer = fluid.event.getEventFirer();

            var blankHolder = {
                element: null
            };

            that.closestTarget = function (x, y, lastClosest) {
                var mindistance = Number.MAX_VALUE;
                var minelem = blankHolder;
                var minlockeddistance = Number.MAX_VALUE;
                var minlockedelem = blankHolder;
                for (var i = 0; i < targets.length; ++ i) {
                    var cacheelem = targets[i];
                    if (cacheelem.clazz === "hidden") {
                        continue;
                    }
                    var distance = fluid.geom.minPointRectangle(x, y, cacheelem.rect);
                    if (cacheelem.clazz === "locked") {
                        if (distance < minlockeddistance) {
                            minlockeddistance = distance;
                            minlockedelem = cacheelem;
                        }
                    } else {
                        if (distance < mindistance) {
                            mindistance = distance;
                            minelem = cacheelem;
                        }
                        if (distance === 0) {
                            break;
                        }
                    }
                }
                if (!minelem) {
                    return minelem;
                }
                if (minlockeddistance >= mindistance) {
                    minlockedelem = blankHolder;
                }
                //fluid.log("PRE: mindistance " + mindistance + " element " + 
                //   fluid.dumpEl(minelem.element) + " minlockeddistance " + minlockeddistance
                //    + " locked elem " + dumpelem(minlockedelem));
                if (lastClosest && lastClosest.position === minelem.position &&
                    fluid.unwrap(lastClosest.element) === fluid.unwrap(minelem.element) &&
                    fluid.unwrap(lastClosest.lockedelem) === fluid.unwrap(minlockedelem.element)
                    ) {
                    return fluid.dropManager.NO_CHANGE;
                }
                //fluid.log("mindistance " + mindistance + " minlockeddistance " + minlockeddistance);
                return {
                    position: minelem.position,
                    element: minelem.element,
                    lockedelem: minlockedelem.element
                };
            };

            that.shuffleProjectFrom = function (element, direction, includeLocked) {
                var togo = that.projectFrom(element, direction, includeLocked);
                if (togo) {
                    togo.position = fluid.position.REPLACE;
                }
                return togo;
            };

            that.projectFrom = function (element, direction, includeLocked) {
                that.updateGeometry(lastGeometry);
                var cacheelem = cache[cacheKey(element)];
                var projected = fluid.geom.projectFrom(cacheelem.rect, direction, targets, includeLocked);
                if (!projected.cacheelem) {
                    return null;
                }
                var retpos = projected.cacheelem.position;
                return {element: projected.cacheelem.element, 
                         position: retpos? retpos : fluid.position.BEFORE 
                         };
            };

            function getRelativeElement(element, direction, elements) {
                var folded = fluid.directionSign(direction);

                var index = $(elements).index(element) + folded;
                if (index < 0) {
                    index += elements.length;
                }
                index %= elements.length;
                return elements[index];            
            }

            that.logicalFrom = function (element, direction, includeLocked) {
                var orderables = that.getOwningSpan(element, fluid.position.INTERLEAVED, includeLocked);
                return {element: getRelativeElement(element, direction, orderables), 
                    position: fluid.position.REPLACE};
            };

            that.lockedWrapFrom = function (element, direction, includeLocked) {
                var base = that.logicalFrom(element, direction, includeLocked);
                var selectables = that.getOwningSpan(element, fluid.position.INTERLEAVED, includeLocked);
                var allElements = cache[cacheKey(element)].owner.elements;
                if (includeLocked || selectables[0] === allElements[0]) {
                    return base;
                }
                var directElement = getRelativeElement(element, direction, allElements);
                if (lastGeometry.elementMapper(directElement) === "locked") {
                    base.element = null;
                    base.clazz = "locked";  
                }
                return base;
            }; 

            that.getOwningSpan = function (element, position, includeLocked) {
                var owner = cache[cacheKey(element)].owner; 
                var elements = position === fluid.position.INSIDE? [owner.parentElement] : owner.elements;
                if (!includeLocked && lastGeometry.elementMapper) {
                    elements = $.makeArray(elements);
                    fluid.remove_if(elements, function (element) {
                        return lastGeometry.elementMapper(element) === "locked";
                    });
                }
                return elements;
            };

            that.geometricMove = function (element, target, position) {
                var sourceElements = that.getOwningSpan(element, null, true);
                var targetElements = that.getOwningSpan(target, position, true);
                fluid.permuteDom(element, target, position, sourceElements, targetElements);
            };

            return that;
        };

        fluid.dropManager.NO_CHANGE = "no change";


        fluid.geom = fluid.geom || {};

        // These distance algorithms have been taken from
        // http://www.cs.mcgill.ca/~cs644/Godfried/2005/Fall/fzamal/concepts.htm

        /** Returns the minimum squared distance between a point and a rectangle **/
        fluid.geom.minPointRectangle = function (x, y, rectangle) {
            var dx = x < rectangle.left? (rectangle.left - x) : 
                      (x > rectangle.right? (x - rectangle.right) : 0);
            var dy = y < rectangle.top? (rectangle.top - y) : 
                      (y > rectangle.bottom? (y - rectangle.bottom) : 0);
            return dx * dx + dy * dy;
        };

        /** Returns the minimum squared distance between two rectangles **/
        fluid.geom.minRectRect = function (rect1, rect2) {
            var dx = rect1.right < rect2.left? rect2.left - rect1.right : 
                     rect2.right < rect1.left? rect1.left - rect2.right :0;
            var dy = rect1.bottom < rect2.top? rect2.top - rect1.bottom : 
                     rect2.bottom < rect1.top? rect1.top - rect2.bottom :0;
            return dx * dx + dy * dy;
        };

        var makePenCollect = function () {
            return {
                mindist: Number.MAX_VALUE,
                minrdist: Number.MAX_VALUE
            };
        };

        /** Determine the one amongst a set of rectangle targets which is the "best fit"
         * for an axial motion from a "base rectangle" (commonly arising from the case
         * of cursor key navigation).
         * @param {Rectangle} baserect The base rectangl from which the motion is to be referred
         * @param {fluid.direction} direction  The direction of motion
         * @param {Array of Rectangle holders} targets An array of objects "cache elements" 
         * for which the member <code>rect</code> is the holder of the rectangle to be tested.
         * @return The cache element which is the most appropriate for the requested motion.
         */
        fluid.geom.projectFrom = function (baserect, direction, targets, forSelection) {
            var axis = fluid.directionAxis(direction);
            var frontSide = fluid.rectSides[direction];
            var backSide = fluid.rectSides[axis * 15 + 5 - direction];
            var dirSign = fluid.directionSign(direction);

            var penrect = {left: (7 * baserect.left + 1 * baserect.right) / 8,
                           right: (5 * baserect.left + 3 * baserect.right) / 8,
                           top: (7 * baserect.top + 1 * baserect.bottom) / 8,
                           bottom: (5 * baserect.top + 3 * baserect.bottom) / 8};

            penrect[frontSide] = dirSign * SENTINEL_DIMENSION;
            penrect[backSide] = -penrect[frontSide];

            function accPen(collect, cacheelem, backSign) {
                var thisrect = cacheelem.rect;
                var pdist = fluid.geom.minRectRect(penrect, thisrect);
                var rdist = -dirSign * backSign * (baserect[backSign === 1 ? frontSide:backSide] 
                                                 - thisrect[backSign === 1 ? backSide:frontSide]);
                // fluid.log("pdist: " + pdist + " rdist: " + rdist);
                // the oddity in the rdist comparison is intended to express "half-open"-ness of rectangles
                // (backSign === 1? 0 : 1) - this is now gone - must be possible to move to perpendicularly abutting regions
                if (pdist <= collect.mindist && rdist >= 0) {
                    if (pdist === collect.mindist && rdist * backSign > collect.minrdist) {
                        return;
                    }
                    collect.minrdist = rdist * backSign;
                    collect.mindist = pdist;
                    collect.minelem = cacheelem;
                }
            }
            var collect = makePenCollect();
            var backcollect = makePenCollect();
            var lockedcollect = makePenCollect();

            for (var i = 0; i < targets.length; ++ i) {
                var elem = targets[i];
                var isPure = elem.owner && elem.element === elem.owner.parentElement;
                if (elem.clazz === "hidden" || forSelection && isPure) {
                    continue;
                }
                else if (!forSelection && elem.clazz === "locked") {
                    accPen(lockedcollect, elem, 1);
                }
                else {
                    accPen(collect, elem, 1);
                    accPen(backcollect, elem, -1);
                }
                //fluid.log("Element " + i + " " + dumpelem(elem) + " mindist " + collect.mindist);
            }
            var wrap = !collect.minelem || backcollect.mindist < collect.mindist;
            var mincollect = wrap? backcollect: collect;
            var togo = {
                wrapped: wrap,
                cacheelem: mincollect.minelem
            };
            if (lockedcollect.mindist < mincollect.mindist) {
                togo.lockedelem = lockedcollect.minelem;
            }
            return togo;
        };
    })(jQuery, fluid_1_2);
    /*
    Copyright 2007-2009 University of Toronto
    Copyright 2007-2010 University of Cambridge

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    // Declare dependencies.
    /*global jQuery, fluid_1_2, document*/

    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {

        var defaultAvatarCreator = function (item, cssClass, dropWarning) {
            fluid.dom.cleanseScripts(fluid.unwrap(item));
            var avatar = $(item).clone();

            fluid.dom.iterateDom(avatar.get(0), function (node) {
                node.removeAttribute("id");
                if (node.tagName.toLowerCase() === "input") {
                    node.setAttribute("disabled", "disabled");
                }
            });

            avatar.removeAttr("id");
            avatar.removeClass("ui-droppable");
            avatar.addClass(cssClass);

            if (dropWarning) {
                // Will a 'div' always be valid in this position?
                var avatarContainer = $(document.createElement("div"));
                avatarContainer.append(avatar);
                avatarContainer.append(dropWarning);
                avatar = avatarContainer;
            }
            $("body").append(avatar);
            if (!$.browser.safari) {
                // FLUID-1597: Safari appears incapable of correctly determining the dimensions of elements
                avatar.css("display", "block").width(item.offsetWidth).height(item.offsetHeight);
            }

            if ($.browser.opera) { // FLUID-1490. Without this detect, curCSS explodes on the avatar on Firefox.
                avatar.hide();
            }
            return avatar;
        };

        function bindHandlersToContainer(container, keyDownHandler, keyUpHandler, mouseMoveHandler) {
            var actualKeyDown = keyDownHandler;
            var advancedPrevention = false;

            // FLUID-1598 and others: Opera will refuse to honour a "preventDefault" on a keydown.
            // http://forums.devshed.com/javascript-development-115/onkeydown-preventdefault-opera-485371.html
            if ($.browser.opera) {
                container.keypress(function (evt) {
                    if (advancedPrevention) {
                        advancedPrevention = false;
                        evt.preventDefault();
                        return false;
                    }
                });
                actualKeyDown = function (evt) {
                    var oldret = keyDownHandler(evt);
                    if (oldret === false) {
                        advancedPrevention = true;
                    }
                };
            }
            container.keydown(actualKeyDown);
            container.keyup(keyUpHandler);
        }

        function addRolesToContainer(that) {
            that.container.attr("role", that.options.containerRole.container);
            that.container.attr("aria-multiselectable", "false");
            that.container.attr("aria-readonly", "false");
            that.container.attr("aria-disabled", "false");
        }

        function createAvatarId(parentId) {
            // Generating the avatar's id to be containerId_avatar
            // This is safe since there is only a single avatar at a time
            return parentId + "_avatar";
        }

        var adaptKeysets = function (options) {
            if (options.keysets && !(options.keysets instanceof Array)) {
                options.keysets = [options.keysets];    
            }
        };

        /**
         * @param container - A jQueryable designator for the root node of the reorderer (a selector, a DOM node, or a jQuery instance)
         * @param options - an object containing any of the available options:
         *                  containerRole - indicates the role, or general use, for this instance of the Reorderer
         *                  keysets - an object containing sets of keycodes to use for directional navigation. Must contain:
         *                            modifier - a function that returns a boolean, indicating whether or not the required modifier(s) are activated
         *                            up
         *                            down
         *                            right
         *                            left
         *                  styles - an object containing class names for styling the Reorderer
         *                                  defaultStyle
         *                                  selected
         *                                  dragging
         *                                  hover
         *                                  dropMarker
         *                                  mouseDrag
         *                                  avatar
         *                  avatarCreator - a function that returns a valid DOM node to be used as the dragging avatar
         */
        fluid.reorderer = function (container, options) {
            if (!container) {
                fluid.fail("Reorderer initialised with no container");
            }
            var thatReorderer = fluid.initView("fluid.reorderer", container, options);
            options = thatReorderer.options;

            var dropManager = fluid.dropManager();

            thatReorderer.layoutHandler = fluid.initSubcomponent(thatReorderer,
                "layoutHandler", [thatReorderer.container, options, dropManager, thatReorderer.dom]);

            thatReorderer.activeItem = undefined;

            adaptKeysets(options);

            var kbDropWarning = thatReorderer.locate("dropWarning");
            var mouseDropWarning;
            if (kbDropWarning) {
                mouseDropWarning = kbDropWarning.clone();
            }

            var isMove = function (evt) {
                var keysets = options.keysets;
                for (var i = 0; i < keysets.length; i++) {
                    if (keysets[i].modifier(evt)) {
                        return true;
                    }
                }
                return false;
            };

            var isActiveItemMovable = function () {
                return $.inArray(thatReorderer.activeItem, thatReorderer.dom.fastLocate("movables")) >= 0;
            };

            var setDropEffects = function (value) {
                thatReorderer.dom.fastLocate("dropTargets").attr("aria-dropeffect", value);
            };

            var styles = options.styles;

            var noModifier = function (evt) {
                return (!evt.ctrlKey && !evt.altKey && !evt.shiftKey && !evt.metaKey);
            };

            var handleDirectionKeyDown = function (evt) {
                var item = thatReorderer.activeItem;
                if (!item) {
                    return true;
                }
                var keysets = options.keysets;
                for (var i = 0; i < keysets.length; i++) {
                    var keyset = keysets[i];
                    var keydir = fluid.keyForValue(keyset, evt.keyCode);
                    if (!keydir) {
                        continue;
                    }
                    var isMovement = keyset.modifier(evt);

                    var dirnum = fluid.keycodeDirection[keydir];
                    var relativeItem = thatReorderer.layoutHandler.getRelativePosition(item, dirnum, !isMovement);
                    if (!relativeItem) {
                        continue;
                    }

                    if (isMovement) {
                        var prevent = thatReorderer.events.onBeginMove.fire(item);
                        if (prevent === false) {
                            return false;
                        }
                        if (kbDropWarning.length > 0) {
                            if (relativeItem.clazz === "locked") {
                                thatReorderer.events.onShowKeyboardDropWarning.fire(item, kbDropWarning);
                                kbDropWarning.show();                       
                            }
                            else {
                                kbDropWarning.hide();
                            }
                        }
                        if (relativeItem.element) {
                            thatReorderer.requestMovement(relativeItem, item);
                        }

                    } else if (noModifier(evt)) {
                        item.blur();
                        $(relativeItem.element).focus();
                    }
                    return false;
                }
                return true;
            };

            thatReorderer.handleKeyDown = function (evt) {
                if (!thatReorderer.activeItem || thatReorderer.activeItem !== evt.target) {
                    return true;
                }
                // If the key pressed is ctrl, and the active item is movable we want to restyle the active item.
                var jActiveItem = $(thatReorderer.activeItem);
                if (!jActiveItem.hasClass(styles.dragging) && isMove(evt)) {
                   // Don't treat the active item as dragging unless it is a movable.
                    if (isActiveItemMovable()) {
                        jActiveItem.removeClass(styles.selected);
                        jActiveItem.addClass(styles.dragging);
                        jActiveItem.attr("aria-grabbed", "true");
                        setDropEffects("move");
                    }
                    return false;
                }
                // The only other keys we listen for are the arrows.
                return handleDirectionKeyDown(evt);
            };

            thatReorderer.handleKeyUp = function (evt) {
                if (!thatReorderer.activeItem || thatReorderer.activeItem !== evt.target) {
                    return true;
                }
                var jActiveItem = $(thatReorderer.activeItem);

                // Handle a key up event for the modifier
                if (jActiveItem.hasClass(styles.dragging) && !isMove(evt)) {
                    if (kbDropWarning) {
                        kbDropWarning.hide();
                    }
                    jActiveItem.removeClass(styles.dragging);
                    jActiveItem.addClass(styles.selected);
                    jActiveItem.attr("aria-grabbed", "false");
                    setDropEffects("none");
                    return false;
                }

                return false;
            };

            var dropMarker;

            var createDropMarker = function (tagName) {
                var dropMarker = $(document.createElement(tagName));
                dropMarker.addClass(options.styles.dropMarker);
                dropMarker.hide();
                return dropMarker;
            };

            fluid.logEnabled = true;

            thatReorderer.requestMovement = function (requestedPosition, item) {
              // Temporary censoring to get around ModuleLayout inability to update relative to self.
                if (!requestedPosition || fluid.unwrap(requestedPosition.element) === fluid.unwrap(item)) {
                    return;
                }
                thatReorderer.events.onMove.fire(item, requestedPosition);
                dropManager.geometricMove(item, requestedPosition.element, requestedPosition.position);
                //$(thatReorderer.activeItem).removeClass(options.styles.selected);

                // refocus on the active item because moving places focus on the body
                $(thatReorderer.activeItem).focus();

                thatReorderer.refresh();

                dropManager.updateGeometry(thatReorderer.layoutHandler.getGeometricInfo());

                thatReorderer.events.afterMove.fire(item, requestedPosition, thatReorderer.dom.fastLocate("movables"));
            };

            var hoverStyleHandler = function (item, state) {
                thatReorderer.dom.fastLocate("grabHandle", item)[state?"addClass":"removeClass"](styles.hover);
            };
            /**
             * Takes a $ object and adds 'movable' functionality to it
             */
            function initMovable(item) {
                var styles = options.styles;
                item.attr("aria-grabbed", "false");

                item.mouseover(
                    function () {
                        thatReorderer.events.onHover.fire(item, true);
                    }
                );

                item.mouseout(
                    function () {
                        thatReorderer.events.onHover.fire(item, false);
                    }
                );
                var avatar;

                thatReorderer.dom.fastLocate("grabHandle", item).draggable({
                    refreshPositions: false,
                    scroll: true,
                    helper: function () {
                        var dropWarningEl;
                        if (mouseDropWarning) {
                            dropWarningEl = mouseDropWarning[0];
                        }
                        avatar = $(options.avatarCreator(item[0], styles.avatar, dropWarningEl));
                        avatar.attr("id", createAvatarId(thatReorderer.container.id));
                        return avatar;
                    },
                    start: function (e, ui) {
                        var prevent = thatReorderer.events.onBeginMove.fire(item);
                        if (prevent === false) {
                            return false;
                        }
                        var handle = thatReorderer.dom.fastLocate("grabHandle", item)[0];
                        var handlePos = fluid.dom.computeAbsolutePosition(handle);
                        var handleWidth = handle.offsetWidth;
                        var handleHeight = handle.offsetHeight;
                        item.focus();
                        item.removeClass(options.styles.selected);
                        item.addClass(options.styles.mouseDrag);
                        item.attr("aria-grabbed", "true");
                        setDropEffects("move");
                        dropManager.startDrag(e, handlePos, handleWidth, handleHeight);
                        avatar.show();
                    },
                    stop: function (e, ui) {
                        item.removeClass(options.styles.mouseDrag);
                        item.addClass(options.styles.selected);
                        $(thatReorderer.activeItem).attr("aria-grabbed", "false");
                        var markerNode = fluid.unwrap(dropMarker);
                        if (markerNode.parentNode) {
                            markerNode.parentNode.removeChild(markerNode);
                        }
                        avatar.hide();
                        ui.helper = null;
                        setDropEffects("none");
                        dropManager.endDrag();

                        thatReorderer.requestMovement(dropManager.lastPosition(), item);
                        // refocus on the active item because moving places focus on the body
                        thatReorderer.activeItem.focus();
                    },
                    handle: thatReorderer.dom.fastLocate("grabHandle", item)
                });
            }

            function changeSelectedToDefault(jItem, styles) {
                jItem.removeClass(styles.selected);
                jItem.removeClass(styles.dragging);
                jItem.addClass(styles.defaultStyle);
                jItem.attr("aria-selected", "false");
            }

            var selectItem = function (anItem) {
                thatReorderer.events.onSelect.fire(anItem);
                var styles = options.styles;
                // Set the previous active item back to its default state.
                if (thatReorderer.activeItem && thatReorderer.activeItem !== anItem) {
                    changeSelectedToDefault($(thatReorderer.activeItem), styles);
                }
                // Then select the new item.
                thatReorderer.activeItem = anItem;
                var jItem = $(anItem);
                jItem.removeClass(styles.defaultStyle);
                jItem.addClass(styles.selected);
                jItem.attr("aria-selected", "true");
            };

            var initSelectables = function () {
                var handleBlur = function (evt) {
                    changeSelectedToDefault($(this), options.styles);
                    return evt.stopPropagation();
                };

                var handleFocus = function (evt) {
                    selectItem(this);
                    return evt.stopPropagation();
                };

                var selectables = thatReorderer.dom.fastLocate("selectables");
                for (var i = 0; i < selectables.length; ++ i) {
                    var selectable = $(selectables[i]);
                    if (!$.data(selectable[0], "fluid.reorderer.selectable-initialised")) { 
                        selectable.addClass(styles.defaultStyle);

                        selectable.blur(handleBlur);
                        selectable.focus(handleFocus);
                        selectable.click(function (evt) {
                            var handle = fluid.unwrap(thatReorderer.dom.fastLocate("grabHandle", this));
                            if (fluid.dom.isContainer(handle, evt.target)) {
                                $(this).focus();
                            }
                        });

                        selectable.attr("role", options.containerRole.item);
                        selectable.attr("aria-selected", "false");
                        selectable.attr("aria-disabled", "false");
                        $.data(selectable[0], "fluid.reorderer.selectable-initialised", true);
                    }
                }
                if (!thatReorderer.selectableContext) {
                    thatReorderer.selectableContext = fluid.selectable(thatReorderer.container, {
                        selectableElements: selectables,
                        selectablesTabindex: thatReorderer.options.selectablesTabindex,
                        direction: null
                    });
                }
            };

            var dropChangeListener = function (dropTarget) {
                fluid.moveDom(dropMarker, dropTarget.element, dropTarget.position);
                dropMarker.css("display", "");
                if (mouseDropWarning) {
                    if (dropTarget.lockedelem) {
                        mouseDropWarning.show();
                    }
                    else {
                        mouseDropWarning.hide();
                    }
                }
            };

            var initItems = function () {
                var movables = thatReorderer.dom.fastLocate("movables");
                var dropTargets = thatReorderer.dom.fastLocate("dropTargets");
                initSelectables();

                // Setup movables
                for (var i = 0; i < movables.length; i++) {
                    var item = movables[i];
                    if (!$.data(item, "fluid.reorderer.movable-initialised")) { 
                        initMovable($(item));
                        $.data(item, "fluid.reorderer.movable-initialised", true);
                    }
                }

                // In order to create valid html, the drop marker is the same type as the node being dragged.
                // This creates a confusing UI in cases such as an ordered list. 
                // drop marker functionality should be made pluggable. 
                if (movables.length > 0 && !dropMarker) {
                    dropMarker = createDropMarker(movables[0].tagName);
                }

                dropManager.updateGeometry(thatReorderer.layoutHandler.getGeometricInfo());

                dropManager.dropChangeFirer.addListener(dropChangeListener, "fluid.Reorderer");
                // Setup dropTargets
                dropTargets.attr("aria-dropeffect", "none");  

            };


            // Final initialization of the Reorderer at the end of the construction process 
            if (thatReorderer.container) {
                bindHandlersToContainer(thatReorderer.container, 
                    thatReorderer.handleKeyDown,
                    thatReorderer.handleKeyUp);
                addRolesToContainer(thatReorderer);
                fluid.tabbable(thatReorderer.container);
                initItems();
            }

            if (options.afterMoveCallbackUrl) {
                thatReorderer.events.afterMove.addListener(function () {
                    var layoutHandler = thatReorderer.layoutHandler;
                    var model = layoutHandler.getModel? layoutHandler.getModel():
                         options.acquireModel(thatReorderer);
                    $.post(options.afterMoveCallbackUrl, JSON.stringify(model));
                }, "postModel");
            }
            thatReorderer.events.onHover.addListener(hoverStyleHandler, "style");

            thatReorderer.refresh = function () {
                thatReorderer.dom.refresh("movables");
                thatReorderer.dom.refresh("selectables");
                thatReorderer.dom.refresh("grabHandle", thatReorderer.dom.fastLocate("movables"));
                thatReorderer.dom.refresh("stylisticOffset", thatReorderer.dom.fastLocate("movables"));
                thatReorderer.dom.refresh("dropTargets");
                thatReorderer.events.onRefresh.fire();
                initItems();
                thatReorderer.selectableContext.selectables = thatReorderer.dom.fastLocate("selectables");
                thatReorderer.selectableContext.selectablesUpdated(thatReorderer.activeItem);
            };

            thatReorderer.refresh();

            return thatReorderer;
        };

        /**
         * Constants for key codes in events.
         */    
        fluid.reorderer.keys = {
            TAB: 9,
            ENTER: 13,
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            META: 19,
            SPACE: 32,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            i: 73,
            j: 74,
            k: 75,
            m: 77
        };

        /**
         * The default key sets for the Reorderer. Should be moved into the proper component defaults.
         */
        fluid.reorderer.defaultKeysets = [{
            modifier : function (evt) {
                return evt.ctrlKey;
            },
            up : fluid.reorderer.keys.UP,
            down : fluid.reorderer.keys.DOWN,
            right : fluid.reorderer.keys.RIGHT,
            left : fluid.reorderer.keys.LEFT
        },
        {
            modifier : function (evt) {
                return evt.ctrlKey;
            },
            up : fluid.reorderer.keys.i,
            down : fluid.reorderer.keys.m,
            right : fluid.reorderer.keys.k,
            left : fluid.reorderer.keys.j
        }];

        /**
         * These roles are used to add ARIA roles to orderable items. This list can be extended as needed,
         * but the values of the container and item roles must match ARIA-specified roles.
         */  
        fluid.reorderer.roles = {
            GRID: { container: "grid", item: "gridcell" },
            LIST: { container: "list", item: "listitem" },
            REGIONS: { container: "main", item: "article" }
        };

        // Simplified API for reordering lists and grids.
        var simpleInit = function (container, layoutHandler, options) {
            options = options || {};
            options.layoutHandler = layoutHandler;
            return fluid.reorderer(container, options);
        };

        fluid.reorderList = function (container, options) {
            return simpleInit(container, "fluid.listLayoutHandler", options);
        };

        fluid.reorderGrid = function (container, options) {
            return simpleInit(container, "fluid.gridLayoutHandler", options); 
        };

        fluid.reorderer.SHUFFLE_GEOMETRIC_STRATEGY = "shuffleProjectFrom";
        fluid.reorderer.GEOMETRIC_STRATEGY         = "projectFrom";
        fluid.reorderer.LOGICAL_STRATEGY           = "logicalFrom";
        fluid.reorderer.WRAP_LOCKED_STRATEGY       = "lockedWrapFrom";
        fluid.reorderer.NO_STRATEGY = null;

        fluid.reorderer.relativeInfoGetter = function (orientation, coStrategy, contraStrategy, dropManager, dom) {
            return function (item, direction, forSelection) {
                var dirorient = fluid.directionOrientation(direction);
                var strategy = dirorient === orientation? coStrategy: contraStrategy;
                return strategy !== null? dropManager[strategy](item, direction, forSelection) : null;
            };
        };

        fluid.defaults("fluid.reorderer", {
            styles: {
                defaultStyle: "fl-reorderer-movable-default",
                selected: "fl-reorderer-movable-selected",
                dragging: "fl-reorderer-movable-dragging",
                mouseDrag: "fl-reorderer-movable-dragging",
                hover: "fl-reorderer-movable-hover",
                dropMarker: "fl-reorderer-dropMarker",
                avatar: "fl-reorderer-avatar"
            },
            selectors: {
                dropWarning: ".flc-reorderer-dropWarning",
                movables: ".flc-reorderer-movable",
                grabHandle: "",
                stylisticOffset: ""
            },
            avatarCreator: defaultAvatarCreator,
            keysets: fluid.reorderer.defaultKeysets,
            layoutHandler: {
                type: "fluid.listLayoutHandler"
            },

            events: {
                onShowKeyboardDropWarning: null,
                onSelect: null,
                onBeginMove: "preventable",
                onMove: null,
                afterMove: null,
                onHover: null,
                onRefresh: null
            },

            mergePolicy: {
                keysets: "replace",
                "selectors.selectables": "selectors.movables",
                "selectors.dropTargets": "selectors.movables"
            }
        });


        /*******************
         * Layout Handlers *
         *******************/

        function geometricInfoGetter(orientation, sentinelize, dom) {
            return function () {
                return {
                    sentinelize: sentinelize,
                    extents: [{
                        orientation: orientation,
                        elements: dom.fastLocate("dropTargets")
                    }],
                    elementMapper: function (element) {
                        return $.inArray(element, dom.fastLocate("movables")) === -1? "locked": null;
                    }
                };
            };
        }

        fluid.defaults(true, "fluid.listLayoutHandler", 
            {orientation:         fluid.orientation.VERTICAL,
             containerRole:       fluid.reorderer.roles.LIST,
             selectablesTabindex: -1,
             sentinelize:         true
            });

        // Public layout handlers.
        fluid.listLayoutHandler = function (container, options, dropManager, dom) {
            var that = {};

            that.getRelativePosition = 
              fluid.reorderer.relativeInfoGetter(options.orientation, 
                    fluid.reorderer.LOGICAL_STRATEGY, null, dropManager, dom);

            that.getGeometricInfo = geometricInfoGetter(options.orientation, options.sentinelize, dom);

            return that;
        }; // End ListLayoutHandler

        fluid.defaults(true, "fluid.gridLayoutHandler", 
            {orientation:         fluid.orientation.HORIZONTAL,
             containerRole:       fluid.reorderer.roles.GRID,
             selectablesTabindex: -1,
             sentinelize:         false
             });
        /*
         * Items in the Lightbox are stored in a list, but they are visually presented as a grid that
         * changes dimensions when the window changes size. As a result, when the user presses the up or
         * down arrow key, what lies above or below depends on the current window size.
         * 
         * The GridLayoutHandler is responsible for handling changes to this virtual 'grid' of items
         * in the window, and of informing the Lightbox of which items surround a given item.
         */
        fluid.gridLayoutHandler = function (container, options, dropManager, dom) {
            var that = {};

            that.getRelativePosition = 
               fluid.reorderer.relativeInfoGetter(options.orientation, 
                     fluid.reorderer.LOGICAL_STRATEGY, fluid.reorderer.SHUFFLE_GEOMETRIC_STRATEGY, 
                     dropManager, dom);

            that.getGeometricInfo = geometricInfoGetter(options.orientation, options.sentinelize, dom);

            return that;
        }; // End of GridLayoutHandler

    })(jQuery, fluid_1_2);
    /*
    Copyright 2008-2009 University of Cambridge
    Copyright 2008-2009 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    /*global jQuery*/
    /*global fluid_1_2*/

    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {

        var deriveLightboxCellBase = function (namebase, index) {
            return namebase + "lightbox-cell:" + index + ":";
        };

        var addThumbnailActivateHandler = function (container) {
            var enterKeyHandler = function (evt) {
                if (evt.which === fluid.reorderer.keys.ENTER) {
                    var thumbnailAnchors = $("a", evt.target);
                    document.location = thumbnailAnchors.attr("href");
                }
            };

            container.keypress(enterKeyHandler);
        };

        // Custom query method seeks all tags descended from a given root with a 
        // particular tag name, whose id matches a regex.
        var seekNodesById = function (rootnode, tagname, idmatch) {
            var inputs = rootnode.getElementsByTagName(tagname);
            var togo = [];
            for (var i = 0; i < inputs.length; i += 1) {
                var input = inputs[i];
                var id = input.id;
                if (id && id.match(idmatch)) {
                    togo.push(input);
                }
            }
            return togo;
        };

        var createImageCellFinder = function (parentNode, containerId) {
            parentNode = fluid.unwrap(parentNode);

            var lightboxCellNamePattern = "^" + deriveLightboxCellBase(containerId, "[0-9]+") + "$";

            return function () {
                // This orderable finder assumes that the lightbox thumbnails are 'div' elements
                return seekNodesById(parentNode, "div", lightboxCellNamePattern);
            };
        };

        var seekForm = function (container) {
            return fluid.findAncestor(container, function (element) {
                return $(element).is("form");
            });
        };

        var seekInputs = function (container, reorderform) {
            return seekNodesById(reorderform, 
                                 "input", 
                                 "^" + deriveLightboxCellBase(container.attr("id"), "[^:]*") + "reorder-index$");
        };

        var mapIdsToNames = function (container, reorderform) {
            var inputs = seekInputs(container, reorderform);
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                var name = input.name;
                input.name = name || input.id;
            }
        };

        /**
         * Returns a default afterMove listener using the id-based, form-driven scheme for communicating with the server.
         * It is implemented by nesting hidden form fields inside each thumbnail container. The value of these form elements
         * represent the order for each image. This default listener submits the form's default 
         * action via AJAX.
         * 
         * @param {jQueryable} container the Image Reorderer's container element 
         */
        var createIDAfterMoveListener = function (container) {
            var reorderform = seekForm(container);
            mapIdsToNames(container, reorderform);

            return function () {
                var inputs, i;
                inputs = seekInputs(container, reorderform);

                for (i = 0; i < inputs.length; i += 1) {
                    inputs[i].value = i;
                }

                if (reorderform && reorderform.action) {
                    var order = $(reorderform).serialize();
                    $.post(reorderform.action, 
                           order,
                           function (type, data, evt) { /* No-op response */ });
                }
            };
        };


        var setDefaultValue = function (target, path, value) {
            var previousValue = fluid.model.getBeanValue(target, path);
            var valueToSet = previousValue || value;
            fluid.model.setBeanValue(target, path, valueToSet);
        };

        // Public Lightbox API
        /**
         * Creates a new Lightbox instance from the specified parameters, providing full control over how
         * the Lightbox is configured.
         * 
         * @param {Object} container 
         * @param {Object} options 
         */
        fluid.reorderImages = function (container, options) {
            // Instantiate a mini-Image Reorderer component, then feed its options to the real Reorderer.
            var that = fluid.initView("fluid.reorderImages", container, options);

            // If the user didn't specify their own afterMove or movables options,
            // set up defaults for them using the old id-based scheme.
            // Backwards API compatiblity. Remove references to afterMoveCallback by Infusion 1.5.
            setDefaultValue(that, "options.listeners.afterMove", 
                            that.options.afterMoveCallback || createIDAfterMoveListener(that.container));
            setDefaultValue(that, "options.selectors.movables", 
                            createImageCellFinder(that.container, that.container.attr("id")));

            var reorderer = fluid.reorderer(that.container, that.options);

            // Add accessibility support, including ARIA and keyboard navigation.
            fluid.transform(reorderer.locate("movables"), function (cell) { 
                fluid.reorderImages.addAriaRoles(that.options.selectors.imageTitle, cell);
            });
            fluid.tabindex($("a", that.container), -1);
            addThumbnailActivateHandler(that.container);

            return reorderer;
        };


        fluid.reorderImages.addAriaRoles = function (imageTitle, cell) {
            cell = $(cell);
            cell.attr("role", "img");
            var title = $(imageTitle, cell);
            if (title[0] === cell[0] || title[0] === document) {
                fluid.fail("Could not locate cell title using selector " + imageTitle + " in context " + fluid.dumpEl(cell));
            }
            var titleId = fluid.allocateSimpleId(title);
            cell.attr("aria-labelledby", titleId);
            var image = $("img", cell);
            image.attr("role", "presentation");
            image.attr("alt", "");
        };

        // This function now deprecated. Please use fluid.reorderImages() instead.
        fluid.lightbox = fluid.reorderImages;

        fluid.defaults("fluid.reorderImages", {
            layoutHandler: "fluid.gridLayoutHandler",

            selectors: {
                imageTitle: ".flc-reorderer-imageTitle"
            }
        });

    })(jQuery, fluid_1_2);
    /*
    Copyright 2008-2009 University of Cambridge
    Copyright 2008-2009 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    // Declare dependencies.
    /*global jQuery*/
    /*global fluid, fluid_1_2*/

    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {

        fluid.moduleLayout = fluid.moduleLayout || {};

        /**
         * Calculate the location of the item and the column in which it resides.
         * @return  An object with column index and item index (within that column) properties.
         *          These indices are -1 if the item does not exist in the grid.
         */
        var findColumnAndItemIndices = function (item, layout) {
            return fluid.find(layout.columns,
                function (column, colIndex) {
                    var index = $.inArray(item, column.elements);
                    return index === -1? null : {columnIndex: colIndex, itemIndex: index};
                }, {columnIndex: -1, itemIndex: -1});
        };

        var findColIndex = function (item, layout) {
            return fluid.find(layout.columns,
                function (column, colIndex) {
                	return item === column.container? colIndex : null;
                }, -1);
        };

        /**
         * Move an item within the layout object. 
         */
        fluid.moduleLayout.updateLayout = function (item, target, position, layout) {
            item = fluid.unwrap(item);
            target = fluid.unwrap(target);
            var itemIndices = findColumnAndItemIndices(item, layout);
            layout.columns[itemIndices.columnIndex].elements.splice(itemIndices.itemIndex, 1);
            var targetCol;
            if (position === fluid.position.INSIDE) {
                targetCol = layout.columns[findColIndex(target, layout)].elements;
                targetCol.splice(targetCol.length, 0, item);

            } else {
                var relativeItemIndices = findColumnAndItemIndices(target, layout);
                targetCol = layout.columns[relativeItemIndices.columnIndex].elements;
                position = fluid.normalisePosition(position, 
                      itemIndices.columnIndex === relativeItemIndices.columnIndex, 
                      relativeItemIndices.itemIndex, itemIndices.itemIndex);
                var relative = position === fluid.position.BEFORE? 0 : 1;
                targetCol.splice(relativeItemIndices.itemIndex + relative, 0, item);
            }
        };

        /**
         * Builds a layout object from a set of columns and modules.
         * @param {jQuery} container
         * @param {jQuery} columns
         * @param {jQuery} portlets
         */
        fluid.moduleLayout.layoutFromFlat = function (container, columns, portlets) {
            var layout = {};
            layout.container = container;
            layout.columns = fluid.transform(columns, 
                function (column) {
                    return {
                        container: column,
                        elements: $.makeArray(portlets.filter(function () {
                        	  // is this a bug in filter? would have expected "this" to be 1st arg
                            return fluid.dom.isContainer(column, this);
                        }))
                    };
                });
            return layout;
        };

        /**
         * Builds a layout object from a serialisable "layout" object consisting of id lists
         */
        fluid.moduleLayout.layoutFromIds = function (idLayout) {
            return {
                container: fluid.byId(idLayout.id),
                columns: fluid.transform(idLayout.columns, 
                    function (column) {
                        return {
                            container: fluid.byId(column.id),
                            elements: fluid.transform(column.children, fluid.byId)
                        };
                    })
                };
        };

        /**
         * Serializes the current layout into a structure of ids
         */
        fluid.moduleLayout.layoutToIds = function (idLayout) {
            return {
                id: fluid.getId(idLayout.container),
                columns: fluid.transform(idLayout.columns, 
                    function (column) {
                        return {
                            id: fluid.getId(column.container),
                            children: fluid.transform(column.elements, fluid.getId)
                        };
                    })
                };
        };

        var defaultOnShowKeyboardDropWarning = function (item, dropWarning) {
            if (dropWarning) {
                var offset = $(item).offset();
                dropWarning = $(dropWarning);
                dropWarning.css("position", "absolute");
                dropWarning.css("top", offset.top);
                dropWarning.css("left", offset.left);
            }
        };

        fluid.defaults(true, "fluid.moduleLayoutHandler", 
            {orientation: fluid.orientation.VERTICAL,
             containerRole: fluid.reorderer.roles.REGIONS,
             selectablesTabindex: 0,
             sentinelize:         true
             });

        /**
         * Module Layout Handler for reordering content modules.
         * 
         * General movement guidelines:
         * 
         * - Arrowing sideways will always go to the top (moveable) module in the column
         * - Moving sideways will always move to the top available drop target in the column
         * - Wrapping is not necessary at this first pass, but is ok
         */
        fluid.moduleLayoutHandler = function (container, options, dropManager, dom) {
            var that = {};

            function computeLayout() {
                var togo;
                if (options.selectors.modules) {
                    togo = fluid.moduleLayout.layoutFromFlat(container, dom.locate("columns"), dom.locate("modules"));
                }
                if (!togo) {
                    var idLayout = fluid.model.getBeanValue(options, "moduleLayout.layout");
                    fluid.moduleLayout.layoutFromIds(idLayout);
                }
                return togo;
            }
            var layout = computeLayout();
            that.layout = layout;

            function isLocked(item) {
                var lockedModules = options.selectors.lockedModules? dom.fastLocate("lockedModules") : [];
                return $.inArray(item, lockedModules) !== -1;
            }

            that.getRelativePosition  = 
               fluid.reorderer.relativeInfoGetter(options.orientation, 
                     fluid.reorderer.WRAP_LOCKED_STRATEGY, fluid.reorderer.GEOMETRIC_STRATEGY, 
                     dropManager, dom);

            that.getGeometricInfo = function () {
            	var extents = [];
                var togo = {extents: extents,
                            sentinelize: options.sentinelize};
                togo.elementMapper = function (element) {
                    return isLocked(element)? "locked" : null;
                };
                for (var col = 0; col < layout.columns.length; col++) {
                    var column = layout.columns[col];
                    var thisEls = {
                        orientation: options.orientation,
                        elements: $.makeArray(column.elements),
                        parentElement: column.container
                    };
                  //  fluid.log("Geometry col " + col + " elements " + fluid.dumpEl(thisEls.elements) + " isLocked [" + 
                  //       fluid.transform(thisEls.elements, togo.elementMapper).join(", ") + "]");
                    extents.push(thisEls);
                }

                return togo;
            };

            function computeModules(all) {
                return function () {
                    var modules = fluid.accumulate(layout.columns, function (column, list) {
                        return list.concat(column.elements); // note that concat will not work on a jQuery
                    }, []);
                    if (!all) {
                        fluid.remove_if(modules, isLocked);
                    }
                    return modules;
                };
            }

            that.returnedOptions = {
                selectors: {
                    movables: computeModules(false),
                    dropTargets: computeModules(false),
                    selectables: computeModules(true)
                },
                listeners: {
                    onMove: function (item, requestedPosition) {
                        fluid.moduleLayout.updateLayout(item, requestedPosition.element, requestedPosition.position, layout);
                    },
                    onRefresh: function () {
                        layout = computeLayout();
                        that.layout = layout;
                    },
                    "onShowKeyboardDropWarning.setPosition": defaultOnShowKeyboardDropWarning
                }
            };

            that.getModel = function () {
                return fluid.moduleLayout.layoutToIds(layout);
            };

            return that;
        };
    })(jQuery, fluid_1_2);
    /*
    Copyright 2008-2009 University of Cambridge
    Copyright 2008-2009 University of Toronto

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://source.fluidproject.org/svn/LICENSE.txt
    */

    /*global jQuery*/
    /*global fluid_1_2*/
    fluid_1_2 = fluid_1_2 || {};

    (function ($, fluid) {

        /**
         * Simple way to create a layout reorderer.
         * @param {selector} a jQueryable (selector, element, jQuery) for the layout container
         * @param {Object} a map of selectors for columns and modules within the layout
         * @param {Function} a function to be called when the order changes 
         * @param {Object} additional configuration options
         */
        fluid.reorderLayout = function (container, userOptions) {
            var assembleOptions = {
                layoutHandler: "fluid.moduleLayoutHandler",
                selectors: {
                    columns: ".flc-reorderer-column",
                    modules: ".flc-reorderer-module"
                }
            };
            var options = $.extend(true, assembleOptions, userOptions);
            return fluid.reorderer(container, options);
        };    
    })(jQuery, fluid_1_2);
});
