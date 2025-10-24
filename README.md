<p align="center">
  <a href="https://github.com/SystemVll/TAuth/releases/latest" target="_blank">
    <img src="https://img.shields.io/badge/⬇️%20Download%20Latest-TAuth-blueviolet?style=for-the-badge&logo=github" alt="Download TAuth" style="margin-bottom: 20px;"/>
  </a>
</p>

<div align="center">
  <img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/31ca86d6-776c-4206-9c6d-cf6693cd3073" />
</div>

<div align="center">
  <p><b>TAuth</b>: Keep all your credentials safe in an elegant application! ✨</p>
</div>

<hr/>

## ⚖️ Why TAuth?

TAuth was created as a simple, open alternative to other authentication apps that may be closed source or store your data in the cloud <span style="background-color: red;">without transparency</span> (Google). With TAuth, your credentials are always encrypted and stored locally giving you full control and peace of mind. Make your big brother smaller day after day.

## ✨ Features

-   🔑 **Password Management** Securely store and organize all your passwords
-   🔢 **Two-Factor Authentication (2FA)** Generate TOTP codes instantly without needing your phone
-   🔐 **Key Pair Management** Organize and access your SSH key pairs effortlessly
-   🛡️ **End-to-End Encryption** All your data is encrypted locally; nothing is stored in the cloud
-   🖥️ **Cross-Platform** Works on Windows, macOS, and Linux
-   💾 **Memory Attack Resistant** Sensitive data is securely handled in memory to prevent extraction through memory dumps or cold boot attacks

## 📸 Screenshots
<div align="center">
    <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 10px;"> 
      <img src="https://github.com/user-attachments/assets/10431ca1-f7fc-4daa-8093-40b153f0ead8" alt="Login Screen" width="24%" style="border-radius: 5px;"/> 
      <img src="https://github.com/user-attachments/assets/32057b28-24de-45fa-8fd8-baa48c8f7439" alt="Dashboard" width="24%" style="border-radius: 5px;"/> 
      <img src="https://github.com/user-attachments/assets/d45b71d2-54ea-40e0-9e80-73896788afc2" alt="Credentials View" width="24%" style="border-radius: 5px;"/> 
      <img src="https://github.com/user-attachments/assets/2caf003b-89c5-44cd-880e-074e00639d4b" alt="Add Credentials" width="24%" style="border-radius: 5px;"/> 
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
      <img src="https://github.com/user-attachments/assets/c428982f-405c-4b52-82a5-74200fa6da94" alt="Edit Credentials" width="24%" style="border-radius: 5px;"/>
      <img src="https://github.com/user-attachments/assets/bf122aca-24b0-4198-a11d-bb54d829f10e" alt="2FA Code" width="24%" style="border-radius: 5px;"/>
      <img src="https://github.com/user-attachments/assets/78ed442d-58fc-43a3-a69b-9108d200b610" alt="SSH Keys" width="24%" style="border-radius: 5px;"/>
      <img src="https://github.com/user-attachments/assets/69163b98-2d0d-4f75-a9dd-cb65238eb193" alt="Settings" width="24%" style="border-radius: 5px;"/>
    </div>
</div>

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

1. **Register** 📝 Create a secure master password (this will encrypt all your credentials)
2. **Login** 🔓 Unlock your vault using your master password
3. **Add Credentials** ➕ Store your passwords, 2FA tokens, or SSH keys
4. **Manage Everything** 🗂️ View, search, edit, and delete your stored credentials

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
