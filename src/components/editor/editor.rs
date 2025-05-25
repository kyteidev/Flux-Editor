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
use syntect::{
    easy::HighlightLines,
    highlighting::{Style, ThemeSet},
    parsing::SyntaxSet,
};

use crate::{
    state::{CHAR_WIDTH, EDITOR_LINES, LINE_HEIGHT, TITLE_BAR_HEIGHT},
    utils::char::get_cursor_line_and_column,
};
use crate::{
    state::{LINE_NUMBER_WIDTH, SCALE_FACTOR},
    BG_200,
};

#[derive(Props, Clone, PartialEq)]
pub struct Props {
    scroll_controller: ScrollController,
}

#[allow(non_snake_case)]
pub fn Editor(props: Props) -> Element {
    let line_number_width = *LINE_NUMBER_WIDTH.read();
    let title_bar_height = *TITLE_BAR_HEIGHT.read();

    let PlatformInformation { viewport_size, .. } = *use_platform_information().read();
    let scale_factor = *SCALE_FACTOR.read() as f32;

    let mut scroll_controller = props.scroll_controller;

    let mut highlighted_lines = use_signal(|| Vec::<Vec<(Style, String)>>::new());
    let mut estimated_line_width: Signal<f32> = use_signal(|| 0.0);

    let platform = use_platform();

    let mut editable = use_editable(
        || {
            EditableConfig::new("".to_string())
                .with_allow_tabs(true)
                .with_identation(4)
        },
        EditableMode::MultipleLinesSingleEditor,
    );

    let editor = editable.editor().read();
    let cursor_reference = editable.cursor_attr();
    let cursor_char = editor.cursor_pos();
    let highlights = editable.highlights_attr(0);

    let ps = SyntaxSet::load_defaults_newlines();
    let ts = ThemeSet::load_defaults();

    use_effect(move || {
        // syntax highlight text
        let editor_text = editable.editor().to_string();
        let new_highlights = highlight_lines(&ps, &ts, &editor_text);
        highlighted_lines.set(new_highlights.clone());

        let line_count = if editor_text.is_empty() {
            1
        } else if editor_text.ends_with('\n') {
            // highlight_lines does not include the trailing newline, so add 1
            new_highlights.len() + 1
        } else {
            new_highlights.len()
        };
        *EDITOR_LINES.write() = line_count;

        // adjust width of paragraph component based on longest line width
        let longest_line_length = editor_text
            .lines()
            .map(|line| line.chars().count())
            .max()
            .unwrap_or(1);

        estimated_line_width.set(*CHAR_WIDTH.read() * longest_line_length as f32);
    });

    rsx!(
    rect {
        width: "fill",
        height: "fill",
        background: "{BG_200}",
        ScrollView {
            width: "100%",
            height: "100%",
            padding: "4 0 0 0",
            scroll_controller: props.scroll_controller,
            paragraph {
                width: "calc({estimated_line_width} + 30)",
                font_size: "20",
                line_height: "1.5",
                font_family: "Menlo, Monaco",
                cursor_id: "0",
                cursor_index: "{cursor_char}",
                cursor_mode: "editable",
                cursor_color: "white",
                highlights,
                cursor_reference,
                onglobalkeydown: move |e| {
                    editable.process_event(&EditableEvent::KeyDown(e.data));

                    // auto scroll so caret is visible
                    let editor_text = editable.editor().to_string();

                    let (cursor_line, cursor_column) = get_cursor_line_and_column(&editor_text, cursor_char);

                    let caret_x = cursor_column as f32 * *CHAR_WIDTH.read();
                    let caret_y =
                        cursor_line as f32 * *LINE_HEIGHT.read();

                    let caret_absolute_x = caret_x + *scroll_controller.x().read() as f32 + line_number_width;
                    let caret_absolute_y = caret_y + *scroll_controller.y().read() as f32 + title_bar_height;

                    if caret_absolute_x > viewport_size.width / scale_factor - 30.0 || caret_absolute_x < line_number_width {
                        scroll_controller.scroll_to_x(-caret_x as i32);
                    }

                    if caret_absolute_y > viewport_size.height / scale_factor + title_bar_height || caret_absolute_y < title_bar_height {
                        scroll_controller.scroll_to_y(-caret_y as i32);
                    }
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
