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

            // Pobierz ostatnią zmianę statusu z historii
            let lastStatusDate = "";
            if (app.statusHistory && app.statusHistory.length > 0) {
                const last = app.statusHistory[app.statusHistory.length - 1];
                lastStatusDate = last.date ? ` (${last.date})` : "";
            }

            // Dodaj walutę i brutto/netto do wynagrodzenia na liście
            let wynagrodzenieCell = "";
            if (app.wynagrodzenie) {
                wynagrodzenieCell = app.wynagrodzenie + " " + (app.waluta || "PLN");
                if (app.wynRodzaj) {
                    wynagrodzenieCell += " " + app.wynRodzaj;
                }
            }

            const tr = document.createElement('tr');
            if (app.status === "Odrzucono") {
                tr.classList.add('status-rejected');
            }
            if (app.status === "Oferta") {
                tr.classList.add('status-oferta');
            }
            tr.innerHTML = `
                <td>${app.stanowisko}</td>
                <td>${app.firma}</td>
                <td>${app.data}</td>
                <td>${app.status}${lastStatusDate}</td>
                <td>${wynagrodzenieCell}</td>
                <td>
                    <button class="edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Edytuj</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Obsługa kliknięcia "Edytuj"
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const appId = this.getAttribute('data-id');
                const doc = await db.collection("applications").doc(appId).get();
                const app = doc.data();
                document.getElementById('editAppId').value = appId;
                document.getElementById('editStanowisko').value = app.stanowisko;
                document.getElementById('editFirma').value = app.firma;
                document.getElementById('editData').value = app.data;
                document.getElementById('editStatus').value = app.status || "";
                document.getElementById('editWynagrodzenie').value = app.wynagrodzenie || "";
                document.getElementById('editWaluta').value = app.waluta || "PLN";
                document.getElementById('editWynRodzaj').value = app.wynRodzaj || "BRUTTO";
                document.getElementById('editKontakt').value = app.kontakt || "";
                document.getElementById('editLink').value = app.link || "";
                document.getElementById('editNotatki').value = app.notatki || "";
                // Wyświetlanie historii statusu
                const historyBox = document.getElementById('statusHistoryBox');
                const historyList = document.getElementById('statusHistoryList');
                historyList.innerHTML = "";
                if (app.statusHistory && app.statusHistory.length > 0) {
                    app.statusHistory.forEach(h => {
                        const li = document.createElement('li');
                        li.textContent = `${h.status} (${h.date})`;
                        historyList.appendChild(li);
                    });
                    historyBox.style.display = "block";
                } else {
                    historyBox.style.display = "none";
                }
                // Zapamiętaj poprzedni status do późniejszego porównania
                document.getElementById('editApplicationForm').dataset.prevStatus = app.status || "";
                document.getElementById('editApplicationForm').dataset.statusHistory = JSON.stringify(app.statusHistory || []);
                document.getElementById('editModal').classList.add('active');
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Zamknij modal edycji (przycisk X)
    document.getElementById('closeEditModal').onclick = function () {
        document.getElementById('editModal').classList.remove('active');
        document.getElementById('editFormMessage').textContent = '';
    };

    // Obsługa zapisu edycji aplikacji z historią statusu i notatkami
    document.getElementById('editApplicationForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const appId = document.getElementById('editAppId').value;
        const stanowisko = document.getElementById('editStanowisko').value;
        const firma = document.getElementById('editFirma').value;
        const data = document.getElementById('editData').value;
        const status = document.getElementById('editStatus').value;
        const wynagrodzenie = document.getElementById('editWynagrodzenie').value;
        const waluta = document.getElementById('editWaluta').value;
        const wynRodzaj = document.getElementById('editWynRodzaj').value;
        const kontakt = document.getElementById('editKontakt').value;
        const link = document.getElementById('editLink').value;
        const notatki = document.getElementById('editNotatki').value;

        // Historia statusu
        let statusHistory = [];
        try {
            statusHistory = JSON.parse(this.dataset.statusHistory || "[]");
        } catch {
            statusHistory = [];
        }
        const prevStatus = this.dataset.prevStatus || "";
        if (status !== prevStatus) {
            const today = new Date().toISOString().slice(0, 10);
            statusHistory.push({ status, date: today });
        }

        db.collection("applications").doc(appId).update({
            stanowisko,
            firma,
            data,
            status,
            wynagrodzenie,
            waluta,
            wynRodzaj,
            kontakt,
            link,
            notatki,
            statusHistory
        }).then(() => {
            document.getElementById('editFormMessage').textContent = "Zapisano zmiany!";
            // Odśwież dane po zapisie, aby wynagrodzenie było aktualne
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

    // Obsługa usuwania aplikacji z poziomu modala edycji
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
});