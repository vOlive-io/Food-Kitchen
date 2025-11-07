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

// DOM elements
const addFoodBtn = document.getElementById("addFood");
const foodNameInput = document.getElementById("foodName");
const foodImageInput = document.getElementById("foodImageUrl");
const flavorSelect = document.getElementById("foodFlavor");
const foodCardArray = document.getElementById("foodCardArray");

const foodsTab = document.getElementById("foodsTab");
const requestsTab = document.getElementById("requestsTab");
const foodsSection = document.getElementById("foodsSection");
const requestsSection = document.getElementById("requestsSection");

const requestInput = document.getElementById("requestText");
const addRequestBtn = document.getElementById("addRequest");
const requestsList = document.getElementById("requestsList");

// Tabs
foodsTab.onclick = () => {
  foodsTab.classList.add("active");
  requestsTab.classList.remove("active");
  foodsSection.classList.add("active-section");
  requestsSection.classList.remove("active-section");
};
requestsTab.onclick = () => {
  requestsTab.classList.add("active");
  foodsTab.classList.remove("active");
  requestsSection.classList.add("active-section");
  foodsSection.classList.remove("active-section");
};

// Add food
addFoodBtn.onclick = async () => {
  const name = foodNameInput.value.trim();
  const imageUrl = foodImageInput.value.trim();
  const flavor = flavorSelect.value;

  if (!name) return alert("Please enter a food name!");
  await db.collection("foods").add({
    name,
    imageUrl,
    flavorType: flavor,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  foodNameInput.value = "";
  foodImageInput.value = "";
};

// Load foods
db.collection("foods").orderBy("createdAt", "desc").onSnapshot(snapshot => {
  foodCardArray.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const id = doc.id;

    const flavorIcons = {
      Spicy: "🌶️",
      Savory: "🍗",
      Sweet: "🍰",
      Cool: "🧊"
    };
    const flavorClasses = {
      Spicy: "spicy",
      Savory: "savory",
      Sweet: "sweet",
      Cool: "cool"
    };

    const foodCard = document.createElement("div");
    foodCard.className = `food-card ${flavorClasses[data.flavorType]}`;
    foodCard.innerHTML = `
      <div class="flavor-icon">${flavorIcons[data.flavorType]}</div>
      <h2>${data.name}</h2>
      ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.name}">` : ""}
      <div class="comment-section" id="comments-${id}"></div>
      <div class="add-comment">
        <select id="emoji-${id}">
          <option value="💬">💬</option>
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
        <input id="name-${id}" placeholder="Your name...">
        <input id="comment-${id}" placeholder="Your comment...">
        <button onclick="addComment('${id}')">Post 💬</button>
      </div>
    `;
    foodCardArray.appendChild(foodCard);

    loadComments(id);
  });
});

// Add comment
async function addComment(foodId) {
  const emoji = document.getElementById(`emoji-${foodId}`).value || "💬";
  const name = document.getElementById(`name-${foodId}`).value.trim() || "Anonymous";
  const comment = document.getElementById(`comment-${foodId}`).value.trim();

  if (!comment) return alert("Please enter a comment!");

  await db.collection("foods").doc(foodId).collection("comments").add({
    emoji,
    name,
    comment,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById(`comment-${foodId}`).value = "";
}

// Load comments
function loadComments(foodId) {
  const commentsDiv = document.getElementById(`comments-${foodId}`);
  db.collection("foods").doc(foodId).collection("comments").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    commentsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const c = doc.data();
      commentsDiv.innerHTML += `<div class="comment">${c.emoji} <b>${c.name}</b>: ${c.comment}</div>`;
    });
  });
}

// Add request
addRequestBtn.onclick = async () => {
  const text = requestInput.value.trim();
  if (!text) return alert("Please enter your request!");
  await db.collection("requests").add({
    requestText: text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  requestInput.value = "";
};

// Load requests
db.collection("requests").orderBy("createdAt", "desc").onSnapshot(snapshot => {
  requestsList.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `${data.requestText} <button class="delete-btn" onclick="deleteRequest('${doc.id}')">🗑️</button>`;
    requestsList.appendChild(li);
  });
});

// Delete request
async function deleteRequest(id) {
  await db.collection("requests").doc(id).delete();
}
