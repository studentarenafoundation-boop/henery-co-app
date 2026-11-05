import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// Reuse the existing Firebase app
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Connect Firestore
const db = getFirestore(app);

// Load active gemstone products
async function loadProducts() {
  const container = document.getElementById("products-container");

  if (!container) {
    console.error("Products container not found in index.html");
    return;
  }

  container.textContent = "Loading gemstones...";

  try {
    const productsQuery = query(
      collection(db, "products"),
      where("active", "==", true)
    );

    const snapshot = await getDocs(productsQuery);

    container.replaceChildren();

    if (snapshot.empty) {
      container.textContent = "No gemstones available yet.";
      return;
    }

    snapshot.forEach((document) => {
      const product = document.data();

      const card = document.createElement("article");
      card.className = "product-card";

      if (product.image) {
        const img = document.createElement("img");
        img.src = product.image;
        img.alt = product.name || "Gemstone";
        img.loading = "lazy";
        card.appendChild(img);
      }

      const name = document.createElement("h3");
      name.textContent = product.name || "Gemstone";

      const price = document.createElement("p");
      price.textContent = "₹" + Number(product.price || 0).toLocaleString("en-IN");

      const category = document.createElement("p");
      category.textContent = product.category || "";

      const description = document.createElement("p");
      description.textContent = product.description || "";

      card.append(name, price, category, description);
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Firestore error:", error);
    container.textContent =
      "Unable to load gemstones. Please try again later.";
  }
}

loadProducts();
