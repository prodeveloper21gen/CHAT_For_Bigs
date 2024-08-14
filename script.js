document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("usernameInput");
    const enterChatButton = document.getElementById("enterChatButton");
    const messageInput = document.getElementById("messageInput");
    const sendMessageButton = document.getElementById("sendMessageButton");
    const messageList = document.getElementById("messageList");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const chatContainer = document.querySelector(".chat-container");
    const nameModal = document.getElementById("nameModal");

    let username = "";
    const MESSAGE_UPDATE_INTERVAL = 5000; // Интервал обновления сообщений в миллисекундах

    // Обработчик нажатия на кнопку входа в чат
    enterChatButton.addEventListener("click", () => {
        const enteredName = usernameInput.value.trim();
        if (validateName(enteredName)) {
            username = enteredName;
            nameModal.style.display = "none";
            chatContainer.style.display = "block";
            loadMessages();
            startMessagePolling(); // Начать опрос для обновления сообщений
        } else {
            alert("Пожалуйста, введите корректное имя.");
        }
    });

    // Проверка корректности имени
    function validateName(name) {
        return name.length > 0 && !/^\s*$/.test(name);
    }

    // Dark Mode переключение
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // Загрузка сообщений
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

    // Отображение сообщения
    function displayMessage(message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        if (message.username === username) {
            messageElement.classList.add("user");
        }
        messageElement.innerHTML = `
            <strong>${message.username}:</strong> ${message.text}
            <div class="timestamp">${message.time}</div>
            ${message.username === username ? `<button class="delete-button" data-id="${message.id}">Удалить</button>` : ""}
        `;
        messageList.appendChild(messageElement);
    }

    // Отправка сообщения
    function sendMessage() {
        const text = messageInput.value.trim();
        const time = new Date().toLocaleTimeString(); // Получение текущего времени

        if (text !== "" && username) {
            const message = { username, text, time }; // Формирование сообщения с временем
            displayMessage(message); // Отображаем сообщение на клиенте сразу

            // Отправка сообщения на сервер
            fetch("https://66b99baffa763ff550f8d5e8.mockapi.io/apiBack/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(message) // Отправляем сообщение вместе с временем
            })
            .then(() => {
                messageInput.value = "";
                messageList.scrollTop = messageList.scrollHeight;
            })
            .catch(error => console.error("Ошибка отправки сообщения на сервер:", error));
        } else {
            alert("Пожалуйста, введите сообщение и убедитесь, что ваше имя задано.");
        }
    }

    // Добавляем обработчик события для отправки сообщения при нажатии Enter
    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Предотвращаем добавление новой строки в поле ввода
            sendMessage();
        }
    });

    // Обработчик кликов на кнопку удаления
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

    // Функция для периодического обновления сообщений
    function startMessagePolling() {
        setInterval(loadMessages, MESSAGE_UPDATE_INTERVAL);
    }
});
