console.log('nested');
import { supabase } from './supabase.js';

// --- ELEMENTY DOM ---
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const addArticleBtn = document.getElementById('add-article-btn');
const articlesContainer = document.getElementById('articles-container');

const modal = document.getElementById('article-modal');
const articleForm = document.getElementById('article-form');
const cancelBtn = document.getElementById('cancel-btn');
const modalTitle = document.getElementById('modal-title');

let currentUser = null;

// --- INICJALIZACJA I AUTORYZACJA ---
const init = async () => {
  // Sprawdzamy, czy ktoś jest zalogowany
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;

  if (currentUser) {
    // Zalogowany
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    addArticleBtn.classList.remove('hidden'); // Widoczny
  } else {
    // Niezalogowany
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    addArticleBtn.classList.remove('hidden'); // Widoczny również dla niezalogowanych
  }

  // Pobieramy artykuły na start
  fetchArticles();
};

// Obsługa wylogowania
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

// --- POBIERANIE I WYSWIETLANIE ARTYKUŁÓW ---
const fetchArticles = async () => {
  articlesContainer.innerHTML = '<p class="text-center text-gray-500">Ładowanie...</p>';
  
  // Pobieranie danych z Supabase z najnowszymi na górze
  const { data, error } = await supabase
    .from('article')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Błąd pobierania:', error);
    articlesContainer.innerHTML = '<p class="text-red-500 text-center">Błąd ładowania artykułów.</p>';
    return;
  }

  renderArticles(data);
};

const renderArticles = (articles) => {
  if (articles.length === 0) {
    articlesContainer.innerHTML = '<p class="text-center text-gray-500">Brak artykułów. Zaloguj się i dodaj pierwszy!</p>';
    return;
  }

  // Budowanie HTML dla każdego artykułu (dodana data aktualizacji/utworzenia)
  articlesContainer.innerHTML = articles.map(article => `
    <article class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative group transition-shadow hover:shadow-md">
      <h2 class="text-xl font-bold text-gray-800">${article.title}</h2>
      ${article.subtitle ? `<h3 class="text-md text-gray-500 mb-2">${article.subtitle}</h3>` : ''}
      <p class="text-sm font-semibold text-blue-600 mb-1">Autor: ${article.author}</p>
      <p class="text-xs text-gray-500 mb-4">Data dodania/aktualizacji: ${new Date(article.created_at).toLocaleString()}</p>
      <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${article.content}</p>
      
      ${currentUser ? `
        <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="editArticle('${article.id}')" class="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">Edytuj</button>
          <button onclick="deleteArticle('${article.id}')" class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">Usuń</button>
        </div>
      ` : ''}
    </article>
  `).join('');
};

// --- OBSŁUGA FORMULARZA I BAZY DANYCH ---

// Otwieranie modala do dodawania LUB przekierowanie
addArticleBtn.addEventListener('click', () => {
  if (currentUser) {
    // Jeśli zalogowany: otwieramy formularz (modal)
    articleForm.reset(); 
    document.getElementById('article-id').value = ''; 
    modalTitle.textContent = 'Dodaj artykuł';
    modal.classList.remove('hidden');
  } else {
    // Jeśli niezalogowany: przekierowujemy na stronę logowania
    window.location.href = './login.html';
  }
});

// Zamykanie modala
cancelBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Wysyłanie formularza (Zapis / Aktualizacja)
articleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('article-id').value;
  const articleData = {
    title: document.getElementById('title').value,
    subtitle: document.getElementById('subtitle').value,
    author: document.getElementById('author').value,
    content: document.getElementById('content').value,
    created_at: new Date().toISOString() // Dodana zawsze aktualna data
  };

  if (id) {
    // Jeśli jest ID, to edytujemy istniejący artykuł
    await supabase.from('article').update(articleData).eq('id', id);
  } else {
    // Jeśli brak ID, dodajemy nowy
    await supabase.from('article').insert([articleData]);
  }

  modal.classList.add('hidden');
  fetchArticles(); // Odświeżamy listę po dodaniu/edycji
});

// --- FUNKCJE GLOBALNE DLA PRZYCISKÓW W HTML ---

// Funkcja usuwania
window.deleteArticle = async (id) => {
  if (confirm('Czy na pewno chcesz usunąć ten artykuł?')) {
    await supabase.from('article').delete().eq('id', id);
    fetchArticles();
  }
};

// Funkcja otwierająca edycję
window.editArticle = async (id) => {
  // Pobieramy dane konkretnego artykułu, żeby wypełnić formularz
  const { data } = await supabase.from('article').select('*').eq('id', id).single();
  
  if (data) {
    document.getElementById('article-id').value = data.id;
    document.getElementById('title').value = data.title;
    document.getElementById('subtitle').value = data.subtitle || '';
    document.getElementById('author').value = data.author;
    document.getElementById('content').value = data.content;
    
    modalTitle.textContent = 'Edytuj artykuł';
    modal.classList.remove('hidden');
  }
};

// Start aplikacji
init();