/* global smokesignals: true, addToSet: true, removeFromSet: true */
/* exported QueryBarView, QueryBarItem */
"use strict";

/**
returns a QueryBarView
call QueryBarItem() to get items for passing to enableItem and disableItem
**/
function QueryBarView() {
	var $dom = $("<div class='query-bar' />");

	var items = [];

	function restoreSortOrder() {
		items.forEach(function (i) {
			$dom.append(i.$dom);
		});
	}

	var self = {
		"$dom" : $dom,
		enableItem: function (item) {
			if (addToSet(items, item)) {
				items.sort(function (a, b) { return a.sortIndex - b.sortIndex; });
				restoreSortOrder();
			}
		},
		disableItem: function (item) {
			if (removeFromSet(items, item)) {
				item.$dom.detach();
				restoreSortOrder();
			}
		},
	};

	return self;
}

/**
returns a QueryBarItem for use with a QueryBarView
listen for clicks with item.on("click", function (item) { })
change sortIndex to affect its sorting order

name: name to appear in the bar
**/
function QueryBarItem(name, glyph) {
	var $dom = $("<span class='query-bar-item' />");
	var $name = $("<span class='name' />").appendTo($dom).text(name);
	if (glyph) {
		$name.prepend(" ");
		$name.prepend(glyph.svg());
	}
	$dom.append(" ");
	var $count = $("<span class='count' />").appendTo($dom).text("0");

	var count = 0;
	var active = false;

	$dom.on("click", function () {
		self.emit("click", self);
	});

	var self = smokesignals.convert({
		$dom: $dom,
		setCount: function (newCount) {
			count = newCount;
			$count.text(count);
		},
		count: function () {
			return count;
		},
		setActive: function (isActive) {
			active = isActive;
			$dom.toggleClass("active", active);
		},
		toggle: function () {
			self.setActive(!active);
		},
		isActive: function () {
			return active;
		},
		sortIndex: 0,
		name: name
	});

	return self;
}
