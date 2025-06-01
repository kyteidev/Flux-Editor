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

#[cfg(target_os = "macos")]
use {
    freya::events::{Code, Modifiers},
    muda::{accelerator::Accelerator, Menu, MenuEvent, MenuItem, PredefinedMenuItem, Submenu},
};

#[cfg(target_os = "macos")]
pub fn init_menu_handler() {
    MenuEvent::set_event_handler(Some(Box::new(|event: MenuEvent| {
        println!("Menu event: {:?}", event.id());
    })));
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
