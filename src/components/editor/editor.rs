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
    BG_100,
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
    let line_height = *LINE_HEIGHT.read();
    let char_width = *CHAR_WIDTH.read();

    let mut editor_lines: Signal<usize> = use_signal(|| 1);

    let PlatformInformation { viewport_size, .. } = *use_platform_information().read();
    let scale_factor = *SCALE_FACTOR.read() as f32;

    let mut scroll_controller = props.scroll_controller;
    let mut horizontal_scroll_controller = use_scroll_controller(|| ScrollConfig::default());

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

    let mut previous_caret_position = use_signal(|| (0, 0));
    use_effect(move || {
        let editor = editable.editor().read();
        let (cursor_line, cursor_col) = editor.cursor_row_and_col();
        let (prev_line, prev_col) = *previous_caret_position.read();

        if cursor_line == prev_line && cursor_col == prev_col {
            return;
        }

        previous_caret_position.set((cursor_line, cursor_col));

        let caret_x = cursor_col as f32 * *CHAR_WIDTH.read();
        let caret_y = cursor_line as f32 * *LINE_HEIGHT.read();

        let scroll_x = *scroll_controller.x().read() as f32;
        let scroll_y = *scroll_controller.y().read() as f32;

        let caret_absolute_x = caret_x + scroll_x + line_number_width;
        let caret_absolute_y = caret_y + scroll_y + title_bar_height;

        let view_width = viewport_size.width / scale_factor;
        let view_height = viewport_size.height / scale_factor;

        if caret_absolute_x > view_width - 30.0 {
            horizontal_scroll_controller.scroll_to_x((-caret_x - 30.0) as i32);
        } else if caret_absolute_x < line_number_width + 30.0 {
            horizontal_scroll_controller.scroll_to_x((-caret_x + 30.0) as i32);
        }

        if caret_absolute_y > view_height - line_height {
            scroll_controller.scroll_to_y((-caret_y - line_height) as i32);
        } else if caret_absolute_y < title_bar_height + line_height {
            scroll_controller.scroll_to_y((-caret_y + line_height) as i32);
        }
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
                scroll_controller: horizontal_scroll_controller,
                rect {
                    width: "calc({estimated_line_width} + 30)",
                    min_width: "100%",
                    height: "100%",
                    VirtualScrollView {
                        height: "100%",
                        length: *EDITOR_LINES.read(),
                        item_size: line_height,
                        scroll_controller: scroll_controller,
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

                            // highlight active line
                            let background_color = *BG_100.read();
                            let line_background = if is_line_selected {
                                background_color
                            } else {
                                "none"
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
                                    width: "100%",
                                    height: "{line_height}",
                                    background: line_background,
                                    paragraph {
                                        width: "100%",
                                        height: "100%",
                                        main_align: "center",
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
                                        highlight_mode: "expanded",
                                        {
                                            line.iter().enumerate().map(|(index, (style, text))| {
                                                let text = text.clone();

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
