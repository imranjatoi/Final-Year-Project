const PlantCareEntry = require('../models/PlantCareEntry');
const User           = require('../models/User');
const email          = require('../config/email');

exports.getDashboard = async (req, res) => {
  try {
    const raw = await PlantCareEntry.find({ buyer: req.session.user._id, isActive: true }).sort({ createdAt: -1 });
    const today = new Date(); today.setHours(0,0,0,0);
    const entries = raw.map(e => {
      const obj = e.toObject({ virtuals: true });
      // compute next watering date
      const next = new Date(e.lastWateredDate);
      next.setDate(next.getDate() + e.wateringFrequencyDays);
      next.setHours(0,0,0,0);
      const diff = Math.ceil((next - today) / (1000*60*60*24));
      const pct  = Math.min(100, Math.max(0, Math.round(((e.wateringFrequencyDays - diff) / e.wateringFrequencyDays) * 100)));
      obj.nextWateringDate  = next;
      obj.daysUntilWatering = diff;
      obj.progressPct       = pct;
      obj.wateringStatus    = diff < 0 ? 'overdue' : diff === 0 ? 'today' : diff <= 2 ? 'soon' : 'ok';
      return obj;
    });
    res.render('buyer/care', { title: 'Plant Care Tracker – Baghban', entries });
  } catch (err) { console.error(err); res.redirect('/'); }
};

exports.addEntry = async (req, res) => {
  try {
    const { plantName, plantType, wateringFrequencyDays, lastWateredDate, sunlightNeeds, fertilizingDays, notes } = req.body;
    const data = {
      buyer: req.session.user._id, plantName, plantType,
      wateringFrequencyDays: Number(wateringFrequencyDays),
      lastWateredDate: new Date(lastWateredDate),
      sunlightNeeds, fertilizingDays: Number(fertilizingDays) || 30, notes
    };
    if (req.file) data.image = '/images/uploads/' + req.file.filename;
    await PlantCareEntry.create(data);
    req.flash('success', `${plantName} added to your care tracker!`);
    res.redirect('/care');
  } catch (err) { console.error(err); req.flash('error', 'Failed to add plant.'); res.redirect('/care'); }
};

exports.markWatered = async (req, res) => {
  try {
    const entry = await PlantCareEntry.findOne({ _id: req.params.id, buyer: req.session.user._id });
    if (!entry) { req.flash('error', 'Entry not found.'); return res.redirect('/care'); }
    entry.lastWateredDate = new Date();
    await entry.save();
    req.flash('success', `${entry.plantName} marked as watered!`);
    res.redirect('/care');
  } catch (err) { req.flash('error', 'Update failed.'); res.redirect('/care'); }
};

exports.deleteEntry = async (req, res) => {
  try {
    const result = await PlantCareEntry.findOneAndUpdate(
      { _id: req.params.id, buyer: req.session.user._id },
      { isActive: false }
    );
    if (!result) { req.flash('error', 'Plant not found.'); return res.redirect('/care'); }
    req.flash('success', 'Plant removed from tracker.');
    res.redirect('/care');
  } catch (err) { req.flash('error', 'Delete failed.'); res.redirect('/care'); }
};

exports.sendDailyReminders = async () => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const entries = await PlantCareEntry.find({ isActive: true }).populate('buyer','name email');
    const reminderMap = {};
    for (const entry of entries) {
      const next = new Date(entry.lastWateredDate);
      next.setDate(next.getDate() + entry.wateringFrequencyDays);
      next.setHours(0,0,0,0);
      if (next <= today) {
        const uid = entry.buyer._id.toString();
        if (!reminderMap[uid]) reminderMap[uid] = { user: entry.buyer, plants: [] };
        reminderMap[uid].plants.push(entry);
      }
    }
    for (const uid in reminderMap) {
      const { user, plants } = reminderMap[uid];
      try { await email.sendWateringReminder(user.email, user.name, plants); } catch(e) {}
    }
    console.log(`✅ Sent reminders to ${Object.keys(reminderMap).length} users.`);
  } catch (err) { console.error('Reminder job error:', err); }
};
