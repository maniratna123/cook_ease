import { fetchRecipesFromEdamam, fetchRecipesFromGemini } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const recipeForm = document.getElementById('recipe-form');
  const generatedRecipesContainer = document.getElementById('generated-recipes-container');
  const geminiResponseContainer = document.getElementById('gemini-response-container');
  const trustAIButton = document.getElementById('trust-ai-button');
  const savedRecipesLink = document.getElementById('saved-recipes-link');

  updateAuthLink();

  if (recipeForm) {
    recipeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = document.getElementById('ingredients').value;
      const time = document.getElementById('time').value;
      generatedRecipesContainer.innerHTML = '<p>Loading recipes...</p>';

      let edamamRecipes = [];
      let geminiRecipes = [];

      try {
        [edamamRecipes, geminiRecipes] = await Promise.all([
          fetchRecipesFromEdamam(query),
          fetchRecipesFromGemini(query, time, 'non-dish')
        ]);

        const allRecipes = [...(edamamRecipes || [])];

        if (allRecipes.length === 0) {
          generatedRecipesContainer.innerHTML = '<p>No recipes found. Try a different query.</p>';
        } else {
          generatedRecipesContainer.innerHTML = '';
          allRecipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            generatedRecipesContainer.appendChild(card);

            localStorage.setItem('savedRecipes', JSON.stringify(allRecipes));
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        generatedRecipesContainer.innerHTML = `<p>Error fetching recipes: ${error.message}</p>`;
      }
    });
  }

  if (trustAIButton) {
    trustAIButton.addEventListener('click', async () => {
      const query = document.getElementById('ingredients').value;
      const time = document.getElementById('time').value;

      geminiResponseContainer.innerHTML = '<div class="gemini-chat-box"><div class="gemini-chat-message"><strong>AI Generated Recipe:</strong><div class="gemini-typing-effect">Generating recipe...</div></div></div>';

      try {
        const geminiRecipes = await fetchRecipesFromGemini(query, time, 'non-dish');
        geminiResponseContainer.innerHTML = ` 
          <div class="gemini-chat-box">
            <div class="gemini-chat-message">
              <strong>AI:</strong>
              <div class="gemini-typing-effect">${geminiRecipes[0].description}</div>
            </div>
          </div>
        `;
        simulateTypingEffect(geminiRecipes[0].description);
      } catch (error) {
        geminiResponseContainer.innerHTML = '<p>Error generating recipe from AI.</p>';
        console.error('Error fetching Gemini response:', error);
      }
    });
  }

  const savedRecipesContainer = document.getElementById('saved-recipes-container');
  if (savedRecipesContainer) {
    if (!isLoggedIn()) {
      alert('Please log in to view your saved recipes.');
      window.location.href = 'login.html';
    } else {
      loadSavedRecipes(savedRecipesContainer);
    }
  }
});

// --- Helper functions ---

function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  const title = document.createElement('h3');
  title.textContent = recipe.title || 'Untitled Recipe';
  cardBody.appendChild(title);

  if (recipe.image) {
    const img = document.createElement('img');
    img.src = recipe.image; 
    card.appendChild(img);
  }

  card.appendChild(cardBody);

  const actions = document.createElement('div');
  actions.className = 'card-actions';


  const likeBtn = document.createElement('button');
  likeBtn.className = 'like-btn';
  likeBtn.textContent = isRecipeLiked(recipe) ? 'Liked' : 'Like';
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLikeRecipe(recipe, likeBtn);
  });
  actions.appendChild(likeBtn);


  const youtubeBtn = document.createElement('button');
  youtubeBtn.textContent = 'Video';
  youtubeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const query = encodeURIComponent(recipe.title + ' recipe');
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  });
  actions.appendChild(youtubeBtn);

  card.appendChild(actions);

  card.addEventListener('click', () => {
    if (isLoggedIn()) {
      localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
      window.open('recipe.html', '_blank');
    } else {
      alert('Please log in to save recipes.');
      window.location.href = 'login.html';
    }
  });

  return card;
}

function isLoggedIn() {
  return !!localStorage.getItem('loggedInUser');
}


function isRecipeLiked(recipe) {
  const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];
  return likedRecipes.some(r => r.title === recipe.title);
}

function toggleLikeRecipe(recipe, btn) {
  const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];
  const index = likedRecipes.findIndex(r => r.title === recipe.title);

  if (isLoggedIn()) {
    if (index > -1) {
      likedRecipes.splice(index, 1); 
      btn.textContent = 'Like';
    } else {
      likedRecipes.push(recipe); 
      btn.textContent = 'Liked';
    }
    localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
  } else {
    alert('Please log in to save recipes.');
  }
}

function loadSavedRecipes(container) {
  const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];

  if (likedRecipes.length === 0) {
    container.innerHTML = '<p>No saved recipes. Like some recipes on the Home page!</p>';
  } else {
    container.innerHTML = '';
    likedRecipes.forEach(recipe => {
      const card = createRecipeCard(recipe);
      container.appendChild(card);
    });
  }
}

function updateAuthLink() {
  const authLink = document.getElementById('auth-link');
  
  if (authLink) {
    if (isLoggedIn()) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        updateAuthLink();
        window.location.href = 'index.html';
      });
    } else {
      authLink.textContent = 'Login';
      authLink.href = 'login.html';
    }
  }
}

function simulateTypingEffect(text) {
  const typingBox = document.querySelector('.gemini-typing-effect');
  const steps = text.split('\n');
  let stepIndex = 0;

  typingBox.innerHTML = ''; 
  let typingInterval = setInterval(() => {
    if (stepIndex < steps.length) {
      typingBox.innerHTML += `<p>${steps[stepIndex]}</p>`;
      stepIndex++;
    } else {
      clearInterval(typingInterval);
    }
  }, 1000); 
}
