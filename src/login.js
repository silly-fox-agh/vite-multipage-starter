import { supabase } from './supabase.js';

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Zatrzymuje domyślne przeładowanie strony

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Użycie SDK do logowania
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Błąd logowania:', error.message);
    errorMessage.textContent = 'Nieprawidłowy email lub hasło.';
    errorMessage.classList.remove('hidden');
    return;
  }

  // Jeśli logowanie się uda, przekieruj na stronę główną
  window.location.href = './';
});