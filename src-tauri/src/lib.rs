use libreauth::oath::TOTPBuilder;
use serde_json::{json, Value};
use uuid::Uuid;

mod driver;

#[tauri::command]
fn resolve_twofactor(password: &str, uid: &str) -> Value {
    let mut container = driver::read(password);

    let credentials = container.as_array_mut().unwrap();

    let credential = credentials.iter_mut().find(|credential| {
        let credential = credential.as_object().unwrap();
        let id = credential.get("uid").unwrap().as_str().unwrap();

        id == uid
    });

    let credential_obj = credential.unwrap().as_object_mut().unwrap();

    let credentials = credential_obj
        .get_mut("credential")
        .unwrap()
        .as_object_mut()
        .unwrap();

    let secret = credentials.get("twoFactor").unwrap().as_str().unwrap();
    let totp = TOTPBuilder::new().base32_key(secret).finalize().unwrap();

    let code = totp.generate();
    let response: Value = json!({ "success": true, "code": code });

    response
}

#[tauri::command]
fn remove_credentials(password: &str, uid: &str) -> Value {
    let mut container = driver::read(password);
    let credentials = container.as_array_mut().unwrap();

    credentials.retain(|credential| {
        let credential = credential.as_object().unwrap();
        let id = credential.get("uid").unwrap().as_str().unwrap();

        id != uid
    });

    driver::write(password, json!(credentials));

    let response: Value = json!({ "success": true });

    response
}

#[tauri::command]
fn add_credential(password: &str, credential_type: &str, credential: Value) -> Value {
    let mut container = driver::read(password);

    let uid = Uuid::new_v4().to_string();

    let credentials = container.as_array_mut().unwrap();
    credentials.push(json!({
        "uid": uid,
        "type": credential_type,
        "credential": credential
    }));

    driver::write(password, json!(credentials));

    let response: Value = json!({ "success": true });

    response
}

#[tauri::command]
fn get_credentials(password: &str) -> Vec<Value> {
    let data = driver::read(password);

    let response: Vec<Value> = data
        .as_array()
        .unwrap()
        .iter()
        .map(|credential| {
            let mut credential = credential.clone();
            let credential_obj = credential.as_object_mut().unwrap();

            let credentials = credential_obj
                .get_mut("credential")
                .unwrap()
                .as_object_mut()
                .unwrap();

            let twofactor = credentials
                .entry("twoFactor")
                .or_insert(serde_json::Value::Bool(false));

            if twofactor.is_boolean() {
                *twofactor = serde_json::Value::Bool(false);
            } else {
                *twofactor = serde_json::Value::Bool(true);
            }

            credential
        })
        .collect();

    response
}

#[tauri::command]
fn register(password: &str) -> Value {
    driver::write(password, json!([]));

    let response: Value = json!({ "success": true });

    response
}

#[tauri::command]
fn login(password: &str) -> bool {
    let container = driver::read(password);

    if container.is_array() {
        return true;
    }

    false
}

#[tauri::command]
fn exists() -> bool {
    std::path::Path::new("data/container.encrypted").exists()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            login,
            register,
            exists,
            get_credentials,
            add_credential,
            remove_credentials,
            resolve_twofactor
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
