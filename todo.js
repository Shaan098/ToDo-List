let todoList = [];

// Load todos from localStorage on page load
function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        todoList = JSON.parse(stored);
    }
    renderTodoList();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todoList));
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
}

// Check if date is overdue
function isOverdue(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
}

function renderTodoList() {
    let todoListHTML = '';

    todoList.forEach(function(todoObject, index) {
        const name = todoObject.name;
        const dueDate = todoObject.dueDate;
        const completed = todoObject.completed || false;
        const overdue = isOverdue(dueDate) && !completed;

        const html = `
        <div class="todo-item ${completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}" data-index="${index}">
            <div class="todo-content">
                <button class="check-button ${completed ? 'checked' : ''}" onclick="toggleComplete(${index})">
                    ${completed ? '✓' : ''}
                </button>
                <div class="todo-text">
                    <div class="todo-name ${completed ? 'strikethrough' : ''}">${name}</div>
                    <div class="todo-date ${overdue ? 'overdue-text' : ''}">
                        <span class="date-icon">📅</span>
                        ${formatDate(dueDate)}
                        ${overdue ? '<span class="overdue-badge">Overdue</span>' : ''}
                    </div>
                </div>
            </div>
            <button class="delete-todo-button" onclick="deleteTodo(${index})" title="Delete task">
                🗑️
            </button>
        </div>
        `;

        todoListHTML += html;
    });

    const todoListElement = document.querySelector('.js-todo-list');
    todoListElement.innerHTML = todoListHTML;

    // Show/hide empty state
    const emptyState = document.querySelector('.js-empty-state');
    if (todoList.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
    }

    // Update stats
    updateStats();
    
    // Save to localStorage
    saveTodos();
}

function updateStats() {
    const total = todoList.length;
    const completed = todoList.filter(todo => todo.completed).length;
    const pending = total - completed;

    document.querySelector('.js-total-count').textContent = total;
    document.querySelector('.js-completed-count').textContent = completed;
    document.querySelector('.js-pending-count').textContent = pending;
}

function addTodo() {
    const inputElement = document.querySelector('.js-name-input');
    const dueDateElement = document.querySelector('.js-due-date-input');

    const name = inputElement.value.trim();
    const dueDate = dueDateElement.value;

    if (name === '') {
        inputElement.classList.add('shake');
        setTimeout(() => inputElement.classList.remove('shake'), 500);
        return;
    }

    if (dueDate === '') {
        dueDateElement.classList.add('shake');
        setTimeout(() => dueDateElement.classList.remove('shake'), 500);
        return;
    }

    todoList.push({
        name: name,
        dueDate: dueDate,
        completed: false
    });

    inputElement.value = '';
    dueDateElement.value = '';

    renderTodoList();
    
    // Add animation effect
    const todoItems = document.querySelectorAll('.todo-item');
    if (todoItems.length > 0) {
        const lastItem = todoItems[todoItems.length - 1];
        lastItem.classList.add('slide-in');
    }
}

function toggleComplete(index) {
    todoList[index].completed = !todoList[index].completed;
    renderTodoList();
}

function deleteTodo(index) {
    const todoItem = document.querySelector(`[data-index="${index}"]`);
    if (todoItem) {
        todoItem.classList.add('slide-out');
        setTimeout(() => {
            todoList.splice(index, 1);
            renderTodoList();
        }, 300);
    }
}

// Add Enter key support
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.querySelector('.js-name-input');
    const dateInput = document.querySelector('.js-due-date-input');
    
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            dateInput.focus();
        }
    });
    
    dateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
            nameInput.focus();
        }
    });
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Load todos on page load
    loadTodos();
});
