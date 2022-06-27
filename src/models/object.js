import mongoose from "mongoose";

const objectSchema = new mongoose.Schema({
    museum: {
        type: String
    },
    museum_id: {
        type: String
    },
    api_object_id: {
        type: String,
        required: true
    },
    image_url: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    object_number: {
        type: String
    },
    object_url: {
        type: String,
        required: true
    },
    medium: {
        type: String
    },
    dimensions: {
        type: String
    },
    artist: {
        type: String
    },
    date: {
        type: String
    },
    date_begin: {
        type: String
    },
    date_end: {
        type: String
    },
    period: {
        type: String
    },
    object_type: {
        type: String
    },
    description: {
        type: String
    },
    origin: {
        type: String
    },
    crawler_filter: {
        type: String
    },
    original_image_url: {
        type: String
    }
}, {
    timestamps: true
});

export const imageObject = mongoose.model('Objects', objectSchema);
// module.exports = imageObject;