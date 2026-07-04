const axios = require('axios');

const BASE_URL = 'https://api.riomax.com.eg/api/v1';

async function testApi() {
  console.log('--- Testing Sliders API ---');
  try {
    const response = await axios.get(`${BASE_URL}/slider`);
    const responseData = response.data; // SliderService.getSliders() returns response.data
    console.log('Slider response.data keys:', Object.keys(responseData));
    console.log('Slider response.data.data:', responseData.data ? Object.keys(responseData.data) : 'N/A');
    
    // Test extraction logic: res.data?.slides || res.data || []
    const res = responseData;
    const slides = res.data?.slides || res.data || [];
    console.log('Extracted slides count:', Array.isArray(slides) ? slides.length : 'NOT AN ARRAY');
    if (Array.isArray(slides) && slides.length > 0) {
      console.log('First slide:', JSON.stringify(slides[0], null, 2));
    }
  } catch (error) {
    console.error('Sliders API Error:', error.message);
  }

  console.log('\n--- Testing Categories Tree API ---');
  try {
    const response = await axios.get(`${BASE_URL}/category/getAllCategoriesWithSub`);
    const responseData = response.data; // CategoryService.getCategoriesWithSub() returns response.data
    console.log('Categories response.data keys:', Object.keys(responseData));
    
    // Test extraction logic: res.data || []
    const res = responseData;
    const categories = res.data || [];
    console.log('Extracted categories count:', Array.isArray(categories) ? categories.length : 'NOT AN ARRAY');
    if (Array.isArray(categories) && categories.length > 0) {
      console.log('First category:', JSON.stringify(categories[0], null, 2));
    }
  } catch (error) {
    console.error('Categories API Error:', error.message);
  }

  console.log('\n--- Testing Products API ---');
  try {
    const response = await axios.get(`${BASE_URL}/products/getProductsForClient`, { params: { page: 1, limit: 10 } });
    const responseData = response.data; // ProductService.getProducts() returns response.data
    console.log('Products response.data keys:', Object.keys(responseData));
    
    // Test extraction logic: res.data?.products
    const res = responseData;
    const productsObj = {
      products: res.data?.products || [],
      pagination: res.data?.pagination || { totalCount: 0, totalPages: 1, currentPage: 1 },
    };
    console.log('Extracted products count:', productsObj.products.length);
    console.log('Pagination:', productsObj.pagination);
  } catch (error) {
    console.error('Products API Error:', error.message);
  }
}

testApi();
