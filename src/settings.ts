import { PluginSettingTab, Setting } from "obsidian";
import QWPlugin from "./main";
import { sortSettings } from "./utils";
import wrapperModal from "./creator-modal";
import { Wrapper } from "./types/global";
import { WrappersManager } from "./wrappers-manager";
import { createCommand } from "./command-creator";

export class QWSettingTab extends PluginSettingTab {
	constructor(public plugin: QWPlugin) {
		super(plugin.app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const { names, wrappers } = this.plugin.settings

		new Setting(containerEl)
			.setName("Create a New Wrapper")
			.setDesc("markers: @@sel(selection), @@cb(clipboard), @@time, @@date, @@MM-DD-YYYY, @@HH-MM-SS")
			.addButton(cb => {
				cb.setIcon("plus")
					.onClick(() => {
						new wrapperModal(this.plugin, async (wrapper) => {
							this.display()
						}).open()
					})
			})

		sortSettings(this.plugin)

		if (!names.length) return
		for (const name of names) {
			wrapperSettings(this, name, containerEl, wrappers)
		}
	}
}

export function wrapperSettings(_this: QWSettingTab | WrappersManager, name: string, containerEl: HTMLElement, wrappers: Record<string, Wrapper>) {
	if (!Object.values(wrappers).length) return
	const filter = Object.values(wrappers).filter((w) => {
		return w.name === name
	})
	const id = filter[0]?.id
	if (!id) return
	const wrapper = wrappers[id];
	const pluginId = _this.plugin.manifest.id
	const _id = pluginId + ":" + id;
	const hotkey = this.app.hotkeyManager.getHotkeys(_id)?.[0];
	let shortcut = "";
	let nameHK = ""
	if (hotkey) {
		const key = hotkey.key;
		const modif = hotkey.modifiers;
		shortcut = `${modif.join("+")}+${key}`;
		if (hotkey) nameHK = name + ` [${shortcut}]`;
	}

	const desc = createFragment((descEl) => {
		wrapper.tagInput.split("\n").forEach((line) => {
			const div = descEl.createEl("div");
			div.appendText(line);
		})
	})
	new Setting(containerEl)
		.setName(hotkey ? nameHK : name)
		.setDesc(desc)
		.addExtraButton(bt => {
			bt.setIcon("pencil");
			bt.onClick(async () => {
				new wrapperModal(_this.plugin, async (newWrapper, editmode) => {
					if (!editmode) return
					// || modif command & hotkey
					const pluginId = _this.plugin.manifest.id
					const _id = pluginId + ":" + id;
					// ouch !
					this.app.commands.removeCommand(_id);
					await createCommand(_this.plugin, id, newWrapper.name, newWrapper.tagInput)

					_this instanceof QWSettingTab ? _this.display() : _this.onOpen()
				}, wrapper).open();
			})
		})

		.addExtraButton(bt => {
			bt.setIcon("keyboard");
			bt.onClick(async () => {
				const setting = _this.app.setting
				setting.open();
				setting.openTabById("hotkeys");
				const tab = setting.activeTab;
				const pluginName = _this.plugin.manifest.name
				const text = `${pluginName}: ${name}`;
				tab.searchComponent.inputEl.value = text;
				await tab.updateHotkeyVisibility();
				await tab.searchComponent.inputEl.blur();
				// to update hotkeys view in the WrappersManager
				const old = setting.onClose
				setting.onClose = () => {
					if (_this instanceof WrappersManager) _this.onOpen();
					setting.onClose = old
					return setting.onClose()
				}
			})
		})
		.addExtraButton(bt => {
			bt.setIcon("trash");
			bt.onClick(async () => {
				delete _this.plugin.settings.wrappers[id];
				_this.plugin.settings.names = _this.plugin.settings.names.filter((n) => n !== name);
				const pluginId = _this.plugin.manifest.id
				const _id = pluginId + ":" + id;
				_this.app.commands.removeCommand(_id);
				const hotkeys = _this.app.hotkeyManager.getHotkeys(_id);
				if (hotkeys) {
					await this.app.hotkeyManager.removeHotkeys(_id);
				}
				await _this.plugin.saveSettings();
				_this instanceof QWSettingTab ? _this.display() : _this.onOpen();
			})
		})
}