import { appWindow } from "@tauri-apps/api/window";
import { about, license, licenseThirdParty, settings } from "./menuActions";
import { info } from "tauri-plugin-log-api";
import { fileSaved, saveFile } from "./components/Editor/EditorComponent";
import { getTabs } from "./components/Editor/components/EditorTabs";
import { dialog } from "@tauri-apps/api";

export const addListeners = () => {
  appWindow.listen("tauri://close-requested", async () => {
    if (fileSaved().length === getTabs().length) {
      appWindow.close();
    } else {
      const closeEditor = await dialog.ask("Your changes will not be saved.", {
        title: "Are you sure you want to close Flux Editor?",
        type: "warning",
      });
      if (closeEditor) {
        appWindow.close();
      }
    }
  });

  /*
  appWindow.listen("flux:ls-test", async () => {
    send_request();
  });
  */

  // TODO: Add separate page for displaying this info, instead of dialog?
  appWindow.listen("flux:about", () => {
    about();
  });

  appWindow.listen("flux:license", async () => {
    license();
  });

  appWindow.listen("flux:licenses-third-party", async () => {
    licenseThirdParty();
  });

  appWindow.listen("flux:settings", () => {
    settings();
  });

  appWindow.listen("flux:save", () => {
    saveFile();
  });
  appWindow.listen("flux:save_as", () => {
    saveFile(true);
  });

  info("Initialized menu event listeners");
};
