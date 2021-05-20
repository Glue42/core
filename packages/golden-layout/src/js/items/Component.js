/**
 * @param {[type]} layoutManager [description]
 * @param {[type]} config      [description]
 * @param {[type]} parent        [description]
 */
lm.items.Component = function (layoutManager, config, parent) {
	lm.items.AbstractContentItem.call(this, layoutManager, config, parent);

	var ComponentConstructor = layoutManager.getComponent(this.config.componentName),
		componentConfig = $.extend(true, {}, this.config.componentState || {});

	componentConfig.componentName = this.config.componentName;
	this.componentName = this.config.componentName;

	if (this.config.title === '') {
		this.config.title = this.config.componentName;
	}

	this.isComponent = true;
	this.container = new lm.container.ItemContainer(this.config, this, layoutManager);
	this.instance = new ComponentConstructor(this.container, componentConfig);
	this.element = this.container._element;
};

lm.utils.extend(lm.items.Component, lm.items.AbstractContentItem);

lm.utils.copy(lm.items.Component.prototype, {

	close: function () {
		this.parent.removeChild(this);
	},

	setSize: function () {
		if (this.element.is(':visible')) {
			// Do not update size of hidden components to prevent unwanted reflows
			this.emit("size-changed", { width: this.element.width(), height: this.element.height() })
			this.container._$setSize(this.element.width(), this.element.height());
		}
	},

	/**
	 * Returns the min width of the row or column
	 * @returns {number | undefined}
	 */
	getMinWidth() {
		if (!this.config.workspacesConfig) {
			return this.layoutManager.config.dimensions.minItemWidth;
		}
		return this.config.workspacesConfig.minWidth || this.layoutManager.config.dimensions.minItemWidth;
	},

	/**
	   * Returns the min width of the row or column
	   * @returns {number | undefined}
	   */
	getMaxWidth() {
		if (!this.config.workspacesConfig) {
			return this.layoutManager.config.dimensions.maxItemWidth;
		}
		return this.config.workspacesConfig.maxWidth || this.layoutManager.config.dimensions.maxItemWidth;
	},

	/**
	 * Returns the min width of the row or column
	 * @returns {number | undefined}
	 */
	getMinHeight() {
		if (!this.config.workspacesConfig) {
			return this.layoutManager.config.dimensions.minItemHeight;
		}
		return this.config.workspacesConfig.minHeight || this.layoutManager.config.dimensions.minItemHeight;
	},
	/**
	 * Returns the min width of the row or column
	 * @returns {number | undefined}
	 */
	getMaxHeight() {
		if (!this.config.workspacesConfig) {
			return this.layoutManager.config.dimensions.maxItemHeight;
		}
		return this.config.workspacesConfig.maxHeight || this.layoutManager.config.dimensions.maxItemHeight;
	},
	_$init: function () {
		lm.items.AbstractContentItem.prototype._$init.call(this);
		this.container.emit('open');
	},

	_$hide: function () {
		this.container.hide();
		lm.items.AbstractContentItem.prototype._$hide.call(this);
	},

	_$show: function () {
		this.container.show();
		lm.items.AbstractContentItem.prototype._$show.call(this);
	},

	_$shown: function () {
		this.container.shown();
		lm.items.AbstractContentItem.prototype._$shown.call(this);
	},

	_$destroy: function () {
		this.container.emit('destroy', this);
		lm.items.AbstractContentItem.prototype._$destroy.call(this);
	},

	/**
	 * Dragging onto a component directly is not an option
	 *
	 * @returns null
	 */
	_$getArea: function () {
		return null;
	}
});
