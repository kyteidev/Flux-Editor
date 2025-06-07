/*
Copyright © 2024-2025 kyteidev.

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

use freya::prelude::Readable;
use rfd::{MessageButtons, MessageDialog};

use crate::state::FILE_BROWSER_VISIBLE;

pub fn about() {
    let os = std::env::consts::OS;
    let version = env!("CARGO_PKG_VERSION");

    let licenses_location = if os == "macos" {
        "Help > Legal Notices"
    } else {
        "Menu > Help"
    };

    MessageDialog::new()
        .set_title(format!("Fluxium v{}", version))
        .set_description(format!("{}{}{}", "Copyright © 2024-2025 kyteidev.\nLicensed under the GNU General Public License v3.0.\n\nSee ", licenses_location,  " for license notices."))
        .set_buttons(MessageButtons::Ok)
        .show();
}

pub fn toggle_file_browser() {
    let visible = *FILE_BROWSER_VISIBLE.peek();
    *FILE_BROWSER_VISIBLE.write() = !visible;
}
