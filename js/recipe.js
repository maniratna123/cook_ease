document.addEventListener('DOMContentLoaded', () => {
  const recipeDetailsContainer = document.getElementById('recipe-details');
  
  // Retrieve the recipe from localStorage
  const selectedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));
  
  // Check if a recipe is found
  if (selectedRecipe) {
    // Display the recipe details
    const recipeHTML = `
      <h2>${selectedRecipe.title}</h2>
      <img src="${selectedRecipe.image}" alt="${selectedRecipe.title}" style="width:100%; max-width: 500px; border-radius: 12px;">
      <p>${selectedRecipe.description}</p>
    `;
    
    // Inject the recipe details into the page
    recipeDetailsContainer.innerHTML = recipeHTML;
  } else {
    // If no recipe is found, display an error message
    recipeDetailsContainer.innerHTML = '<p>Recipe not found. Please make sure the recipe was selected properly.</p>';
  }
});
