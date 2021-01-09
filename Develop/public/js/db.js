let db;

const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = e => {
    const db = e.target.result;
    db.createObjectStore("pendingList", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onsuccess = (e) => {
    db = e.target.result;
    if (navigator.onLine) updateDB();
};

request.onerror = (err) => {
    console.error(err)
};

function saveData(gainsLoses) {
    const transaction = db.transaction(["pendingList"], "readwrite");
    const store = transaction.objectStore("pendingList");

    store.add(gainsLoses);
};

function updateDB() {
    const transaction = db.transaction(["pendingList"], "readwrite");
    const store = transaction.objectStore("pendingList");
    const storeGetAll = store.getAll();
    
    storeGetAll.onsuccess = function() {
        const offlineDataLen = storeGetAll.result.length

        if (offlineDataLen > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(storeGetAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(
                (res) => console.log((res.json()))
                )
        }
    }
};

window.addEventListener("online", updateDB);
