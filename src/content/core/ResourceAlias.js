/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

var EXPORTED_SYMBOLS = [ "ResourceAlias" ];

Components.utils.import("resource://gre/modules/Services.jsm");

var ResourceAlias = {
	resourceProtocolHandler : null,
	
	register : function(name, data) {
		if (this.resourceProtocolHandler) {
			return false;
		}
		
		this.resourceProtocolHandler = Services.io.getProtocolHandler("resource");
		this.resourceProtocolHandler.QueryInterface(Components.interfaces.nsIResProtocolHandler);
		
		var uri = data.resourceURI;
		
		if (!uri) {
			if (data.installPath.isDirectory()) {
				// packed
				uri = ios.newFileURI(data.installPath);
			} else {
				// unpacked
				var jarProtocolHandler = Services.io.getProtocolHandler("jar");
				jarProtocolHandler.QueryInterface(Components.interfaces.nsIJARProtocolHandler);
				var spec = "jar:" + Services.io.newFileURI(data.installPath).spec + "!/";
				uri = jarProtocolHandler.newURI(spec, null, null);
			}
		}
		
		this.resourceProtocolHandler.setSubstitution(name, uri);
		
		return true;
	},
	
	unregister : function(name) {
		if (!this.resourceProtocolHandler) {
			return false;
		}
		
		this.resourceProtocolHandler.setSubstitution(name, null);
		delete this.resourceProtocolHandler;
		
		return true;
	}
};

