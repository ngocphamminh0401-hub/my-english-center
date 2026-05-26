import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Popover, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import AdminMasterLayout from '../../../layouts/AdminLayout';
import { getBranches, getMasterSchedule } from '../../../services/adminOpsApi';

const PILL_COLORS = [
  'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  'bg-violet-100  text-violet-800  hover:bg-violet-200',
  'bg-amber-100   text-amber-800   hover:bg-amber-200',
  'bg-rose-100    text-rose-800    hover:bg-rose-200',
];

function EventPopupContent({ event }) {
  return (
    <div className="space-y-1 text-sm min-w-[180px]">
      <div>
        <span className="text-slate-500">Giáo viên:</span>{' '}
        <span className="font-medium text-slate-800">{event.teacherName}</span>
      </div>
      <div>
        <span className="text-slate-500">Phòng học:</span>{' '}
        <span className="font-medium text-slate-800">{event.roomName}</span>
      </div>
      <div>
        <span className="text-slate-500">Chi nhánh:</span>{' '}
        <span className="font-medium text-slate-800">{event.branchName}</span>
      </div>
      <div>
        <span className="text-slate-500">Sĩ số:</span>{' '}
        <span className="font-medium text-slate-800">{event.enrolledCount} học viên</span>
      </div>
      <div>
        <span className="text-slate-500">Thời gian:</span>{' '}
        <span className="font-medium text-slate-800">
          {String(event.startTime).substring(0, 5)} – {String(event.endTime).substring(0, 5)}
        </span>
      </div>
    </div>
  );
}

export default function MasterSchedule() {
  const [events, setEvents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchColorMap, setBranchColorMap] = useState({});
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => dayjs());

  useEffect(() => {
    getBranches().then((data) => {
      setBranches(data);
      const map = {};
      data.forEach((b, i) => { map[b.branchId] = i; });
      setBranchColorMap(map);
    });
  }, []);

  const fetchSchedule = useCallback(async (month, branchId) => {
    const startDate = month.startOf('month').format('YYYY-MM-DD');
    const endDate = month.endOf('month').format('YYYY-MM-DD');
    setLoading(true);
    try {
      const data = await getMasterSchedule({ startDate, endDate, branchId });
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(currentMonth, selectedBranch);
  }, [currentMonth, selectedBranch, fetchSchedule]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const key = event.date.substring(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  const handlePanelChange = useCallback((value) => {
    setCurrentMonth(value);
  }, []);

  const handleBranchChange = useCallback((value) => {
    setSelectedBranch(value ?? null);
  }, []);

  const cellRender = useCallback(
    (current, info) => {
      if (info.type !== 'date') return info.originNode;
      const dateStr = current.format('YYYY-MM-DD');
      const dayEvents = eventsByDate[dateStr];
      if (!dayEvents || dayEvents.length === 0) return info.originNode;

      const visible = dayEvents.slice(0, 3);
      const overflow = dayEvents.length - visible.length;

      return (
        <div>
          {info.originNode}
          <ul className="list-none m-0 p-0 space-y-0.5 mt-0.5">
            {visible.map((event) => (
              <li key={event.scheduleId}>
                <Popover
                  title={<span className="font-semibold text-slate-800">{event.className}</span>}
                  content={<EventPopupContent event={event} />}
                  trigger="click"
                  placement="right"
                >
                  <div
                    className={`text-[11px] truncate px-1 py-0.5 rounded cursor-pointer transition-colors ${
                      PILL_COLORS[(branchColorMap[event.branchId] ?? 0) % PILL_COLORS.length]
                    }`}
                  >
                    {String(event.startTime).substring(0, 5)} {event.className}
                  </div>
                </Popover>
              </li>
            ))}
            {overflow > 0 && (
              <li className="text-[11px] text-slate-400 pl-1">+{overflow} lịch khác</li>
            )}
          </ul>
        </div>
      );
    },
    [eventsByDate, branchColorMap]
  );

  const headerRender = useCallback(
    ({ value, onChange }) => {
      const months = Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: i }));
      const years = Array.from({ length: 5 }, (_, i) => {
        const y = dayjs().year() - 2 + i;
        return { label: String(y), value: y };
      });

      return (
        <div className="flex items-center justify-between px-2 pb-3 pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Select size="small" value={value.month()} options={months} onChange={(m) => onChange(value.month(m))} style={{ width: 110 }} />
            <Select size="small" value={value.year()} options={years} onChange={(y) => onChange(value.year(y))} style={{ width: 90 }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Chi nhánh:</span>
            <Select
              allowClear
              size="small"
              placeholder="Tất cả"
              value={selectedBranch}
              onChange={handleBranchChange}
              options={branches.map((b) => ({ label: b.branchName, value: b.branchId }))}
              style={{ width: 180 }}
            />
          </div>
        </div>
      );
    },
    [branches, selectedBranch, handleBranchChange]
  );

  return (
    <AdminMasterLayout>
      <div className="flex flex-col h-full space-y-4">
        <h1 className="text-xl font-semibold text-slate-800">Thời khóa biểu tổng</h1>
        <Spin spinning={loading} tip="Đang tải lịch...">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-h-[600px]">
            <Calendar cellRender={cellRender} headerRender={headerRender} onPanelChange={handlePanelChange} />
          </div>
        </Spin>
      </div>
    </AdminMasterLayout>
  );
}
