/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>.
*/

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use std::process::Command;
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu, WindowEvent};

#[cfg(any(windows))]
use window_shadows::set_shadow;

use window_ext::WindowExt;

mod window_ext;

async fn is_git_installed() -> bool {
    let is_git_installed = Command::new("git")
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))
        .map_or(false, |output| output.status.success());

    if !is_git_installed {
        return false;
    } else {
        return true;
    }
}

#[tauri::command]
async fn clone_repo(url: String, path: String) -> Result<(), String> {
    let git_installed = is_git_installed().await;
    if git_installed {
        let output = Command::new("git")
            .args(&["clone", &url, &path])
            .output()
            .map_err(|e| format!("Failed to execute command: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            let error_message = String::from_utf8_lossy(&output.stderr);
            Err(format!("Failed to clone repository: {}", error_message))
        }
    } else {
        Err("Git is not installed".to_string())
    }
}

fn menu() -> Menu {
    let app_menu = Menu::new()
        .add_item(CustomMenuItem::new("about".to_string(), "About"))
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
        .add_item(
            CustomMenuItem::new("new_workspace".to_string(), "New Workspace")
                .accelerator("CmdOrCtrl+Shift+Alt+N"),
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
            CustomMenuItem::new("file_explorer".to_string(), "File Explorer")
                .accelerator("CmdOrCtrl+Shift+F"),
        )
        .add_item(
            CustomMenuItem::new("terminal".to_string(), "Terminal")
                .accelerator("CmdOrCtrl+Shift+T"),
        );

    let menu = Menu::new()
        .add_submenu(Submenu::new("App", app_menu))
        .add_submenu(Submenu::new("File", file_menu))
        .add_submenu(Submenu::new("Edit", edit_menu))
        .add_submenu(Submenu::new("View", view_menu))
        .add_submenu(Submenu::new("Modules", modules_menu));

    #[cfg(any(target_os = "macos"))]
    return menu;

    return Menu::new();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let win = app.get_window("main").unwrap();
            win.set_transparent_titlebar(true, false);
            win.set_window_controls_pos(16., 18.);

            #[cfg(any(windows))]
            set_shadow(&win, true).unwrap();

            Ok(())
        })
        .on_window_event(|e| {
            // [start] source: https://github.com/tauri-apps/tauri/issues/4789#issuecomment-1387243148
            let apply_offset = || {
                let win = e.window();
                win.set_window_controls_pos(16., 18.);
            };

            match e.event() {
                WindowEvent::Resized(..) => apply_offset(), // TODO: maybe emit event for window controls, so they update when window resizes?
                WindowEvent::ThemeChanged(..) => apply_offset(),
                _ => {}
            }
            // [end]
        })
        .on_menu_event(|event| {
            event
                .window()
                .emit(&("narvik:".to_owned() + event.menu_item_id()), "")
                .unwrap();
        })
        .menu(menu())
        .invoke_handler(tauri::generate_handler![clone_repo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
