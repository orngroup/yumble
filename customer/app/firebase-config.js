/* =====================================================================
   FIND FOODIES — Firebase configuration
   ---------------------------------------------------------------------
   This file wires the app to your Firebase project.
   Right now the app runs in DEMO MODE with sample data.
   Follow SETUP-GUIDE.md to switch DEMO_MODE to false and go live.
   ===================================================================== */

// STEP 1: paste your Firebase project config here (from the Firebase console)
// Firebase console → Project settings → General → "Your apps" → Config
const firebaseConfig = {
  apiKey:            "YOUR_FIREBASE_API_KEY",
  authDomain:        "findfoodies-xxxxx.firebaseapp.com",
  projectId:         "findfoodies-xxxxx",
  storageBucket:     "findfoodies-xxxxx.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:xxxxxxxxxxxxxxxx"
};

// STEP 2: when your Firebase project is ready, set this to false
const DEMO_MODE = true;

// STEP 3 (optional): Google Places — real restaurant data
// Enable "Places API" in Google Cloud, create a key, paste it here,
// then set USE_PLACES = true. Until then, the app uses the sample
// London venues in venues.js.
const GOOGLE_PLACES_KEY = "YOUR_GOOGLE_PLACES_API_KEY";
const USE_PLACES = false;

/* ---------------------------------------------------------------------
   Data layer — the app calls these functions. In DEMO_MODE they return
   sample data; once DEMO_MODE is false they talk to Firebase/Places.
   A developer implements the "live" branches following SETUP-GUIDE.md.
   --------------------------------------------------------------------- */
window.FF = {
  demo: DEMO_MODE,

  // ---- AUTH ----
  async signInWithGoogle() {
    if (DEMO_MODE) return { uid: "demo", name: "Alex", email: "alex@example.com" };
    // LIVE: const provider = new firebase.auth.GoogleAuthProvider();
    //       const res = await firebase.auth().signInWithPopup(provider);
    //       return res.user;
  },
  async signOut() {
    if (DEMO_MODE) return true;
    // LIVE: return firebase.auth().signOut();
  },

  // ---- VENUES ----
  async getVenues({ lat, lng, radiusMiles } = {}) {
    if (DEMO_MODE || !USE_PLACES) return window.LONDON_VENUES || [];
    // LIVE (Places): call Places Nearby Search for restaurants around lat/lng,
    // map results into the same shape as LONDON_VENUES. See SETUP-GUIDE.md.
  },

  // ---- PROFILES / MATCHES / MESSAGES / BOOKINGS ----
  // In DEMO_MODE the app uses its in-memory sample state.
  // LIVE versions read/write Firestore collections:
  //   users/{uid}, likes/{uid}, matches/{id}, messages/{matchId},
  //   bookings/{id}, venues/{id}, recommendations/{id}
  async saveProfile(profile)      { if (DEMO_MODE) return true; },
  async recordLike(fromId, toId)  { if (DEMO_MODE) return true; },
  async getMatches(uid)           { if (DEMO_MODE) return []; },
  async sendMessage(matchId, msg) { if (DEMO_MODE) return true; },
  async createBooking(booking)    { if (DEMO_MODE) return true; },
  async recommendVenue(data)      { if (DEMO_MODE) return true; }
};
