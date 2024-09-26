/*
Copyright © 2024 The Flux Editor Contributors.

This file is part of Flux Editor.

Flux Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

Flux Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Flux Editor. If not, see
<https://www.gnu.org/licenses/>.
*/

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub fn menu() -> Menu {
    let app_menu = Menu::new()
        .add_item(CustomMenuItem::new("about".to_string(), "About"))
        .add_item(CustomMenuItem::new(
            "update".to_string(),
            "Check for Updates",
        ))
        .add_native_item(MenuItem::Separator)
        .add_item(
            CustomMenuItem::new("settings".to_string(), "Settings").accelerator("CmdOrCtrl+,"),
        )
        .add_item(CustomMenuItem::new("plugins".to_string(), "Plugins"))
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Services)
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Quit);

    let file_menu = Menu::new()
        .add_item(
            CustomMenuItem::new("new_file".to_string(), "New File").accelerator("CmdOrCtrl+N"),
        )
        .add_item(
            CustomMenuItem::new("new_project".to_string(), "New Project")
                .accelerator("CmdOrCtrl+Shift+N"),
        )
        .add_native_item(MenuItem::Separator)
        .add_item(CustomMenuItem::new("open".to_string(), "Open...").accelerator("CmdOrCtrl+O"))
        .add_item(CustomMenuItem::new("save".to_string(), "Save").accelerator("CmdOrCtrl+S"))
        .add_item(
            CustomMenuItem::new("save_as".to_string(), "Save As...")
                .accelerator("CmdOrCtrl+Shift+S"),
        );

    let edit_menu = Menu::new()
        .add_native_item(MenuItem::Undo)
        .add_native_item(MenuItem::Redo)
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Cut)
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Paste)
        .add_native_item(MenuItem::SelectAll)
        .add_native_item(MenuItem::Separator)
        .add_item(CustomMenuItem::new("find".to_string(), "Find").accelerator("CmdOrCtrl+F"))
        .add_item(
            CustomMenuItem::new("replace".to_string(), "Replace").accelerator("CmdOrCtrl+Alt+F"),
        );

    let view_menu = Menu::new()
        .add_item(CustomMenuItem::new("themes".to_string(), "Themes"))
        .add_item(CustomMenuItem::new("focus_mode".to_string(), "Focus Mode"));

    let modules_menu = Menu::new()
        .add_item(CustomMenuItem::new("search".to_string(), "Search").accelerator("Alt+Space"))
        .add_item(
            CustomMenuItem::new("file_browser".to_string(), "File Browser")
                .accelerator("CmdOrCtrl+Shift+F"),
        )
        .add_item(
            CustomMenuItem::new("terminal".to_string(), "Terminal")
                .accelerator("CmdOrCtrl+Shift+T"),
        );

    let help_menu = Menu::new().add_submenu(Submenu::new(
        "Legal Notices",
        Menu::new()
            .add_item(CustomMenuItem::new("license".to_string(), "License"))
            .add_item(CustomMenuItem::new(
                "licenses-third-party-js".to_string(),
                "JS Third Party Licenses",
            ))
            .add_item(CustomMenuItem::new(
                "licenses-third-party-rust".to_string(),
                "Rust Third Party Licenses",
            )),
    ));

    let menu = Menu::new()
        .add_submenu(Submenu::new("App", app_menu))
        .add_submenu(Submenu::new("File", file_menu))
        .add_submenu(Submenu::new("Edit", edit_menu))
        .add_submenu(Submenu::new("View", view_menu))
        .add_submenu(Submenu::new("Modules", modules_menu))
        .add_submenu(Submenu::new("Help", help_menu));

    if cfg!(target_os = "macos") {
        return menu;
    } else {
        return Menu::new();
    }
}
