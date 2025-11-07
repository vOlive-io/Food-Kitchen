const db = firebase.firestore();

const foodCardArray = document.getElementById("foodCardArray");
const addFoodBtn = document.getElementById("addFood");
const foodsTab = document.getElementById("foodsTab");
const requestsTab = document.getElementById("requestsTab");
const foodsSection = document.getElementById("foodsSection");
const requestsSection = document.getElementById("requestsSection");
const addRequestBtn = document.getElementById("addRequest");
const requestsList = document.getElementById("requestsList");

// 🌶️ Add new food
addFoodBtn.addEventListener("click", async () => {
  const name = document.getElementById("foodName").value.trim();
  const image = document.getElementById("foodImage").value.trim();
  const flavor = document.getElementById("foodFlavor").value;

  if (!name) return alert("Please enter a food name!");

  await db.collection("foods").add({
    name,
    image,
    flavor,
    stars: 0,
    totalRatings: 0,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    comments: []
  });

  document.getElementById("foodName").value = "";
  document.getElementById("foodImage").value = "";
});

// 🍗 Render foods
db.collection("foods").orderBy("created", "desc").onSnapshot(snapshot => {
  foodCardArray.innerHTML = "";
  snapshot.forEach(doc => {
    const food = doc.data();
    const id = doc.id;

    const card = document.createElement("div");
    card.classList.add("foodCard", food.flavor);

    const emoji = food.flavor === "spicy" ? "🌶️" :
                   food.flavor === "savory" ? "🍗" :
                   food.flavor === "sweet" ? "🍰" : "🧊";

    card.innerHTML = `
      <h2>${food.name} ${emoji}</h2>
      ${food.image ? `<img src="${food.image}" alt="${food.name}">` : ""}
      <div class="stars">${[1,2,3,4,5].map(i=>`<span data-star="${i}">★</span>`).join('')}</div>
      <div class="comments">
        ${(food.comments || []).map(c => `<div class="comment">${c.emoji} <b>${c.name}</b>: ${c.text}</div>`).join('')}
      </div>
      <div class="comment-input">
        <select class="commenter">
          <option value="">Choose name</option>
          <option value="Lars the Chef 🧑‍🍳">Lars the Chef 🧑‍🍳</option>
          <option value="Laurel">Laurel</option>
          <option value="Olive">Olive</option>
          <option value="German">German</option>
          <option value="Olivia">Olivia</option>
        </select>
        <select class="emoji">
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
        <input type="text" placeholder="Add comment...">
        <button>Add</button>
      </div>
    `;

    // ⭐ Star rating
    const stars = card.querySelectorAll(".stars span");
    stars.forEach(star => {
      star.addEventListener("click", async () => {
        const rating = parseInt(star.dataset.star);
        const total = (food.totalRatings || 0) + 1;
        const avg = ((food.stars || 0) * (food.totalRatings || 0) + rating) / total;

        await db.collection("foods").doc(id).update({
          stars: avg,
          totalRatings: total
        });
      });
    });

    // 💬 Add comment
    const commentBtn = card.querySelector(".comment-input button");
    const commentInput = card.querySelector(".comment-input input");
    const commenterSelect = card.querySelector(".comment-input .commenter");
    const emojiSelect = card.querySelector(".comment-input .emoji");

    commentBtn.addEventListener("click", async () => {
      const text = commentInput.value.trim();
      const name = commenterSelect.value || "Guest";
      const emoji = emojiSelect.value || "💬";
      if (!text) return;

      const comments = food.comments || [];
      comments.push({ name, text, emoji });
      await db.collection("foods").doc(id).update({ comments });
    });

    foodCardArray.appendChild(card);
  });
});

// 🍕 Add request
addRequestBtn.addEventListener("click", async () => {
  const text = document.getElementById("requestInput").value.trim();
  if (!text) return;
  await db.collection("requests").add({
    text,
    created: firebase.firestore.FieldValue.serverTimestamp()
  });
  document.getElementById("requestInput").value = "";
});

// 🧾 Display requests
db.collection("requests").orderBy("created", "desc").onSnapshot(snapshot => {
  requestsList.innerHTML = "";
  snapshot.forEach(doc => {
    const req = doc.data();
    const li = document.createElement("li");
    li.textContent = req.text;
    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.addEventListener("click", () => db.collection("requests").doc(doc.id).delete());
    li.appendChild(btn);
    requestsList.appendChild(li);
  });
});

// ✨ Tab switching
foodsTab.addEventListener("click", () => {
  foodsSection.classList.add("active-section");
  requestsSection.classList.remove("active-section");
  foodsTab.classList.add("active");
  requestsTab.classList.remove("active");
});

requestsTab.addEventListener("click", () => {
  requestsSection.classList.add("active-section");
  foodsSection.classList.remove("active-section");
  requestsTab.classList.add("active");
  foodsTab.classList.remove("active");
});
