/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

var EXPORTED_SYMBOLS = [ "Preferences", "PreferenceType" ];

/**
 * A utility that allows to easily register preferences with default values an
 * callbacks in case that the value of the preference changes.
 */
var Preferences = function() {
	/** The root branch of the preferences. */
	this.branch = null;
	
	/** The callbacks that should be invoked. */
	this.changeListeners = {};
	
	/** The default preference service provided by Firefox. */
	this.defaultPreferences = null;
	
	/** The functions for acquiring the default value of a preference. */
	this.getDefaultFunctions = {};
	
	/** The functions for acquiring the value of a preference. */
	this.getFunctions = {};
	
	/** The names of all functions that are registered. */
	this.preferenceNames = new Array();
	
	/** The preferences service provided by Firefox. */
	this.preferences = null;
	
	/** The functions for setting the value of a preference. */
	this.setFunctions = {};
	
	/** The functions for setting the default value of a preference. */
	this.setDefaultFunctions = {};
	
	/**
	 * Adds a listener for the given prefrence.
	 *
	 * @param {string} name The name of the preference.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 */
	this.addListener = function(name, onChange) {
		if (onChange == null) {
			return;
		}
		
		var listeners = this.changeListeners[name];
		
		if (listeners == null) {
			listeners = new Array();
			this.changeListeners[name] = listeners;
		}
		
		listeners.push(onChange);
	};
	
	/**
	 * Destroys this Preferences.
	 */
	this.destroy = function() {
		if (this.preferences != null) {
			this.preferences.removeObserver("", this);
		}
		
		this.changeListeners = null;
		this.defaultPreferences = null;
		this.getDefaultFunctions = null;
		this.getFunctions = null;
		this.preferences = null;
		this.setDefaultFunctions = null;
		this.setFunctions = null;
	};
	
	/**
	 * Returns all preferences (with their values) as JSON string.
	 *
	 * @return {string} The JSON string with all preferences and their values.
	 */
	this.export = function() {
		var dataObject = {};
		
		for (var preferenceName of this.preferenceNames) {
			dataObject[preferenceName] = this.get(preferenceName);
		}
		
		return JSON.stringify(dataObject)
				.replace(/{/g, "{\n\t")
				.replace(/,/g, ",\n\t")
				.replace(/:/g, ": ")
				.replace(/}/g, "\n}");
	};
	
	/**
	 * Returns all preferences (with their default values) as JSON string.
	 *
	 * @return {string} The JSON string with all preferences and their default
	 *                  values.
	 */
	this.exportDefaults = function() {
		var dataObject = {};
		
		for (var preferenceName of this.preferenceNames) {
			dataObject[preferenceName] = this.get(preferenceName);
		}
		
		return JSON.stringify(dataObject)
				.replace(/{/g, "{\n\t")
				.replace(/,/g, ",\n\t")
				.replace(/:/g, ": ")
				.replace(/}/g, "\n}");
	};
	
	/**
	 * Gets the value of the preference with the given name.
	 *
	 * @return {object} The value of the preference with the given name.
	 */
	this.get = function(name) {
		if (name == null) {
			return null;
		}
		
		if (this.getFunctions[name] == null) {
			return null;
		}
		
		return this.getFunctions[name](name);
	};
	
	/**
	 * Gets the defalut value of the preference with the given name.
	 *
	 * @return {object} The default value of the preference with the given name.
	 */
	this.getDefault = function(name) {
		if (name == null) {
			return null;
		}
		
		if (this.getDefaultFunctions[name] == null) {
			return null;
		}
		
		return this.getDefaultFunctions[name](name);
	};
	
	/**
	 * Gets the type of the preference.
	 *
	 * @return {PreferenceType} The type of the preferejce.
	 */
	this.getType = function(name) {
		var type = this.preferences.getPrefType(name);
		
		if (type === this.preferences.PREF_BOOL) {
			return PreferenceType.BOOL;
		} else if (type === this.preferences.PREF_INT) {
			return PreferenceType.INT;
		} else if (type === this.preferences.PREF_STRING) {
			return PreferenceType.STRING;
		}
		
		return null;
	};
	
	/**
	 * Imports the given JSON string.
	 *
	 * @param {string} The JSON string to read.
	 */
	this.import = function(data) {
		if (data == null) {
			return;
		}
		
		var dataObject = JSON.parse(data);
		
		for (var preferenceName in dataObject) {
			this.set(preferenceName, dataObject[preferenceName]);
		}
	};
	
	/**
	 * Imports the given JSON string as default values.
	 *
	 * param {string} The JSON string to read.
	 */
	this.importDefaults = function(data) {
		if (data == null) {
			return;
		}
		
		var dataObject = JSON.parse(data);
		
		for (var preferenceName in dataObject) {
			this.setDefault(preferenceName, dataObject[preferenceName]);
		}
	};
	
	/**
	 * Initializes this Preferences object.
	 * 
	 * @param {string} branch The branch/prefix of all preferences managed by
	 *                        this.
	 */
	this.init = function(branch) {
		this.destroy();
		
		this.branch = branch;
		
		this.changeListeners = {};
		this.defaultPreferences = {};
		this.getDefaultFunctions = {};
		this.getFunctions = {};
		this.preferences = {};
		this.setDefaultFunctions = {};
		this.setFunctions = {};
		
		this.defaultPreferences = Components
			.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getDefaultBranch(this.branch);
		this.preferences = Components
			.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch(this.branch);
		this.preferences.QueryInterface(Components.interfaces.nsIPrefBranch);
		this.preferences.addObserver("", this, false);
	};
	
	/**
	 * Invokes all listeners for the given preference.
	 *
	 * @param {string} name The name of the preference.
	 */
	this.invokeListeners = function(name) {
		var listeners = this.changeListeners[name];
		
		if (listeners != null && listeners.length > 0) {
			var value = this.getFunctions[name](name);
			
			for (var listener of listeners) {
				listener(name, value);
			}
		}
	};
	
	this.isKnown = function(name) {
		return this.preferenceNames.includes(name);
	};
	
	/**
	 * Invoked if the value of a preference changes.
	 * 
	 * @param {Object} subject ???
	 * @param {string} topic The change topic.
	 * @param {Object} data The name of the changed preference.
	 */
	this.observe = function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}
		
		this.invokeListeners(data);
	};
	
	/**
	 * Registers a new preference with the given values.
	 * 
	 * @param {string} name The name of the preference, without the branch/root.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 * @param {function} defaultFunction The function to invoke for setting the default
	 *                                   value.
	 * @param {function} getDefaultFunction The function to get the default value.
	 * @param {function} getFunction The function to get the value.
	 * @param {function} setDefaultFunction The function to set the default value.
	 * @param {function} setFunction The function to set the value.
	 */
	this.register = function(
			name,
			onChange,
			getDefaultFunction,
			getFunction,
			setDefaultFunction,
			setFunction) {
		this.preferenceNames.push(name);
		
		this.getDefaultFunctions[name] = getDefaultFunction;
		this.getFunctions[name] = getFunction;
		this.setDefaultFunctions[name] = setDefaultFunction;
		this.setFunctions[name] = setFunction;
		
		this.addListener(name, onChange);
	};
	
	/**
	 * Registers a new bool preference.
	 * 
	 * @param {string} name The name of the preference, without the branch/root.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 */
	this.registerBool = function(name, onChange) {
		this.register(
				name,
				onChange,
				this.defaultPreferences.getBoolPref,
				this.preferences.getBoolPref,
				this.defaultPreferences.setBoolPref,
				this.preferences.setBoolPref);
	};
	
	/**
	 * Registers a new char preference.
	 * 
	 * @param {string} name The name of the preference, without the branch/root.
	 * @param {function} onChange The callback/function to invoke if the
	 *                            preference changes. This will be invoked right
	 *                            after the preference is registered.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 */
	this.registerChar = function(name, onChange) {
		this.register(
				name,
				onChange,
				this.defaultPreferences.getCharPref,
				this.preferences.getCharPref,
				this.defaultPreferences.setCharPref,
				this.preferences.setCharPref);
	};
	
	/**
	 * Registers a new int preference.
	 * 
	 * @param {string} name The name of the preference, without the branch/root.
	 * @param {function} onChange Optional. The callback/function to invoke if
	 *                            the preference changes.
	 *                            The callback is expected to take two
	 *                            parameters, the name of the preference and
	 *                            its value.
	 */
	this.registerInt = function(name, onChange) {
		this.register(
				name,
				onChange,
				this.defaultPreferences.getIntPref,
				this.preferences.getIntPref,
				this.defaultPreferences.setIntPref,
				this.preferences.setIntPref);
	};
	
	this.removeListener = function(name, onChange) {
		if (onChange == null) {
			return;
		}
		
		var listeners = this.changeListeners[name];
		
		if (listeners != null) {
			var index = listeners.indexOf(onChange);
			
			if (index >= 0) {
				listeners.splice(index, 1);
			}
		}
	};
	
	this.reset = function(name) {
		if (name == null) {
			return;
		}
		
		this.setFunctions[name](name, this.getDefaultFunctions[name](name));
	};
	
	this.resetAll = function() {
		for (var preferenceName of this.preferenceNames) {
			this.reset(preferenceName);
		} 
	};
	
	this.set = function(name, value) {
		if (name == null) {
			return;
		}
		
		this.setFunctions[name](name, value);
	};
	
	this.setDefault = function(name, value) {
		if (name == null) {
			return;
		}
		
		this.setDefaultFunctions[name](name, value);
		
		// Invoke the observe method so that the callback is invoked
		// when the defaults are set.
		this.observe(null, "nsPref:changed", name);
	};
};

/**
 * The type of a preference.
 */
var PreferenceType = {
	BOOL : "bool",
	INT : "int",
	STRING : "string"
};

