const { getMasterSchedule, getBranches } = require('./admin.masterSchedule.service');
const { createBroadcast } = require('./admin.broadcast.service');

const getMasterScheduleHandler = async (req, res, next) => {
  try {
    const { start_date: startDate, end_date: endDate, branch_id: branchId } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'start_date và end_date là bắt buộc.' });
    }

    const schedules = await getMasterSchedule({ startDate, endDate, branchId: branchId || null });
    res.json({ schedules });
  } catch (error) {
    next(error);
  }
};

const getBranchesHandler = async (req, res, next) => {
  try {
    const branches = await getBranches();
    res.json({ branches });
  } catch (error) {
    next(error);
  }
};

const createBroadcastHandler = async (req, res, next) => {
  try {
    const senderId = req.user.user_id;
    const { title, content, targetType } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: 'title và content là bắt buộc.' });
    }

    const validTargets = new Set(['all', 'teachers', 'students']);
    const resolvedTarget = validTargets.has(targetType) ? targetType : 'all';

    const announcement = await createBroadcast({ senderId, title, content });

    res.status(201).json({
      announcementId: announcement.announcement_id,
      createdAt: announcement.created_at,
      targetType: resolvedTarget,
      message: 'Thông báo đã được phát sóng thành công.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMasterScheduleHandler,
  getBranchesHandler,
  createBroadcastHandler,
};
