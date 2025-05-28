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
use objc2::{msg_send, runtime::AnyObject};

#[cfg(target_os = "macos")]
pub unsafe fn set_transparent_titlebar(ns_window: *mut AnyObject) {
    let _: () = msg_send![ns_window, setTitlebarAppearsTransparent: true];

    let mut style_mask: u64 = msg_send![ns_window, styleMask];

    const NS_FULL_SIZE_CONTENT_VIEW_WINDOW_MASK: u64 = 1 << 15;
    style_mask |= NS_FULL_SIZE_CONTENT_VIEW_WINDOW_MASK;
    let _: () = msg_send![ns_window, setStyleMask: style_mask];

    let _: () = msg_send![ns_window, setTitleVisibility: 1i64];

    let _: () = msg_send![ns_window, setTitlebarAppearsTransparent: true];
}
