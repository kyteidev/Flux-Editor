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

use std::collections::HashMap;
use std::future::Future;
use std::path::PathBuf;
use std::pin::Pin;
use std::sync::Arc;

use freya::prelude::*;
use tokio::fs;
use tracing::{error, warn};

use crate::{icons::get_icon, CONTENT};

#[derive(Clone, Debug)]
struct Item {
    name: String,
    path: PathBuf,
    is_folder: bool,
    depth: usize,
}

#[derive(Props, Clone, PartialEq)]
pub struct Props {
    path: PathBuf,
}

#[component]
pub fn FileBrowser(props: Props) -> Element {
    let items = use_signal(Vec::new);
    let open_folders = use_signal(HashMap::new);
    let root_path = Arc::new(props.path);

    fn build_items(
        path: PathBuf,
        depth: usize,
        open_folders: Arc<HashMap<PathBuf, bool>>,
    ) -> Pin<Box<dyn Future<Output = Vec<Item>> + Send + 'static>> {
        Box::pin(async move {
            let (files, folders) = match get_path_contents(&path).await {
                Ok((files, folders)) => (files, folders),
                Err(error) => {
                    error!("Failed to get path contents: {}", error);
                    return Vec::new();
                }
            };

            let mut list = Vec::with_capacity(files.len() + folders.len());

            for (name, folder_path) in folders {
                list.push(Item {
                    name: name.clone(),
                    path: folder_path.clone(),
                    is_folder: true,
                    depth,
                });

                let is_open = open_folders.get(&folder_path).copied().unwrap_or(false);
                if is_open {
                    let children =
                        build_items(folder_path, depth + 1, Arc::clone(&open_folders)).await;
                    list.extend(children);
                }
            }

            list.extend(files.into_iter().map(|(name, path)| Item {
                name,
                path,
                is_folder: false,
                depth,
            }));

            list
        })
    }

    let process_update = {
        let items = items.clone();
        let root_path = Arc::clone(&root_path);

        move |open_folders: Arc<HashMap<PathBuf, bool>>| {
            let mut items = items.clone();
            let path = (*root_path).clone();
            let open_map = Arc::clone(&open_folders);

            spawn(async move {
                let flat_items = build_items(path, 0, open_map).await;
                items.set(flat_items);
            });
        }
    };

    let handle_item_click = {
        let mut open_folders = open_folders.clone();
        let process_update = process_update.clone();

        move |item: Item| {
            if item.is_folder {
                {
                    let mut folders = open_folders.write();
                    let entry = folders.entry(item.path).or_insert(false);
                    *entry = !*entry;
                }

                let open_map = Arc::new(open_folders.peek().clone());
                process_update(open_map);
            }
        }
    };

    use_effect(move || {
        let open_map = Arc::new(open_folders.peek().clone());
        process_update(open_map);
    });

    rsx! {
        VirtualScrollView {
            width: "100%",
            height: "100%",
            length: items.len(),
            item_size: 32.0,
            builder: move |index, _: &Option<()>| {
                let items = items.read();
                let item = &items[index];

                let icon_key = if item.is_folder {
                    if open_folders.read().get(&item.path).copied().unwrap_or(false) {
                        "folder_open"
                    } else {
                        "folder_closed"
                    }
                } else {
                    "file"
                };

                let icon = get_icon(icon_key)
                    .map(|i| i.replace("currentColor", *CONTENT.peek()))
                    .unwrap_or_default();

                let margin = item.depth * 24;
                let item_clone = item.clone();
                let mut on_click = handle_item_click.clone();

                rsx! {
                    rect {
                        key: "{index}",
                        width: "100%",
                        height: "32",
                        direction: "horizontal",
                        main_align: "start",
                        cross_align: "center",
                        max_lines: "1",
                        onclick: move |_| on_click(item_clone.clone()),
                        rect {
                            padding: "4",
                            margin: "0 4 0 {margin}",
                            main_align: "center",
                            cross_align: "center",
                            svg {
                                width: "24",
                                height: "24",
                                svg_content: icon
                            }
                        }
                        label {
                            font_size: "16",
                            main_align: "start",
                            "{item.name}"
                        }
                    }
                }
            }
        }
    }
}

async fn get_path_contents(
    path: &PathBuf,
) -> Result<(Vec<(String, PathBuf)>, Vec<(String, PathBuf)>), std::io::Error> {
    let mut dirs = Vec::new();
    let mut files = Vec::new();

    let mut read_dir = fs::read_dir(path).await?;

    while let Some(entry) = read_dir.next_entry().await? {
        let name = entry.file_name();
        let name_str = name.to_string_lossy();

        if name_str.starts_with('.') {
            continue;
        }

        let metadata = match entry.metadata().await {
            Ok(m) => m,
            Err(e) => {
                warn!("Failed to get metadata for {}: {}", name_str, e);
                continue;
            }
        };

        let entry_path = entry.path();
        let entry_name = name_str.to_string();

        if metadata.is_dir() {
            dirs.push((entry_name, entry_path));
        } else if metadata.is_file() {
            files.push((entry_name, entry_path));
        }
    }

    dirs.sort_unstable_by_key(|(name, _)| name.to_lowercase());
    files.sort_unstable_by_key(|(name, _)| name.to_lowercase());

    Ok((files, dirs))
}
