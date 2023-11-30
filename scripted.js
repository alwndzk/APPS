const shelf = [];
const RENDER_EVENT = 'render-shelfs';

const SAVED_EVENT = 'saved-shelfs';
const STORAGE_KEY = 'SHELF-APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const textBook = document.getElementById('inputTitle').value;
    const textAuthor = document.getElementById('inputAuthor').value;
    const timestamp = document.getElementById('inputYear').value;
    const checkTB = document.getElementById('inputBookIsComplete');

    const generatedID = generateId();

    if (checkTB.checked) {
        const bookObject = generateBookObject(generatedID, textBook, textAuthor, timestamp, true);
        shelf.push(bookObject);
    } else {
        const bookObject = generateBookObject(generatedID, textBook, textAuthor, timestamp, false);
        shelf.push(bookObject);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//identitas unik
function generateId() {
    return +new Date();
}

function generateBookObject(id, title, text, timestamp, isCompleted) {
    return {
        id,
        title,
        text,
        timestamp,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBOOKList = document.getElementById('shelf');
    uncompletedBOOKList.innerHTML = '';

    const completedBOOKList = document.getElementById('completeBookshelfList');
    completedBOOKList.innerHTML = '';

    for (const bookItem of shelf) {
        const bookElement = showBook(bookItem);
        if (!bookItem.isCompleted)
            uncompletedBOOKList.append(bookElement);
        else
            completedBOOKList.append(bookElement);
    }
});

function showBook(bookObject) {
    const txtBook = document.createElement('h2');
    txtBook.innerText = bookObject.title;

    const txtAuthor = document.createElement('h3');
    txtAuthor.innerText = "Penulis : " + bookObject.text;

    const txtYear = document.createElement('p');
    txtYear.innerText = "Tahun : " + bookObject.timestamp;

    const textContainer = document.createElement('div');
    textContainer.classList.add('book_item');
    textContainer.append(txtBook, txtAuthor, txtYear);

    const incompleteBookshelfList = document.createElement('article');
    incompleteBookshelfList.classList.add('shadow');
    incompleteBookshelfList.append(textContainer);
    incompleteBookshelfList.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.innerText = 'Belum Selesai dibaca';

        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerText = 'Hapus Buku';

        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });

        incompleteBookshelfList.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        checkButton.innerText = 'Selesai dibaca';
        checkButton.addEventListener('click', function () {
            addTaskToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerText = 'Hapus Buku';

        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });

        incompleteBookshelfList.append(checkButton, trashButton);
    }
    return incompleteBookshelfList;
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of shelf) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    shelf.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in shelf) {
        if (shelf[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

document.getElementById('searchSubmit').addEventListener("click", function (event){
    event.preventDefault();

    const search = document.getElementById('searchBooks').value.toLowerCase();
    const bookSearch = document.querySelectorAll('.book_item > h2');
        for (book of bookSearch) {
      if (search === book.innerText.toLowerCase()) {
        book.parentElement.style.display = "block";
      } else {
        book.parentElement.style.display = "none";
      }
    }
});

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(shelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser Kamu Tidak Mendukung Local Storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
})

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            shelf.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}