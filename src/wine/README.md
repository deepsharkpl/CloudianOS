# Wine Manager (macOS)

This project contains a system for managing Windows applications running through Wine on macOS.

## 📁 Project Structure

The `wine/` folder contains a Wine-based backend responsible for:

- launching `.exe` Windows applications
- managing Wine processes
- handling Wine prefixes (runtime environments)
- basic start/stop application control

## ⚙️ Wine Backend

The backend inside the `wine/` directory acts as a system layer between the web application and Wine.

Its purpose is to:

- receive commands (e.g. from a frontend API)
- execute Windows programs using Wine
- manage running application processes

## 🚧 Project Status

The project is **currently under development**.

Actively being built:

- Wine backend system
- Vite frontend integration
- application launcher / management system

## 💡 Project Goal

The goal is to build a simple Steam-like web panel for launching Windows applications on macOS using Wine.

---

⚠️ This project is still in early development and may undergo structural and API changes.
