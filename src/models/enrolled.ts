import mongoose from 'mongoose';

const enrolledBookSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model assuming 'User' is your student model
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Books', // Reference to the Book model
        required: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    completionStatus: {
        type: String,
        enum: ['in_progress', 'completed', 'not_started'],
        default: 'not_started'
    },
    completionDate: {
        type: Date
    }
});

const EnrolledBook = mongoose.model('EnrolledBook', enrolledBookSchema);

export default EnrolledBook;
