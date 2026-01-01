/**************** FIREBASE ****************/
const firebaseConfig = {
  apiKey: "AIzaSyBmB70ARqtpsgynEMB4FeKO8RvGpm7xJIo",
  authDomain: "planner-5d5ad.firebaseapp.com",
  databaseURL: "https://planner-5d5ad-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "planner-5d5ad",
  storageBucket: "planner-5d5ad.appspot.com",
  messagingSenderId: "863989121194",
  appId: "1:863989121194:web:910322f3f1fcaddd8f90d3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/**************** DATE ****************/
const today = new Date().toISOString().slice(0, 10);
document.getElementById("date").textContent = today;

/**************** BUILD TABLE ****************/
const planner = document.getElementById("planner");

for (let hour = 8; hour <= 22; hour++) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${hour}:00</td>
    <td>
  <input
    type="text"
    class="todo"
    data-hour="${hour}"
    maxlength="20"
  >
</td>

    <td style="text-align:center">
      <input type="checkbox" class="priority" data-hour="${hour}">
    </td>
  `;

  planner.appendChild(row);
}

/**************** SAVE TO FIREBASE ****************/
document.querySelectorAll(".todo").forEach(input => {
  input.addEventListener("input", e => {
    const hour = e.target.dataset.hour;
    db.ref(`${today}/${hour}/todo`).set(e.target.value);
  });
});

document.querySelectorAll(".priority").forEach(box => {
  box.addEventListener("change", e => {
    const hour = e.target.dataset.hour;
    db.ref(`${today}/${hour}/priority`).set(e.target.checked);
  });
});

/**************** LOAD FROM FIREBASE ****************/
db.ref(today).on("value", snapshot => {
  const data = snapshot.val();
  if (!data) return;

  Object.keys(data).forEach(hour => {
    const todo = document.querySelector(`.todo[data-hour="${hour}"]`);
    const priority = document.querySelector(`.priority[data-hour="${hour}"]`);

    if (todo) todo.value = data[hour].todo || "";
    if (priority) priority.checked = data[hour].priority || false;
  });
});


/**************** SIDE TABLE SAVE ****************/
document.querySelectorAll('#side-table input').forEach(input => {
  input.addEventListener('input', e => {
    const row = e.target.dataset.row;
    db.ref(`${today}/sideTable/${row}`).set(e.target.value);
  });
});


/**************** SIDE TABLE LOAD ****************/
db.ref(`${today}/sideTable`).on('value', snapshot => {
  const data = snapshot.val();
  if (!data) return;

  Object.keys(data).forEach(row => {
    const input = document.querySelector(
      `#side-table input[data-row="${row}"]`
    );
    if (input) input.value = data[row];
  });
});


/**************** GOAL SAVE ****************/
const goalInput = document.getElementById("goal-text");

goalInput.addEventListener("input", e => {
  db.ref(`${today}/goal`).set(e.target.value);
});

/**************** GOAL LOAD ****************/
db.ref(`${today}/goal`).on("value", snapshot => {
  if (snapshot.exists()) {
    goalInput.value = snapshot.val();
  }
});

/**************** CLEAR DAY BUTTON ****************/
document.getElementById("clear-day").addEventListener("click", () => {
  const confirmed = confirm("This will erase all data for today. Continue?");
  if (!confirmed) return;

  db.ref(today).remove();

});
