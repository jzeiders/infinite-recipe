import { getRecipe } from '@/lib/get-recipe';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function RecipePage({ params }: { params: { id: string } }) {
  let recipe;
  try {
    recipe = await getRecipe(params.id);
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            width={500}
            height={300}
            className="rounded-lg object-cover w-full h-64 md:h-auto"
          /> */}
          <p className="mt-4 text-gray-600">{recipe.description}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
          <ul className="list-disc pl-5 mb-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold">Prep Time</h3>
              <p>{recipe.prepTime}</p>
            </div>
            <div>
              <h3 className="font-semibold">Cook Time</h3>
              <p>{recipe.cookTime}</p>
            </div>
            <div>
              <h3 className="font-semibold">Total Time</h3>
              <p>{recipe.prepTime + recipe.cookTime}</p>
            </div>
            <div>
              <h3 className="font-semibold">Servings</h3>
              <p>{recipe.servings}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal pl-5">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="mb-2">
              {instruction.description}
            </li>
          ))}
        </ol>
      </div>
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Tips</h2>
          <ul className="list-disc pl-5">
            {recipe.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      {recipe.relatedRecipeIds && recipe.relatedRecipeIds.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Related Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recipe.relatedRecipeIds.map((related, index) => (
              <Link href={`/recipe/${related}`} key={index} className="block p-4 border rounded-lg hover:bg-gray-50">
                {related.split('-').join(' ')}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}