document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task-input');
    const taskDatetimeInput = document.getElementById('new-task-datetime');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // Charger les tâches sauvegardées
    loadTasks();

    // Ajouter une tâche
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        const taskDatetime = taskDatetimeInput.value;
        if (taskText) {
            const taskId = Date.now().toString();
            const formattedDatetime = taskDatetime ? formatDate(new Date(taskDatetime)) : 'Aucune date';

            const taskItem = document.createElement('li');
            taskItem.dataset.id = taskId;
            taskItem.innerHTML = `
                <input type="checkbox" id="task-${taskId}">
                <div class="task-info">
                    <div class="task-text">${taskText}</div>
                    <div class="task-time">${formattedDatetime}</div>
                </div>
                <button class="delete-btn" data-id="${taskId}">🗑️</button>
            `;
            taskList.appendChild(taskItem);

            // Effacer les champs
            taskInput.value = '';
            taskDatetimeInput.value = '';

            // Sauvegarder la tâche
            saveTask(taskId, taskText, taskDatetime, false);

            // Ajouter les écouteurs d'événements
            const checkbox = taskItem.querySelector(`input[type="checkbox"]`);
            checkbox.addEventListener('change', () => toggleTask(taskId, checkbox.checked));

            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(taskId));

            // Planifier un rappel
            scheduleNotification(taskText, taskDatetime);
        }
    }

    function formatDate(date) {
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function toggleTask(taskId, isCompleted) {
        const taskItem = document.querySelector(`li[data-id="${taskId}"]`);
        if (taskItem) {
            if (isCompleted) {
                taskItem.classList.add('completed');
            } else {
                taskItem.classList.remove('completed');
            }
            const taskText = taskItem.querySelector('.task-text').textContent;
            const taskTimeElement = taskItem.querySelector('.task-time');
            const taskTime = taskTimeElement.textContent === 'Aucune date' ? null : new Date(taskTimeElement.dataset.datetime).toISOString();
            saveTask(taskId, taskText, taskTime, isCompleted);
        }
    }

    function deleteTask(taskId) {
        const taskItem = document.querySelector(`li[data-id="${taskId}"]`);
        if (taskItem) {
            taskItem.remove();
            deleteTaskFromStorage(taskId);
        }
    }

    function saveTask(id, text, time, completed) {
        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex >= 0) {
            tasks[taskIndex] = { id, text, time, completed };
        } else {
            tasks.push({ id, text, time, completed });
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function deleteTaskFromStorage(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.dataset.id = task.id;
            const formattedDatetime = task.time ? formatDate(new Date(task.time)) : 'Aucune date';
            taskItem.innerHTML = `
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                <div class="task-info">
                    <div class="task-text">${task.text}</div>
                    <div class="task-time" ${task.time ? `data-datetime="${task.time}"` : ''}>${formattedDatetime}</div>
                </div>
                <button class="delete-btn" data-id="${task.id}">🗑️</button>
            `;
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskList.appendChild(taskItem);

            const checkbox = taskItem.querySelector(`input[type="checkbox"]`);
            checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        });
    }

    function scheduleNotification(taskText, taskDatetime) {
        if (!taskDatetime) return;

        const now = new Date();
        const taskTime = new Date(taskDatetime);

        if (taskTime <= now) return;

        const timeUntilNotification = taskTime - now;

        setTimeout(() => {
            alert(`Rappel : ${taskText}`);
        }, timeUntilNotification);
    }
});