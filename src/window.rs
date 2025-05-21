#[cfg(target_os = "macos")]
use cocoa::{
    appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility},
    base::id,
};

#[cfg(target_os = "macos")]
pub fn set_transparent_titlebar(ns_window: id) {
    unsafe {
        NSWindow::setTitlebarAppearsTransparent_(ns_window, cocoa::base::YES);
        let mut style_mask = ns_window.styleMask();
        style_mask.set(NSWindowStyleMask::NSFullSizeContentViewWindowMask, true);

        ns_window.setStyleMask_(style_mask);

        ns_window.setTitleVisibility_(NSWindowTitleVisibility::NSWindowTitleHidden);

        ns_window.setTitlebarAppearsTransparent_(cocoa::base::YES);
    }
}
