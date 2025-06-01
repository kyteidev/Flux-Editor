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

use std::time::Duration;

use freya::prelude::*;

mod themes;
//use themes::dark::DARK_THEME;

mod state;

mod utils;
use menu::init_menu_handler;
use utils::text::get_char_width;

use tokio::time::sleep;

mod components;
use components::{
    editor::Editor, editor_line_numbers::LineNumbers, panel::Panel, status_bar::StatusBar,
    title_bar::TitleBar,
};
use self_update::cargo_crate_version;
use semver::Version;
use state::{APP_VIEW, CHAR_WIDTH, SCALE_FACTOR, WINDOW};
use tracing::{error, info, Level};
use tracing_subscriber::FmtSubscriber;

#[cfg(target_os = "macos")]
use {
    objc2::msg_send,
    winit::raw_window_handle::{HasWindowHandle, RawWindowHandle},
};

mod window;
#[cfg(target_os = "macos")]
use window::set_transparent_titlebar;

mod menu;
#[cfg(target_os = "macos")]
use menu::init_menu;

// Default theme
pub static BG_50: GlobalSignal<&str> = GlobalSignal::new(|| "#2c3540");
pub static BG_100: GlobalSignal<&str> = GlobalSignal::new(|| "#1d232a");
pub static BG_200: GlobalSignal<&str> = GlobalSignal::new(|| "#13171c");
pub static CONTENT: GlobalSignal<&str> = GlobalSignal::new(|| "#b1b1b3");

#[cfg(not(target_os = "macos"))]
const ICON: &[u8] = include_bytes!("./assets/icons/app/icon.png");

static FLUX_LOGO: &[u8] = include_bytes!("./assets/icons/flux-logo.svg");

pub fn get_scale_factor() {
    WINDOW.with(|cell| {
        if let Some(ptr) = cell.get() {
            let window = unsafe { &**ptr };
            let factor = window.scale_factor();
            *SCALE_FACTOR.write() = factor;
        }
    });
}

fn main() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    check_update(false);

    #[cfg(not(target_os = "macos"))]
    let launch_config: LaunchConfig<'_> = LaunchConfig::<()>::new()
        .with_title("Flux Editor")
        .with_icon(LaunchConfig::load_icon(ICON))
        .with_decorations(false)
        .on_setup(move |window| {
            WINDOW.with(|w| {
                w.set(window).ok();
            });
        });

    #[cfg(target_os = "macos")]
    init_menu_handler();

    #[cfg(target_os = "macos")]
    let menu_bar = init_menu();

    #[cfg(target_os = "macos")]
    let launch_config = LaunchConfig::<muda::Menu>::new()
        .with_title("Flux Editor")
        .with_state(menu_bar.clone())
        .on_setup(move |window| {
            use objc2::msg_send;
            use objc2::runtime::AnyObject;
            use tracing::error;

            menu_bar.init_for_nsapp();

            WINDOW.with(|w| {
                w.set(window).ok();
            });

            let handle = window.window_handle().unwrap().as_raw();

            if let RawWindowHandle::AppKit(appkit) = handle {
                let ns_view_ptr = appkit.ns_view.as_ptr();

                let ns_view: *mut AnyObject = ns_view_ptr.cast();

                unsafe {
                    let ns_window: *mut AnyObject = msg_send![ns_view, window];
                    if ns_window.is_null() {
                        error!("ns_window is null, unable to set transparent titlebar");
                        return;
                    }

                    set_transparent_titlebar(ns_window);
                }
            }
        });

    launch_cfg(app, launch_config);
}

fn app() -> Element {
    *CHAR_WIDTH.write() = get_char_width();

    // WINDOW is not immediately available
    use_future(move || async move {
        sleep(Duration::from_secs(1)).await;
        get_scale_factor();
    });

    let theme: Theme = Theme {
        button: ButtonTheme {
            background: Cow::Borrowed(*BG_100.read()),
            hover_background: Cow::Borrowed(*BG_50.read()),
            border_fill: Cow::Borrowed(""),
            font_theme: FontTheme {
                color: Cow::Borrowed(*CONTENT.read()),
            },
            ..DARK_THEME.button
        },
        ..DARK_THEME
    };

    use_init_theme(|| theme.clone());
    let view = *APP_VIEW.read();
    match view {
        Views::WelcomeView => rsx!(WelcomeView { theme: theme }),
        Views::EditorView => rsx!(EditorView {}),
    }
}

#[derive(Copy, PartialEq, Clone)]
pub enum Views {
    WelcomeView,
    EditorView,
}

#[derive(Props, Clone, PartialEq)]
struct Props {
    theme: Theme,
}

#[allow(non_snake_case)]
fn WelcomeView(props: Props) -> Element {
    let logo_data = static_bytes(FLUX_LOGO);

    let button_theme = Theme {
        button: ButtonTheme {
            width: Cow::Borrowed("100"),
            ..props.theme.button
        },
        ..props.theme
    };

    rsx!(rect {
        width: "100%",
        height: "100%",
        background: "{BG_200}",
        TitleBar {}
        rect {
            width: "100%",
            height: "100%",
            cross_align: "center",
            main_align: "center",
            spacing: "36",
            svg {
                fill: *CONTENT.read(),
                width: "30%",
                height: "30%",
                max_width: "120",
                max_height: "120",
                svg_data: logo_data.clone(),
            }
            rect {
                cross_align: "center",
                spacing: "4",
                ThemeProvider {
                    theme: button_theme,
                    Button {
                        label {
                            "New File"
                        }
                    }
                    Button {
                        label {
                            "Open"
                        }
                    }
                    Button {
                        label {
                            "Clone"
                        }
                    }
                }
            }
        }
    })
}

#[allow(non_snake_case)]
fn EditorView() -> Element {
    let scroll_controller = use_scroll_controller(ScrollConfig::default);
    let mut visible = use_signal(|| true);

    rsx!(rect {
        width: "100%",
        height: "100%",
        background: "{BG_200}",
        content: "flex",
        TitleBar {}
        rect {
            width: "100%",
            height: "flex",
            direction: "horizontal",
            LineNumbers {
                scroll_controller: scroll_controller,
            }
            Editor {
                scroll_controller: scroll_controller,
            }
        }
        StatusBar {}
        Panel {
            visible: *visible.read(),
            label {
                color: "white",
                font_size: "16",
                "hi"
            }
        }
    })
}

fn check_update(should_update: bool) -> bool {
    // TODO: Add key verification

    let update = self_update::backends::github::Update::configure()
        .repo_owner("jaemk") //testing
        .repo_name("self_update")
        .bin_name("self_update")
        .current_version(cargo_crate_version!())
        .no_confirm(true)
        .build()
        .map_err(|e| error!("Failed to check for updates: {}", e))
        .unwrap();

    if should_update {
        info!("Updating...");

        match update.update() {
            Ok(_) => info!("Successfully updated"),
            Err(e) => error!("Failed to update: {}", e),
        }

        false
    } else {
        let latest_version =
            Version::parse(update.get_latest_release().unwrap().version.as_str()).unwrap();
        let current_version = Version::parse(cargo_crate_version!()).unwrap();

        info!("Latest version: {}", latest_version);

        latest_version > current_version
    }
}
