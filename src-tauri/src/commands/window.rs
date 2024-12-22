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

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;
use tauri::WebviewWindowBuilder;

use crate::utils::time::time_ms;
#[cfg(target_os = "macos")]
use crate::window_ext::WindowExt;

#[cfg(any(windows))]
use window_shadows::set_shadow;

#[tauri::command]
pub async fn new_window(app: tauri::AppHandle) {
    let id = time_ms();

    #[cfg(target_os = "macos")]
    {
        let win = WebviewWindowBuilder::new(
            &app,
            id.to_string(),
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("Flux Editor")
        .decorations(true)
        .hidden_title(true)
        .title_bar_style(TitleBarStyle::Overlay)
        .inner_size(960., 620.)
        .min_inner_size(660., 450.)
        .build()
        .unwrap();

        win.set_window_controls_pos(10., 12.5);
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _win = WindowBuilder::new(
            &app,
            id.to_string(),
            tauri::WindowUrl::App("index.html".into()),
        )
        .title("Flux Editor")
        .decorations(false)
        .inner_size(960., 620.)
        .min_inner_size(660., 450.)
        .build()
        .unwrap();

        #[cfg(any(windows))]
        set_shadow(&_win, true).unwrap();
    }
}
