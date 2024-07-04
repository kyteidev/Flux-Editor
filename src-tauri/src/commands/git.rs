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
            let error_message = String::from_utf8_lossy(&output.stderr);
            error!("Failed to clone repository: {}", error_message);
            Err(format!("Failed to clone repository: {}", error_message))
        }
    } else {
        Err("Git is not installed".to_string())
    }
}
