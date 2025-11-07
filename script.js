// 🔥 Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBNDByWKc8Asfd-S70OEIuVpxQ3xG-bgss",
  authDomain: "foodkitchen-37f44.firebaseapp.com",
  projectId: "foodkitchen-37f44",
  storageBucket: "foodkitchen-37f44.firebasestorage.app",
  messagingSenderId: "803378208472",
  appId: "1:803378208472:web:bb30cf298391ba16d901ad",
  measurementId: "G-29DDTPH087"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const foodCardArray = document.getElementById("foodCardArray");
const addFoodBtn = document.getElementById("addFood");
const foodNameInput = document.getElementById("foodName");
const foodImageInput = document.getElementById("foodImage");
const foodFlavorInput = document.getElementById("foodFlavor");
const addRequestBtn = document.getElementById("addRequest");
const requestInput = document.getElementById("requestInput");
const requestsList = document.getElementById("requestsList");

// Tabs
document.getElementById("foodsTab").onclick = () => switchTab("foods");
document.getElementById("requestsTab").onclick = () => switchTab("requests");

function switchTab(tab) {
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("section").forEach(s => s.classList.remove("active-section"));
  document.getElementById(tab + "Tab").classList.add("active");
  document.getElementById(tab + "Section").classList.add("active-section");
}

// Add Food
addFoodBtn.addEventListener("click", async () => {
  const name = foodNameInput.value.trim();
  const image = foodImageInput.value.trim();
  const flavor = foodFlavorInput.value;

  if (!name) return alert("Please enter a food name!");

  await db.collection("foods").add({
    name,
    image,
    flavor,
    createdAt: new Date()
  });

  foodNameInput.value = "";
  foodImageInput.value = "";
  foodFlavorInput.value = "spicy";
});

// Add Request
addRequestBtn.addEventListener("click", async () => {
  const text = requestInput.value.trim();
  if (!text) return alert("Please type a request!");

  await db.collection("requests").add({
    text,
    createdAt: new Date()
  });
  requestInput.value = "";
});

// Load Foods
db.collection("foods").orderBy("createdAt", "desc").onSnapshot(snapshot => {
  foodCardArray.innerHTML = "";
  snapshot.forEach(doc => {
    const food = doc.data();
    const card = document.createElement("div");
    card.className = `food-card ${food.flavor}`;
    const flavorIcons = {
      spicy: "🌶️",
      savory: "🍗",
      sweet: "🍰",
      cool: "🧊"
    };

    card.innerHTML = `
      <div class="flavor-icon">${flavorIcons[food.flavor] || "🍴"}</div>
      <h3>${food.name}</h3>
      <img src="${food.image || "https://via.placeholder.com/250"}" alt="${food.name}">
      <div class="comment-section" id="comments-${doc.id}">
        <h4>Comments</h4>
        <div class="comments"></div>
        <div class="add-comment">
          <select class="comment-name">
            <option value="Lars the Chef">Lars the Chef</option>
            <option value="Laurel">Laurel</option>
            <option value="Olive">Olive</option>
            <option value="German">German</option>
            <option value="Olivia">Olivia</option>
          </select>
          <select class="comment-emoji">
            <option value="💬">💬 (default)</option>
            <option value="🌶️">🌶️</option>
            <option value="🧊">🧊</option>
            <option value="😋">😋</option>
            <option value="🌟">🌟</option>
            <option value="❤️‍🔥">❤️‍🔥</option>
            <option value="👍">👍</option>
            <option value="🥵">🥵</option>
            <option value="🥶">🥶</option>
            <option value="😀">😀</option>
          </select>
          <input class="comment-input" placeholder="Add a comment..." />
          <button class="add-comment-btn">Post</button>
        </div>
      </div>
    `;

    const commentsDiv = card.querySelector(".comments");
    const commentBtn = card.querySelector(".add-comment-btn");
    const nameSelect = card.querySelector(".comment-name");
    const emojiSelect = card.querySelector(".comment-emoji");
    const commentInput = card.querySelector(".comment-input");

    // Load Comments
    db.collection("foods").doc(doc.id).collection("comments")
      .orderBy("createdAt", "asc")
      .onSnapshot(snap => {
        commentsDiv.innerHTML = "";
        snap.forEach(c => {
          const data = c.data();
          const div = document.createElement("div");
          div.classList.add("comment");
          div.innerHTML = `${data.emoji} <b>${data.name}</b>: ${data.text}`;
          commentsDiv.appendChild(div);
        });
      });

    // Add Comment
    commentBtn.addEventListener("click", async () => {
      const name = nameSelect.value;
      const text = commentInput.value.trim();
      const emoji = emojiSelect.value || "💬";
      if (!text) return;

      const displayName = name === "Lars the Chef" ? "👨‍🍳 Lars the Chef" : name;

      await db.collection("foods").doc(doc.id).collection("comments").add({
        name: displayName,
        text,
        emoji,
        createdAt: new Date()
      });

      commentInput.value = "";
    });

    foodCardArray.appendChild(card);
  });
});

// Load Requests
db.collection("requests").orderBy("createdAt", "desc").onSnapshot(snapshot => {
  requestsList.innerHTML = "";
  snapshot.forEach(doc => {
    const req = doc.data();
    const li = document.createElement("li");
    li.textContent = req.text;
    const del = document.createElement("button");
    del.textContent = "×";
    del.className = "delete-btn";
    del.onclick = () => db.collection("requests").doc(doc.id).delete();
    li.appendChild(del);
    requestsList.appendChild(li);
  });
});
