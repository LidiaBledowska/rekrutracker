        import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
        import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
        import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyD7ZLyDHFBNsQe9j03YPi0xmdLbqdk_K68",
            authDomain: "rekrutracker-app.firebaseapp.com",
            projectId: "rekrutracker-app",
            storageBucket: "rekrutracker-app.firebasestorage.app",
            messagingSenderId: "758407291898",
            appId: "1:758407291898:web:a573e2cd3b416596d37a43",
            measurementId: "G-HQW1YLG9Q1"
        };

        // Initialize Firebase
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const db = getFirestore(app);
        const auth = getAuth(app);

        // Make Firebase services available globally without overwriting
        // existing helpers registered on the main page
        window.db = db;
        window.auth = auth;
        window.firebaseModules = window.firebaseModules || {};
       Object.assign(window.firebaseModules, {
            collection,
            addDoc,
            serverTimestamp,
            onAuthStateChanged,
            app,
            db,
            auth
        });

        function sanitizeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // Base64 image conversion utility with basic compression
        function convertFileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        const MAX_DIMENSION = 1280;
                        let { width, height } = img;
                        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                            const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                            width = Math.round(width * scale);
                            height = Math.round(height * scale);
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                    };
                    img.onerror = error => reject(error);
                    img.src = reader.result;
                };
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        };

        // Check authentication status on page load
        onAuthStateChanged(auth, function(user) {
            const authStatus = document.getElementById('auth-status');
            if (user) {
                authStatus.innerHTML = `✅ Zalogowany jako: ${sanitizeHTML(user.email || user.displayName || user.uid)}<br>UID: ${sanitizeHTML(user.uid)}`;
            } else {;
                authStatus.innerHTML = '❌ Nie zalogowany - przekierowywanie...';
                // User is not authenticated, redirect to login
                alert('Musisz być zalogowany, aby dodać aplikację.');
                window.location.href = 'login.html';
                return;
            }
        });

        // Arrays to store selected files and their preview URLs
        let selectedFiles = [];
        let previewUrls = [];

        // Podgląd zdjęć przed wysłaniem
        document.getElementById('images').addEventListener('change', function (e) {
            const newFiles = Array.from(e.target.files);
            
            // Add new files to the selected files array
            newFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    selectedFiles.push(file);
                    
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        previewUrls.push(event.target.result);
                        updateImagePreview();
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Clear the input to allow selecting the same files again if needed
            e.target.value = '';
        });

        function updateImagePreview() {
            const preview = document.getElementById('imagesPreview');
            const imageCount = document.getElementById('imageCount');
            const imageCountNumber = document.getElementById('imageCountNumber');
            
            preview.innerHTML = '';
            
            if (selectedFiles.length === 0) {
                imageCount.style.display = 'none';
                return;
            }
            
            // Update counter
            imageCountNumber.textContent = selectedFiles.length;
            imageCount.style.display = 'block';
            
            // Create preview for each image
            previewUrls.forEach((url, index) => {
                const container = document.createElement('div');
                container.className = 'image-preview-container';
                
                const img = document.createElement('img');
                img.src = url;
                img.className = 'image-preview';
                img.alt = `Preview ${index + 1}`;
                img.loading = 'lazy';
                img.title = `Zdjęcie ${index + 1} - kliknij aby powiększyć`;
                img.style.cursor = 'pointer';
                
                // Add click to preview larger image
                img.onclick = function () {
                    window.openImageModal(url, `Podgląd zdjęcia ${index + 1}`);
                };
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'image-remove-btn';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.type = 'button';
                removeBtn.title = 'Usuń zdjęcie';
                removeBtn.onclick = function() {
                    removeImage(index);
                };
                
                container.appendChild(img);
                container.appendChild(removeBtn);
                preview.appendChild(container);
            });
        }

        function removeImage(index) {
            selectedFiles.splice(index, 1);
            previewUrls.splice(index, 1);
            updateImagePreview();
        }

        function clearAllImages() {
            selectedFiles = [];
            previewUrls = [];
            updateImagePreview();
        }


        

        // Make helpers available globally for inline handlers
        window.clearAllImages = clearAllImages;

        // Walidacja pól Stanowisko i Firma - tylko litery
        function validateLettersOnly(input) {
            const regex = /[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/g;
            input.value = input.value.replace(regex, '');
        }

        document.getElementById('stanowisko').addEventListener('input', function() {
            validateLettersOnly(this);
        });

        document.getElementById('firma').addEventListener('input', function() {
            validateLettersOnly(this);
        });

        // Upload images using Base64 encoding
        async function uploadImages() {
            if (selectedFiles.length === 0) {;
                return [];
            };
            
            try {
                const base64Promises = selectedFiles.map(async (file, index) => {;
                    
                    // Validate file
                    if (!file.type.startsWith('image/')) {
                        console.warn(`Skipping non-image file: ${file.name}`);
                        return null;
                    }
                    
                    // Check file size (max 1MB for Base64 to avoid Firestore limits)
                    if (file.size > 1024 * 1024) {
                        console.warn(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB): ${file.name}`);
                        alert(`Plik ${file.name} jest za duży. Maksymalny rozmiar to 1MB dla Base64.`);
                        return null;
                    }
                    
                    try {;
                        const base64String = await convertFileToBase64(file);;
                        return {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: base64String
                        };
                        
                    } catch (fileError) {
                        console.error(`Error converting file ${file.name}:`, fileError);
                        alert(`Błąd podczas konwersji pliku ${file.name}: ${fileError.message}`);
                        return null;
                    }
                });;
                const base64Files = await Promise.all(base64Promises);
                const validFiles = base64Files.filter(file => file !== null);;
                return validFiles;
                
            } catch (error) {
                console.error('General conversion error:', error);
                throw new Error(`Błąd podczas konwersji zdjęć: ${error.message}`);
            }
        }

        // Obsługa formularza
        document.getElementById('addApplicationForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            // Check if user is authenticated
            const user = auth.currentUser;
            if (!user) {
                alert('Musisz być zalogowany, aby dodać aplikację.');
                window.location.href = 'login.html';
                return;
            }

            // Pokaż komunikat o przetwarzaniu
            document.getElementById('form-message').textContent = "Przetwarzanie...";
            document.getElementById('form-message').style.color = "blue";

            const stanowisko = document.getElementById('stanowisko').value;
            const firma = document.getElementById('firma').value;
            const data = document.getElementById('data').value;
            const status = document.getElementById('status').value;
            const wynagrodzenie = document.getElementById('wynagrodzenie').value;
            const waluta = document.getElementById('waluta').value;
            const wynRodzaj = document.getElementById('wynRodzaj').value;
            const tryb = document.getElementById('tryb').value;
            const rodzaj = document.getElementById('rodzaj').value;
            const umowa = document.getElementById('umowa').value;
            const kontakt = document.getElementById('kontakt').value;
            const link = document.getElementById('link').value;
            const notatki = document.getElementById('notatki').value;
            const favorite = document.getElementById('favorite').checked;

            try {;;;
                
                // Test auth token
                try {
                    const token = await user.getIdToken();;
                } catch (tokenError) {
                    console.error('Failed to get auth token:', tokenError);
                }
                
                // Konwertuj zdjęcia do Base64 jeśli są
                let base64Images = [];
                if (selectedFiles.length > 0) {;
                    document.getElementById('form-message').textContent = `Konwersja ${selectedFiles.length} zdjęć...`;
                    document.getElementById('form-message').style.color = "blue";
                    
                    base64Images = await uploadImages();;
                    
                    document.getElementById('form-message').textContent = "Zapisywanie aplikacji...";
                }

                // Przygotuj dane do zapisania
                const applicationData = {
                    stanowisko,
                    firma,
                    data,
                    status,
                    tryb,
                    rodzaj,
                    umowa,
                    waluta,
                    wynRodzaj,
                    statusHistory: [{
                        status: status,
                        date: data
                    }],
                    archiwalna: false,
                    favorite: favorite,
                    userId: user.uid, // Add user ID for security
                    createdAt: serverTimestamp()
                };

                // Dodaj opcjonalne pola tylko jeśli są wypełnione
                if (wynagrodzenie) applicationData.wynagrodzenie = parseFloat(wynagrodzenie);
                if (kontakt) applicationData.kontakt = kontakt;
                if (link) applicationData.link = link;
                if (notatki) applicationData.notatki = notatki;
                if (base64Images.length > 0) applicationData.images = base64Images;;;;
                
                await addDoc(collection(db, "applications"), applicationData);;
                
                document.getElementById('form-message').textContent = "Aplikacja została dodana pomyślnie!";
                document.getElementById('form-message').style.color = "green";
                this.reset();
                clearAllImages(); // Clear image arrays and preview

                // Przekieruj po 2 sekundach
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);
            } catch (error) {
                console.error("Błąd podczas dodawania aplikacji:", error);
                console.error("Error details:", {
                    code: error.code,
                    message: error.message,
                    stack: error.stack,
                    customData: error.customData
                });
                
                // Check if error is related to image upload
                if (error.message && error.message.includes('zdjęć') && selectedFiles.length > 0) {
                    const saveWithoutImages = confirm(
                        `Wystąpił błąd podczas przesyłania zdjęć: ${error.message}\n\n` +
                        `Czy chcesz zapisać aplikację bez zdjęć?`
                    );
                    
                    if (saveWithoutImages) {
                        try {;
                            document.getElementById('form-message').textContent = "Zapisywanie bez zdjęć...";
                            document.getElementById('form-message').style.color = "orange";
                            
                            // Save without images
                            const applicationData = {
                                stanowisko,
                                firma,
                                data,
                                status,
                                tryb,
                                rodzaj,
                                umowa,
                                waluta,
                                wynRodzaj,
                                statusHistory: [{
                                    status: status,
                                    date: data
                                }],
                                archiwalna: false,
                                favorite: favorite,
                                userId: user.uid,
                                createdAt: serverTimestamp()
                            };
                            
                            // Add optional fields
                            if (wynagrodzenie) applicationData.wynagrodzenie = parseFloat(wynagrodzenie);
                            if (kontakt) applicationData.kontakt = kontakt;
                            if (link) applicationData.link = link;
                            if (notatki) applicationData.notatki = notatki;
                            
                            await addDoc(collection(db, "applications"), applicationData);
                            
                            document.getElementById('form-message').textContent = "Aplikacja zapisana (bez zdjęć)!";
                            document.getElementById('form-message').style.color = "green";
                            this.reset();
                            clearAllImages();
                            
                            setTimeout(() => {
                                window.location.href = "index.html";
                            }, 2000);
                            return;
                            
                        } catch (saveError) {
                            console.error("Error saving without images:", saveError);
                        }
                    }
                }
                
                // More detailed error handling
                let errorMessage = "Błąd podczas dodawania aplikacji.";
                if (error.code) {
                    switch(error.code) {
                        case 'permission-denied':
                            errorMessage = "Brak uprawnień. Sprawdź czy jesteś zalogowany.";
                            break;
                        case 'unavailable':
                            errorMessage = "Usługa tymczasowo niedostępna. Spróbuj ponownie.";
                            break;
                        case 'unauthenticated':
                            errorMessage = "Nie jesteś zalogowany. Przekierowywanie...";
                            setTimeout(() => window.location.href = 'login.html', 2000);
                            break;
                        case 'storage/unauthorized':
                            errorMessage = "Brak dostępu do przesyłania plików. Skontaktuj się z administratorem.";
                            break;
                        case 'storage/canceled':
                            errorMessage = "Przesyłanie zostało anulowane.";
                            break;
                        case 'storage/unknown':
                            errorMessage = "Nieznany błąd podczas przesyłania plików.";
                            break;
                        default:
                            errorMessage = `Błąd: ${error.message}`;
                    }
                }
                
                document.getElementById('form-message').textContent = errorMessage;
                document.getElementById('form-message').style.color = "red";
            }
        });
