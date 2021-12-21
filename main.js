/* global Cycle, Glyph, CodeMirror, fondue, fiddleTracer, LogHandle, NodesHandle, HitsHandle, EpochsHandle, PillView, LogView, QueryBarView, QueryBarItem, addToSet, removeFromSet, setDifference, evalWrapper */
/* jshint evil: true, newcap: false */
"use strict";

var _colorCycle = new Cycle("#1f77b4 #ff7f0e #2ca02c #d62728 #9467bd #8c564b #e377c2 #7f7f7f #bcbd22 #17becf #000000".split(" "));
var _shapeCycle = new Cycle(["circle", "square"]);
var _glyphCycle = {
	next: function () {
		return new Glyph(_shapeCycle.next(), _colorCycle.next());
	},
};

$(function () {
	var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
		lineNumbers: true,
		gutters: ["pill-gutter"],
	});

	function convertPosToCodeMirror(pos) {
		return { line: pos.line - 1, ch: pos.column };
	}
	
	var src = editor.getValue();
	var path = "script1";
	var instrumentedSrc = fondue.instrument(src, {
		tracer_name: "fiddleTracer",
		path: path,
	});
	evalWrapper(instrumentedSrc + '\n//# sourceURL=my-foo.js');

	var logHandle = LogHandle(fiddleTracer, { ids: [], eventNames: [], exceptions: true, logs: true });
	var nodesHandle = NodesHandle(fiddleTracer);
	var hitsHandle = HitsHandle(fiddleTracer);
	var countConsoleLogsHandle = LogHandle(fiddleTracer, { logs: true }, false /* autoFetch */);
	var countExceptionsHandle = LogHandle(fiddleTracer, { exceptions: true }, false /* autoFetch */);
	var epochsHandle = EpochsHandle(fiddleTracer);

	var pillsByNodeId = {};
	var nodeGlyphs = {}; // nodeId -> glyph
	var deadNodeMarks = {}; // nodeId -> CodeMirror mark
	
	var logView = LogView(logHandle, nodesHandle);
	var queryBar = QueryBarView();

	queryBar.$dom.insertAfter(editor.getWrapperElement());
	logView.$dom.insertAfter(queryBar.$dom);

	function queryBarItemClicked(item) {
		item.toggle();

		var query = logHandle.lastQuery;
		if (item.isActive()) {
			item.addToQuery(query);
		} else {
			item.removeFromQuery(query);
		}
		logHandle.setQuery(query);
	}

	var logItem = QueryBarItem("console.log");
	var exceptionItem = QueryBarItem("exceptions");
	var nodeItems = {}; // nodeId -> item

	logItem.sortIndex = -1;
	logItem.$dom.addClass("logs");
	logItem.on("click", queryBarItemClicked);
	logItem.setActive(logHandle.lastQuery.logs);
	logItem.addToQuery = function (query) { query.logs = true; };
	logItem.removeFromQuery = function (query) { query.logs = false; };
	exceptionItem.sortIndex = -2;
	exceptionItem.$dom.addClass("exceptions");
	exceptionItem.on("click", queryBarItemClicked);
	exceptionItem.setActive(logHandle.lastQuery.exceptions);
	exceptionItem.addToQuery = function (query) { query.exceptions = true; };
	exceptionItem.removeFromQuery = function (query) { query.exceptions = false; };

	countConsoleLogsHandle.on("pending", function (count) { logItem.setCount(count); queryBar.enableItem(logItem); });
	countExceptionsHandle.on("pending", function (count) { exceptionItem.setCount(count); queryBar.enableItem(exceptionItem); });
	epochsHandle.on("epochs", function () { console.log("epochs", arguments); });

	logHandle.on("queryChanged", function (newQuery) {
		logItem.setActive(newQuery.logs);
		exceptionItem.setActive(newQuery.exceptions);

		for (var nodeId in pillsByNodeId) {
			var pill = pillsByNodeId[nodeId];
			pill.setActive((newQuery.ids || []).indexOf(nodeId) !== -1);
		}

		if (newQuery.ids) {
			// remove items that aren't in the query any more
			setDifference(Object.keys(nodeItems), newQuery.ids).forEach(function (nodeId) {
				var item = nodeItems[nodeId];
				queryBar.disableItem(item);
				delete nodeItems[nodeId];
			});

			// add items that are now in the query
			setDifference(newQuery.ids, Object.keys(nodeItems)).forEach(function (nodeId) {
				var node = nodesHandle.nodeWithId(nodeId);
				var item = nodeItems[nodeId] = QueryBarItem(node.name, nodeGlyphs[nodeId]);
				item.setActive(true);
				item.setCount(totalHitsByNodeId[nodeId] || 0);

				item.sortIndex = 0;
				item.addToQuery = function (query) { addToSet(query.ids, node.id); };
				item.removeFromQuery = function (query) { removeFromSet(query.ids, node.id); };
				item.on("click", queryBarItemClicked);

				queryBar.enableItem(item);
			});
		}
	});

	nodesHandle.on("nodes", function (nodes) {
		nodes.filter(function (node) { return node.path === path; }).forEach(function (node) {
			nodeGlyphs[node.id] = _glyphCycle.next();

			if (node.type === "function") {
				var pill = pillsByNodeId[node.id] = new PillView(editor, node.start.line - 1, nodeGlyphs[node.id]);
				pill.on("click", function () {
					pill.toggle();

					var query = logHandle.lastQuery;
					if (pill.isActive()) {
						addToSet(query.ids, node.id);
					} else {
						removeFromSet(query.ids, node.id);
					}
					logHandle.setQuery(query);
				});
			}

			if (["function", "branch"].indexOf(node.type) !== -1) {
				if (!totalHitsByNodeId[node.id]) {
					deadNodeMarks[node.id] = editor.markText(convertPosToCodeMirror(node.start), convertPosToCodeMirror(node.end), { className: "dead" });
				}
			}
		});
	});
	
	var totalHitsByNodeId = {};
	hitsHandle.on("hits", function (delta) {
		for (var nodeId in delta) {
			if (!totalHitsByNodeId[nodeId]) totalHitsByNodeId[nodeId] = 0;
			totalHitsByNodeId[nodeId] += delta[nodeId];

			if (deadNodeMarks[nodeId]) {
				deadNodeMarks[nodeId].clear();
				delete deadNodeMarks[nodeId];
			}

			var pill = pillsByNodeId[nodeId];
			if (pill) {
				pill.setCount(totalHitsByNodeId[nodeId]);
			}

			var item = nodeItems[nodeId];
			if (item) {
				item.setCount(totalHitsByNodeId[nodeId]);
			}
		}
	});
});
