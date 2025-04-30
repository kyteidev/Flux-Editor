use freya::prelude::*;

mod themes;
//use themes::dark::DARK_THEME;

mod components;
use components::editor::editor::Editor;
use self_update::cargo_crate_version;
use semver::Version;
use tracing::{error, Level};
use tracing_subscriber::FmtSubscriber;

pub static BG_COLOR: GlobalSignal<&str> = GlobalSignal::new(|| "white");

fn main() {
    check_update();

    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

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

fn check_update() -> Result<bool, Box<dyn std::error::Error>> {
    let update = self_update::backends::github::Update::configure()
        .repo_owner("jaemk") //testing
        .repo_name("self_update")
        .bin_name("self_update")
        .current_version(cargo_crate_version!())
        .build()
        .map_err(|e| error!("Failed to check for updates: {}", e))
        .unwrap();

    let latest_version =
        Version::parse(update.get_latest_release().unwrap().version.as_str()).unwrap();
    let current_version = Version::parse(cargo_crate_version!()).unwrap();

    Ok(latest_version > current_version)
}
