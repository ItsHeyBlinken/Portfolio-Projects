document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoPriority = document.getElementById('todo-priority');
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    const filterDateBtn = document.getElementById('filter-date');
    const filterPriorityBtn = document.getElementById('filter-priority');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const importBtn = document.getElementById('import-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    // Load tasks from local storage
    loadTasks();

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTodoText = todoInput.value.trim();
        const newTodoDate = formatDate(todoDate.value);
        const newTodoPriority = todoPriority.value;
        if (newTodoText !== '') {
            addTodoItem(newTodoText, newTodoDate, newTodoPriority);
            todoInput.value = '';
            todoDate.value = '';
            todoPriority.value = 'low';
            saveTasks();
        }
    });

    filterDateBtn.addEventListener('click', () => {
        sortTasks('date');
    });

    filterPriorityBtn.addEventListener('click', () => {
        sortTasks('priority');
    });

    exportBtn.addEventListener('click', () => {
        exportTasks();
    });

    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const tasks = JSON.parse(e.target.result);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                loadTasks();
            };
            reader.readAsText(file);
        }
    });

    clearCompletedBtn.addEventListener('click', () => {
        clearCompletedTasks();
    });

    function addTodoItem(text, date, priority, completed = false) {
        const tr = document.createElement('tr');
        const checkboxTd = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = completed;
        checkbox.addEventListener('change', () => {
            tr.classList.toggle('completed', checkbox.checked);
            moveTask(tr, checkbox.checked);
            saveTasks();
        });
        checkboxTd.appendChild(checkbox);
        tr.appendChild(checkboxTd);

        const textTd = document.createElement('td');
        textTd.textContent = text;
        tr.appendChild(textTd);

        const dateTd = document.createElement('td');
        dateTd.textContent = date;
        tr.appendChild(dateTd);

        const priorityTd = document.createElement('td');
        priorityTd.textContent = priority;
        tr.appendChild(priorityTd);

        const actionsTd = document.createElement('td');
        const editBtn = document.createElement('span');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit');
        editBtn.addEventListener('click', () => {
            const newText = prompt('Edit task:', text);
            const newDate = prompt('Edit due date (MM-DD-YYYY):', date);
            const newPriority = prompt('Edit priority:', priority);
            if (newText !== null && newDate !== null && newPriority !== null) {
                textTd.textContent = newText.trim();
                dateTd.textContent = formatDate(newDate.trim());
                priorityTd.textContent = newPriority.trim();
                saveTasks();
            }
        });
        actionsTd.appendChild(editBtn);

        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = 'X';
        deleteBtn.classList.add('delete');
        deleteBtn.addEventListener('click', () => {
            tr.remove();
            saveTasks();
        });
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);

        tr.classList.toggle('completed', completed);
        if (completed) {
            completedList.appendChild(tr);
        } else {
            todoList.appendChild(tr);
        }
    }

    function moveTask(tr, completed) {
        if (completed) {
            completedList.appendChild(tr);
        } else {
            todoList.appendChild(tr);
        }
    }

    function saveTasks() {
        const tasks = [];
        todoList.querySelectorAll('tr').forEach(tr => {
            const text = tr.children[1].textContent;
            const date = tr.children[2].textContent;
            const priority = tr.children[3].textContent;
            const completed = tr.children[0].querySelector('input[type="checkbox"]').checked;
            tasks.push({ text, date, priority, completed });
        });
        completedList.querySelectorAll('tr').forEach(tr => {
            const text = tr.children[1].textContent;
            const date = tr.children[2].textContent;
            const priority = tr.children[3].textContent;
            const completed = tr.children[0].querySelector('input[type="checkbox"]').checked;
            tasks.push({ text, date, priority, completed });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        todoList.innerHTML = '';
        completedList.innerHTML = '';
        tasks.forEach(task => addTodoItem(task.text, task.date, task.priority, task.completed));
    }

    function sortTasks(criteria) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        if (criteria === 'date') {
            tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (criteria === 'priority') {
            const priorityOrder = { low: 1, medium: 2, high: 3 };
            tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        todoList.innerHTML = '';
        completedList.innerHTML = '';
        tasks.forEach(task => addTodoItem(task.text, task.date, task.priority, task.completed));
    }

    function exportTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todo-list.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function clearCompletedTasks() {
        completedList.innerHTML = '';
        saveTasks();
    }

    function formatDate(date) {
        const [year, month, day] = date.split('-');
        return `${month}-${day}-${year}`;
    }
});
