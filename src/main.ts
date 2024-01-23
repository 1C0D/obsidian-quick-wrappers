import { App, Plugin } from "obsidian";
import { QSWSettingTab } from "./settings";
import { DEFAULT_SETTINGS } from "./types/variables";



export default class QSWPlugin extends Plugin {
	settings: QSWSettings;
	
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new QSWSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}