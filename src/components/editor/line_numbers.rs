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

use crate::state::{EDITOR_LINES, LINE_HEIGHT};
use crate::BG_200;

#[derive(Props, Clone, PartialEq)]
pub struct Props {
    scroll_controller: ScrollController,
}

#[allow(non_snake_case)]
pub fn LineNumbers(props: Props) -> Element {
    let line_height = *LINE_HEIGHT.read();
    let editor_lines = *EDITOR_LINES.read();

    rsx!(rect {
        width: "80",
        height: "fill",
        background: "{BG_200}",
        VirtualScrollView {
            length: editor_lines,
            item_size: line_height,
            height: "100%",
            width: "100%",
            direction: "vertical",
            show_scrollbar: false,
            scroll_controller: props.scroll_controller,
            builder: move |index, _: &Option<()>| {
                rsx! {
                    rect{
                        height: "{line_height}",
                        main_align: "center",
                        cross_align: "center",
                        font_family: "Menlo, Monaco",
                        padding: "0 20",
                        label {
                            color: "white",
                            font_size: "20",
                            line_height: "1.5",
                            text_align: "right",
                            width: "100%",
                            "{index + 1}"
                        }
                    }
                }
            }
        }
    })
}
