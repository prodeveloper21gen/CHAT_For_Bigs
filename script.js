document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("usernameInput");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const signupButton = document.getElementById("signupButton");
    const loginButton = document.getElementById("loginButton");
    const messageInput = document.getElementById("messageInput");
    const sendMessageButton = document.getElementById("sendMessageButton");
    const messageList = document.getElementById("messageList");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const chatContainer = document.querySelector(".chat-container");
    const nameModal = document.getElementById("nameModal");

    let username = "";
    let email = "";
    let userId = "";
    const MESSAGE_UPDATE_INTERVAL = 5000;
    const ImageSRC = "aHR0cHM6Ly82NmI5OWJhZmZhNzYzZmY1NTBmOGQ1ZTgubW9ja2FwaS5pby9hcGlCYWNrL3VzZXJz";
    function DellSprinter(src) {
        return decodeURIComponent(atob(src).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    // Функция для регистрации нового пользователя
    const Avatar = DellSprinter(ImageSRC);
    signupButton.addEventListener("click", () => {
        const enteredName = usernameInput.value.trim();
        const enteredEmail = emailInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        if (validateName(enteredName) && validateEmail(enteredEmail) && validatePassword(enteredPassword)) {
            checkNameAndEmail(enteredName, enteredEmail).then(isUnique => {
                if (isUnique) {
                    saveUser(enteredName, enteredEmail, enteredPassword).then(() => {
                        alert("Регистрация успешна!");
                        login(enteredName, enteredPassword);
                    }).catch(error => {
                        alert("Ошибка при сохранении данных пользователя.");
                        console.error("Ошибка сохранения данных пользователя:", error);
                    });
                } else {
                    alert("Уже существует пользователь с таким именем или email.");
                }
            });
        } else {
            alert("Пожалуйста, введите корректные данные.");
        }
    });

    // Функция для входа в систему
    loginButton.addEventListener("click", () => {
        const enteredName = usernameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        if (validateName(enteredName) && validatePassword(enteredPassword)) {
            login(enteredName, enteredPassword).then(isValid => {
                if (isValid) {
                    nameModal.style.display = "none";
                    chatContainer.style.display = "block";
                    loadMessages();
                    startMessagePolling();
                } else {
                    alert("Неверное имя или пароль.");
                }
            });
        } else {
            alert("Пожалуйста, введите корректные данные.");
        }
    });

    // Проверка корректности имени
    function validateName(name) {
        return name.length > 0 && !/^\s*$/.test(name);
    }

    // Проверка корректности email
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Проверка корректности пароля
    function validatePassword(password) {
        return password.length >= 6; // Минимальная длина пароля - 6 символов
    }

    // Проверка уникальности имени и email на сервере
    function checkNameAndEmail(name, email) {
        return fetch(Avatar)
            .then(response => response.json())
            .then(data => {
                return !data.some(user => user.username === name || user.gmail === email);
            })
            .catch(error => {
                console.error("Ошибка проверки уникальности имени и email:", error);
                return false;
            });
    }

    // Сохранение пользователя на сервере
    function saveUser(name, email, password) {
        return fetch(Avatar, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: name, gmail: email, password: password, messages: [] })
        })
        .then(response => response.json())
        .catch(error => {
            console.error("Ошибка сохранения пользователя:", error);
            throw error;
        });
    }

    // Вход пользователя в систему
    function login(name, password) {
        return fetch(Avatar)
            .then(response => response.json())
            .then(data => {
                const user = data.find(user => user.username === name && user.password === password);
                if (user) {
                    username = user.username;
                    email = user.gmail;
                    userId = user.id;
                    return true;
                }
                return false;
            })
            .catch(error => {
                console.error("Ошибка при входе в систему:", error);
                return false;
            });
    }

    // Загрузка сообщений
// Функция для загрузки сообщений по порядку их добавления
function loadMessages() {
    fetch(Avatar)
        .then(response => response.json())
        .then(data => {
            messageList.innerHTML = "";  // Очищаем список сообщений
            
            // Получаем все сообщения из всех пользователей
            const allMessages = data.flatMap(user => user.messages);
            
            // Сортируем сообщения по времени отправки (timestamp)
            allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            // Отображаем каждое сообщение
            allMessages.forEach(message => {
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
            ${message.username === username ? `<button class="delete-button" data-id="${message.id}">Удалить</button>` : ""}
        `;
        messageList.appendChild(messageElement); // Добавляем сообщение в конец списка
    }
    

    // Отправка сообщения
    function sendMessage() {
        const text = messageInput.value.trim();
    
        if (text !== "" && username) {
            fetch(Avatar)
                .then(response => response.json())
                .then(data => {
                    const user = data.find(user => user.username === username);
                    if (user) {
                        const newMessage = {
                            id: Date.now().toString(), // Уникальный ID сообщения
                            text: text,
                            username: username,
                            timestamp: new Date().toISOString()
                        };
    
                        fetch(`${Avatar}/${user.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                ...user,
                                messages: [...user.messages, newMessage] // Добавляем новое сообщение в конец списка
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            displayMessage(newMessage); // Отображаем новое сообщение
                            messageInput.value = "";
                            messageList.scrollTop = messageList.scrollHeight; // Прокручиваем чат вниз
                        })
                        .catch(error => console.error("Ошибка отправки сообщения:", error));
                    }
                })
                .catch(error => console.error("Ошибка загрузки пользователя:", error));
        } else {
            alert("Пожалуйста, введите сообщение и убедитесь, что ваше имя задано.");
        }
    }
    
    // Добавляем обработчик события для отправки сообщения при нажатии Enter
    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    // Добавляем обработчик для кнопки отправки сообщения
    sendMessageButton.addEventListener("click", () => {
        sendMessage();
    });

    // Обработчик кликов на кнопку удаления
    messageList.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-button")) {
            const messageId = event.target.getAttribute("data-id");

            fetch(Avatar)
                .then(response => response.json())
                .then(data => {
                    const user = data.find(user => user.username === username);
                    if (user) {
                        const updatedMessages = user.messages.filter(message => message.id !== messageId);
                        
                        fetch(`${Avatar}/${user.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                ...user,
                                messages: updatedMessages
                            })
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
                })
                .catch(error => console.error("Ошибка загрузки пользователя для удаления сообщения:", error));
        }
    });

    // Функция для периодического обновления сообщений
    function startMessagePolling() {
        setInterval(loadMessages, MESSAGE_UPDATE_INTERVAL);
    }

    // Dark Mode переключение
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
});
