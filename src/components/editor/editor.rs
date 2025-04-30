use freya::prelude::*;

use crate::BG_COLOR;

#[allow(non_snake_case)]
pub fn Editor() -> Element {
    let platform = use_platform();

    let mut editable = use_editable(
        || EditableConfig::new("".to_string()),
        EditableMode::MultipleLinesSingleEditor,
    );

    let editor = editable.editor().read();
    let cursor_char = editor.cursor_pos();
    let highlights = editable.highlights_attr(0);

    rsx!(
    rect {
        width: "100%",
        height: "100%",
        background: "{BG_COLOR}",
        ScrollView {
            scroll_with_arrows: false,
            paragraph {
                width: "100%",
                height: "100%",
                cursor_id: "0",
                cursor_index: "{cursor_char}",
                cursor_mode: "editable",
                cursor_color: "black",
                highlights,
                onkeydown: move |e| {
                    editable.process_event(&EditableEvent::KeyDown(e.data));
                    },
                onclick: move |e| {
                    editable.process_event(&EditableEvent::MouseDown(e.data, 0));
                },
                onmouseenter: move |_| {
                    platform.set_cursor(CursorIcon::Text);
                },
                onmouseleave: move |_| {
                    platform.set_cursor(CursorIcon::Default);
                },
                text {
                    "{editable.editor()}"
                }
            }
        }
    })
}
