  const films = [];
const RENDER_EVENT = "render-film";
const STORAGE_KEY = "FILM_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputFilm");
  const searchInput = document.getElementById("searchFilmTitle");
  const confirmEdit = document.getElementById("confirmEdit");
  const cancelEdit = document.getElementById("cancelEdit");

  confirmEdit.addEventListener("click", () => {
    confirmPopup();
  });

  cancelEdit.addEventListener("click", () => {
    cancelPopup();
  });

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addFilm();
  });

  searchInput.addEventListener("input", function () {
    performSearch();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addFilm() {
  const judul = document.getElementById("inputFilmTitle").value;
  let year = document.getElementById("inputFilmYear").value;
  console.log(year);
  year = Number(year);
  const isCompleted = document.getElementById("inputFilmIsComplete").checked;

  const generatedID = generateId();
  const filmObject = generateFilmObject(
    generatedID,
    judul,
    year,
    isCompleted
  );
  films.push(filmObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeFilm(filmObject) {
  const { id, judul, year, isCompleted } = filmObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = `${judul}`;

  const textjudul = document.createElement("p");
  textjudul.innerText = `Judul: ${judul}`;

  const textTahun = document.createElement("p");
  textTahun.innerText = `Tahun: ${year}`;

  const articleDiv = document.createElement("div");
  articleDiv.classList.add("film_item");
  articleDiv.append(textTitle, textjudul, textTahun);

  const actionDiv = document.createElement("div");
  actionDiv.classList.add("action");
  articleDiv.append(actionDiv);

  if (isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum selesai ditonton";
    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    trashButton.innerText = "Hapus Film";
    trashButton.addEventListener("click", function () {
      showPopupConfirmation(id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit Film";
    editButton.addEventListener("click", function () {
      showPopup(id);
    });

    actionDiv.append(undoButton, editButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("green");
    checkButton.innerText = "Selesai ditonton";
    checkButton.addEventListener("click", function () {
      addTaskToCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    trashButton.innerText = "Hapus Film";
    trashButton.addEventListener("click", function () {
      showPopupConfirmation(id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit Film";
    editButton.addEventListener("click", function () {
      showPopup(id);
    });

    actionDiv.append(checkButton, editButton, trashButton);
  }

  return articleDiv;
}

function addTaskToCompleted(filmId) {
  const filmTarget = findFilm(filmId);
  if (filmTarget == null) return;

  filmTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(filmId) {
  const filmTarget = findFilmIndex(filmId);

  if (filmTarget === -1) return;

  films.splice(filmTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(filmId) {
  const filmTarget = findFilm(filmId);

  if (filmTarget == null) return;

  filmTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(films);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const film of data) {
      films.push(film);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteFilmkuList = document.getElementById(
    "incompleteFilmkuList"
  );
  const completeFilmkuList = document.getElementById(
    "completeFilmkuList"
  );
  const searchDiv = document.getElementById("searchDiv");
  searchDiv.hidden = true;

  incompleteFilmkuList.innerHTML = "";
  completeFilmkuList.innerHTML = "";

  for (const filmItem of films) {
    const filmElement = makeFilm(filmItem);
    if (filmItem.isCompleted) {
      completeFilmkuList.append(filmElement);
    } else {
      incompleteFilmkuList.append(filmElement);
    }
  }
});

function performSearch() {
  const searchInput = document.getElementById("searchFilmTitle");
  const searchValue = searchInput.value.toLowerCase();
  const searchDiv = document.getElementById("searchDiv");

  searchDiv.hidden = false;
  requestAnimationFrame(() => {
    searchDiv.classList.add("fadeInAnimate");
  });

  const filteredDataFilm = films.filter((film) => {
    const lowerCasedTitle = film.judul.toLowerCase();
    const lowerCasedYear = film.year.toString().toLowerCase();

    return (
      lowerCasedTitle.includes(searchValue) ||
      lowerCasedYear.includes(searchValue)
    );
  });

  displaySearchResults(filteredDataFilm, searchValue);
}

function displaySearchResults(filteredDataFilm, searchValue) {
  const searchResultsList = document.getElementById("searchResultsList");
  const searchDiv = document.getElementById("searchDiv");

  if (searchValue == "") {
    searchResultsList.innerHTML = "";
    searchDiv.hidden = true;
    requestAnimationFrame(() => {
      searchDiv.classList.remove("fadeInAnimate");
      
    })
  } else {
    for (const film of filteredDataFilm) {
      searchResultsList.innerHTML = "";
      const filmElement = makeFilm(film);
      searchResultsList.append(filmElement);
    }
  }
}

function generateFilmObject(id, judul, year, isCompleted) {
  return {
    id,
    judul,
    year,
    isCompleted,
  };
}

function findFilm(filmId) {
  for (const filmItem of films) {
    if (filmItem.id === filmId) {
      return filmItem;
    }
  }
  return null;
}

function findFilmIndex(filmId) {
  for (const index in films) {
    if (films[index].id === filmId) {
      console.log(index);
      return index;
    }
  }
  return -1;
}

function generateId() {
  return +new Date();
}

function showPopup(id) {
  document.getElementById("popup").style.display = "block";
  let editJudul = document.getElementById("editJudul");
  let editTahun = document.getElementById("editTahun");
  let editCheckbox = document.getElementById("editCheckbox");
  let generatedID = document.getElementById("editID");

  const film = findFilm(id);

  editJudul.value = film.judul;
  editTahun.value = film.year;
  editCheckbox.value = film.isCompleted;
  generatedID.value = id;
}

function confirmPopup() {
  let editJudul = document.getElementById("editJudul").value;
  let editTahun = document.getElementById("editTahun").value;
  editTahun = Number(editTahun);
  let editCheckbox = document.getElementById("editCheckbox").checked;
  let editID = document.getElementById("editID").value;
  editID = parseInt(editID);

  const film = findFilm(editID);
  const generatedID = film.id;

  const filmObject = generateFilmObject(
    generatedID,
    editJudul,
    editTahun,
    editCheckbox
  );

  removeTaskFromCompleted(generatedID);

  films.push(filmObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  closePopup();
}

function cancelPopup() {
  closePopup();
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function confirmPopupConfirmation(id) {
  removeTaskFromCompleted(id);
  
  closePopupConfrimation();
}

function closePopupConfrimation() {
  document.getElementById("confirmation").style.display = "none";
}

function showPopupConfirmation(id) {
  const deleteConfirm = document.getElementById('deleteConfirm');
  const deleteCancel = document.getElementById('deleteCancel');
  document.getElementById("confirmation").style.display = "flex";
  
  deleteConfirm.addEventListener('click', () => {
    confirmPopupConfirmation(id);
  });

  deleteCancel.addEventListener('click', () => {
    closePopupConfrimation();
  });
  

}
