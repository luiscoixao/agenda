document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task-input');
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
        if (taskText) {
            const taskId = Date.now().toString();
            const taskItem = document.createElement('li');
            taskItem.dataset.id = taskId;
            taskItem.innerHTML = `
                <input type="checkbox" id="task-${taskId}">
                <label for="task-${taskId}">${taskText}</label>
                <button class="delete-btn" data-id="${taskId}">Supprimer</button>
            `;
            taskList.appendChild(taskItem);
            taskInput.value = '';

            // Sauvegarder la tâche
            saveTask(taskId, taskText, false);

            // Ajouter un écouteur d'événement pour la case à cocher
            const checkbox = taskItem.querySelector(`input[type="checkbox"]`);
            checkbox.addEventListener('change', () => toggleTask(taskId, checkbox.checked));

            // Ajouter un écouteur d'événement pour le bouton supprimer
            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(taskId));
        }
    }

    function toggleTask(taskId, isCompleted) {
        const taskItem = document.querySelector(`li[data-id="${taskId}"]`);
        if (taskItem) {
            if (isCompleted) {
                taskItem.classList.add('completed');
            } else {
                taskItem.classList.remove('completed');
            }
            // Mettre à jour la tâche dans le stockage local
            const taskText = taskItem.querySelector('label').textContent;
            saveTask(taskId, taskText, isCompleted);
        }
    }

    function deleteTask(taskId) {
        const taskItem = document.querySelector(`li[data-id="${taskId}"]`);
        if (taskItem) {
            taskItem.remove();
            // Supprimer la tâche du stockage local
            deleteTaskFromStorage(taskId);
        }
    }

    function saveTask(id, text, completed) {
        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex >= 0) {
            tasks[taskIndex] = { id, text, completed };
        } else {
            tasks.push({ id, text, completed });
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
            taskItem.innerHTML = `
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="task-${task.id}">${task.text}</label>
                <button class="delete-btn" data-id="${task.id}">Supprimer</button>
            `;
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskList.appendChild(taskItem);

            // Ajouter les écouteurs d'événements
            const checkbox = taskItem.querySelector(`input[type="checkbox"]`);
            checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        });
    }
});