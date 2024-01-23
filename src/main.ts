import { App, Editor, Plugin } from "obsidian";
import { QSWSettingTab } from "./settings";
import { DEFAULT_SETTINGS } from "./types/variables";
import { NewWrapperModal } from "./modal";



export default class QSWPlugin extends Plugin {
	settings: QSWSettings;
	
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new QSWSettingTab(this.app, this));
		// todo: command to create edit add an editable wrapper
		// command to edit existing command

		// create a new wrapper
		this.addCommand({
			id: 'quick-shortcuts-wrap',
			name: 'Add a wrapper',

			editorCallback: (editor: Editor) => {
				new NewWrapperModal(this.app).open();
			},
		});
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}