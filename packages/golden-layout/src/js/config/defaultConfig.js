lm.config.defaultConfig = {
	openPopouts: [],
	settings: {
		hasHeaders: true,
		constrainDragToContainer: true,
		reorderEnabled: true,
		selectionEnabled: false,
		popoutWholeStack: false,
		blockedPopoutsThrowError: true,
		closePopoutsOnUnload: true,
		showMinimizeIcon: false,
		showPopoutIcon: true,
		showMaximizeIcon: true,
		showCloseIcon: true,
		responsiveMode: 'always', // Can be onload, always, or none.
		tabOverlapAllowance: 0, // maximum pixel overlap per tab
		reorderOnTabMenuClick: true,
		tabControlOffset: 10,
		mode: "default"
	},
	dimensions: {
		borderWidth: 5,
		borderGrabWidth: 15,
		minItemHeight: 10,
		maxItemHeight: 32767,
		minItemWidth: 10,
		maxItemWidth: 32767,
		headerHeight: 20,
		dragProxyWidth: 500,
		dragProxyHeight: 500
	},
	labels: {
		close: 'close',
		maximize: 'maximize',
		restore: 'restore',
		minimize: "minimize",
		popout: 'eject',
		popin: 'pop in',
		tabDropdown: 'additional tabs'
	},
	workspacesOptions: {
		// workspaces related options go here
	}
};
