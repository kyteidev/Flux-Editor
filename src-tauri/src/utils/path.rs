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

use std::path::PathBuf;

use log::error;

pub fn get_cmd_path(cmd: &str) -> Result<PathBuf, String> {
    match which::which(cmd) {
        Ok(path) => return Ok(path),
        Err(_) => {
            if cfg!(target_os = "windows") {
                // Windows doens't have a set local $PATH directory, so this won't check for one on Windows
                error!("{} doesn't exist in $PATH.", cmd);
                return Err("".to_string());
            }

            // the following assumes /usr/local/bin is where commands are located when installed locally.
            // maybe add user-configurable path?
            let path: PathBuf = PathBuf::new().join("/usr/local/bin").join(cmd);

            if path.exists() {
                return Ok(path);
            } else {
                error!("{} doesn't exist in $PATH and local $PATH", cmd);
                return Err("".to_string());
            }
        }
    }
}
