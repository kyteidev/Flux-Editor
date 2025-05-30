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

use crate::{
    state::{CARET_COLUMN, CARET_LINE},
    BG_100, BG_200,
};

#[allow(non_snake_case)]
pub fn StatusBar() -> Element {
    let border_color = *BG_100.read();
    rsx! {
        rect {
            width: "100%",
            height: "30",
            background: *BG_200.read(),
            padding: "4",
            border: "2 0 0 0 inner {border_color}",
            direction: "horizontal",
            font_size: "14",
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
        rect {
            width: "auto",
            height: "22",
            corner_radius: "4",
            background: *BG_100.read(),
            padding: "2",
            main_align: "center",
            cross_align: "center",
            label {
                color: "white",
                "{caret_line}:{caret_column}"
            }
        }
    }
}
