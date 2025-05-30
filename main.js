// Global function for status color mapping - INLINE STYLES VERSION
function getStatusColors(status) {
    // Normalize the status string to handle any whitespace/encoding issues
    const normalizedStatus = (status || '').trim().toLowerCase();
    
    // Return inline style strings with !important to override Tailwind CSS
    const colorMap = {
        'wysłano cv': 'background-color: #dbeafe !important; color: #1e40af !important; border: 2px solid #3b82f6 !important;',
        'rozmowa telefoniczna': 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;',
        'rozmowa online': 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;',
        'rozmowa stacjonarna': 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;',
        'assessment center': 'background-color: #fce7f3 !important; color: #be185d !important; border: 2px solid #ec4899 !important;',
        'oferta': 'background-color: #dcfce7 !important; color: #166534 !important; border: 2px solid #22c55e !important;',
        'odrzucono': 'background-color: #f3f4f6 !important; color: #374151 !important; border: 2px solid #6b7280 !important;'
    };
    
    // Direct match first
    if (colorMap[normalizedStatus]) {
        return colorMap[normalizedStatus];
    }
    
    // Fallback with partial matching
    if (normalizedStatus.includes('rozmowa')) {
        return 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;';
    } else if (normalizedStatus.includes('assessment')) {
        return 'background-color: #fce7f3 !important; color: #be185d !important; border: 2px solid #ec4899 !important;';
    } else if (normalizedStatus.includes('oferta')) {
        return 'background-color: #dcfce7 !important; color: #166534 !important; border: 2px solid #22c55e !important;';
    } else if (normalizedStatus.includes('odrzucono')) {
        return 'background-color: #f3f4f6 !important; color: #374151 !important; border: 2px solid #6b7280 !important;';
    }
    
    // Default fallback
    return 'background-color: #f3f4f6 !important; color: #374151 !important; border: 2px solid #6b7280 !important;';
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
                                <div class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium mb-1" style="${getStatusColors(app.status)}">
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
                switch (rodzaj) {
                    case 'PELNY_ETAT': return 'Pełny etat';
                    case 'NIEPELNY_ETAT': return 'Niepełny etat';
                    case 'STAZ': return 'Staż';
                    default: return rodzaj || '';
                }
            };

            const getUmowaText = (umowa) => {
                switch (umowa) {
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
        <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 text-sm font-medium leading-normal w-full" style="${getStatusColors(app.status)}">
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
        
        // Auto-fix colors after table is rendered
        autoFixColors();
    });
}

function autoFixColors() {
    // Simple fix that runs after table is loaded to ensure colors are applied
    setTimeout(() => {
        const buttons = document.querySelectorAll('td[data-label="Status"] button');
        buttons.forEach(button => {
            const statusText = button.textContent.trim().replace(/\s*\([^)]*\)\s*$/, '');
            const styles = getStatusColors(statusText);
            if (!button.getAttribute('style') || !button.getAttribute('style').includes('!important')) {
                button.setAttribute('style', styles);
            }
        });
    }, 500);
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

    // Walidacja pól Stanowisko i Firma w formularzu edycji - tylko litery
    function validateLettersOnly(input) {
        const regex = /[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/g;
        input.value = input.value.replace(regex, '');
    }

    const editStanowiskoField = document.getElementById('editStanowisko');
    const editFirmaField = document.getElementById('editFirma');
    
    if (editStanowiskoField) {
        editStanowiskoField.addEventListener('input', function() {
            validateLettersOnly(this);
        });
    }
    
    if (editFirmaField) {
        editFirmaField.addEventListener('input', function() {
            validateLettersOnly(this);
        });
    }

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

    // Initialize page state immediately and prevent page flashing
    const landingPage = document.getElementById('landingPage');
    const mainContent = document.getElementById('mainContent');
    const mainMenuLink = document.getElementById('mainMenuLink');
    
    // Check if we're in the authenticated state by checking localStorage persistence
    const isLikelyAuthenticated = localStorage.getItem('firebase:authUser:AIzaSyDYDz8W1Br_8ljRSfKAr4wXJ1sZQ3cKyFI:[DEFAULT]') !== null;
    
    if (isLikelyAuthenticated) {
        // User likely authenticated, show main content immediately
        if (landingPage) landingPage.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.opacity = '1';
        }
        // Show main menu link for likely authenticated users
        if (mainMenuLink) {
            mainMenuLink.style.display = 'inline';
        }
    } else {
        // User likely not authenticated, show landing page
        if (landingPage) {
            landingPage.style.display = 'block';
            landingPage.style.opacity = '1';
        }
        if (mainContent) mainContent.style.display = 'none';
        // Hide main menu link for unauthenticated users
        if (mainMenuLink) {
            mainMenuLink.style.display = 'none';
        }
    }

    // Firebase auth state change handler
    if (firebase.auth) {
        firebase.auth().onAuthStateChanged(function (user) {
            const landingPage = document.getElementById('landingPage');
            const mainContent = document.getElementById('mainContent');
            const googleSigninButtonMain = document.getElementById('google-signin-button-main');
            const mainUserStatus = document.getElementById('main-user-status');
            const mainMenuLink = document.getElementById('mainMenuLink');

            // Add smooth transition class if not already present
            if (landingPage && !landingPage.style.transition) {
                landingPage.style.transition = 'opacity 0.3s ease-in-out';
            }
            if (mainContent && !mainContent.style.transition) {
                mainContent.style.transition = 'opacity 0.3s ease-in-out';
            }

            if (user) {
                // User is logged in - ensure main content is visible immediately
                if (landingPage) {
                    landingPage.style.display = 'none';
                    landingPage.style.opacity = '0';
                }
                if (mainContent) {
                    mainContent.style.display = 'block';
                    mainContent.style.opacity = '1';
                }

                // Show main menu link for authenticated users
                if (mainMenuLink) {
                    mainMenuLink.style.display = 'inline';
                }

                if (userInfo) {
                    userInfo.textContent = `Witaj, ${user.displayName || user.email}!`;
                    userInfo.style.display = 'inline';
                }
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline';

                // Load applications for logged in user
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
            } else {
                // User is logged out - hide main menu link
                if (mainMenuLink) {
                    mainMenuLink.style.display = 'none';
                }

                // User is logged out - show landing page with smooth transition
                if (mainContent && mainContent.style.display === 'block') {
                    mainContent.style.opacity = '0';
                    setTimeout(() => {
                        mainContent.style.display = 'none';
                        if (landingPage) {
                            landingPage.style.display = 'block';
                            landingPage.style.opacity = '0';
                            setTimeout(() => {
                                landingPage.style.opacity = '1';
                            }, 10);
                        }
                    }, 300);
                } else {
                    // Direct switch to landing page if main content wasn't visible
                    if (landingPage) {
                        landingPage.style.display = 'block';
                        landingPage.style.opacity = '1';
                    }
                    if (mainContent) {
                        mainContent.style.display = 'none';
                    }
                }

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
                    googleSigninButtonMain.onclick = function () {
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

