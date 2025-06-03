# Firestore Permission Denied - Rozwiązanie

## Problem
Użytkownicy otrzymują błąd "Brak uprawnień. Sprawdź czy jesteś zalogowany" mimo bycia zalogowanymi.

## Przyczynę
Firebase Firestore domyślnie ma bardzo restrykcyjne reguły bezpieczeństwa, które blokują wszystkie operacje odczytu i zapisu.

## Rozwiązanie

### Krok 1: Dostęp do Firebase Console
1. Idź na https://console.firebase.google.com/
2. Wybierz projekt: `rekrutracker-5b851`
3. Kliknij "Firestore Database" w menu po lewej
4. Przejdź do zakładki "Rules"

### Krok 2: Aktualizuj reguły Firestore

Zamień obecne reguły na te:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pozwól zalogowanym użytkownikom na dostęp do własnych aplikacji
    match /applications/{document} {
      allow read, write: if request.auth != null && 
                        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
    }
    
    // Pozwól zalogowanym użytkownikom na dostęp do własnych danych
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == userId;
    }
    
    // Tymczasowe reguły dla testowania (USUŃ W PRODUKCJI!)
    // match /{document=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

### Krok 3: Publikuj reguły
1. Kliknij "Publish" żeby zapisać nowe reguły
2. Poczekaj kilka sekund na propagację zmian

## Tymczasowe rozwiązanie dla testów

Jeśli chcesz szybko przetestować czy aplikacja działa, możesz tymczasowo użyć bardziej permisywnych reguł (TYLKO DO TESTÓW!):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **UWAGA**: Te reguły pozwalają każdemu zalogowanemu użytkownikowi na dostęp do wszystkich danych. Użyj ich tylko do testów!

## Sprawdzenie czy reguły działają

1. Otwórz `debug-permissions.html` w przeglądarce
2. Zaloguj się
3. Kliknij "Test Write" żeby sprawdzić czy można zapisywać dane
4. Sprawdź logi w konsoli

## Zalecane reguły produkcyjne

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Aplikacje o pracę - użytkownik może zarządzać tylko swoimi
    match /applications/{applicationId} {
      allow read, write, delete: if request.auth != null && 
                                 resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.keys().hasAll(['stanowisko', 'firma', 'data', 'status']);
    }
    
    // Dane użytkowników
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == userId;
    }
    
    // Statystyki i analytics (tylko odczyt dla własnych danych)
    match /analytics/{userId} {
      allow read: if request.auth != null && 
                 request.auth.uid == userId;
      allow write: if request.auth != null && 
                  request.auth.uid == userId;
    }
  }
}
```

## Dodatkowe kroki bezpieczeństwa

1. **Walidacja danych**: Reguły sprawdzają czy wymagane pola są obecne
2. **Separacja użytkowników**: Każdy użytkownik ma dostęp tylko do swoich danych
3. **Auditowanie**: Możesz dodać logowanie w regułach do monitorowania

## Testowanie

Po zmianie reguł, przetestuj:
1. Dodawanie nowej aplikacji
2. Przeglądanie istniejących aplikacji
3. Edycję aplikacji
4. Usuwanie aplikacji

Jeśli nadal masz problemy, sprawdź w Firebase Console zakładkę "Usage" czy są jakieś błędy w regułach.
