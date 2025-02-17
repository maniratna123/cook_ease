/* js/api.js */

// --------------------------
// EDAMAM API Integration
// --------------------------
const EDAMAM_API_URL = 'https://api.edamam.com/search?q=';
const EDAMAM_APP_ID = '7aa516a5'; // Your Edamam App ID
const EDAMAM_APP_KEY = 'dc836a223fb788b11ae390504d9e97ce'; // Your Edamam App Key

/**
 * Fetch recipes from the Edamam API based on the ingredients or recipe name.
 * @param {string} query - The ingredients or recipe name.
 * @returns {Promise<Array>} - Returns an array of recipe objects.
 */
export async function fetchRecipesFromEdamam(query) {
  try {
    // Fix string interpolation issue by using template literals
    const url = `${EDAMAM_API_URL}${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&from=0&to=10`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Edamam API error');
    }
    
    const data = await response.json();
    
    // Map Edamam API response to our format for recipe cards
    const recipes = data.hits.map(hit => ({
      title: hit.recipe.label,
      image: hit.recipe.image,
      description: `<a href="${hit.recipe.url}" target="_blank">View Recipe</a> from ${hit.recipe.source}`,
    }));
    
    return recipes;
  } catch (error) {
    console.error('Error fetching from Edamam API:', error);
    return [];
  }
}

// --------------------------
// GEMINI API Integration
// --------------------------
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBIMnDCfuQ52M_0hr8Bk-G6tPRGyIbJt1g';

/**
 * Fetch recipes from the Gemini API based on the ingredients or recipe name.
 * @param {string} query - The ingredients or recipe name.
 * @param {string} time - Optional preparation time.
 * @param {string} type - The search type ("dish" forces Gemini-only).
 * @returns {Promise<Array>} - An array of recipe objects.
 */
export async function fetchRecipesFromGemini(query, time, type) {
  if (type === 'dish') {
    let combinedInput;
    
    if (!query) {
      return [];
    } else {
      // Fix missing quotes and string interpolation issue in Gemini API prompt
      combinedInput = `Generate 1 simple breakfast recipe using the following ingredients: ${query}. Provide a title, list of ingredients, and step-by-step instructions. Do not include any images.`;
      if (time) {
        combinedInput += ` The recipe should take about ${time} minutes to prepare.`;
      }
    }
    
    console.log("Gemini API Test Prompt (dish):", combinedInput);
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: combinedInput }] }
          ]
        })
      });

      console.log("Gemini API Response Status (dish):", response.status);
      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error("Gemini API error: " + response.statusText + " " + errorResponse);
      }

      const result = await response.json();
      console.log("Full Gemini API response (dish):", result);

      let rawAnswer = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Raw answer from Gemini (dish):", rawAnswer);

      // Fallback default text if Gemini returns empty answer.
      if (!rawAnswer.trim()) {
        rawAnswer = "Default Gemini recipe fallback:\nIngredients: Chicken, Egg, Bread, Tomato, Brinjal.\nInstructions: Mix all ingredients and cook until done.";
        console.warn("Gemini API returned empty text (dish), using fallback default recipe.");
      }

      return [{
        title: "Gemini Recipe",
        description: rawAnswer,
        image: ""
      }];
    } catch (error) {
      console.error("Error fetching from Gemini API (dish):", error);
      return [];
    }
  } else {
    // For non-dish searches, we construct a prompt to generate a recipe.
    const prompt = `Generate a recipe based on the following input: ${query}.
Provide a title, a detailed list of ingredients, and step-by-step cooking instructions.
Do not include any images.`;

    console.log("Gemini API Test Prompt (non-dish):", prompt);
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ]
        })
      });

      console.log("Gemini API Response Status (non-dish):", response.status);
      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error("Gemini API error: " + response.statusText + " " + errorResponse);
      }

      const result = await response.json();
      console.log("Full Gemini API response (non-dish):", result);

      let rawAnswer = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Raw answer from Gemini (non-dish):", rawAnswer);

      if (!rawAnswer.trim()) {
        rawAnswer = "Default Gemini recipe text: Ingredients and instructions not generated.";
        console.warn("Gemini API returned empty text (non-dish), using fallback default recipe.");
      }

      return [{
        title: query,
        description: rawAnswer,
        image: ""
      }];
    } catch (error) {
      console.error("Error fetching from Gemini API (non-dish):", error);
      return [];
    }
  }
}
