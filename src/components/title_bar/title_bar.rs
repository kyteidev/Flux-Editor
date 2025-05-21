use freya::prelude::*;

#[allow(non_snake_case)]
pub fn TitleBar() -> Element {
    rsx!(rect {
        width: "100%",
        height: "50",
        background: "red",
    })
}
