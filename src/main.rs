use freya::prelude::*;

mod themes;
//use themes::dark::DARK_THEME;

mod components;
use components::editor::editor::Editor;
use self_update::cargo_crate_version;
use semver::Version;
use tracing::{error, info, Level};
use tracing_subscriber::FmtSubscriber;

pub static BG_COLOR: GlobalSignal<&str> = GlobalSignal::new(|| "white");

fn main() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    check_update(false);

    launch_cfg(app, LaunchConfig::<()>::new().with_title("Flux Editor"));
}

fn app() -> Element {
    rsx!(rect {
        width: "100%",
        height: "100%",
        background: "{BG_COLOR}",
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
