'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function ProductsRoom() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productSubCategory, setProductSubCategory] = useState('');
  
  // Database theke categories load korar state
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Firestore theke categories fetch kora
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const cats = [];
        querySnapshot.forEach((doc) => {
          cats.push({ id: doc.id, ...doc.data() });
        });
        setCategoriesList(cats);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };
    fetchCategories();
  }, []);

  // Main category select korle tar odhinthor sub-categories filter korar handler
  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setProductCategory(selectedCat);
    setProductSubCategory(''); // Reset sub-category

    // Selected main category-er sub-categories khuje ber kora
    const foundCat = categoriesList.find(c => c.name === selectedCat || c.id === selectedCat);
    if (foundCat && foundCat.subCategories) {
      setSubCategoriesList(foundCat.subCategories); // Jodi array hoy
    } else if (foundCat && foundCat.subCategory) {
      setSubCategoriesList([foundCat.subCategory]);
    } else {
      setSubCategoriesList([]);
    }
  };

  // Base64 Image Converter
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1048576) {
      alert("Please select an image smaller than 1MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productImage) {
      alert("Please select a product image!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        price: Number(productPrice),
        image: productImage,
        category: productCategory,
        subCategory: productSubCategory || "None",
        createdAt: new Date()
      });
      alert("Product Added Successfully to Database!");
      setProductName('');
      setProductPrice('');
      setProductImage('');
      setProductCategory('');
      setProductSubCategory('');
      setSubCategoriesList([]);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white p-4 md:p-6 rounded-lg shadow border mx-auto">
      <h1 className="text-lg md:text-xl font-bold mb-4 text-slate-800">Products Add & Manage Room</h1>
      <form onSubmit={handleAddProduct} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Product Name</label>
          <input 
            type="text" 
            value={productName} 
            onChange={(e) => setProductName(e.target.value)} 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600" 
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Price (৳)</label>
          <input 
            type="number" 
            value={productPrice} 
            onChange={(e) => setProductPrice(e.target.value)} 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600" 
            required 
          />
        </div>

        {/* Image Choose File Section */}
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Select Product Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="w-full p-2 border rounded text-sm bg-gray-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" 
            required
          />
          {productImage && (
            <div className="mt-2 flex items-center space-x-2">
              <img src={productImage} alt="Preview" className="w-12 h-12 object-cover rounded border" />
              <span className="text-xs text-green-600 font-medium">Image Loaded Successfully!</span>
            </div>
          )}
        </div>

        {/* Main Category Dropdown */}
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-600">Select Main Category</label>
          <select 
            value={productCategory} 
            onChange={handleCategoryChange} 
            className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600 bg-white" 
            required
          >
            <option value="">-- Choose Category --</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.name || cat.categoryName}>
                {cat.name || cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Category Dropdown (Dynamic) */}
        {subCategoriesList.length > 0 && (
          <div>
            <label className="block text-xs font-bold mb-1 text-gray-600">Select Sub-Category</label>
            <select 
              value={productSubCategory} 
              onChange={(e) => setProductSubCategory(e.target.value)} 
              className="w-full p-2.5 border rounded text-sm outline-none focus:border-teal-600 bg-white"
            >
              <option value="">-- Choose Sub-Category --</option>
              {subCategoriesList.map((sub, index) => (
                <option key={index} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-sm font-bold"
        >
          {loading ? "Adding..." : "Add Product to Live Database"}
        </button>
      </form>
    </div>
  );
}
