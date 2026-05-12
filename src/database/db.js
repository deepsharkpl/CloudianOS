const DB_NAME = "Blueberry";
const DB_VERSION = 1;

let dbInstance = null;
let dbPromise = null;

function openSystemDB() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("users")) {
        const users = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });
        users.createIndex("username", "username", { unique: true });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", {
          keyPath: "key",
        });
      }

      if (!db.objectStoreNames.contains("session")) {
        db.createObjectStore("session", {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains("files")) {
        const files = db.createObjectStore("files", {
          keyPath: "path",
        });
        files.createIndex("owner", "owner", { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstance = null;
        console.warn("Database updated in another tab. Please reload.");
      };

      resolve(dbInstance);
    };

    request.onblocked = () => {
      console.warn("Database upgrade blocked by another open tab.");
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

module.exports = {
  openSystemDB,
};