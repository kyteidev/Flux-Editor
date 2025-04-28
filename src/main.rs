use freya::hotreload::FreyaCtx;
use freya::prelude::*;

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
        background: "white",
        border: "1px solid black",
        padding: "10px",
        label {
            "Flux Editor"
        }
    })
}
