/* global smokesignals: true */
/* exported TreeView, TreeItemView */
"use strict";

/**
returns a TreeView
call TreeItemView() to get items
**/
function TreeView() {
	var $dom = $("<div class='tree' />");

	var roots = [];

	function itemRemoved(item) {
		var idx = roots.indexOf(item);
		if (idx !== -1) {
			roots = roots.splice(idx);
		} else {
			console.log("tree item removed event from an unknown root");
		}
	}

	var self = {
		$dom: $dom,
		append: function (itemView) {
			roots.push(itemView);
			itemView.on("removed", itemRemoved);
			$dom.append(itemView.$dom);
		},
		clear: function () {
			roots.forEach(function (item) {
				item.remove();
				$dom.empty();
			});
		},
	};

	return self;
}

/**
returns a TreeItemView for use with a TreeView
**/
function TreeItemView() {
	var $dom = $("<div class='tree-item' />");
	var $content = $("<div class='tree-item-content' />").appendTo($dom);
	var $children = $("<div class='tree-item-children' />").appendTo($dom);

	var children = [];

	var self = smokesignals.convert({
		$dom: $dom,
		$content: $content,
		$children: $children,
		append: function (itemView) {
			children.push(itemView);
			$children.append(itemView.$dom);
		},
		remove: function () {
			this.$dom.detach();
			self.emit("removed", self);
		}
	});

	return self;
}
