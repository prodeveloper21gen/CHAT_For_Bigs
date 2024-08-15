document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("usernameInput");
    const enterChatButton = document.getElementById("enterChatButton");
    const messageInput = document.getElementById("messageInput");
    const sendMessageButton = document.getElementById("sendMessageButton");
    const messageList = document.getElementById("messageList");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const chatContainer = document.querySelector(".chat-container");
    const nameModal = document.getElementById("nameModal");

    let username = localStorage.getItem("username") || ""; // Сохраняем имя пользователя в localStorage
    const MESSAGE_UPDATE_INTERVAL = 5000;

    if (username) {
        checkUsernameAvailability(username).then(isAvailable => {
            if (isAvailable) {
                nameModal.style.display = "none";
                chatContainer.style.display = "block";
                loadMessages();
                startMessagePolling();
            } else {
                localStorage.removeItem("username"); // Удаляем имя из localStorage, если оно больше не доступно
                nameModal.style.display = "block";
            }
        });
    }

    enterChatButton.addEventListener("click", () => {
        const enteredName = usernameInput.value.trim();
        if (validateName(enteredName)) {
            checkUsernameAvailability(enteredName).then(isAvailable => {
                if (isAvailable) {
                    username = enteredName;
                    localStorage.setItem("username", username); // Сохраняем имя в localStorage
                    nameModal.style.display = "none";
                    chatContainer.style.display = "block";
                    loadMessages();
                    startMessagePolling();
                } else {
                    alert("Уже есть такое имя.");
                }
            });
        } else {
            alert("Пожалуйста, введите корректное имя.");
        }
    });

    function validateName(name) {
        return name.length > 0 && !/^\s*$/.test(name);
    }

    function checkUsernameAvailability(name) {
        return fetch(`https://66b99baffa763ff550f8d5e8.mockapi.io/apiBack/users?username=${name}`)
            .then(response => response.json())
            .then(data => data.length === 0)
            .catch(error => {
                console.error("Ошибка проверки имени:", error);
                return false;
            });
    }

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    function loadMessages() {
        fetch("https://66b99baffa763ff550f8d5e8.mockapi.io/apiBack/users")
            .then(response => response.json())
            .then(data => {
                messageList.innerHTML = "";
                data.forEach(message => {
                    displayMessage(message);
                });
            })
            .catch(error => console.error("Ошибка загрузки сообщений:", error));
    }

    function displayMessage(message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        if (message.username === username) {
            messageElement.classList.add("user");
        }
        messageElement.innerHTML = `
            <strong>${message.username}:</strong> ${message.text}
            ${message.username === username ? `<button class="delete-button" data-id="${message.id}">Удалить</button>` : ""}
        `;
        messageList.appendChild(messageElement);
    }

    function sendMessage() {
        const text = messageInput.value.trim();

        if (text !== "" && username) {
            fetch("https://66b99baffa763ff550f8d5e8.mockapi.io/apiBack/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, text })
            })
            .then(response => response.json())
            .then(data => {
                displayMessage(data);
                messageInput.value = "";
                messageList.scrollTop = messageList.scrollHeight;
            })
            .catch(error => console.error("Ошибка отправки сообщения:", error));
        } else {
            alert("Пожалуйста, введите сообщение и убедитесь, что ваше имя задано.");
        }
    }

    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    sendMessageButton.addEventListener("click", () => {
        sendMessage();
    });

    messageList.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-button")) {
            const messageId = event.target.getAttribute("data-id");

            fetch(`https://66b99baffa763ff550f8d5e8.mockapi.io/apiBack/users/${messageId}`, {
                method: "DELETE"
            })
            .then(response => {
                if (response.ok) {
                    event.target.parentElement.remove();
                } else {
                    console.error("Ошибка удаления сообщения.");
                }
            })
            .catch(error => console.error("Ошибка удаления сообщения:", error));
        }
    });

    function startMessagePolling() {
        setInterval(loadMessages, MESSAGE_UPDATE_INTERVAL);
    }
});
