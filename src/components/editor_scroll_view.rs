/*
MIT License

Copyright (c) Marc Espín Sanz

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Fork of VirtualScrollView from freya (https://github.com/marc2332/freya/blob/main/crates/components/src/scroll_views/virtual_scroll_view.rs)
// Licensed under the MIT license

use std::ops::Range;

use dioxus::prelude::*;
use freya::prelude::*;
use freya_hooks::{use_applied_theme, use_focus, use_node, ScrollBarThemeWith};

use crate::state::WIDEST_LINE_WIDTH;

#[derive(Props, Clone)]
pub struct EditorScrollViewProps<
    Builder: 'static + Clone + Fn(usize, &Option<BuilderArgs>) -> Element,
    BuilderArgs: Clone + 'static + PartialEq = (),
> {
    #[props(default = "fill".into())]
    pub width: String,
    #[props(default = "fill".into())]
    pub height: String,
    #[props(default = "0".to_string())]
    pub padding: String,
    pub scrollbar_theme: Option<ScrollBarThemeWith>,
    pub length: usize,
    pub item_size: f32,
    pub builder: Builder,
    #[props(into)]
    pub builder_args: Option<BuilderArgs>,
    #[props(default = true, into)]
    pub show_scrollbar: bool,
    #[props(default = true, into)]
    pub scroll_with_arrows: bool,
    #[props(default = true, into)]
    pub cache_elements: bool,
    pub scroll_controller: Option<ScrollController>,
    #[props(default = false)]
    pub invert_scroll_wheel: bool,
}

impl<
        BuilderArgs: Clone + PartialEq,
        Builder: Clone + Fn(usize, &Option<BuilderArgs>) -> Element,
    > PartialEq for EditorScrollViewProps<Builder, BuilderArgs>
{
    fn eq(&self, other: &Self) -> bool {
        self.width == other.width
            && self.height == other.height
            && self.padding == other.padding
            && self.length == other.length
            && self.item_size == other.item_size
            && self.show_scrollbar == other.show_scrollbar
            && self.scroll_with_arrows == other.scroll_with_arrows
            && self.builder_args == other.builder_args
            && self.scroll_controller == other.scroll_controller
            && self.invert_scroll_wheel == other.invert_scroll_wheel
    }
}

fn get_render_range(
    viewport_size: f32,
    scroll_position: f32,
    item_size: f32,
    item_length: f32,
) -> Range<usize> {
    let render_index_start = (-scroll_position) / item_size;
    let potentially_visible_length = (viewport_size / item_size) + 1.0;
    let remaining_length = item_length - render_index_start;

    let render_index_end = if remaining_length <= potentially_visible_length {
        item_length
    } else {
        render_index_start + potentially_visible_length
    };

    render_index_start as usize..(render_index_end as usize)
}

#[component]
pub fn EditorScrollView<
    Builder: Clone + Fn(usize, &Option<BuilderArgs>) -> Element,
    BuilderArgs: Clone + PartialEq,
>(
    EditorScrollViewProps {
        width,
        height,
        padding,
        scrollbar_theme,
        length,
        item_size,
        builder,
        builder_args,
        show_scrollbar,
        scroll_with_arrows,
        cache_elements,
        scroll_controller,
        invert_scroll_wheel,
    }: EditorScrollViewProps<Builder, BuilderArgs>,
) -> Element {
    let mut clicking_scrollbar = use_signal::<Option<(Axis, f64)>>(|| None);
    let mut clicking_shift = use_signal(|| false);
    let mut clicking_alt = use_signal(|| false);
    let mut scroll_controller =
        scroll_controller.unwrap_or_else(|| use_scroll_controller(ScrollConfig::default));
    let (mut scrolled_x, mut scrolled_y) = scroll_controller.into();
    let (node_ref, size) = use_node();
    let mut focus = use_focus();
    let applied_scrollbar_theme = use_applied_theme!(&scrollbar_theme, scroll_bar);

    let widest_line_width = *WIDEST_LINE_WIDTH.read();
    let inner_width = if widest_line_width < size.inner.width {
        size.inner.width
    } else {
        widest_line_width + 30.0
    };
    let inner_height = item_size * length as f32;

    scroll_controller.use_apply(inner_width, inner_height);

    let vertical_scrollbar_is_visible =
        is_scrollbar_visible(show_scrollbar, inner_height, size.area.height());
    let horizontal_scrollbar_is_visible =
        is_scrollbar_visible(show_scrollbar, inner_width, size.area.width());

    let (container_width, content_width) = get_container_sizes(&width);
    let (container_height, content_height) = get_container_sizes(&height);

    let corrected_scrolled_y =
        get_corrected_scroll_position(inner_height, size.area.height(), *scrolled_y.read() as f32);
    let corrected_scrolled_x =
        get_corrected_scroll_position(inner_width, size.area.width(), *scrolled_x.read() as f32);

    let (scrollbar_y, scrollbar_height) =
        get_scrollbar_pos_and_size(inner_height, size.area.height(), corrected_scrolled_y);
    let (scrollbar_x, scrollbar_width) =
        get_scrollbar_pos_and_size(inner_width, size.area.width(), corrected_scrolled_x);

    // Moves the Y axis when the user scrolls in the container
    let onwheel = move |e: WheelEvent| {
        let speed_multiplier = if *clicking_alt.peek() {
            SCROLL_SPEED_MULTIPLIER
        } else {
            1.0
        };

        let invert_direction = (clicking_shift() || invert_scroll_wheel)
            && (!clicking_shift() || !invert_scroll_wheel);

        let (x_movement, y_movement) = if invert_direction {
            (
                e.get_delta_y() as f32 * speed_multiplier,
                e.get_delta_x() as f32 * speed_multiplier,
            )
        } else {
            (
                e.get_delta_x() as f32 * speed_multiplier,
                e.get_delta_y() as f32 * speed_multiplier,
            )
        };

        let scroll_position_y = get_scroll_position_from_wheel(
            y_movement,
            inner_height,
            size.area.height(),
            corrected_scrolled_y,
        );

        // Only scroll when there is still area to scroll
        if *scrolled_y.peek() != scroll_position_y {
            e.stop_propagation();
            *scrolled_y.write() = scroll_position_y;
        }

        let scroll_position_x = get_scroll_position_from_wheel(
            x_movement,
            inner_width,
            size.area.width(),
            corrected_scrolled_x,
        );

        // Only scroll when there is still area to scroll
        if *scrolled_x.peek() != scroll_position_x {
            e.stop_propagation();
            *scrolled_x.write() = scroll_position_x;
        }
    };

    // Drag the scrollbars
    let onmousemove = move |e: MouseEvent| {
        let clicking_scrollbar = clicking_scrollbar.peek();

        if let Some((Axis::Y, y)) = *clicking_scrollbar {
            let coordinates = e.get_element_coordinates();
            let cursor_y = coordinates.y - y - size.area.min_y() as f64;

            let scroll_position =
                get_scroll_position_from_cursor(cursor_y as f32, inner_height, size.area.height());

            *scrolled_y.write() = scroll_position;
        } else if let Some((Axis::X, x)) = *clicking_scrollbar {
            let coordinates = e.get_element_coordinates();
            let cursor_x = coordinates.x - x - size.area.min_x() as f64;

            let scroll_position =
                get_scroll_position_from_cursor(cursor_x as f32, inner_width, size.area.width());

            *scrolled_x.write() = scroll_position;
        }

        if clicking_scrollbar.is_some() {
            focus.request_focus();
        }
    };

    let onglobalkeydown = move |e: KeyboardEvent| {
        match &e.key {
            Key::Shift => {
                clicking_shift.set(true);
            }
            Key::Alt => {
                clicking_alt.set(true);
            }
            k => {
                if !focus.is_focused() {
                    return;
                }

                if !scroll_with_arrows
                    && (k == &Key::ArrowUp
                        || k == &Key::ArrowRight
                        || k == &Key::ArrowDown
                        || k == &Key::ArrowLeft)
                {
                    return;
                }

                let x = corrected_scrolled_x;
                let y = corrected_scrolled_y;
                let inner_height = inner_height;
                let inner_width = inner_width;
                let viewport_height = size.area.height();
                let viewport_width = size.area.width();

                let (x, y) = manage_key_event(
                    e,
                    (x, y),
                    inner_height,
                    inner_width,
                    viewport_height,
                    viewport_width,
                );

                scrolled_x.set(x as i32);
                scrolled_y.set(y as i32);
            }
        };
    };

    let onglobalkeyup = move |e: KeyboardEvent| {
        if e.key == Key::Shift {
            clicking_shift.set(false);
        } else if e.key == Key::Alt {
            clicking_alt.set(false);
        }
    };

    // Mark the Y axis scrollbar as the one being dragged
    let onmousedown_y = move |e: MouseEvent| {
        let coordinates = e.get_element_coordinates();
        *clicking_scrollbar.write() = Some((Axis::Y, coordinates.y));
    };

    // Mark the X axis scrollbar as the one being dragged
    let onmousedown_x = move |e: MouseEvent| {
        let coordinates = e.get_element_coordinates();
        *clicking_scrollbar.write() = Some((Axis::X, coordinates.x));
    };

    // Unmark any scrollbar
    let onclick = move |_: MouseEvent| {
        if clicking_scrollbar.peek().is_some() {
            *clicking_scrollbar.write() = None;
        }
    };

    let (viewport_size, scroll_position) = (size.area.height(), corrected_scrolled_y);

    // Calculate from what to what items must be rendered
    let render_range = get_render_range(viewport_size, scroll_position, item_size, length as f32);

    let children = if cache_elements {
        let children = use_memo(use_reactive(
            &(render_range, builder_args),
            move |(render_range, builder_args)| {
                render_range
                    .clone()
                    .map(|i| (builder)(i, &builder_args))
                    .collect::<Vec<Element>>()
            },
        ));
        rsx!({ children.read().iter() })
    } else {
        let children = render_range.map(|i| (builder)(i, &builder_args));
        rsx!({ children })
    };

    let is_scrolling_x = clicking_scrollbar
        .read()
        .as_ref()
        .map(|f| f.0 == Axis::X)
        .unwrap_or_default();
    let is_scrolling_y = clicking_scrollbar
        .read()
        .as_ref()
        .map(|f| f.0 == Axis::Y)
        .unwrap_or_default();

    let offset_y_min = (-corrected_scrolled_y / item_size).floor() * item_size;
    let offset_y = -corrected_scrolled_y - offset_y_min;

    let offset_x = -corrected_scrolled_x;

    let a11y_id = focus.attribute();

    rsx!(
        rect {
            a11y_role: "scroll-view",
            overflow: "clip",
            direction: "horizontal",
            width: "{width}",
            height: "{height}",
            onglobalclick: onclick,
            onglobalmousemove: onmousemove,
            onglobalkeydown,
            onglobalkeyup,
            a11y_id,
            rect {
                direction: "vertical",
                width: "{container_width}",
                height: "{container_height}",
                rect {
                    overflow: "clip",
                    padding: "{padding}",
                    height: "{content_height}",
                    width: "{content_width}",
                    direction: "vertical",
                    offset_x: "{-offset_x}",
                    offset_y: "{-offset_y}",
                    reference: node_ref,
                    onwheel: onwheel,
                    {children}
                }
                if horizontal_scrollbar_is_visible {
                    ScrollBar {
                        size: &applied_scrollbar_theme.size,
                        offset_x: scrollbar_x,
                        clicking_scrollbar: is_scrolling_x,
                        theme: scrollbar_theme.clone(),
                        ScrollThumb {
                            clicking_scrollbar: is_scrolling_x,
                            onmousedown: onmousedown_x,
                            width: "{scrollbar_width}",
                            height: "100%",
                            theme: scrollbar_theme.clone(),
                        }
                    }
                }

            }
            if vertical_scrollbar_is_visible {
                ScrollBar {
                    is_vertical: true,
                    size: &applied_scrollbar_theme.size,
                    offset_y: scrollbar_y,
                    clicking_scrollbar: is_scrolling_y,
                    theme: scrollbar_theme.clone(),
                    ScrollThumb {
                        clicking_scrollbar: is_scrolling_y,
                        onmousedown: onmousedown_y,
                        width: "100%",
                        height: "{scrollbar_height}",
                        theme: scrollbar_theme,
                    }
                }
            }
        }
    )
}
