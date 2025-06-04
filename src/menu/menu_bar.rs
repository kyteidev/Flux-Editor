/*
Copyright © 2024-2025 kyteidev.

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

use {
    crate::{
        menu::menu_actions::{about, toggle_file_browser},
        state::MENU_EVENT_RECEIVER,
        MenuEvent,
    },
    freya::prelude::spawn,
    std::{sync::mpsc::TryRecvError, time::Duration},
    tokio::time::interval,
    tracing::error,
};
#[cfg(target_os = "macos")]
use {
    freya::events::{Code, Modifiers},
    muda::{accelerator::Accelerator, Menu, MenuItem, PredefinedMenuItem, Submenu},
};

#[cfg(target_os = "macos")]
pub fn init_menu_handler() {
    muda::MenuEvent::set_event_handler(Some(Box::new(move |event: muda::MenuEvent| {
        use crate::state::MENU_EVENT_SENDER;

        if let Some(sender) = MENU_EVENT_SENDER.lock().unwrap().as_ref() {
            let _ = sender.send(crate::MenuEvent::Event(event));
        }
    })));
}

pub fn init_menu_listener() {
    spawn(async move {
        let mut interval = interval(Duration::from_millis(200));
        loop {
            interval.tick().await;
            if let Some(receiver) = MENU_EVENT_RECEIVER.lock().unwrap().as_ref() {
                match receiver.try_recv() {
                    Ok(MenuEvent::Event(menu_event)) => {
                        println!("RECEIVED: {}", menu_event.id().0);
                        match menu_event.id().0.as_str() {
                            "3" => about(),
                            "38" => toggle_file_browser(),
                            _ => {}
                        }
                    }
                    Err(TryRecvError::Empty) => {}
                    Err(TryRecvError::Disconnected) => {
                        error!("Menu receiver disconnected.");
                        break;
                    }
                }
            }
        }
    });
}

#[cfg(target_os = "macos")]
pub fn init_menu() -> Menu {
    let menu = Menu::new();

    let app = Submenu::with_items(
        "Flux Editor",
        true,
        &[
            &MenuItem::new("About", true, None),
            &MenuItem::new("Check for Updates", true, None),
            &PredefinedMenuItem::separator(),
            &MenuItem::new(
                "Settings",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::Comma)),
            ),
            &PredefinedMenuItem::separator(),
            &PredefinedMenuItem::services(Some("Services")),
            &PredefinedMenuItem::separator(),
            &PredefinedMenuItem::quit(Some("Quit")),
        ],
    )
    .unwrap();

    let file = Submenu::with_items(
        "File",
        true,
        &[
            &MenuItem::new(
                "New File",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::KeyN)),
            ),
            &PredefinedMenuItem::separator(),
            &MenuItem::new(
                "Open...",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::KeyO)),
            ),
            &MenuItem::new("Open Recent...", true, None),
            &PredefinedMenuItem::separator(),
            &MenuItem::new(
                "Save",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::KeyS)),
            ),
            &MenuItem::new(
                "Save As...",
                true,
                Some(Accelerator::new(
                    Some(Modifiers::META | Modifiers::SHIFT),
                    Code::KeyS,
                )),
            ),
            &MenuItem::new(
                "Save All",
                true,
                Some(Accelerator::new(
                    Some(Modifiers::META | Modifiers::ALT),
                    Code::KeyS,
                )),
            ),
        ],
    )
    .unwrap();

    let edit = Submenu::with_items(
        "Edit",
        true,
        &[
            &PredefinedMenuItem::undo(Some("Undo")),
            &PredefinedMenuItem::redo(Some("Redo")),
            &PredefinedMenuItem::separator(),
            &PredefinedMenuItem::cut(Some("Cut")),
            &PredefinedMenuItem::copy(Some("Copy")),
            &PredefinedMenuItem::paste(Some("Paste")),
            &PredefinedMenuItem::select_all(Some("Select All")),
            &PredefinedMenuItem::separator(),
            &MenuItem::new(
                "Find",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::KeyF)),
            ),
            &MenuItem::new(
                "Replace",
                true,
                Some(Accelerator::new(
                    Some(Modifiers::META | Modifiers::ALT),
                    Code::KeyF,
                )),
            ),
        ],
    )
    .unwrap();

    let view = Submenu::with_items(
        "View",
        true,
        &[
            &MenuItem::new("Themes", true, None),
            &PredefinedMenuItem::separator(),
            &MenuItem::new(
                "Toggle Search",
                true,
                Some(Accelerator::new(Some(Modifiers::ALT), Code::Space)),
            ),
            &MenuItem::new(
                "Toggle File Browser",
                true,
                Some(Accelerator::new(
                    Some(Modifiers::META | Modifiers::SHIFT),
                    Code::KeyE,
                )),
            ),
            &MenuItem::new(
                "Toggle Terminal",
                true,
                Some(Accelerator::new(
                    Some(Modifiers::META | Modifiers::SHIFT),
                    Code::KeyT,
                )),
            ),
            &PredefinedMenuItem::separator(), // macOS inserts a "Enter Full Screen" item into View menu
        ],
    )
    .unwrap();

    let help = Submenu::with_items(
        "Help",
        true,
        &[
            &MenuItem::new("View Logs", true, None),
            &Submenu::with_items(
                "Legal Notices",
                true,
                &[
                    &MenuItem::new("License", true, None),
                    &MenuItem::new("Third Party Licenses", true, None),
                ],
            )
            .unwrap(),
        ],
    )
    .unwrap();

    menu.append_items(&[&app, &file, &edit, &view, &help])
        .unwrap();

    menu
}
