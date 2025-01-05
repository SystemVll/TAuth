use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Error, Key, Nonce,
};

pub fn decrypt(mut password: String, encrypted_data: Vec<u8>) -> Result<String, Error> {
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

pub fn encrypt(mut password: String, plaintext: String) -> Vec<u8> {
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
