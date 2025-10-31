import {
  createReadingPractice,
  getReadingPractices,
  getReadingPracticeById,
  updateReadingPractice,
  deleteReadingPractice,
} from "../services/readingService.js";

// CREATE
export const addReadingPracticeController = async (req, res) => {
  try {
    const formData = req.body; // dữ liệu từ frontend
    const newPractice = await createReadingPractice(formData);

    res.status(201).json({
      message: "Reading practice added successfully!",
      data: newPractice,
    });
  } catch (err) {
    console.error("Error adding reading practice:", err);
    res.status(500).json({ message: err.message });
  }
};

// READ ALL
export const getReadingPracticesController = async (req, res) => {
  try {
    const practices = await getReadingPractices();
    res.status(200).json({
      message: "Reading practices fetched successfully!",
      data: practices,
    });
  } catch (err) {
    console.error("Error fetching reading practices:", err);
    res.status(500).json({ message: err.message });
  }
};

// READ BY ID
export const getReadingPracticeByIdController = async (req, res) => {
  try {
    const practice = await getReadingPracticeById(req.params.id);
    res.status(200).json({
      message: "Reading practice fetched successfully!",
      data: practice,
    });
  } catch (err) {
    console.error("Error fetching reading practice:", err);
    res.status(404).json({ message: err.message });
  }
};

// UPDATE
export const updateReadingPracticeController = async (req, res) => {
  try {
    const updated = await updateReadingPractice(req.params.id, req.body);
    res.status(200).json({
      message: "Reading practice updated successfully!",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating reading practice:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteReadingPracticeController = async (req, res) => {
  try {
    await deleteReadingPractice(req.params.id);
    res.status(200).json({
      message: "Reading practice deleted successfully!",
    });
  } catch (err) {
    console.error("Error deleting reading practice:", err);
    res.status(500).json({ message: err.message });
  }
};
