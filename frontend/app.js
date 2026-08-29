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

        doneButton.addEventListener("click", async function () {
    const newCompletedValue = !task.completed;

    try {
        const response = await fetch(`${API_URL}/${task.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                completed: newCompletedValue
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        const updatedTask = await response.json();

        task.completed = updatedTask.completed;

        renderTasks();

    } catch (error) {
        console.error("Error updating task:", error);
    }
});


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async function () {
    try {
        const response = await fetch(`${API_URL}/${task.id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        tasks = tasks.filter(function (item) {
            return item.id !== task.id;
        });

        renderTasks();

    } catch (error) {
        console.error("Error deleting task:", error);
    }
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


async function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            throw new Error("Failed to create task");
        }

        const createdTask = await response.json();

        tasks.push(createdTask);

        renderTasks();

        taskInput.value = "";

    } catch (error) {
        console.error("Error creating task:", error);
    }
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