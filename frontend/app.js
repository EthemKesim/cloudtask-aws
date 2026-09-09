const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const logoutButton = document.getElementById("logoutButton");

const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const navItems = document.querySelectorAll(".nav-item");

const {
    COGNITO_DOMAIN,
    CLIENT_ID,
    REDIRECT_URI,
    API_URL
} = window.APP_CONFIG;

let tasks = [];
let currentFilter = "all";

function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    return Array.from(array)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

async function generateCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function login() {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    sessionStorage.setItem("code_verifier", verifier);

    const loginUrl =
        `${COGNITO_DOMAIN}/login` +
        `?client_id=${CLIENT_ID}` +
        `&response_type=code` +
        `&scope=openid+email` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&code_challenge_method=S256` +
        `&code_challenge=${challenge}`;

    window.location.href = loginUrl;
}

async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        return;
    }

    const verifier = sessionStorage.getItem("code_verifier");

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier
    });

    const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Cognito token error:", errorText);
        throw new Error("Failed to exchange authorization code");
    }

    const tokens = await response.json();

    sessionStorage.setItem("access_token", tokens.access_token);

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );
}

function getAccessToken() {
    return sessionStorage.getItem("access_token");
}

function logout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("code_verifier");

    const logoutUrl =
        `${COGNITO_DOMAIN}/logout` +
        `?client_id=${CLIENT_ID}` +
        `&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;

    window.location.href = logoutUrl;
}

async function loadTasks() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        tasks = await response.json();

        renderTasks();
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

function updateStats() {
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = tasks.length - completedTasks;

    totalCount.textContent = tasks.length;
    activeCount.textContent = activeTasks;
    completedCount.textContent = completedTasks;

    if (currentFilter === "all") {
        taskCount.textContent = `${tasks.length} tasks`;
    } else if (currentFilter === "active") {
        taskCount.textContent = `${activeTasks} active`;
    } else {
        taskCount.textContent = `${completedTasks} completed`;
    }
}

function getFilteredTasks() {
    if (currentFilter === "active") {
        return tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter(task => task.completed);
    }

    return tasks;
}

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        const emptyState = document.createElement("li");
        emptyState.className = "empty-state";

        if (currentFilter === "completed") {
            emptyState.textContent = "No completed tasks yet.";
        } else if (currentFilter === "active") {
            emptyState.textContent = "No active tasks. Nice work!";
        } else {
            emptyState.textContent = "No tasks yet. Add your first one above.";
        }

        taskList.appendChild(emptyState);
        updateStats();
        return;
    }

    filteredTasks.forEach(function (task) {
        const listItem = document.createElement("li");

        if (task.completed) {
            listItem.classList.add("task-completed");
        }

        const topRow = document.createElement("div");
        topRow.className = "task-top";

        const statusIcon = document.createElement("div");
        statusIcon.className = task.completed
            ? "task-status completed-status"
            : "task-status active-status";

        statusIcon.textContent = task.completed ? "✓" : "⌛";

        const taskSpan = document.createElement("span");
        taskSpan.textContent = task.text;
        taskSpan.classList.add("task-text");

        if (task.completed) {
            taskSpan.classList.add("task-text-completed");
        }

        topRow.appendChild(statusIcon);
        topRow.appendChild(taskSpan);

        const actionRow = document.createElement("div");
        actionRow.className = "task-actions";

        const doneButton = document.createElement("button");
        doneButton.textContent = task.completed ? "↶ Undo" : "✓ Mark as done";
        doneButton.className = "task-action primary-action";

        doneButton.addEventListener("click", async function () {
            const newCompletedValue = !task.completed;

            try {
                const response = await fetch(
                    `${API_URL}/${task.taskId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getAccessToken()}`
                        },
                        body: JSON.stringify({
                            completed: newCompletedValue
                        })
                    }
                );

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

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", async function () {
            try {
                const response = await fetch(
                    `${API_URL}/${task.taskId}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to delete task");
                }

                tasks = tasks.filter(
                    item => item.taskId !== task.taskId
                );

                renderTasks();
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        });

        actionRow.appendChild(doneButton);
        actionRow.appendChild(deleteButton);

        listItem.appendChild(topRow);
        listItem.appendChild(actionRow);

        taskList.appendChild(listItem);
    });

    updateStats();
}

async function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    const newTask = {
        taskId: Date.now().toString(),
        text: taskText,
        completed: false
    };

    try {
        addTaskButton.disabled = true;
        addTaskButton.textContent = "Adding...";

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken()}`
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            throw new Error("Failed to create task");
        }

        const createdTask = await response.json();

        tasks.push(createdTask);

        taskInput.value = "";

        renderTasks();
    } catch (error) {
        console.error("Error creating task:", error);
    } finally {
        addTaskButton.disabled = false;
        addTaskButton.textContent = "Add Task";
    }
}

navItems.forEach(function (navItem) {
    navItem.addEventListener("click", function () {
        navItems.forEach(item => item.classList.remove("active"));

        navItem.classList.add("active");

        currentFilter = navItem.dataset.filter;

        renderTasks();
    });
});

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

logoutButton.addEventListener("click", logout);

async function startApp() {
    await handleCallback();

    const token = getAccessToken();

    if (!token) {
        await login();
        return;
    }

    await loadTasks();
}

startApp();