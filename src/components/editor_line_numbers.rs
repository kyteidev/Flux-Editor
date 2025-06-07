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

use crate::state::{EDITOR_LINES, LINE_HEIGHT, LINE_NUMBER_WIDTH, SELECTED_LINE};
use crate::{BG_100, BG_200, CONTENT};

#[derive(Props, Clone, PartialEq)]
pub struct Props {
    scroll_controller: ScrollController,
}

#[allow(non_snake_case)]
pub fn LineNumbers(props: Props) -> Element {
    let line_number_width = *LINE_NUMBER_WIDTH.read();

    let line_height = *LINE_HEIGHT.read();
    let editor_lines = *EDITOR_LINES.read();

    rsx!(rect {
        width: "{line_number_width}",
        height: "100%",
        background: "{BG_200}",
        VirtualScrollView {
            length: editor_lines + 1,
            item_size: line_height,
            height: "100%",
            width: "100%",
            direction: "vertical",
            show_scrollbar: false,
            scroll_controller: props.scroll_controller,
            builder: move |index, _: &Option<()>| {
                // add extra space at the end
                if index == editor_lines {
                    return rsx! {};
                }

                // highlight active line
                let selected_line = *SELECTED_LINE.read();

                let is_line_selected = selected_line == index;
                let background_color = *BG_100.read();
                let line_background = if is_line_selected {
                    background_color
                } else {
                    "none"
                };

                rsx! {
                    rect{
                        height: "{line_height}",
                        main_align: "center",
                        padding: "0 20 0",
                        background: "{line_background}",
                        label {
                            color: *CONTENT.read(),
                            font_size: "20",
                            font_family: "Menlo, Monaco",
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
