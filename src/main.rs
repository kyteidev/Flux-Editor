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

use tokio::time::sleep;
use utils::char::get_char_width;

mod components;
use components::{editor::Editor, editor_line_numbers::LineNumbers, title_bar::TitleBar};
use self_update::cargo_crate_version;
use semver::Version;
use state::{CHAR_WIDTH, SCALE_FACTOR, WINDOW};
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

// Default theme
pub static BG_100: GlobalSignal<&str> = GlobalSignal::new(|| "#1d232a");
pub static BG_200: GlobalSignal<&str> = GlobalSignal::new(|| "#13171c");

#[cfg(not(target_os = "macos"))]
const ICON: &[u8] = include_bytes!("./assets/icons/app/icon.png");

pub fn get_colors(color: &str) -> String {
    match color {
        "bg-100" => BG_100.read().to_string(),
        "bg-200" => BG_200.read().to_string(),
        _ => "".to_string(),
    }
}

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
    let launch_config: LaunchConfig<'_> = LaunchConfig::<()>::new()
        .with_title("Flux Editor")
        .on_setup(move |window| {
            #[cfg(target_os = "macos")]
            {
                use objc2::msg_send;
                use objc2::runtime::AnyObject;
                use tracing::error;

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
            }
        });

    launch_cfg(app, launch_config);
}

fn app() -> Element {
    let scroll_controller = use_scroll_controller(ScrollConfig::default);

    *CHAR_WIDTH.write() = get_char_width();

    // WINDOW is not immediately available
    use_future(move || async move {
        sleep(Duration::from_secs(1)).await;
        get_scale_factor();
    });

    rsx!(rect {
        width: "100%",
        height: "100%",
        background: "{BG_200}",
        TitleBar {}
        rect {
            width: "fill",
            height: "fill",
            direction: "horizontal",
            LineNumbers {
                scroll_controller: scroll_controller,
            }
            Editor {
                scroll_controller: scroll_controller,
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
