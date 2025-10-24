use memsec::{memzero, mlock, munlock};
use serde_json::Value;
use std::{
    fs::File,
    io::{Read, Write},
};
use zeroize::Zeroize;

use crate::vault;

#[derive(Zeroize)]
struct SensitiveData {
    content: String,
    locked: bool,
}

impl SensitiveData {
    fn new(content: String) -> Self {
        let mut data = Self {
            content,
            locked: false,
        };

        // Lock the memory to prevent swapping
        unsafe {
            let ptr = data.content.as_ptr();
            let len = data.content.len();
            if mlock(ptr as *mut u8, len) {
                data.locked = true;
            }
        }

        data
    }

    fn expose(&self) -> &str {
        &self.content
    }
}

impl Drop for SensitiveData {
    fn drop(&mut self) {
        if self.locked {
            unsafe {
                let ptr = self.content.as_ptr();
                let len = self.content.len();
                munlock(ptr as *mut u8, len);
                memzero(ptr as *mut u8, len);
            }
        }
    }
}

pub fn write(password: &str, credentials: Value) {
    let container_path = vault::get_container_path();
    let sensitive_password = SensitiveData::new(password.to_string());

    // Convert credentials to string in a memory-safe way
    let credentials_str = credentials.to_string();
    let encrypted_data: Vec<u8> =
        vault::encrypt(sensitive_password.expose().to_string(), credentials_str);

    let mut descriptor = File::create(container_path).expect("failed to create file");
    let _ = descriptor
        .write_all(&encrypted_data)
        .map_err(|e| e.to_string());
}

pub fn read(password: &str) -> Value {
    let container_path = vault::get_container_path();

    let mut descriptor: File = match File::open(container_path) {
        Ok(file) => file,
        Err(_) => return Value::Null,
    };

    let mut contents: Vec<u8> = Vec::new();

    if descriptor.read_to_end(&mut contents).is_err() {
        return Value::Null;
    }

    let sensitive_password = SensitiveData::new(password.to_string());

    let mut decrypted_string =
        match vault::decrypt(sensitive_password.expose().to_string(), contents) {
            Ok(decrypted) => decrypted,
            Err(_) => return Value::Null,
        };

    let container = match serde_json::from_str(&decrypted_string) {
        Ok(json) => json,
        Err(_) => {
            unsafe {
                let ptr = decrypted_string.as_ptr();
                let len = decrypted_string.len();
                memzero(ptr as *mut u8, len);
            }
            decrypted_string.zeroize();

            return Value::Null;
        }
    };

    unsafe {
        let ptr = decrypted_string.as_ptr();
        let len = decrypted_string.len();
        memzero(ptr as *mut u8, len);
    }
    decrypted_string.zeroize();

    container
}
