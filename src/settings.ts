import { PluginSettingTab, App } from "obsidian";
import QWPlugin from "./main";


export class QWSettingTab extends PluginSettingTab {
	constructor(app: App, public plugin: QWPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// new Setting(containerEl)

	}
}
