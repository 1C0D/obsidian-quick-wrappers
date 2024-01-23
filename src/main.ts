import { Editor, Plugin } from "obsidian";
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
			name: 'Create & add wrapper',

			editorCallback: (editor: Editor) => {
				new NewWrapperModal(this.app, this, async (name, startTag, endTag) => {
					await this.addWrapper(name, startTag, endTag)
				}).open();
			},
		});
	}

	async addWrapper(name: string, startTag: string, endTag: string) {
		const { settings } = this;
		const { names } = settings;
		let id: string;
		if (!names.includes(name)) {
			id = this.generateKey();
			this.settings.wrappers[id] = {
				id,
				name,
				startTagInput: startTag,
				endTagInput: endTag,
			}
			names.push(name)
		} else {
			const id = Object.values(settings.wrappers).find(
				(wrapper) => wrapper.name === name
			)?.id
			this.settings.wrappers[id!] = {
				id: id!,
				name,
				startTagInput: startTag,
				endTagInput: endTag,
			}

			// 	(wrapper) => wrapper.name === name)[0].id
			// id = settings.wrappers[names.indexOf(name)].id


		}

		await this.saveSettings();
	}

	generateKey() {
		const array = new Uint32Array(2);
		window.crypto.getRandomValues(array);
		return array.join("-");
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}