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

use std::path::PathBuf;

use log::error;
use tauri::api::path::home_dir;

use crate::utils::dir::get_app_data_dir;

#[tauri::command]
pub fn app_data_dir() -> PathBuf {
    let dir = get_app_data_dir();
    dir
}

#[tauri::command]
pub fn user_home_dir() -> PathBuf {
    let dir = home_dir().unwrap();
    dir
}

#[tauri::command]
pub fn resolve_resource(app: tauri::AppHandle, resource: &str) -> PathBuf {
    let path = match app.path_resolver().resolve_resource(resource) {
        Some(resource) => resource,
        None => {
            error!("Failed to resolve resource");
            return PathBuf::new();
        }
    };
    path
}
