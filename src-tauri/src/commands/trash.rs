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

use std::fs;

#[tauri::command]
pub fn remove_file(trash: bool, path: String) -> Result<(), String> {
    if trash {
        match trash::delete(&path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to move file to trash: {}", e)),
        }
    } else {
        match fs::remove_file(&path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to delete file: {}", e)),
        }
    }
}
