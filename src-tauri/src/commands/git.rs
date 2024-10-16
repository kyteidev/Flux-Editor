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

use std::process::Command;

use log::error;

async fn is_git_installed() -> bool {
    let is_git_installed = Command::new("git")
        .arg("--version")
        .output()
        .map_err(|e| {
            error!("Failed to check git install: {}", e);
            format!("Failed to check git install: {}", e)
        })
        .map_or(false, |output| output.status.success());

    if !is_git_installed {
        return false;
    } else {
        return true;
    }
}

async fn is_git_repo(dir: String) -> bool {
    let output = Command::new("git")
        .args(&["rev-parse", "--is-inside-work-tree"])
        .current_dir(dir)
        .output()
        .map_err(|e| {
            error!("Failed to check if directory is a git repo: {}", e);
            false
        })
        .map_or(false, |output| output.status.success());

    output
}

#[tauri::command]
pub async fn clone_repo(url: String, path: String) -> Result<(), String> {
    let git_installed = is_git_installed().await;
    if git_installed {
        let output = Command::new("git")
            .args(&["clone", &url, &path])
            .output()
            .map_err(|e| {
                error!("Failed to execute git clone: {}", e);
                format!("Failed to execute git clone: {}", e)
            })?;

        if output.status.success() {
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);

            let filtered_error_message: String = if stderr
                .lines()
                .next()
                .map_or(false, |line| line.starts_with("Cloning into"))
            {
                stderr.lines().skip(1).collect::<Vec<&str>>().join("\n")
            } else {
                stderr.to_string()
            };

            Err(format!("{}", filtered_error_message))
        }
    } else {
        Err("Git is not installed".to_string())
    }
}

#[tauri::command]
pub async fn current_branch(dir: String) -> Result<String, String> {
    let git_installed = is_git_installed().await;
    if git_installed {
        let is_git_repo = is_git_repo(dir.clone()).await;
        if is_git_repo {
            let output = Command::new("git")
                .args(["branch", "--show-current"])
                .current_dir(dir)
                .output()
                .map_err(|e| {
                    error!("Failed to check current git branch: {}", e);
                    format!("Failed to check current git branch: {}", e)
                })?;

            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                Err("".to_string())
            }
        } else {
            Err("flux:git:not_repo".to_string())
        }
    } else {
        Err("Git is not installed".to_string())
    }
}
