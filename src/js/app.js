import Dislay from './Display.js';
import init from './init.js';
import Storage from './Storage.js';

const storage = new Storage();
const display = new Dislay();

let draggedEl = null;
let ghostEl = null;
let elWidth;
let elHeight;
let elTop;
let elLeft;
const elTasks = document.querySelector('#tasks');

function elDragDrop(e, element) {
  const closest = document.elementFromPoint(e.clientX, e.clientY);
  const { top } = closest.getBoundingClientRect();

  if (closest.classList.contains('item-task')) {
    if (e.pageY > window.scrollY + top + closest.offsetHeight / 2) {
      closest
        .closest('.item-tasks')
        .insertBefore(element, closest.nextElementSibling);
    } else {
      closest.closest('.item-tasks').insertBefore(element, closest);
    }
  } else if (
    closest.classList.contains('item-tasks')
    && !closest.querySelector('.item-task')
  ) {
    closest.append(element);
  }
}

function objectTasks() {
  const toDoTasks = document.querySelectorAll('#todo .item-tasks .item-task');
  const inProgressTasks = document.querySelectorAll(
    '#in-progress .item-tasks .item-task',
  );
  const doneTasks = document.querySelectorAll('#done .item-tasks .item-task');

  const objTasks = {
    todo: [],
    inProgress: [],
    done: [],
  };

  for (const item of toDoTasks) {
    objTasks.todo.push(item.textContent.replace(' ✖', ''));
  }

  for (const item of inProgressTasks) {
    objTasks.inProgress.push(item.textContent.replace(' ✖', ''));
  }

  for (const item of doneTasks) {
    objTasks.done.push(item.textContent.replace(' ✖', ''));
  }
  storage.save(objTasks);
}

document.addEventListener('DOMContentLoaded', () => {
  const storageData = JSON.parse(storage.load());
  if (storageData !== null) {
    display.initTasks(storageData);
  } else {
    display.initTasks(init());
  }
});

// mousedown
elTasks.addEventListener('mousedown', (e) => {
  // открыть добавление новой задачи
  if (e.target.classList.contains('add-task')) {
    e.target.parentNode.querySelector('.input-task').classList.remove('hidden');
    e.target.classList.add('hidden');

    // отмена добавления задачи
  } else if (e.target.classList.contains('b-cancel-task')) {
    e.target
      .closest('.col-tasks')
      .querySelector('.add-task')
      .classList.remove('hidden');
    e.target.parentNode.classList.add('hidden');

    // добавить новую задачу
  } else if (e.target.classList.contains('b-add-task')) {
    const elAddTask = e.target
      .closest('.col-tasks')
      .querySelector('.item-tasks');
    const elInput = e.target.closest('.input-task').querySelector('#text-task');
    display.addTask(elAddTask, elInput.value);
    elInput.value = '';
    e.target
      .closest('.col-tasks')
      .querySelector('.add-task')
      .classList.remove('hidden');
    e.target.parentNode.classList.add('hidden');
    objectTasks();

    // удалить текущую задачу
  } else if (e.target.classList.contains('del-task')) {
    const itemDel = e.target.parentNode;
    itemDel.parentNode.removeChild(itemDel);
    objectTasks();

    // начало перемещения задачи
  } else if (e.target.classList.contains('item-task')) {
    e.preventDefault();
    e.target.querySelector('.del-task').classList.add('hidden');
    const { top, left } = e.target.getBoundingClientRect();
    draggedEl = e.target;
    elWidth = draggedEl.offsetWidth;
    elHeight = draggedEl.offsetHeight;
    elLeft = e.pageX - left;
    elTop = e.pageY - top;

    ghostEl = e.target.cloneNode(true);
    ghostEl.innerHTML = '';
    ghostEl.style.backgroundColor = 'purple';
    ghostEl.style.width = `${elWidth}px`;
    ghostEl.style.height = `${elHeight}px`;

    draggedEl.classList.add('dragged');
    e.target.parentNode.insertBefore(ghostEl, e.target.nextElementSibling);

    draggedEl.style.left = `${e.pageX - elLeft}px`;
    draggedEl.style.top = `${e.pageY - elTop}px`;
    draggedEl.style.width = `${elWidth}px`;
    draggedEl.style.height = `${elHeight}px`;
  }
});

// mouseleave
elTasks.addEventListener('mouseleave', (e) => {
  if (draggedEl) {
    e.preventDefault();
    ghostEl.parentNode.removeChild(ghostEl);
    draggedEl.classList.remove('dragged');
    draggedEl.style = '';
    ghostEl = null;
    draggedEl = null;
  }
});

// mousemove
elTasks.addEventListener('mousemove', (e) => {
  if (draggedEl) {
    e.preventDefault();
    elDragDrop(e, ghostEl);
    draggedEl.style.left = `${e.pageX - elLeft}px`;
    draggedEl.style.top = `${e.pageY - elTop}px`;
  }
});

// mouseup
elTasks.addEventListener('mouseup', (e) => {
  if (draggedEl) {
    elDragDrop(e, draggedEl);

    ghostEl.parentNode.removeChild(ghostEl);
    draggedEl.classList.remove('dragged');
    draggedEl.style = '';
    ghostEl = null;
    draggedEl = null;

    objectTasks();
  }
});
