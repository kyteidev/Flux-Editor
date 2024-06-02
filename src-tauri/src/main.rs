// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
async fn clone_repo(url: String, path: String) -> Result<(), String> {
    let is_git_installed = Command::new("git")
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))
        .map_or(false, |output| output.status.success());

    if !is_git_installed {
        return Err("Git is not installed".to_string());
    }

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
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![clone_repo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
