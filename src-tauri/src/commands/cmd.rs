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

use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

use log::{error, info};
use shared_child::SharedChild;
use tauri::Emitter;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

pub struct CommandController {
    commands: Arc<Mutex<HashMap<u64, Arc<Mutex<SharedChild>>>>>,
    next_id: Arc<Mutex<u64>>,
}

impl CommandController {
    pub fn new() -> Self {
        CommandController {
            commands: Arc::new(Mutex::new(HashMap::new())),
            next_id: Arc::new(Mutex::new(1)),
        }
    }

    pub fn run_command(
        &self,
        command: &str,
        args: Vec<String>,
        dir: PathBuf,
        app: tauri::AppHandle,
    ) -> u64 {
        let mut cmd = Command::new(command);
        cmd.args(args)
            .current_dir(dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .env("FORCE_COLOR", "1");

        let shared_child = match SharedChild::spawn(&mut cmd) {
            Ok(child) => Arc::new(Mutex::new(child)),
            Err(e) => {
                error!("Failed to spawn command: {}", e);
                return 0;
            }
        };

        let mut id_manager = self.next_id.lock().unwrap();
        let id = *id_manager;
        *id_manager += 1;

        let (tx_stdout, rx) = mpsc::channel();
        let tx_stderr = tx_stdout.clone();

        if let Some(stdout) = shared_child.clone().lock().unwrap().take_stdout() {
            let app_clone = app.clone();
            let lines = BufReader::new(stdout).lines();

            thread::spawn(move || {
                for line in lines {
                    app_clone
                        .emit(
                            "flux:event:cmdOutput",
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
                        .emit(
                            "flux:event:cmdOutput",
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

        let app_clone = app.clone();
        thread::spawn(move || {
            rx.recv().unwrap();
            rx.recv().unwrap();

            app_clone
                .emit(
                    "flux:event:cmdOutput",
                    Payload {
                        message: "flux:event:cmdOutputCompleted".into(),
                    },
                )
                .map_err(|e| error!("Failed to emit completion event: {}", e))
                .unwrap();
        });

        self.commands.lock().unwrap().insert(id, shared_child);
        id
    }

    pub fn abort_command(&self, id: u64) {
        let mut commands = self.commands.lock().unwrap();
        if let Some(child) = commands.remove(&id) {
            match child.lock().unwrap().kill() {
                Ok(_) => info!("Command with ID {} aborted successfully.", id),
                Err(e) => error!("Failed to abort command {}: {}", id, e),
            }
        }
    }

    pub fn abort_all_commands(&self) {
        let mut commands = self.commands.lock().unwrap();
        for (id, child) in commands.drain() {
            match child.lock().unwrap().kill() {
                Ok(_) => info!("Command with ID {} aborted successfully.", id),
                Err(e) => error!("Failed to abort command {}: {}", id, e),
            }
        }
        info!("Aborted all commands successfully.")
    }
}

lazy_static::lazy_static! {
    static ref COMMAND_CONTROLLER: Mutex<CommandController> = Mutex::new(CommandController::new());
}

pub fn get_cmd_controller() -> &'static Mutex<CommandController> {
    &COMMAND_CONTROLLER
}

#[tauri::command(async)]
pub fn spawn_command(
    command: &str,
    args: Vec<String>,
    dir: PathBuf,
    app: tauri::AppHandle,
) -> String {
    let controller = get_cmd_controller().lock().unwrap_or_else(|e| {
        error!("Failed to get command controller: {}", e);
        e.into_inner()
    });
    let id = controller.run_command(command, args, dir, app.clone());

    id.to_string()
}

#[tauri::command(async)]
pub fn abort_command(id: &str) {
    let id_u64 = match id.parse::<u64>() {
        Ok(n) => n,
        Err(e) => {
            error!("Failed to parse '{}' to u64: {}", id, e);
            return;
        }
    };

    let controller = get_cmd_controller().lock().unwrap();
    controller.abort_command(id_u64);
}

#[tauri::command(async)]
pub fn abort_all_commands() {
    let controller = get_cmd_controller().lock().unwrap();
    controller.abort_all_commands();
}
