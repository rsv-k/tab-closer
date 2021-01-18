function getTabs(): Promise<chrome.tabs.Tab[]> {
	return new Promise((resolve) => {
		chrome.tabs.query(
			{
				windowId: chrome.windows.WINDOW_ID_CURRENT,
			},
			(tabs) => resolve(tabs)
		);
	});
}

function createAlarm(tabId: string) {
	chrome.alarms.create(tabId, {
		delayInMinutes: 1,
	});
}
