# 🔐 TAuth: Secure Credential Manager

<p align="center">
  <a href="https://github.com/SystemVll/TAuth/releases/latest" target="_blank">
    <img src="https://img.shields.io/badge/⬇️%20Download%20Latest-TAuth-blueviolet?style=for-the-badge&logo=github" alt="Download TAuth" style="margin-bottom: 20px;"/>
  </a>
</p>

> **TAuth** is a modern, secure credential manager built with Tauri, React, and Rust. Keep your passwords, 2FA codes, and SSH keys safe in one elegant application! ✨

## ⚖️ Why TAuth?

TAuth was created as a simple, open alternative to other authentication apps that may be closed source or store your data in the cloud <span style="background-color: red;">without transparency</span> (Google). With TAuth, your credentials are always encrypted and stored locally—giving you full control and peace of mind. Make your big brother smaller day after day.

## ✨ Features

-   🔑 **Password Management** — Securely store and organize all your passwords
-   🔢 **Two-Factor Authentication (2FA)** — Generate TOTP codes instantly without needing your phone
-   🔐 **Key Pair Management** — Organize and access your SSH key pairs effortlessly
-   🛡️ **End-to-End Encryption** — All your data is encrypted locally; nothing is stored in the cloud
-   🖥️ **Cross-Platform** — Works on Windows, macOS, and Linux
-   💾 **Memory Attack Resistant** — Sensitive data is securely handled in memory to prevent extraction through memory dumps or cold boot attacks

## 🚀 Getting Started

### Installation

1. **Clone the repository** 📂

    ```sh
    git clone https://github.com/SystemVll/TAuth.git
    cd tauth
    ```

2. **Install dependencies** 📦

    ```sh
    bun install
    ```

3. **Build the project** 🔨

    ```sh
    bun run build
    ```

4. **Run the development server** ⚡
    ```sh
    bun run tauri dev
    ```

### Usage Guide

1. **Register** 📝 — Create a secure master password (this will encrypt all your credentials)
2. **Login** 🔓 — Unlock your vault using your master password
3. **Add Credentials** ➕ — Store your passwords, 2FA tokens, or SSH keys
4. **Manage Everything** 🗂️ — View, search, edit, and delete your stored credentials

## 🔒 Security

TAuth prioritizes your security:

-   Your master password never leaves your device
-   All data is encrypted with industry-standard algorithms
-   No data is transmitted to external servers

## 👥 Contributing

Contributions make TAuth better! Here's how you can help:

-   🐛 **Report bugs** by opening an issue
-   💡 **Suggest features** to enhance functionality
-   🧪 **Submit pull requests** to improve the codebase

## 🙏 Acknowledgements

-   [⚛️ Tauri](https://tauri.app/) — For the secure, lightweight framework
-   [⚡ React](https://reactjs.org/) — For the responsive UI components
-   [🦀 Rust](https://www.rust-lang.org/) — For the secure backend implementation

---

<div align="center">
  <p>Made with ❤️ for secure credential management</p>
</div>
