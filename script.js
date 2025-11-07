// 🔥 Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBNDByWKc8Asfd-S70OEIuVpxQ3xG-bgss",
  authDomain: "foodkitchen-37f44.firebaseapp.com",
  projectId: "foodkitchen-37f44",
  storageBucket: "foodkitchen-37f44.firebasestorage.app",
  messagingSenderId: "803378208472",
  appId: "1:803378208472:web:bb30cf298391ba16d901ad",
  measurementId: "G-29DDTPH087"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 🎉 Emoji options
const emojiOptions = ["🌶️", "🧊", "😋", "🌟", "❤️‍🔥", "👍", "💬", "🥵", "🥶", "😀"];
const defaultEmoji = "💬";

// 🍲 References
const foodSection = document.getElementById("foodCardArray");

// 🌈 Function to create each food card
function createFoodCard(id, data) {
  const card = document.createElement("div");
  card.className = `foodCard ${data.category.toLowerCase()}`;

  // 🖼️ Add image
  const img = document.createElement("img");
  if (data.imagePath) {
    getDownloadURL(ref(storage, data.imagePath))
      .then((url) => (img.src = url))
      .catch(() => (img.src = "https://via.placeholder.com/200?text=No+Image"));
  } else {
    img.src = "https://via.placeholder.com/200?text=No+Image";
  }

  // 🧾 Food info
  const name = document.createElement("h3");
  name.textContent = `${data.categoryIcon} ${data.name}`;

  const ratingDisplay = document.createElement("div");
  const avgRating = data.totalRatings
    ? (data.ratingSum / data.totalRatings).toFixed(1)
    : "0.0";
  ratingDisplay.className = "rating-display";
  ratingDisplay.textContent = `${avgRating}/5 : ${data.totalRatings || 0} ratings`;

  const starsDiv = document.createElement("div");
  starsDiv.classList.add("stars");
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.textContent = "★";
    if (i <= Math.round(avgRating)) star.classList.add("active");
    star.addEventListener("click", async () => {
      const newSum = (data.ratingSum || 0) + i;
      const newTotal = (data.totalRatings || 0) + 1;
      await updateDoc(doc(db, "foods", id), {
        ratingSum: newSum,
        totalRatings: newTotal
      });
    });
    starsDiv.appendChild(star);
  }

  // 💬 Comments section
  const commentsDiv = document.createElement("div");
  commentsDiv.classList.add("comments");
  if (data.comments && data.comments.length) {
    data.comments.forEach((c) => {
      const p = document.createElement("div");
      p.classList.add("comment");
      p.textContent = c;
      commentsDiv.appendChild(p);
    });
  } else {
    commentsDiv.textContent = "No comments yet...";
  }

  // ✏️ Comment input area
  const commentInput = document.createElement("div");
  commentInput.classList.add("comment-input");
  commentInput.innerHTML = `
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
    <select class="emojiSelect">
      ${emojiOptions.map((e) => `<option value="${e}">${e}</option>`).join("")}
    </select>
    <input type="text" class="commentText" placeholder="Write your comment...">
    <button class="addCommentBtn">Add Comment</button>
  `;

  // 👀 Custom name toggle
  const commenterSelect = commentInput.querySelector(".commenter");
  const customNameInput = commentInput.querySelector(".customName");
  commenterSelect.addEventListener("change", () => {
    if (commenterSelect.value === "custom") {
      commentInput.classList.add("showCustom");
    } else {
      commentInput.classList.remove("showCustom");
    }
  });

  // 📝 Add comment button
  commentInput.querySelector(".addCommentBtn").addEventListener("click", async () => {
    const selectedName =
      commenterSelect.value === "custom"
        ? customNameInput.value || "Anonymous"
        : commenterSelect.value || "Anonymous";

    const selectedEmoji = commentInput.querySelector(".emojiSelect").value || defaultEmoji;
    const commentText = commentInput.querySelector(".commentText").value.trim();
    if (!commentText) return;

    const formattedComment = `${selectedEmoji} ${selectedName}: ${commentText}`;
    await updateDoc(doc(db, "foods", id), {
      comments: arrayUnion(formattedComment)
    });

    commentInput.querySelector(".commentText").value = "";
  });

  // 🧩 Assemble card
  card.append(img, name, ratingDisplay, starsDiv, commentsDiv, commentInput);
  foodSection.appendChild(card);
}

// 🧠 Listen to Firestore for live updates
const q = query(collection(db, "foods"), orderBy("date", "desc"));
onSnapshot(q, (snapshot) => {
  foodSection.innerHTML = "";
  snapshot.forEach((docSnap) => {
    createFoodCard(docSnap.id, docSnap.data());
  });
});
