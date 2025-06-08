# RekruTracker - Job Application Tracker

Prosta aplikacja ułatwiająca zarządzanie procesem rekrutacji. Projekt
korzysta z Firebase do przechowywania danych i obsługi logowania.

## Uruchomienie

1. Otwórz pliki `index.html` w przeglądarce.
2. Wymagana jest konfiguracja Firebase – klucze znajdują się w kodzie, ale
   dostęp do danych ograniczają reguły bezpieczeństwa Firestore.

## Funkcje

* Dodawanie aplikacji z możliwością załączania zdjęć.
* Przeglądanie statystyk i analiz.
* Prosty asystent AI pomagający w podsumowaniu danych.

## Bezpieczeństwo

* Dane wprowadzane przez użytkownika są sanitizowane przed wstawieniem do DOM.
* Otwarcie podglądu zdjęć wykorzystuje atrybuty `noopener` i `noreferrer`.
* Usunięto logi debugowania zawierające potencjalnie wrażliwe informacje.

Projekt nie posiada jeszcze zautomatyzowanych testów.
