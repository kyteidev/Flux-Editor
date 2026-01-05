/*
Copyright © 2024-2026 kyteidev.

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

use freya::prelude::*;

use crate::BG_100;

#[derive(Props, Clone, PartialEq)]
pub struct Props {
    pub children: Element,
}

#[component]
pub fn StatusBarItem(props: Props) -> Element {
    rsx! {
        rect {
            width: "auto",
            height: "22",
            corner_radius: "4",
            background: *BG_100.read(),
            padding: "2",
            main_align: "center",
            cross_align: "center",
            {props.children}
        }
    }
}
