use freya::prelude::*;

mod themes;
//use themes::dark::DARK_THEME;

mod components;
use components::{editor::editor::Editor, title_bar::title_bar::TitleBar};
use self_update::cargo_crate_version;
use semver::Version;
use tracing::{error, info, Level};
use tracing_subscriber::FmtSubscriber;

#[cfg(target_os = "macos")]
use cocoa::base::id;

#[cfg(target_os = "macos")]
use objc::msg_send;
#[cfg(target_os = "macos")]
use objc::runtime::Object;
#[cfg(target_os = "macos")]
use objc::sel;
#[cfg(target_os = "macos")]
use objc::sel_impl;
#[cfg(target_os = "macos")]
use winit::raw_window_handle::{HasWindowHandle, RawWindowHandle};

mod window;
use window::set_transparent_titlebar;

pub static BG_COLOR: GlobalSignal<&str> = GlobalSignal::new(|| "white");

pub fn get_colors(color: &str) -> String {
    match color {
        "bg" => BG_COLOR.read().to_string(),
        _ => "".to_string(),
    }
}

fn main() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    check_update(false);

    launch_cfg(
        app,
        LaunchConfig::<()>::new()
            .with_title("Flux Editor")
            .with_decorations(true)
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
            }),
    );
}

fn app() -> Element {
    rsx!(rect {
        width: "100%",
        height: "100%",
        background: "{BG_COLOR}",
        TitleBar {}
        Editor {}
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
