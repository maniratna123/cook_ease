document.addEventListener('DOMContentLoaded', () => {
  const recipeDetailsContainer = document.getElementById('recipe-details');

  const selectedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));

  if (selectedRecipe) {
    const recipeHTML = `
      <h2>${selectedRecipe.title}</h2>
      <img src="${selectedRecipe.image}" alt="${selectedRecipe.title}" style="width:100%; max-width: 500px; border-radius: 12px;">
      <p>${selectedRecipe.description}</p>
    `;

    recipeDetailsContainer.innerHTML = recipeHTML;
  } else {
    recipeDetailsContainer.innerHTML = '<p>Recipe not found. Please make sure the recipe was selected properly.</p>';
  }
});
