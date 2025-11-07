// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBNDByWKc8Asfd-S70OEIuVpxQ3xG-bgss",
  authDomain: "foodkitchen-37f44.firebaseapp.com",
  projectId: "foodkitchen-37f44",
  storageBucket: "foodkitchen-37f44.firebasestorage.app",
  messagingSenderId: "803378208472",
  appId: "1:803378208472:web:bb30cf298391ba16d901ad",
  measurementId: "G-29DDTPH087"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM Elements
const addFoodForm = document.getElementById("addFoodForm");
const foodCardArray = document.getElementById("foodCardArray");
const addRequestForm = document.getElementById("addRequestForm");
const requestList = document.getElementById("requestList");
const foodTab = document.getElementById("foodTab");
const requestTab = document.getElementById("requestTab");
const foodSection = document.getElementById("foodSection");
const requestSection = document.getElementById("requestSection");

// Tabs
foodTab.addEventListener("click", () => {
  foodTab.classList.add("active");
  requestTab.classList.remove("active");
  foodSection.classList.add("active-section");
  requestSection.classList.remove("active-section");
});

requestTab.addEventListener("click", () => {
  requestTab.classList.add("active");
  foodTab.classList.remove("active");
  requestSection.classList.add("active-section");
  foodSection.classList.remove("active-section");
});

// Add Food
addFoodForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("foodName").value.trim();
  const category = document.getElementById("foodCategory").value;
  const imageFile = document.getElementById("foodImage").files[0];
  let imageUrl = "";

  if (imageFile) {
    const storageRef = ref(storage, `foodImages/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "foods"), {
    name,
    category,
    imageUrl,
    rating: 0,
    ratingCount: 0,
    comments: [],
    createdAt: Date.now()
  });

  addFoodForm.reset();
});

// Display Foods
onSnapshot(collection(db, "foods"), (snapshot) => {
  foodCardArray.innerHTML = "";
  const foods = [];
  snapshot.forEach((doc) => foods.push({ id: doc.id, ...doc.data() }));

  foods.sort((a, b) => b.createdAt - a.createdAt); // Newest first

  foods.forEach((food) => {
    const card = document.createElement("div");
    card.classList.add("foodCard", food.category);

    const img = food.imageUrl
      ? `<img src="${food.imageUrl}" alt="${food.name}">`
      : "";

    card.innerHTML = `
      <h3>${food.name}</h3>
      ${img}
      <div class="rating-display">${food.rating.toFixed(1)}/5 : ${food.ratingCount} ratings</div>
      <div class="stars" data-id="${food.id}">
        ${[1,2,3,4,5].map(i => `<span data-star="${i}">★</span>`).join('')}
      </div>
      <div class="comments">
        ${(food.comments || []).map(c => `<div class="comment">${c}</div>`).join("")}
      </div>
      <div class="comment-input">
        <select class="commenter">
          <option value="">Choose name</option>
          <option value="Lars the Chef 🧑‍🍳">Lars the Chef 🧑‍🍳</option>
          <option value="Laurel">Laurel</option>
          <option value="Olive">Olive</option>
          <option value="German">German</option>
          <option value="Olivia">Olivia</option>
          <option value="custom">Custom...</option>
        </select>
        <input type="text" class="customName" placeholder="Your name here...">
        <input type="text" class="commentText" placeholder="Add a comment...">
        <button class="submitComment">Comment</button>
      </div>
    `;

    // Stars
    const stars = card.querySelectorAll(".stars span");
    stars.forEach((star, i) => {
      if (i < Math.round(food.rating)) star.classList.add("active");
      star.addEventListener("click", async () => {
        const newRatingCount = (food.ratingCount || 0) + 1;
        const newRating = ((food.rating || 0) * (food.ratingCount || 0) + (i + 1)) / newRatingCount;
        await updateDoc(doc(db, "foods", food.id), {
          rating: newRating,
          ratingCount: newRatingCount
        });
      });
    });

    // Comments
    const commenterSelect = card.querySelector(".commenter");
    const customNameInput = card.querySelector(".customName");
    const commentText = card.querySelector(".commentText");
    const submitComment = card.querySelector(".submitComment");

    commenterSelect.addEventListener("change", () => {
      if (commenterSelect.value === "custom") {
        customNameInput.parentElement.classList.add("showCustom");
      } else {
        customNameInput.parentElement.classList.remove("showCustom");
      }
    });

    submitComment.addEventListener("click", async () => {
      let name = commenterSelect.value;
      if (name === "custom") name = customNameInput.value.trim();
      if (!name) name = "💬";

      const emojis = ["🌶️","🧊","😋","🌟","❤️‍🔥","👍","💬","🥵","🥶","😀"];
      const emoji = "💬";
      const newComment = `${emoji} <b>${name}</b>: ${commentText.value.trim()}`;

      if (commentText.value.trim() !== "") {
        const newComments = [...(food.comments || []), newComment];
        await updateDoc(doc(db, "foods", food.id), { comments: newComments });
        commentText.value = "";
      }
    });

    foodCardArray.appendChild(card);
  });
});

// Food Requests
addRequestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const request = document.getElementById("foodRequest").value.trim();
  if (request) {
    await addDoc(collection(db, "requests"), { request });
    addRequestForm.reset();
  }
});

onSnapshot(collection(db, "requests"), (snapshot) => {
  requestList.innerHTML = "";
  snapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.textContent = doc.data().request;
    li.addEventListener("click", async () => {
      await updateDoc(doc.ref, { request: "[REMOVED]" });
      li.remove();
    });
    requestList.appendChild(li);
  });
});
