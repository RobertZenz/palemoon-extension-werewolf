/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

var EXPORTED_SYMBOLS = [ "Werewolf" ];

Components.utils.import("resource://gre/modules/Services.jsm");

Components.utils.import("chrome://werewolf/content/core/CSSBuilder.js");
Components.utils.import("chrome://werewolf/content/core/DynamicStyleSheets.js");
Components.utils.import("chrome://werewolf/content/core/Files.js");
Components.utils.import("chrome://werewolf/content/core/Preferences.js");
Components.utils.import("chrome://werewolf/content/core/StyleSheet.js");

var Werewolf = {
	preferences : new Preferences(),
	
	styleSheet : new StyleSheet("werewolf"),
	
	styleSheets : new DynamicStyleSheets(),
	
	init : function() {
		this.styleSheets.init();
		
		this.styleSheet.init(this.styleSheets);
		
		this.initPreferences();
	},
	
	initPreferences : function() {
		this.preferences.init("extensions.org.bonsaimind.werewolf.");
		
		this.preferences.registerInt("bookmarks.bar-height", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PersonalToolbar")
					.addSelector("#PersonalToolbar > *")
					.forceHeight(value));
		}.bind(this));
		
		this.preferences.registerBool("bookmarks.bookmark-folder.dropdown-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("#PlacesToolbarItems > .bookmark-item[type=menu] > .toolbarbutton-menu-dropmarker")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerBool("bookmarks.bookmark-folder.icon-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("#PlacesToolbarItems > .bookmark-item[type=menu] > .toolbarbutton-icon")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerBool("bookmarks.bookmark-folder.name-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("#PlacesToolbarItems > .bookmark-item[type=menu] > .toolbarbutton-text")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark-folder.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item[type=menu] > *")
					.autoPadding("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark-folder.padding-left", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item[type=menu] > :first-child")
					.autoPadding("left", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark-folder.padding-right", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item[type=menu] > :last-child")
					.autoPadding("right", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark-folder.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item[type=menu] > *")
					.autoPadding("top", value));
		}.bind(this));
		
		this.preferences.registerBool("bookmarks.bookmark-item.icon-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("#PlacesToolbarItems > .bookmark-item:not([type]) > .toolbarbutton-icon")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerBool("bookmarks.bookmark-item.name-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("#PlacesToolbarItems > .bookmark-item:not([type]) > .toolbarbutton-text")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark-item.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item:not([type]) > *")
					.autoPadding("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark-item.padding-left", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item:not([type]) > :first-child")
					.autoPadding("left", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark-item.padding-right", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item:not([type]) > :last-child")
					.autoPadding("right", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark-item.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item:not([type]) > *")
					.autoPadding("top", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item > *")
					.autoPadding("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.bookmark.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item > *")
					.autoPadding("top", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.dropdown.minimum-width", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems .bookmark-item .popup-internal-box .arrowscrollbox-scrollbox .scrollbox-innerbox")
					.minWidth(value));
		}.bind(this));
		
		this.preferences.registerBool("bookmarks.dropdown.open-all-in-tabs-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("#PlacesToolbarItems menuitem[class=\"openintabs-menuitem\"]")
						.addSelector("#PlacesToolbarItems menuseparator[class=\"bookmarks-actions-menuseparator\"]")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerBool("bookmarks.dropdown.scrollbar", function(name, value) {
			if (value) {
				var cssScrollbox = new CSSBuilder()
						.addSelector("#PlacesToolbarItems .bookmark-item .popup-internal-box .arrowscrollbox-scrollbox .scrollbox-innerbox")
						.add("overflow-y", "auto");
				var cssButton = new CSSBuilder()
						.addSelector("#PlacesToolbarItems .bookmark-item .popup-internal-box .autorepeatbutton-up")
						.addSelector("#PlacesToolbarItems .bookmark-item .popup-internal-box .autorepeatbutton-down")
						.hide();
				
				this.styleSheet.register(name, cssScrollbox.toCSS() + cssButton.toCSS());
			} else {
				this.styleSheet.unregister(name);
			}
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.gap", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > *")
					.add("margin-left", Math.floor(value / 2) + "px")
					.add("margin-right", Math.ceil(value / 2) + "px"));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item")
					.autoPadding("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("bookmarks.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PlacesToolbarItems > .bookmark-item")
					.autoPadding("top", value));
		}.bind(this));
		
		this.preferences.registerBool("general.disable-animations", function(name, value) {
			if (value) {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("*")
						.add("animation-delay", "0ms")
						.add("animation-duration", "0ms")
						.add("transition", "none"));
			} else {
				this.styleSheet.unregister(name);
			}
		}.bind(this));
		
		this.preferences.registerInt("menubar.bar-height", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#toolbar-menubar")
					.addSelector("#toolbar-menubar > *")
					.maxHeight(value));
		}.bind(this));
		
		this.preferences.registerInt("menubar.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#toolbar-menubar > *")
					.autoPadding("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("menubar.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#toolbar-menubar > *")
					.autoPadding("top", value));
		}.bind(this));
		
		this.preferences.registerInt("navigationbar.bar-height", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#nav-bar")
					.addSelector("#nav-bar > *")
					.maxHeight(value));
		}.bind(this));
		
		this.preferences.registerInt("navigationbar.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#nav-bar > *")
					.autoPadding("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("navigationbar.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#nav-bar > *")
					.autoPadding("top", value));
		}.bind(this));
		
		this.preferences.registerInt("personaltoolbar.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PersonalToolbar > *")
					.margin("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("personaltoolbar.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#PersonalToolbar > *")
					.margin("top", value));
		}.bind(this))
		
		this.preferences.registerBool("tabs.closebutton-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector(".tabbrowser-tab .tab-close-button")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerBool("tabs.custom-border", function(name, value) {
			if (value) {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector(".tabbrowser-tab:not([tiletabs-single=\"hidden\"])")
						.add("background-position", "0px")
						.add("background-size", "100%")
						.add("border", "none")
						.add("border-left", "1px solid")
						.add("border-right", "1px solid")
						.add("border-top", "1px solid"));
			} else {
				this.styleSheet.unregister(name);
			}
		}.bind(this));
		this.preferences.registerInt("tabs.custom-border-radius", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab")
					.add("border-top-left-radius", value + "px")
					.add("border-top-right-radius", value + "px"));
		}.bind(this));
		this.preferences.registerChar("tabs.custom-border-color", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab:not([tiletabs-single=\"hidden\"])")
					.add("border-color", value));
		}.bind(this));
		this.preferences.registerChar("tabs.custom-border-color-selected", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab[selected=\"true\"]")
					.add("border-color", value));
		}.bind(this));
		
		this.preferences.registerInt("tabs.gap", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab")
					.add("margin-left", Math.floor(value / 2) + "px")
					.add("margin-right", Math.ceil(value / 2) + "px"));
		}.bind(this));
		
		this.preferences.registerInt("tabs.height", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#TabsToolbar")
					.addSelector(".tabbrowser-tab")
					.forceHeight(value));
		}.bind(this));
		
		this.preferences.registerInt("tabs.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab")
					.margin("top", value));
		}.bind(this));
		
		this.preferences.registerBool("tabs.siteicon-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector(".tabbrowser-tab .tab-icon-image")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerBool("tabs.sitename-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector(".tabbrowser-tab .tab-text")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerInt("tabs.tab.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab .tab-content")
					.autoPadding("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("tabs.tab.padding-left", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab .tab-content")
					.autoPadding("left", value));
		}.bind(this));
		
		this.preferences.registerInt("tabs.tab.padding-right", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab .tab-content")
					.autoPadding("right", value));
		}.bind(this));
		
		this.preferences.registerInt("tabs.tab.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector(".tabbrowser-tab .tab-content")
					.autoPadding("top", value));
		}.bind(this));
		
		this.preferences.registerBool("tabs.throbber-visible", function(name, value) {
			if (value) {
				this.styleSheet.unregister(name);
			} else {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector(".tabbrowser-tab .tab-throbber")
						.hide());
			}
		}.bind(this));
		
		this.preferences.registerBool("urlbar.disable-highlights", function(name, value) {
			if (value) {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("#urlbar")
						.add("box-shadow", "none"));
			} else {
				this.styleSheet.unregister(name);
			}
		}.bind(this));
		
		this.preferences.registerBool("urlbar.identitybox.disable-background", function(name, value) {
			if (value) {
				this.styleSheet.register(name, new CSSBuilder()
						.addSelector("#urlbar[pageproxystate] #identity-box")
						.add("background-image", "none"));
			} else {
				this.styleSheet.unregister(name);
			}
		}.bind(this));
		
		this.preferences.registerInt("urlbar.identitybox.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#urlbar #identity-box > *")
					.margin("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("urlbar.identitybox.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#urlbar #identity-box > *")
					.margin("top", value));
		}.bind(this));
		
		this.preferences.registerInt("urlbar.padding-bottom", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#urlbar")
					.margin("bottom", value));
		}.bind(this));
		
		this.preferences.registerInt("urlbar.padding-top", function(name, value) {
			this.styleSheet.register(name, new CSSBuilder()
					.addSelector("#urlbar")
					.margin("top", value));
		}.bind(this));
		
		this.styleSheet.defer();
		
		Files.getContent(
				"chrome://werewolf/content/preferences/sets/defaults.json",
				this.preferences.importDefaults.bind(this.preferences));
		
		this.styleSheet.apply();
	},
	
	destroy : function() {
		this.preferences.destroy();
		this.styleSheets.unregisterAll();
	}
};

