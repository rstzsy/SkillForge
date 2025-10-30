import { createListeningPractice, getListeningPractices, getListeningPracticeById, 
         updateListeningPractice, deleteListeningPractice } from "../services/listeningService.js";

export const addListeningPracticeController = async (req, res) => {
  try {
    const formData = req.body; 
    const newPractice = await createListeningPractice(formData);

    res.status(201).json({
      message: "Listening practice added successfully!",
      data: newPractice,
    });
  } catch (err) {
    console.error("Error adding listening practice:", err);
    res.status(500).json({ message: err.message });
  }
};

// all list
export const getListeningPracticesController = async (req, res) => {
  try {
    const practices = await getListeningPractices();
    res.status(200).json({
      message: "Listening practices fetched successfully",
      data: practices,
    });
  } catch (err) {
    console.error("Error fetching listening practices:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get by id
export const getListeningPracticeByIdController = async (req, res) => {
  try {
    const practice = await getListeningPracticeById(req.params.id);
    res.status(200).json({ data: practice });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

// update
export const updateListeningPracticeController = async (req, res) => {
  try {
    const files = {
      image: req.files?.image?.[0] || null,
      audio: req.files?.audio?.[0] || null,
    };

    const updated = await updateListeningPractice(req.params.id, req.body, files);
    res.status(200).json({ message: "Updated successfully", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// delete
export const deleteListeningPracticeController = async (req, res) => {
  try {
    await deleteListeningPractice(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};