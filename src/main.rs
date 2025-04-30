use freya::hotreload::FreyaCtx;
use freya::prelude::*;

mod themes;
//use themes::dark::DARK_THEME;

mod components;
use components::editor::editor::Editor;

pub static BG_COLOR: GlobalSignal<&str> = GlobalSignal::new(|| "white");

fn main() {
    dioxus_hot_reload::hot_reload_init!(Config::<FreyaCtx>::default());

    launch_cfg(
        app,
        LaunchConfig::<()>::builder()
            .with_title("Flux Editor")
            .build(),
    );
}

fn app() -> Element {
    rsx!(rect {
        width: "100%",
        height: "100%",
        background: "{BG_COLOR}",
        Editor {}
    })
}
