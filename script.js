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
    let lastMessageTimestamp = null;
    let replyToUser = null;
    const MESSAGE_UPDATE_INTERVAL = 5000;
    const ImageSRC = "aHR0cHM6Ly82NmI5OWJhZmZhNzYzZmY1NTBmOGQ1ZTgubW9ja2FwaS5pby9hcGlCYWNrL3VzZXJz";
    const notificationSound = new Audio('sounds/notification.mp3');

    function DellSprinter(src) {
        return decodeURIComponent(atob(src).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    const Avatar = DellSprinter(ImageSRC);

    // Стили для кнопок
    const styles = `
        .reply-button {
            background-color: #2196F3;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            margin-right: 4px;
            margin-top: 12px;
            transition: background-color 0.3s, transform 0.2s;
        }

        .reply-button:hover {
            background-color: #0b7dda;
        }

        .reply-button:active {
            transform: scale(0.95);
        }

        .edit-button {
            background-color: #4CAF50;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            margin-right: 4px;
            margin-top: 15px;
            transition: background-color 0.3s, transform 0.2s;
        }

        .edit-button:hover {
            background-color: #45a049;
        }

        .edit-button:active {
            transform: scale(0.95);
        }

        .delete-button {
            background-color: #f44336;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            margin-left: 4px;
            transition: background-color 0.3s, transform 0.2s;
        }

        .delete-button:hover {
            background-color: #d32f2f;
        }

        .delete-button:active {
            transform: scale(0.95);
        }
    `;

    // Добавляем стили в документ
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

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

    function validateName(name) {
        return name.length > 0 && !/^\s*$/.test(name);
    }

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

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

    function loadMessages() {
        fetch(Avatar)
            .then(response => response.json())
            .then(data => {
                messageList.innerHTML = "";
                
                const allMessages = data.flatMap(user => user.messages);
                allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                allMessages.forEach(message => {
                    displayMessage(message);
                });

                if (lastMessageTimestamp && allMessages.length > 0) {
                    const newMessages = allMessages.filter(message => new Date(message.timestamp) > new Date(lastMessageTimestamp));
                    if (newMessages.length > 0) {
                        playNotificationSound();
                        newMessages.forEach(message => showNotification(message.text));
                    }
                }

                if (allMessages.length > 0) {
                    lastMessageTimestamp = allMessages[allMessages.length - 1].timestamp;
                }
            })
            .catch(error => console.error("Ошибка загрузки сообщений:", error));
    }

    // Функция для добавления форматирования
    function applyFormatting(startTag, endTag) {
        const cursorPosition = messageInput.selectionStart;
        const value = messageInput.value;
        const beforeCursor = value.slice(0, cursorPosition);
        const afterCursor = value.slice(cursorPosition);
        const selectedText = value.slice(messageInput.selectionStart, messageInput.selectionEnd);
        messageInput.value = `${beforeCursor}${startTag}${selectedText}${endTag}${afterCursor}`;
        messageInput.selectionStart = cursorPosition + startTag.length;
        messageInput.selectionEnd = cursorPosition + startTag.length + selectedText.length;
    }

    function formatText(text) {
        // Форматирование кода
        text = text.replace(/```([\s\S]*?)```/g, '<div class="code-block-wrapper"><pre class="code-block">$1</pre><button class="copy-button">Копировать</button></div>');
        // Форматирование жирного текста
        text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
        // Форматирование курсивного текста
        text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        return text;
    }    

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("copy-button")) {
            const codeBlock = event.target.previousElementSibling.innerText; // Получаем текст из блока кода
            navigator.clipboard.writeText(codeBlock)
                .then(() => {
                    alert("Код скопирован в буфер обмена!");
                })
                .catch(err => {
                    console.error("Ошибка при копировании кода:", err);
                });
        }
    });

    function displayMessage(message) {
        let messageElement = document.querySelector(`.message[data-id='${message.id}']`);
        if (!messageElement) {
            messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.setAttribute("data-id", message.id);

            if (message.username === username) {
                messageElement.classList.add("user");
            }

            const formattedText = formatText(message.text);

            messageElement.innerHTML = `
                <strong>${message.username}:</strong> ${formattedText}
                <br><small>${new Date(message.timestamp).toLocaleTimeString()}</small>
                ${message.username === username ? `
                    <button class="edit-button" data-id="${message.id}">Изменить</button>
                    <button class="delete-button" data-id="${message.id}">Удалить</button>
                ` : `
                    <button class="reply-button" data-username="${message.username}">Ответить</button>
                `}
            `;
            messageList.appendChild(messageElement);
        } else {
            updateMessageInDOM(message);
        }
    }

    function updateMessageInDOM(message) {
        const messageElement = document.querySelector(`.message[data-id='${message.id}']`);
        if (messageElement) {
            const formattedText = formatText(message.text);
            messageElement.querySelector('strong').nextSibling.innerHTML = formattedText;
            messageElement.querySelector('small').textContent = new Date(message.timestamp).toLocaleTimeString();
        }
    }

    function sendMessage() {
        const text = messageInput.value.trim();

        if (text !== "" && username) {
            const formattedText = text.replace(/\n/g, '<br>'); // Заменяем символы новой строки на <br>

            fetch(Avatar)
                .then(response => response.json())
                .then(data => {
                    const user = data.find(user => user.username === username);
                    if (user) {
                        const newMessage = {
                            id: Date.now().toString(),
                            text: formattedText,
                            timestamp: new Date().toISOString(),
                            username: username
                        };
                        const updatedMessages = [...user.messages, newMessage];

                        return fetch(`${Avatar}/${user.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                ...user,
                                messages: updatedMessages
                            })
                        });
                    }
                })
                .then(() => {
                    messageInput.value = "";
                    loadMessages();
                })
                .catch(error => console.error("Ошибка отправки сообщения:", error));
        }
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (event.ctrlKey) {
                const cursorPosition = messageInput.selectionStart;
                const value = messageInput.value;
                messageInput.value = value.slice(0, cursorPosition) + "\n" + value.slice(cursorPosition);
                messageInput.selectionStart = cursorPosition + 1;
                messageInput.selectionEnd = cursorPosition + 1;
            } else {
                sendMessage();
            }
        }
    }

    messageInput.addEventListener("keydown", handleKeyPress);

    sendMessageButton.addEventListener("click", sendMessage);

    function playNotificationSound() {
        notificationSound.play();
    }

    function showNotification(messageText) {
        const notification = document.createElement("div");
        notification.classList.add("notification");
        notification.innerText = messageText;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function startMessagePolling() {
        setInterval(loadMessages, MESSAGE_UPDATE_INTERVAL);
    }

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    messageList.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-button")) {
            const messageId = event.target.getAttribute("data-id");

            fetch(Avatar)
                .then(response => response.json())
                .then(data => {
                    const user = data.find(user => user.username === username);
                    if (user) {
                        const message = user.messages.find(msg => msg.id === messageId);
                        if (message) {
                            messageInput.value = message.text;
                            messageInput.focus();
                            messageInput.placeholder = `Измените сообщение`;

                            sendMessageButton.removeEventListener("click", sendMessage);
                            sendMessageButton.addEventListener("click", () => {
                                if (messageInput.value.trim() !== "") {
                                    const updatedMessage = {
                                        ...message,
                                        text: messageInput.value.trim(),
                                        timestamp: new Date().toISOString()
                                    };
                                    const updatedMessages = user.messages.map(msg => msg.id === messageId ? updatedMessage : msg);

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
                                    .then(response => response.json())
                                    .then(() => {
                                        messageInput.value = "";
                                        messageInput.placeholder = "Введите сообщение...";
                                        updateMessageInDOM(updatedMessage);
                                        messageList.scrollTop = messageList.scrollHeight;
                                    })
                                    .catch(error => console.error("Ошибка обновления сообщения:", error));
                                }
                            });
                        }
                    }
                })
                .catch(error => console.error("Ошибка загрузки пользователя для редактирования сообщения:", error));
        } else if (event.target.classList.contains("delete-button")) {
            const messageId = event.target.getAttribute("data-id");

            fetch(Avatar)
                .then(response => response.json())
                .then(data => {
                    const user = data.find(user => user.username === username);
                    if (user) {
                        const updatedMessages = user.messages.filter(msg => msg.id !== messageId);

                        return fetch(`${Avatar}/${user.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                ...user,
                                messages: updatedMessages
                            })
                        });
                    }
                })
                .then(() => {
                    loadMessages();
                })
                .catch(error => console.error("Ошибка удаления сообщения:", error));
        } else if (event.target.classList.contains("reply-button")) {
            const replyTo = event.target.getAttribute("data-username");
            messageInput.value = `@${replyTo} `;
            messageInput.focus();
            replyToUser = replyTo;
        }
    });

    messageInput.addEventListener("input", () => {
        if (replyToUser) {
            const value = messageInput.value;
            if (!value.includes(`@${replyToUser}`)) {
                replyToUser = null;
            }
        }
    });

    startMessagePolling();
});
