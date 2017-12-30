/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

var EXPORTED_SYMBOLS = [ "Files" ];

Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

var Files = {
	converterInputStream : Components.classes["@mozilla.org/intl/converter-input-stream;1"],
	converterOutputStream : Components.classes["@mozilla.org/intl/converter-output-stream;1"],
	filePickerClass : Components.classes["@mozilla.org/filepicker;1"],
	inputStreamClass : Components.classes["@mozilla.org/network/file-input-stream;1"],
	nsIConverterInputStream : Components.interfaces.nsIConverterInputStream,
	nsIConverterOutputStream : Components.interfaces.nsIConverterOutputStream,
	nsIFileInputStream : Components.interfaces.nsIFileInputStream,
	nsIFilePicker : Components.interfaces.nsIFilePicker,
	
	getContent : function(file, receiver) {
		if (file === null || receiver === null) {
			return;
		}
		
		if (typeof(file) === "string") {
			if (file.startsWith("file://") || file.indexOf("://") < 0) {
				this.getContentFromFile(FileUtils.File(file), receiver);
			} else {
				this.getContentFromUri(Services.io.newURI(file, null, null), receiver);
			}
		} else {
			this.getContentFromFile(file, receiver);
		}
	},
	
	getContentFromFile : function(file, receiver) {
		var inputStream = this.inputStreamClass.createInstance(this.nsIFileInputStream);
		inputStream.init(file, -1, 0, 0);
		
		var converterInputStream = this.converterInputStream.createInstance(this.nsIConverterInputStream);
		converterInputStream.init(inputStream, "UTF-8", 0, 0);
		
		var content = "";
		var contentPart = {};
		var read = 0;
		
		do {
			read = converterInputStream.readString(0xffffffff, contentPart);
			content = content + contentPart.value;
		} while (read !== 0);
		
		converterInputStream.close();
		
		receiver(content);
	},
	
	getContentFromUri : function(uri, receiver) {
		NetUtil.asyncFetch(uri, function(inputStream) {
			receiver(NetUtil.readInputStreamToString(inputStream, inputStream.available()));
		}.bind(this));
	},
	
	userOpenFile : function(window, title, filename) {
		return this.userSelectFile(window, title, filename, this.nsIFilePicker.modeOpen);
	},
	
	userSaveFile : function(window, title, filename) {
		return this.userSelectFile(window, title, filename, this.nsIFilePicker.modeSave);
	},
	
	userSelectFile : function(window, title, filename, mode) {
		var filePicker = this.filePickerClass.createInstance(this.nsIFilePicker);
		filePicker.init(window, title, mode);
		filePicker.defaultString = filename;
		
		if (filePicker.show() !== this.nsIFilePicker.returnCancel) {
			return filePicker.file;
		}
		
		return null;
	},
	
	writeContent : function(file, content) {
		if (file === null || content === null) {
			return;
		}
		
		if (typeof(file) === "string") {
			file = FileUtils.File(file);
		}
		
		var outputStream = FileUtils.openFileOutputStream(file);
		
		var converterOutputStream = this.converterOutputStream.createInstance(this.nsIConverterOutputStream);
		converterOutputStream.init(outputStream, "UTF-8", 0, 0);
		
		converterOutputStream.writeString(content);
		
		converterOutputStream.close();
	}
};

