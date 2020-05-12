let db;
const request = window.indexedDB.open("budgetTrackerApp", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result; 
    db.createObjectStore("offline", {autoIncrement: true });

};

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
    console.log("Database Error :" + event.target.errorCode)
};

function saveRecord(record) {
  
  const transaction = db.transaction(["offline"], "readwrite"); 
  const offlineStore = transaction.objectStore("offline");

  offlineStore.add(record);

}

function checkDatabase() {

  const transaction = db.transaction(["offline"], "readwrite"); 
  const offlineStore = transaction.objectStore("offline");

  const requestGetAll = offlineStore.getAll();


  requestGetAll.onsuccess = function() {
    if (requestGetAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(requestGetAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["offline"], "readwrite");
        const offlineStore = transaction.objectStore("offline");
        offlineStore.clear();
      });
    }
  };
}

window.addEventListener("online", checkDatabase);