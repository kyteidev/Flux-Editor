use skia_safe::{
    scalar,
    textlayout::{FontCollection, ParagraphBuilder, ParagraphStyle, TextStyle},
    FontMgr,
};
use tracing::info;

pub fn get_char_width() -> f32 {
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
