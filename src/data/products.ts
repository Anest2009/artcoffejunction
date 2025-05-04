import { Product } from '../types';

export const products: Product[] = [
  // Bar Category (Coffee & Drinks)
  {
    id: 'drink-1',
    name: 'Organic Flat White',
    description: 'Smooth espresso with velvety steamed milk',
    price: 4.50,
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
    category: 'bar'
  },
  {
    id: 'drink-2',
    name: 'Matcha Latte',
    description: 'Ceremonial grade matcha with steamed milk',
    price: 5.25,
    image: 'https://images.pexels.com/photos/5946613/pexels-photo-5946613.jpeg',
    category: 'bar'
  },
  {
    id: 'drink-3',
    name: 'Cold Brew',
    description: '12-hour steeped coffee, smooth & refreshing',
    price: 4.75,
    image: 'https://images.pexels.com/photos/2382583/pexels-photo-2382583.jpeg',
    category: 'bar'
  },
  {
    id: 'drink-4',
    name: 'Chamomile Tea',
    description: 'Organic chamomile flowers, calming & aromatic',
    price: 3.75,
    image: 'https://images.pexels.com/photos/5501104/pexels-photo-5501104.jpeg',
    category: 'bar'
  },
  
  // Pastry Category
  {
    id: 'pastry-1',
    name: 'Almond Croissant',
    description: 'Buttery croissant filled with almond cream',
    price: 4.25,
    image: 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg',
    category: 'pastry'
  },
  {
    id: 'pastry-2',
    name: 'Blueberry Scone',
    description: 'Flaky scone made with organic blueberries',
    price: 3.75,
    image: 'https://images.pexels.com/photos/6941040/pexels-photo-6941040.jpeg',
    category: 'pastry'
  },
  {
    id: 'pastry-3',
    name: 'Banana Bread',
    description: 'Moist banana bread with walnuts',
    price: 4.00,
    image: 'https://images.pexels.com/photos/830894/pexels-photo-830894.jpeg',
    category: 'pastry'
  },
  {
    id: 'pastry-4',
    name: 'Cinnamon Roll',
    description: 'Swirled with cinnamon sugar and topped with glaze',
    price: 4.50,
    image: 'https://images.pexels.com/photos/267308/pexels-photo-267308.jpeg',
    category: 'pastry'
  },
  
  // Ground Coffee
  {
    id: 'ground-1',
    name: 'Ethiopian Yirgacheffe',
    description: 'Floral, citrusy notes with a light body',
    price: 16.50,
    image: 'https://images.pexels.com/photos/4345245/pexels-photo-4345245.jpeg',
    category: 'ground'
  },
  {
    id: 'ground-2',
    name: 'Colombian Supremo',
    description: 'Rich, full-bodied with caramel sweetness',
    price: 15.25,
    image: 'https://images.pexels.com/photos/2907301/pexels-photo-2907301.jpeg',
    category: 'ground'
  },
  
  
];