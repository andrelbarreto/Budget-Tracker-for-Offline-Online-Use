let Budgetdb;
// creates request for new budgetdb with indexedDB.open() that opens db using:
// error, success, upgradeneeded
const req = indexedDB.open("budget", 1);

// upgradeneeded event
req.onupgradeneeded = (event) => {
    const db = event.target.result
    // creates new object 
    db.createObjectStore("pending", { autoIncrement: true })
};

// in case it is sucessful
req.onsuccess = (event) => {
    Budgetdb = event.target.result
    // if online, check the database
    if (navigator.onLine) {
        ReadDB()
    }
};

// in case of error 
req.onerror = (event) => {
    // console log "error" and its code
    console.log("Error encountered:", event.target.errorCode)
};

function saveTransaction(rec) {
// function for saving record
    // pending read/write transaction from databse = transact
    const transactaction = Budgetdb.transaction(["pending"], "readwrite")
    // function to store the pending transaction record
    const store = transactaction.objectStore("pending")
    // saving the pending objectStore record
    store.add(rec)
};

// function to read transaction recs from db
function ReadDB () {
    const transactions = Budgetdb.transaction(["pending"], "readwrite")
    const stores = transactions.objectStore("pending")
    // getAll() method for  matching specified parameter OR
    // all objects in store if no parameters specified 
    const getAll = stores.getAll()
    // get all object stores onsuccess event if result.length > 0
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            // fetch bulk to post getAll results via json stringify
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            //  clears stores of pending transactions once stored to db
            .then(() => {
                const transactions = Budgetdb.transaction(["pending"], "readwrite")
                const stores = transactions.objectStore("pending")
                stores.clear()
            })
        }
    }
};
//wait for app to return online
window.addEventListener("online", ReadDB);