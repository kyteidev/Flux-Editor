use freya::prelude::*;

use crate::get_colors;

#[allow(non_snake_case)]
pub fn TitleBar() -> Element {
    let bg_color = get_colors("bg");

    rsx!(
        WindowDragArea {
            rect {
                width: "100%",
                height: "30",
                background: "{bg_color}",
            }
        }
    )
}
