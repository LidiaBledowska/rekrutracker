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

        // Base64 image conversion utility
        function convertFileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        }

        console.log('Firebase v10 initialized successfully');
        console.log('Storage bucket:', firebaseConfig.storageBucket);
        console.log('Services available:', {
            firestore: !!db,
            auth: !!auth
        });

        // Check authentication status on page load
        onAuthStateChanged(auth, function(user) {
            const authStatus = document.getElementById('auth-status');
            if (user) {
                console.log('User authenticated:', user);
                authStatus.innerHTML = `✅ Zalogowany jako: ${user.email || user.displayName || user.uid}<br>UID: ${user.uid}`;
            } else {
                console.log('User not authenticated');
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
                img.title = `Zdjęcie ${index + 1} - kliknij aby powiększyć`;
                img.style.cursor = 'pointer';
                
                // Add click to preview larger image
                img.onclick = function() {
                    // Create a new window with the image for full screen preview
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                        newWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Podgląd zdjęcia ${index + 1}</title>
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
                                <img src="${url}" alt="Podgląd zdjęcia ${index + 1}" />
                            </body>
                            </html>
                        `);
                        newWindow.document.close();
                    }
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
        
        function skipImages() {
            if (selectedFiles.length > 0) {
                const confirmSkip = confirm('Czy na pewno chcesz usunąć wszystkie zdjęcia i zapisać aplikację bez nich?');
                if (confirmSkip) {
                    clearAllImages();
                    // Submit form without images
                    document.getElementById('addApplicationForm').dispatchEvent(new Event('submit'));
                }
            } else {
                alert('Nie ma zdjęć do pominięcia.');
            }
        }

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
            if (selectedFiles.length === 0) {
                console.log('No images to upload');
                return [];
            }
            
            console.log(`Starting conversion of ${selectedFiles.length} images to Base64...`);
            
            try {
                const base64Promises = selectedFiles.map(async (file, index) => {
                    console.log(`Processing file ${index + 1}/${selectedFiles.length}: ${file.name}`);
                    
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
                    
                    try {
                        console.log(`Converting ${file.name} to Base64...`);
                        const base64String = await convertFileToBase64(file);
                        
                        console.log(`File ${file.name} converted successfully`);
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
                });

                console.log('Waiting for all conversions to complete...');
                const base64Files = await Promise.all(base64Promises);
                const validFiles = base64Files.filter(file => file !== null);
                
                console.log(`Conversion completed. ${validFiles.length}/${selectedFiles.length} files converted successfully`);
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

            try {
                console.log('Starting form submission...');
                console.log('User details:', {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    isAnonymous: user.isAnonymous
                });
                console.log('Auth state:', auth.currentUser ? 'authenticated' : 'not authenticated');
                
                // Test auth token
                try {
                    const token = await user.getIdToken();
                    console.log('Auth token obtained successfully (length:', token.length, ')');
                } catch (tokenError) {
                    console.error('Failed to get auth token:', tokenError);
                }
                
                // Konwertuj zdjęcia do Base64 jeśli są
                let base64Images = [];
                if (selectedFiles.length > 0) {
                    console.log('Converting', selectedFiles.length, 'images to Base64...');
                    document.getElementById('form-message').textContent = `Konwersja ${selectedFiles.length} zdjęć...`;
                    document.getElementById('form-message').style.color = "blue";
                    
                    base64Images = await uploadImages();
                    console.log('Images converted:', base64Images);
                    
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
                if (base64Images.length > 0) applicationData.images = base64Images;

                console.log('Saving application data:', {
                    ...applicationData,
                    images: base64Images.length > 0 ? `[${base64Images.length} images]` : 'no images'
                });
                console.log('Database reference:', db);
                console.log('Collection reference:', collection(db, "applications"));
                
                await addDoc(collection(db, "applications"), applicationData);
                console.log('Application saved successfully!');
                
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
                        try {
                            console.log('Saving application without images...');
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
