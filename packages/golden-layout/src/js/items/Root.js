lm.items.Root = function (layoutManager, config, containerElement) {
	lm.items.AbstractContentItem.call(this, layoutManager, config, null);
	this.isRoot = true;
	this.type = 'root';
	this.element = $('<div class="lm_goldenlayout lm_item lm_root"></div>');
	this.childElementContainer = this.element;
	this._containerElement = containerElement;
	this._containerElement.append(this.element);
};

lm.utils.extend(lm.items.Root, lm.items.AbstractContentItem);

lm.utils.copy(lm.items.Root.prototype, {
	addChild: function (contentItem) {
		if (this.contentItems.length > 0) {
			throw new Error('Root node can only have a single child');
		}

		contentItem = this.layoutManager._$normalizeContentItem(contentItem, this);
		this.childElementContainer.append(contentItem.element);
		lm.items.AbstractContentItem.prototype.addChild.call(this, contentItem);

		this.callDownwards('setSize');
		this.emitBubblingEvent('stateChanged');
	},

	setSize: function (width, height) {
		width = (typeof width === 'undefined') ? this._containerElement.width() : width;
		height = (typeof height === 'undefined') ? this._containerElement.height() : height;

		this.element.width(width);
		this.element.height(height);

		/*
		 * Root can be empty
		 */
		if (this.contentItems[0]) {
			this.contentItems[0].element.width(width);
			this.contentItems[0].element.height(height);
		}
	},

	/**
		 * Returns the min width of the row or column
		 * @returns {number | undefined}
		 */
	getMinWidth() {
		const elementMinWidth = this.config.workspacesConfig.minWidth || this.layoutManager.config.dimensions.minItemWidth;
		const contentsMinWidth = this.contentItems.reduce((minWidth, ci) => {
			minWidth += ci.getMinWidth() || this.layoutManager.config.dimensions.minItemWidth;
			return minWidth;
		}, 0);
		return Math.max(elementMinWidth, contentsMinWidth);
	},
	/**
	 * Returns the min width of the row or column
	 * @returns {number | undefined}
	 */
	getMaxWidth() {
		const elementMaxWidth = this.config.workspacesConfig.maxWidth || this.layoutManager.config.dimensions.maxItemWidth;
		const contentsMaxWidth = this.contentItems.reduce((maxWidth, ci) => {
			maxWidth += ci.getMaxWidth() || this.layoutManager.config.dimensions.maxItemWidth;
			return maxWidth;
		}, 0);

		return Math.min(elementMaxWidth, contentsMaxWidth);
	},
	/**
	 * Returns the min width of the row or column
	 * @returns {number | undefined}
	 */
	getMinHeight() {
		const elementMinHeight = this.config.workspacesConfig.minHeight || this.layoutManager.config.dimensions.minItemHeight;
		const contentsMinHeight = this.contentItems.reduce((minHeight, ci) => {
			minHeight += ci.getMinHeight() || this.layoutManager.config.dimensions.minItemHeight;
			return minHeight;
		}, 0);

		return Math.max(elementMinHeight, contentsMinHeight);
	},
	/**
	 * Returns the min width of the row or column
	 * @returns {number | undefined}
	 */
	getMaxHeight() {
		const elementMaxHeight = this.config.workspacesConfig.maxHeight || this.layoutManager.config.dimensions.maxItemHeight;
		const contentsMaxHeight = this.contentItems.reduce((maxHeight, ci) => {
			maxHeight += ci.getMaxHeight() || this.layoutManager.config.dimensions.maxItemHeight;
			return maxHeight;
		}, 0);

		return Math.min(elementMaxHeight, contentsMaxHeight);
	},
	_$highlightDropZone: function (x, y, area) {
		this.layoutManager.tabDropPlaceholder.remove();
		lm.items.AbstractContentItem.prototype._$highlightDropZone.apply(this, arguments);
	},

	_$onDrop: function (contentItem, area) {
		var stack;

		if (contentItem.isComponent) {
			stack = this.layoutManager.createContentItem({
				type: 'stack',
				header: contentItem.config.header || {}
			}, this);
			stack._$init();
			stack.addChild(contentItem);
			contentItem = stack;
		}

		if (!this.contentItems.length) {
			this.addChild(contentItem);
		} else {
			var type = area.side[0] == 'x' ? 'row' : 'column';
			var dimension = area.side[0] == 'x' ? 'width' : 'height';
			var insertBefore = area.side[1] == '2';
			var column = this.contentItems[0];
			if (!column instanceof lm.items.RowOrColumn || column.type != type) {
				var rowOrColumn = this.layoutManager.createContentItem({ type: type }, this);
				this.replaceChild(column, rowOrColumn);
				rowOrColumn.addChild(contentItem, insertBefore ? 0 : undefined, true);
				rowOrColumn.addChild(column, insertBefore ? undefined : 0, true);
				column.config[dimension] = 50;
				contentItem.config[dimension] = 50;
				rowOrColumn.callDownwards('setSize');
			} else {
				var sibbling = column.contentItems[insertBefore ? 0 : column.contentItems.length - 1]
				column.addChild(contentItem, insertBefore ? 0 : undefined, true);
				sibbling.config[dimension] *= 0.5;
				contentItem.config[dimension] = sibbling.config[dimension];
				column.callDownwards('setSize');
			}
		}
	}
});


