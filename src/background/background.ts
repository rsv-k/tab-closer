import { setBadges, convertToMinutes } from '../utils/common';
import { browser } from 'webextension-polyfill-ts';

async function setAlarms() {
	const timer: string =
		(await browser.storage.local.get('timer')).timer || '00:00';

	setBadges(timer === '00:00' ? 'OFF' : 'ON', '#53354a');

	const delayInMinutes = convertToMinutes(timer);

	const alarms = await browser.alarms.getAll();
	const setIds: { [key: string]: boolean } = {};

	for (const a of alarms) {
		setIds[a.name] = true;
	}

	const tabs = await browser.tabs.query({
		windowId: browser.windows.WINDOW_ID_CURRENT,
	});

	for (const tab of tabs) {
		const id = tab.id + '';
		if (!tab.active && !setIds[id]) {
			browser.alarms.create(id, { delayInMinutes });
		} else if (tab.active && setIds[id]) {
			browser.alarms.clear(id);
		}
	}
}

setAlarms();

browser.alarms.onAlarm.addListener((alarm) => {
	browser.tabs.remove(+alarm.name);
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
	await setAlarms();
});

browser.tabs.onRemoved.addListener((tabId) => {
	browser.alarms.clear(tabId + '');
});

browser.storage.onChanged.addListener(async (changes) => {
	if (changes.timer && changes.timer.newValue !== changes.timer.oldValue) {
		await browser.alarms.clearAll();
		await setAlarms();
	}
});

browser.windows.onRemoved.addListener(() => {
	browser.alarms.clearAll();
});
