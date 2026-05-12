const { openSystemDB } = require("./db");

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function login(username, password, deviceName = "Unknown Device") {
  const db = await openSystemDB();
  const tx = db.transaction(["users", "session"], "readwrite");

  const usersStore = tx.objectStore("users");
  const sessionStore = tx.objectStore("session");
  const usernameIndex = usersStore.index("username");

  return new Promise(async (resolve, reject) => {
    try {
      const request = usernameIndex.get(username);

      request.onsuccess = async () => {
        const user = request.result;

        if (!user) {
          return reject(new Error("User not found"));
        }

        const hashedPassword = await hashPassword(password);

        if (user.password !== hashedPassword) {
          return reject(new Error("Invalid password"));
        }

        sessionStore.put({
          id: "current",
          userId: user.id,
          username: user.username,
          deviceName,
          loginTime: new Date().toISOString(),
        });

        resolve({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            deviceName: user.deviceName,
            createdAt: user.createdAt,
          },
        });
      };

      request.onerror = () => {
        reject(request.error);
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  login,
};
