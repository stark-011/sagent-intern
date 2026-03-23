import { useCallback, useEffect, useMemo, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import {
  getErrorMessage,
  getId,
  isProductAvailable,
  getProductPrice,
  getProductStock,
  normalizeRole,
  ROLES,
} from '../components/appUtils';
import { useAuth } from '../context/AuthContext';
import { createCartItem, ensureCartForUser } from '../services/cartService';
import { createProduct, getAllProducts } from '../services/productService';

const CATEGORY_OPTIONS = ['All', 'Fruits', 'Vegetables', 'Dairy'];

const SAMPLE_PRODUCTS = [
  {
    name: 'Apple',
    description: 'Fresh red apples',
    category: 'Fruits',
    price: 80,
    stock: 50,
    available: true,
  },
  {
    name: 'Banana',
    description: 'Organic bananas',
    category: 'Fruits',
    price: 45,
    stock: 80,
    available: true,
  },
  {
    name: 'Tomato',
    description: 'Farm tomatoes',
    category: 'Vegetables',
    price: 35,
    stock: 70,
    available: true,
  },
  {
    name: 'Potato',
    description: 'Premium potatoes',
    category: 'Vegetables',
    price: 30,
    stock: 90,
    available: true,
  },
  {
    name: 'Milk 1L',
    description: 'Full cream milk',
    category: 'Dairy',
    price: 60,
    stock: 40,
    available: true,
  },
  {
    name: 'Paneer',
    description: 'Fresh paneer pack',
    category: 'Dairy',
    price: 120,
    stock: 25,
    available: true,
  },
];

const inferCategoryFromName = (name) => {
  const value = String(name || '').toLowerCase();

  if (['apple', 'banana', 'orange', 'mango', 'grape'].some((item) => value.includes(item))) {
    return 'Fruits';
  }

  if (['tomato', 'potato', 'onion', 'carrot', 'spinach'].some((item) => value.includes(item))) {
    return 'Vegetables';
  }

  if (['milk', 'paneer', 'curd', 'yogurt', 'cheese'].some((item) => value.includes(item))) {
    return 'Dairy';
  }

  return 'Other';
};

const getCategory = (product) => {
  const raw = String(product?.category || product?.productCategory || '').trim();
  if (raw) {
    return raw;
  }

  return inferCategoryFromName(product?.name);
};

const normalizeForDisplay = (items) => {
  const unique = new Map();

  items.forEach((item) => {
    const key = `${String(item.name || '').trim().toLowerCase()}|${getCategory(item).toLowerCase()}|${getProductPrice(item)}`;

    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  return Array.from(unique.values());
};

function ProductsPage() {
  const { currentUser } = useAuth();
  const role = normalizeRole(currentUser?.role);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [category, setCategory] = useState('All');

  const seedSampleProducts = useCallback(async () => {
    const response = await getAllProducts();
    const existing = Array.isArray(response.data) ? response.data : [];
    const existingNames = new Set(
      existing.map((item) => String(item.name || '').trim().toLowerCase()).filter(Boolean),
    );

    let created = 0;

    for (const product of SAMPLE_PRODUCTS) {
      const key = String(product.name || '').trim().toLowerCase();
      if (existingNames.has(key)) {
        continue;
      }

      try {
        await createProduct({
          ...product,
          quantity: product.stock,
          inStock: true,
          availability: 'In Stock',
        });
        created += 1;
        existingNames.add(key);
      } catch {
        // Ignore item-level failures (duplicates/validation differences).
      }
    }

    return created;
  }, []);

  const loadProducts = useCallback(
    async (seedIfEmpty = true) => {
      setLoading(true);
      setError('');

      try {
        const response = await getAllProducts();
        let values = Array.isArray(response.data) ? response.data : [];

        if (seedIfEmpty && values.length === 0) {
          await seedSampleProducts();
          const reloaded = await getAllProducts();
          values = Array.isArray(reloaded.data) ? reloaded.data : [];

          if (values.length > 0) {
            setSuccess('Sample products added successfully.');
          }
        }

        setProducts(normalizeForDisplay(values));
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Failed to fetch products.'));
      } finally {
        setLoading(false);
      }
    },
    [seedSampleProducts],
  );

  useEffect(() => {
    loadProducts(true);
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    if (category === 'All') {
      return products;
    }

    return products.filter((item) => getCategory(item).toLowerCase() === category.toLowerCase());
  }, [products, category]);

  const handleAddToCart = async (product) => {
    if (role !== ROLES.CUSTOMER) {
      setError('Only customers can add items to cart.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userId = getId(currentUser);
      const productId = getId(product);

      if (!userId) {
        throw new Error('User id not found. Please logout and login again.');
      }

      if (!productId) {
        throw new Error('Product id not found for selected item.');
      }

      const cart = await ensureCartForUser(userId);
      await createCartItem({
        cartId: cart.id,
        productId,
        quantity: 1,
      });

      setSuccess(`${product.name || 'Product'} added to cart.`);
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to add item to cart.'));
    } finally {
      setSaving(false);
    }
  };

  const handleManualSeed = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const created = await seedSampleProducts();
      await loadProducts(false);

      if (created > 0) {
        setSuccess(`Added ${created} sample products.`);
      } else {
        setSuccess('Sample products already exist or could not be created.');
      }
    } catch (seedError) {
      setError(getErrorMessage(seedError, 'Failed to seed products.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card">
      <h2>Products</h2>

      <div className="filters-row form-actions">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="button-secondary" onClick={handleManualSeed} disabled={saving}>
          {saving ? 'Adding...' : 'Add Sample Products'}
        </button>
      </div>

      <ErrorState message={error} />
      {success && <p className="status success">{success}</p>}

      {loading ? (
        <LoadingState message="Loading groceries..." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stock = getProductStock(product);
                const isAvailable = isProductAvailable(product);
                const productId = getId(product);

                return (
                  <tr key={productId || `${product.name}-${getCategory(product)}`}>
                    <td>{product.name || '-'}</td>
                    <td>{getCategory(product)}</td>
                    <td>{getProductPrice(product).toFixed(2)}</td>
                    <td>{isAvailable ? `In Stock${stock > 0 ? ` (${stock})` : ''}` : 'Out of Stock'}</td>
                    <td>
                      <button
                        type="button"
                        disabled={!isAvailable || saving || !productId}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5}>No products found for selected category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ProductsPage;
