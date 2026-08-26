export const FOODS = {
  basicDogFood: {
    id: 'basic-dog-food',
    displayName: 'Basic Dog Food',
    nutrition: 32,
    tags: ['dry', 'kibble', 'dog-food'],
    compatibleDietTags: ['omnivore', 'dog-food'],
  },
};

export function getFoodDefinition(foodId) {
  const food = Object.values(FOODS).find(({ id }) => id === foodId);
  if (!food) throw new Error(`Unknown food: ${foodId}`);
  return food;
}

export function isFoodCompatible(food, species) {
  return food.compatibleDietTags.some((tag) => species.dietTags.includes(tag));
}
