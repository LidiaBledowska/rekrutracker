# 📋 Instrukcja Synchronizacji Repozytoriów

## ✅ Status zapisanych zmian:

### Repozytorium główne (origin):
- **Lokalne repo**: ✅ Wszystkie zmiany commitowane
- **GitHub origin**: ✅ Zmiany wypchniętej do `origin/main`
- **URL**: https://github.com/LidiaBledowska/lidiabledowska.github.io.git
- **Status**: 🟢 ZSYNCHRONIZOWANE

### Repozytorium backup (rekrutracker):
- **GitHub rekrutracker**: ⏳ WYMAGA SYNCHRONIZACJI
- **URL**: https://github.com/LidiaBledowska/rekrutracker.git
- **Status**: 🟡 DO ZSYNCHRONIZOWANIA

## 🔧 Manualna synchronizacja:

### Opcja 1: Terminal
```bash
cd /home/lidia/dev/git/lidiabledowska.github.io

# Sprawdź status
git status
git remote -v

# Sprawdź różnice
git fetch rekrutracker
git log rekrutracker/main..main-prod --oneline

# Push do rekrutracker
git push rekrutracker main-prod:main --force
```

### Opcja 2: Skrypt automatyczny
```bash
cd /home/lidia/dev/git/lidiabledowska.github.io
./sync-repos.sh
```

### Opcja 3: GitHub web interface
1. Idź do https://github.com/LidiaBledowska/rekrutracker
2. Kliknij "Sync fork" lub "Pull request"
3. Zsynchronizuj z głównym repozytorium

## 📦 Ostatnie commity do zsynchronizowania:

1. **a27f7e5** - "Update debug status and refine test pages"
2. **c369a5e** - "Add comprehensive debugging for sort functionality"  
3. **d0cd302** - "Fix: Improve sort functionality and event listeners"

## 🎯 Pliki objęte synchronizacją:

### Główne pliki funkcjonalności sortowania:
- `main.js` - poprawki logiki sortowania i event listenerów
- `index.html` - aktualizacje UI sortowania
- `SORTOWANIE_NAPRAWIONE.md` - dokumentacja napraw

### Narzędzia debugowania:
- `debug-sortowania.html` - debug iframe i elementów
- `test-sortowania-izolowany.html` - izolowane testy sortowania
- `test-event-listeners.html` - testy event listenerów
- `INSTRUKCJA_SORTOWANIA.md` - instrukcja użytkownika
- `sync-repos.sh` - skrypt synchronizacji

## ⚠️ Uwagi:
- Repozytorium rekrutracker może mieć konfliktujące zmiany
- W przypadku konfliktu użyj `--force` (zachowuje nasze zmiany)
- Zalecana synchronizacja przed kontynuowaniem pracy

---
**Utworzono**: 14 czerwca 2025  
**Status terminala**: Zablokowany w paginacji - użyj alternatywnych metod synchronizacji
