use freya::prelude::*;

fn main() {
    launch_cfg(
        app,
        LaunchConfig::<()>::builder()
            .with_title("Flux Editor")
            .build(),
    );
}

fn app() -> Element {
    rsx!(label {
        "Flux Editor"
    })
}
