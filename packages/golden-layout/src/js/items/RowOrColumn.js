lm.items.RowOrColumn = function (isColumn, layoutManager, config, parent) {
	lm.items.AbstractContentItem.call(this, layoutManager, config, parent);

	this.isRow = !isColumn;
	this.isColumn = isColumn;

	this.element = $('<div class="lm_item lm_' + (isColumn ? 'column' : 'row') + '"></div>');
	this.childElementContainer = this.element;
	this._splitterSize = layoutManager.config.dimensions.borderWidth;
	this._splitterGrabSize = layoutManager.config.dimensions.borderGrabWidth;
	this._isColumn = isColumn;
	this._dimension = isColumn ? 'height' : 'width';
	this._splitter = [];
	this._splitterPosition = null;
	this._splitterMinPosition = null;
	this._splitterMaxPosition = null;
	this._layoutManager = layoutManager;
};

lm.utils.extend(lm.items.RowOrColumn, lm.items.AbstractContentItem);

lm.utils.copy(lm.items.RowOrColumn.prototype, {

	/**
	 * Add a new contentItem to the Row or Column
	 *
	 * @param {lm.item.AbstractContentItem} contentItem
	 * @param {[int]} index The position of the new item within the Row or Column.
	 *                      If no index is provided the item will be added to the end
	 * @param {[bool]} _$suspendResize If true the items won't be resized. This will leave the item in
	 *                                 an inconsistent state and is only intended to be used if multiple
	 *                                 children need to be added in one go and resize is called afterwards
	 *
	 * @returns {void}
	 */
	addChild: function (contentItem, index, _$suspendResize) {

		var newItemSize, itemSize, i, splitterElement;

		contentItem = this.layoutManager._$normalizeContentItem(contentItem, this);

		if (index === undefined) {
			index = this.contentItems.length;
		}

		if (this.contentItems.length > 0) {
			splitterElement = this._createSplitter(Math.max(0, index - 1)).element;

			if (index > 0) {
				this.contentItems[index - 1].element.after(splitterElement);
				splitterElement.after(contentItem.element);
			} else {
				this.contentItems[0].element.before(splitterElement);
				splitterElement.before(contentItem.element);
			}
		} else {
			this.childElementContainer.append(contentItem.element);
		}

		lm.items.AbstractContentItem.prototype.addChild.call(this, contentItem, index);

		newItemSize = (1 / this.contentItems.length) * 100;

		if (_$suspendResize === true) {
			this.emitBubblingEvent('stateChanged');
			return;
		}

		for (i = 0; i < this.contentItems.length; i++) {
			if (this.contentItems[i] === contentItem) {
				contentItem.config[this._dimension] = newItemSize;
			} else {
				itemSize = this.contentItems[i].config[this._dimension] *= (100 - newItemSize) / 100;
				this.contentItems[i].config[this._dimension] = itemSize;
			}
		}

		this.callDownwards('setSize');
		this.emitBubblingEvent('stateChanged');
	},

	/**
	 * Removes a child of this element
	 *
	 * @param   {lm.items.AbstractContentItem} contentItem
	 * @param   {boolean} keepChild   If true the child will be removed, but not destroyed
	 *
	 * @returns {void}
	 */
	removeChild: function (contentItem, keepChild) {
		var removedItemSize = contentItem.config[this._dimension],
			index = lm.utils.indexOf(contentItem, this.contentItems),
			splitterIndex = Math.max(index - 1, 0),
			i,
			childItem;

		if (index === -1) {
			throw new Error('Can\'t remove child. ContentItem is not child of this Row or Column');
		}

		/**
		 * Remove the splitter before the item or after if the item happens
		 * to be the first in the row/column
		 */
		if (this._splitter[splitterIndex]) {
			this._splitter[splitterIndex]._$destroy();
			this._splitter.splice(splitterIndex, 1);
		}

		/**
		 * Allocate the space that the removed item occupied to the remaining items
		 */
		for (i = 0; i < this.contentItems.length; i++) {
			if (this.contentItems[i] !== contentItem) {
				this.contentItems[i].config[this._dimension] += removedItemSize / (this.contentItems.length - 1);
			}
		}

		lm.items.AbstractContentItem.prototype.removeChild.call(this, contentItem, keepChild);

		if (this.contentItems.length === 1 && this.config.isClosable === true) {
			childItem = this.contentItems[0];
			this.contentItems = [];
			this.parent.replaceChild(this, childItem, true);
		} else {
			this.callDownwards('setSize');
			this.emitBubblingEvent('stateChanged');
		}
	},

	/**
	 * Replaces a child of this Row or Column with another contentItem
	 *
	 * @param   {lm.items.AbstractContentItem} oldChild
	 * @param   {lm.items.AbstractContentItem} newChild
	 *
	 * @returns {void}
	 */
	replaceChild: function (oldChild, newChild) {
		var size = oldChild.config[this._dimension];
		// If the dimension of the new element is set after the replace call
		// a recalculation occurs in replace child because the children won't ever add up to 100
		// the recalculation appears to the user as a flicker/jump and moves the splitter with a few pixels
		newChild.config = newChild.config || {};
		newChild.config[this._dimension] = size;
		lm.items.AbstractContentItem.prototype.replaceChild.call(this, oldChild, newChild);
		this.callDownwards('setSize');
		this.emitBubblingEvent('stateChanged');
	},

	/**
	 * Called whenever the dimensions of this item or one of its parents change
	 *
	 * @returns {void}
	 */
	setSize: function () {
		if (this.contentItems.length > 0) {
			this._calculateRelativeSizes();
			this._setAbsoluteSizes();
		}
		this.emitBubblingEvent('stateChanged');
		this.emit('resize');
	},

	/**
	 * Returns the min width of the row or column
	 * @returns {number | undefined}
	 */
	getMinWidth() {
		const elementMinWidth = this.config.workspacesConfig.minWidth || this.layoutManager.config.dimensions.minItemWidth;
		const contentsMinWidth = this.contentItems.reduce((minWidth, ci) => {
			if (this.config.type === "row") {
				minWidth += ci.getMinWidth() || this.layoutManager.config.dimensions.minItemWidth;
			} else if (this.config.type === "column") {
				minWidth = Math.max(ci.getMinWidth() || this.layoutManager.config.dimensions.minItemWidth, minWidth);
			}
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
			if (this.config.type === "row") {
				maxWidth += ci.getMaxWidth() || this.layoutManager.config.dimensions.maxItemWidth;
			} else if (this.config.type === "column") {
				maxWidth = Math.min(ci.getMaxWidth() || this.layoutManager.config.dimensions.maxItemWidth, maxWidth || elementMaxWidth);
			}
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
			if (this.config.type === "row") {
				minHeight = Math.max(ci.getMinHeight() || this.layoutManager.config.dimensions.minItemHeight, minHeight);
			} else if (this.config.type === "column") {
				minHeight += ci.getMinHeight() || this.layoutManager.config.dimensions.minItemHeight;
			}
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
			if (this.config.type === "row") {
				maxHeight = Math.min(ci.getMaxHeight() || this.layoutManager.config.dimensions.maxItemHeight, maxHeight || elementMaxHeight);
			} else if (this.config.type === "column") {
				maxHeight += ci.getMaxHeight() || this.layoutManager.config.dimensions.maxItemHeight;
			}
			return maxHeight;
		}, 0);

		return Math.min(elementMaxHeight, contentsMaxHeight);
	},

	/**
	 * Invoked recursively by the layout manager. AbstractContentItem.init appends
	 * the contentItem's DOM elements to the container, RowOrColumn init adds splitters
	 * in between them
	 *
	 * @package private
	 * @override AbstractContentItem._$init
	 * @returns {void}
	 */
	_$init: function () {
		if (this.isInitialised === true) return;

		var i;

		lm.items.AbstractContentItem.prototype._$init.call(this);

		for (i = 0; i < this.contentItems.length - 1; i++) {
			this.contentItems[i].element.after(this._createSplitter(i).element);
		}
	},

	/**
	 * Turns the relative sizes calculated by _calculateRelativeSizes into
	 * absolute pixel values and applies them to the children's DOM elements
	 *
	 * Assigns additional pixels to counteract Math.floor
	 *
	 * @private
	 * @returns {void}
	 */
	_setAbsoluteSizes: function () {
		var i,
			sizeData = this._calculateAbsoluteSizes();

		const pinnedItemsInCollection = this.contentItems.filter((ci) => ci.config.workspacesConfig.isPinned && !this._layoutManager._ignorePinned);
		let additionalPixels = sizeData.additionalPixel;
		const pinnedItemsWhichWillReceivePixel = pinnedItemsInCollection.filter((pi) => {
			const currentSize = this.isColumn ? pi.element.height() : pi.element.width();
			const indexInCollection = this.contentItems.indexOf(pi);

			return Math.floor(currentSize) > Math.floor(sizeData.itemSizes[indexInCollection]);
		});

		pinnedItemsWhichWillReceivePixel.forEach((pi) => {
			const currentSize = this.isColumn ? pi.element.height() : pi.element.width();
			const indexInCollection = this.contentItems.indexOf(pi);
			const pixelsRequired = Math.floor(currentSize - sizeData.itemSizes[indexInCollection]);

			const pixelsToAdd = Math.min(additionalPixels, pixelsRequired);
			sizeData.itemSizes[indexInCollection] += pixelsToAdd;
			additionalPixels -= pixelsToAdd;
		});

		const pixelPerItem = Math.ceil(additionalPixels / (this.contentItems.length - pinnedItemsInCollection.length));

		for (i = 0; i < this.contentItems.length; i++) {
			if (additionalPixels > 0 && !this.contentItems[i].config.workspacesConfig.isPinned) {
				const pixelsToAdd = Math.min(additionalPixels, pixelPerItem);
				sizeData.itemSizes[i] += pixelsToAdd;
				additionalPixels -= pixelsToAdd;
			}

			if (this._isColumn) {
				this.contentItems[i].element.width(sizeData.totalWidth);
				this.contentItems[i].element.height(sizeData.itemSizes[i]);
			} else {
				this.contentItems[i].element.width(sizeData.itemSizes[i]);
				this.contentItems[i].element.height(sizeData.totalHeight);
			}
		}
	},

	/**
	 * Calculates the absolute sizes of all of the children of this Item.
	 * @returns {object} - Set with absolute sizes and additional pixels.
	 */
	_calculateAbsoluteSizes: function () {
		var i,
			totalSplitterSize = (this.contentItems.length - 1) * this._splitterSize,
			totalWidth = this.element.width(),
			totalHeight = this.element.height(),
			totalAssigned = 0,
			additionalPixel,
			itemSize,
			itemSizes = [];

		if (this._isColumn) {
			totalHeight -= totalSplitterSize;
		} else {
			totalWidth -= totalSplitterSize;
		}

		for (i = 0; i < this.contentItems.length; i++) {
			if (this._isColumn) {
				itemSize = Math.floor(totalHeight * (this.contentItems[i].config.height / 100));
			} else {
				itemSize = Math.floor(totalWidth * (this.contentItems[i].config.width / 100));
			}

			totalAssigned += itemSize;
			itemSizes.push(itemSize);
		}

		additionalPixel = Math.floor((this._isColumn ? totalHeight : totalWidth) - totalAssigned);

		return {
			itemSizes: itemSizes,
			additionalPixel: additionalPixel,
			totalWidth: totalWidth,
			totalHeight: totalHeight
		};
	},

	/**
	 * Calculates the relative sizes of all children of this Item. The logic
	 * is as follows:
	 *
	 * - Add up the total size of all items that have a configured size
	 *
	 * - If the total == 100 (check for floating point errors)
	 *        Excellent, job done
	 *
	 * - If the total is > 100,
	 *        set the size of items without set dimensions to 1/3 and add this to the total
	 *        set the size off all items so that the total is hundred relative to their original size
	 *
	 * - If the total is < 100
	 *        If there are items without set dimensions, distribute the remainder to 100 evenly between them
	 *        If there are no items without set dimensions, increase all items sizes relative to
	 *        their original size so that they add up to 100
	 *
	 * @private
	 * @returns {void}
	 */
	_calculateRelativeSizes: function () {

		var i,
			total = 0,
			itemsWithoutSetDimension = [],
			dimension = this._isColumn ? 'height' : 'width';

		for (i = 0; i < this.contentItems.length; i++) {
			if (this.contentItems[i].config[dimension] !== undefined) {
				total += this.contentItems[i].config[dimension];
			} else {
				itemsWithoutSetDimension.push(this.contentItems[i]);
			}
		}

		/**
		 * Everything adds up to hundred, all good :-)
		 */
		if (Math.round(total) === 100) {
			this._respectItemWidthConstraints();
			this._respectItemHeightConstraints();
			return;
		}

		/**
		 * Allocate the remaining size to the items without a set dimension
		 */
		if (Math.round(total) < 100 && itemsWithoutSetDimension.length > 0) {
			for (i = 0; i < itemsWithoutSetDimension.length; i++) {
				itemsWithoutSetDimension[i].config[dimension] = (100 - total) / itemsWithoutSetDimension.length;
			}
			this._respectItemWidthConstraints();
			this._respectItemHeightConstraints();
			return;
		}

		/**
		 * If the total is > 100, but there are also items without a set dimension left, assing 50
		 * as their dimension and add it to the total
		 *
		 * This will be reset in the next step
		 */
		if (Math.round(total) > 100) {
			for (i = 0; i < itemsWithoutSetDimension.length; i++) {
				itemsWithoutSetDimension[i].config[dimension] = 50;
				total += 50;
			}
		}

		/**
		 * Set every items size relative to 100 relative to its size to total
		 */
		for (i = 0; i < this.contentItems.length; i++) {
			this.contentItems[i].config[dimension] = (this.contentItems[i].config[dimension] / total) * 100;
		}

		this._respectItemWidthConstraints();
		this._respectItemHeightConstraints();
	},

	/**
	 * Adjusts the column widths to respect the dimensions minItemWidth if set.
	 * @returns {}
	 */
	_respectItemWidthConstraints: function () {
		var minItemWidth = this.layoutManager.config.dimensions ? (this.layoutManager.config.dimensions.minItemWidth || 0) : 0,
			maxItemWidth = this.layoutManager.config.dimensions ? (this.layoutManager.config.dimensions.minItemWidth || 32767) : 32767,
			sizeData = null,
			entriesOverMin = [],
			entriesUnderMax = [],
			totalOverMin = 0,
			totalUnderMin = 0,
			totalOverMax = 0,
			totalUnderMax = 0,
			remainingWidth = 0,
			remainingWidthToReduce = 0,
			remainingWidthToEnlarge = 0,
			itemSize = 0,
			contentItem = null,
			reducePercent,
			enlargePercent,
			reducedWidth,
			enlargedWidth,
			allEntries = [],
			entry;

		if (this._isColumn || !minItemWidth || this.contentItems.length <= 1) {
			return;
		}

		sizeData = this._calculateAbsoluteSizes();
		maxItemWidth = Math.min(maxItemWidth, sizeData.totalWidth);

		/**
		 * Figure out how much we are under the min item size total and how much room we have to use.
		 */
		for (var i = 0; i < this.contentItems.length; i++) {
			contentItem = this.contentItems[i];
			itemSize = sizeData.itemSizes[i];

			const contentItemMaxWidth = contentItem.config.workspacesConfig.isPinned && !this._layoutManager._ignorePinned ? contentItem.element.width() : contentItem.getMaxWidth();
			const contentItemMinWidth = contentItem.config.workspacesConfig.isPinned && !this._layoutManager._ignorePinned ? contentItem.element.width() : contentItem.getMinWidth();
			const validContentItemMaxWidth = Math.min((contentItemMaxWidth === undefined) ? maxItemWidth : contentItemMaxWidth, sizeData.totalWidth)
			const validContentItemMinWidth = (contentItemMinWidth === undefined) ? minItemWidth : contentItemMinWidth;

			if (itemSize < validContentItemMinWidth) {
				totalUnderMin += validContentItemMinWidth - itemSize;
				entry = {
					maxWidth: validContentItemMaxWidth,
					minWidth: validContentItemMinWidth,
					width: validContentItemMinWidth
				};

			} else {
				totalOverMin += Math.min(itemSize, validContentItemMaxWidth) - validContentItemMinWidth;
				entry = {
					maxWidth: validContentItemMaxWidth,
					minWidth: validContentItemMinWidth,
					width: itemSize
				};
				entriesOverMin.push(entry);
			}

			if (itemSize > validContentItemMaxWidth) {
				totalOverMax += itemSize - validContentItemMaxWidth;
				entry.width = validContentItemMaxWidth;
			} else {
				totalUnderMax += validContentItemMaxWidth - Math.max(itemSize, validContentItemMinWidth);
				entriesUnderMax.push(entry);
			}

			allEntries.push(entry);
		}

		const isMinWidthImpossible = totalUnderMin === 0 || totalUnderMin > totalOverMin;
		const isMaxWidthImpossible = totalOverMax === 0 || totalOverMax > totalUnderMax;
		/**
		 * If there is nothing under min, or there is not enough over to make up the difference, do nothing.
		 */
		if (isMinWidthImpossible && isMaxWidthImpossible) {
			return true;
		}

		if (!isMinWidthImpossible) {
			/**
					 * Evenly reduce all columns that are over the min item width to make up the difference.
					 */
			reducePercent = totalUnderMin / totalOverMin;
			remainingWidthToReduce = totalUnderMin;
			for (i = 0; i < entriesOverMin.length; i++) {
				entry = entriesOverMin[i];
				reducedWidth = Math.round((entry.width - entry.minWidth) * reducePercent);
				remainingWidthToReduce -= reducedWidth;
				entry.width -= reducedWidth;
			}
		}

		if (!isMaxWidthImpossible) {
			/**
			 * Evenly enlarge all that are over the max item width to make up the difference.
			 */
			enlargePercent = totalOverMax / totalUnderMax;
			remainingWidthToEnlarge = totalOverMax;
			for (i = 0; i < entriesUnderMax.length; i++) {
				entry = entriesUnderMax[i];
				enlargedWidth = Math.round((entry.maxWidth - entry.width) * enlargePercent);
				remainingWidthToEnlarge -= enlargedWidth;
				entry.width += enlargedWidth;
			}
		}

		if (!isMinWidthImpossible) {
			/**
					 * Take anything remaining from the last item.
					 */
			if (remainingWidthToReduce !== 0) {
				allEntries[allEntries.length - 1].width -= remainingWidthToReduce;
			}
		}

		if (!isMaxWidthImpossible) {
			/**
			  * Take anything remaining from the last item.
			  */
			if (remainingWidthToEnlarge !== 0) {
				allEntries[allEntries.length - 1].width += remainingWidthToEnlarge;
			}
		}

		/**
		 * Set every items size relative to 100 relative to its size to total
		 */
		for (i = 0; i < this.contentItems.length; i++) {
			this.contentItems[i].config.width = (allEntries[i].width / sizeData.totalWidth) * 100;
		}

		return false;
	},
	/**
	  * Adjusts the column widths to respect the dimensions minItemWidth if set.
	  * @returns {}
	  */
	_respectItemHeightConstraints: function () {
		var minItemHeight = this.layoutManager.config.dimensions ? (this.layoutManager.config.dimensions.minItemHeight || 0) : 0,
			maxItemHeight = this.layoutManager.config.dimensions ? (this.layoutManager.config.dimensions.maxItemHeight || 32767) : 32767,
			sizeData = null,
			entriesOverMin = [],
			entriesUnderMax = [],
			totalOverMin = 0,
			totalUnderMin = 0,
			totalOverMax = 0,
			totalUnderMax = 0,
			remainingHeight = 0,
			remainingHeightToReduce = 0,
			remainingHeightToEnlarge = 0,
			itemSize = 0,
			contentItem = null,
			reducePercent,
			enlargePercent,
			reducedHeight,
			enlargedHeight,
			allEntries = [],
			entry;

		if (this._isRow || !minItemHeight || this.contentItems.length <= 1) {
			return;
		}

		sizeData = this._calculateAbsoluteSizes();
		maxItemHeight = Math.min(sizeData.totalHeight, maxItemHeight);

		/**
		 * Figure out how much we are under the min item size total and how much room we have to use.
		 */
		for (var i = 0; i < this.contentItems.length; i++) {

			contentItem = this.contentItems[i];
			itemSize = sizeData.itemSizes[i];

			const contentItemMaxHeight = contentItem.config.workspacesConfig.isPinned && !this._layoutManager._ignorePinned ? contentItem.element.height() : contentItem.getMaxHeight();
			const contentItemMinHeight = contentItem.config.workspacesConfig.isPinned && !this._layoutManager._ignorePinned ? contentItem.element.height() : contentItem.getMinHeight();
			const validContentItemMaxHeight = Math.min((contentItemMaxHeight === undefined) ? maxItemHeight : contentItemMaxHeight, sizeData.totalHeight);
			const validContentItemMinHeight = (contentItemMinHeight === undefined) ? minItemHeight : contentItemMinHeight;

			if (itemSize < validContentItemMinHeight) {
				totalUnderMin += validContentItemMinHeight - itemSize;
				entry = {
					maxHeight: validContentItemMaxHeight,
					minHeight: validContentItemMinHeight,
					height: validContentItemMinHeight
				};
			} else {
				totalOverMin += Math.min(itemSize, validContentItemMaxHeight) - validContentItemMinHeight;
				entry = {
					maxHeight: validContentItemMaxHeight,
					minHeight: validContentItemMinHeight,
					height: itemSize
				};
				entriesOverMin.push(entry);
			}

			if (itemSize > validContentItemMaxHeight) {
				totalOverMax += itemSize - validContentItemMaxHeight;
				entry.height = validContentItemMaxHeight;
			} else {
				totalUnderMax += validContentItemMaxHeight - Math.max(itemSize, validContentItemMinHeight);
				entriesUnderMax.push(entry);
			}

			allEntries.push(entry);
		}

		const isMinHeightImpossible = totalUnderMin === 0 || totalUnderMin > totalOverMin;
		const isMaxHeightImpossible = totalOverMax === 0 || totalOverMax > totalUnderMax;
		/**
		 * If there is nothing under min, or there is not enough over to make up the difference, do nothing.
		 */
		if (isMinHeightImpossible && isMaxHeightImpossible) {
			return true;
		}

		if (!isMinHeightImpossible) {
			/**
			 * Evenly reduce all columns that are over the min item width to make up the difference.
			 */
			reducePercent = totalUnderMin / totalOverMin;
			remainingHeight = totalUnderMin;
			for (i = 0; i < entriesOverMin.length; i++) {
				entry = entriesOverMin[i];
				remainingHeightToReduce = Math.round((entry.height - minItemHeight) * reducePercent);
				remainingHeight -= remainingHeightToReduce;
				entry.height -= remainingHeightToReduce;
			}
		}

		if (!isMaxHeightImpossible) {
			/**
			 * Evenly enlarge all that are over the max item width to make up the difference.
			 */
			enlargePercent = totalOverMax / totalUnderMax;
			remainingHeightToEnlarge = totalOverMax;
			for (i = 0; i < entriesUnderMax.length; i++) {
				entry = entriesUnderMax[i];
				enlargedHeight = Math.round((entry.maxHeight - entry.height) * enlargePercent);
				remainingHeightToEnlarge -= enlargedHeight;
				entry.height += enlargedHeight;
			}
		}

		if (!isMinHeightImpossible) {
			/**
			 * Take anything remaining from the last item.
			 */
			if (remainingHeight !== 0) {
				allEntries[allEntries.length - 1].height -= remainingHeight;
			}
		}

		if (!isMaxHeightImpossible) {
			/**
			  * Take anything remaining from the last item.
			  */
			if (remainingHeightToEnlarge !== 0) {
				allEntries[allEntries.length - 1].height += remainingHeightToEnlarge;
			}
		}

		/**
		 * Set every items size relative to 100 relative to its size to total
		 */
		for (i = 0; i < this.contentItems.length; i++) {
			this.contentItems[i].config.height = (allEntries[i].height / sizeData.totalHeight) * 100;
		}

		return false;
	},

	/**
	 * Instantiates a new lm.controls.Splitter, binds events to it and adds
	 * it to the array of splitters at the position specified as the index argument
	 *
	 * What it doesn't do though is append the splitter to the DOM
	 *
	 * @param   {Int} index The position of the splitter
	 *
	 * @returns {lm.controls.Splitter}
	 */
	_createSplitter: function (index) {
		var splitter;
		splitter = new lm.controls.Splitter(this._isColumn, this._splitterSize, this._splitterGrabSize);
		splitter.on('drag', lm.utils.fnBind(this._onSplitterDrag, this, [splitter]), this);
		splitter.on('dragStop', lm.utils.fnBind(this._onSplitterDragStop, this, [splitter]), this);
		splitter.on('dragStart', lm.utils.fnBind(this._onSplitterDragStart, this, [splitter]), this);
		this._splitter.splice(index, 0, splitter);
		return splitter;
	},

	/**
	 * Locates the instance of lm.controls.Splitter in the array of
	 * registered splitters and returns a map containing the contentItem
	 * before and after the splitters, both of which are affected if the
	 * splitter is moved
	 *
	 * @param   {lm.controls.Splitter} splitter
	 *
	 * @returns {Object} A map of contentItems that the splitter affects
	 */
	_getItemsForSplitter: function (splitter) {
		var index = lm.utils.indexOf(splitter, this._splitter);

		return {
			before: this.contentItems[index],
			after: this.contentItems[index + 1]
		};
	},

	/**
	 * Gets the minimum dimensions for the given item configuration array
	 * @param item
	 * @private
	 */
	_getMinimumDimensions: function (arr) {
		var minWidth = 0, minHeight = 0;

		for (var i = 0; i < arr.length; ++i) {
			minWidth = Math.max(arr[i].getMinWidth() || 0, minWidth);
			minHeight = Math.max(arr[i].getMinHeight() || 0, minHeight);
		}

		return { horizontal: minWidth, vertical: minHeight };
	},
	/**
	 * Gets the minimum dimensions for the given item configuration array
	 * @param item
	 * @private
	 */
	_getMaximumDimensions: function (arr) {
		var maxWidth = 32767, maxHeight = 32767;

		for (var i = 0; i < arr.length; ++i) {
			maxWidth = Math.min(arr[i].getMaxWidth() || 0, maxWidth);
			maxHeight = Math.min(arr[i].getMaxHeight() || 0, maxHeight);
		}

		return { horizontal: maxWidth, vertical: maxHeight };
	},

	_setMinMaxSplitterPosition(items) {
		const minSize = this.layoutManager.config.dimensions[this._isColumn ? 'minItemHeight' : 'minItemWidth'];
		const maxSize = this.layoutManager.config.dimensions[this.isColumn ? 'maxItemHeight' : 'maxItemWidth'];

		var beforeMinDim = this._getMinimumDimensions([...items.before.contentItems, items.before]);
		var beforeMaxDim = this._getMaximumDimensions([...items.before.contentItems, items.before]);
		var beforeMinSize = this._isColumn ? beforeMinDim.vertical : beforeMinDim.horizontal;
		var beforeMaxSize = this.isColumn ? beforeMaxDim.vertical : beforeMaxDim.horizontal;

		var afterMinDim = this._getMinimumDimensions([...items.after.contentItems, items.after]);
		var afterMaxDim = this._getMaximumDimensions([...items.after.contentItems, items.after]);
		var afterMinSize = this._isColumn ? afterMinDim.vertical : afterMinDim.horizontal;
		var afterMaxSize = this.isColumn ? afterMaxDim.vertical : afterMaxDim.horizontal;

		var splitterMinPositionFromBeforeElement = -1 * (items.before.element[this._dimension]() - (beforeMinSize || minSize));
		var splitterMinPositionFromAfterElement = -1 * ((afterMaxSize || maxSize) - items.after.element[this._dimension]());

		var splitterMaxPositionFromBeforeElement = (beforeMaxSize || maxSize) - items.before.element[this._dimension]();
		var splitterMaxPositionFromAfterElement = items.after.element[this._dimension]() - (afterMinSize || minSize);

		this._splitterPosition = 0;
		this._splitterMinPosition = Math.max(splitterMinPositionFromBeforeElement, splitterMinPositionFromAfterElement);
		this._splitterMaxPosition = Math.min(splitterMaxPositionFromBeforeElement, splitterMaxPositionFromAfterElement);
	},
	/**
	 * Invoked when a splitter's dragListener fires dragStart. Calculates the splitters
	 * movement area once (so that it doesn't need calculating on every mousemove event)
	 *
	 * @param   {lm.controls.Splitter} splitter
	 *
	 * @returns {void}
	 */
	_onSplitterDragStart: function (splitter) {
		this.layoutManager._ignorePinned = true;
		var items = this._getItemsForSplitter(splitter);
		this._setMinMaxSplitterPosition(items);
	},

	/**
	 * Invoked when a splitter's DragListener fires drag. Updates the splitters DOM position,
	 * but not the sizes of the elements the splitter controls in order to minimize resize events
	 *
	 * @param   {lm.controls.Splitter} splitter
	 * @param   {Int} offsetX  Relative pixel values to the splitters original position. Can be negative
	 * @param   {Int} offsetY  Relative pixel values to the splitters original position. Can be negative
	 *
	 * @returns {void}
	 */
	_onSplitterDrag: function (splitter, offsetX, offsetY) {
		if (this._layoutManager.config && this._layoutManager.config.workspacesOptions.allowSplitters === false) {
			return;
		}
		var offset = this._isColumn ? offsetY : offsetX;

		if (offset > this._splitterMinPosition && offset < this._splitterMaxPosition) {
			this._splitterPosition = offset;
			splitter.element.css(this._isColumn ? 'top' : 'left', offset);
		}

		this._layoutManager.emit("splitterDragged", splitter);
	},

	/**
	 * Invoked when a splitter's DragListener fires dragStop. Resets the splitters DOM position,
	 * and applies the new sizes to the elements before and after the splitter and their children
	 * on the next animation frame
	 *
	 * @param   {lm.controls.Splitter} splitter
	 *
	 * @returns {void}
	 */
	_onSplitterDragStop: function (splitter) {

		if (this._layoutManager.config && this._layoutManager.config.workspacesOptions.allowSplitters === false) {
			return;
		}

		var items = this._getItemsForSplitter(splitter),
			sizeBefore = items.before.element[this._dimension](),
			sizeAfter = items.after.element[this._dimension](),
			splitterPositionInRange = (this._splitterPosition + sizeBefore) / (sizeBefore + sizeAfter),
			totalRelativeSize = items.before.config[this._dimension] + items.after.config[this._dimension];

		items.before.config[this._dimension] = splitterPositionInRange * totalRelativeSize;
		items.after.config[this._dimension] = (1 - splitterPositionInRange) * totalRelativeSize;

		splitter.element.css({
			'top': 0,
			'left': 0
		});

		lm.utils.animFrame(() => {
			lm.utils.fnBind(this.callDownwards, this, ['setSize'])();
			this._layoutManager._ignorePinned = false;
		});

		this._layoutManager.emit("splitterDragStopped", splitter);
	}
});
