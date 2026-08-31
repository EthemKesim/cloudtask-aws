const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const COGNITO_DOMAIN =
    "https://us-east-1zdwwiqewg.auth.us-east-1.amazoncognito.com";

const CLIENT_ID =
    "6l2ghaere82ejr5e3cu9o0qvtd";

const REDIRECT_URI =
    "https://d3uuyg0mq27sk6.cloudfront.net";


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



let tasks = [];

const API_URL =
    "https://ivg0e0r24h.execute-api.us-east-1.amazonaws.com/tasks";


// AWS'den task'ları getir
async function loadTasks() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${getAccessToken()}`
            }
        });

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
    const response = await fetch(`${API_URL}/${task.taskId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAccessToken()}`
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
        const response = await fetch(`${API_URL}/${task.taskId}`, {
    method: "DELETE",
    headers: {
        "Authorization": `Bearer ${getAccessToken()}`
    }
});

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        tasks = tasks.filter(function (item) {
            return item.taskId !== task.taskId;
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
    taskId: Date.now().toString(),
    text: taskText,
    completed: false
};

    try {
        const response = await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAccessToken()}`
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

