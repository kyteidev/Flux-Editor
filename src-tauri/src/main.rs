/*
Copyright © 2024 kyteidev.

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

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use log::{error, info};

use lsp_client::{init_server, send_request};
use serde_json::{json, Value};
#[cfg(target_os = "macos")]
use tauri::WindowEvent;
use tauri::{Emitter, Manager, Window};
use tauri_plugin_log::{Target, TargetKind};

#[cfg(target_os = "macos")]
use cocoa::appkit::NSWindow;
#[cfg(target_os = "macos")]
use cocoa::base::id;
#[cfg(target_os = "macos")]
use objc::runtime::{NO, YES};
#[cfg(target_os = "windows")]
use window_shadows::set_shadow;

#[cfg(target_os = "macos")]
use window_ext::WindowExt;

#[cfg(target_os = "macos")]
mod window_ext;

mod commands;
use commands::{
    cmd::{abort_all_commands, abort_command, spawn_command},
    fs::{get_dir_contents, is_dir, path_exists},
    git::{clone_repo, current_branch},
    path::{app_data_dir, user_home_dir},
    trash::remove_file,
    window::new_window,
};

mod utils;
use utils::dir::{get_app_log_dir, get_ls_dir};

mod lsp_client;
mod menu;
use menu::menu;

#[tauri::command]
fn show_main_window(app: tauri::AppHandle) {
    info!("Showing Window");
    app.get_webview_window("main")
        .expect("No window labeled 'main'")
        .show()
        .unwrap();
}

#[tauri::command]
fn set_doc_edited(_window: Window, _edited: bool) {
    #[cfg(target_os = "macos")]
    {
        let ns_window: id = _window.ns_window().unwrap() as id;
        unsafe { ns_window.setDocumentEdited_(if _edited { YES } else { NO }) }
        _window.set_window_controls_pos(10., 12.5)
    }
}

#[tauri::command]
async fn ls_send_request(id: &str, method: &str, params: Value) -> Result<String, String> {
    init_server(get_ls_dir(), "typescript");

    let request = json!({
        "jsonrpc": "2.0",
        "id": id,
        "method": method,
        "params": params,
    });

    let response = send_request(serde_json::to_string(&request).unwrap().as_str()).unwrap();

    #[cfg(debug_assertions)]
    println!("Received response: {:?}", response);

    Ok(response)
}

fn main() {
    #[cfg(not(target_os = "windows"))]
    fix_path_env::fix().unwrap();

    #[cfg(debug_assertions)]
    let log_targets: [Target; 3] = [
        Target::new(TargetKind::Stdout),
        Target::new(TargetKind::Webview),
        Target::new(TargetKind::Folder {
            path: get_app_log_dir(),
            file_name: Some("main".to_string()),
        }),
    ];

    #[cfg(not(debug_assertions))]
    let log_targets: [Target; 3] = [
        Target::new(TargetKind::Stdout),
        Target::new(TargetKind::Webview),
        Target::new(TargetKind::Folder {
            path: get_app_log_dir(),
            file_name: Some("main".to_string()),
        }),
    ];

    std::panic::set_hook(Box::new(|e| {
        error!("PANIC: {}", e.to_string());
    }));

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets(log_targets)
                .level(log::LevelFilter::Debug)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            /*
            install_server(get_ls_dir(), "typescript"); // temporary for testing purposes
            */

            #[cfg(any(windows, target_os = "macos"))]
            let win = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            win.set_transparent_titlebar(true, false);

            #[cfg(target_os = "macos")]
            win.set_window_controls_pos(10., 12.5);

            #[cfg(windows)]
            set_shadow(&win, true).unwrap();

            let app_clone = app.handle();

            app.set_menu(menu(&app_clone))?;

            app_clone.on_menu_event(move |app, event| {
                app.emit(&("flux:menu:".to_owned() + &event.id().as_ref()), "")
                    .unwrap();
            });

            Ok(())
        })
        .on_window_event(|window, _e| {
            // [start] source: https://github.com/tauri-apps/tauri/issues/4789#issuecomment-1387243148

            #[cfg(target_os = "macos")]
            let apply_offset = || {
                let win = window;
                win.set_window_controls_pos(10., 12.5);
            };

            #[cfg(target_os = "macos")]
            match _e {
                WindowEvent::Resized(..) => apply_offset(),
                WindowEvent::ThemeChanged(..) => apply_offset(),
                _ => {}
            }
            // [end]
        })
        .invoke_handler(tauri::generate_handler![
            show_main_window,
            clone_repo,
            set_doc_edited,
            ls_send_request,
            app_data_dir,
            user_home_dir,
            new_window,
            get_dir_contents,
            spawn_command,
            abort_command,
            is_dir,
            path_exists,
            abort_all_commands,
            current_branch,
            remove_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
