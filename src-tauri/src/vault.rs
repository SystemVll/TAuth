use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Error, Key, Nonce,
};

use serde_json::Value;
use std::{
    fs::File,
    io::{Read, Write},
};

fn decrypt(mut password: String, encrypted_data: Vec<u8>) -> Result<String, Error> {
    assert!(
        password.len() >= 8,
        "password must be at least 8 characters long"
    );

    if password.len() != 32 {
        let size = 32 - password.len();
        password = password + "\x21".repeat(size).as_str();
    }

    let key = Key::<Aes256Gcm>::from_slice(password.as_bytes());

    let (nonce_arr, ciphered_data) = encrypted_data.split_at(12);
    let nonce = Nonce::from_slice(nonce_arr);

    let cipher = Aes256Gcm::new(key);

    let plaintext = cipher.decrypt(nonce, ciphered_data)?;

    let decrypted_string = String::from_utf8(plaintext).map_err(|_| aes_gcm::Error)?;
    Ok(decrypted_string)
}

fn encrypt(mut password: String, plaintext: String) -> Vec<u8> {
    assert!(
        password.len() >= 8,
        "password must be at least 8 characters long"
    );

    if password.len() != 32 {
        let size = 32 - password.len();
        password = password + "\x21".repeat(size).as_str();
    }

    let key = Key::<Aes256Gcm>::from_slice(password.as_bytes());
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let cipher = Aes256Gcm::new(key);

    let ciphered_data = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .expect("failed to encrypt");

    let mut encrypted_data: Vec<u8> = nonce.to_vec();
    encrypted_data.extend_from_slice(&ciphered_data);

    encrypted_data
}

pub fn write(password: &str, credentials: Value) {
    let encrypted_data: Vec<u8> = encrypt(password.to_string(), credentials.to_string());

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

    let decrypted_string = decrypt(password.to_string(), contents).unwrap();
    let decrypted: &str = decrypted_string.as_str();
    let container = serde_json::from_str(decrypted).expect("failed to parse JSON");

    container
}
