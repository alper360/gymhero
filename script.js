// Firebase Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyCcHR9c7AR3V--lAJVyAWBEThAc0ffG3O4",
    authDomain: "gymhero-abee7.firebaseapp.com",
    projectId: "gymhero-abee7",
    storageBucket: "gymhero-abee7.firebasestorage.app",
    messagingSenderId: "1008301754178",
    appId: "1:1008301754178:web:9b84bd3d485a3455f96adb"
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let currentUser = null;
let currentTimer = null;
let currentTrainingDay = [];
let currentExerciseIndex = -1;
let currentSet = 0;
let trackedWeights = { entries: [] };

// Login-Container und Hauptinhalt
const loginContainer = document.getElementById("login-container");
const mainContent = document.getElementById("main-content");
const exerciseContainer = document.getElementById("exercise-container");
const exerciseName = document.getElementById("exercise-name");
const totalSets = document.getElementById("total-sets");
const reps = document.getElementById("reps");
const restTime = document.getElementById("rest-time");
const currentSetDisplay = document.getElementById("current-set");
const nextSetBtn = document.getElementById("next-set-btn");
const timerContainer = document.getElementById("timer-container");
const timerDisplay = document.getElementById("timer-display");
const weightInput = document.getElementById("weight-input");
const progressList = document.getElementById("progress-list");

// Verstecke den Hauptinhalt initial
mainContent.style.display = "none";

// Login-Formular Handler
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert("Login fehlgeschlagen: " + error.message);
    }
});

// Registrierungs-Handler
document.getElementById("register-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
        alert("Registrierung fehlgeschlagen: " + error.message);
    }
});

// Auth-Status Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loginContainer.style.display = "none";
        mainContent.style.display = "block";
        loadProgress();
    } else {
        currentUser = null;
        loginContainer.style.display = "block";
        mainContent.style.display = "none";
    }
});

const trainingDays = {
    Push: [
        { name: "Bankdrücken (KH)", sets: 3, reps: "8", rest_time: 120 },
        { name: "Schrägbankdrücken (Multipresse)", sets: 3, reps: "10", rest_time: 120 },
        { name: "Butterfly Kabelzug", sets: 3, reps: "10", rest_time: 120 },
        { name: "Schulterdrücken (KH)", sets: 3, reps: "15", rest_time: 90 },
        { name: "Seitheben (Kabelzug)", sets: 3, reps: "10", rest_time: 90 },
        { name: "Dips", sets: 3, reps: "10", rest_time: 120 }
    ],
    Pull: [
        { name: "Lat-Ziehen (Kabelzug)", sets: 3, reps: "10", rest_time: 180 },
        { name: "Rudern (Kabelzug)", sets: 3, reps: "10", rest_time: 120 },
        { name: "Überzüge (Maschine / Kabelzug)", sets: 3, reps: "10", rest_time: 120 },
        { name: "Face Pulls (Kabelzug)", sets: 3, reps: "10", rest_time: 120 },
        { name: "Reverse Butterfly (Kabelzug / Maschine)", sets: 3, reps: "10", rest_time: 120 },
        { name: "Bizeps Curls (KH)", sets: 3, reps: "12", rest_time: 90 }
    ],
    UK: [
        { name: "Kniebeugen (LH / Multipresse)", sets: 3, reps: "8", rest_time: 180 },
        { name: "Beinstrecker", sets: 3, reps: "10", rest_time: 120 },
        { name: "Beinbeuger", sets: 3, reps: "10", rest_time: 120 },
        { name: "Ausfallschritte", sets: 3, reps: "10", rest_time: 120 },
        { name: "Wadenheben", sets: 3, reps: "15", rest_time: 90 },
        { name: "Bauch", sets: 3, reps: "10", rest_time: 60 }
    ],
    OK: [
        { name: "Bankdrücken (LH)", sets: 4, reps: "10", rest_time: 120 },
        { name: "Vorgebeugtes Rudern (LH)", sets: 4, reps: "10", rest_time: 120 },
        { name: "Trizeps-Pushdowns (Kabelzug mit Stange)", sets: 3, reps: "10", rest_time: 120 },
        { name: "Überkopf Trizepsdrücken (Kabelzug)", sets: 3, reps: "10", rest_time: 90 },
        { name: "Scottcurls", sets: 3, reps: "10", rest_time: 90 },
        { name: "Hammer Curls", sets: 3, reps: "10", rest_time: 90 }
    ]
};

document.getElementById("training-day").addEventListener("change", updateProgressList);

document.getElementById("start-training").addEventListener("click", () => {
    const selectedDay = document.getElementById("training-day").value;
    if (!trainingDays[selectedDay]) {
        alert("Bitte wähle einen gültigen Trainingstag aus!");
        return;
    }
    currentTrainingDay = trainingDays[selectedDay];
    currentExerciseIndex = -1;
    currentSet = 0;
    nextExercise();
    exerciseContainer.classList.remove("d-none");
});

function nextExercise() {
    if (currentExerciseIndex >= 0) {
        const currentExerciseName = currentTrainingDay[currentExerciseIndex].name;
        saveProgress(currentExerciseName, weightInput.value || "- kg");
    }

    currentExerciseIndex++;
    if (currentExerciseIndex >= currentTrainingDay.length) {
        alert("Training abgeschlossen!");
        exerciseContainer.classList.add("d-none");
        timerContainer.classList.add("d-none");
        return;
    }

    const exercise = currentTrainingDay[currentExerciseIndex];
    exerciseName.textContent = exercise.name;
    totalSets.textContent = exercise.sets;
    reps.textContent = exercise.reps;
    restTime.textContent = `${exercise.rest_time} Sekunden`;
    currentSet = 1;
    currentSetDisplay.textContent = currentSet;
    weightInput.value = getLastWeight(exercise.name);
    timerContainer.classList.add("d-none");
    nextSetBtn.textContent = "Satz abschließen";
    nextSetBtn.classList.remove("btn-danger");
    nextSetBtn.classList.add("btn-success");
}

nextSetBtn.addEventListener("click", () => {
    const exercise = currentTrainingDay[currentExerciseIndex];
    if (currentSet >= exercise.sets) {
        nextExercise();
        return;
    }

    currentSet++;
    currentSetDisplay.textContent = currentSet;

    if (currentSet === exercise.sets) {
        nextSetBtn.textContent = "Nächste Übung";
        nextSetBtn.classList.remove("btn-success");
        nextSetBtn.classList.add("btn-danger");
    }

    if (currentSet < exercise.sets) {
        let timeLeft = exercise.rest_time;
        timerContainer.classList.remove("d-none");
        timerDisplay.textContent = formatTime(timeLeft);
        
        if (currentTimer) {
            clearInterval(currentTimer);
        }

        currentTimer = setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(currentTimer);
                timerDisplay.textContent = "Pause beendet!";
                alert("Weiter zum nächsten Satz!");
                return;
            }
            timerDisplay.textContent = formatTime(timeLeft);
        }, 1000);
    }
});

async function saveProgress(exerciseName, weight) {
    if (!currentUser) return;

    const currentDate = new Date();
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const formattedDate = `${days[currentDate.getDay()]}, ${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear().toString().slice(-2)}`;
    
    const entry = {
        trainingDay: document.getElementById("training-day").value,
        date: formattedDate,
        exercise: exerciseName,
        weight: weight,
        id: Date.now()
    };

    trackedWeights.entries.unshift(entry);

    try {
        await db.collection('workouts').doc(currentUser.uid).set({
            trackedWeights: trackedWeights,
            lastUpdated: new Date()
        });
        updateProgressList();
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
    }
}

async function loadProgress() {
    if (!currentUser) return;

    try {
        const doc = await db.collection('workouts').doc(currentUser.uid).get();
        if (doc.exists) {
            trackedWeights = doc.data().trackedWeights;
            if (!trackedWeights.entries) {
                trackedWeights.entries = [];
            }
        }
        updateProgressList();
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
}

function updateProgressList() {
    const selectedDay = document.getElementById("training-day").value;
    progressList.innerHTML = "";
    if (!selectedDay
