const assignments = [];

function addAssignment(date, title) {
    assignments.push({ date, title });
    displayAssignments();
}

function removeAssignment(index) {
    if (index > -1 && index < assignments.length) {
        assignments.splice(index, 1);
        displayAssignments();
    }
}

function displayAssignments() {
    const assignmentList = document.getElementById('assignment-list');
    assignmentList.innerHTML = '';

    assignments.forEach((assignment, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${assignment.date}: ${assignment.title}`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeAssignment(index);
        listItem.appendChild(removeButton);
        assignmentList.appendChild(listItem);
    });
}

document.getElementById('add-assignment-form').onsubmit = function(event) {
    event.preventDefault();
    const date = document.getElementById('assignment-date').value;
    const title = document.getElementById('assignment-title').value;
    addAssignment(date, title);
    this.reset();
};