const Offer = require("../models/Offer");

const populateOfferVendor = {
  path: "vendor",
  select: "restaurantName logoUrl coverImageUrl address approvalStatus user",
  populate: {
    path: "user",
    select: "name avatarUrl",
  },
};

const normalizeOfferPayload = (body = {}) => ({
  title: body.title?.trim() || "",
  discountLabel: body.discountLabel?.trim() || "",
  description: body.description?.trim() || "",
  code: body.code?.trim() || "",
  minimumOrder: body.minimumOrder !== undefined && body.minimumOrder !== "" ? Number(body.minimumOrder) : 0,
  validUntil: body.validUntil ? new Date(body.validUntil) : null,
  imageUrl: body.imageUrl?.trim() || "",
  isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
});

const validateOfferPayload = (payload, res) => {
  if (!payload.title || !payload.discountLabel) {
    res.status(400);
    throw new Error("Offer title and discount label are required");
  }

  if (Number.isNaN(payload.minimumOrder) || payload.minimumOrder < 0) {
    res.status(400);
    throw new Error("Minimum order must be a valid positive amount");
  }

  if (payload.validUntil && Number.isNaN(payload.validUntil.valueOf())) {
    res.status(400);
    throw new Error("Offer expiry date is invalid");
  }
};

const getPublicOffers = async (req, res, next) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
    })
      .populate(populateOfferVendor)
      .sort({ createdAt: -1 })
      .lean();

    const visibleOffers = offers.filter((offer) => offer.vendor?.approvalStatus === "approved");

    res.json(
      visibleOffers.map((offer) => ({
        ...offer,
        vendor: {
          ...offer.vendor,
          user: undefined,
        },
        vendorOwner: offer.vendor?.user || null,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const getVendorOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

const createOffer = async (req, res, next) => {
  try {
    const payload = normalizeOfferPayload(req.body);
    validateOfferPayload(payload, res);

    const offer = await Offer.create({
      vendor: req.vendor._id,
      ...payload,
    });

    res.status(201).json({
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    next(error);
  }
};

const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!offer) {
      res.status(404);
      throw new Error("Offer not found");
    }

    const payload = normalizeOfferPayload({
      ...offer.toObject(),
      ...req.body,
    });
    validateOfferPayload(payload, res);

    offer.title = payload.title;
    offer.discountLabel = payload.discountLabel;
    offer.description = payload.description;
    offer.code = payload.code;
    offer.minimumOrder = payload.minimumOrder;
    offer.validUntil = payload.validUntil;
    offer.imageUrl = payload.imageUrl;
    offer.isActive = payload.isActive;

    await offer.save();

    res.json({
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!offer) {
      res.status(404);
      throw new Error("Offer not found");
    }

    res.json({
      message: "Offer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicOffers,
  getVendorOffers,
  createOffer,
  updateOffer,
  deleteOffer,
};
