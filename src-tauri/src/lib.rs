use libreauth::oath::TOTPBuilder;
use serde_json::{json, Value};
use uuid::Uuid;

mod driver;
mod vault;

#[tauri::command]
fn resolve_twofactor(password: &str, uid: &str) -> Value {
    let mut container = driver::read(password);
    if container.is_null() {
        return json!({ "success": false, "message": "Authentication failed. Invalid password." });
    }

    let credentials = match container.as_array_mut() {
        Some(arr) => arr,
        None => return json!({ "success": false, "message": "Corrupted data: expected an array container." }),
    };

    let credential = match credentials.iter_mut().find(|credential| {
        credential
            .as_object()
            .and_then(|o| o.get("uid"))
            .and_then(|v| v.as_str())
            .map(|id| id == uid)
            .unwrap_or(false)
    }) {
        Some(c) => c,
        None => return json!({ "success": false, "message": "Credential not found." }),
    };

    let credential_obj = match credential.as_object_mut() {
        Some(obj) => obj,
        None => return json!({ "success": false, "message": "Corrupted credential entry." }),
    };

    let creds = match credential_obj.get_mut("credential").and_then(|v| v.as_object_mut()) {
        Some(obj) => obj,
        None => return json!({ "success": false, "message": "Corrupted credential payload." }),
    };

    // twoFactor secret must be a base32 string
    let secret = match creds.get("twoFactor").and_then(|v| v.as_str()) {
        Some(s) if !s.is_empty() => s,
        _ => return json!({ "success": false, "message": "Two-factor secret not set for this credential." }),
    };

    let totp = match TOTPBuilder::new().base32_key(secret).finalize() {
        Ok(t) => t,
        Err(_) => return json!({ "success": false, "message": "Invalid two-factor secret." }),
    };

    let code = totp.generate();
    json!({ "success": true, "code": code })
}

#[tauri::command]
fn change_password(old_password: &str, new_password: &str) -> bool {
    let data = driver::read(old_password);
    if data.is_null() {
        return false;
    }
    // Persist with new password
    driver::write(new_password, data).is_ok()
}

#[tauri::command]
fn export_credentials(password: &str) -> Value {
    let data = driver::read(password);
    if data.is_null() {
        return json!({ "success": false, "message": "Authentication failed. Invalid password." });
    }

    json!({ "success": true, "data": data })
}

#[tauri::command]
fn remove_credentials(password: &str, uid: &str) -> Value {
    let mut container = driver::read(password);
    if container.is_null() {
        return json!({ "success": false, "message": "Authentication failed. Invalid password." });
    }

    let credentials = match container.as_array_mut() {
        Some(arr) => arr,
        None => return json!({ "success": false, "message": "Corrupted data: expected an array container." }),
    };

    let original_len = credentials.len();
    credentials.retain(|credential| {
        credential
            .as_object()
            .and_then(|o| o.get("uid"))
            .and_then(|v| v.as_str())
            .map(|id| id != uid)
            .unwrap_or(true)
    });

    if credentials.len() == original_len {
        return json!({ "success": false, "message": "Credential not found." });
    }

    match driver::write(password, json!(credentials)) {
        Ok(_) => json!({ "success": true }),
        Err(e) => json!({ "success": false, "message": e }),
    }
}

#[tauri::command]
fn update_credential(password: &str, uid: &str, credential_type: &str, credential: Value) -> Value {
    let mut container = driver::read(password);
    if container.is_null() {
        return json!({ "success": false, "message": "Authentication failed. Invalid password." });
    }

    let credentials = match container.as_array_mut() {
        Some(arr) => arr,
        None => return json!({ "success": false, "message": "Corrupted data: expected an array container." }),
    };

    let mut updated = false;
    for item in credentials.iter_mut() {
        if let Some(credential_obj) = item.as_object_mut() {
            if let Some(id) = credential_obj.get("uid").and_then(|v| v.as_str()) {
                if id == uid {
                    credential_obj.insert("type".to_string(), json!(credential_type));
                    credential_obj.insert("credential".to_string(), credential.clone());
                    updated = true;
                    break;
                }
            }
        }
    }

    if !updated {
        return json!({ "success": false, "message": "Credential not found." });
    }

    match driver::write(password, json!(credentials)) {
        Ok(_) => json!({ "success": true }),
        Err(e) => json!({ "success": false, "message": e }),
    }
}

#[tauri::command]
fn add_credential(password: &str, credential_type: &str, credential: Value) -> Value {
    let mut container = driver::read(password);
    if container.is_null() {
        return json!({ "success": false, "message": "Authentication failed. Invalid password." });
    }

    let uid = Uuid::new_v4().to_string();

    let credentials = match container.as_array_mut() {
        Some(arr) => arr,
        None => return json!({ "success": false, "message": "Corrupted data: expected an array container." }),
    };

    credentials.push(json!({
        "uid": uid,
        "type": credential_type,
        "credential": credential
    }));

    match driver::write(password, json!(credentials)) {
        Ok(_) => json!({ "success": true }),
        Err(e) => json!({ "success": false, "message": e }),
    }
}

#[tauri::command]
fn get_credentials(password: &str) -> Result<Vec<Value>, String> {
    let data = driver::read(password);
    if data.is_null() {
        return Err("Authentication failed. Invalid password.".to_string());
    }

    let arr = data.as_array().ok_or_else(|| "Corrupted data: expected an array container.".to_string())?;

    let response: Vec<Value> = arr
        .iter()
        .map(|credential| {
            let mut credential = credential.clone();

            if let Some(credential_obj) = credential.as_object_mut() {
                if let Some(creds) = credential_obj.get_mut("credential").and_then(|v| v.as_object_mut()) {
                    // If twoFactor is a string secret, expose as boolean true; otherwise false
                    let expose_as_true = creds.get("twoFactor").and_then(|v| v.as_str()).map(|s| !s.is_empty()).unwrap_or(false);
                    creds.insert("twoFactor".to_string(), Value::Bool(expose_as_true));
                }
            }

            credential
        })
        .collect();

    Ok(response)
}

#[tauri::command]
fn register(password: &str) -> Value {
    if let Err(e) = vault::create() {
        return json!({ "success": false, "message": format!("Failed to initialize vault: {}", e) });
    }

    match driver::write(password, json!([])) {
        Ok(_) => json!({ "success": true }),
        Err(e) => json!({ "success": false, "message": e }),
    }
}

#[tauri::command]
fn login(password: &str) -> bool {
    let container = driver::read(password);
    container.is_array()
}

#[tauri::command]
fn exists() -> bool {
    let container_path = vault::get_container_path();
    std::path::Path::new(&container_path).exists()
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
            update_credential,
            remove_credentials,
            export_credentials,
            change_password,
            resolve_twofactor
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
