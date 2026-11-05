import { initializeApp, getApps, getApp }
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const db = getFirestore(app);

// Load products from Firestore
async function loadProducts() {
  const container = document.getElementById("products-container");

  if (!container) return;

  container.textContent = "Loading products...";

  try {
    const productsQuery = query(
      collection(db, "products"),
      where("active", "==", true)
    );

    const snapshot = await getDocs(productsQuery);

    container.replaceChildren();

    if (snapshot.empty) {
      container.textContent = "No products available.";
      return;
    }

    snapshot.forEach((doc) => {
      const product = doc.data();

      const card = document.createElement("div");
      card.className = "product-card";

      const name = document.createElement("h3");
      name.textContent = product.name || "Gemstone";

      const price = document.createElement("p");
      price.textContent = "₹" + (product.price || 0);

      const description = document.createElement("p");
      description.textContent = product.description || "";

      card.append(name, price, description);
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Firestore error:", error);
    container.textContent = "Unable to load products.";
  }
}

loadProducts();
