const url = "https://to-do-list-df1c5-default-rtdb.firebaseio.com/";
let list = document.querySelector(".task-list");
let tasklist = [];

//FILTERS

let pendingFilter = document.querySelector(".filter:nth-child(1)");
let completedFilter = document.querySelector(".filter:nth-child(2)");
let allFilter = document.querySelector(".filter:nth-child(3)");

pendingFilter.addEventListener("click", showPendingTasks);
completedFilter.addEventListener("click", showCompletedTasks);
allFilter.addEventListener("click", showAllTasks);

const bringTasks = async () => {
  try {
    const response = await fetch(url + "tasks.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

async function showPendingTasks() {
  list.innerHTML = "";
  list.textContent = "";
  pendingFilter.classList.add("active");
  completedFilter.classList.remove("active");
  allFilter.classList.remove("active");
  try {
    const data = await bringTasks();
    const tasks = Object.keys(data).map((key) => ({ id: key, ...data[key] })); // despues la explico (clase 10)
    if (tasks.filter((task) => !task.finish).length > 0) {
      list.style.display = "block";
      tasks.forEach((t) => {
        if (!t.finish) {
          createCard(t);
        }
      });
    } else {
      list.innerHTML = "<p class='no-tasks'>You don't have pending tasks</p>";
    }
  } catch (error) {
    list.innerHTML = "<p class='no-tasks'>You don't have pending tasks</p>";

    console.log(error);
  }
}

async function showCompletedTasks() {
  list.innerHTML = "";
  list.textContent = "";

  pendingFilter.classList.remove("active");
  completedFilter.classList.add("active");
  allFilter.classList.remove("active");
  try {
    const data = await bringTasks();
    const tasks = Object.keys(data).map((key) => ({ id: key, ...data[key] })); // despues la explico (clase 10)
    if (tasks.filter((task) => task.finish).length) {
      list.style.display = "block";
      tasks.forEach((t) => {
        if (t.finish) {
          createCompleteCard(t);
        }
      });
    } else {
      list.innerHTML = "<p class='no-tasks'>You don't have completed tasks</p>";
    }
  } catch (error) {
    list.innerHTML = "<p class='no-tasks'>You don't have completed tasks</p>";

    console.log(error);
  }
}

async function showAllTasks() {
  list.innerHTML = "";
  list.textContent = "";
  pendingFilter.classList.remove("active");
  completedFilter.classList.remove("active");
  allFilter.classList.add("active");
  try {
    const data = await bringTasks();
    const tasks = Object.keys(data).map((key) => ({ id: key, ...data[key] })); // despues la explico (clase 10)
    if (tasks.length) {
      tasks.forEach((t) => {
        if (!t.finish) {
          createCard(t);
        } else {
          createCompleteCard(t);
        }
      });
    }
  } catch (error) {
    list.innerHTML = "<p class='no-tasks'>You don't have tasks</p>";

    console.log(error);
  }
}

showPendingTasks();

//NEW TASK

const newTaskButton = document.getElementById("new-task-button");

newTaskButton.addEventListener("click", async () => {
  event.preventDefault();
  let newTaskName = document.getElementById("new-task-name");
  let task = createTask(newTaskName.value);
  if (task) {
    newTaskName.value = "";

    const response = await fetch(url + "tasks.json", {
      method: "POST",
      body: JSON.stringify(task),
    });
    whichFilter();
  }
});

function createTask(name) {
  name = name.trim();
  let taskList = [];
  let newTask = {
    date: new Date(),
    name: name,
    finish: false,
  };
  if (!name) {
    alert("No puedes dejar vacio el nombre de la tarea");
  } else
    try {
      const data = bringTasks();
      taskList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      if (
        taskList.some(
          (task) => task.name === newTask.name && task.finish === false
        )
      ) {
        alert("Nombre de tarea ya existente");
      } else {
        while (taskList.some((task) => task.id === newTask.id)) {
          newTask.id = crypto.randomUUID();
        }
        taskList.push(newTask);
        return newTask;
      }
    } catch (error) {
      console.log(error);
    }

  return null;
}

async function createCard(task) {
  let card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
  <button class='btn button-complete'>
  <img src="./assets/empty-circle.png" class='img-check' alt="">
  </button>
  <p class='task-name'>${task.name}</p>
     <button class='btn button-delete'><img src="./assets/trash.png"  class='img-delete' alt=""></button>
    `;
  list.append(card);

  let completeButton = card.querySelector(".button-complete");
  let completeImg = completeButton.querySelector(".img-check");

  completeButton.addEventListener("mouseover", () => {
    completeImg.src = "./assets/check.png";
  });

  completeButton.addEventListener("mouseout", () => {
    completeImg.src = "./assets/empty-circle.png";
  });

  completeButton.addEventListener("click", () => {
    completeTask(task, card);
  });

  let deleteButton = card.querySelector(".button-delete");
  deleteButton.addEventListener("click", () => {
    deleteTask(task, card);
  });
}

//COMPLETE CARD

const completeTask = async (task, card) => {
  card.remove();

  try {
    await fetch(url + `tasks/${task.id}.json`, {
      method: "PATCH",
      body: JSON.stringify({ finish: true }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
  }
  card.remove();

  whichFilter();
};

function createCompleteCard(task) {
  let card = document.createElement("div");
  card.className = "card finished-card";
  card.innerHTML = `
    <p class='task-name'>${task.name}</p>
    <button class='btn button-delete'><img src="./assets/trash.png" class='img-delete' alt=""></button>
  `;
  list.append(card);

  let deleteButton = card.querySelector(".button-delete");
  deleteButton.addEventListener("click", () => {
    deleteTask(task, card);
  });
}

//DELETE TASK

const deleteTask = async (task, card) => {
  card.remove();

  try {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await fetch(url + `tasks/${task.id}.json`, { method: "DELETE" });
          whichFilter();

          swalWithBootstrapButtons.fire({
            title: "Deleted!",
            text: "Your task has been deleted.",
            icon: "success",
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your task is safe :)",
            icon: "error",
          });
          whichFilter();

        }
      });

   
  } catch (error) {
    console.log(error);
  }
};

async function deleteAll() {
  try {
    
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await fetch(url + `tasks.json`, { method: "DELETE" });
          whichFilter();

          swalWithBootstrapButtons.fire({
            title: "Deleted!",
            text: "Your tasks have been deleted.",
            icon: "success",
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your tasks are safe :)",
            icon: "error",

          });
          whichFilter();

        }
      });
  } catch (error) {
    console.log(error);
  }
}

function whichFilter() {
  if (pendingFilter.classList.contains("active")) {
    showPendingTasks();
  } else if (completedFilter.classList.contains("active")) {
    showCompletedTasks();
  } else {
    showAllTasks();
  }
}
