use freya::prelude::*;
use syntect::{
    easy::HighlightLines,
    highlighting::{Style, ThemeSet},
    parsing::SyntaxSet,
};

use crate::BG_COLOR;

#[allow(non_snake_case)]
pub fn Editor() -> Element {
    let mut highlighted_lines = use_signal(|| Vec::<Vec<(Style, String)>>::new());

    let platform = use_platform();

    let mut editable = use_editable(
        || EditableConfig::new("".to_string()),
        EditableMode::MultipleLinesSingleEditor,
    );

    let editor = editable.editor().read();
    let cursor_reference = editable.cursor_attr();
    let cursor_char = editor.cursor_pos();
    let highlights = editable.highlights_attr(0);

    let ps = SyntaxSet::load_defaults_newlines();
    let ts = ThemeSet::load_defaults();

    use_effect(move || {
        let new_highlights = highlight_lines(&ps, &ts, &editable.editor().read().to_string());
        highlighted_lines.set(new_highlights);
    });

    rsx!(
    rect {
        width: "100%",
        height: "100%",
        background: "{BG_COLOR}",
        ScrollView {
            width: "100%",
            height: "100%",
            paragraph {
                width: "1000%",
                font_size: "20",
                line_height: "1.5",
                font_family: "Menlo, Monaco",
                cursor_id: "0",
                cursor_index: "{cursor_char}",
                cursor_mode: "editable",
                cursor_color: "black",
                highlights,
                cursor_reference,
                onglobalkeydown: move |e| {
                    editable.process_event(&EditableEvent::KeyDown(e.data));
                },
                onglobalkeyup: move |e| {
                    editable.process_event(&EditableEvent::KeyUp(e.data));
                },
                onclick: move |_| {
                    editable.process_event(&EditableEvent::Click);
                },
                onmousemove: move |e| {
                    editable.process_event(&EditableEvent::MouseMove(e.data, 0));
                },
                onmousedown: move |e| {
                    if e.data.trigger_button.unwrap() == MouseButton::Left { // prevent RMB from selecting text
                        editable.process_event(&EditableEvent::MouseDown(e.data, 0));
                    }

                    // implement context menu?
                },
                onmouseenter: move |_| {
                    platform.set_cursor(CursorIcon::Text);
                },
                onmouseleave: move |_| {
                    platform.set_cursor(CursorIcon::Default);
                },
                {highlighted_lines.read().iter().enumerate().flat_map(|(line_index, line)| {
                    if line.is_empty() {
                        return vec![rsx!(
                            text {
                                key: "{line_index}-empty",
                                "\n"
                            }
                        )];
                    }

                    line.iter().enumerate().map(move |(index, style)| {
                        let mut text = style.1.to_string();

                        if index == line.len() - 1 && line_index != highlighted_lines.len() - 1 {
                            text.push('\n');
                        }

                        let color = format!("rgb({},{},{})", style.0.foreground.r, style.0.foreground.g, style.0.foreground.b);

                        rsx!(
                            text {
                                key: "{line_index}-{index}",
                                color: "{color}",
                                {text}
                            }
                        )
                    }).collect::<Vec<_>>()
                })}
            }
        }
    })
}

fn highlight_lines(ps: &SyntaxSet, ts: &ThemeSet, text: &str) -> Vec<Vec<(Style, String)>> {
    let syntax = ps.find_syntax_by_extension("rs").unwrap();
    let theme = ts.themes.get("base16-ocean.dark").unwrap();
    let mut h = HighlightLines::new(syntax, theme);

    let mut highlights = Vec::new();

    for line in text.lines() {
        let ranges = h.highlight_line(line, ps).unwrap();
        highlights.push(
            ranges
                .into_iter()
                .map(|(style, s)| (style, s.to_string()))
                .collect(),
        );
    }

    highlights
}
