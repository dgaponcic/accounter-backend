import mongoose from 'mongoose';

const { Schema } = mongoose;

const HistorySchema = Schema({
    verb: { type: String, required: true },
    event: { type: mongoose.Schema.ObjectId, refPath: 'Event', required: true },
    actor: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.ObjectId, ref: 'User', refPath: 'User' },
    object: {
        type: { type: String, required: true },
        object: { type: mongoose.Schema.ObjectId, refPath: 'object.type' },
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('History', HistorySchema);
