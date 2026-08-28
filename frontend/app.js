const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

let tasks = [];

const API_URL =
    "https://ivg0e0r24h.execute-api.us-east-1.amazonaws.com/tasks";


// AWS'den task'ları getir
async function loadTasks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        const data = await response.json();

        tasks = data;

        renderTasks();

    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}


// Task'ları ekrana çiz
function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function (task) {

        const listItem = document.createElement("li");

        const taskSpan = document.createElement("span");
        taskSpan.textContent = task.text;
        taskSpan.style.marginRight = "20px";

        if (task.completed) {
            taskSpan.style.textDecoration = "line-through";
        }


        // Done / Undo button
        const doneButton = document.createElement("button");

        doneButton.textContent =
            task.completed ? "Undo" : "Done";

        doneButton.style.marginRight = "10px";

        doneButton.addEventListener("click", function () {

            task.completed = !task.completed;

            renderTasks();
        });


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {

            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            renderTasks();
        });


        listItem.appendChild(taskSpan);
        listItem.appendChild(doneButton);
        listItem.appendChild(deleteButton);

        taskList.appendChild(listItem);
    });


    // Task sayıları
    const completedTasks = tasks.filter(function (task) {
        return task.completed;
    }).length;

    taskCount.textContent =
        `Total: ${tasks.length} | Completed: ${completedTasks}`;
}


// Yeni task oluştur
function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    renderTasks();

    taskInput.value = "";
}


// Add Task button
addTaskButton.addEventListener("click", addTask);


// Enter ile task ekleme
taskInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        addTask();
    }

});


// Sayfa açıldığında AWS'den task'ları getir
loadTasks();