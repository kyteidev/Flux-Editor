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

use std::{fs, path::PathBuf};

use log::error;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ItemTypes {
    dirs: Vec<String>,
    files: Vec<String>,
}

#[tauri::command]
pub fn get_dir_contents(path: PathBuf) -> Result<ItemTypes, String> {
    let mut dirs = Vec::new();
    let mut files = Vec::new();

    let entries = match fs::read_dir(&path) {
        Ok(entries) => entries,
        Err(e) => {
            error!("Error fetching directory contents: {:?}", e);
            return Err("error".to_string());
        }
    };

    for entry in entries {
        let entry = entry.map_err(|e| {
            error!("Error reading directory entry: {}", e);
            format!("Error reading directory entry: {}", e)
        })?;

        let metadata = entry.metadata().map_err(|e| {
            error!("Error fetching metadata for {}", e);
            format!("Error fetching metadata: {}", e)
        })?;

        let name = entry.file_name();
        let name_str = name.to_string_lossy();

        let unallowed_names = vec![".DS_Store", ".git"];

        if unallowed_names.contains(&&*name_str) {
            continue;
        }

        if metadata.is_dir() {
            dirs.push(name_str.into_owned());
        } else if metadata.is_file() {
            files.push(name_str.into_owned());
        }
    }

    Ok(ItemTypes {
        dirs: dirs,
        files: files,
    })
}

#[tauri::command]
pub fn path_exists(path: PathBuf) -> bool {
    path.exists()
}

#[tauri::command]
pub fn is_dir(path: PathBuf) -> bool {
    path.is_dir()
}
