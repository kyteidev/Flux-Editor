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

use freya::prelude::*;

use crate::{get_scale_factor, state::TITLE_BAR_HEIGHT, BG_100, BG_200};

#[component]
pub fn TitleBar() -> Element {
    let title_bar_height = *TITLE_BAR_HEIGHT.read();

    let bg_color = *BG_200.read();
    let border_color = *BG_100.read();

    rsx!(
        WindowDragArea {
            rect {
                width: "100%",
                height: "{title_bar_height}",
                background: "{bg_color}",
                border: "0 0 2 0 inner {border_color}",
                onmouseup: move |_| {
                    get_scale_factor();
                }
            }
        }
    )
}
