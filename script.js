// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBNDByWKc8Asfd-S70OEIuVpxQ3xG-bgss",
  authDomain: "foodkitchen-37f44.firebaseapp.com",
  projectId: "foodkitchen-37f44",
  storageBucket: "foodkitchen-37f44.firebasestorage.app",
  messagingSenderId: "803378208472",
  appId: "1:803378208472:web:bb30cf298391ba16d901ad",
  measurementId: "G-29DDTPH087"
};

// ✅ Initialize Firebase + Firestore + Storage
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// DOM elements
const addFoodBtn = document.getElementById('addFood');
const foodInput = document.getElementById('foodInput');
const foodImageInput = document.getElementById('foodImage');
const foodCardArray = document.getElementById('foodCardArray');

// ✅ Add new food with image
addFoodBtn.addEventListener('click', async () => {
  const name = foodInput.value.trim();
  const file = foodImageInput.files[0];
  if (!name) return;

  let imageUrl = 'default.png'; // fallback image

  // Upload image if selected
  if (file) {
    const storageRef = storage.ref(`foodImages/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    imageUrl = await storageRef.getDownloadURL();
  }

  await db.collection('foods').add({
    name,
    imageUrl,
    rating: 0,
    ratingCount: 0
  });

  foodInput.value = '';
  foodImageInput.value = '';
});

// ✅ Render foods & ratings live
db.collection('foods').orderBy('name').onSnapshot(snapshot => {
  foodCardArray.innerHTML = '';
  snapshot.forEach(doc => {
    const food = doc.data();
    const div = document.createElement('div');
    div.className = 'foodCards';

    // Build stars
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      const active = i <= Math.round(food.rating) ? 'active' : '';
      starsHTML += `<span class="star ${active}" data-value="${i}">★</span>`;
    }

    div.innerHTML = `
      <h2>${food.name}</h2>
      <img src="${food.imageUrl}" alt="${food.name}">
      <div class="stars" data-id="${doc.id}">
        ${starsHTML}
      </div>
      <p>Average: ${food.rating.toFixed(1)} / 5 (${food.ratingCount} ratings)</p>
    `;

    foodCardArray.appendChild(div);
  });

  // Star click events
  document.querySelectorAll('.stars').forEach(starDiv => {
    starDiv.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', async () => {
        const foodId = starDiv.dataset.id;
        const ratingValue = parseInt(star.dataset.value);

        const foodRef = db.collection('foods').doc(foodId);
        const foodSnap = await foodRef.get();
        const foodData = foodSnap.data();

        const newCount = (foodData.ratingCount || 0) + 1;
        const newAverage = ((foodData.rating * (newCount - 1)) + ratingValue) / newCount;

        await foodRef.update({
          rating: newAverage,
          ratingCount: newCount
        });
      });
    });
  });
});
