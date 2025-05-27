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

use crate::state::{CHAR_WIDTH, EDITOR_LINES, LINE_HEIGHT, TITLE_BAR_HEIGHT};
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
    let line_height = *LINE_HEIGHT.read();
    let char_width = *CHAR_WIDTH.read();

    let mut editor_lines: Signal<usize> = use_signal(|| 1);

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
        EditableMode::SingleLineMultipleEditors,
    );

    let ps = SyntaxSet::load_defaults_newlines();
    let ts = ThemeSet::load_defaults();

    use_effect(move || {
        // syntax highlight text
        let editor_text = editable.editor().to_string();
        let new_highlights = highlight_lines(&ps, &ts, &editor_text);
        highlighted_lines.set(new_highlights.clone());

        // calculate lines in editor
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

        estimated_line_width.set(char_width * longest_line_length as f32);
    });

    use_effect(move || {
        *editor_lines.write() = editable.editor().read().len_lines();
    });

    let onglobalclick = move |_: MouseEvent| {
        editable.process_event(&EditableEvent::Click);
    };

    let onglobalkeydown = move |e: KeyboardEvent| {
        editable.process_event(&EditableEvent::KeyDown(e.data));
    };

    let onglobalkeyup = move |e: KeyboardEvent| {
        editable.process_event(&EditableEvent::KeyUp(e.data));
    };

    rsx!(
        rect {
            width: "fill",
            height: "fill",
            background: "{BG_200}",
            onglobalkeydown,
            onglobalkeyup,
            onglobalclick,
            ScrollView {
                direction: "horizontal",
                width: "100%",
                height: "100%",
                rect {
                    width: "{estimated_line_width}",
                    min_width: "100%",
                    height: "100%",
                    VirtualScrollView {
                        height: "100%",
                        length: *EDITOR_LINES.read(),
                        padding: "4 0 0 0",
                        item_size: line_height,
                        scroll_controller: props.scroll_controller,
                        builder: move |line_index, _: &Option<()>| {
                            let editor = editable.editor().read();
                            let highlighted_lines = highlighted_lines.read();
                            let line = highlighted_lines.get(line_index).cloned().unwrap_or_default();

                            let is_line_selected = editor.cursor_row() == line_index;
                            let character_index = if is_line_selected {
                                editor.cursor_col().to_string()
                            } else {
                                "none".to_string()
                            };

                            let highlights = editable.highlights_attr(line_index);

                            let onmousemove = move |e: MouseEvent| {
                                editable.process_event(&EditableEvent::MouseMove(e.data, line_index));
                            };
                            let onmousedown = move |e: MouseEvent| {
                                if e.data.trigger_button.unwrap() == MouseButton::Left {
                                    editable.process_event(&EditableEvent::MouseDown(e.data, line_index));
                                }
                            };
                            let onmouseenter = move |_: MouseEvent| {
                                platform.set_cursor(CursorIcon::Text);
                            };
                            let onmouseleave = move |_: MouseEvent| {
                                platform.set_cursor(CursorIcon::Default);
                            };

                            rsx! {
                                rect {
                                    key: "{line_index}",
                                    height: "{line_height}",
                                    background: "{BG_200}",
                                    paragraph {
                                        width: "100%",
                                        height: "100%",
                                        font_size: "20",
                                        line_height: "1.5",
                                        font_family: "Menlo, Monaco",
                                        cursor_reference: editable.cursor_attr(),
                                        cursor_index: "{character_index}",
                                        cursor_color: "white",
                                        cursor_id: "{line_index}",
                                        cursor_mode: "editable",
                                        max_lines: 1,
                                        onmousedown,
                                        onmousemove,
                                        onmouseenter,
                                        onmouseleave,
                                        highlights,
                                        {
                                            line.iter().enumerate().map(|(index, (style, text))| {
                                                let mut text = text.clone();

                                                if index == line.len() - 1 && line_index != highlighted_lines.len() - 1 {
                                                    text.push('\n');
                                                }

                                                let color = format!("rgb({},{},{})", style.foreground.r, style.foreground.g, style.foreground.b);

                                                rsx!(
                                                    text {
                                                        key: "{line_index}-{index}",
                                                        color: "{color}",
                                                        {text}
                                                    }
                                                )
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

    )
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
