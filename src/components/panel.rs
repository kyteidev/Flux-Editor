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

use crate::{state::TITLE_BAR_HEIGHT, BG_200};

#[component]
pub fn Panel(visible: bool, children: Element) -> Element {
    let animation = use_animation_with_dependencies(&visible, move |_conf, visible| {
        let (start, end) = if visible { (-350., 0.) } else { (0., -350.) };
        AnimNum::new(start, end)
            .time(256)
            .ease(Ease::InOut)
            .function(Function::Quart)
    });

    use_memo(use_reactive(&visible, move |_| {
        animation.run(AnimDirection::Forward)
    }));

    let pos = animation.get().read().read();

    if !visible && !animation.is_running() {
        return rsx! {};
    }

    let title_bar_height = *TITLE_BAR_HEIGHT.read() as i32;
    let offset_top = title_bar_height + 4;

    rsx! {
        rect {
            offset_x: "{pos}",
            position: "global",
            position_top: "{offset_top}",
            position_left: "10",
            rect {
                width: "30v",
                max_width: "350",
                height: "90v",
                background: *BG_200.read(),
                corner_radius: "4",
                shadow: "0 0 1 2 rgb(0, 0, 0, 50)",
                layer: "-999",
                {children}
            }
        }
    }
}
