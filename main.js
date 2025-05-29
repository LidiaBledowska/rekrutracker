// Global function for status color mapping
function getStatusColors(status) {
    // Normalize the status string to handle any whitespace/encoding issues
    const normalizedStatus = (status || '').trim().toLowerCase();
    
    // Define color mappings with case-insensitive matching
    const colorMap = {
        'wysłano cv': 'bg-blue-100 text-blue-800',
        'rozmowa telefoniczna': 'bg-blue-100 text-blue-800',
        'rozmowa online': 'bg-blue-100 text-blue-800',
        'rozmowa stacjonarna': 'bg-blue-100 text-blue-800',
        'assessment center': 'bg-pink-100 text-pink-800',
        'oferta': 'bg-green-100 text-green-800',
        'odrzucono': 'bg-gray-100 text-gray-800'
    };
    
    // Direct match first
    if (colorMap[normalizedStatus]) {
        return colorMap[normalizedStatus];
    }
    
    // Fallback with partial matching
    if (normalizedStatus.includes('rozmowa')) {
        return 'bg-blue-100 text-blue-800';
    } else if (normalizedStatus.includes('assessment')) {
        return 'bg-pink-100 text-pink-800';
    } else if (normalizedStatus.includes('oferta')) {
        return 'bg-green-100 text-green-800';
    } else if (normalizedStatus.includes('odrzucono')) {
        return 'bg-gray-100 text-gray-800';
    }
    
    // Default fallback
    return 'bg-gray-100 text-gray-800';
}

function updateApplicationsCount(count) {
    const tableContainer = document.querySelector('#applicationsCard');
    const tableResponsive = tableContainer.querySelector('.table-responsive');
    let counter = document.getElementById('applicationsCount');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'applicationsCount';
        counter.style.cssText = `
            font-size: 1rem;
            color: #141414;
            font-weight: 600;
            background: white;
            border-radius: 0.5rem;
            padding: 0.3em 1em;
            border: 1px solid #e5e7eb;
            display: inline-block;
            margin-bottom: 1.2em;
        `;
    }
    // Zawsze wstawiaj licznik tuż nad tabelą
    if (tableResponsive && counter !== tableResponsive.previousSibling) {
        tableContainer.insertBefore(counter, tableResponsive);
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
            img.style.border = '1px solid #e5e7eb';
            preview.appendChild(img);
        });
    }
}

function loadFavorites() {
    const favoritesContent = document.getElementById('favoritesContent');
    if (!favoritesContent) return;

    db.collection("applications")
        .where("favorite", "==", true)
        .where("archiwalna", "==", false)
        .orderBy("data", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                favoritesContent.innerHTML = '<p class="text-gray-500">Brak ulubionych aplikacji.</p>';
                return;
            }

            let html = '<div class="grid gap-4">';
            querySnapshot.forEach((doc) => {
                const app = doc.data();
                let wynagrodzenieText = "";
                if (app.wynagrodzenie) {
                    wynagrodzenieText = `${app.wynagrodzenie} ${app.waluta || "PLN"}`;
                    if (app.wynRodzaj) {
                        wynagrodzenieText += ` ${app.wynRodzaj}`;
                    }
                }

                html += `
                    <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h3 class="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                    <i class="fas fa-star text-yellow-400"></i>
                                    ${app.stanowisko}
                                </h3>
                                <p class="text-gray-600">${app.firma}</p>
                                <p class="text-sm text-gray-500">Data: ${app.data}</p>
                                <div class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColors(app.status)} mb-1">
                                    ${app.status}
                                </div>
                                ${wynagrodzenieText ? `<p class="text-sm text-gray-500">Wynagrodzenie: ${wynagrodzenieText}</p>` : ''}
                            </div>
                            <button class="edit-btn-fav text-blue-600 hover:text-blue-800" data-id="${doc.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            favoritesContent.innerHTML = html;

            // Add event listeners for edit buttons in favorites
            document.querySelectorAll('.edit-btn-fav').forEach(btn => {
                btn.addEventListener('click', function () {
                    const appId = this.getAttribute('data-id');
                    openEditModal(appId);
                });
            });
        });
}

async function openEditModal(appId) {
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
    document.getElementById('editRodzaj').value = app.rodzaj || "PELNY_ETAT";
    document.getElementById('editUmowa').value = app.umowa || "UMOWA_O_PRACE";
    document.getElementById('editKontakt').value = app.kontakt || "";
    document.getElementById('editLink').value = app.link || "";
    document.getElementById('editNotatki').value = app.notatki || "";
    document.getElementById('editFavorite').checked = app.favorite || false;

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
}

function loadApplications(filters = {}, showArchived = false, sortOrder = 'desc') {
    let query = db.collection("applications");
    query.get().then((querySnapshot) => {
        const tbody = document.querySelector('.applications-table tbody');
        tbody.innerHTML = '';
        let count = 0;
        let applications = [];

        querySnapshot.forEach((doc) => {
            const app = doc.data();
            app.id = doc.id;
            applications.push(app);
        });

        // Sort applications based on sortOrder
        applications.sort((a, b) => {
            // First sort by favorites
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;

            // Then sort by date
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);

            if (sortOrder === 'asc') {
                return dateA - dateB; // oldest first
            } else {
                return dateB - dateA; // newest first
            }
        });

        applications.forEach((app) => {
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

            // Funkcje do konwersji wartości na czytelny tekst
            const getRodzajText = (rodzaj) => {
                switch(rodzaj) {
                    case 'PELNY_ETAT': return 'Pełny etat';
                    case 'NIEPELNY_ETAT': return 'Niepełny etat';
                    case 'STAZ': return 'Staż';
                    default: return rodzaj || '';
                }
            };

            const getUmowaText = (umowa) => {
                switch(umowa) {
                    case 'UMOWA_O_PRACE': return 'Umowa o pracę';
                    case 'UMOWA_B2B': return 'Umowa B2B';
                    case 'UMOWA_ZLECENIE': return 'Umowa zlecenie';
                    default: return umowa || '';
                }
            };

            const tr = document.createElement('tr');
            tr.className = 'border-t border-t-[#e5e7eb] bg-white hover:bg-gray-50';

            // Add archived class if application is archived
            if (app.archiwalna === true) {
                tr.classList.add('archived');
            }
            tr.innerHTML = `
    <td class="px-4 py-2 text-[#141414] text-sm font-normal leading-normal min-w-[150px]" data-label="Stanowisko">
        <div class="flex items-center gap-2">
            ${app.favorite ? '<i class="fas fa-star text-yellow-400" style="font-size: 0.8em;"></i>' : ''}
            <span>${app.stanowisko}</span>
        </div>
    </td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[120px]" data-label="Firma">${app.firma}</td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Data">${app.data}</td>
    <td class="px-4 py-2 text-sm font-normal leading-normal min-w-[120px]" data-label="Status">
        <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 ${getStatusColors(app.status)} text-sm font-medium leading-normal w-full border border-transparent">
            <span class="truncate">${app.status}${lastStatusDate}</span>
        </button>
    </td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[120px]" data-label="Wynagrodzenie">${wynagrodzenieCell}</td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Tryb">${app.tryb || ''}</td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Rodzaj">${getRodzajText(app.rodzaj)}</td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Umowa">${getUmowaText(app.umowa)}</td>
    <td class="px-4 py-2 text-center min-w-[100px]">
        <button class="edit-btn px-3 py-1 rounded bg-[#141414] text-white hover:bg-[#2d2d2d] transition-colors text-sm" data-id="${app.id}">
            <i class="fas fa-edit"></i> Edytuj
        </button>
    </td>
`;
            tbody.appendChild(tr);
        });

        updateApplicationsCount(count);

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const appId = this.getAttribute('data-id');
                openEditModal(appId);
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Login/Logout functionality
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            window.location.href = 'login.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (firebase.auth) {
                firebase.auth().signOut().then(() => {
                    window.location.reload();
                });
            }
        });
    }

    // Toggle filters functionality
    const toggleFiltersButton = document.getElementById('toggleFilters');
    const filtersContainer = document.getElementById('filtersContainer');

    if (toggleFiltersButton && filtersContainer) {
        toggleFiltersButton.addEventListener('click', function () {
            const isHidden = filtersContainer.style.display === 'none';
            filtersContainer.style.display = isHidden ? 'block' : 'none';
            toggleFiltersButton.innerHTML = isHidden ? '<i class="fas fa-filter"></i> Ukryj filtry' : '<i class="fas fa-filter"></i> Pokaż filtry';
        });
    }

    function getFilters() {
        return {
            stanowisko: document.getElementById('filterStanowisko')?.value || "",
            firma: document.getElementById('filterFirma')?.value || "",
            data: document.getElementById('filterData')?.value || "",
            status: document.getElementById('statusFilter')?.value || "",
            tryb: document.getElementById('filterTryb')?.value || "",
            rodzaj: document.getElementById('filterRodzaj')?.value || "",
            umowa: document.getElementById('filterUmowa')?.value || ""
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
        const rodzaj = document.getElementById('editRodzaj').value;
        const umowa = document.getElementById('editUmowa').value;
        const kontakt = document.getElementById('editKontakt').value;
        const link = document.getElementById('editLink').value;
        const notatki = document.getElementById('editNotatki').value;
        const favorite = document.getElementById('editFavorite').checked;

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

        const updateData = {
            stanowisko,
            firma,
            data,
            status,
            wynagrodzenie,
            waluta,
            wynRodzaj,
            tryb,
            rodzaj,
            umowa,
            kontakt,
            link,
            notatki,
            statusHistory,
            images,
            favorite
        };

        db.collection("applications").doc(appId).update(updateData).then(() => {
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
        'filterStanowisko', 'filterFirma', 'filterData', 'statusFilter', 'filterTryb', 'filterRodzaj', 'filterUmowa'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function () {
                const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
            });
        }
    });

    if (document.getElementById('showArchived')) {
        document.getElementById('showArchived').addEventListener('change', function () {
            const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
            loadApplications(getFilters(), this.checked, sortOrder);
        });
    }

    // Sort functionality
    if (document.getElementById('sortOrder')) {
        document.getElementById('sortOrder').addEventListener('change', function () {
            const showArchived = document.getElementById('showArchived')?.checked || false;
            loadApplications(getFilters(), showArchived, this.value);
        });
    }

    // Toggle sort button functionality
    const toggleSortButton = document.getElementById('toggleSort');
    const sortContainer = document.getElementById('sortContainer');

    if (toggleSortButton && sortContainer) {
        toggleSortButton.addEventListener('click', function () {
            const isHidden = sortContainer.style.display === 'none';
            sortContainer.style.display = isHidden ? 'block' : 'none';
            toggleSortButton.innerHTML = isHidden ? '<i class="fas fa-sort"></i> Ukryj sortowanie' : '<i class="fas fa-sort"></i> Sortuj';
        });
    }

    const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
    
    // Firebase auth state change handler
    if (firebase.auth) {
        firebase.auth().onAuthStateChanged(function (user) {
            const landingPage = document.getElementById('landingPage');
            const mainContent = document.getElementById('mainContent');
            const googleSigninButtonMain = document.getElementById('google-signin-button-main');
            const mainUserStatus = document.getElementById('main-user-status');
            
            if (user) {
                // User is logged in - show main application content
                if (landingPage) landingPage.style.display = 'none';
                if (mainContent) mainContent.style.display = 'block';
                
                if (userInfo) {
                    userInfo.textContent = `Witaj, ${user.displayName || user.email}!`;
                    userInfo.style.display = 'inline';
                }
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline';
                
                // Load applications for logged in user
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
            } else {
                // User is logged out - show landing page
                if (landingPage) landingPage.style.display = 'block';
                if (mainContent) mainContent.style.display = 'none';
                
                if (userInfo) userInfo.style.display = 'none';
                if (loginBtn) loginBtn.style.display = 'inline';
                if (logoutBtn) logoutBtn.style.display = 'none';
                
                // Reset landing page state - hide login form, show register button
                const loginForm = document.getElementById('loginForm');
                const registerButton = document.getElementById('registerButton');
                if (loginForm) loginForm.style.display = 'none';
                if (registerButton) registerButton.style.display = 'block';
                
                // Setup Google signin for landing page
                if (googleSigninButtonMain && !googleSigninButtonMain.onclick) {
                    googleSigninButtonMain.onclick = function() {
                        window.location.href = 'login.html';
                    };
                }
                
                if (mainUserStatus) {
                    mainUserStatus.textContent = '';
                }
            }
        });
    }
});

// Test function to debug status colors
window.testStatusColors = function() {
    console.log('Testing status colors:');
    const statuses = ['Wysłano CV', 'Rozmowa telefoniczna', 'Rozmowa online', 'Rozmowa stacjonarna', 'Assessment Center', 'Oferta', 'Odrzucono'];
    statuses.forEach(status => {
        const colors = getStatusColors(status);
        console.log(`Status: "${status}" -> Colors: "${colors}"`);
    });
};

// Test function to create sample table row with colors
window.testTableColors = function() {
    console.log('Creating test table with status colors...');
    const tbody = document.querySelector('.applications-table tbody');
    if (!tbody) {
        console.log('Table not found, creating test div instead');
        const testDiv = document.createElement('div');
        testDiv.id = 'colorTest';
        testDiv.innerHTML = '<h3>Test kolorów statusów:</h3>';
        document.body.appendChild(testDiv);
        
        const statuses = ['Wysłano CV', 'Rozmowa telefoniczna', 'Rozmowa online', 'Rozmowa stacjonarna', 'Assessment Center', 'Oferta', 'Odrzucono'];
        statuses.forEach(status => {
            const colors = getStatusColors(status);
            const button = document.createElement('button');
            button.className = `flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 ${colors} text-sm font-medium leading-normal w-full border border-transparent mb-2`;
            button.innerHTML = `<span class="truncate">${status}</span>`;
            testDiv.appendChild(button);
        });
        return;
    }
    
    tbody.innerHTML = '';
    const statuses = ['Wysłano CV', 'Rozmowa telefoniczna', 'Rozmowa online', 'Rozmowa stacjonarna', 'Assessment Center', 'Oferta', 'Odrzucono'];
    
    statuses.forEach((status, index) => {
        const colors = getStatusColors(status);
        const tr = document.createElement('tr');
        tr.className = 'border-t border-t-[#e5e7eb] bg-white hover:bg-gray-50';
        tr.innerHTML = `
            <td class="px-4 py-2 text-[#141414] text-sm font-normal leading-normal min-w-[150px]">Test ${index + 1}</td>
            <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[120px]">Test Firma</td>
            <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]">2024-01-01</td>
            <td class="px-4 py-2 text-sm font-normal leading-normal min-w-[120px]">
                <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 ${colors} text-sm font-medium leading-normal w-full border border-transparent">
                    <span class="truncate">${status}</span>
                </button>
            </td>
            <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[120px]">Test</td>
        `;
        tbody.appendChild(tr);
    });
    
    console.log('Test table created with all status colors');
};

// Debug function to analyze status values from database
window.analyzeStatuses = function() {
    if (!db) {
        console.log('Database not available');
        return;
    }
    
    db.collection("applications").get().then((querySnapshot) => {
        console.log('=== STATUS ANALYSIS ===');
        const statusCounts = {};
        
        querySnapshot.forEach((doc) => {
            const app = doc.data();
            const status = app.status;
            
            if (status) {
                // Count occurrences
                statusCounts[status] = (statusCounts[status] || 0) + 1;
                
                // Show detailed info for first occurrence
                if (statusCounts[status] === 1) {
                    console.log('Status found:', {
                        text: status,
                        length: status.length,
                        charCodes: Array.from(status).map(char => char.charCodeAt(0)),
                        colors: getStatusColors(status)
                    });
                }
            }
        });
        
        console.log('Status counts:', statusCounts);
        console.log('=== END ANALYSIS ===');
    }).catch(error => {
        console.error('Error analyzing statuses:', error);
    });
};

// Test function to check actual Firebase data and status processing
window.testRealDataStatuses = function() {
    if (!auth.currentUser) {
        console.log('Please log in first to test real data statuses');
        return;
    }
    
    const userApplicationsRef = collection(db, 'users', auth.currentUser.uid, 'applications');
    getDocs(userApplicationsRef).then((querySnapshot) => {
        console.log('=== REAL DATA STATUS ANALYSIS ===');
        console.log(`Total applications found: ${querySnapshot.size}`);
        
        const statusCounts = {};
        const statusSamples = {};
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const status = data.status;
            const normalizedStatus = (status || '').trim();
            
            // Count occurrences
            if (!statusCounts[normalizedStatus]) {
                statusCounts[normalizedStatus] = 0;
                statusSamples[normalizedStatus] = {
                    original: status,
                    normalized: normalizedStatus,
                    colors: getStatusColors(status),
                    company: data.firma || 'N/A'
                };
            }
            statusCounts[normalizedStatus]++;
        });
        
        console.log('\n=== STATUS BREAKDOWN ===');
        Object.keys(statusCounts).forEach(status => {
            const sample = statusSamples[status];
            console.log(`Status: "${status}"`);
            console.log(`  Count: ${statusCounts[status]}`);
            console.log(`  Original: "${sample.original}"`);
            console.log(`  Normalized: "${sample.normalized}"`);
            console.log(`  Colors: ${sample.colors}`);
            console.log(`  Sample company: ${sample.company}`);
            console.log('---');
        });
    }).catch((error) => {
        console.error('Error fetching applications:', error);
    });
};

// Quick visual test function to verify colors are working
window.quickColorTest = function() {
    const testStatuses = [
        'Wysłano CV',
        'Rozmowa telefoniczna', 
        'Rozmowa online',
        'Rozmowa stacjonarna',
        'Assessment Center',
        'Oferta',
        'Odrzucono'
    ];
    
    const testContainer = document.createElement('div');
    testContainer.id = 'colorTest';
    testContainer.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        border: 2px solid #333;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    testContainer.innerHTML = `
        <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">Status Color Test</h3>
        ${testStatuses.map(status => {
            const colors = getStatusColors(status);
            return `
                <div style="margin: 5px 0;">
                    <button class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${colors} mb-1">
                        ${status}
                    </button>
                </div>
            `;
        }).join('')}
        <button onclick="document.getElementById('colorTest').remove()" 
                style="margin-top: 10px; padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Close Test
        </button>
    `;
    
    // Remove existing test if present
    const existing = document.getElementById('colorTest');
    if (existing) existing.remove();
    
    document.body.appendChild(testContainer);
    
    console.log('Color test displayed! Check top-right corner of the page.');
};

console.log('Debug: main.js loaded, getStatusColors function available:', typeof getStatusColors);
console.log('=== DEBUG FUNCTIONS AVAILABLE ===');
console.log('🎯 IMMEDIATE TESTS (work without login):');
console.log('  window.testTailwindColors() - Tests if Tailwind classes work');
console.log('  window.quickColorTest() - Shows color test overlay');
console.log('🔧 TABLE TESTS (require logged in with data):');
console.log('  window.forceTestColors() - Forces colors on existing table rows');
console.log('  window.testRealDataStatuses() - Analyzes real Firebase data');
console.log('⚙️ ADVANCED DEBUGGING:');
console.log('  window.debugStatusProcessing() - Real-time color assignment logging');
console.log('==================================');

// Test if we can access getStatusColors immediately
console.log('✅ getStatusColors function test:');
console.log('  "Wysłano CV" →', getStatusColors('Wysłano CV'));
console.log('  "Oferta" →', getStatusColors('Oferta'));
console.log('  "Assessment Center" →', getStatusColors('Assessment Center'));

// Enhanced debugging function to capture and log status processing in real-time
window.debugStatusProcessing = function() {
    // Override the getStatusColors function temporarily to add logging
    const originalGetStatusColors = window.getStatusColors;
    
    window.getStatusColors = function(status) {
        const result = originalGetStatusColors(status);
        console.log(`STATUS DEBUG: Input: "${status}" | Normalized: "${(status || '').trim()}" | Colors: ${result}`);
        return result;
    };
    
    console.log('Status processing debugging enabled. Colors will be logged to console.');
    console.log('To disable, call: window.disableStatusDebugging()');
};

window.disableStatusDebugging = function() {
    // Restore original function
    window.getStatusColors = function getStatusColors(status) {
        const normalizedStatus = (status || '').trim();
        
        switch(normalizedStatus) {
            case 'Wysłano CV':
                return 'bg-blue-100 text-blue-800';
            case 'Rozmowa telefoniczna':
                return 'bg-blue-100 text-blue-800';
            case 'Rozmowa online':
                return 'bg-blue-100 text-blue-800';
            case 'Rozmowa stacjonarna':
                return 'bg-blue-100 text-blue-800';
            case 'Assessment Center':
                return 'bg-pink-100 text-pink-800';
            case 'Oferta':
                return 'bg-green-100 text-green-800';
            case 'Odrzucono':
                return 'bg-gray-100 text-gray-800';
            default:
                if (normalizedStatus.includes('Rozmowa')) {
                    return 'bg-blue-100 text-blue-800';
                } else if (normalizedStatus.includes('Assessment')) {
                    return 'bg-pink-100 text-pink-800';
                } else if (normalizedStatus.includes('Oferta')) {
                    return 'bg-green-100 text-green-800';
                } else if (normalizedStatus.includes('Odrzucono')) {
                    return 'bg-gray-100 text-gray-800';
                }
                return 'bg-gray-100 text-gray-800';
        }
    };
    console.log('Status processing debugging disabled.');
};

// Direct table color testing - will modify existing table rows
window.forceTestColors = function() {
    console.log('🎨 Forcing color test on existing table...');
    
    // Find all status buttons in the table
    const statusButtons = document.querySelectorAll('td[data-label="Status"] button');
    console.log(`Found ${statusButtons.length} status buttons`);
    
    if (statusButtons.length === 0) {
        console.log('❌ No status buttons found. Make sure you are logged in and have applications loaded.');
        return;
    }
    
    // Apply test colors to existing buttons
    statusButtons.forEach((button, index) => {
        const statusText = button.textContent.trim();
        const originalText = statusText;
        
        // Remove existing color classes
        button.className = button.className.replace(/bg-\w+-\d+/g, '').replace(/text-\w+-\d+/g, '');
        
        // Apply new colors based on index for testing
        const testColors = [
            'bg-blue-100 text-blue-800',   // Blue
            'bg-pink-100 text-pink-800',   // Pink  
            'bg-green-100 text-green-800', // Green
            'bg-gray-100 text-gray-800',   // Gray
            'bg-purple-100 text-purple-800' // Purple
        ];
        
        const colorClass = testColors[index % testColors.length];
        button.className += ` ${colorClass}`;
        
        console.log(`Button ${index + 1}: "${originalText}" -> ${colorClass}`);
    });
    
    console.log('✅ Test colors applied! You should see different colored status buttons now.');
};

// Simple function to test if Tailwind classes work at all
window.testTailwindColors = function() {
    const testDiv = document.createElement('div');
    testDiv.innerHTML = `
        <div style="position: fixed; top: 50px; right: 10px; background: white; border: 2px solid black; padding: 15px; z-index: 9999; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">Tailwind Color Test</h3>
            <div class="bg-blue-100 text-blue-800" style="padding: 5px; margin: 2px; border-radius: 4px;">Blue Test</div>
            <div class="bg-pink-100 text-pink-800" style="padding: 5px; margin: 2px; border-radius: 4px;">Pink Test</div>
            <div class="bg-green-100 text-green-800" style="padding: 5px; margin: 2px; border-radius: 4px;">Green Test</div>
            <div class="bg-gray-100 text-gray-800" style="padding: 5px; margin: 2px; border-radius: 4px;">Gray Test</div>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: red; color: white; border: none; border-radius: 4px;">Close</button>
        </div>
    `;
    document.body.appendChild(testDiv);
    console.log('🎨 Tailwind color test displayed in top-right corner');
};