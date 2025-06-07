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

use freya::prelude::*;

use crate::{
    components::status_bar_item::StatusBarItem,
    state::{CARET_COLUMN, CARET_LINE, STATUS_BAR_HEIGHT},
    BG_100, BG_200, CONTENT,
};

#[allow(non_snake_case)]
pub fn StatusBar() -> Element {
    let border_color = *BG_100.read();
    rsx! {
        rect {
            width: "100%",
            height: *STATUS_BAR_HEIGHT.read(),
            background: *BG_200.read(),
            padding: "4",
            border: "2 0 0 0 inner {border_color}",
            direction: "horizontal",
            font_size: "12",
            cross_align: "center",
            rect {
                width: "50%",
                main_align: "end",
                direction: "horizontal",
            }
            rect {
                width: "50%",
                main_align: "end",
                direction: "horizontal",
                CaretPosition {}
            }

        }
    }
}

#[allow(non_snake_case)]
fn CaretPosition() -> Element {
    let caret_line = *CARET_LINE.read() + 1;
    let caret_column = *CARET_COLUMN.read() + 1;

    rsx! {
        StatusBarItem {
            label {
                color: *CONTENT.read(),
                "{caret_line}:{caret_column}"
            }
        }
    }
}
