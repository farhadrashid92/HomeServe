import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name: name.trim(), description: description || '' });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description } = req.body;
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A category with that name already exists' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
