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
use std::sync::{Arc, Mutex};
use std::thread;

use log::{error, info};
use tauri::Manager;
use uuid::Uuid;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

pub struct CommandController {
    commands: Arc<Mutex<HashMap<Uuid, Child>>>,
}

impl CommandController {
    pub fn new() -> Self {
        CommandController {
            commands: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn run_command(&self, command: &str, args: Vec<String>, app: tauri::AppHandle) -> Uuid {
        let mut child = Command::new(command)
            .args(args)
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to execute process");

        let id = Uuid::new_v4();

        if let Some(stdout) = child.stdout.take() {
            let lines = BufReader::new(stdout).lines();

            thread::spawn(move || {
                for line in lines {
                    app.emit_all(
                        "flux:cmd-output",
                        Payload {
                            message: line.unwrap().into(),
                        },
                    )
                    .map_err(|e| error!("Failed to emit event: {}", e))
                    .unwrap();
                }
            });
        }

        self.commands.lock().unwrap().insert(id, child);
        id
    }

    pub fn abort_command(&self, id: Uuid) {
        let mut commands = self.commands.lock().unwrap();
        if let Some(mut child) = commands.remove(&id) {
            match child.kill() {
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
