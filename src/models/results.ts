const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: true,
        default:0
    },
    timeSpent: {
        type: Number,
      
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const resultsSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Ensure 'User' matches the model name exactly
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Books', // Reference to the Book model
        required: true
    },
    attempts: [attemptSchema],
    final_score:{
        type: Number,
        default:0
    }
});

const Results = mongoose.model('Results', resultsSchema);

export default Results;

