// Funkcja do ładowania aplikacji z opcjonalnym filtrem statusu
function loadApplications(statusFilter = "") {
    let query = db.collection("applications").orderBy("data", "desc");
    if (statusFilter) {
        query = query.where("status", "==", statusFilter);
    }
    query.get().then((querySnapshot) => {
        const tbody = document.querySelector('.applications-table tbody');
        tbody.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const app = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${app.stanowisko}</td>
                <td>${app.firma}</td>
                <td>${app.data}</td>
                <td>${app.status}</td>
                <td>
                    <button class="edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Edytuj</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Obsługa kliknięcia "Edytuj"
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const appId = this.getAttribute('data-id');
                db.collection("applications").doc(appId).get().then(doc => {
                    const app = doc.data();
                    document.getElementById('editAppId').value = appId;
                    document.getElementById('editStanowisko').value = app.stanowisko;
                    document.getElementById('editFirma').value = app.firma;
                    document.getElementById('editData').value = app.data;
                    document.getElementById('editStatus').value = app.status;
                    document.getElementById('editModal').classList.add('active');
                });
            });
        });
    });
}

// Zamknij modal edycji
document.getElementById('closeEditModal').onclick = function () {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editFormMessage').textContent = '';
};

// Obsługa zapisu edycji aplikacji
document.getElementById('editApplicationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const appId = document.getElementById('editAppId').value;
    const stanowisko = document.getElementById('editStanowisko').value;
    const firma = document.getElementById('editFirma').value;
    const data = document.getElementById('editData').value;
    const status = document.getElementById('editStatus').value;

    db.collection("applications").doc(appId).update({
        stanowisko,
        firma,
        data,
        status
    }).then(() => {
        document.getElementById('editFormMessage').textContent = "Zapisano zmiany!";
        loadApplications(document.getElementById('statusFilter').value);
        setTimeout(() => {
            document.getElementById('editModal').classList.remove('active');
            document.getElementById('editFormMessage').textContent = '';
        }, 1000);
    }).catch(() => {
        document.getElementById('editFormMessage').textContent = "Błąd podczas zapisu.";
        document.getElementById('editFormMessage').style.color = "red";
    });
});

document.getElementById('deleteAppBtn').onclick = function () {
    const appId = document.getElementById('editAppId').value;
    if (confirm("Czy na pewno chcesz usunąć tę aplikację?")) {
        db.collection("applications").doc(appId).delete().then(() => {
            document.getElementById('editModal').classList.remove('active');
            loadApplications(document.getElementById('statusFilter').value);
        });
    }
};

// Obsługa filtra statusu
document.getElementById('statusFilter').addEventListener('change', function () {
    loadApplications(this.value);
});

// Załaduj wszystkie aplikacje na start
loadApplications();

// (Opcjonalnie) Sprawdzanie zalogowania użytkownika
if (firebase.auth) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            document.querySelector('.hero-header').insertAdjacentHTML('beforeend', `<p style="margin-top:1em;">Witaj, ${user.displayName}!</p>`);
        }
    });
}