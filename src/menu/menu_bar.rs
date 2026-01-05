/*
Copyright © 2024-2026 kyteidev.

This file is part of Fluxium.

Fluxium is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

Fluxium is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Fluxium. If not, see
<https://www.gnu.org/licenses/>.
*/

use {
    crate::{
        menu::menu_actions::{about, toggle_file_browser},
        state::MENU_EVENT_RECEIVER,
        MenuEvent,
    },
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

#[cfg(target_os = "macos")]
pub fn handle_menu_events() {
    if let Some(receiver) = MENU_EVENT_RECEIVER.lock().unwrap().as_ref() {
        while let Ok(MenuEvent::Event(menu_event)) = receiver.try_recv() {
            match menu_event.id().0.as_str() {
                "about" => about(),
                "file_browser" => toggle_file_browser(),
                _ => {
                    error!("Received unknown event: {}", menu_event.id().0.as_str());
                }
            }
        }
    }
}

#[cfg(target_os = "macos")]
pub fn init_menu() -> Menu {
    let menu = Menu::new();

    let app = Submenu::with_items(
        "Fluxium",
        true,
        &[
            &MenuItem::with_id("about", "About", true, None),
            &MenuItem::with_id("update", "Check for Updates", true, None),
            &PredefinedMenuItem::separator(),
            &MenuItem::with_id(
                "settings",
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
            &MenuItem::with_id(
                "new_file",
                "New File",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::KeyN)),
            ),
            &PredefinedMenuItem::separator(),
            &MenuItem::with_id(
                "open",
                "Open...",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::KeyO)),
            ),
            &MenuItem::with_id("open_recent", "Open Recent...", true, None),
            &PredefinedMenuItem::separator(),
            &MenuItem::with_id(
                "save",
                "Save",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::KeyS)),
            ),
            &MenuItem::with_id(
                "save_as",
                "Save As...",
                true,
                Some(Accelerator::new(
                    Some(Modifiers::META | Modifiers::SHIFT),
                    Code::KeyS,
                )),
            ),
            &MenuItem::with_id(
                "save_all",
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
            &MenuItem::with_id(
                "find",
                "Find",
                true,
                Some(Accelerator::new(Some(Modifiers::META), Code::KeyF)),
            ),
            &MenuItem::with_id(
                "replace",
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
            &MenuItem::with_id("themes", "Themes", true, None),
            &PredefinedMenuItem::separator(),
            &MenuItem::with_id(
                "search_bar",
                "Toggle Search",
                true,
                Some(Accelerator::new(Some(Modifiers::ALT), Code::Space)),
            ),
            &MenuItem::with_id(
                "file_browser",
                "Toggle File Browser",
                true,
                Some(Accelerator::new(
                    Some(Modifiers::META | Modifiers::SHIFT),
                    Code::KeyE,
                )),
            ),
            &MenuItem::with_id(
                "terminal",
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
                    &MenuItem::with_id("license", "License", true, None),
                    &MenuItem::with_id("third_party_licenses", "Third Party Licenses", true, None),
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
