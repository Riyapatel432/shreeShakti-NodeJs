const NBSize = require("../../models/master/NBSize.model");
const PipeSchedule = require("../../models/master/PipeSchedule.model");
const TubeOD = require("../../models/master/TubeOD.model");
const FlangeRating = require("../../models/master/FlangeRating.model");

// NB Sizes
exports.getNBSizes = async (req, res) => {
  try {
    const sizes = await NBSize.find({ isDeleted: false }).sort({ nb_mm: 1 });
    res.status(200).json({ success: true, data: sizes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addNBSize = async (req, res) => {
  try {
    const { nb_mm, nb_inch, od_mm } = req.body;
    const exists = await NBSize.findOne({ nb_mm, isDeleted: false });
    if (exists) return res.status(400).json({ success: false, message: "NB Size already exists" });

    const newSize = await NBSize.create({ nb_mm, nb_inch, od_mm, createdBy: req.admin?._id || req.user?._id });
    res.status(201).json({ success: true, data: newSize });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNBSize = async (req, res) => {
  try {
    const updated = await NBSize.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin?._id || req.user?._id }, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNBSize = async (req, res) => {
  try {
    await NBSize.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pipe Schedules
exports.getPipeSchedules = async (req, res) => {
  try {
    const schedules = await PipeSchedule.find({ isDeleted: false }).populate("nbSize").sort({ "nbSize.nb_mm": 1, schedule: 1 });
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addPipeSchedule = async (req, res) => {
  try {
    const newSchedule = await PipeSchedule.create({ ...req.body, createdBy: req.admin?._id || req.user?._id });
    const populated = await newSchedule.populate("nbSize");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePipeSchedule = async (req, res) => {
  try {
    const updated = await PipeSchedule.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin?._id || req.user?._id }, { new: true }).populate("nbSize");
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePipeSchedule = async (req, res) => {
  try {
    await PipeSchedule.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tube ODs
exports.getTubeODs = async (req, res) => {
  try {
    const tubes = await TubeOD.find({ isDeleted: false }).sort({ od_mm: 1 });
    res.status(200).json({ success: true, data: tubes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addTubeOD = async (req, res) => {
  try {
    const newTube = await TubeOD.create({ ...req.body, createdBy: req.admin?._id || req.user?._id });
    res.status(201).json({ success: true, data: newTube });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTubeOD = async (req, res) => {
  try {
    const updated = await TubeOD.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin?._id || req.user?._id }, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTubeOD = async (req, res) => {
  try {
    await TubeOD.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Flange Ratings
exports.getFlangeRatings = async (req, res) => {
  try {
    const flanges = await FlangeRating.find({ isDeleted: false }).populate("nbSize").sort({ "nbSize.nb_mm": 1, ratingClass: 1 });
    res.status(200).json({ success: true, data: flanges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addFlangeRating = async (req, res) => {
  try {
    const newFlange = await FlangeRating.create({ ...req.body, createdBy: req.admin?._id || req.user?._id });
    const populated = await newFlange.populate("nbSize");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFlangeRating = async (req, res) => {
  try {
    const updated = await FlangeRating.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin?._id || req.user?._id }, { new: true }).populate("nbSize");
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFlangeRating = async (req, res) => {
  try {
    await FlangeRating.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dependency API
exports.getDependencies = async (req, res) => {
  try {
    const { nbId } = req.query;
    if (!nbId) return res.status(400).json({ success: false, message: "nbId is required" });

    const schedules = await PipeSchedule.find({ nbSize: nbId, isDeleted: false, status: true }).sort({ schedule: 1 });
    const flanges = await FlangeRating.find({ nbSize: nbId, isDeleted: false, status: true }).sort({ ratingClass: 1 });

    res.status(200).json({ success: true, data: { schedules, flanges } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
