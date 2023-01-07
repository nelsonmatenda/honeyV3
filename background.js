import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "aulas-XXXX.firebaseapp.com",
  projectId: "aulas-XXXX",
  storageBucket: "aulas-XXXXX.appspot.com",
  messagingSenderId: "XXXXXX",
  appId: "1:XXXXXXX:web:XXXXXXXXXXXXXXXX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.command === "fetch") {
    const domain = msg.data.domain;
    const enc_domain = btoa(domain);
    const domainRef = ref(db, `domain/${enc_domain}`);
    onValue(domainRef, async (snapshot) => {
      const data = snapshot.val();
      await response({ type: "result", state: "success", data });
    });
  }
  if (msg.command === "post") {
    const domain = msg.data.domain;
    const enc_domain = btoa(domain);
    const newCoupon = {
      code: msg.data.code,
      description: msg.data.desc,
    };

    try {
      const refDomain = ref(db, `domain/${enc_domain}`);
      const couponID = push(refDomain, newCoupon).key;

      response({
        type: "result",
        status: "success",
        data: couponID,
        request: msg,
      });
    } catch (error) {
      console.log(error);
      response({ type: "result", status: "error", data: error, request: msg });
    }
  }
  return true;
});
