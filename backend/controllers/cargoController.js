const Cargo = require("../models/Cargo");

exports.createCargo = async (req, res, next) => {
  const { companyName, cargoPrice } = req.body;
  try {
    const cargo = await Cargo.create({ companyName, cargoPrice });
    res.status(201).json(cargo);
  } catch (error) {
    res.status(500).json({
      message: "Kargo oluşturulurken hata oluştu.",
      error: error.message,
    });
  }
};

exports.getCargos = async (req, res, next) => {
  try {
    const cargos = await Cargo.find();
    res.json(cargos);
  } catch (error) {
    res.status(500).json({
      message: "Kargolar alınırken hata oluştu.",
      error: error.message,
    });
  }
};

exports.getCargoById = async (req, res, next) => {
  try {
    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) return res.status(404).json({ message: "Kargo bulunamadı." });
    res.json(cargo);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Kargo alınırken hata oluştu.", error: error.message });
  }
};

exports.updateCargo = async (req, res, next) => {
  try {
    const cargo = await Cargo.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });
    if (!cargo) return res.status(404).json({ message: "Kargo bulunamadı." });
    res.json(cargo);
  } catch (error) {
    res.status(500).json({
      message: "Kargo güncellenirken hata oluştu.",
      error: error.message,
    });
  }
};

exports.deleteCargo = async (req, res, next) => {
  try {
    const cargo = await Cargo.findByIdAndDelete(req.params.id);
    if (!cargo) return res.status(404).json({ message: "Kargo bulunamadı." });
    res.json({ message: "Kargo başarıyla silindi." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Kargo silinirken hata oluştu.", error: error.message });
  }
};
