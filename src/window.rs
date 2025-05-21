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
use cocoa::{
    appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility},
    base::id,
};

#[cfg(target_os = "macos")]
pub fn set_transparent_titlebar(ns_window: id) {
    unsafe {
        NSWindow::setTitlebarAppearsTransparent_(ns_window, cocoa::base::YES);
        let mut style_mask = ns_window.styleMask();
        style_mask.set(NSWindowStyleMask::NSFullSizeContentViewWindowMask, true);

        ns_window.setStyleMask_(style_mask);

        ns_window.setTitleVisibility_(NSWindowTitleVisibility::NSWindowTitleHidden);

        ns_window.setTitlebarAppearsTransparent_(cocoa::base::YES);
    }
}
