use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Error, Key, Nonce,
};
use std::{fs::File, io::Write, path::PathBuf};
use zeroize::Zeroize;

pub fn get_data_dir() -> PathBuf {
    let base = std::env::var("APPDATA").unwrap_or_else(|_| ".".to_string());
    let app_dir = base + "\\com.tauth.app";
    PathBuf::from(app_dir)
}

pub fn get_container_path() -> PathBuf {
    let dir = get_data_dir();
    if !dir.exists() {
        let _ = std::fs::create_dir_all(&dir);
    }

    dir.join("container.encrypted")
}

pub fn create() -> Result<(), String> {
    let container_path = get_container_path();
    let mut descriptor = File::create(container_path).map_err(|e| e.to_string())?;

    descriptor.write_all(b"").map_err(|e| e.to_string())
}

pub fn decrypt(mut password: String, encrypted_data: Vec<u8>) -> Result<String, Error> {
    if password.len() < 8 {
        return Err(Error);
    }

    if password.len() != 32 {
        let size = 32usize.saturating_sub(password.len());
        password = password + "\x21".repeat(size).as_str();
    }

    let key_bytes = password.as_bytes().to_vec();
    password.zeroize();

    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);

    if encrypted_data.len() < 12 {
        return Err(Error);
    }

    let (nonce_arr, ciphered_data) = encrypted_data.split_at(12);
    let nonce = Nonce::from_slice(nonce_arr);

    let cipher = Aes256Gcm::new(key);

    let plaintext = cipher.decrypt(nonce, ciphered_data)?;
    let decrypted_string = String::from_utf8(plaintext).map_err(|_| Error)?;

    Ok(decrypted_string)
}

pub fn encrypt(mut password: String, plaintext: String) -> Result<Vec<u8>, Error> {
    // Enforce a minimum length without panicking
    if password.len() < 8 {
        return Err(Error);
    }

    if password.len() != 32 {
        let size = 32usize.saturating_sub(password.len());
        password = password + "\x21".repeat(size).as_str();
    }

    let key_bytes = password.as_bytes().to_vec();
    password.zeroize();

    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let cipher = Aes256Gcm::new(key);

    let ciphered_data = cipher.encrypt(&nonce, plaintext.as_bytes())?;

    let mut encrypted_data: Vec<u8> = nonce.to_vec();
    encrypted_data.extend_from_slice(&ciphered_data);

    Ok(encrypted_data)
}
