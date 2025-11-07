// ✅ Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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

// 📦 DOM
const addFoodForm = document.getElementById("addFoodForm");
const foodCardArray = document.getElementById("foodCardArray");
const addRequestForm = document.getElementById("addRequestForm");
const requestList = document.getElementById("requestList");

// 🧭 Tabs
document.getElementById("foodTab").onclick = () => {
  document.getElementById("foodTab").classList.add("active");
  document.getElementById("requestTab").classList.remove("active");
  document.getElementById("foodSection").classList.add("active-section");
  document.getElementById("requestSection").classList.remove("active-section");
};

document.getElementById("requestTab").onclick = () => {
  document.getElementById("requestTab").classList.add("active");
  document.getElementById("foodTab").classList.remove("active");
  document.getElementById("requestSection").classList.add("active-section");
  document.getElementById("foodSection").classList.remove("active-section");
};

// 🍲 Add Food
addFoodForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("foodName").value.trim();
  const category = document.getElementById("foodCategory").value;
  const imageFile = document.getElementById("foodImage").files[0];
  let imageUrl = "";

  if (imageFile) {
    const imageRef = ref(storage, `foodImages/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    imageUrl = await getDownloadURL(imageRef);
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

// 🧊 Display Foods
onSnapshot(collection(db, "foods"), (snapshot) => {
  foodCardArray.innerHTML = "";
  const foods = [];
  snapshot.forEach((d) => foods.push({ id: d.id, ...d.data() }));
  foods.sort((a, b) => b.createdAt - a.createdAt);

  foods.forEach((food) => {
    const card = document.createElement("div");
    card.classList.add("foodCard", food.category);

    const imgHTML = food.imageUrl
      ? `<img src="${food.imageUrl}" alt="${food.name}">`
      : `<div style="height:180px;background:#fff3;border-radius:10px;display:flex;align-items:center;justify-content:center;"><i>No image</i></div>`;

    card.innerHTML = `
      <h3>${food.name}</h3>
      ${imgHTML}
      <div class="rating-display">${food.rating.toFixed(1)}/5 : ${food.ratingCount} ratings</div>
      <div class="stars" data-id="${food.id}">
        ${[1,2,3,4,5].map(i => `<span data-star="${i}">★</span>`).join("")}
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

    // ⭐ Ratings
    const stars = card.querySelectorAll(".stars span");
    stars.forEach((star, i) => {
      if (i < Math.round(food.rating)) star.classList.add("active");
      star.addEventListener("click", async () => {
        const newCount = (food.ratingCount || 0) + 1;
        const newRating = ((food.rating || 0) * (food.ratingCount || 0) + (i + 1)) / newCount;
        await updateDoc(doc(db, "foods", food.id), { rating: newRating, ratingCount: newCount });
      });
    });

    // 💬 Comments
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

      const emoji = "💬";
      const newComment = `${emoji} <b>${name}</b>: ${commentText.value.trim()}`;
      if (commentText.value.trim() !== "") {
        const updatedComments = [...(food.comments || []), newComment];
        await updateDoc(doc(db, "foods", food.id), { comments: updatedComments });
        commentText.value = "";
      }
    });

    foodCardArray.appendChild(card);
  });
});

// 🍕 Requests
addRequestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const reqText = document.getElementById("foodRequest").value.trim();
  if (reqText) {
    await addDoc(collection(db, "requests"), { request: reqText });
    addRequestForm.reset();
  }
});

onSnapshot(collection(db, "requests"), (snapshot) => {
  requestList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const li = document.createElement("li");
    li.textContent = docSnap.data().request;
    li.addEventListener("click", async () => {
      li.remove();
      await updateDoc(docSnap.ref, { request: "[REMOVED]" });
    });
    requestList.appendChild(li);
  });
});
