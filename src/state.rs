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

use std::sync::RwLock;
#[cfg(target_os = "macos")]
use std::sync::{
    mpsc::{Receiver, Sender},
    Mutex,
};

use freya::prelude::*;
#[cfg(target_os = "macos")]
use once_cell::sync::Lazy;
use once_cell::sync::OnceCell;

#[cfg(target_os = "macos")]
use crate::MenuEvent;
use crate::Views;

pub static APP_VIEW: GlobalSignal<Views> = GlobalSignal::new(|| Views::EditorView);
pub static FILE_BROWSER_VISIBLE: GlobalSignal<bool> = GlobalSignal::new(|| false);

pub static LINE_NUMBER_WIDTH: GlobalSignal<f32> = GlobalSignal::new(|| 80.0);
pub static TITLE_BAR_HEIGHT: GlobalSignal<f32> = GlobalSignal::new(|| 30.0);
pub static STATUS_BAR_HEIGHT: GlobalSignal<f32> = GlobalSignal::new(|| 30.0);

pub static EDITOR_LINES: GlobalSignal<usize> = GlobalSignal::new(|| 1);
pub static LINE_HEIGHT: GlobalSignal<f32> = GlobalSignal::new(|| 30.0);
pub static CHAR_WIDTH: GlobalSignal<f32> = GlobalSignal::new(|| 12.05);
pub static SELECTED_LINE: GlobalSignal<usize> = GlobalSignal::new(|| 1);

pub static CARET_COLUMN: GlobalSignal<usize> = GlobalSignal::new(|| 0);
pub static CARET_LINE: GlobalSignal<usize> = GlobalSignal::new(|| 0);

pub static SCALE_FACTOR: GlobalSignal<f64> = GlobalSignal::new(|| 1.0);
pub static TAB_SIZE: GlobalSignal<u8> = GlobalSignal::new(|| 4);

pub static LARGEST_LINE_WIDTH: RwLock<f32> = RwLock::new(1.0);

#[cfg(target_os = "macos")]
pub static MENU_EVENT_SENDER: Lazy<Mutex<Option<Sender<MenuEvent>>>> =
    Lazy::new(|| Mutex::new(None));

#[cfg(target_os = "macos")]
pub static MENU_EVENT_RECEIVER: Lazy<Mutex<Option<Receiver<MenuEvent>>>> =
    Lazy::new(|| Mutex::new(None));

thread_local! {
    pub static WINDOW: OnceCell<*mut Window> = const { OnceCell::new() };
}
