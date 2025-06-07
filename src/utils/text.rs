/*
Copyright © 2024-2025 kyteidev.

This file is part of Fluxium.

Fluxium is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

Fluxium is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Fluxium. If not, see
<https://www.gnu.org/licenses/>.
*/

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

pub fn get_leading_whitespaces(s: &str) -> usize {
    s.chars().take_while(|&c| c.is_whitespace()).count()
}
