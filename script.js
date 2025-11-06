// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBNDByWKc8Asfd-S70OEIuVpxQ3xG-bgss",
  authDomain: "foodkitchen-37f44.firebaseapp.com",
  projectId: "foodkitchen-37f44",
  storageBucket: "foodkitchen-37f44.firebasestorage.app",
  messagingSenderId: "803378208472",
  appId: "1:803378208472:web:bb30cf298391ba16d901ad",
  measurementId: "G-29DDTPH087"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// HTML elements
const addFoodBtn = document.getElementById('addFood');
const foodInput = document.getElementById('foodInput');
const foodImage = document.getElementById('foodImage');
const foodCardArray = document.getElementById('foodCardArray');

// ✅ Add Food with optional image
addFoodBtn.addEventListener('click', async () => {
  const name = foodInput.value.trim();
  const file = foodImage.files[0];
  if (!name) return alert('Please enter a food name.');

  let imageUrl = '';
  if (file) {
    const storageRef = storage.ref(`images/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    imageUrl = await storageRef.getDownloadURL();
  }

  await db.collection('foods').add({
    name,
    imageUrl,
    rating: 0,
    ratingCount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  foodInput.value = '';
  foodImage.value = '';
});

// ✅ Real-time listener for all foods
db.collection('foods').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
  foodCardArray.innerHTML = '';
  snapshot.forEach(doc => {
    const food = doc.data();
    const id = doc.id;
    const rating = food.rating || 0;
    const ratingCount = food.ratingCount || 0;
    const imageUrl = food.imageUrl || 'https://via.placeholder.com/150?text=No+Image';

    // Create card
    const card = document.createElement('div');
    card.className = 'foodCards';
    card.innerHTML = `
      <h2>${food.name}</h2>
      <img src="${imageUrl}" alt="${food.name}">
      <div class="stars" data-id="${id}">
        ${[1,2,3,4,5].map(i => `<span data-value="${i}" class="${i <= Math.round(rating) ? 'active' : ''}">★</span>`).join('')}
      </div>
      <p>Average: ${rating.toFixed(1)} / 5 (${ratingCount} ratings)</p>
    `;
    foodCardArray.appendChild(card);
  });

  // ✅ Handle star clicks
  document.querySelectorAll('.stars').forEach(starDiv => {
    const foodId = starDiv.getAttribute('data-id');
    starDiv.querySelectorAll('.star, span').forEach(star => {
      star.addEventListener('click', async (e) => {
        const value = Number(e.target.getAttribute('data-value'));
        const ref = db.collection('foods').doc(foodId);
        const docSnap = await ref.get();
        if (docSnap.exists) {
          const data = docSnap.data();
          const newCount = (data.ratingCount || 0) + 1;
          const newTotal = (data.rating || 0) * (data.ratingCount || 0) + value;
          const newAvg = newTotal / newCount;
          await ref.update({
            rating: newAvg,
            ratingCount: newCount
          });
        }
      });
    });
  });
});
