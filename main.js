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
        'oferta': 'background-color: #dcfce7 !important; color: #166534 !important; border: 2px solid #22c55e !important;',
        'odrzucono': 'background-color: #fee2e2 !important; color: #dc2626 !important; border: 2px solid #ef4444 !important;'
    };
    
    // Direct match first
    if (colorMap[normalizedStatus]) {
        return colorMap[normalizedStatus];
    }
    
    // Fallback with partial matching
    if (normalizedStatus.includes('rozmowa')) {
        return 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;';
    } else if (normalizedStatus.includes('oferta')) {
        return 'background-color: #dcfce7 !important; color: #166534 !important; border: 2px solid #22c55e !important;';
    } else if (normalizedStatus.includes('odrzucono')) {
        return 'background-color: #fee2e2 !important; color: #dc2626 !important; border: 2px solid #ef4444 !important;';
    }
    
    // Default fallback
    return 'background-color: #f3f4f6 !important; color: #374151 !important; border: 2px solid #6b7280 !important;';
}



function showImagesPreview(images) {
    console.log('showImagesPreview called with:', images);
    const preview = document.getElementById('editImagesPreview');
    
    if (!preview) {
        console.error('editImagesPreview element not found!');
        return;
    }
    
    preview.innerHTML = '';
    
    if (!images || !Array.isArray(images) || images.length === 0) {
        console.log('No images to display');
        preview.innerHTML = '<p style="color: #6b7280; font-size: 0.8em; margin: 0.5em 0;">Brak zdjęć</p>';
        return;
    }
    
    console.log(`Displaying ${images.length} images`);
    
    images.forEach((imageItem, index) => {
        console.log(`Processing image ${index + 1}:`, imageItem);
        
        const img = document.createElement('img');
        let imageUrl = '';
        let imageName = `Zdjęcie ${index + 1}`;
        
        // Handle both old Firebase Storage URLs and new Base64 objects
        if (typeof imageItem === 'string') {
            // Old format: direct URL string
            imageUrl = imageItem;
            img.src = imageItem;
        } else if (imageItem && imageItem.data) {
            // New format: Base64 object with data property
            imageUrl = imageItem.data;
            img.src = imageItem.data;
            if (imageItem.name) {
                imageName = imageItem.name;
            }
        } else {
            console.warn('Invalid image format:', imageItem);
            return;
        }
        
        img.style.maxWidth = '80px';
        img.style.maxHeight = '80px';
        img.style.borderRadius = '6px';
        img.style.border = '1px solid #e5e7eb';
        img.style.marginRight = '0.5em';
        img.style.cursor = 'pointer';
        img.title = `${imageName} - kliknij aby powiększyć`;
        
        // Add error handling for broken images
        img.onerror = function() {
            console.error(`Failed to load image: ${imageUrl}`);
            this.style.border = '2px solid #dc2626';
            this.title = `Błąd ładowania: ${imageName}`;
            this.alt = 'Błąd ładowania';
        };
        
        img.onload = function() {
            console.log(`Successfully loaded image: ${imageUrl}`);
        };
        
        // Add click to preview larger image
        img.onclick = function() {
            // For Base64 data, create a new window with the image
            if (imageUrl.startsWith('data:')) {
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>${imageName}</title>
                            <style>
                                body { 
                                    margin: 0; 
                                    padding: 20px; 
                                    background: #000; 
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center; 
                                    min-height: 100vh;
                                }
                                img { 
                                    max-width: 100%; 
                                    max-height: 100vh; 
                                    object-fit: contain;
                                    box-shadow: 0 4px 20px rgba(255,255,255,0.1);
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${imageUrl}" alt="${imageName}" />
                        </body>
                        </html>
                    `);
                    newWindow.document.close();
                }
            } else {
                // For regular URLs, use the traditional method
                window.open(imageUrl, '_blank');
            }
        };
        
        preview.appendChild(img);
    });
}

function loadFavorites() {
    const favoritesContent = document.getElementById('favoritesContent');
    if (!favoritesContent) return;

    const user = window.auth.currentUser;
    if (!user) {
        favoritesContent.innerHTML = '<p class="text-gray-500">Musisz się zalogować, aby zobaczyć ulubione.</p>';
        return;
    }

    const q = window.firebaseModules.query(
        window.firebaseModules.collection(db, "applications"),
        window.firebaseModules.where("userId", "==", user.uid),
        window.firebaseModules.where("favorite", "==", true),
        window.firebaseModules.where("archiwalna", "==", false),
        window.firebaseModules.orderBy("data", "desc")
    );
    
    window.firebaseModules.getDocs(q).then((querySnapshot) => {
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
    const user = window.auth.currentUser;
    if (!user) {
        alert("Musisz być zalogowany!");
        return;
    }
    
    const docRef = window.firebaseModules.doc(db, "applications", appId);
    const docSnap = await window.firebaseModules.getDoc(docRef);
    if (!docSnap.exists()) {
        alert("Aplikacja nie istnieje!");
        return;
    }
    
    const app = docSnap.data();
    
    // SECURITY CHECK: Verify user owns this application
    if (app.userId !== user.uid) {
        alert("Nie masz uprawnień do edycji tej aplikacji!");
        return;
    }
    
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

    // Debug: Log application data
    console.log('Application data:', app);
    console.log('Application images:', app.images);

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
    const user = window.auth.currentUser;
    if (!user) {
        console.log("No user logged in, cannot load applications");
        return;
    }
    
    let q = window.firebaseModules.query(
        window.firebaseModules.collection(db, "applications"),
        window.firebaseModules.where("userId", "==", user.uid)
    );
    
    window.firebaseModules.getDocs(q).then((querySnapshot) => {
        const tbody = document.querySelector('.applications-table tbody');
        tbody.innerHTML = '';
        let count = 0;
        let applications = [];

        querySnapshot.forEach((doc) => {
            const app = doc.data();
            app.id = doc.id;
            applications.push(app);
        });

        // Update status counters before filtering
        updateStatusCounters(applications);

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
                    // Special handling for "Rozmowy" status filter
                    if (key === 'status' && filters[key] === 'Rozmowy') {
                        const interviewStatuses = ['Rozmowa telefoniczna', 'Rozmowa online', 'Rozmowa stacjonarna'];
                        if (!interviewStatuses.includes(app.status)) {
                            match = false;
                            break;
                        }
                    } else if (typeof app[key] === "string" && typeof filters[key] === "string") {
                        // For exact match fields like rodzaj, umowa, tryb - use strict equality
                        const exactMatchFields = ['rodzaj', 'umowa', 'tryb'];
                        if (exactMatchFields.includes(key)) {
                            if (app[key] !== filters[key]) {
                                match = false;
                                break;
                            }
                        } else {
                            // For text fields like stanowisko, firma - use includes
                            if (!app[key]?.toLowerCase().includes(filters[key].toLowerCase())) {
                                match = false;
                                break;
                            }
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
            // Add image indicator 
            const imageIndicator = (app.images && app.images.length > 0) 
                ? `<i class="fas fa-camera text-blue-500" style="font-size: 0.7em; margin-left: 4px;" title="${app.images.length} zdjęć"></i>` 
                : '';

            tr.innerHTML = `
    <td class="px-4 py-2 text-[#141414] text-sm font-normal leading-normal min-w-[150px]" data-label="Stanowisko">
        <div class="flex items-center gap-2">
            ${app.favorite ? '<i class="fas fa-star text-yellow-400" style="font-size: 0.8em;"></i>' : ''}
            <span>${app.stanowisko}</span>
            ${imageIndicator}
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

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const appId = this.getAttribute('data-id');
                openEditModal(appId);
            });
        });
        
        // Auto-fix colors after table is rendered
        autoFixColors();
        
        // Enhance table row visuals
        setTimeout(() => {
            enhanceTableRowVisuals();
        }, 100);
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

// Enhanced visual status indicators for table rows
function enhanceTableRowVisuals() {
    const rows = document.querySelectorAll('.applications-table tbody tr');
    
    rows.forEach(row => {
        const statusButton = row.querySelector('td[data-label="Status"] button');
        if (!statusButton) return;
        
        const statusText = statusButton.textContent.trim().split('(')[0].trim(); // Remove date part
        
        // Add days since application indicator for stale applications
        const dateCell = row.querySelector('td[data-label="Data"]');
        if (dateCell) {
            const dateText = dateCell.textContent.trim();
            const applicationDate = new Date(dateText);
            const now = new Date();
            const daysDiff = Math.floor((now - applicationDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 14 && statusText === 'Wysłano CV') {
                // Add indicator for applications older than 2 weeks without response
                const staleIndicator = document.createElement('div');
                staleIndicator.innerHTML = `<span style="color: #dc2626; font-size: 0.75rem; font-weight: 600;">(${daysDiff} dni)</span>`;
                staleIndicator.title = 'Długo bez odpowiedzi';
                dateCell.appendChild(staleIndicator);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Wait for Firebase to be ready
    function waitForFirebase(callback) {
        if (window.firebaseModules && window.auth) {
            callback();
        } else {
            setTimeout(() => waitForFirebase(callback), 100);
        }
    }

    waitForFirebase(function() {
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
                if (window.firebaseModules && window.firebaseModules.signOut && window.auth) {
                    window.firebaseModules.signOut(window.auth).then(() => {
                        window.location.reload();
                    }).catch((error) => {
                        console.error('Logout error:', error);
                        // Still reload the page to clear the session
                        window.location.reload();
                    });
                } else {
                    // Fallback: just reload the page to clear any cached state
                    window.location.reload();
                }
            });
        }
    });

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
            tryb: document.getElementById('filterTryb')?.value || "",
            rodzaj: document.getElementById('filterRodzaj')?.value || "",
            umowa: document.getElementById('filterUmowa')?.value || ""
        };
    }

    document.getElementById('closeEditModal').onclick = function () {
        document.getElementById('editModal').classList.remove('active');
        document.getElementById('editFormMessage').textContent = '';
    };

    // Base64 image conversion utility
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Obsługa uploadu zdjęć - Base64 version
    let uploadedImages = [];
    document.getElementById('editImages').addEventListener('change', async function (e) {
        debugImageUpload('Upload started', { fileCount: e.target.files.length });
        
        const files = Array.from(e.target.files);
        if (!files.length) {
            debugImageUpload('No files selected');
            return;
        }
        
        const user = window.auth.currentUser;
        if (!user) {
            debugImageUpload('ERROR: User not logged in');
            alert("Musisz być zalogowany!");
            return;
        }
        
        const appId = document.getElementById('editAppId').value;
        debugImageUpload('Upload attempt', { userId: user.uid, appId: appId, fileCount: files.length });
        
        try {
            // SECURITY CHECK: Verify user owns this application before uploading
            const docRef = window.firebaseModules.doc(db, "applications", appId);
            const docSnap = await window.firebaseModules.getDoc(docRef);
            if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
                debugImageUpload('ERROR: User does not own application');
                alert("Nie masz uprawnień do dodawania zdjęć do tej aplikacji!");
                return;
            }
            
            document.getElementById('editFormMessage').textContent = "Trwa konwersja zdjęć...";
            document.getElementById('editFormMessage').style.color = "blue";
            
            uploadedImages = [];
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        console.warn(`Skipping non-image file: ${file.name}`);
                        errorCount++;
                        continue;
                    }
                    
                    // Check file size (max 1MB for Base64)
                    if (file.size > 1024 * 1024) {
                        console.warn(`File too large: ${file.name}`);
                        alert(`Plik ${file.name} jest za duży (maksymalnie 1MB dla Base64).`);
                        errorCount++;
                        continue;
                    }
                    
                    debugImageUpload(`Converting file ${i + 1}/${files.length}`, { fileName: file.name, size: file.size });
                    document.getElementById('editFormMessage').textContent = `Konwersja zdjęcia ${i + 1}/${files.length}...`;
                    
                    const base64String = await convertFileToBase64(file);
                    const imageData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64String
                    };
                    
                    uploadedImages.push(imageData);
                    successCount++;
                    
                    debugImageUpload(`Successfully converted file ${i + 1}`, { name: file.name });
                    
                } catch (fileError) {
                    console.error(`Error converting file ${file.name}:`, fileError);
                    errorCount++;
                }
            }
            
            // Dodaj do już istniejących - dla Base64 używamy data URL do preview
            const prev = document.getElementById('editImagesPreview').querySelectorAll('img');
            const prevUrls = Array.from(prev).map(img => img.src);
            const newUrls = uploadedImages.map(img => img.data);
            const allUrls = prevUrls.concat(newUrls);
            showImagesPreview(allUrls);
            
            // Show results
            if (successCount > 0 && errorCount === 0) {
                document.getElementById('editFormMessage').textContent = `✅ Skonwertowano ${successCount} zdjęć (nie zapomnij zapisać zmian)!`;
                document.getElementById('editFormMessage').style.color = "green";
            } else if (successCount > 0 && errorCount > 0) {
                document.getElementById('editFormMessage').textContent = `⚠️ Skonwertowano ${successCount} zdjęć, ${errorCount} błędów (nie zapomnij zapisać zmian)!`;
                document.getElementById('editFormMessage').style.color = "orange";
            } else {
                document.getElementById('editFormMessage').textContent = `❌ Nie udało się skonwertować żadnego zdjęcia.`;
                document.getElementById('editFormMessage').style.color = "red";
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            document.getElementById('editFormMessage').textContent = `❌ Błąd podczas konwersji: ${error.message}`;
            document.getElementById('editFormMessage').style.color = "red";
        }
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
        
        const user = window.auth.currentUser;
        if (!user) {
            alert("Musisz być zalogowany!");
            return;
        }
        
        const appId = document.getElementById('editAppId').value;
        
        // SECURITY CHECK: Verify user owns this application before updating
        const docRef = window.firebaseModules.doc(db, "applications", appId);
        const docSnap = await window.firebaseModules.getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
            alert("Nie masz uprawnień do edycji tej aplikacji!");
            return;
        }
        
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

        // Pobierz wszystkie zdjęcia z podglądu - handle both URLs and Base64
        const imageElements = Array.from(document.getElementById('editImagesPreview').querySelectorAll('img'));
        const images = imageElements.map(img => {
            const src = img.src;
            // If it's a data URL (Base64), convert back to object format
            if (src.startsWith('data:')) {
                return {
                    name: img.alt || 'image.jpg',
                    type: src.split(';')[0].split(':')[1] || 'image/jpeg',
                    data: src
                };
            }
            // If it's a regular URL, keep as string for backward compatibility
            return src;
        });

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

        window.firebaseModules.updateDoc(window.firebaseModules.doc(db, "applications", appId), updateData).then(() => {
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
        document.getElementById('archiveAppBtn').onclick = async function () {
            const user = window.auth.currentUser;
            if (!user) {
                alert("Musisz być zalogowany!");
                return;
            }
            
            const appId = document.getElementById('editAppId').value;
            
            // SECURITY CHECK: Verify user owns this application before archiving
            const docRef = window.firebaseModules.doc(db, "applications", appId);
            const docSnap = await window.firebaseModules.getDoc(docRef);
            if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
                alert("Nie masz uprawnień do archiwizacji tej aplikacji!");
                return;
            }
            
            window.firebaseModules.updateDoc(docRef, {
                archiwalna: true
            }).then(() => {
                document.getElementById('editModal').classList.remove('active');
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked);
            });
        };
    }

    document.getElementById('deleteAppBtn').onclick = async function () {
        const user = window.auth.currentUser;
        if (!user) {
            alert("Musisz być zalogowany!");
            return;
        }
        
        const appId = document.getElementById('editAppId').value;
        
        // SECURITY CHECK: Verify user owns this application before deleting
        const docRef = window.firebaseModules.doc(db, "applications", appId);
        const docSnap = await window.firebaseModules.getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
            alert("Nie masz uprawnień do usunięcia tej aplikacji!");
            return;
        }
        
        if (confirm("Czy na pewno chcesz usunąć tę aplikację?")) {
            window.firebaseModules.deleteDoc(docRef).then(() => {
                document.getElementById('editModal').classList.remove('active');
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked);
            });
        }
    };

    [
        'filterStanowisko', 'filterFirma', 'filterData', 'filterTryb', 'filterRodzaj', 'filterUmowa'
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
    const isLikelyAuthenticated = localStorage.getItem('firebase:authUser:AIzaSyD7ZLyDHFBNsQe9j03YPi0xmdLbqdk_K68:[DEFAULT]') !== null;
    
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
    if (window.firebaseModules && window.firebaseModules.onAuthStateChanged && window.auth) {
        window.firebaseModules.onAuthStateChanged(window.auth, function (user) {
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
                const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
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

    // Debug function for image upload issues
    window.debugImageUpload = function(message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[IMG-DEBUG ${timestamp}] ${message}`;
        console.log(logMessage, data || '');
        
        // Also show in edit modal if available
        const editMessage = document.getElementById('editFormMessage');
        if (editMessage && message.includes('ERROR')) {
            editMessage.textContent = `🐛 ${message}`;
            editMessage.style.color = 'red';
        }
    };

    // Initial load
    loadApplications(getFilters(), document.getElementById('showArchived')?.checked, 'desc');
    
    // Inicjalizacja kolorowych kart filtrów
    initializeQuickFilters();
});

// Funkcja do aktualizacji liczników w kartach statusów
function updateStatusCounters(applications = []) {
    // Safely get elements and provide fallbacks
    const totalCountEl = document.getElementById('totalCount');
    const sentCountEl = document.getElementById('sentCount');
    const interviewCountEl = document.getElementById('interviewCount');
    const offerCountEl = document.getElementById('offerCount');
    const rejectedCountEl = document.getElementById('rejectedCount');

    if (!applications || applications.length === 0) {
        // Reset counters to 0
        if (totalCountEl) totalCountEl.textContent = '0';
        if (sentCountEl) sentCountEl.textContent = '0';
        if (interviewCountEl) interviewCountEl.textContent = '0';
        if (offerCountEl) offerCountEl.textContent = '0';
        if (rejectedCountEl) rejectedCountEl.textContent = '0';
        return;
    }

    // Filter out archived applications for counting
    const activeApplications = applications.filter(app => !app.archiwalna);
    
    // Count total applications
    const totalCount = activeApplications.length;
    
    // Count by status with exact matching logic (matches filtering logic)
    const sentCount = activeApplications.filter(app => 
        app.status && app.status.toLowerCase().includes('wysłano cv')
    ).length;
    
    const interviewCount = activeApplications.filter(app => {
        if (!app.status) return false;
        // Match the exact logic used in filtering
        const interviewStatuses = ['Rozmowa telefoniczna', 'Rozmowa online', 'Rozmowa stacjonarna'];
        return interviewStatuses.includes(app.status);
    }).length;
    
    const offerCount = activeApplications.filter(app => 
        app.status && app.status.toLowerCase().includes('oferta')
    ).length;
    
    const rejectedCount = activeApplications.filter(app => 
        app.status && app.status.toLowerCase().includes('odrzucono')
    ).length;
    
    // Update counters in HTML with error handling
    if (totalCountEl) totalCountEl.textContent = totalCount.toString();
    if (sentCountEl) sentCountEl.textContent = sentCount.toString();
    if (interviewCountEl) interviewCountEl.textContent = interviewCount.toString();
    if (offerCountEl) offerCountEl.textContent = offerCount.toString();
    if (rejectedCountEl) rejectedCountEl.textContent = rejectedCount.toString();
    
    console.log('Status counters updated:', {
        total: totalCount,
        sent: sentCount,
        interviews: interviewCount,
        offers: offerCount,
        rejected: rejectedCount
    });
}

// Funkcja do inicjalizacji kolorowych kart filtrów statusów
function initializeQuickFilters() {
    // Dodaj obsługę kliknięć do kart statusów
    document.querySelectorAll('.filter-card[data-filter-type="status"]').forEach(card => {
        card.addEventListener('click', function() {
            const filterValue = this.dataset.filterValue;
            
            // Usuń aktywny stan z innych kart statusów
            document.querySelectorAll('.filter-card[data-filter-type="status"]').forEach(otherCard => {
                otherCard.classList.remove('active');
            });
            
            // Dodaj aktywny stan do klikniętej karty
            this.classList.add('active');
            
            // Ustaw filtr statusu
            let filters = getFilters();
            
            // Set the status filter correctly
            if (filterValue === "") {
                // Clear status filter for "Wszystkie aplikacje"
                filters.status = "";
            } else {
                filters.status = filterValue;
            }
            
            // Zastosuj filtry
            const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
            const showArchived = document.getElementById('showArchived')?.checked || false;
            loadApplications(filters, showArchived, sortOrder);
            
            // Dodaj efekt wizualny
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Funkcja do resetowania kart statusów
    window.resetQuickFilters = function() {
        document.querySelectorAll('.filter-card[data-filter-type="status"]').forEach(card => {
            card.classList.remove('active');
        });
        
        // Aktywuj kartę "Wszystkie aplikacje"
        const allStatusCard = document.querySelector('.filter-card[data-filter-type="status"][data-filter-value=""]');
        if (allStatusCard) {
            allStatusCard.classList.add('active');
        }
    };
    
    // Funkcja do synchronizacji kart z filtrami z rozwiniętej sekcji
    window.syncQuickFiltersWithAdvanced = function() {
        const filters = getFilters();
        
        // Resetuj wszystkie karty statusów
        document.querySelectorAll('.filter-card[data-filter-type="status"]').forEach(card => {
            card.classList.remove('active');
        });
        
        // Synchronizuj karty statusu
        if (filters.status) {
            const statusCard = document.querySelector(`.filter-card[data-filter-type="status"][data-filter-value="${filters.status}"]`);
            if (statusCard) {
                statusCard.classList.add('active');
            }
        } else {
            // Aktywuj kartę "Wszystkie aplikacje"
            const allStatusCard = document.querySelector('.filter-card[data-filter-type="status"][data-filter-value=""]');
            if (allStatusCard) {
                allStatusCard.classList.add('active');
            }
        }
    };
    
    // Domyślnie aktywuj kartę "Wszystkie aplikacje"
    resetQuickFilters();
}

//# sourceMappingURL=app.js.map

