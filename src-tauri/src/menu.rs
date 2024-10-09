use tauri::{
    menu::{Menu, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    AppHandle, Wry,
};

pub fn menu(app: &AppHandle) -> Menu<Wry> {
    let app_settings = MenuItemBuilder::new("Settings")
        .id("settings")
        .accelerator("CmdOrCtrl+,")
        .build(app)
        .unwrap();

    let app_menu = SubmenuBuilder::new(app, "App")
        .text("about", "About")
        .text("update", "Check for Updates")
        .separator()
        .item(&app_settings)
        .separator()
        .services()
        .separator()
        .quit()
        .build()
        .unwrap();

    let file_new_file = MenuItemBuilder::new("New File")
        .id("new_file")
        .accelerator("CmdOrCtrl+N")
        .build(app)
        .unwrap();

    let file_new_project = MenuItemBuilder::new("New Project")
        .id("new_project")
        .accelerator("CmdOrCtrl+Shift+N")
        .build(app)
        .unwrap();

    let file_new_window = MenuItemBuilder::new("New Window")
        .id("new_window")
        .accelerator("CmdOrCtrl+W")
        .build(app)
        .unwrap();

    let file_open = MenuItemBuilder::new("Open...")
        .id("open")
        .accelerator("CmdOrCtrl+O")
        .build(app)
        .unwrap();

    let file_save = MenuItemBuilder::new("Save")
        .id("save")
        .accelerator("CmdOrCtrl+S")
        .build(app)
        .unwrap();

    let file_save_as = MenuItemBuilder::new("Save As...")
        .id("save_as")
        .accelerator("CmdOrCtrl+Shift+S")
        .build(app)
        .unwrap();

    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&file_new_file)
        .item(&file_new_project)
        .item(&file_new_window)
        .separator()
        .item(&file_open)
        .item(&file_save)
        .item(&file_save_as)
        .build()
        .unwrap();

    let edit_find = MenuItemBuilder::new("Find")
        .id("find")
        .accelerator("CmdOrCtrl+F")
        .build(app)
        .unwrap();

    let edit_replace = MenuItemBuilder::new("Replace")
        .id("replace")
        .accelerator("CmdOrCtrl+Alt+F")
        .build(app)
        .unwrap();

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .separator()
        .item(&edit_find)
        .item(&edit_replace)
        .build()
        .unwrap();

    let view_menu = SubmenuBuilder::new(app, "View")
        .text("themes", "Themes")
        .text("focus_mode", "Focus Mode")
        .build()
        .unwrap();

    let modules_search = MenuItemBuilder::new("Search")
        .id("search")
        .accelerator("Alt+Space")
        .build(app)
        .unwrap();

    let modules_file_browser = MenuItemBuilder::new("File Browser")
        .id("file_browser")
        .accelerator("CmdOrCtrl+1")
        .build(app)
        .unwrap();

    let modules_terminal = MenuItemBuilder::new("Terminal")
        .id("terminal")
        .accelerator("CmdOrCtrl+2")
        .build(app)
        .unwrap();

    let modules_menu = SubmenuBuilder::new(app, "Modules")
        .item(&modules_search)
        .item(&modules_file_browser)
        .item(&modules_terminal)
        .build()
        .unwrap();

    let help_submenu = SubmenuBuilder::new(app, "Legal Notices")
        .text("license", "Flux Editor License")
        .text("licenses-third-party-js", "JS Third Party Licenses")
        .text("licenses-third-party-rust", "Rust Third Party Licenses")
        .text("licenses-fonts", "Font Licenses and Legal Notices")
        .build()
        .unwrap();

    let help_menu = SubmenuBuilder::new(app, "Help")
        .text("logs", "View Logs")
        .item(&help_submenu)
        .build()
        .unwrap();

    let menu = MenuBuilder::new(app)
        .items(&[
            &app_menu,
            &file_menu,
            &edit_menu,
            &view_menu,
            &modules_menu,
            &help_menu,
        ])
        .build()
        .unwrap();

    menu
}
