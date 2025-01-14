use serde_json::Value;
use std::{
    fs::File,
    io::{Read, Write},
};

mod vault;

pub fn write(password: &str, credentials: Value) {
    let encrypted_data: Vec<u8> = vault::encrypt(password.to_string(), credentials.to_string());

    let mut descriptor = File::create("data/container.encrypted")
        .map_err(|e| e.to_string())
        .unwrap();

    let _ = descriptor
        .write_all(&encrypted_data)
        .map_err(|e| e.to_string());
}

pub fn read(password: &str) -> Value {
    let mut descriptor: File = File::open("data/container.encrypted").expect("failed to open file");
    let mut contents: Vec<u8> = Vec::new();

    descriptor
        .read_to_end(&mut contents)
        .expect("failed to read file");

    let decrypted_string = vault::decrypt(password.to_string(), contents).unwrap();
    let decrypted: &str = decrypted_string.as_str();
    let container = serde_json::from_str(decrypted).expect("failed to parse JSON");

    container
}
