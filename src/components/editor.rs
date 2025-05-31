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

use std::ops::{Range, RangeInclusive};

use freya::prelude::*;
use syntect::{
    easy::HighlightLines,
    highlighting::{Style, ThemeSet},
    parsing::{SyntaxReference, SyntaxSet},
};
use tracing::error;

use crate::{
    state::{CARET_COLUMN, CARET_LINE, LARGEST_LINE_WIDTH, STATUS_BAR_HEIGHT},
    utils::text::get_leading_whitespaces,
};

use crate::state::{
    CHAR_WIDTH, EDITOR_LINES, LINE_HEIGHT, LINE_NUMBER_WIDTH, SCALE_FACTOR, SELECTED_LINE,
    TAB_SIZE, TITLE_BAR_HEIGHT,
};
use crate::{BG_100, BG_200};

#[derive(Props, Clone, PartialEq)]
pub struct Props {
    scroll_controller: ScrollController,
}

#[allow(non_snake_case)]
pub fn Editor(props: Props) -> Element {
    let line_number_width = *LINE_NUMBER_WIDTH.read();
    let title_bar_height = *TITLE_BAR_HEIGHT.read();
    let status_bar_height = *STATUS_BAR_HEIGHT.read();

    let line_height = *LINE_HEIGHT.read();
    let char_width = *CHAR_WIDTH.read();

    let mut caret_x: Signal<f32> = use_signal(|| 0.0);
    let mut caret_y: Signal<f32> = use_signal(|| 0.0);
    let mut caret_absolute_x: Signal<f32> = use_signal(|| 0.0);
    let mut caret_absolute_y: Signal<f32> = use_signal(|| 0.0);

    let mut syntax_set = use_signal::<Option<SyntaxSet>>(|| None);
    let mut syntax = use_signal::<Option<SyntaxReference>>(|| None);
    let mut theme = use_signal::<Option<syntect::highlighting::Theme>>(|| None);

    let mut hovering_on_editor = use_signal(|| false);

    let PlatformInformation { viewport_size, .. } = *use_platform_information().read();
    let scale_factor = *SCALE_FACTOR.read() as f32;

    let mut scroll_controller = props.scroll_controller;
    let mut horizontal_scroll_controller = use_scroll_controller(ScrollConfig::default);

    let mut highlighted_lines = use_signal(Vec::<Vec<(Style, String)>>::new);
    let mut estimated_line_width: Signal<f32> = use_signal(|| 0.0);

    let platform = use_platform();

    let mut editable = use_editable(
        || {
            EditableConfig::new("".to_string())
                .with_allow_tabs(true)
                .with_identation(*TAB_SIZE.read())
        },
        EditableMode::SingleLineMultipleEditors,
    );

    let mut highlight_lines_range =
        move |editor: &RopeEditor, lines_to_highlight: RangeInclusive<usize>| {
            let Some(syntax_set) = &*syntax_set.read() else {
                return;
            };
            let Some(syntax) = &*syntax.read() else {
                return;
            };
            let Some(theme) = &*theme.read() else { return };

            let mut highlights = highlighted_lines.write();

            for line_index in lines_to_highlight {
                if let Some(line) = editor.line(line_index) {
                    let line_str = line.to_string();
                    let line_highlight = highlight_lines(syntax_set, syntax, theme, &line_str)
                        .into_iter()
                        .next()
                        .unwrap_or_default();

                    if highlights.len() <= line_index {
                        highlights.resize_with(line_index + 1, Vec::new);
                    }

                    highlights[line_index] = line_highlight;
                }
            }
        };

    use_effect(move || {
        let loaded_ps = SyntaxSet::load_defaults_newlines();
        let loaded_syntax = loaded_ps.find_syntax_by_extension("rs").cloned();
        let loaded_theme = ThemeSet::load_defaults()
            .themes
            .get("base16-ocean.dark")
            .cloned();

        if loaded_syntax.is_some() && loaded_theme.is_some() {
            syntax_set.set(Some(loaded_ps));
            syntax.set(loaded_syntax);
            theme.set(loaded_theme);
        }
    });

    use_effect(move || {
        // syntax highlight active line only
        let editor = editable.editor().read();
        let selected_line = *CARET_LINE.read();

        let current_line = match editor.line(selected_line) {
            Some(line) => line.to_string(),
            None => {
                error!("Failed to get current line: the value is None");
                String::new()
            }
        };

        highlight_lines_range(&editor, selected_line..=selected_line);

        *EDITOR_LINES.write() = editor.len_lines();

        // calculate largest line width
        let current_line_width = char_width * current_line.chars().count() as f32;

        let mut max_width = LARGEST_LINE_WIDTH.write().unwrap();
        if current_line_width > *max_width {
            *max_width = current_line_width;
            estimated_line_width.set(current_line_width);
        }
    });

    use_effect(move || {
        let editor = editable.editor().read();
        let (caret_line, caret_col) = editor.cursor_row_and_col();

        let caret_x_local = caret_col as f32 * char_width;
        let caret_y_local = caret_line as f32 * line_height;

        caret_x.set(caret_x_local);
        caret_y.set(caret_y_local);

        let scroll_x = *horizontal_scroll_controller.x().read() as f32;
        let scroll_y = *scroll_controller.y().read() as f32;

        let caret_absolute_x_local = caret_x_local + scroll_x + line_number_width;
        let caret_absolute_y_local = caret_y_local + scroll_y + title_bar_height;

        caret_absolute_x.set(caret_absolute_x_local);
        caret_absolute_y.set(caret_absolute_y_local);

        *CARET_LINE.write() = caret_line;
        *CARET_COLUMN.write() = caret_col;
    });

    let onglobalclick = move |_: MouseEvent| {
        editable.process_event(&EditableEvent::Click);

        if !*hovering_on_editor.read() {
            let mut editor = editable.editor().write_unchecked();
            let text_length = editor.len_chars();
            editor.set_cursor_pos(text_length);
        }
    };

    let onglobalkeydown = move |e: KeyboardEvent| {
        // auto scroll to caret position if it goes out of view
        let view_width = viewport_size.width / scale_factor;
        let view_height = viewport_size.height / scale_factor;

        if caret_absolute_x() > view_width - 30.0 {
            horizontal_scroll_controller.scroll_to_x((-caret_x() - 30.0) as i32);
        } else if caret_absolute_x() < line_number_width + 30.0 {
            horizontal_scroll_controller.scroll_to_x((-caret_x() + 30.0) as i32);
        }

        if caret_absolute_y() > view_height - line_height - status_bar_height {
            scroll_controller.scroll_to_y((-caret_y() - line_height) as i32);
        } else if caret_absolute_y() < title_bar_height + line_height {
            scroll_controller.scroll_to_y((-caret_y() + line_height) as i32);
        }

        // custom enter key implementation below
        if e.key.to_string() != "Enter" {
            editable.process_event(&EditableEvent::KeyDown(e.clone().data));
        }

        let mut editor = editable.editor().write_unchecked();
        let caret_pos = editor.cursor_pos();

        match e.key.to_string().as_str() {
            "{" => {
                editor.insert_char('}', caret_pos);
            }
            "[" => {
                editor.insert_char(']', caret_pos);
            }
            "(" => {
                editor.insert_char(')', caret_pos);
            }
            "'" => {
                editor.insert_char('\'', caret_pos);
            }
            "\"" => {
                editor.insert_char('"', caret_pos);
            }
            "Enter" => {
                let caret_line = *CARET_LINE.read();
                let current_line = match editor.line(caret_line) {
                    Some(line) => line.to_string(),
                    None => {
                        error!("Failed to get current line: the value is None");
                        String::new()
                    }
                };
                let mut chars = current_line.chars();

                let char_on_caret_right = chars.nth(editor.cursor_col()).unwrap_or(' ').to_string();
                let line_spaces = get_leading_whitespaces(&current_line);
                let trailing_spaces = &" ".repeat(line_spaces as usize);
                let trailing_spaces_with_tab =
                    trailing_spaces.to_owned() + &" ".repeat(*TAB_SIZE.read() as usize);

                editor.insert_char('\n', caret_pos);
                editor.cursor_down();

                match char_on_caret_right.as_str() {
                    "}" | "]" | ")" => {
                        editor.insert(
                            ("\n".to_owned() + trailing_spaces_with_tab.as_str()).as_str(),
                            caret_pos,
                        );
                        editor.set_cursor_pos(caret_pos + trailing_spaces_with_tab.len() + 1);

                        let new_caret_pos = editor.cursor_pos();
                        editor.insert(trailing_spaces.as_str(), new_caret_pos + 1);

                        highlight_lines_range(&editor, caret_line..=caret_line + 2);
                    }
                    _ => {}
                }
            }
            "Backspace" => {
                let current_line = match editor.line(*CARET_LINE.read()) {
                    Some(line) => line.to_string(),
                    None => {
                        error!("Failed to get current line: the value is None");
                        String::new()
                    }
                };

                let mut chars = current_line.chars();

                let char_on_caret_right = chars.nth(editor.cursor_col()).unwrap_or(' ').to_string();

                match char_on_caret_right.as_str() {
                    "}" | "]" | ")" | "'" | "\"" => {
                        editor.remove(Range {
                            start: caret_pos,
                            end: caret_pos + 1,
                        });
                    }
                    _ => {}
                }
            }
            _ => {
                println!("Key pressed: {}", e.key);
            }
        }
    };

    let onglobalkeyup = move |e: KeyboardEvent| {
        editable.process_event(&EditableEvent::KeyUp(e.data));
    };

    let onmouseenter = move |_: MouseEvent| {
        platform.set_cursor(CursorIcon::Text);
    };
    let onmouseleave = move |_: MouseEvent| {
        platform.set_cursor(CursorIcon::Default);
    };

    rsx!(
        rect {
            width: "fill",
            height: "100%",
            background: "{BG_200}",
            onglobalkeydown,
            onglobalkeyup,
            onglobalclick,
            onmouseenter,
            onmouseleave,
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

                            let selected_line = *CARET_LINE.read();

                            *SELECTED_LINE.write() = selected_line;

                            let is_line_selected = selected_line == line_index;
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
                                hovering_on_editor.set(true);
                            };
                            let onmouseleave = move |_: MouseEvent| {
                                hovering_on_editor.set(false);
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

fn highlight_lines(
    ps: &SyntaxSet,
    syntax: &SyntaxReference,
    theme: &syntect::highlighting::Theme,
    text: &str,
) -> Vec<Vec<(Style, String)>> {
    let mut highlighter = HighlightLines::new(syntax, theme);

    text.lines()
        .map(|line| {
            highlighter
                .highlight_line(line, ps)
                .unwrap_or_default()
                .into_iter()
                .map(|(style, s)| (style, s.to_string()))
                .collect()
        })
        .collect()
}
