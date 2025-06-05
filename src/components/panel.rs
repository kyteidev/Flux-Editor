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
    state::{SCALE_FACTOR, STATUS_BAR_HEIGHT, TITLE_BAR_HEIGHT},
    BG_200,
};

#[component]
pub fn Panel(visible: bool, children: Element) -> Element {
    let mut run_initial_animation: Signal<bool> = use_signal(|| false);

    let animation = use_animation_with_dependencies(&visible, move |_conf, visible| {
        let (start, end) = if visible { (-250., 0.) } else { (0., -250.) };
        AnimNum::new(start, end)
            .time(256)
            .ease(Ease::InOut)
            .function(Function::Quart)
    });

    use_memo(use_reactive(&visible, move |_| {
        if *run_initial_animation.peek() {
            animation.run(AnimDirection::Forward)
        }
    }));

    if !visible && !animation.is_running() {
        run_initial_animation.set(true);
        return rsx! {};
    }

    let pos = animation.get().read().read();

    let PlatformInformation { viewport_size, .. } = *use_platform_information().read();

    let title_bar_height = *TITLE_BAR_HEIGHT.read() as i32;
    let offset_top = title_bar_height + 4;

    let height = viewport_size.height / *SCALE_FACTOR.read() as f32
        - *TITLE_BAR_HEIGHT.read()
        - *STATUS_BAR_HEIGHT.read()
        - 8.0;

    rsx! {
        rect {
            offset_x: "{pos}",
            position: "global",
            position_top: "{offset_top}",
            position_left: "10",
            rect {
                width: "250",
                height: "{height}",
                background: *BG_200.read(),
                corner_radius: "4",
                shadow: "0 0 1 2 rgb(0, 0, 0, 50)",
                layer: "-999",
                {children}
            }
        }
    }
}
