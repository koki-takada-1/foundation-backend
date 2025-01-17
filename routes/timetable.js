const router = require('express').Router();
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Class = require('../models/Class');

// Create a Timetable
router.post('/', async (req, res) => {
    const { usedClass, weekSubjects } = req.body;

    try {
        const timetableSubjects = await Promise.all(weekSubjects.map(async (daySubjects) => {
            return await Promise.all(daySubjects.map(async (name) => {
                const subject = await Subject.findOne({ subjectName: name });
                if (!subject) {
                    throw new Error(`${name} という科目は存在しません`);
                }
                return subject._id;
            }));
        }));

        const timetable = new Timetable({ usedClass, weekSubjects: timetableSubjects });
        await timetable.save();
        res.status(201).json(timetable);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a Timetable by ID
router.get('/:id', async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id)
            .populate({
                path: 'weekSubjects',
                model: 'Subject'
            })
            .populate({
                path: 'usedClass',
                model: 'Class'
            });
        if (!timetable) {
            return res.status(404).json({ message: '指定されたIDの時間割は存在しません' });
        }
        res.status(200).json(timetable);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all Timetables
router.get('/', async (req, res) => {
    try {
        const timetables = await Timetable.find()
            .populate({
                path: 'weekSubjects',
                model: 'Subject'
            })
            .populate({
                path: 'usedClass',
                model: 'Class'
            });
        res.status(200).json(timetables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;