const { openSystemDB } = require("./db");

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createAccount(data) {
  const db = await openSystemDB();
  const hashedPassword = await hashPassword(data.password);

  const tx = db.transaction(
    ["users", "settings", "session", "files"],
    "readwrite",
  );

  const usersStore = tx.objectStore("users");
  const settingsStore = tx.objectStore("settings");
  const sessionStore = tx.objectStore("session");
  const filesStore = tx.objectStore("files");

  return new Promise((resolve, reject) => {
    const user = {
      username: data.username,
      password: hashedPassword,
      loginMethods: data.loginMethods || ["password"],
      deviceName: data.deviceName,
      createdAt: new Date().toISOString(),
    };

    const userRequest = usersStore.add(user);

    userRequest.onsuccess = () => {
      const userId = userRequest.result;
      const homeFolder = {
        path: `/home/${data.username}`,
        owner: userId,
        createdAt: new Date().toISOString(),
      };

      filesStore.add(homeFolder);

      settingsStore.put({
        key: `user:${userId}`,
        value: {
          homeFolder: homeFolder.path,

          network: {
            type: data.network?.type || "wifi",
            ssid: data.network?.ssid || null,
            password: data.network?.password || null,
            autoConnect: data.network?.autoConnect || false,
          },

          location: data.location || null,

          appearance: {
            theme: data.theme || "light",
            wallpaper: data.wallpaper || null,
            desktopLayout: data.desktopLayout || "default",
          },

          time: {
            timezone: data.timezone || "UTC",
            format: data.timeFormat || "24h",
          },

          language: data.language || "en",
          keyboardLayout: data.keyboardLayout || "us",

          region: {
            region: data.region || "US",
            numberFormat: data.numberFormat || "1,234.56",
            dateFormat: data.dateFormat || "YYYY-MM-DD",
          },

          system: {
            autoUpdates: data.autoUpdates ?? true,
            syncSettings: data.syncSettings ?? true,
            backups: data.backups ?? false,
          },
        },
      });

      sessionStore.put({
        id: "current",
        userId,
        deviceName: data.deviceName,
        loginTime: new Date().toISOString(),
      });
    };

    tx.oncomplete = () => {
      resolve({
        success: true,
      });
    };

    tx.onerror = () => {
      reject(tx.error);
    };
  });
}

module.exports = {
  createAccount,
};
