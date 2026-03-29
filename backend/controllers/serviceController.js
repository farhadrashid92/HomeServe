import Service from '../models/Service.js';

// @desc    Get all services (supports ?category= and ?search= filters)
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };

    const services = await Service.find(filter)
      .populate('providers', 'name email profileImage phone address averageRating reviewsCount')
      .populate('provider', 'name email profileImage phone address averageRating reviewsCount');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all unique categories
// @route   GET /api/services/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('providers', 'name email profileImage phone address averageRating reviewsCount')
      .populate('provider', 'name email profileImage phone address averageRating reviewsCount');
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Provider/Admin)
export const createService = async (req, res) => {
  try {
    const { title, description, category, price, image, provider } = req.body;

    const service = new Service({
      title,
      description,
      category,
      price,
      image,
      providers: provider ? [provider] : [req.user._id],
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider/Admin)
export const updateService = async (req, res) => {
  try {
    const { title, description, category, price, image } = req.body;
    const service = await Service.findById(req.params.id);

    if (service) {
      service.title = title || service.title;
      service.description = description || service.description;
      service.category = category || service.category;
      service.price = price || service.price;
      service.image = image || service.image;

      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider/Admin)
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      await service.deleteOne();
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
