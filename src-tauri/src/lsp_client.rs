use std::{
    fs,
    io::{Read, Write},
    path::PathBuf,
    process::{Child, Command, Stdio},
    sync::{mpsc, Arc, Mutex},
    thread,
};

lazy_static::lazy_static! {
    static ref LANG_SERVER: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
}

pub fn install_server(dir: PathBuf, lang: &str) {
    // TODO: detect if user is connected to internet. if not, abort. (could also implement this using ts)
    println!("Installing language server to dir {:?}", dir);
    match lang {
        "typescript" => {
            let ts_dir = dir.join("typescript");
            let node_dir = ts_dir.join("node_modules");
            if !node_dir.exists() {
                fs::create_dir_all(node_dir)
                    .map_err(|e| eprintln!("Error creating directory: {}", e))
                    .ok();
            }
            Command::new("npm")
                .args([
                    "install",
                    "--prefix",
                    ts_dir.to_str().unwrap(),
                    "@vtsls/language-server",
                ])
                .current_dir(ts_dir)
                .output()
                .map_err(|e| format!("Failed to execute command: {}", e))
                .unwrap();
        }
        _ => {}
    }
}

#[tauri::command]
pub fn start_server(dir: PathBuf, lang: &str) -> Result<Child, String> {
    println!("Starting server in {:?}", dir.clone());

    let command;
    let mut args: Vec<String> = Vec::new();

    match lang {
        "typescript" => {
            command = "node";
            args.push(
                dir.join("typescript")
                    .join("node_modules")
                    .join("@vtsls")
                    .join("language-server")
                    .join("bin")
                    .join("vtsls.js")
                    .to_str()
                    .unwrap_or("Invalid unicode")
                    .to_string(),
            );
            args.push("--stdio".to_string());
        }
        _ => {
            return Err("Invalid language".to_string());
        }
    }

    let child = Command::new(command)
        .args(args)
        .current_dir(dir.join("typescript"))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start language server: {}", e))?;

    println!("PID: {}", child.id());

    Ok(child)
}

pub fn init_server(path: PathBuf, lang: &str) {
    let ls_clone = LANG_SERVER.clone();
    let mut lang_server = ls_clone.lock().unwrap();
    /* TODO: Make server only start once. Problem: once the response is received and read, language server process exits,
             probably because stdin and/or stdout closed. Constantly reading stdout in a loop in this function to not close
             stdout is not working at the moment. Restarting server isn't a really big bottleneck, since the server starts
             nearly instantaneously. There is about 0.3s delay between starting server and receiving response in frontend.

    if lang_server.is_none() {
        let child =
            start_server(path, lang).expect("Failed to start language server from function");
        *lang_server = Some(child);
    }

    */

    let child = start_server(path, lang).expect("Failed to start language server from function");
    *lang_server = Some(child); // restarts server everytime a request is sent.

    println!("Server started!");
}

pub fn send_request(request: &str) -> Result<String, String> {
    let ls_clone = LANG_SERVER.clone();
    let mut lang_server = ls_clone.lock().unwrap();

    let response = if let Some(ref mut child) = *lang_server {
        let mut stdin = child.stdin.take().expect("Failed to open stdin");
        let mut stdout = child.stdout.take().expect("Failed to open stdout");

        let content_length = request.len();
        let message = format!("Content-Length: {}\r\n\r\n{}", content_length, request);

        stdin
            .write_all(message.as_bytes())
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        stdin.flush().unwrap();

        println!("Request sent");

        let (tx, rx) = mpsc::channel();

        let handle = thread::spawn(move || {
            let mut initial_buffer = vec![0; 1024];
            match stdout.read(&mut initial_buffer) {
                Ok(n) => {
                    if n > 0 {
                        let initial_response =
                            String::from_utf8_lossy(&initial_buffer[..n]).to_string();
                        if let Some(index) = initial_response.find("\r\n\r\n") {
                            let headers = &initial_response[..index];
                            if let Some(header) = headers
                                .split('\n')
                                .find(|line| line.starts_with("Content-Length: "))
                            {
                                let header_length_str =
                                    header.trim_start_matches("Content-Length: ").trim();
                                if let Ok(total_length) = header_length_str.parse::<usize>() {
                                    let mut response = initial_response[index + 4..].to_string(); // Start after the header
                                    let mut response_length = response.len();
                                    while response_length < total_length {
                                        let mut buffer = vec![0; 1024];
                                        match stdout.read(&mut buffer) {
                                            Ok(n) => {
                                                if n == 0 {
                                                    break;
                                                } // EOF or error
                                                response.push_str(&String::from_utf8_lossy(
                                                    &buffer[..n],
                                                ));
                                                response_length += n;
                                            }
                                            Err(e) => {
                                                let _ = tx.send(format!(
                                                    "Error reading from stdout: {}",
                                                    e
                                                ));
                                                return;
                                            }
                                        }
                                    }
                                    let _ = tx.send(response);
                                    return;
                                }
                            }
                        }
                        let _ = tx.send("Failed to parse length from response.".to_string());
                    }
                }
                Err(e) => {
                    let _ = tx.send(format!("Error reading from stdout: {}", e));
                }
            }
        });

        let _ = handle.join().expect("Failed to join reader thread");

        let raw_response = rx
            .iter()
            .next()
            .unwrap_or_else(|| "Failed to receive a complete response.".to_string());

        let parsed_response: Result<String, String> = Ok(raw_response);

        parsed_response
    } else {
        Ok("".to_string())
    };

    response
}
