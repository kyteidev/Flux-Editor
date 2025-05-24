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

mod themes;
//use themes::dark::DARK_THEME;

mod state;

mod components;
use components::{
    editor::{editor::Editor, line_numbers::LineNumbers},
    title_bar::title_bar::TitleBar,
};
use self_update::cargo_crate_version;
use semver::Version;
use skia_safe::{
    scalar,
    textlayout::{FontCollection, ParagraphBuilder, ParagraphStyle, TextStyle},
    FontMgr,
};
use state::CHAR_WIDTH;
use tracing::{error, info, Level};
use tracing_subscriber::FmtSubscriber;

#[cfg(target_os = "macos")]
use {
    cocoa::base::id,
    objc::{msg_send, runtime::Object, sel, sel_impl},
    winit::raw_window_handle::{HasWindowHandle, RawWindowHandle},
};

mod window;
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
        .with_decorations(false);

    #[cfg(target_os = "macos")]
    let launch_config: LaunchConfig<'_> = LaunchConfig::<()>::new()
        .with_title("Flux Editor")
        .on_setup(|window| {
            #[cfg(target_os = "macos")]
            {
                let handle = window.window_handle().unwrap().as_raw();

                if let RawWindowHandle::AppKit(appkit) = handle {
                    let ns_view_ptr = appkit.ns_view.as_ptr();

                    let ns_view: *mut Object = ns_view_ptr as *mut _;

                    unsafe {
                        let ns_window: id = msg_send![ns_view, window];
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
    let scroll_controller = use_scroll_controller(|| ScrollConfig::default());

    *CHAR_WIDTH.write() = get_char_width();

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

fn get_char_width() -> f32 {
    let mut paragraph_style = ParagraphStyle::default();
    let mut text_style = TextStyle::default();
    text_style.set_font_size(20.0);
    text_style.set_font_families(&["Menlo", "Monaco"]);
    paragraph_style.set_text_style(&text_style);

    let mut font_collection = FontCollection::new();
    font_collection
        .set_default_font_manager_and_family_names(FontMgr::default(), &["Menlo", "Monaco"]);

    let mut paragraph_builder = ParagraphBuilder::new(&paragraph_style, font_collection);

    paragraph_builder.add_text("uwu"); // ;)

    let mut paragraph = paragraph_builder.build();
    paragraph.layout(scalar::MAX);

    let char_width = paragraph.longest_line() / 3.0;
    info!("Character width: {}", char_width);

    char_width
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
