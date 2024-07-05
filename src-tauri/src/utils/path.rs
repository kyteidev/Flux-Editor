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
