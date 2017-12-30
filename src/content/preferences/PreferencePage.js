/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

Components.utils.import("chrome://werewolf/content/core/Files.js");
Components.utils.import("chrome://werewolf/content/core/Globals.js");
Components.utils.import("chrome://werewolf/content/core/Preferences.js");
Components.utils.import("chrome://werewolf/content/Werewolf.js");

var PreferencePage = function(window) {
	this.connectedButtons = new Array();
	this.connectedFields = new Array();
	this.defaultsHandler = null;
	this.document = window.document;
	this.exportHandler = null;
	this.importHandler = null;
	this.ignoreFieldChanges = false;
	this.preferenceChangeListener = null;
	this.undoHandler = null;
	this.window = window;
	
	this.connectButton = function(button, handler) {
		if (!isSet(button)) {
			return;
		}
		
		button.clickHandler = handler.bind(this);
		
		button.addEventListener("click", button.clickHandler);
		
		this.connectedButtons.push(button);
	};
	
	this.connectButtons = function() {
		this.disconnectButtons();
		
		this.defaultsHandler = this.onDefaultsClicked.bind(this);
		this.exportHandler = this.onExportClicked.bind(this);
		this.importHandler = this.onImportClicked.bind(this);
		this.undoHandler = this.onUndoClicked.bind(this);
		
		this.connectButton(this.document.getElementById("defaults"), this.defaultsHandler);
		this.connectButton(this.document.getElementById("export"), this.exportHandler);
		this.connectButton(this.document.getElementById("import"), this.importHandler);
		this.connectButton(this.document.getElementById("undo"), this.undoHandler);
		
		this.connectButton(this.document.getElementById("revert-field"), this.onFieldRevert);
		this.connectButton(this.document.getElementById("undo-field"), this.onFieldUndo);
	};
	
	this.connectField = function(field) {
		if (!isSet(field) || !isSet(field.id)) {
			return;
		}
		
		if (!Werewolf.preferences.isKnown(field.id)) {
			console.info("Tried to connect field \"" + field.id + "\", but it is not known to Werewolf.");
			return;
		}
		
		console.info("Connecting field \"" + field.id + "\".");
		var type = Werewolf.preferences.getType(field.id);
		
		if (field.type === "text") {
			if (type === PreferenceType.BOOL) {
				field.type = "checkbox";
			} else if (type === PreferenceType.INT) {
				field.type = "number";
			} else if (type === PreferenceType.STRING) {
				if (field.id.contains("-color")) {
					field.type = "color";
				} else {
					field.type = "text";
				}
			}
		}
		
		try {
			this.setFieldValue(field, Werewolf.preferences.get(field.id));
			
			field.originalValue = Werewolf.preferences.get(field.id);
			
			this.updateFieldState(field);
			
			if (type === PreferenceType.BOOL) {
				field.addEventListener("change", this.onFieldChange.bind(this));
			} else {
				field.addEventListener("input", this.onFieldChange.bind(this));
			}
			
			Werewolf.preferences.addListener(field.id, this.preferenceChangeListener);
			
			this.connectedFields.push(field);
			
			this.updateTooltip(field);
		} catch (error) {
			console.error("Failed to connect field \"" + field.id + "\"");
			console.error(error);
		}
	};
	
	this.connectFields = function() {
		this.disconnectFields();
		
		this.preferenceChangeListener = this.onPreferenceChange.bind(this);
		
		for (var input of this.document.getElementsByTagName("input")) {
			this.connectField(input);
		}
	};
	
	this.disconnectButton = function(button, handler) {
		if (!isSet(button) || !isSet(button.clickHandler)) {
			return;
		}
		
		button.removeEventListener("click", button.clickHandler);
		button.clickHandler = null;
	};
	
	this.disconnectButtons = function() {
		this.disconnectButton(this.document.getElementById("defaults"));
		this.disconnectButton(this.document.getElementById("export"));
		this.disconnectButton(this.document.getElementById("import"));
		
		this.disconnectButton(this.document.getElementById("revert"));
		this.disconnectButton(this.document.getElementById("undo"));
	};
	
	this.disconnectField = function(field) {
		field.removeEventListener("input", this.onFieldChange);
		Werewolf.preferences.removeListener(field.id, this.preferenceChangeListener);
	};
	
	this.disconnectFields = function() {
		for (var field of this.connectedFields) {
			this.disconnectField(field);
		}
		
		this.connectedFields = new Array();
	};
	
	this.getFieldValue = function(field) {
		var type = Werewolf.preferences.getType(field.id);
	
		if (type == PreferenceType.BOOL) {
			return field.checked;
		} else {
			return field.value;
		}
	};
	
	this.getLabel = function(field) {
		if (isSet(field.label)) {
			return field.label;
		}
		
		for (var label of this.document.getElementsByTagName("label")) {
			if (label.htmlFor === field.id) {
				field.label = label;
				return label;
			}
		}
		
		return null;
	};
	
	this.onDefaultsClicked = function(event) {
		try {
			Files.getContent(
					"chrome://werewolf/content/preferences/sets/defaults.json",
					Werewolf.preferences.import.bind(Werewolf.preferences));
		} catch (error) {
			alert(error);
		}
	};
	
	this.onExportClicked = function(event) {
		try {
			var file = Files.userSaveFile(this.window, "Export", "werewolf-preferences.json");
			
			if (isSet(file)) {
				Files.writeContent(file, Werewolf.preferences.export());
			}
		} catch (error) {
			console.error("Failed to export file.");
			console.error(error);
			
			alert("Failed to export file:\n\n" + error);
		}
	};
	
	this.onImportClicked = function(event) {
		try {
			var file = Files.userOpenFile(this.window, "Import", "werewolf-preferences.json");
			
			if (isSet(file)) {
				Files.getContent(
						file,
						Werewolf.preferences.import.bind(Werewolf.preferences));
			}
		} catch (error) {
			console.error("Failed to import file.");
			console.error(error);
			
			alert("Failed to import file:\n\n" + error);
		}
	};
	
	this.onFieldChange = function(event) {
		if (this.ignoreFieldChange) {
			return;
		}
		
		var field = event.target;
		var type = Werewolf.preferences.getType(field.id);
		
		if (type == PreferenceType.BOOL) {
			Werewolf.preferences.set(field.id, field.checked);
		} else {
			Werewolf.preferences.set(field.id, field.value);
		}
		
		this.updateFieldState(field);
	};
	
	this.onFieldRevert = function(event) {
		var element = this.document.popupNode;
		
		if (!isSet(element)) {
			console.error("Tried to revert changes, but popupNode is not defined.");
			return;
		}
		
		if (element.localName === "label") {
			element = element.control;
		}
		
		if (!isSet(element)) {
			console.error("Tried to revert changes, but element does not know of its control.");
			return;
		}
		
		if (element.localName === "input") {
			Werewolf.preferences.reset(element.id);
		}
		
		this.document.popupNode = null;
	};
	
	this.onFieldUndo = function(event) {
		var element = this.document.popupNode;
		
		if (!isSet(element)) {
			console.error("Tried to undo changes, but popupNode is not defined.");
			return;
		}
		
		if (element.localName === "label") {
			element = element.control;
		}
		
		if (!isSet(element)) {
			console.error("Tried to undo changes, but element does not know of its control.");
			return;
		}
		
		if (element.localName === "input") {
			Werewolf.preferences.set(element.id, element.originalValue);
		}
		
		this.document.popupNode = null;
	}
	
	this.onPreferenceChange = function(name, value) {
		var field = this.document.getElementById(name);
		
		if (field != null) {
			this.ignoreFieldChanges = true;
			
			var type = Werewolf.preferences.getType(field.id);
		
			if (type == PreferenceType.BOOL) {
				field.checked = value;
			} else {
				field.value = value;
			}
			
			this.ignoreFieldChanges = false;
		}
		
		this.updateFieldState(field);
		this.updateTooltip(field);
	};
	
	this.onUndoClicked = function(event) {
		try {
			for (var field of this.document.getElementsByTagName("input")) {
				if (isSet(field.originalValue)) {
					Werewolf.preferences.set(field.id, field.originalValue);
				}
			}
		} catch (error) {
			alert(error);
		}
	};
	
	this.setFieldValue = function(field, value) {
		var type = Werewolf.preferences.getType(field.id);
	
		if (type == PreferenceType.BOOL) {
			field.checked = value;
		} else {
			field.value = value;
		}
	};
		
	this.updateFieldState = function(field) {
		var label = this.getLabel(field);
		
		if (isSet(label)) {
			if (this.getFieldValue(field) != Werewolf.preferences.getDefault(field.id)) {
				label.classList.add("changed");
			} else {
				label.classList.remove("changed");
			}
		}
	};
	
	this.updateTooltip = function(field) {
		var tooltip = field.getAttribute("tooltip");
		
		if (!isSet(tooltip) || tooltip == "null") {
			tooltip = "";
		} else {
			tooltip = tooltip + "\n\n";
		}
		
		if (this.getFieldValue(field) != Werewolf.preferences.getDefault(field.id)) {
			tooltip = tooltip + "• This preference has been changed. •\n\n";
		}
		
		tooltip = tooltip
				+ "Preference: "
				+ field.id
				+ "\nCurrent value: "
				+ Werewolf.preferences.get(field.id)
				+ "\nOriginal value: "
				+ field.originalValue
				+ "\nDefault value: "
				+ Werewolf.preferences.getDefault(field.id);
		
		field.title = tooltip;
		field.label.title = tooltip;
	};
};

