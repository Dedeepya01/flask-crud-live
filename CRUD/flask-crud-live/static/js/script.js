let users = [];
let editingUserId = null;
let deletingUserId = null;

/* ==========================
LOAD USERS
========================== */

async function loadUsers() {

showLoading(true);
hideError();

try {

    const response = await fetch("/users");

    if (!response.ok) {
        throw new Error("Unable to load users");
    }

    users = await response.json();

    displayUsers(users);

    updateUserCount();

} catch (error) {

    console.error(error);

    showError(
        "Unable to connect to the Flask server."
    );

} finally {

    showLoading(false);

}


}

/* ==========================
DISPLAY USERS
========================== */

function displayUsers(userList) {

const table =
    document.getElementById("usersTable");

const empty =
    document.getElementById("emptyState");

table.innerHTML = "";


if (userList.length === 0) {

    empty.style.display = "block";

    return;
}


empty.style.display = "none";


userList.forEach(user => {

    const row = document.createElement("tr");


    row.innerHTML = `

        <td>
            #${user.id}
        </td>

        <td>
            <span class="username">
                ${escapeHtml(user.username)}
            </span>
        </td>

        <td>
            <span class="email">
                ${escapeHtml(user.email)}
            </span>
        </td>

        <td>

            <div class="action-buttons">

                <button
                    class="edit-btn"
                    onclick="openEditModal(${user.id})">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="openDeleteModal(${user.id})">
                    Delete
                </button>

            </div>

        </td>
    `;


    table.appendChild(row);

});


}

/* ==========================
CREATE USER
========================== */

async function createUser(username, email) {

const response = await fetch("/users", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        username: username,
        email: email
    })

});


const data = await response.json();


if (!response.ok) {
    throw new Error(
        data.message || "Unable to create user"
    );
}


return data;


}

/* ==========================
UPDATE USER
========================== */

async function updateUser(id, username, email) {

const response = await fetch(
    `/users/${id}`,
    {
        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: username,
            email: email
        })
    }
);


const data = await response.json();


if (!response.ok) {
    throw new Error(
        data.message || "Unable to update user"
    );
}


return data;


}

/* ==========================
DELETE USER
========================== */

async function deleteUser(id) {

const response = await fetch(
    `/users/${id}`,
    {
        method: "DELETE"
    }
);


const data = await response.json();


if (!response.ok) {
    throw new Error(
        data.message || "Unable to delete user"
    );
}


return data;


}

/* ==========================
ADD USER MODAL
========================== */

function openAddModal() {

editingUserId = null;

document.getElementById("modalTitle")
    .textContent = "Add User";

document.getElementById("submitButton")
    .textContent = "Add User";

document.getElementById("userForm")
    .reset();

hideFormError();

document.getElementById("userModal")
    .classList.add("active");

document.getElementById("username")
    .focus();


}

/* ==========================
EDIT USER MODAL
========================== */

function openEditModal(id) {

const user = users.find(
    item => item.id === id
);


if (!user) {
    return;
}


editingUserId = id;


document.getElementById("modalTitle")
    .textContent = "Edit User";

document.getElementById("submitButton")
    .textContent = "Save Changes";


document.getElementById("username")
    .value = user.username;

document.getElementById("email")
    .value = user.email;


hideFormError();


document.getElementById("userModal")
    .classList.add("active");

document.getElementById("username")
    .focus();


}

/* ==========================
CLOSE USER MODAL
========================== */

function closeModal() {

document.getElementById("userModal")
    .classList.remove("active");

document.getElementById("userForm")
    .reset();

editingUserId = null;

hideFormError();


}

/* ==========================
FORM SUBMIT
========================== */

document
.getElementById("userForm")
.addEventListener(
"submit",
async function(event) {

        event.preventDefault();


        const username =
            document.getElementById("username")
                .value
                .trim();


        const email =
            document.getElementById("email")
                .value
                .trim();


        if (!username || !email) {

            showFormError(
                "Username and email are required."
            );

            return;
        }


        const button =
            document.getElementById(
                "submitButton"
            );


        button.disabled = true;


        try {

            if (editingUserId !== null) {

                await updateUser(
                    editingUserId,
                    username,
                    email
                );

            } else {

                await createUser(
                    username,
                    email
                );

            }


            closeModal();

            await loadUsers();


        } catch (error) {

            console.error(error);

            showFormError(
                error.message
            );

        } finally {

            button.disabled = false;

        }

    }
);


/* ==========================
DELETE MODAL
========================== */

function openDeleteModal(id) {

deletingUserId = id;

document.getElementById("deleteModal")
    .classList.add("active");


}

function closeDeleteModal() {

deletingUserId = null;

document.getElementById("deleteModal")
    .classList.remove("active");


}

async function confirmDelete() {

if (deletingUserId === null) {
    return;
}


try {

    await deleteUser(deletingUserId);

    closeDeleteModal();

    await loadUsers();

} catch (error) {

    console.error(error);

    alert(error.message);

}


}

/* ==========================
SEARCH USERS
========================== */

function searchUsers() {

const search =
    document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


if (search === "") {

    displayUsers(users);

    return;
}


const filtered =
    users.filter(user =>

        String(user.id)
            .includes(search)

        ||

        user.username
            .toLowerCase()
            .includes(search)

        ||

        user.email
            .toLowerCase()
            .includes(search)

    );


displayUsers(filtered);


}

/* ==========================
USER COUNT
========================== */

function updateUserCount() {

document.getElementById("totalUsers")
    .textContent = users.length;


}

/* ==========================
LOADING
========================== */

function showLoading(show) {

const loading =
    document.getElementById("loading");

const table =
    document.querySelector(".table-container");


if (show) {

    loading.style.display = "flex";
    table.style.display = "none";

} else {

    loading.style.display = "none";
    table.style.display = "block";

}


}

/* ==========================
ERROR
========================== */

function showError(message) {

const element =
    document.getElementById("errorMessage");

element.textContent = message;

element.style.display = "block";


}

function hideError() {

document.getElementById("errorMessage")
    .style.display = "none";


}

/* ==========================
FORM ERROR
========================== */

function showFormError(message) {

const element =
    document.getElementById("formError");

element.textContent = message;

element.style.display = "block";


}

function hideFormError() {

document.getElementById("formError")
    .style.display = "none";


}

/* ==========================
SECURITY
========================== */

function escapeHtml(value) {

const div =
    document.createElement("div");

div.textContent = value;

return div.innerHTML;


}

/* ==========================
CLOSE ON OUTSIDE CLICK
========================== */

document
.getElementById("userModal")
.addEventListener("click", function(event) {

    if (event.target === this) {
        closeModal();
    }

});


document
.getElementById("deleteModal")
.addEventListener("click", function(event) {

    if (event.target === this) {
        closeDeleteModal();
    }

});


/* ==========================
ESC KEY
========================== */

document.addEventListener(
"keydown",
function(event) {

    if (event.key === "Escape") {

        closeModal();
        closeDeleteModal();

    }

}


);

/* ==========================
START
========================== */

document.addEventListener(
"DOMContentLoaded",
loadUsers
);