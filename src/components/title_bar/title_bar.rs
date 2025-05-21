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

use freya::prelude::*;

use crate::get_colors;

#[allow(non_snake_case)]
pub fn TitleBar() -> Element {
    let bg_color = get_colors("bg-200");
    let border_color = get_colors("bg-100");

    rsx!(
        WindowDragArea {
            rect {
                width: "100%",
                height: "30",
                background: "{bg_color}",
                border: "0 0 2 0 inner {border_color}"
            }
        }
    )
}
