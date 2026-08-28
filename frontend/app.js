const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const taskCount = document.getElementById("taskCount");



function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

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

        const doneButton = document.createElement("button");
        doneButton.textContent = "Done";
        doneButton.style.marginRight = "10px";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        doneButton.addEventListener("click", function () {
            task.completed = !task.completed;

            saveTasks();
            renderTasks();
        });

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
        });

        listItem.appendChild(taskSpan);
        listItem.appendChild(doneButton);
        listItem.appendChild(deleteButton);

        taskList.appendChild(listItem);
    });
    
    const completedTasks = tasks.filter(function (task) {
    return task.completed;
}).length;

taskCount.textContent =
    `Total: ${tasks.length} | Completed: ${completedTasks}`;
}

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

    saveTasks();
    renderTasks();

    taskInput.value = "";
}

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

addTaskButton.addEventListener("click", function () {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    const listItem = document.createElement("li");

    const taskSpan = document.createElement("span");
    taskSpan.textContent = taskText;
    taskSpan.style.marginRight = "20px";

    const doneButton = document.createElement("button");
    doneButton.textContent = task.completed ? "Undo" : "Done";
    doneButton.style.marginRight = "5px";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    doneButton.addEventListener("click", function () {
        taskSpan.style.textDecoration = "line-through";
    });

    deleteButton.addEventListener("click", function () {
        listItem.remove();
    });

    listItem.appendChild(taskSpan);
    listItem.appendChild(doneButton);
    listItem.appendChild(deleteButton);

    taskList.appendChild(listItem);

    taskInput.value = "";
});