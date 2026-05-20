const axios = require('axios');

// Smart dictionary fallback for offline/no-credential lookups
const SMART_MOCK_DICTIONARY = [
  { keywords: ['apple'], foodName: 'Fresh Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, sugar: 19, fiber: 4.4 },
  { keywords: ['banana'], foodName: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.3, sugar: 14, fiber: 3.1 },
  { keywords: ['chicken', 'breast'], foodName: 'Grilled Chicken Breast (150g)', calories: 247, protein: 46.5, carbs: 0, fats: 5.4, sugar: 0, fiber: 0 },
  { keywords: ['rice', 'white'], foodName: 'Cooked White Rice (1 cup)', calories: 205, protein: 4.2, carbs: 44.5, fats: 0.4, sugar: 0.1, fiber: 0.6 },
  { keywords: ['rice', 'brown'], foodName: 'Cooked Brown Rice (1 cup)', calories: 218, protein: 5, carbs: 46, fats: 1.6, sugar: 0.2, fiber: 3.5 },
  { keywords: ['egg'], foodName: 'Large Boiled Egg', calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3, sugar: 0.6, fiber: 0 },
  { keywords: ['milk'], foodName: 'Whole Milk (1 glass / 240ml)', calories: 149, protein: 7.7, carbs: 11.7, fats: 8, sugar: 12, fiber: 0 },
  { keywords: ['oat', 'oats', 'oatmeal'], foodName: 'Oatmeal (1 cup cooked)', calories: 166, protein: 6, carbs: 28, fats: 4, sugar: 0.8, fiber: 4 },
  { keywords: ['bread'], foodName: 'Whole Wheat Bread (1 slice)', calories: 69, protein: 3.6, carbs: 12, fats: 0.9, sugar: 1.4, fiber: 1.9 },
  { keywords: ['salmon', 'fish'], foodName: 'Grilled Salmon (150g)', calories: 312, protein: 34, carbs: 0, fats: 18, sugar: 0, fiber: 0 },
  { keywords: ['protein', 'scoop', 'whey'], foodName: 'Whey Protein Scoop (30g)', calories: 120, protein: 24, carbs: 3, fats: 1.5, sugar: 1, fiber: 0 },
  { keywords: ['salad'], foodName: 'Garden Salad with Vinaigrette', calories: 140, protein: 2, carbs: 8, fats: 11, sugar: 3, fiber: 2.5 },
  { keywords: ['coffee'], foodName: 'Black Coffee', calories: 2, protein: 0.3, carbs: 0, fats: 0, sugar: 0, fiber: 0 },
  { keywords: ['avocado'], foodName: 'Avocado (Medium)', calories: 240, protein: 3, carbs: 12, fats: 22, sugar: 1, fiber: 10 },
  { keywords: ['almond', 'nuts'], foodName: 'Almonds (Handful / 30g)', calories: 170, protein: 6, carbs: 6, fats: 15, sugar: 1, fiber: 3 },
  { keywords: ['yogurt', 'greek'], foodName: 'Greek Yogurt (Plain, 150g)', calories: 100, protein: 15, carbs: 6, fats: 0, sugar: 5, fiber: 0 },
];

const findSmartMock = (queryText) => {
  const normalized = queryText.toLowerCase();
  // Find a mock item where all keywords of that item match the query
  const match = SMART_MOCK_DICTIONARY.find(item => 
    item.keywords.every(keyword => normalized.includes(keyword))
  );
  
  if (match) {
    return { ...match };
  }
  
  // Dynamic calculation based on length as a fallback of last resort
  const hash = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cal = 50 + (hash % 400); // 50-450 calories
  return {
    foodName: queryText.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    calories: cal,
    protein: Math.round((cal * 0.15) / 4), // 15% calories from protein
    carbs: Math.round((cal * 0.55) / 4),   // 55% calories from carbs
    fats: Math.round((cal * 0.30) / 9),    // 30% calories from fats
    sugar: Math.round((cal * 0.08) / 4),
    fiber: Math.round((cal * 0.05) / 2),
    image: '',
    barcode: '',
  };
};

// @desc    Scan barcode or lookup text query to fetch nutritional data
// @route   POST /api/barcode/scan
// @access  Private
const lookupNutrition = async (req, res) => {
  try {
    const { barcode, query } = req.body;

    if (!barcode && !query) {
      return res.status(400).json({ message: 'Please provide either a barcode or a text query' });
    }

    // --- CASE A: Barcode Scan ---
    if (barcode) {
      console.log(`Scanning barcode: ${barcode}`);
      
      // 1. Try OpenFoodFacts (Free, no key required)
      try {
        const offResponse = await axios.get(
          `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
          {
            headers: { 'User-Agent': 'AINutritionTracker - Node - Version 1.0' },
            timeout: 4000,
          }
        );

        if (offResponse.data && offResponse.data.status === 1) {
          const product = offResponse.data.product;
          const nutriments = product.nutriments || {};
          
          return res.json({
            foodName: product.product_name || product.product_name_en || `Product (${barcode})`,
            calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal_serving'] || nutriments['energy-kcal'] || 0),
            protein: Math.round(nutriments.proteins_100g || nutriments.proteins_serving || 0),
            carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates_serving || 0),
            fats: Math.round(nutriments.fat_100g || nutriments.fat_serving || 0),
            sugar: Math.round(nutriments.sugars_100g || nutriments.sugars_serving || 0),
            fiber: Math.round(nutriments.fiber_100g || nutriments.fiber_serving || 0),
            image: product.image_front_url || product.image_url || '',
            barcode: barcode,
            source: 'OpenFoodFacts',
          });
        }
      } catch (err) {
        console.error('OpenFoodFacts failed or timed out, trying Nutritionix barcode scan:', err.message);
      }

      // 2. Try Nutritionix Barcode API (requires keys)
      if (process.env.NUTRITIONIX_APP_ID && process.env.NUTRITIONIX_APP_KEY) {
        try {
          const nutResponse = await axios.get(
            `https://trackapi.nutritionix.com/v2/search/item?upc=${barcode}`,
            {
              headers: {
                'x-app-id': process.env.NUTRITIONIX_APP_ID,
                'x-app-key': process.env.NUTRITIONIX_APP_KEY,
              },
              timeout: 4000,
            }
          );

          if (nutResponse.data && nutResponse.data.foods && nutResponse.data.foods.length > 0) {
            const food = nutResponse.data.foods[0];
            return res.json({
              foodName: food.food_name || `Product (${barcode})`,
              calories: Math.round(food.nf_calories || 0),
              protein: Math.round(food.nf_protein || 0),
              carbs: Math.round(food.nf_total_carbohydrate || 0),
              fats: Math.round(food.nf_total_fat || 0),
              sugar: Math.round(food.nf_sugars || 0),
              fiber: Math.round(food.nf_dietary_fiber || 0),
              image: food.photo ? food.photo.thumb || food.photo.highres : '',
              barcode: barcode,
              source: 'Nutritionix-Barcode',
            });
          }
        } catch (err) {
          console.error('Nutritionix Barcode scan failed:', err.message);
        }
      }

      // 3. Fallback: Return structured mock product for barcode
      return res.json({
        foodName: `Scanned Product (${barcode})`,
        calories: 180,
        protein: 4,
        carbs: 25,
        fats: 7,
        sugar: 12,
        fiber: 2,
        image: '',
        barcode: barcode,
        source: 'Fallback-Mock',
        isMock: true,
      });
    }

    // --- CASE B: Text Query (AI Scan) ---
    if (query) {
      console.log(`AI Scan query: "${query}"`);

      // 1. Try Nutritionix Natural Language (requires keys)
      if (process.env.NUTRITIONIX_APP_ID && process.env.NUTRITIONIX_APP_KEY) {
        try {
          const response = await axios.post(
            'https://trackapi.nutritionix.com/v2/natural/nutrients',
            { query: query },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-app-id': process.env.NUTRITIONIX_APP_ID,
                'x-app-key': process.env.NUTRITIONIX_APP_KEY,
              },
              timeout: 4000,
            }
          );

          if (response.data && response.data.foods && response.data.foods.length > 0) {
            // Nutritionix can parse multi-item lists, we sum them up or return the first
            // To keep it simple, we sum them if there are multiple items
            const foods = response.data.foods;
            
            if (foods.length === 1) {
              const f = foods[0];
              return res.json({
                foodName: f.food_name,
                calories: Math.round(f.nf_calories || 0),
                protein: Math.round(f.nf_protein || 0),
                carbs: Math.round(f.nf_total_carbohydrate || 0),
                fats: Math.round(f.nf_total_fat || 0),
                sugar: Math.round(f.nf_sugars || 0),
                fiber: Math.round(f.nf_dietary_fiber || 0),
                image: f.photo ? f.photo.thumb || f.photo.highres : '',
                source: 'Nutritionix-Natural-Language',
              });
            } else {
              // Sum properties
              const combined = foods.reduce((acc, f) => {
                acc.foodNames.push(`${f.serving_qty} ${f.serving_unit} ${f.food_name}`);
                acc.calories += f.nf_calories || 0;
                acc.protein += f.nf_protein || 0;
                acc.carbs += f.nf_total_carbohydrate || 0;
                acc.fats += f.nf_total_fat || 0;
                acc.sugar += f.nf_sugars || 0;
                acc.fiber += f.nf_dietary_fiber || 0;
                return acc;
              }, { foodNames: [], calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0, fiber: 0 });

              return res.json({
                foodName: combined.foodNames.join(' + '),
                calories: Math.round(combined.calories),
                protein: Math.round(combined.protein),
                carbs: Math.round(combined.carbs),
                fats: Math.round(combined.fats),
                sugar: Math.round(combined.sugar),
                fiber: Math.round(combined.fiber),
                image: foods[0].photo ? foods[0].photo.thumb : '',
                source: 'Nutritionix-Natural-Language-Multi',
              });
            }
          }
        } catch (err) {
          console.error('Nutritionix Natural Language parsing failed:', err.message);
        }
      }

      // 2. Fallback: Parse query semantically using local dictionary
      const mockResult = findSmartMock(query);
      return res.json({
        ...mockResult,
        source: 'Local-Semantic-Parser',
        isMock: true,
      });
    }

  } catch (error) {
    console.error('Lookup controller error:', error);
    res.status(500).json({ message: 'Server error processing nutritional lookup', error: error.message });
  }
};

module.exports = {
  lookupNutrition,
};
