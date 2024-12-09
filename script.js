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

let currentTrainingDay = [];
let currentExerciseIndex = -1;
let currentSet = 0;
let currentTimer = null;
let trackedWeights = { entries: [] };

// DOM-Elemente
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
        alert("Übung abgeschlossen!");
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

function saveProgress(exerciseName, weight) {
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
    
    if (!trackedWeights.entries) {
        trackedWeights.entries = [];
    }
    
    trackedWeights.entries.unshift(entry);
    localStorage.setItem('trackedWeights', JSON.stringify(trackedWeights));
    updateProgressList();
}

function loadProgress() {
    const saved = localStorage.getItem('trackedWeights');
    if (saved) {
        trackedWeights = JSON.parse(saved);
        updateProgressList();
    }
}

function updateProgressList() {
    const selectedDay = document.getElementById("training-day").value;
    progressList.innerHTML = "";
    
    if (!selectedDay) return;
    
    trackedWeights.entries
        .filter(entry => entry.trainingDay === selectedDay)
        .forEach(entry => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";
            
            const contentDiv = document.createElement("div");
            contentDiv.innerHTML = `
                <strong>${entry.date}</strong><br>
                ${entry.exercise}: ${entry.weight}${entry.weight !== '- kg' ? ' kg' : ''}
            `;
            
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger btn-sm";
            deleteButton.innerHTML = "×";
            deleteButton.onclick = () => deleteEntry(entry.id);
            
            listItem.appendChild(contentDiv);
            listItem.appendChild(deleteButton);
            progressList.appendChild(listItem);
        });
}

function deleteEntry(id) {
    trackedWeights.entries = trackedWeights.entries.filter(entry => entry.id !== id);
    localStorage.setItem('trackedWeights', JSON.stringify(trackedWeights));
    updateProgressList();
}

function getLastWeight(exerciseName) {
    const selectedDay = document.getElementById("training-day").value;
    const lastEntry = trackedWeights.entries
        .filter(entry => entry.trainingDay === selectedDay && entry.exercise === exerciseName)[0];
    return lastEntry ? lastEntry.weight : "- kg";
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
});
