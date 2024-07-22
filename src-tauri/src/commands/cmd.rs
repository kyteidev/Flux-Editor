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

use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

use log::{error, info};
use shared_child::SharedChild;
use tauri::Manager;
use uuid::Uuid;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

pub struct CommandController {
    commands: Arc<Mutex<HashMap<Uuid, Arc<Mutex<SharedChild>>>>>,
}

impl CommandController {
    pub fn new() -> Self {
        CommandController {
            commands: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn run_command(&self, command: &str, args: Vec<String>, app: tauri::AppHandle) -> Uuid {
        let mut cmd = Command::new(command);
        cmd.args(args).stdout(Stdio::piped()).stderr(Stdio::piped());

        /* .spawn()
        .map_err(|e| {
            error!("Failed to execute process {}: {}", command, e);
        })
        .unwrap(); */

        let shared_child = Arc::new(Mutex::new(SharedChild::spawn(&mut cmd).unwrap()));
        let id = Uuid::new_v4();

        let (tx_stdout, rx) = mpsc::channel();
        let tx_stderr = tx_stdout.clone();

        if let Some(stdout) = shared_child.clone().lock().unwrap().take_stdout() {
            let app_clone = app.clone();
            let lines = BufReader::new(stdout).lines();

            thread::spawn(move || {
                for line in lines {
                    app_clone
                        .emit_all(
                            "flux:cmd-output",
                            Payload {
                                message: line.unwrap_or_else(|e| {
                                    error!("{}", e);
                                    "Error reading line from stdout".into()
                                }),
                            },
                        )
                        .map_err(|e| error!("Failed to emit event: {}", e))
                        .unwrap();
                }
                tx_stdout.send(true).unwrap();
            });
        }

        if let Some(stderr) = shared_child.clone().lock().unwrap().take_stderr() {
            let app_clone = app.clone();
            let lines = BufReader::new(stderr).lines();

            thread::spawn(move || {
                for line in lines {
                    app_clone
                        .emit_all(
                            "flux:cmd-output",
                            Payload {
                                message: line.unwrap_or_else(|e| {
                                    error!("{}", e);
                                    "Error reading line from stdout".into()
                                }),
                            },
                        )
                        .map_err(|e| error!("Failed to emit stderr event: {}", e))
                        .unwrap();
                }
                tx_stderr.send(true).unwrap();
            });
        }
        /*
        let app_clone = app.clone();
        let shared_child_clone = shared_child.clone();
        thread::spawn(move || {
            let wait_result = shared_child_clone.lock().unwrap().wait();
            match wait_result {
                Ok(_) => {
                    // Handle the child's exit status, e.g., log it or emit another event.
                    app_clone
                        .emit_all(
                            "flux:cmd-output",
                            Payload {
                                message: "flux:output-completed".into(),
                            },
                        )
                        .map_err(|e| error!("Failed to emit completion event: {}", e))
                        .unwrap();
                    info!("COMPLETED");
                }
                Err(e) => error!("Failed to wait on child process: {}", e),
            }
        });
        */

        let app_clone = app.clone();
        thread::spawn(move || {
            rx.recv().unwrap();
            rx.recv().unwrap();

            app_clone
                .emit_all(
                    "flux:cmd-output",
                    Payload {
                        message: "flux:output-completed".into(),
                    },
                )
                .map_err(|e| error!("Failed to emit completion event: {}", e))
                .unwrap();
        });

        self.commands.lock().unwrap().insert(id, shared_child);
        id
    }

    pub fn abort_command(&self, id: Uuid) {
        let mut commands = self.commands.lock().unwrap();
        if let Some(child) = commands.remove(&id) {
            match child.lock().unwrap().kill() {
                Ok(_) => info!("Command {} aborted successfully.", id),
                Err(e) => error!("Failed to abort command {}: {}", id, e),
            }
        }
    }
}

lazy_static::lazy_static! {
    static ref COMMAND_CONTROLLER: Mutex<CommandController> = Mutex::new(CommandController::new());
}

pub fn get_cmd_controller() -> &'static Mutex<CommandController> {
    &COMMAND_CONTROLLER
}

#[tauri::command(async)]
pub fn spawn_command(command: &str, args: Vec<String>, app: tauri::AppHandle) -> String {
    let controller = get_cmd_controller().lock().unwrap_or_else(|e| {
        error!("Failed to get command controller: {}", e);
        e.into_inner()
    });
    let id = controller.run_command(command, args, app.clone());

    id.to_string()
}

#[tauri::command(async)]
pub fn abort_command(id: String) {
    let controller = get_cmd_controller().lock().unwrap();

    let uuid = match Uuid::parse_str(&id) {
        Ok(uuid) => uuid,
        Err(e) => {
            error!("Error parsing UUID: {}", e);
            return;
        }
    };

    controller.abort_command(uuid);
}
