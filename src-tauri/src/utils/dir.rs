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

use std::{fs, path::PathBuf};

use log::error;
use tauri::api::path::data_dir;

pub fn get_app_data_dir() -> PathBuf {
    let app_data_dir = data_dir().map(|dir| dir.join("dev.narvik.editor")).unwrap();

    app_data_dir
}

pub fn get_app_log_dir() -> PathBuf {
    let log_dir = get_app_data_dir().join("logs");

    if !log_dir.exists() {
        fs::create_dir_all(log_dir.clone())
            .map_err(|e| error!("Error creating directory: {}", e))
            .ok();
    }

    log_dir
}

pub fn get_ls_dir() -> PathBuf {
    let ls_dir = get_app_data_dir().join("language-servers");

    if !ls_dir.exists() {
        fs::create_dir_all(ls_dir.clone())
            .map_err(|e| error!("Error creating directory: {}", e))
            .ok();
    }

    ls_dir
}
