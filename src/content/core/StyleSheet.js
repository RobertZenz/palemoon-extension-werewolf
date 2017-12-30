/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

var EXPORTED_SYMBOLS = [ "StyleSheet" ];

Components.utils.import("resource://gre/modules/Services.jsm");

/**
 * StyleSheet is a simple container class which allows to register one big
 * stylesheet in a deferred way.
 *
 * @param {@string} name The (unique) name used for the registered stylesheets.
 */
var StyleSheet = function(name) {
	/** If the applying of the stylesheets should be deferred. */
	this.deferred = false;
	
	/** The dynamicStyleSheets that is used. */
	this.dynamicStyleSheets = null;
	
	/** The name of this StyleSheet. */
	this.name = "StyleSheet";
	
	 /** The list of stylesheets that are registered. */
	this.styleSheets = {};
	
	/**
	 * Initializes this StyleSheet.
	 *
	 * @param {DynamicStyleSheets} dynamicStyleSheets The DynamicStyleSheets to
	 *                                                to be used.
	 */
	this.init = function(dynamicStyleSheets) {
		this.dynamicStyleSheets = dynamicStyleSheets;
	};
	
	/**
	 * Applies (or re-applies) the stylesheets and resets the deferred status.
	 */
	this.apply = function() {
		this.deferred = false;
		
		var styleSheet = "";
		
		for (var key in this.styleSheets) {
			var value = this.styleSheets[key];
			
			if (value !== null && value !== "") {
				styleSheet = styleSheet + " " + this.dynamicStyleSheets.getCSS(this.styleSheets[key]);
			}
		}
		
		this.dynamicStyleSheets.registerForBrowser(this.name, styleSheet);
	};
	
	/**
	 * Defers applying of stylesheets.
	 */
	this.defer = function() {
		this.deferred = true;
	};
	
	/**
	 * Registers the given stylesheet with the given name.
	 *
	 * @param {string} name The (unique) name to use.
	 * @param {string} styleSheet The stylesheet to apply.
	 */
	this.register = function(name, styleSheet) {
		this.styleSheets[name] = styleSheet;
		
		if (!this.deferred) {
			this.apply();
		}
	};
	
	/**
	 * Unregisters the stylesheet.
	 *
	 * @param {string} name The name of the stylesheet to unregister.
	 */
	this.unregister = function(name) {
		this.styleSheets[name] = null;
		
		if (!this.deferred) {
			this.apply();
		}
	};
	
	/**
	 * Unregisters all stylesheets.
	 */
	this.unregisterAll = function() {
		this.dynamicStyleSheets.unregister(this.name);
	};
};

