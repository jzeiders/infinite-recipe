import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import path from 'path';
import * as fs from 'fs/promises';
import { z } from 'zod';


const ingredientSchema = z.object({
    name: z.string(),
    amount: z.string(),
    unit: z.string(),
});

const instructionSchema = z.object({
    step: z.number().int().positive(),
    description: z.string(),
});

const nutritionalInfoSchema = z.object({
    calories: z.number(),
    protein: z.number(),
    carbohydrates: z.number(),
    fat: z.number(),
});

const mealPlanningSuggestionSchema = z.object({
    id: z.string(),
    type: z.enum(["Side Dish", "Dessert", "Drink"]).or(z.string()),
});

const commentSchema = z.object({
    user: z.string(),
    date: z.string().datetime(),
    content: z.string(),
    rating: z.number().int().min(1).max(5).optional(),
});

const recipeSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().url(),
    ingredients: z.array(ingredientSchema),
    instructions: z.array(instructionSchema),
    prepTime: z.number().int().positive().or(z.literal(0)),
    cookTime: z.number().int().positive().or(z.literal(0)),
    servings: z.number().int().positive(),
    nutritionalInfo: nutritionalInfoSchema.optional(),
    difficultyLevel: z.enum(["Easy", "Medium", "Hard"]),
    specialEquipment: z.array(z.string()).optional(),
    tips: z.array(z.string()).optional(),
    relatedRecipeIds: z.array(z.string()).min(2).max(4),
    mealPlanningSuggestions: z.array(mealPlanningSuggestionSchema).optional(),
    userRating: z.number().min(0).max(5).optional(),
    comments: z.array(commentSchema).optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;


export const getRecipe = async (id: string): Promise<Recipe> => {
    try {
        // Attempt to load the recipe from the local file system
        const filePath = path.join(process.cwd(), 'data', id, 'recipe.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        const recipeData = JSON.parse(fileContents);
        const parsedRecipe = recipeSchema.parse(recipeData);
        console.log('Loaded recipe from file for ID:', id);
        return parsedRecipe;
    } catch (error) {
        console.log('Falling back to Vercel AI generation...');



        const {object} = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: recipeSchema,
            prompt: `Generate a recipe with the ID "${id}". For the relatedRecipedIds always generate the id as 3 hyphenated words, similar to how the id is provided. `
        });
        
        const dirPath = path.join(process.cwd(), 'data', id);
        await fs.mkdir(dirPath, { recursive: true });

        // Write the generated recipe to a file
        const filePath = path.join(dirPath, 'recipe.json');
        await fs.writeFile(filePath, JSON.stringify(object, null, 2));


        return object
    }
};



