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
