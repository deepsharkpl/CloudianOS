# Blueberry Auth API

Documentation for:

- `createAccount(data)`
- `login(username, password, deviceName)`

---

# createAccount(data)

Creates a new user account and saves system configuration.

## Import

```js
const { createAccount } = require('./createAccount');
```

---

## Usage

```js
await createAccount({
  username: 'john',
  password: '123456',
  deviceName: 'John Laptop',

  loginMethods: ['password'],

  network: {
    type: 'wifi',
    ssid: 'Home WiFi',
    password: 'wifi-password',
    autoConnect: true,
  },

  location: 'Poland',

  theme: 'dark',
  wallpaper: 'wallpaper.jpg',
  desktopLayout: 'default',

  timezone: 'Europe/Warsaw',
  timeFormat: '24h',

  language: 'en',
  keyboardLayout: 'us',

  region: 'US',
  numberFormat: '1,234.56',
  dateFormat: 'YYYY-MM-DD',

  autoUpdates: true,
  syncSettings: true,
  backups: true,
});
```

---

# createAccount Parameters

| Field          | Type    | Required | Description              |
| -------------- | ------- | -------- | ------------------------ |
| username       | string  | ✅       | Username                 |
| password       | string  | ✅       | User password            |
| deviceName     | string  | ✅       | Device name              |
| loginMethods   | array   | ❌       | Login methods            |
| network        | object  | ❌       | Network configuration    |
| location       | string  | ❌       | User location            |
| theme          | string  | ❌       | Theme (`light` / `dark`) |
| wallpaper      | string  | ❌       | Desktop wallpaper        |
| desktopLayout  | string  | ❌       | Desktop layout           |
| timezone       | string  | ❌       | Timezone                 |
| timeFormat     | string  | ❌       | `12h` or `24h`           |
| language       | string  | ❌       | System language          |
| keyboardLayout | string  | ❌       | Keyboard layout          |
| region         | string  | ❌       | Region                   |
| numberFormat   | string  | ❌       | Number format            |
| dateFormat     | string  | ❌       | Date format              |
| autoUpdates    | boolean | ❌       | Automatic updates        |
| syncSettings   | boolean | ❌       | Settings synchronization |
| backups        | boolean | ❌       | Backup system            |

---

# network Object

```js
network: {
  type: "wifi", // wifi | ethernet
  ssid: "Home WiFi",
  password: "wifi-password",
  autoConnect: true,
}
```

---

# login(username, password, deviceName)

Logs a user into the system.

## Import

```js
const { login } = require('./login');
```

---

## Usage

```js
await login('john', '123456', 'John Laptop');
```

---

# login Parameters

| Parameter  | Type   | Required | Description   |
| ---------- | ------ | -------- | ------------- |
| username   | string | ✅       | Username      |
| password   | string | ✅       | User password |
| deviceName | string | ❌       | Device name   |

---

# login Return Value

```js
{
  success: true,
  user: {
    id: 1,
    username: "john",
    deviceName: "John Laptop",
    createdAt: "2026-05-12T12:00:00.000Z"
  }
}
```

---

# Password Security

Passwords are automatically hashed using:

```txt
SHA-256
```

Passwords are never stored as plaintext.

---

# Session

After a successful login, an active session is created:

```js
{
  id: ('current', userId, username, deviceName, loginTime);
}
```

---

# System Stores

| Store    | Description       |
| -------- | ----------------- |
| users    | User accounts     |
| settings | System settings   |
| session  | Current session   |
| files    | Files and folders |

---

# Home Directory

A home directory is automatically created during account creation:

```txt
/home/{username}
```

Example:

```txt
/home/john
```
