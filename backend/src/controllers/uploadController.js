const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Image file is required");
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSingleImage,
};
