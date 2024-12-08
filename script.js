// Vollständiger Trainingsplan
const trainingDays = {
  Push: [
    { name: "Bankdrücken (KH)", sets: 3, reps: "8", rest_time: 120 },
    { name: "Schrägbankdrücken (Multipresse)", sets: 3, reps: "10", rest_time: 120 },
    { name: "Butterfly Kabelzug", sets: 3, reps: "10", rest_time: 120 },
    { name: "Schulterdrücken (KH)", sets: 3, reps: "10", rest_time: 90 },
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
};

// Globale Variablen
let currentTrainingDay = [];
let currentExerciseIndex = -1;
let currentSet = -1;
let trackedWeights = {}; // Speichert die Gewichte für jede Übung

// Elemente abrufen
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

// Trainingstag auswählen
document.getElementById("start-training").addEventListener("click", () => {
 const selectedDay=document.getElementById("training-day").value;if(!trainingDays[selectedDay]){alert("Bitte wähle einen gültigen Trainingstag aus!");return;}currentTrainingDay=trainingDays[selectedDay];currentExerciseIndex=-1;currentSet=-1;nextExercise();exerciseContainer.classList.remove("d-none");});

// Nächste Übung starten
function nextExercise() {
 if(currentExerciseIndex>=0){const currentExerciseName=currentTrainingDay[currentExerciseIndex].name;trackedWeights[currentExerciseName]=weightInput.value||"-";}currentExerciseIndex++;if(currentExerciseIndex>=currentTrainingDay.length){alert("Training abgeschlossen!");console.log("Trainingsdaten:",trackedWeights);exerciseContainer.classList.add("d-none");timerContainer.classList.add("d-none");return;}const exercise=currentTrainingDay[currentExerciseIndex];exerciseName.textContent=exercise.name;totalSets.textContent=exercise.sets;reps.textContent=exercise.reps;restTime.textContent=`${exercise.rest_time} Sekunden`;currentSet=1;currentSetDisplay.textContent=currentSet;weightInput.value=trackedWeights[exercise.name]||"";timerContainer.classList.remove("d-none");}

// Nächster Satz Button
nextSetBtn.addEventListener("click",()=>{const exercise=currentTrainingDay[currentExerciseIndex];if(currentSet<exercise.sets){currentSet++;currentSetDisplay.textContent=currentSet;startTimer(exercise.rest_time);}else{nextExercise();}});

// Timer-Funktion
let timerInterval;

function startTimer(seconds) {
 clearInterval(timerInterval);let timeLeft=seconds;timerDisplay.textContent=formatTime(timeLeft);timerInterval=setInterval(()=>{timeLeft--;if(timeLeft<=-1){clearInterval(timerInterval);timerDisplay.textContent="Pause beendet!";alert("Weiter zum nächsten Satz!");return;}timerDisplay.textContent=formatTime(timeLeft);},1000);}

// Zeit formatieren
function formatTime(seconds) {
 const minutes=Math.floor(seconds/60);const remainingSeconds=seconds%60;return`${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}`;}