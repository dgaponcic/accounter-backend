import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const { Schema } = mongoose;

const HistorySchema = Schema({
    verb: { type: String, required: true },
    event: { type: mongoose.Schema.ObjectId, refPath: 'Event', required: true },
    actor: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.ObjectId, ref: 'User', refPath: 'User' },
    object: {
        type: { type: String },
        object: { type: mongoose.Schema.ObjectId, refPath: 'object.type' },
        name: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
    participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    adverb: { type: String },
});

HistorySchema.plugin(mongoosePaginate);

export default mongoose.model('History', HistorySchema);
