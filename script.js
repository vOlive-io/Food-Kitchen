// ✅ Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "foodkitchen-37f44.firebaseapp.com",
  projectId: "foodkitchen-37f44",
  storageBucket: "foodkitchen-37f44.firebasestorage.app",
  messagingSenderId: "803378208472",
  appId: "1:803378208472:web:bb30cf298391ba16d901ad",
  measurementId: "G-29DDTPH087"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const foodInput = document.getElementById("foodInput");
const foodImageUrl = document.getElementById("foodImageUrl");
const addFoodButton = document.getElementById("addFood");
const foodCardArray = document.getElementById("foodCardArray");

// ✅ Add food to Firestore
addFoodButton.addEventListener("click", async () => {
  const name = foodInput.value.trim();
  const imageUrl = foodImageUrl.value.trim() || "";

  if (!name) {
    alert("Please enter a food name!");
    return;
  }

  try {
    await db.collection("foods").add({
      name,
      imageUrl,
      rating: 0,
      numRatings: 0
    });

    foodInput.value = "";
    foodImageUrl.value = "";
  } catch (error) {
    console.error("Error adding food:", error);
  }
});

// ✅ Display foods in real time
db.collection("foods").onSnapshot(snapshot => {
  foodCardArray.innerHTML = "";
  snapshot.forEach(doc => {
    const food = doc.data();
    const card = document.createElement("div");
    card.classList.add("foodCards");

    card.innerHTML = `
      <h2>${food.name}</h2>
      ${food.imageUrl ? `<img src="${food.imageUrl}" alt="${food.name}">` : ""}
      <div class="stars" data-id="${doc.id}">
        ${[1,2,3,4,5].map(i => `<span data-value="${i}">★</span>`).join("")}
      </div>
      <p>Average Rating: ${food.numRatings > 0 ? (food.rating / food.numRatings).toFixed(1) : "No ratings yet"}</p>
    `;

    foodCardArray.appendChild(card);
  });

  attachStarListeners();
});

// ✅ Handle star ratings
function attachStarListeners() {
  document.querySelectorAll(".stars span").forEach(star => {
    star.addEventListener("click", async (e) => {
      const value = parseInt(e.target.dataset.value);
      const id = e.target.parentElement.dataset.id;

      const docRef = db.collection("foods").doc(id);
      const docSnap = await docRef.get();
      const food = docSnap.data();

      const newTotal = food.rating + value;
      const newCount = food.numRatings + 1;

      await docRef.update({
        rating: newTotal,
        numRatings: newCount
      });
    });
  });
}
