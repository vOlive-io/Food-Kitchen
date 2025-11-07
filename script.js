// ===== Firebase Setup =====
const firebaseConfig = {
  apiKey: "AIzaSyBNDByWKc8Asfd-S70OEIuVpxQ3xG-bgss",
  authDomain: "foodkitchen-37f44.firebaseapp.com",
  projectId: "foodkitchen-37f44",
  storageBucket: "foodkitchen-37f44.firebasestorage.app",
  messagingSenderId: "803378208472",
  appId: "1:803378208472:web:bb30cf298391ba16d901ad",
  measurementId: "G-29DDTPH087",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// ===== DOM Elements =====
const foodCardArray = document.getElementById("foodCardArray");
const addFoodForm = document.getElementById("addFoodForm");

// ===== Add Food =====
addFoodForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("foodName").value.trim();
  const category = document.getElementById("foodCategory").value;
  const fileInput = document.getElementById("foodImage");
  const file = fileInput.files[0];

  if (!name || !category) {
    alert("Please fill out all fields!");
    return;
  }

  let imageUrl = "";

  try {
    if (file) {
      const storageRef = storage.ref("foodImages/" + file.name);
      await storageRef.put(file);
      imageUrl = await storageRef.getDownloadURL();
    }

    await db.collection("foods").add({
      name,
      category,
      imageUrl,
      rating: 0,
      ratingCount: 0,
      comments: [],
      createdAt: Date.now(),
    });

    addFoodForm.reset();
  } catch (err) {
    console.error("Error adding food:", err);
  }
});

// ===== Display Foods =====
db.collection("foods").onSnapshot((snapshot) => {
  foodCardArray.innerHTML = "";
  const foods = [];
  snapshot.forEach((d) => foods.push({ id: d.id, ...d.data() }));
  foods.sort((a, b) => b.createdAt - a.createdAt);

  foods.forEach((food) => {
    const card = document.createElement("div");
    card.classList.add("foodCard", food.category);

    // prevent crash on missing data
    const ratingValue = Number(food.rating) || 0;
    const ratingCount = Number(food.ratingCount) || 0;

    const imgHTML = food.imageUrl
      ? `<img src="${food.imageUrl}" alt="${food.name}">`
      : `<div class="no-image"><i>No image</i></div>`;

    card.innerHTML = `
      <h3>${food.name}</h3>
      ${imgHTML}
      <div class="rating-display">${ratingValue.toFixed(1)}/5 : ${ratingCount} ratings</div>
      <div class="stars" data-id="${food.id}">
        ${[1, 2, 3, 4, 5].map(i => `<span data-star="${i}">★</span>`).join("")}
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
        <input type="text" class="customName" placeholder="Your name here..." style="display:none;">
        <input type="text" class="commentText" placeholder="Add a comment...">
        <button class="submitComment">Comment</button>
      </div>
    `;
    foodCardArray.appendChild(card);

    // Custom name toggle
    const commenterSelect = card.querySelector(".commenter");
    const customNameInput = card.querySelector(".customName");
    commenterSelect.addEventListener("change", () => {
      customNameInput.style.display =
        commenterSelect.value === "custom" ? "block" : "none";
    });

    // Add comment
    const commentBtn = card.querySelector(".submitComment");
    commentBtn.addEventListener("click", async () => {
      const commentText = card.querySelector(".commentText").value.trim();
      const commenter =
        commenterSelect.value === "custom"
          ? customNameInput.value.trim()
          : commenterSelect.value;
      const emojiList = ["🌶️", "🧊", "😋", "🌟", "❤️‍🔥", "👍", "💬", "🥵", "🥶", "😀"];
      const emoji = "💬"; // default

      if (!commentText) {
        alert("Please enter a comment.");
        return;
      }

      const comment = `${emoji} <b>${commenter || "Anonymous"}</b>: ${commentText}`;
      const docRef = db.collection("foods").doc(food.id);
      await docRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion(comment),
      });
    });

    // Add rating
    const stars = card.querySelectorAll(".stars span");
    stars.forEach((star) => {
      star.addEventListener("click", async () => {
        const rating = Number(star.dataset.star);
        const docRef = db.collection("foods").doc(food.id);
        await db.runTransaction(async (transaction) => {
          const doc = await transaction.get(docRef);
          if (!doc.exists) return;
          const data = doc.data();
          const newCount = (data.ratingCount || 0) + 1;
          const newRating =
            ((data.rating || 0) * (data.ratingCount || 0) + rating) / newCount;
          transaction.update(docRef, {
            rating: newRating,
            ratingCount: newCount,
          });
        });
      });
    });
  });
});
