// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::process::Command;
use std::fs;

#[tauri::command]
fn compile_latex(content: String) -> Result<String, String> {
    let tex_path = "temp.tex";
    fs::write(tex_path, content).map_err(|e| e.to_string())?;

    let output = Command::new("tectonic")
        .arg("-X")
        .arg("compile")
        .arg(tex_path)
        .output()
        .map_err(|e| format!("Cannot find tectonic: {}", e))?;

    if output.status.success() {
        Ok("Successful compile!".into())
    } else {
        let err_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Fail to compile: {}", err_msg))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![compile_latex])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}