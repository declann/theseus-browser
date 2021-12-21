/* globals moment: true, TreeView: true, TreeItemView: true */
/* exported LogView */
/* jshint newcap: false */
"use strict";

/**
returns a LogView
logHandle: a LogHandle
**/
function LogView(logHandle, nodesHandle) {
	function valueView(value) {
		if (value.type === "number" || value.type === "boolean") {
			return $("<span />").text(value.value);
		} else if (value.type === "string") {
			return $("<span />").text(JSON.stringify(value.value));
		} else if (value.type === "undefined") {
			return $("<span />").text("undefined");
		} else if (value.type === "null") {
			return $("<span />").text("null");
		} else if (value.type === "object") {
			return objectInspectorView(value);
		// } else if (value.type === "function") {
		// 	var $image = $("<img />").attr("src", ExtensionUtils.getModuleUrl(module, "images/arrow.png"));
		// 	var $dom = $("<span />").toggleClass("objects-bad", true)
		// 							.append($image)
		// 							.append(" Function");
		// 	return $dom;
		}
		return $("<span />").text(JSON.stringify(value));
	}

	function objectInspectorView(obj) {
		// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
		// function isNumber(n) {
		// 	return !isNaN(parseFloat(n)) && isFinite(n);
		// }

		var preview = obj.preview;
		if (preview === null || preview === undefined) preview = "";
		preview = preview.trim();
		if (preview.length === 0) preview = "[Object]";
		if (preview.length > 20) preview = obj.preview.slice(0, 20) + "...";

		var $dom = $("<div />").css({ "display" : "inline-block", "vertical-align" : "top" });
		var $image = $("<img />").attr("src", "images/arrow.png").css({
			"-webkit-transform-origin" : "40% 50% 0",
			"-webkit-transition" : "all 100ms",
		});
		var $title = $("<span />").appendTo($dom)
		                          .append($image)
		                          .attr("title", obj.preview);
		var $preview = $("<span />").text(" " + preview).appendTo($title);
		var $expanded = $("<div />").appendTo($dom);

		// if ("ownProperties" in obj) {
		// 	var showing = false;
		// 	$title.on("click", function () {
		// 		if (showing) {
		// 			$image.css("-webkit-transform", "");
		// 			$expanded.empty();
		// 		} else {
		// 			$image.css("-webkit-transform", "rotate(90deg)");

		// 			var names = [];
		// 			for (var name in obj.ownProperties) {
		// 				names.push(name);
		// 			}
		// 			names.sort(function (a, b) {
		// 				if (isNumber(a) && isNumber(b)) {
		// 					return parseInt(a) - parseInt(b)
		// 				}
		// 				if (a < b) return -1;
		// 				if (a > b) return 1;
		// 				return 0;
		// 			});
		// 			names.forEach(function (name) {
		// 				$expanded.append($("<div />").append($("<strong />").text(name + " = "))
		// 				                             .append(this._valueDom(obj.ownProperties[name])));
		// 			}.bind(this));
		// 		}
		// 		showing = !showing;
		// 	}.bind(this));
		// 	$title.css({ cursor: "pointer" });
		// } else {
		// 	$dom.toggleClass("objects-bad", true);
		// }

		// if ("truncated" in obj) {
		// 	var $icon = $("<img />").attr("src", ExtensionUtils.getModuleUrl(module, "images/warning-icon.png"));
		// 	var messages = [];
		// 	if (obj.truncated.length && obj.truncated.length.amount) {
		// 		messages.push(obj.truncated.length.amount + " of this object's items were truncated from the log.");
		// 	}
		// 	if (obj.truncated.keys && obj.truncated.keys.amount) {
		// 		messages.push(obj.truncated.keys.amount + " of this object's keys were truncated from the log.");
		// 	}
		// 	$icon.prop("title", messages.join(" "));

		// 	$title.after($icon);
		// 	$title.after(" ");
		// }

		return $dom;
	}

	function entryTable(entry) {
		var node = nodesHandle.nodeWithId(entry.nodeId);

		var $table = $("<table class='log-entry' />");
		var $row = $("<tr />").appendTo($table);

		// name cell
		var $nameCell = $("<th class='fn' />").appendTo($row);
		// $nameCell.append(_svgForGlyph(_nodeGlyph(log.nodeId)));
		if (entry.nodeId === "log") {
			$nameCell.append("console.log");
		} else {
			var name = node.name || "(anonymous)";
			var location = node.path.split("/").slice(-1) + ":" + node.start.line;

			var $nameLink = $("<span class='fn' />").text(name).appendTo($nameCell);
			$nameCell.append(" ");
			$nameCell.append($("<span class='path' />").text("(" + location + ")"));
			// $nameCell.on("click", function () { reveal(node) });
		}
		// if (options.link && options.link.type === 'async') {
		// 	var $image = $("<img />").attr("src", ExtensionUtils.getModuleUrl(module, "images/async.png"));
		// 	$image.css({
		// 		"margin-left" : 4,
		// 		"vertical-align" : "middle",
		// 	});
		// 	$nameCell.append(" ");
		// 	$nameCell.append($image);
		// }
		// timestamp cell

		var $timeCell = $("<td class='timestamp' />").appendTo($row);
		var timestamp = new Date(entry.timestamp);
		$timeCell.text(moment(timestamp).format("h:mm:ss.SSS"));

		// value cells
		function addValueCell(name, value, klass) {
			var $name = $("<strong />").text(name);
			if (klass) $name.addClass(klass);
			$("<td class='value' />").append($name)
			                         .append(valueView(value))
			                         .appendTo($row);
		}
		for (var i = 0; i < entry.arguments.length; i++) {
			var arg = entry.arguments[i];
			addValueCell((arg.name || ("arguments[" + i + "]")) + " = ", arg.value);
		}
		if ("returnValue" in entry) {
			addValueCell("return value = ", entry.returnValue);
		} else if (entry.exception) {
			addValueCell("exception = ", entry.exception, "exception");
		}
		if ("this" in entry) {
			addValueCell("this = ", entry.this);
		}
		if ("parents" in entry) {
			addValueCell("parents = ", entry.parents);
		}
		if ("invocationId" in entry) {
			addValueCell("invocationId = ", entry.invocationId);
		}

		$row.append($("<td class='backtrace-link' />").append($("<a />").html("Backtrace(broke) &rarr;").click(function () {
			this._showBacktrace(entry.invocationId); // DN this is broken
			//console.trace(); DN this is meaningless
		}.bind(this))));

		return $table;
	}

	var $dom = $("<div class='log' />");

	var treeView = TreeView();
	treeView.$dom.appendTo($dom);

	var itemsByInvocationId = {}; // invocationId -> item

	function findParentItem(entry) {
		if (!entry.parents) {
			return undefined;
		}

		// TODO: resolve multiple parents
		return itemsByInvocationId[entry.parents[0].invocationId];
	}

	logHandle.on("queryChanged", function () {
		treeView.clear();
		itemsByInvocationId = {};
	});

	logHandle.on("entries", function (entries) {
		entries.forEach(function (entry) {
			var itemView = itemsByInvocationId[entry.invocationId] = TreeItemView();
			itemView.$content.append(entryTable(entry));

			var parentItem = findParentItem(entry);
			if (parentItem) {
				parentItem.append(itemView);
			} else {
				treeView.append(itemView);
			}
		});
	});

	var self = {
		$dom: $dom,
	};

	return self;
}
