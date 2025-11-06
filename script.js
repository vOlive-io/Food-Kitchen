// ✅ Your Firebase config
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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const addFoodBtn = document.getElementById('addFood');
const foodInput = document.getElementById('foodInput');
const foodCardArray = document.getElementById('foodCardArray');

// Add a food to Firestore
addFoodBtn.addEventListener('click', async () => {
  const name = foodInput.value.trim();
  if (!name) return;
  await db.collection('foods').add({ name });
  foodInput.value = '';
});

// Listen for real-time updates
db.collection('foods').orderBy('name').onSnapshot(snapshot => {
  foodCardArray.innerHTML = '';
  snapshot.forEach(doc => {
    const food = doc.data();
    const div = document.createElement('div');
    div.className = 'foodCards';
    div.innerHTML = `
      <h2>${food.name}</h2>
      <img src="foodImage.png" alt="Food image">
      <p></p>
    `;
    foodCardArray.appendChild(div);
  });
});
