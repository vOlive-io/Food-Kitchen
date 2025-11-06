// ✅ Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
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

// ✅ Listen for changes (real-time)
db.collection("foods").onSnapshot(snapshot => {
  foodCardArray.innerHTML = "";
  snapshot.forEach(doc => {
    const food = doc.data();
    const card = document.createElement("div");
    card.classList.add("foodCards");

    const avgRating = food.numRatings > 0 ? (food.rating / food.numRatings).toFixed(1) : "No ratings yet";

    card.innerHTML = `
      <h2>${food.name}</h2>
      ${food.imageUrl ? `<img src="${food.imageUrl}" alt="${food.name}">` : ""}
      <div class="stars" data-id="${doc.id}">
        ${[1,2,3,4,5].map(i => `<span data-value="${i}">★</span>`).join("")}
      </div>
      <p>Average Rating: ${avgRating} (${food.numRatings} ratings)</p>
    `;

    foodCardArray.appendChild(card);
  });

  attachStarListeners();
});

// ✅ Handle star ratings with hover and click
function attachStarListeners() {
  document.querySelectorAll(".stars").forEach(starDiv => {
    const spans = Array.from(starDiv.querySelectorAll("span"));
    const foodId = starDiv.dataset.id;

    spans.forEach(star => {
      // Hover effect
      star.addEventListener("mouseenter", (e) => {
        const value = parseInt(e.target.dataset.value);
        spans.forEach((sp, i) => sp.classList.toggle("hovered", i < value));
      });

      starDiv.addEventListener("mouseleave", () => {
        spans.forEach(sp => sp.classList.remove("hovered"));
      });

      // Click rating
      star.addEventListener("click", async (e) => {
        const value = parseInt(e.target.dataset.value);
        const docRef = db.collection("foods").doc(foodId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const food = docSnap.data();
          const newTotal = (food.rating || 0) + value;
          const newCount = (food.numRatings || 0) + 1;

          await docRef.update({
            rating: newTotal,
            numRatings: newCount
          });

          // Update visuals immediately
          spans.forEach((sp, i) => sp.classList.toggle("active", i < value));
        }
      });
    });
  });
}
