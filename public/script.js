const tasksContainer = document.getElementById('tasksContainer');
const form = document.getElementById('taskForm');

async function loadTasks(){
    try{
        const response = await fetch("/api/tasks");
        const tasks = await response.json();
        renderTasks(tasks);
    }catch(err){
        console.error("Error fetching tasks:", err);
    }
}

function renderTasks(tasks){
    tasksContainer.innerHTML = '<ul class="list-group"></ul>';
    const ul = tasksContainer.querySelector('ul');
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        let checkedAttribute = "";
        let completedClass = "";

        if (task.completed) {
            checkedAttribute = "checked";
            completedClass = "completed";
        }

        li.innerHTML = `
        <div class="d-flex align-items-center">
            <input class="form-check-input me-3 task-checkbox" type="checkbox" ${checkedAttribute}>
            <span class="task-text text-break ${completedClass}">${task.title}</span>
        </div>
        <button class="btn btn-danger btn-sm delete-btn">
            <i class="bi bi-trash-fill"></i>
        </button>
        `;

        const checkbox = li.querySelector('.task-checkbox');
        const taskText = li.querySelector('.task-text');
        const deleteButton = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', async () => {
            await fetch(`/api/tasks/${task.id}/toggle`, { method: "PUT" });
            taskText.classList.toggle('completed', checkbox.checked);
        });

        deleteButton.addEventListener('click', async () => {
            await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
            loadTasks();
        });

        ul.appendChild(li);
    });
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const taskInput = document.getElementById('taskInput');
    const title = taskInput.value;
    if (title){
        await fetch("/api/tasks", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ title }),
        });
        taskInput.value = '';
        loadTasks();
    }
});