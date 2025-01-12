![splash](https://github.com/user-attachments/assets/17b7c33f-945f-4a1b-9264-c6d5efa96af8)

# TAuth

TAuth is a TOTP and password manager application built using Tauri, React, and Rust. It allows users to securely store and manage their credentials, including passwords and two-factor authentication (2FA) codes.

## Features

-   **Password Management**: Store and manage your passwords securely.
-   **Two-Factor Authentication (2FA)**: Generate and store TOTP codes for added security.
-   **Key Pair Management**: Store and manage SSH key pairs.
-   **Secure Storage**: All credentials are encrypted and stored securely.

## Installation

1. **Clone the repository**:

    ```sh
    git clone https://github.com/Inplex-sys/tauth.git
    cd tauth
    ```

2. **Install dependencies**:

    ```sh
    bun install
    ```

3. **Build the project**:

    ```sh
    bun run build
    ```

4. **Run the development server**:
    ```sh
    bun run tauri dev
    ```

## Usage

1. **Register**: Create a new account by providing a password.
2. **Login**: Log in using your password.
3. **Add Credentials**: Add new credentials (passwords, 2FA codes, SSH key pairs) to your secure vault.
4. **Manage Credentials**: View, update, and delete your stored credentials.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Acknowledgements

-   [Tauri](https://tauri.app/)
-   [React](https://reactjs.org/)
-   [Rust](https://www.rust-lang.org/)
