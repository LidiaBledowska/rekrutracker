#!/bin/bash

echo "=== Skrypt synchronizacji repozytoriów ==="
echo "Data: $(date)"
echo

cd /home/lidia/dev/git/lidiabledowska.github.io

echo "1. Sprawdzanie statusu git..."
git status --short

echo
echo "2. Sprawdzanie remote repositories..."
git remote -v

echo
echo "3. Sprawdzanie obecnej gałęzi..."
git branch --show-current

echo
echo "4. Sprawdzanie ostatnich commitów..."
git log --oneline -3

echo
echo "5. Porównanie z repozytorium rekrutracker..."
git log rekrutracker/main --oneline -3 2>/dev/null || echo "Nie można sprawdzić rekrutracker/main"

echo
echo "6. Próba push do repozytorium rekrutracker..."
echo "Opcja 1: Push do main-prod branch"
git push rekrutracker main-prod 2>&1

echo
echo "Opcja 2: Force push do main branch"
git push rekrutracker main-prod:main --force 2>&1

echo
echo "7. Weryfikacja - sprawdzenie czy push się udał..."
git ls-remote rekrutracker 2>&1

echo
echo "=== Koniec skryptu ==="
