function updateApplicationsCount(count) {
    let counter = document.getElementById('applicationsCount');
    if (!counter) {
        const h2 = document.querySelector('h2');
        const flexDiv = document.createElement('div');
        flexDiv.style.cssText = 'display:flex;justify-content:flex-end;align-items:center;margin-bottom:0.5em;';
        counter = document.createElement('span');
        counter.id = 'applicationsCount';
        counter.style.cssText = 'font-size:0.98em;color:#3182ce;font-weight:600;background:#f8fafc;border-radius:6px;padding:0.2em 0.8em;border:1px solid #e2e8f0;';
        flexDiv.appendChild(counter);
        h2.insertAdjacentElement('afterend', flexDiv);
    }
    counter.textContent = `Liczba aplikacji: ${count}`;
}

function showImagesPreview(urls) {
    const preview = document.getElementById('editImagesPreview');
    preview.innerHTML = '';
    if (urls && urls.length) {
        urls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '80px';
            img.style.maxHeight = '80px';
            img.style.borderRadius = '6px';
            img.style.border = '1px solid #e2e8f0';
            preview.appendChild(img);
        });
    }
}

function loadApplications(filters = {}, showArchived = false) {
    let query = db.collection("applications").orderBy("data", "desc");
    query.get().then((querySnapshot) => {
        const tbody = document.querySelector('.applications-table tbody');
        tbody.innerHTML = '';
        let count = 0;
        querySnapshot.forEach((doc) => {
            const app = doc.data();

            if (!showArchived && app.archiwalna === true) return;

            let match = true;
            for (const key in filters) {
                if (filters[key]) {
                    if (typeof app[key] === "string" && typeof filters[key] === "string") {
                        if (!app[key]?.toLowerCase().includes(filters[key].toLowerCase())) {
                            match = false;
                            break;
                        }
                    } else if (filters[key] && app[key] != filters[key]) {
                        match = false;
                        break;
                    }
                }
            }
            if (!match) return;

            count++;

            let lastStatusDate = "";
            if (app.statusHistory && app.statusHistory.length > 0) {
                const last = app.statusHistory[app.statusHistory.length - 1];
                lastStatusDate = last.date ? ` (${last.date})` : "";
            }

            let wynagrodzenieCell = "";
            if (app.wynagrodzenie) {
                wynagrodzenieCell = app.wynagrodzenie + " " + (app.waluta || "PLN");
                if (app.wynRodzaj) {
                    wynagrodzenieCell += " " + app.wynRodzaj;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Stanowisko">${app.stanowisko}</td>
                <td data-label="Firma">${app.firma}</td>
                <td data-label="Data aplikowania">${app.data}</td>
                <td data-label="Status">${app.status}${lastStatusDate}</td>
                <td data-label="Wynagrodzenie">${wynagrodzenieCell}</td>
                <td data-label="Tryb">${app.tryb || ''}</td>
                <td data-label="Akcje" class="actions-cell">
                    <button class="edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Edytuj</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        updateApplicationsCount(count);

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const appId = this.getAttribute('data-id');
                const docSnap = await db.collection("applications").doc(appId).get();
                const app = docSnap.data();
                document.getElementById('editAppId').value = appId;
                document.getElementById('editStanowisko').value = app.stanowisko;
                document.getElementById('editFirma').value = app.firma;
                document.getElementById('editData').value = app.data;
                document.getElementById('editStatus').value = app.status || "";
                document.getElementById('editWynagrodzenie').value = app.wynagrodzenie || "";
                document.getElementById('editWaluta').value = app.waluta || "PLN";
                document.getElementById('editWynRodzaj').value = app.wynRodzaj || "BRUTTO";
                document.getElementById('editTryb').value = app.tryb || "STACJONARNY";
                document.getElementById('editKontakt').value = app.kontakt || "";
                document.getElementById('editLink').value = app.link || "";
                document.getElementById('editNotatki').value = app.notatki || "";
                // Pokaz podgląd zdjęć
                showImagesPreview(app.images || []);
                document.getElementById('editImages').value = "";
                // Historia statusu
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
                document.getElementById('editApplicationForm').dataset.prevStatus = app.status || "";
                document.getElementById('editApplicationForm').dataset.statusHistory = JSON.stringify(app.statusHistory || []);
                document.getElementById('editModal').classList.add('active');
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    function getFilters() {
        return {
            stanowisko: document.getElementById('filterStanowisko')?.value || "",
            firma: document.getElementById('filterFirma')?.value || "",
            data: document.getElementById('filterData')?.value || "",
            status: document.getElementById('statusFilter')?.value || "",
            tryb: document.getElementById('filterTryb')?.value || ""
        };
    }

    document.getElementById('closeEditModal').onclick = function () {
        document.getElementById('editModal').classList.remove('active');
        document.getElementById('editFormMessage').textContent = '';
    };

    // Obsługa uploadu zdjęć
    let uploadedImages = [];
    document.getElementById('editImages').addEventListener('change', async function (e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        document.getElementById('editFormMessage').textContent = "Trwa przesyłanie zdjęć...";
        const appId = document.getElementById('editAppId').value;
        uploadedImages = [];
        for (const file of files) {
            const storageRef = firebase.storage().ref().child(`applications/${appId}/${file.name}`);
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();
            uploadedImages.push(url);
        }
        // Dodaj do już istniejących
        const prev = document.getElementById('editImagesPreview').querySelectorAll('img');
        const prevUrls = Array.from(prev).map(img => img.src);
        const allUrls = prevUrls.concat(uploadedImages);
        showImagesPreview(allUrls);
        document.getElementById('editFormMessage').textContent = "Zdjęcia dodane (nie zapomnij zapisać zmian)!";
    });

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
        const tryb = document.getElementById('editTryb').value;
        const kontakt = document.getElementById('editKontakt').value;
        const link = document.getElementById('editLink').value;
        const notatki = document.getElementById('editNotatki').value;

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

        // Pobierz wszystkie zdjęcia z podglądu
        const images = Array.from(document.getElementById('editImagesPreview').querySelectorAll('img')).map(img => img.src);

        db.collection("applications").doc(appId).update({
            stanowisko,
            firma,
            data,
            status,
            wynagrodzenie,
            waluta,
            wynRodzaj,
            tryb,
            kontakt,
            link,
            notatki,
            statusHistory,
            images
        }).then(() => {
            document.getElementById('editFormMessage').textContent = "Zapisano zmiany!";
            loadApplications(getFilters(), document.getElementById('showArchived')?.checked);
            setTimeout(() => {
                document.getElementById('editModal').classList.remove('active');
                document.getElementById('editFormMessage').textContent = '';
            }, 1000);
        }).catch(() => {
            document.getElementById('editFormMessage').textContent = "Błąd podczas zapisu.";
            document.getElementById('editFormMessage').style.color = "red";
        });
    });

    if (document.getElementById('archiveAppBtn')) {
        document.getElementById('archiveAppBtn').onclick = function () {
            const appId = document.getElementById('editAppId').value;
            db.collection("applications").doc(appId).update({
                archiwalna: true
            }).then(() => {
                document.getElementById('editModal').classList.remove('active');
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked);
            });
        };
    }

    document.getElementById('deleteAppBtn').onclick = function () {
        const appId = document.getElementById('editAppId').value;
        if (confirm("Czy na pewno chcesz usunąć tę aplikację?")) {
            db.collection("applications").doc(appId).delete().then(() => {
                document.getElementById('editModal').classList.remove('active');
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked);
            });
        }
    };

    [
        'filterStanowisko', 'filterFirma', 'filterData', 'statusFilter', 'filterTryb'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function () {
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked);
            });
        }
    });

    if (document.getElementById('showArchived')) {
        document.getElementById('showArchived').addEventListener('change', function () {
            loadApplications(getFilters(), this.checked);
        });
    }

    loadApplications(getFilters(), document.getElementById('showArchived')?.checked);

    if (firebase.auth) {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                document.querySelector('.hero-header').insertAdjacentHTML('beforeend', `<p style="margin-top:1em;">Witaj, ${user.displayName}!</p>`);
            }
        });
    }

    const toggleFiltersButton = document.getElementById('toggleFilters');
    const filtersContainer = document.querySelector('.filters-container');

    if (toggleFiltersButton && filtersContainer) {
        toggleFiltersButton.addEventListener('click', function () {
            const isHidden = filtersContainer.style.display === 'none';
            filtersContainer.style.display = isHidden ? 'grid' : 'none';
            toggleFiltersButton.innerHTML = isHidden ? '<i class="fas fa-filter"></i> Pokaż filtry' : '<i class="fas fa-filter"></i> Ukryj filtry';
        });
    }
});
